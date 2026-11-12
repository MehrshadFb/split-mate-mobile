const { GoogleGenerativeAI, SchemaType: T } = require('@google/generative-ai');
const config = require('../config');
const { validateExtractedItems, ValidationError } = require('../utils/validators');
const { toAppItems } = require('../utils/receipt');

const amountLine = {
  type: T.OBJECT,
  properties: { label: { type: T.STRING }, amount: { type: T.NUMBER } },
  required: ['label', 'amount'],
};

// Gemini fills this in with what is printed on the receipt; utils/receipt.js does the maths
const RECEIPT_SCHEMA = {
  type: T.OBJECT,
  properties: {
    isReceipt: { type: T.BOOLEAN },
    items: {
      type: T.ARRAY,
      items: {
        type: T.OBJECT,
        properties: {
          name: { type: T.STRING },
          price: { type: T.NUMBER, description: 'Line amount as printed for this item, quantity already included.' },
          adjustments: {
            type: T.ARRAY,
            items: amountLine,
            description: 'Discounts (negative) and deposits or fees (positive) that belong to this item.',
          },
        },
        required: ['name', 'price', 'adjustments'],
      },
    },
    billDiscounts: { type: T.ARRAY, items: amountLine, description: 'Discounts on the whole bill, not tied to one item. Negative amounts.' },
    fees: { type: T.ARRAY, items: amountLine, description: 'Service charges or fees on the whole bill. Positive amounts.' },
    taxes: { type: T.ARRAY, items: amountLine, description: 'Each tax amount printed on the receipt.' },
    pricesIncludeTax: { type: T.BOOLEAN, description: 'True if the item prices already include the tax.' },
    total: { type: T.NUMBER, description: 'Final amount paid, before any tip.' },
  },
  required: ['isReceipt', 'items', 'billDiscounts', 'fees', 'taxes', 'pricesIncludeTax', 'total'],
};

// Gemini refused the request itself (bad request, auth, model not found). 429 rate limits
// and 5xx errors can succeed on a later attempt, so they're still retried.
function isRequestRejected(error) {
  return error.status >= 400 && error.status < 500 && error.status !== 429;
}

class GeminiService {
  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.gemini.model,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RECEIPT_SCHEMA,
        // Default thinking time varies wildly on some receipts (15-70s for the same photo)
        thinkingConfig: { thinkingLevel: config.gemini.thinkingLevel },
      },
    });
  }

  _buildPrompt() {
    return `
Transcribe this receipt into the JSON schema. Copy amounts exactly as printed and do not calculate anything.

If the image is not a receipt or invoice for purchased items (e.g. a wall, a person, a random object), set isReceipt to false and leave the lists empty.

Rules:
- items: every purchased product or service, with the amount printed on its line. Use the item name exactly as printed.
- A discount line directly below an item, or one that references the item's code, goes in that item's adjustments as a NEGATIVE amount. This includes coupons, "TPD/<item code>" lines, "<coupon number> / <item code or MULTIPLE>" lines, instant savings, member savings, multibuy savings and "Rabatt"/"Rabat" lines. A trailing minus ("5.00-") and a leading minus ("-5.00") both mean negative.
- A bottle deposit, "Pfand", eco fee or environmental fee printed below an item goes in that item's adjustments as a POSITIVE amount.
- billDiscounts: discounts on the whole bill that are not tied to one item, such as "15% off", "happy hour" or "employee discount".
- fees: service charges or delivery fees on the whole bill.
- Do NOT include summary lines such as "Instant savings", "You saved" or "Total savings", or subtotals, totals, payments, change, tips, loyalty points, store details or dates.
- taxes: each tax amount printed (GST, PST, HST, TAX, VAT, MwSt, PTU, IVA...).
- pricesIncludeTax: true when the receipt shows the tax as already included in the prices (VAT "incl.", "enthalten", a Netto/Steuer/Brutto table, or the item prices already add up to the total). Otherwise false.
- total: the final amount charged, before any tip.
- If you can't clearly read an item or its price, skip it.
    `.trim();
  }

  _parseResponse(text) {
    try {
      const receipt = JSON.parse(text);
      if (!receipt || typeof receipt !== 'object' || !Array.isArray(receipt.items)) {
        throw new Error('Response does not match the receipt schema');
      }
      return receipt;
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    }
  }

  async _callGeminiWithTimeout(imagePart, timeoutMs) {
    const prompt = this._buildPrompt();
    // Abort the HTTP request on timeout so a hung call doesn't keep running
    // and holding the image in memory after we've given up on it
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await this.model.generateContent([prompt, imagePart], {
        signal: controller.signal,
      });
      return result.response.text();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error(`Gemini API timeout after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async analyzeReceipt(fileBuffer, mimeType, timeoutMs = config.gemini.timeoutMs) {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new ValidationError('Invalid file buffer', 'INVALID_FILE');
    }
    const base64Data = fileBuffer.toString('base64');
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
    const responseText = await this._callGeminiWithTimeout(imagePart, timeoutMs);
    const receipt = this._parseResponse(responseText);
    const { items, check } = toAppItems(receipt);
    if (check && !check.matches) {
      // Logged so receipts that trip up the scan can be found later
      console.warn(
        `Receipt total mismatch: items add up to ${check.splitTotal}, receipt says ${check.printedTotal} (tax added: ${check.addedTax})`
      );
    }
    return validateExtractedItems(items);
  }

  async analyzeReceiptWithRetry(fileBuffer, mimeType) {
    const { maxRetries, timeoutMs, totalBudgetMs, minAttemptMs } = config.gemini;
    const deadline = Date.now() + totalBudgetMs;
    const sizeKb = Math.round(fileBuffer.length / 1024);
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < minAttemptMs) {
        console.error(`Gemini time budget exhausted after ${attempt} attempt(s)`);
        break;
      }
      const attemptTimeout = Math.min(timeoutMs, remaining);
      const startedAt = Date.now();
      try {
        const items = await this.analyzeReceipt(fileBuffer, mimeType, attemptTimeout);
        console.log(
          `Gemini analysis attempt ${attempt + 1}/${maxRetries} succeeded in ${Date.now() - startedAt}ms (${sizeKb}KB image)`
        );
        return items;
      } catch (error) {
        lastError = error;
        console.error(
          `Gemini analysis attempt ${attempt + 1}/${maxRetries} failed after ${Date.now() - startedAt}ms (${sizeKb}KB image):`,
          error.name !== 'Error' ? `${error.name}: ${error.message}` : error.message
        );
        if (error instanceof ValidationError) { // Don't retry on validation errors
          throw error;
        }
        if (isRequestRejected(error)) { // e.g. 400 Bad Request: retrying the same request can't succeed
          break;
        }
        if (attempt < maxRetries - 1) {
          // Exponential backoff with jitter, skipped if it would eat the last usable attempt
          const baseDelay = config.gemini.retryDelayMs * Math.pow(config.gemini.retryFactor, attempt);
          const delay = baseDelay + Math.random() * 0.3 * baseDelay;
          if (deadline - Date.now() - delay < minAttemptMs) {
            console.error('Not enough time budget left for another attempt');
            break;
          }
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw this._categorizeError(lastError || new Error('Gemini API timeout')); // All attempts failed
  }

  _categorizeError(error) {
    if (error instanceof ValidationError) {
      return error;
    }

    let code = 'GEMINI_API_ERROR';
    let message = error.message;

    if (error.message.includes('timeout')) {
      code = 'GEMINI_TIMEOUT';
      message = 'Gemini API request timed out';
    } else if (error.message.includes('parse') || error.message.includes('JSON')) {
      code = 'PARSE_FAILED';
      message = 'Failed to parse receipt data';
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      code = 'RATE_LIMIT_EXCEEDED';
      message = 'API rate limit exceeded';
    }

    const categorizedError = new Error(message);
    categorizedError.code = code;
    return categorizedError;
  }

  async checkHealth() {
    try {
      const testPrompt = 'Respond with: OK';
      const geminiPromise = this.model.generateContent([testPrompt]);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );
      await Promise.race([geminiPromise, timeoutPromise]);
      return { healthy: true, model: config.gemini.model };
    } catch (error) {
      return { 
        healthy: false, 
        model: config.gemini.model,
        error: error.message 
      };
    }
  }
}

// Singleton instance
let geminiServiceInstance;
function getGeminiService() {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
}

module.exports = {
  GeminiService,
  getGeminiService,
};
