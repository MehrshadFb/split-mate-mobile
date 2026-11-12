// Turns Gemini's transcription of a receipt into the flat [{ name, price }] list the app splits.
// Gemini only copies what is printed; all arithmetic happens here so it can be checked
// against the receipt's printed total.

const TOLERANCE = 0.02;

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const amountOf = (line) => (Number.isFinite(Number(line?.amount)) ? Number(line.amount) : 0);
const sumOf = (values) => round2(values.reduce((total, value) => total + value, 0));
const near = (a, b) => Math.abs(a - b) <= TOLERANCE;

function toAppItems(receipt) {
  if (!receipt || receipt.isReceipt === false || !Array.isArray(receipt.items)) {
    return { items: [], check: null };
  }
  const billDiscounts = receipt.billDiscounts || [];
  const fees = receipt.fees || [];
  const taxes = receipt.taxes || [];
  const printedTotal = Number(receipt.total);

  // Fold each item's own discounts and deposits into its price
  let items = receipt.items.map((item) => ({
    name: String(item.name ?? '').replace(/\s+/g, ' ').trim(),
    price: round2(Number(item.price) + sumOf((item.adjustments || []).map(amountOf))),
  }));

  // Spread whole-bill discounts across items in proportion to their price
  const billDiscount = sumOf(billDiscounts.map(amountOf));
  const itemsTotal = sumOf(items.map((item) => item.price));
  if (billDiscount !== 0 && itemsTotal > 0) {
    items = items.map((item) => ({
      ...item,
      price: round2(item.price + (billDiscount * item.price) / itemsTotal),
    }));
    // Put any rounding pennies on the most expensive item so the total stays exact
    const drift = round2(itemsTotal + billDiscount - sumOf(items.map((item) => item.price)));
    if (drift !== 0) {
      const largest = items.reduce((a, b) => (b.price > a.price ? b : a));
      largest.price = round2(largest.price + drift);
    }
  }

  const feeItems = fees
    .map((fee) => ({ name: String(fee.label ?? 'Fee').trim(), price: round2(amountOf(fee)) }))
    .filter((fee) => fee.price !== 0);
  const tax = sumOf(taxes.map(amountOf));
  const beforeTax = sumOf([...items, ...feeItems].map((item) => item.price));

  // Add tax only if the prices don't already include it. The printed total decides;
  // Gemini's own reading is the tie-breaker when neither version matches.
  let addTax;
  if (Number.isFinite(printedTotal) && near(beforeTax, printedTotal)) addTax = false;
  else if (Number.isFinite(printedTotal) && near(beforeTax + tax, printedTotal)) addTax = true;
  else addTax = receipt.pricesIncludeTax !== true;

  const result = [...items, ...feeItems];
  if (addTax && tax > 0) result.push({ name: 'Tax', price: tax });

  const splitTotal = sumOf(result.map((item) => item.price));
  return {
    items: result,
    check: {
      splitTotal,
      printedTotal,
      matches: Number.isFinite(printedTotal) && near(splitTotal, printedTotal),
      addedTax: addTax && tax > 0,
    },
  };
}

module.exports = { toAppItems };
