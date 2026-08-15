import type { Patient } from '../types';

/**
 * Whether an NSAID has been charted as given recently — used only to decide
 * whether a temperature reading should be judged against the NSAID-adjusted
 * fever tiers (see `readPyrexia` in `data/colicThresholds.ts`), since an
 * NSAID masks fever.
 *
 * This is a name-pattern match against `Treatment.drug` — not a
 * formulary-verified drug class. It matches the generic/trade names this
 * app's own formulary actually uses for NSAIDs. A drug charted under a name
 * this pattern doesn't recognise is not matched; this never guesses a match
 * it can't support from the name actually charted (rule 1).
 */
const NSAID_NAME_PATTERN = /flunixin|meloxicam|firocoxib|phenylbutazone|\bbute\b|ketoprofen|meclofenamic/i;

/** True if an NSAID administration is charted within `windowHours` before `at`. */
export function nsaidGivenWithin(
  patient: Patient,
  at: Date,
  windowHours: number,
): boolean {
  const atMs = at.getTime();
  const windowStartMs = atMs - windowHours * 60 * 60 * 1000;
  for (const t of patient.treatments ?? []) {
    if (!NSAID_NAME_PATTERN.test(t.drug)) continue;
    for (const a of t.administrations ?? []) {
      const givenMs = new Date(a.at).getTime();
      if (Number.isFinite(givenMs) && givenMs <= atMs && givenMs >= windowStartMs) return true;
    }
  }
  return false;
}
