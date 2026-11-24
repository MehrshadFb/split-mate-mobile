// Turns Gemini's transcription of a receipt into the flat [{ name, price }] list the app splits.
// Gemini only copies what is printed; all arithmetic happens here so it can be checked
// against the receipt's printed total.

const TOLERANCE = 0.02;

const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const amountOf = (line) => toNumber(line?.amount);
const sumOf = (values) => round2(values.reduce((total, value) => total + value, 0));
const cleanName = (name, fallback) => String(name ?? '').replace(/\s+/g, ' ').trim() || fallback;

// Drops combined-total lines: a line equal to the sum of two or more of the other lines
function withoutCombinedLines(amounts) {
  let lines = [...amounts];
  for (;;) {
    const i = lines.findIndex((amount, k) => {
      const others = lines.filter((_, j) => j !== k);
      return others.length >= 2 && Math.abs(amount - sumOf(others)) <= TOLERANCE;
    });
    if (i === -1) return lines;
    lines = lines.filter((_, j) => j !== i);
  }
}

const distinctOf = (amounts) => [...new Set(amounts)];

// Ways to read the tax lines. Receipts can add a combined total line or print a tax twice,
// so the printed total picks between these. The first one is used when there's no total.
function taxOptions(taxes) {
  const amounts = taxes.map(amountOf).filter((amount) => amount > 0);
  const options = [
    withoutCombinedLines(amounts),
    amounts,
    distinctOf(amounts),
    withoutCombinedLines(distinctOf(amounts)),
    distinctOf(withoutCombinedLines(amounts)),
  ].map(sumOf);
  return [...new Set(options)];
}

// Takes a (negative) discount off lines in proportion to their price, never below $0.
// Returns the part of the discount that didn't fit.
function spreadDiscount(lines, discount) {
  const total = sumOf(lines.map((line) => line.price));
  if (discount >= 0 || total <= 0) return { lines, leftover: discount };
  const target = Math.max(round2(total + discount), 0);
  const spread = lines.map((line) => ({ ...line, price: round2((line.price * target) / total) }));
  // Put any rounding pennies on the most expensive line so the total stays exact
  const drift = round2(target - sumOf(spread.map((line) => line.price)));
  if (drift !== 0) {
    const largest = spread.reduce((a, b) => (b.price > a.price ? b : a));
    largest.price = round2(largest.price + drift);
  }
  return { lines: spread, leftover: round2(total + discount - target) };
}

function toAppItems(receipt) {
  if (!receipt || receipt.isReceipt === false || !Array.isArray(receipt.items)) {
    return { items: [], printedTotal: null };
  }
  const hasTotal = receipt.total !== null && receipt.total !== undefined && receipt.total !== '';
  const printedTotal = hasTotal ? Number(receipt.total) : NaN;

  // Discounts that can't come off a single item are spread over the whole bill
  let billDiscount = sumOf((receipt.billDiscounts || []).map((line) => -Math.abs(amountOf(line))));

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

  let fees = [];
  for (const fee of receipt.fees || []) {
    const price = round2(amountOf(fee));
    if (price > 0) fees.push({ name: cleanName(fee.label, 'Fee'), price });
    else if (price < 0) billDiscount = round2(billDiscount + price);
  }

  // Spread bill-wide discounts across items by price; anything left once items are free comes off fees
  const afterItems = spreadDiscount(items, billDiscount);
  const afterFees = spreadDiscount(fees, afterItems.leftover);
  items = afterItems.lines;
  fees = afterFees.lines;

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
