const { toAppItems } = require('./receipt');

const receipt = (overrides) => ({
  isReceipt: true,
  items: [],
  billDiscounts: [],
  fees: [],
  taxes: [],
  pricesIncludeTax: false,
  total: 0,
  ...overrides,
});
const line = (label, amount) => ({ label, amount });

describe('toAppItems', () => {
  test('subtracts an item discount from that item (Costco instant savings)', () => {
    const { items, check } = toAppItems(receipt({
      items: [
        { name: 'PUREX COLD', price: 22.99, adjustments: [line('0000394338 / MULTIPLE', -5)] },
        { name: 'KS DISH', price: 10.99, adjustments: [] },
      ],
      taxes: [line('TAX', 3.77)],
      total: 32.75,
    }));
    expect(items).toEqual([
      { name: 'PUREX COLD', price: 17.99 },
      { name: 'KS DISH', price: 10.99 },
      { name: 'Tax', price: 3.77 },
    ]);
    expect(check.matches).toBe(true);
  });

  test('adds a deposit to the item it belongs to', () => {
    const { items } = toAppItems(receipt({
      items: [{ name: 'COLA 12PK', price: 7.49, adjustments: [line('DEPOSIT', 1.2)] }],
      total: 8.69,
      pricesIncludeTax: true,
    }));
    expect(items).toEqual([{ name: 'COLA 12PK', price: 8.69 }]);
  });

  test('spreads a whole-bill discount across items and keeps the total exact', () => {
    const { items, check } = toAppItems(receipt({
      items: [
        { name: 'PIZZA', price: 36, adjustments: [] },
        { name: 'SALAD', price: 14, adjustments: [] },
        { name: 'LEMONADE', price: 4.5, adjustments: [] },
        { name: 'BEER', price: 9, adjustments: [] },
      ],
      billDiscounts: [line('HAPPY HOUR 15% OFF', -9.53)],
      taxes: [line('GST 5%', 2.7), line('PST 7%', 3.78)],
      total: 60.45,
    }));
    const products = items.filter((i) => i.name !== 'Tax');
    expect(products.map((i) => i.price)).toEqual([30.6, 11.9, 3.82, 7.65]);
    expect(items.find((i) => i.name === 'Tax').price).toBe(6.48);
    expect(check).toMatchObject({ splitTotal: 60.45, matches: true });
  });

  test('does not add tax when prices already include it', () => {
    const { items, check } = toAppItems(receipt({
      items: [
        { name: 'DUKE REID ROCKS CD', price: 9.99, adjustments: [] },
        { name: 'MONKEY BUSINESS CD', price: 9.99, adjustments: [] },
      ],
      taxes: [line('V.A.T.', 3.75)],
      pricesIncludeTax: false, // the printed total wins over Gemini's reading
      total: 19.98,
    }));
    expect(items.map((i) => i.name)).not.toContain('Tax');
    expect(check).toMatchObject({ matches: true, addedTax: false });
  });

  test("falls back to Gemini's reading when neither version matches the total", () => {
    const base = {
      items: [{ name: 'A', price: 10, adjustments: [] }],
      taxes: [line('TAX', 1.3)],
      total: 99,
    };
    expect(toAppItems(receipt({ ...base, pricesIncludeTax: false })).items).toContainEqual({ name: 'Tax', price: 1.3 });
    const included = toAppItems(receipt({ ...base, pricesIncludeTax: true }));
    expect(included.items).toEqual([{ name: 'A', price: 10 }]);
    expect(included.check.matches).toBe(false);
  });

  test('keeps service charges and fees as their own lines', () => {
    const { items } = toAppItems(receipt({
      items: [{ name: 'BURGER', price: 20, adjustments: [] }],
      fees: [line('Service charge 10%', 2), line('Empty fee', 0)],
      taxes: [line('HST', 2.86)],
      total: 24.86,
    }));
    expect(items).toEqual([
      { name: 'BURGER', price: 20 },
      { name: 'Service charge 10%', price: 2 },
      { name: 'Tax', price: 2.86 },
    ]);
  });

  test('puts multi-line item names on one line', () => {
    const { items } = toAppItems(receipt({
      items: [{ name: '1 EVM LCoke(LFries)\n  Large Coke ', price: 8, adjustments: [] }],
      pricesIncludeTax: true,
      total: 8,
    }));
    expect(items[0].name).toBe('1 EVM LCoke(LFries) Large Coke');
  });

  test('returns no items for something that is not a receipt', () => {
    expect(toAppItems(receipt({ isReceipt: false })).items).toEqual([]);
    expect(toAppItems(null).items).toEqual([]);
  });
});
