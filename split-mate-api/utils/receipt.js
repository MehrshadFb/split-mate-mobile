// Turns Gemini's transcription of a receipt into the flat [{ name, price }] list the app splits.
// Gemini only copies what is printed; all arithmetic happens here so it can be checked
// against the receipt's printed total.

const TOLERANCE = 0.02;

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const amountOf = (line) => toNumber(line?.amount);
const sumOf = (values) => round2(values.reduce((total, value) => total + value, 0));
const cleanName = (name, fallback) => String(name ?? '').replace(/\s+/g, ' ').trim() || fallback;

// Tax amounts to try. A line equal to the sum of the others is a combined total
// (or the same tax printed twice), so the total without it is tried first.
function taxOptions(taxes) {
  const amounts = taxes.map(amountOf).filter((amount) => amount > 0);
  const all = sumOf(amounts);
  if (amounts.length < 2) return [all];
  const duplicate = amounts.find((amount, i) =>
    Math.abs(amount - sumOf(amounts.filter((_, j) => j !== i))) <= TOLERANCE
  );
  return duplicate === undefined ? [all] : [round2(all - duplicate), all];
}

function toAppItems(receipt) {
  if (!receipt || receipt.isReceipt === false || !Array.isArray(receipt.items)) {
    return { items: [], printedTotal: null };
  }
  const printedTotal = Number(receipt.total) > 0 ? Number(receipt.total) : NaN; // 0 or missing means no total

  // Discounts that can't come off a single item are spread over the whole bill
  let billDiscount = sumOf((receipt.billDiscounts || []).map(amountOf));

  // Fold each item's own discounts and deposits into its price
  let items = [];
  for (const item of receipt.items) {
    const printed = toNumber(item.price);
    const price = round2(printed + sumOf((item.adjustments || []).map(amountOf)));
    if (price >= 0) {
      items.push({ name: cleanName(item.name, 'Unknown Item'), price });
      continue;
    }
    const previous = items[items.length - 1];
    if (printed < 0 && previous) {
      // A discount listed as its own line belongs to the item above it
      const applied = Math.max(price, -previous.price);
      previous.price = round2(previous.price + applied);
      billDiscount = round2(billDiscount + price - applied);
    } else {
      // A discount bigger than its item makes the item free; the rest comes off the bill
      if (printed >= 0) items.push({ name: cleanName(item.name, 'Unknown Item'), price: 0 });
      billDiscount = round2(billDiscount + price);
    }
  }

  const fees = [];
  for (const fee of receipt.fees || []) {
    const price = round2(amountOf(fee));
    if (price > 0) fees.push({ name: cleanName(fee.label, 'Fee'), price });
    else if (price < 0) billDiscount = round2(billDiscount + price);
  }

  // Spread bill-wide discounts across items in proportion to their price
  const itemsTotal = sumOf(items.map((item) => item.price));
  if (billDiscount !== 0 && itemsTotal > 0) {
    const target = Math.max(round2(itemsTotal + billDiscount), 0);
    items = items.map((item) => ({ ...item, price: round2((item.price * target) / itemsTotal) }));
    // Put any rounding pennies on the most expensive item so the total stays exact
    const drift = round2(target - sumOf(items.map((item) => item.price)));
    if (drift !== 0) {
      const largest = items.reduce((a, b) => (b.price > a.price ? b : a));
      largest.price = round2(largest.price + drift);
    }
  }

  // Add whichever tax amount (or none, if prices already include tax) lands closest to
  // the printed total. Gemini's pricesIncludeTax only breaks a tie or a missing total.
  const beforeTax = sumOf([...items, ...fees].map((item) => item.price));
  const options = taxOptions(receipt.taxes || []);
  let tax;
  if (Number.isFinite(printedTotal)) {
    const distance = (amount) => round2(Math.abs(beforeTax + amount - printedTotal));
    tax = options.reduce((best, amount) => (distance(amount) < distance(best) ? amount : best));
    if (distance(0) < distance(tax) || (distance(0) === distance(tax) && receipt.pricesIncludeTax === true)) {
      tax = 0;
    }
  } else {
    tax = receipt.pricesIncludeTax === true ? 0 : options[0];
  }

  const result = [...items, ...fees];
  if (tax > 0) result.push({ name: 'Tax', price: tax });
  return { items: result, printedTotal };
}

// Returns the totals when the list the app receives doesn't add up to the printed total
function totalMismatch(items, printedTotal) {
  if (!Number.isFinite(printedTotal)) return null;
  const splitTotal = sumOf(items.map((item) => item.price));
  return Math.abs(splitTotal - printedTotal) <= TOLERANCE ? null : { splitTotal, printedTotal };
}

module.exports = { toAppItems, totalMismatch };
