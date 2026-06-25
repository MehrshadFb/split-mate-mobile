export function distributeAmounts(price: number, weights: number[]): number[] {
  if (weights.length === 0) return [];
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return weights.map(() => 0);

  const totalCents = Math.round(price * 100);
  const exactCents = weights.map((w) => (w / totalWeight) * totalCents);
  const floorCents = exactCents.map((c) => Math.floor(c));
  const allocated = floorCents.reduce((sum, c) => sum + c, 0);
  let remainder = totalCents - allocated;

  const orderedByFraction = exactCents
    .map((c, i) => ({ index: i, fraction: c - floorCents[i] }))
    .sort((a, b) => b.fraction - a.fraction);

  const cents = [...floorCents];
  let cursor = 0;
  while (remainder > 0 && cursor < orderedByFraction.length) {
    cents[orderedByFraction[cursor].index] += 1;
    remainder -= 1;
    cursor += 1;
  }

  return cents.map((c) => c / 100);
}

export function computeSplitAmounts(
  price: number,
  splitBetween: string[],
  shares?: Record<string, number>
): number[] {
  const weights = splitBetween.map((person) => {
    const w = shares?.[person];
    return typeof w === "number" && w > 0 ? w : 1;
  });
  return distributeAmounts(price, weights);
}

export function isCustomSplit(
  splitBetween: string[],
  shares?: Record<string, number>
): boolean {
  if (!shares || splitBetween.length < 2) return false;
  const weights = splitBetween.map((p) => shares[p] ?? 1);
  return weights.some((w) => w !== weights[0]);
}

export function dollarsToShares(
  amounts: Record<string, number>,
  splitBetween: string[]
): Record<string, number> | undefined {
  if (splitBetween.length < 2) return undefined;
  const values = splitBetween.map((p) => amounts[p] ?? 0);
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total <= 0) return undefined;

  const expected = total / values.length;
  const allEqual = values.every((v) => Math.abs(v - expected) < 0.005);
  if (allEqual) return undefined;

  const result: Record<string, number> = {};
  splitBetween.forEach((person, i) => {
    result[person] = values[i];
  });
  return result;
}

export function pruneShares(
  shares: Record<string, number> | undefined,
  splitBetween: string[]
): Record<string, number> | undefined {
  if (!shares || splitBetween.length < 2) return undefined;
  const pruned: Record<string, number> = {};
  splitBetween.forEach((p) => {
    if (typeof shares[p] === "number" && shares[p] > 0) {
      pruned[p] = shares[p];
    }
  });
  const weights = splitBetween.map((p) => pruned[p] ?? 1);
  const allEqual = weights.every((w) => w === weights[0]);
  if (allEqual) return undefined;
  return pruned;
}

export function rebalanceAfterChange(
  current: Record<string, number>,
  person: string,
  nextValue: number,
  price: number,
  splitBetween: string[],
  lockedPeople?: ReadonlySet<string>
): Record<string, number> {
  if (splitBetween.length === 0) return {};
  const locked = lockedPeople ?? new Set<string>();
  const lockedOthers = splitBetween.filter(
    (p) => p !== person && locked.has(p)
  );
  const unlockedOthers = splitBetween.filter(
    (p) => p !== person && !locked.has(p)
  );
  const lockedSum = lockedOthers.reduce(
    (sum, p) => sum + (current[p] ?? 0),
    0
  );
  const maxForPerson = Math.max(0, price - lockedSum);
  const raw = isFinite(nextValue) ? nextValue : 0;
  const clamped = Math.max(0, Math.min(maxForPerson, raw));

  const result: Record<string, number> = { [person]: clamped };
  lockedOthers.forEach((p) => {
    result[p] = current[p] ?? 0;
  });

  if (unlockedOthers.length === 0) {
    // No one to absorb a delta — person's value is forced to whatever
    // budget the locks leave behind, so the sum still equals price.
    result[person] = Math.max(0, price - lockedSum);
    return result;
  }

  const remaining = Math.max(0, price - clamped - lockedSum);
  const previousUnlockedTotal = unlockedOthers.reduce(
    (sum, p) => sum + (current[p] ?? 0),
    0
  );

  if (previousUnlockedTotal > 0) {
    const scale = remaining / previousUnlockedTotal;
    unlockedOthers.forEach((p) => {
      result[p] = (current[p] ?? 0) * scale;
    });
  } else {
    const each = remaining / unlockedOthers.length;
    unlockedOthers.forEach((p) => {
      result[p] = each;
    });
  }
  return result;
}

export function initialAmountsForModal(
  price: number,
  splitBetween: string[],
  shares?: Record<string, number>
): Record<string, number> {
  const result: Record<string, number> = {};
  if (splitBetween.length === 0) return result;
  const weights = splitBetween.map((p) => {
    const w = shares?.[p];
    return typeof w === "number" && w > 0 ? w : 1;
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) {
    splitBetween.forEach((p) => (result[p] = 0));
    return result;
  }
  splitBetween.forEach((p, i) => {
    result[p] = (weights[i] / totalWeight) * price;
  });
  return result;
}
