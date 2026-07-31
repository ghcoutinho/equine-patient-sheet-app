import { describe, it, expect } from 'vitest';
import type { Patient } from '../../types';
import {
  ageInDays,
  ageClassFromDays,
  betweenBands,
  formatAge,
  patientAge,
  patientMark,
  sexOption,
} from '../patientIdentity';

/**
 * Patient age and identity.
 *
 * The age bands are the published study populations (0–2 d, 5–10 d, 20–32 d),
 * not tidy round numbers, and the gaps between them are real: a 3-day-old foal
 * has no measured cohort. `betweenBands` is what stops an interval measured at
 * 5–10 days being presented as if it were measured at 3.
 */

/** Noon, so a date-of-birth at midnight always yields a whole number of days. */
const NOW = new Date('2026-07-31T12:00:00');

const patient = (over: Partial<Patient> = {}): Patient =>
  ({
    id: 'p1',
    name: 'Test',
    caseNumber: 'C-1',
    breed: 'Thoroughbred',
    weightKg: 520,
    age: 'Unknown',
    location: 'Stall 1',
    status: 'ACTIVE',
    lastObsTime: '',
    flowsheetHistory: [],
    casScoreConfirmed: 0,
    casScoreMaxPending: 0,
    sirsCriteriaMet: false,
    category: 'ADULT_COLIC',
    ...over,
  }) as Patient;

describe('ageInDays', () => {
  it('counts whole days from the date of birth', () => {
    expect(ageInDays('2026-07-31', NOW)).toBe(0);
    expect(ageInDays('2026-07-30', NOW)).toBe(1);
    expect(ageInDays('2026-06-28', NOW)).toBe(33);
  });

  it('returns undefined for no date, an unparseable date, or the future', () => {
    expect(ageInDays(undefined, NOW)).toBeUndefined();
    expect(ageInDays('not-a-date', NOW)).toBeUndefined();
    expect(ageInDays('2026-08-05', NOW)).toBeUndefined();
  });
});

describe('ageClassFromDays — cohort edges', () => {
  it('holds the neonate cohort through day 2', () => {
    expect(ageClassFromDays(0)).toBe('NEONATE_0_2D');
    expect(ageClassFromDays(2)).toBe('NEONATE_0_2D');
  });

  it('moves to the 5–10 day cohort from day 3', () => {
    expect(ageClassFromDays(3)).toBe('FOAL_5_10D');
    expect(ageClassFromDays(10)).toBe('FOAL_5_10D');
  });

  it('moves to the 20–32 day cohort from day 11', () => {
    expect(ageClassFromDays(11)).toBe('FOAL_20_32D');
    expect(ageClassFromDays(32)).toBe('FOAL_20_32D');
  });

  it('falls to adult past the last published cohort', () => {
    expect(ageClassFromDays(33)).toBe('ADULT');
    expect(ageClassFromDays(3650)).toBe('ADULT');
  });

  it('has no class without an age', () => {
    expect(ageClassFromDays(undefined)).toBeUndefined();
  });
});

describe('betweenBands', () => {
  it('is true in the gaps the published cohorts do not cover', () => {
    expect(betweenBands(3)).toBe(true);
    expect(betweenBands(4)).toBe(true);
    expect(betweenBands(11)).toBe(true);
    expect(betweenBands(19)).toBe(true);
    expect(betweenBands(33)).toBe(true);
    expect(betweenBands(364)).toBe(true);
  });

  it('is false on the cohort edges themselves', () => {
    expect(betweenBands(2)).toBe(false);
    expect(betweenBands(5)).toBe(false);
    expect(betweenBands(10)).toBe(false);
    expect(betweenBands(20)).toBe(false);
    expect(betweenBands(32)).toBe(false);
    expect(betweenBands(365)).toBe(false);
  });

  it('is false without an age', () => {
    expect(betweenBands(undefined)).toBe(false);
  });
});

describe('formatAge', () => {
  it('reads naturally at each scale', () => {
    expect(formatAge(0)).toBe('born today');
    expect(formatAge(1)).toBe('1 day');
    expect(formatAge(13)).toBe('13 days');
    expect(formatAge(14)).toBe('2 weeks');
    expect(formatAge(59)).toBe('8 weeks');
    expect(formatAge(60)).toBe('2 months');
    expect(formatAge(730)).toBe('2 years');
  });

  it('adds months to years only when there are some', () => {
    expect(formatAge(365 * 7 + 60)).toBe('7 y 2 mo');
  });

  it('says so when no age is on file', () => {
    expect(formatAge(undefined)).toBe('age not recorded');
  });
});

describe('patientAge — from date of birth', () => {
  it('derives the class and is not inferred', () => {
    const a = patientAge(patient({ dateOfBirth: '2026-07-29' }), NOW);
    expect(a.days).toBe(2);
    expect(a.ageClass).toBe('NEONATE_0_2D');
    expect(a.isFoal).toBe(true);
    expect(a.inferred).toBe(false);
    expect(a.between).toBe(false);
  });

  it('marks an age that sits between two published cohorts', () => {
    const a = patientAge(patient({ dateOfBirth: '2026-07-28' }), NOW);
    expect(a.days).toBe(3);
    expect(a.ageClass).toBe('FOAL_5_10D');
    expect(a.between).toBe(true);
  });

  it('still manages a six-month-old as a foal after the cohorts run out', () => {
    const a = patientAge(patient({ dateOfBirth: '2026-02-11' }), NOW);
    expect(a.ageClass).toBe('ADULT');
    expect(a.isFoal).toBe(true);
    expect(a.between).toBe(true);
  });

  it('is not a foal past six months', () => {
    const a = patientAge(patient({ dateOfBirth: '2025-07-31' }), NOW);
    expect(a.isFoal).toBe(false);
    expect(a.ageClass).toBe('ADULT');
  });
});

describe('patientAge — legacy records with no date of birth', () => {
  it('falls back to the free-text age and flags the class as inferred', () => {
    const a = patientAge(patient({ isFoal: true, age: '6 days' }), NOW);
    expect(a.inferred).toBe(true);
    expect(a.days).toBeUndefined();
    expect(a.ageClass).toBe('FOAL_5_10D');
    expect(a.isFoal).toBe(true);
    expect(a.label).toBe('6 days');
    expect(a.between).toBe(false);
  });

  it('treats a neonatal-foal category as a foal even without the flag', () => {
    const a = patientAge(patient({ category: 'NEONATAL_FOAL', age: '2 days' }), NOW);
    expect(a.isFoal).toBe(true);
    expect(a.ageClass).toBe('NEONATE_0_2D');
  });

  it('is an adult when nothing marks it a foal', () => {
    const a = patientAge(patient({ age: '7 years' }), NOW);
    expect(a.ageClass).toBe('ADULT');
    expect(a.isFoal).toBe(false);
    expect(a.label).toBe('7 years');
  });

  it('says the age is not recorded rather than printing "Unknown"', () => {
    expect(patientAge(patient({ age: 'Unknown' }), NOW).label).toBe('age not recorded');
    expect(patientAge(patient({ age: '' }), NOW).label).toBe('age not recorded');
  });

  it('a future date of birth falls back rather than reporting a negative age', () => {
    const a = patientAge(patient({ dateOfBirth: '2026-08-05', age: '3 years' }), NOW);
    expect(a.inferred).toBe(true);
    expect(a.days).toBeUndefined();
  });
});

describe('patientMark', () => {
  it('draws a foal as a horse head and an adult as a horseshoe', () => {
    expect(patientMark(patient({ dateOfBirth: '2026-07-29' }), NOW).shape).toBe('horsehead');
    expect(patientMark(patient({ dateOfBirth: '2020-01-01' }), NOW).shape).toBe('horseshoe');
  });

  it('describes the patient with sex and age', () => {
    const m = patientMark(patient({ sex: 'MARE', dateOfBirth: '2020-01-01' }), NOW);
    expect(m.symbol).toBe('♀');
    expect(m.description).toContain('Mare');
  });

  it('says the sex is not recorded rather than guessing', () => {
    const m = patientMark(patient({ age: '7 years' }), NOW);
    expect(m.description).toContain('Sex not recorded');
  });
});

describe('sexOption', () => {
  it('falls back to the not-recorded option for an unknown or absent sex', () => {
    expect(sexOption(undefined).value).toBe('UNKNOWN');
    expect(sexOption('GELDING').symbol).toBe('⚲');
    expect(sexOption('FILLY').juvenile).toBe(true);
  });
});
