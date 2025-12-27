const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const { validateExtractedItems, ValidationError } = require('../utils/validators');

class GeminiService {
  constructor() {
    if (!config.gemini.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  _buildPrompt() {
    return `
Analyze this image. First, determine if this is a receipt or invoice for purchased items.

If this is NOT a receipt/invoice (e.g., it's a wall, person, random object, etc.), return an empty array: []

If this IS a receipt/invoice, extract all items with their prices, including tax as a separate item.

Return ONLY a JSON array in this exact format:
[
  {"name": "item name", "price": 12.99},
  {"name": "another item", "price": 5.50},
  {"name": "Tax", "price": 2.34}
]

Rules:
- Include all purchased items (food, products, services)
- Include tax as a separate item with name "Tax" if tax is shown on the receipt
- Include any service charges or fees as separate items
- Exclude tips, subtotals, grand totals, payment methods, store info, dates, etc.
- Exclude TPD (Total Potential Discount) as it represents discounts, not charges
- Extract exact item names as they appear on the receipt
- Prices should be numbers (not strings)
- If you can't clearly read an item or price, skip it
- Return only the JSON array, no other text or explanation
- If this is not a receipt, return []
    `.trim();
  }

  _parseResponse(text) {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response');
      }
      const items = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(items)) {
        throw new Error('Response is not an array');
      }
      return items;
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    }
  }

  async _callGeminiWithTimeout(imagePart) {
    const prompt = this._buildPrompt();
    const geminiPromise = this.model.generateContent([prompt, imagePart]);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), config.gemini.timeoutMs)
    );
    const result = await Promise.race([geminiPromise, timeoutPromise]); // Race Gemini API call against timeout
    const response = await result.response;
    return response.text();
  }

  async analyzeReceipt(fileBuffer, mimeType) {
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
    const responseText = await this._callGeminiWithTimeout(imagePart);
    const items = this._parseResponse(responseText);
    const validatedItems = validateExtractedItems(items);
    return validatedItems;
  }

  async analyzeReceiptWithRetry(fileBuffer, mimeType) {
    let lastError;
    for (let attempt = 0; attempt < config.gemini.maxRetries; attempt++) {
      try {
        return await this.analyzeReceipt(fileBuffer, mimeType);
      } catch (error) {
        lastError = error;
        console.error(
          `Gemini analysis attempt ${attempt + 1}/${config.gemini.maxRetries} failed:`,
          error.message
        );
        if (error instanceof ValidationError) { // Don't retry on validation errors
          throw error;
        }
        if (attempt < config.gemini.maxRetries - 1) {
          // Exponential backoff with jitter before next attempt
          const baseDelay = config.gemini.retryDelayMs * Math.pow(config.gemini.retryFactor, attempt);
          const jitter = Math.random() * 0.3 * baseDelay;
          const delay = baseDelay + jitter;
          console.log(`Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw this._categorizeError(lastError); // All attempts failed
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
