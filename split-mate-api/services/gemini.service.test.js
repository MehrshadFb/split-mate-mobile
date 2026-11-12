process.env.GEMINI_API_KEY = 'test-key';
process.env.RETRY_DELAY_MS = '1';

const { GeminiService } = require('./gemini.service');

const fetchError = (status) => Object.assign(new Error(`[${status}] Gemini error`), { status });

describe('analyzeReceiptWithRetry', () => {
  let service;
  beforeEach(() => {
    service = new GeminiService();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  test('does not retry a request Gemini rejected (400)', async () => {
    service.analyzeReceipt = jest.fn().mockRejectedValue(fetchError(400));
    await expect(service.analyzeReceiptWithRetry(Buffer.from('img'), 'image/jpeg'))
      .rejects.toMatchObject({ code: 'GEMINI_API_ERROR' });
    expect(service.analyzeReceipt).toHaveBeenCalledTimes(1);
  });

  test.each([429, 500, 503])('retries a %i error', async (status) => {
    service.analyzeReceipt = jest.fn()
      .mockRejectedValueOnce(fetchError(status))
      .mockResolvedValue([{ name: 'Milk', price: 2.49 }]);
    await expect(service.analyzeReceiptWithRetry(Buffer.from('img'), 'image/jpeg'))
      .resolves.toEqual([{ name: 'Milk', price: 2.49 }]);
    expect(service.analyzeReceipt).toHaveBeenCalledTimes(2);
  });

  test('retries a timeout', async () => {
    service.analyzeReceipt = jest.fn()
      .mockRejectedValueOnce(new Error('Gemini API timeout after 30000ms'))
      .mockResolvedValue([{ name: 'Milk', price: 2.49 }]);
    await expect(service.analyzeReceiptWithRetry(Buffer.from('img'), 'image/jpeg'))
      .resolves.toEqual([{ name: 'Milk', price: 2.49 }]);
    expect(service.analyzeReceipt).toHaveBeenCalledTimes(2);
  });
});
