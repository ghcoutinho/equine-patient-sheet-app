import type { FlowsheetColumn } from '../types';

/**
 * Carry a value forward from the most recent column that actually charted
 * it, when the column being rendered didn't.
 *
 * A blank flowsheet cell reads as "nothing is known" when really it just
 * means nobody re-typed a value that hasn't changed — HR charted at 08:00
 * shouldn't look unknown at the 10:00 column just because nobody re-entered
 * it. The flip side matters just as much: a carried value is never
 * indistinguishable from one actually charted this round, because "last
 * known 2 hours ago" and "just observed" are different clinical facts. The
 * caller is expected to show `carried` and the source column's time
 * whenever it's true.
 */
export interface CarriedValue<T> {
  value: T;
  /** The column this value actually came from — may not be the one asked for. */
  sourceColumn: FlowsheetColumn;
  /** False when the requested column charted the value itself. */
  carried: boolean;
}

export function carryForward<T>(
  columns: FlowsheetColumn[],
  index: number,
  pick: (col: FlowsheetColumn) => T | undefined,
): CarriedValue<T> | undefined {
  const own = pick(columns[index]);
  if (own !== undefined) return { value: own, sourceColumn: columns[index], carried: false };

  for (let i = index - 1; i >= 0; i -= 1) {
    const v = pick(columns[i]);
    if (v !== undefined) return { value: v, sourceColumn: columns[i], carried: true };
  }
  return undefined;
}
