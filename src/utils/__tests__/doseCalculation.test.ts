import { describe, it, expect } from 'vitest';
import {
  computeDose,
  parseDoseUnit,
  defaultConcentrationUnit,
  concentrationUnitOptions,
} from '../doseCalculation';

/**
 * Dose → volume arithmetic.
 *
 * This is the module a 10× overdose already shipped from
 * (`concentrationMgMl / 10`), so the golden values below are the point of the
 * file: each is a real drug at a real concentration, checked by hand against
 * the running app. A change that moves any of these numbers is a dosing change
 * and must be argued clinically, not waved through as a refactor.
 */

const ADULT_KG = 520;

describe('parseDoseUnit', () => {
  it('reads a plain per-kilogram dose', () => {
    expect(parseDoseUnit('mg/kg')).toEqual({
      kind: 'per-kg',
      massUnit: 'mg',
      qualifier: undefined,
    });
  });

  it('reads a rate, keeping the per-hour / per-minute distinction', () => {
    expect(parseDoseUnit('mcg/kg/min')).toMatchObject({
      kind: 'per-kg-rate',
      massUnit: 'mcg',
      ratePer: 'min',
    });
    expect(parseDoseUnit('mg/kg/hr')).toMatchObject({
      kind: 'per-kg-rate',
      massUnit: 'mg',
      ratePer: 'hr',
    });
    // "h" and "hours" are the same order written differently.
    expect(parseDoseUnit('mg/kg/h').ratePer).toBe('hr');
    expect(parseDoseUnit('IU/kg/hours').ratePer).toBe('hr');
    expect(parseDoseUnit('mU/kg/minutes').ratePer).toBe('min');
  });

  it('reads a total, which is not multiplied by body weight', () => {
    expect(parseDoseUnit('mg (total)')).toMatchObject({ kind: 'total', massUnit: 'mg' });
    expect(parseDoseUnit('IU (total)')).toMatchObject({ kind: 'total', massUnit: 'IU' });
    expect(parseDoseUnit('L total (not weight-based; ~4-8 mL/kg)')).toMatchObject({
      kind: 'total',
      massUnit: 'L',
    });
  });

  it('treats anything it cannot decompose as opaque rather than guessing', () => {
    expect(parseDoseUnit('capsules').kind).toBe('opaque');
    expect(parseDoseUnit('drops').kind).toBe('opaque');
    expect(parseDoseUnit('mg/m2').kind).toBe('opaque');
    expect(parseDoseUnit('-').kind).toBe('opaque');
    expect(parseDoseUnit('').kind).toBe('opaque');
  });

  it('preserves the qualifier the formulary appends, because it is clinical', () => {
    expect(parseDoseUnit('mg/kg (combined)').qualifier).toBe('combined');
    // The trailing ")" is stripped by the same rule that strips the leading "(",
    // so an embedded parenthetical comes back unbalanced. Pinned as-is: the
    // text is shown to the clinician, not parsed, so it reads correctly enough
    // and no caller depends on the bracket.
    expect(parseDoseUnit('mg/kg elemental Ca (or ~0.2-0.4 mL/kg of 23% solution)').qualifier)
      .toBe('elemental Ca (or ~0.2-0.4 mL/kg of 23% solution');
    expect(parseDoseUnit('mg/kg as MgSO4').qualifier).toBe('as MgSO4');
  });
});

describe('computeDose — activity units (IU / mU)', () => {
  it('Penicillin G 22,000 IU/kg · 520 kg · 1,000,000 IU/mL → 11,440,000 IU → 11.44 mL', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 22_000,
      doseUnit: 'IU/kg',
      concentration: 1_000_000,
      concentrationUnit: 'IU/mL',
    });
    expect(r.amount).toBe(11_440_000);
    expect(r.amountUnit).toBe('IU');
    expect(r.volume).toBe(11.44);
    expect(r.volumeUnit).toBe('mL');
    expect(r.volumeBlocked).toBeUndefined();
  });

  it('Procaine penicillin 22,000 IU/kg · 520 kg · 300,000 IU/mL → 38.13 mL', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 22_000,
      doseUnit: 'IU/kg',
      concentration: 300_000,
      concentrationUnit: 'IU/mL',
    });
    expect(r.amount).toBe(11_440_000);
    expect(r.volume).toBe(38.13);
  });

  it('assumes IU/mL rather than failing, when an IU/kg drug has no concentration unit', () => {
    expect(defaultConcentrationUnit('IU/kg')).toBe('IU/mL');
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 22_000,
      doseUnit: 'IU/kg',
      concentration: 1_000_000,
    });
    expect(r.volume).toBe(11.44);
  });

  it('normalises mU against an IU/mL bottle — 1 mU is a thousandth of an IU', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 0.5,
      doseUnit: 'mU/kg/min',
      concentration: 20,
      concentrationUnit: 'IU/mL',
    });
    expect(r.amount).toBe(260);
    expect(r.amountUnit).toBe('mU/min');
    expect(r.volume).toBe(0.013);
    expect(r.volumeUnit).toBe('mL/min');
    expect(r.ratePer).toBe('min');
  });
});

describe('computeDose — mass units (g / mg / mcg)', () => {
  it('Flunixin 1.1 mg/kg · 520 kg · 50 mg/mL → 572 mg → 11.44 mL', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 1.1,
      doseUnit: 'mg/kg',
      concentration: 50,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(572);
    expect(r.amountUnit).toBe('mg');
    expect(r.volume).toBe(11.44);
    expect(r.summary).toBe('572 mg (11.44 mL)');
  });

  it('Amikacin 21 mg/kg · 500 kg · 250 mg/mL → 42 mL', () => {
    const r = computeDose({
      weightKg: 500,
      dose: 21,
      doseUnit: 'mg/kg',
      concentration: 250,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(10_500);
    expect(r.volume).toBe(42);
  });

  it('Detomidine 10 mcg/kg · 520 kg · 10 mg/mL → 5,200 mcg → 0.52 mL', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 10,
      doseUnit: 'mcg/kg',
      concentration: 10,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(5_200);
    expect(r.amountUnit).toBe('mcg');
    // The mcg dose and the mg/mL bottle are the same family, so this divides.
    expect(r.volume).toBe(0.52);
  });

  it('crosses g and mg within the mass family', () => {
    const r = computeDose({
      weightKg: 500,
      dose: 0.02,
      doseUnit: 'g/kg',
      concentration: 500,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(10);
    expect(r.amountUnit).toBe('g');
    // 10 g = 10,000 mg over 500 mg/mL.
    expect(r.volume).toBe(20);
  });

  it('accepts "ug" as a spelling of mcg', () => {
    const r = computeDose({
      weightKg: 100,
      dose: 10,
      doseUnit: 'ug/kg',
      concentration: 1,
      concentrationUnit: 'mg/mL',
    });
    expect(r.volume).toBe(1);
  });
});

describe('computeDose — percentage concentrations', () => {
  it('reads % as g per 100 mL, i.e. 10 mg/mL per point', () => {
    // 4 mg/kg × 520 kg = 2,080 mg; 7.2% = 72 mg/mL; 2,080 ÷ 72 = 28.89 mL.
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 4,
      doseUnit: 'mg/kg',
      concentration: 7.2,
      concentrationUnit: '%',
    });
    expect(r.amount).toBe(2_080);
    expect(r.amountUnit).toBe('mg');
    expect(r.volume).toBe(28.89);
  });

  it('a 50% solution is 500 mg/mL', () => {
    const r = computeDose({
      weightKg: 500,
      dose: 1,
      doseUnit: 'mg/kg',
      concentration: 50,
      concentrationUnit: '%',
    });
    expect(r.volume).toBe(1);
  });

  it('refuses % against an activity dose — a percentage is a mass, not activity', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 22_000,
      doseUnit: 'IU/kg',
      concentration: 7.2,
      concentrationUnit: '%',
    });
    expect(r.volume).toBeUndefined();
    expect(r.volumeBlocked).toBe('unit-mismatch');
  });
});

describe('computeDose — cross-family division is refused, not guessed', () => {
  it('an IU/kg dose against a mg/mL concentration is blocked as unit-mismatch', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 22_000,
      doseUnit: 'IU/kg',
      concentration: 250,
      concentrationUnit: 'mg/mL',
    });
    expect(r.volumeBlocked).toBe('unit-mismatch');
    expect(r.volume).toBeUndefined();
    // The amount is still real and still shown — only the volume is withheld.
    expect(r.amount).toBe(11_440_000);
    expect(r.amountUnit).toBe('IU');
  });

  it('a mg/kg dose against an IU/mL concentration is blocked the same way', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 1.1,
      doseUnit: 'mg/kg',
      concentration: 1_000_000,
      concentrationUnit: 'IU/mL',
    });
    expect(r.volumeBlocked).toBe('unit-mismatch');
  });

  it('blocks when no concentration is on file, rather than inventing one', () => {
    const noConc = computeDose({ weightKg: ADULT_KG, dose: 1.1, doseUnit: 'mg/kg' });
    expect(noConc.volumeBlocked).toBe('no-concentration');
    expect(noConc.amount).toBe(572);

    // Zero is not a usable concentration either, and must not divide.
    const zero = computeDose({
      weightKg: ADULT_KG,
      dose: 1.1,
      doseUnit: 'mg/kg',
      concentration: 0,
    });
    expect(zero.volumeBlocked).toBe('no-concentration');
    expect(zero.volume).toBeUndefined();
  });
});

describe('computeDose — doses already expressed as a volume', () => {
  it('Hypertonic saline 4 mL/kg · 520 kg → 2,080 mL, its own volume', () => {
    // A mL/kg dose IS the volume; no concentration is consulted at all. This is
    // the formulary's hypertonic_saline_7_2 entry (doseUnit "mL/kg", dose 4).
    // 4 mL/kg × 520 kg = 2,080 mL ≈ 2.1 L, the shock-resuscitation volume.
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 4,
      doseUnit: 'mL/kg',
      concentration: 100,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(2_080);
    expect(r.volume).toBe(2_080);
    expect(r.volumeUnit).toBe('mL');
    expect(r.volumeBlocked).toBeUndefined();
    expect(r.summary).toBe('2080 mL');
  });

  it('needs no concentration for a volume dose', () => {
    const r = computeDose({ weightKg: ADULT_KG, dose: 4, doseUnit: 'mL/kg' });
    expect(r.volume).toBe(2_080);
    expect(r.volumeBlocked).toBeUndefined();
  });

  it('keeps litres as litres', () => {
    const r = computeDose({ weightKg: 500, dose: 0.02, doseUnit: 'L/kg' });
    expect(r.volume).toBe(10);
    expect(r.volumeUnit).toBe('L');
  });

  it('carries the rate suffix through a volume dose', () => {
    const r = computeDose({ weightKg: 500, dose: 2, doseUnit: 'mL/kg/hr' });
    expect(r.amount).toBe(1_000);
    expect(r.volumeUnit).toBe('mL/hr');
    expect(r.ratePer).toBe('hr');
  });
});

describe('computeDose — rates', () => {
  it('multiplies by weight and labels the rate per hour', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 0.05,
      doseUnit: 'mg/kg/hr',
      concentration: 50,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(26);
    expect(r.amountUnit).toBe('mg/hr');
    expect(r.volume).toBe(0.52);
    expect(r.volumeUnit).toBe('mL/hr');
  });

  it('keeps per-minute rates per minute', () => {
    const r = computeDose({
      weightKg: 500,
      dose: 3,
      doseUnit: 'mcg/kg/min',
      concentration: 12.5,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(1_500);
    expect(r.amountUnit).toBe('mcg/min');
    expect(r.volume).toBe(0.12);
    expect(r.volumeUnit).toBe('mL/min');
  });
});

describe('computeDose — totals and opaque units', () => {
  it('does not multiply a total by body weight', () => {
    const r = computeDose({
      weightKg: ADULT_KG,
      dose: 500,
      doseUnit: 'mg (total)',
      concentration: 100,
      concentrationUnit: 'mg/mL',
    });
    expect(r.amount).toBe(500);
    expect(r.volume).toBe(5);
  });

  it('refuses to compute anything for an opaque unit', () => {
    const r = computeDose({ weightKg: ADULT_KG, dose: 2, doseUnit: 'capsules' });
    expect(r.volumeBlocked).toBe('not-weight-based');
    expect(r.amount).toBeUndefined();
    expect(r.volume).toBeUndefined();
    expect(r.summary).toBe('2 capsules — not weight-based, give as written');
  });
});

describe('concentration unit options', () => {
  it('offers activity units for an activity dose and mass units for a mass dose', () => {
    expect(concentrationUnitOptions('IU/kg')).toEqual(['IU/mL', 'mU/mL']);
    expect(concentrationUnitOptions('mg/kg')).toEqual(['mg/mL', 'mcg/mL', 'g/mL', '%']);
  });

  it('defaults a mcg/kg drug to a mg/mL bottle, which is how they are sold', () => {
    expect(defaultConcentrationUnit('mcg/kg')).toBe('mg/mL');
    expect(defaultConcentrationUnit('mg/kg')).toBe('mg/mL');
    expect(defaultConcentrationUnit('mU/kg/min')).toBe('mU/mL');
  });
});
