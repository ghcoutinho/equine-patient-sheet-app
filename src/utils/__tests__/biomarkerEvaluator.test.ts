import { describe, it, expect } from 'vitest';
import { evaluateBiomarkers } from '../biomarkerEvaluator';

/**
 * Inflammatory biomarkers.
 *
 * This module was wired into Clinical Intelligence before it could ever
 * receive data, and its thresholds carried no citation at all. Both are fixed
 * now — the golden values below are the three papers' actual reported
 * cut-offs, verified against the primary sources rather than assumed from the
 * numbers already in the code.
 */

describe('evaluateBiomarkers — SAA (Hoeberg et al. 2022)', () => {
  it('is normal below the unsourced elevation floor', () => {
    expect(evaluateBiomarkers({ saa: 40 }).saa?.interpretation).toBe('NORMAL');
  });

  it('crosses to active inflammation above 50', () => {
    expect(evaluateBiomarkers({ saa: 51 }).saa?.interpretation).toBe('ACTIVE_INFLAMMATION');
  });

  it('reaches the published sepsis cut-off at 1,050 mg/L', () => {
    expect(evaluateBiomarkers({ saa: 1050 }).saa?.interpretation).toBe('ACTIVE_INFLAMMATION');
    expect(evaluateBiomarkers({ saa: 1051 }).saa?.interpretation).toBe('SEPSIS_RISK');
  });

  it('reaches the published non-survival cut-off at 1,250 mg/L', () => {
    expect(evaluateBiomarkers({ saa: 1250 }).saa?.interpretation).toBe('SEPSIS_RISK');
    expect(evaluateBiomarkers({ saa: 1251 }).saa?.interpretation).toBe('HIGH_MORTALITY_RISK');
  });

  it('carries the Hoeberg citation, not a blank source', () => {
    const r = evaluateBiomarkers({ saa: 1300 }).saa;
    expect(r?.source).toContain('Hoeberg');
    expect(r?.source).toContain('1,250');
  });

  it('is absent when SAA was not charted', () => {
    expect(evaluateBiomarkers({}).saa).toBeUndefined();
  });
});

describe('evaluateBiomarkers — NGAL (Laurberg et al. 2023)', () => {
  it('reaches the published sepsis cut-off at 455 µg/L', () => {
    expect(evaluateBiomarkers({ ngal: 455 }).ngal?.interpretation).toBe('NORMAL');
    expect(evaluateBiomarkers({ ngal: 456 }).ngal?.interpretation).toBe('SEPSIS_RISK');
  });

  it('reaches the published non-survival cut-off at 1,104 µg/L', () => {
    expect(evaluateBiomarkers({ ngal: 1104 }).ngal?.interpretation).toBe('SEPSIS_RISK');
    expect(evaluateBiomarkers({ ngal: 1105 }).ngal?.interpretation).toBe('HIGH_MORTALITY_RISK');
  });

  it('carries the Laurberg citation', () => {
    expect(evaluateBiomarkers({ ngal: 2000 }).ngal?.source).toContain('Laurberg');
  });
});

describe('evaluateBiomarkers — RPR (Scalco et al. 2023)', () => {
  it('reaches the published sepsis cut-off at 0.0928', () => {
    expect(evaluateBiomarkers({ rpr: 0.0927 }).rpr?.interpretation).not.toBe('SEPSIS_RISK');
    expect(evaluateBiomarkers({ rpr: 0.0928 }).rpr?.interpretation).toBe('SEPSIS_RISK');
  });

  it('is at-risk in the unsourced intermediate band', () => {
    expect(evaluateBiomarkers({ rpr: 0.06 }).rpr?.interpretation).toBe('AT_RISK');
  });

  it('is normal below the intermediate floor', () => {
    expect(evaluateBiomarkers({ rpr: 0.05 }).rpr?.interpretation).toBe('NORMAL');
  });

  it('carries the Scalco citation', () => {
    expect(evaluateBiomarkers({ rpr: 0.1 }).rpr?.source).toContain('Scalco');
  });
});
