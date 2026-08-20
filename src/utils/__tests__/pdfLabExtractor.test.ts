import { describe, expect, it } from 'vitest';
import { matchLabValues } from '../pdfLabExtractor';

describe('matchLabValues', () => {
  it('reads a label-then-number chemistry line', () => {
    const text = 'Sodium (Na+)   138   mEq/L   132-146\nPotassium (K+)   4.2   mEq/L   2.4-4.7';
    const matches = matchLabValues(text);
    expect(matches.find((m) => m.fieldId === 'lab_sodium')?.value).toBe(138);
    expect(matches.find((m) => m.fieldId === 'lab_potassium')?.value).toBe(4.2);
  });

  it('prefers the more specific ionised-calcium alias over the generic calcium one', () => {
    const text = 'Ionized calcium   1.4   mmol/L\nCalcium   11.8   mg/dL';
    const matches = matchLabValues(text);
    expect(matches.find((m) => m.fieldId === 'lab_ionized_calcium')?.value).toBe(1.4);
    expect(matches.find((m) => m.fieldId === 'lab_calcium')?.value).toBe(11.8);
  });

  it('does not report a field twice even if its alias appears on a later line', () => {
    const text = 'PCV   34   %\nHaematocrit repeat   36   %';
    const matches = matchLabValues(text).filter((m) => m.fieldId === 'lab_pcv');
    expect(matches).toHaveLength(1);
    expect(matches[0].value).toBe(34);
  });

  it('ignores a matched label with no trailing number', () => {
    const text = 'Notes: see BUN trend on last visit';
    expect(matchLabValues(text).find((m) => m.fieldId === 'lab_bun')).toBeUndefined();
  });

  it('carries the source line for review', () => {
    const text = 'Glucose   145   mg/dL   62-114';
    const match = matchLabValues(text).find((m) => m.fieldId === 'lab_glucose');
    expect(match?.sourceLine).toBe('Glucose   145   mg/dL   62-114');
  });

  it('returns nothing for a report with no recognisable fields', () => {
    expect(matchLabValues('This document contains no lab data at all.')).toEqual([]);
  });

  it('handles a full haematology + chemistry panel in one pass', () => {
    const text = [
      'PCV 38 %',
      'WBC 7.9 K/uL',
      'Hgb 13.1 g/dL',
      'Fibrinogen 320 mg/dL',
      'BUN 18 mg/dL',
      'Creatinine 1.3 mg/dL',
      'Total protein 6.4 g/dL',
      'Albumin 3.1 g/dL',
    ].join('\n');
    const matches = matchLabValues(text);
    const byId = Object.fromEntries(matches.map((m) => [m.fieldId, m.value]));
    expect(byId).toMatchObject({
      lab_pcv: 38,
      lab_wbc: 7.9,
      lab_hgb: 13.1,
      lab_fibrinogen: 320,
      lab_bun: 18,
      lab_creatinine: 1.3,
      lab_tp: 6.4,
      lab_albumin: 3.1,
    });
  });
});
