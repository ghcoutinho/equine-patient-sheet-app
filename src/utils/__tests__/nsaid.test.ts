import { describe, it, expect } from 'vitest';
import type { Patient, Treatment } from '../../types';
import { nsaidGivenWithin } from '../nsaid';

/**
 * NSAID-recently-given detection — a name-pattern match against what was
 * actually charted, used only to decide whether the fever tiers should
 * shift (NSAIDs mask fever). Never guesses a match from a drug name it
 * doesn't recognise.
 */

const NOW = new Date('2026-08-15T12:00:00Z');
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
    treatments: [],
    ...over,
  }) as Patient;

const treatment = (drug: string, adminOffsetsHours: number[]): Treatment => ({
  id: 't1',
  kind: 'MEDICATION',
  drug,
  startedAt: at(-24),
  administrations: adminOffsetsHours.map((h, i) => ({
    id: `a${i}`,
    at: at(h),
    by: 'Dr Test',
  })),
});

describe('nsaidGivenWithin', () => {
  it('matches a known NSAID given inside the window', () => {
    const p = patient({ treatments: [treatment('Flunixin meglumine', [-2])] });
    expect(nsaidGivenWithin(p, NOW, 4)).toBe(true);
  });

  it('does not match a dose given outside the window', () => {
    const p = patient({ treatments: [treatment('Flunixin meglumine', [-5])] });
    expect(nsaidGivenWithin(p, NOW, 4)).toBe(false);
  });

  it('does not match a non-NSAID drug', () => {
    const p = patient({ treatments: [treatment('Butorphanol', [-1])] });
    expect(nsaidGivenWithin(p, NOW, 4)).toBe(false);
  });

  it('does not match a dose in the future relative to the round', () => {
    const p = patient({ treatments: [treatment('Meloxicam', [1])] });
    expect(nsaidGivenWithin(p, NOW, 4)).toBe(false);
  });

  it('matches any of several recognised NSAID names', () => {
    for (const drug of ['Firocoxib', 'Phenylbutazone', 'Ketoprofen', 'Meclofenamic acid']) {
      const p = patient({ treatments: [treatment(drug, [-1])] });
      expect(nsaidGivenWithin(p, NOW, 4)).toBe(true);
    }
  });

  it('is false with no treatments at all', () => {
    expect(nsaidGivenWithin(patient(), NOW, 4)).toBe(false);
  });

  it('includes a dose exactly at the window edge', () => {
    const p = patient({ treatments: [treatment('Flunixin meglumine', [-4])] });
    expect(nsaidGivenWithin(p, NOW, 4)).toBe(true);
  });
});
