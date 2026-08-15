import { describe, it, expect } from 'vitest';
import type { Patient, Treatment, FlowsheetColumn } from '../../types';
import { fluidBalance } from '../fluidBalance';

/**
 * Fluid balance — intake from Track 2's structured rates, output from
 * charted reflux plus the insensible-loss ward convention. Both output and
 * balance stay ranges; insensible loss is an estimate that can never be
 * collapsed to one confident number (rule 1).
 */

const NOW = new Date('2026-08-05T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const at = (offsetHours: number) => new Date(NOW.getTime() + offsetHours * HOUR).toISOString();

const patient = (over: Partial<Patient> = {}): Patient =>
  ({
    id: 'p1',
    name: 'Test',
    caseNumber: 'C-1',
    breed: 'Thoroughbred',
    weightKg: 500,
    age: 'Unknown',
    location: 'Stall 1',
    status: 'ACTIVE',
    lastObsTime: '',
    flowsheetHistory: [],
    sirsCriteriaMet: false,
    category: 'ADULT_COLIC',
    gender: 'Mare',
    admissionDate: '2026-08-04',
    owner: { name: 'Not recorded' },
    currentAdmissionStartedAt: at(-24),
    treatments: [],
    ...over,
  }) as Patient;

const cri = (over: Partial<Treatment> = {}): Treatment => ({
  id: 't1',
  kind: 'CRI',
  drug: 'Lidocaine',
  startedAt: at(-24),
  administrations: [],
  ...over,
});

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '08:00',
  recordedAt: at(-12),
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

describe('fluidBalance', () => {
  it('is undefined without a weight', () => {
    expect(fluidBalance(patient({ weightKg: 0 }), NOW)).toBeUndefined();
  });

  it('is undefined without any admission start to measure elapsed time against', () => {
    expect(
      fluidBalance(patient({ currentAdmissionStartedAt: undefined, admissionDate: '' }), NOW),
    ).toBeUndefined();
  });

  it('sums continuous-line intake via infusedVolumeMl', () => {
    const t = cri({ startedAt: at(-24), rateValue: 10, rateUnit: 'mL/hr' });
    const b = fluidBalance(patient({ treatments: [t] }), NOW);
    expect(b?.intakeMl).toBe(240); // 24h at 10 mL/hr
    expect(b?.intakeItems).toHaveLength(1);
  });

  it('excludes a mass-based rate from intake, but reports why rather than dropping it silently', () => {
    const t = cri({ startedAt: at(-24), rateValue: 0.05, rateUnit: 'mg/kg/hr' });
    const b = fluidBalance(patient({ treatments: [t] }), NOW);
    expect(b?.intakeMl).toBe(0);
    expect(b?.excludedIntake).toHaveLength(1);
    expect(b?.excludedIntake[0].drug).toBe('Lidocaine');
  });

  it('counts a plain-mL bolus administration but not a rate-shaped amountText', () => {
    const t = cri({
      kind: 'MEDICATION',
      administrations: [
        { id: 'a1', at: at(-1), by: 'Dr Test', amountText: '26 mL' },
        { id: 'a2', at: at(-2), by: 'Dr Test', amountText: '2.08 mL/hr' },
      ],
    });
    const b = fluidBalance(patient({ treatments: [t] }), NOW);
    expect(b?.intakeMl).toBe(26);
  });

  it('sums reflux across every round in the current admission, converted to mL', () => {
    const p = patient({
      flowsheetHistory: [
        column({ recordedAt: at(-10), gi: { refluxVolumeL: 2 } }),
        column({ recordedAt: at(-5), gi: { refluxVolumeL: 1.5 } }),
      ],
    });
    const b = fluidBalance(p, NOW);
    expect(b?.refluxOutputMl).toBe(3500);
  });

  it('excludes a round from before the current admission boundary', () => {
    const p = patient({
      currentAdmissionStartedAt: at(-24),
      flowsheetHistory: [column({ recordedAt: at(-48), gi: { refluxVolumeL: 5 } })],
    });
    const b = fluidBalance(p, NOW);
    expect(b?.refluxOutputMl).toBe(0);
  });

  it('scales insensible loss by weight and elapsed days, as a range', () => {
    const p = patient({ weightKg: 500, currentAdmissionStartedAt: at(-24) });
    const b = fluidBalance(p, NOW);
    // 1 day elapsed: 10.4 * 500 = 5200 .. 33.6 * 500 = 16800
    expect(b?.insensibleLossMinMl).toBeCloseTo(5200, 0);
    expect(b?.insensibleLossMaxMl).toBeCloseTo(16800, 0);
  });

  it('balance is a range that widens with the insensible-loss estimate, never a single number', () => {
    const t = cri({ startedAt: at(-24), rateValue: 10, rateUnit: 'mL/hr' });
    const p = patient({ weightKg: 500, treatments: [t] });
    const b = fluidBalance(p, NOW);
    expect(b!.balanceMinMl).toBeLessThan(b!.balanceMaxMl);
    expect(b?.balanceMaxMl).toBeCloseTo(240 - 5200, 0);
    expect(b?.balanceMinMl).toBeCloseTo(240 - 16800, 0);
  });
});
