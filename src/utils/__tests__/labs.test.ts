import { describe, it, expect } from 'vitest';
import {
  computeDerived,
  differentialCheck,
  flagValue,
  DERIVED_PARAMETERS,
  DERIVED_IDS,
  ALL_ENTERED_FIELDS,
} from '../labs';

/**
 * Derived laboratory values.
 *
 * The invariant under test is that a calculated parameter is computed on read
 * and never stored, so the panel cannot contradict its own arithmetic — and
 * that a missing input produces "we do not know", never a zero that reads as a
 * real result.
 */

const valueOf = (results: ReturnType<typeof computeDerived>, id: string) =>
  results.find((r) => r.parameter.id === id);

/** A complete panel, so every derived parameter has what it needs. */
const FULL_PANEL: Record<string, number> = {
  lab_pcv: 36,
  lab_rbc: 8.0,
  lab_hgb: 13.6,
  lab_rdw: 20,
  lab_platelets: 150,
  lab_wbc: 9.0,
  lab_neuts_seg: 6.5,
  lab_neuts_band: 0,
  lab_lymphocytes: 2.0,
  lab_monocytes: 0.4,
  lab_eosinophils: 0.1,
  lab_basophils: 0,
  lab_tp: 6.4,
  lab_albumin: 2.8,
  lab_sodium: 136,
  lab_potassium: 3.4,
  lab_chloride: 98,
  lab_bicarbonate: 20,
  lab_tbili: 2.0,
  lab_dbili: 0.5,
  lab_iron: 100,
  lab_tibc: 400,
  lab_glucose: 100,
  lab_bun: 14,
};

describe('computeDerived — red cell indices', () => {
  it('PCV 36, RBC 8.0, Hgb 13.6 → MCV 45 fL · MCH 17 pg · MCHC 37.8 g/dL', () => {
    const r = computeDerived(FULL_PANEL);
    expect(valueOf(r, 'lab_mcv')?.value).toBe(45);
    expect(valueOf(r, 'lab_mch')?.value).toBe(17);
    expect(valueOf(r, 'lab_mchc')?.value).toBe(37.8);
  });

  it('carries the formula so the clinician can check the arithmetic', () => {
    const r = computeDerived(FULL_PANEL);
    expect(valueOf(r, 'lab_mchc')?.parameter.formula).toBe('Haemoglobin × 100 ÷ PCV');
  });

  it('RDW : platelet ratio keeps three decimals', () => {
    expect(valueOf(computeDerived(FULL_PANEL), 'lab_rpr')?.value).toBe(0.133);
  });
});

describe('computeDerived — protein and electrolytes', () => {
  it('TP 6.4, albumin 2.8 → globulin 3.6 g/dL · A:G 0.78', () => {
    const r = computeDerived(FULL_PANEL);
    expect(valueOf(r, 'lab_globulin')?.value).toBe(3.6);
    expect(valueOf(r, 'lab_ag_ratio')?.value).toBe(0.78);
  });

  it('Na 136, K 3.4, Cl 98, HCO₃ 20 → anion gap 21.4 mEq/L', () => {
    expect(valueOf(computeDerived(FULL_PANEL), 'lab_anion_gap')?.value).toBe(21.4);
  });

  it('computes the remaining chemistry derivations', () => {
    const r = computeDerived(FULL_PANEL);
    expect(valueOf(r, 'lab_ibili')?.value).toBe(1.5);
    expect(valueOf(r, 'lab_sat')?.value).toBe(25);
    expect(valueOf(r, 'lab_osmolality')?.value).toBe(282.6);
    expect(valueOf(r, 'lab_corrected_na')?.value).toBe(136);
  });
});

describe('computeDerived — differential percentages', () => {
  it('Seg neutrophils 6.5 against WBC 9.0 → 72.2%', () => {
    expect(valueOf(computeDerived(FULL_PANEL), 'lab_neuts_seg_pct')?.value).toBe(72.2);
  });

  it('computes every differential percentage', () => {
    const r = computeDerived(FULL_PANEL);
    expect(valueOf(r, 'lab_lymphocytes_pct')?.value).toBe(22.2);
    expect(valueOf(r, 'lab_monocytes_pct')?.value).toBe(4.4);
    expect(valueOf(r, 'lab_eosinophils_pct')?.value).toBe(1.1);
  });

  it('respects a charted zero — 0 bands is a finding, not a missing value', () => {
    const r = computeDerived(FULL_PANEL);
    const bands = valueOf(r, 'lab_neuts_band_pct');
    expect(bands?.value).toBe(0);
    expect(bands?.missing).toEqual([]);
    expect(valueOf(r, 'lab_basophils_pct')?.value).toBe(0);
  });
});

describe('computeDerived — every derived parameter is covered', () => {
  it('produces a result for all of them, and a value for each on a full panel', () => {
    const r = computeDerived(FULL_PANEL);
    expect(r).toHaveLength(DERIVED_PARAMETERS.length);
    const withoutValue = r.filter((x) => x.value === undefined).map((x) => x.parameter.id);
    expect(withoutValue).toEqual([]);
  });

  it('never offers a derived id as an entered field', () => {
    const entered = ALL_ENTERED_FIELDS.filter((f) => DERIVED_IDS.has(f.id));
    expect(entered).toEqual([]);
  });
});

describe('computeDerived — the missing-input path', () => {
  it('names the missing input and returns no value, never zero', () => {
    const r = computeDerived({ lab_pcv: 36 });
    const mcv = valueOf(r, 'lab_mcv');
    expect(mcv?.value).toBeUndefined();
    expect(mcv?.value).not.toBe(0);
    expect(mcv?.missing).toEqual(['Red cell count']);
  });

  it('lists every missing input, not just the first', () => {
    const gap = valueOf(computeDerived({ lab_sodium: 136 }), 'lab_anion_gap');
    expect(gap?.value).toBeUndefined();
    expect(gap?.missing).toEqual([
      'Potassium (K⁺)',
      'Chloride (Cl⁻)',
      'Bicarbonate (HCO₃⁻)',
    ]);
  });

  it('reports nothing missing on an empty panel except the inputs themselves', () => {
    const r = computeDerived({});
    expect(r.every((x) => x.value === undefined)).toBe(true);
    expect(r.every((x) => x.missing.length > 0)).toBe(true);
  });

  it('withholds a value when the arithmetic is undefined, without calling it missing', () => {
    // RBC of zero makes MCV infinite. That is not a missing input — it is a
    // number the panel must not print.
    const mcv = valueOf(computeDerived({ lab_pcv: 36, lab_rbc: 0 }), 'lab_mcv');
    expect(mcv?.value).toBeUndefined();
    expect(mcv?.missing).toEqual([]);
  });

  it('treats a zero input as charted, not absent', () => {
    // TP equal to albumin gives a globulin of exactly 0 — a real, reportable
    // result that must not be confused with "not entered".
    const globulin = valueOf(computeDerived({ lab_tp: 2.8, lab_albumin: 2.8 }), 'lab_globulin');
    expect(globulin?.value).toBe(0);
    expect(globulin?.missing).toEqual([]);
  });
});

describe('differentialCheck', () => {
  it('agrees when the parts account for the total white cell count', () => {
    const check = differentialCheck(FULL_PANEL);
    expect(check).toEqual({ sum: 9, wbc: 9, agrees: true });
  });

  it('disagrees when they do not — a transcription error worth saying out loud', () => {
    const check = differentialCheck({ ...FULL_PANEL, lab_lymphocytes: 5.0 });
    expect(check?.sum).toBe(12);
    expect(check?.wbc).toBe(9);
    expect(check?.agrees).toBe(false);
  });

  it('tolerates analyser rounding inside 5%', () => {
    // 9.3 against a 9.0 count is 0.3, inside the 0.45 tolerance.
    expect(differentialCheck({ ...FULL_PANEL, lab_lymphocytes: 2.3 })?.agrees).toBe(true);
  });

  it('returns undefined when there is nothing to check against', () => {
    expect(differentialCheck({ lab_neuts_seg: 6.5 })).toBeUndefined();
    expect(differentialCheck({ lab_wbc: 9 })).toBeUndefined();
    expect(differentialCheck({})).toBeUndefined();
  });
});

describe('flagValue', () => {
  const range = {
    id: 'lab_test',
    name: 'Test parameter',
    sectionGroup: 'Chemistry',
    units: 'g/dL',
    referenceMin: 2,
    referenceMax: 4,
    criticalMin: 1,
    criticalMax: 5,
  } as const;

  it('flags against the published interval', () => {
    expect(flagValue(range, 3)).toBe('normal');
    expect(flagValue(range, 1.5)).toBe('low');
    expect(flagValue(range, 4.5)).toBe('high');
    expect(flagValue(range, 0.5)).toBe('critical-low');
    expect(flagValue(range, 6)).toBe('critical-high');
  });

  it('flags a boundary value as normal, not as out of range', () => {
    expect(flagValue(range, 2)).toBe('normal');
    expect(flagValue(range, 4)).toBe('normal');
  });

  it('returns undefined when there is no interval or no value', () => {
    expect(flagValue(undefined, 3)).toBeUndefined();
    expect(flagValue(range, undefined)).toBeUndefined();
  });

  it('flags a charted zero rather than treating it as absent', () => {
    expect(flagValue(range, 0)).toBe('critical-low');
  });
});
