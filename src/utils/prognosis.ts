import type { FlowsheetEntry } from '../types';

/**
 * Published admission cut-offs, applied individually.
 *
 * These are single-parameter thresholds reported as associated with a worse
 * outcome. They are deliberately not summed into a score: the sources report
 * them as independent cut-offs, and adding them together would produce a number
 * no paper validated. The itemised ledger in `intelligence.ts` is where
 * weighted aggregation happens, and it is labelled there as a ward convention.
 *
 * A charted zero is a finding, so every test uses `Number.isFinite` rather than
 * truthiness — `lactate: 0` must not be silently skipped.
 */
export function getPrognosticFlags(entry: Partial<FlowsheetEntry>): string[] {
  const flags: string[] = [];
  const has = (n: number | undefined): n is number => Number.isFinite(n);

  // Adult colic admission cut-offs (Bottegaro 2024, McGovern 2025)
  if (has(entry.heartRate) && entry.heartRate > 75) {
    flags.push(`Heart rate ${entry.heartRate} bpm — above the > 75 bpm high-risk cut-off`);
  }
  if (has(entry.respiratoryRate) && entry.respiratoryRate > 33) {
    flags.push(
      `Respiratory rate ${entry.respiratoryRate} breaths/min — above the > 33 high-risk cut-off`,
    );
  }
  if (has(entry.lactate) && entry.lactate > 3.7) {
    flags.push(`Lactate ${entry.lactate} mmol/L — above the > 3.7 mmol/L high-risk cut-off`);
  }
  if (has(entry.pcv) && entry.pcv > 46) {
    flags.push(`Haematocrit ${entry.pcv}% — above the > 46% high-risk cut-off`);
  }

  // Acute diarrhoea cohort
  if (has(entry.creatinine) && entry.creatinine > 159) {
    flags.push(
      `Creatinine ${entry.creatinine} µmol/L — above the > 159 µmol/L cut-off reported in acute diarrhoea`,
    );
  }
  if (has(entry.lactate) && entry.lactate > 2.8 && entry.lactate <= 3.7) {
    flags.push(
      `Lactate ${entry.lactate} mmol/L — above the > 2.8 mmol/L cut-off reported in acute diarrhoea`,
    );
  }

  return flags;
}
