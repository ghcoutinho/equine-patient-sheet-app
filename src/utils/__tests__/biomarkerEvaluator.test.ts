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
  it('is normal below any threshold, with no postop window charted', () => {
    expect(evaluateBiomarkers({ saa: 40 }).saa?.interpretation).toBe('NORMAL');
  });

  it('is still plain NORMAL at 300 with no postop window — no unsourced elevation floor', () => {
    expect(evaluateBiomarkers({ saa: 300 }).saa?.interpretation).toBe('NORMAL');
  });

  it('reaches the published sepsis cut-off at 1,050 mg/L', () => {
    expect(evaluateBiomarkers({ saa: 1050 }).saa?.interpretation).toBe('NORMAL');
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

  it('reads a value up to 568 within 48h post-coeliotomy as NORMAL_POSTOP, cited to Bowlby', () => {
    const r = evaluateBiomarkers({ saa: 500, hoursSincePostop: 20 }).saa;
    expect(r?.interpretation).toBe('NORMAL_POSTOP');
    expect(r?.source).toContain('Bowlby');
  });

  it('does not suppress the read once past the 48h window', () => {
    const r = evaluateBiomarkers({ saa: 500, hoursSincePostop: 49 }).saa;
    expect(r?.interpretation).toBe('NORMAL');
    expect(r?.source).toContain('Hoeberg');
  });

  it('does not suppress a value above the 568 postop ceiling, even within the window', () => {
    const r = evaluateBiomarkers({ saa: 600, hoursSincePostop: 10 }).saa;
    expect(r?.interpretation).toBe('NORMAL');
  });

  it('still escalates to sepsis risk within the postop window if SAA crosses that cut-off', () => {
    const r = evaluateBiomarkers({ saa: 1100, hoursSincePostop: 10 }).saa;
    expect(r?.interpretation).toBe('SEPSIS_RISK');
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
