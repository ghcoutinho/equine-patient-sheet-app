import type { Recorded } from '../types';

/**
 * The only place a `Recorded` value is constructed. Every write path calls
 * this instead of stamping `new Date().toISOString()` and `clinician`
 * separately, so `at` and `by` can never drift apart — one call, both
 * fields, always together. Callers are expected to have already confirmed a
 * clinician is set (every write path hard-blocks on that before reaching
 * here); this does not re-check it.
 */
export function stampRecorded(by: string): Recorded {
  return { at: new Date().toISOString(), by };
}
