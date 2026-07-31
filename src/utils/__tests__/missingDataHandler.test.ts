import { describe, it, expect } from 'vitest';
import { calculateScoreBounds } from '../missingDataHandler';

/**
 * Score bounds under missing data.
 *
 * The rule this enforces is that "not charted" and "normal" are different
 * states. An uncharted item contributes its whole possible span to the range
 * and drops `isExact`, so the UI shows `3–7` rather than a confident `3`.
 * `isExact` going false is the flag the whole display hangs off, so it is
 * tested on its own.
 */

describe('calculateScoreBounds', () => {
  it('is exact when every item was charted', () => {
    expect(
      calculateScoreBounds([
        { value: 2, min: 0, max: 3 },
        { value: 1, min: 0, max: 2 },
      ]),
    ).toEqual({ min: 3, max: 3, isExact: true });
  });

  it('widens the range and drops isExact when one item is missing', () => {
    expect(
      calculateScoreBounds([
        { value: 2, min: 0, max: 3 },
        { value: undefined, min: 0, max: 2 },
      ]),
    ).toEqual({ min: 2, max: 4, isExact: false });
  });

  it('goes inexact if any single item is undefined, however many are charted', () => {
    const items = [
      { value: 1, min: 0, max: 1 },
      { value: 1, min: 0, max: 1 },
      { value: 1, min: 0, max: 1 },
      { value: undefined, min: 0, max: 1 },
    ];
    const bounds = calculateScoreBounds(items);
    expect(bounds.isExact).toBe(false);
    expect(bounds.min).toBe(3);
    expect(bounds.max).toBe(4);
  });

  it('spans the full range when nothing was charted', () => {
    expect(
      calculateScoreBounds([
        { value: undefined, min: 0, max: 3 },
        { value: undefined, min: 1, max: 2 },
      ]),
    ).toEqual({ min: 1, max: 5, isExact: false });
  });

  it('treats a charted zero as charted — 0 is a finding, not a gap', () => {
    const bounds = calculateScoreBounds([
      { value: 0, min: 0, max: 3 },
      { value: 0, min: 0, max: 2 },
    ]);
    expect(bounds).toEqual({ min: 0, max: 0, isExact: true });
    // The distinction that matters: the same shape with undefined is not exact.
    expect(
      calculateScoreBounds([
        { value: undefined, min: 0, max: 3 },
        { value: undefined, min: 0, max: 2 },
      ]).isExact,
    ).toBe(false);
  });

  it('an empty score is exact and zero', () => {
    expect(calculateScoreBounds([])).toEqual({ min: 0, max: 0, isExact: true });
  });

  it('carries negative contributions through both bounds', () => {
    expect(
      calculateScoreBounds([
        { value: -1, min: -2, max: 0 },
        { value: undefined, min: -2, max: 0 },
      ]),
    ).toEqual({ min: -3, max: -1, isExact: false });
  });
});
