import { describe, it, expect } from 'vitest';
import type { Patient, FlowsheetColumn } from '../../types';
import { columnsInCurrentAdmission, earlierAdmissionColumnCount, latestColumn } from '../admission';

/**
 * Admission boundary.
 *
 * The scenario this guards against: a horse discharged in May and
 * reactivated in August resumes charting onto the same flowsheetHistory
 * array. Without a boundary, "most recent round" would read May's numbers
 * into August's score. currentAdmissionStartedAt marks where the current
 * stay begins without deleting anything from before it.
 */

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
    sirsCriteriaMet: false,
    category: 'ADULT_COLIC',
    gender: 'Mare',
    admissionDate: '2026-08-01',
    owner: { name: 'Not recorded' },
    ...over,
  }) as Patient;

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn =>
  ({
    time: '08:00',
    vitals: {},
    gi: {},
    labs: {},
    ...over,
  }) as FlowsheetColumn;

describe('columnsInCurrentAdmission', () => {
  it('returns every round when no boundary is set (legacy patient)', () => {
    const p = patient({
      flowsheetHistory: [column({ recordedAt: '2026-05-01T08:00:00Z' }), column({ recordedAt: '2026-08-01T08:00:00Z' })],
    });
    expect(columnsInCurrentAdmission(p)).toHaveLength(2);
  });

  it('excludes rounds recorded before the boundary', () => {
    const may = column({ recordedAt: '2026-05-01T08:00:00Z' });
    const august = column({ recordedAt: '2026-08-01T08:00:00Z' });
    const p = patient({
      flowsheetHistory: [may, august],
      currentAdmissionStartedAt: '2026-08-01T00:00:00Z',
    });
    expect(columnsInCurrentAdmission(p)).toEqual([august]);
  });

  it('includes a round recorded exactly at the boundary', () => {
    const boundary = '2026-08-01T00:00:00Z';
    const onBoundary = column({ recordedAt: boundary });
    const p = patient({ flowsheetHistory: [onBoundary], currentAdmissionStartedAt: boundary });
    expect(columnsInCurrentAdmission(p)).toEqual([onBoundary]);
  });

  it('never hides a round that has no recordedAt, even with a boundary set', () => {
    const untimed = column({ recordedAt: undefined });
    const p = patient({ flowsheetHistory: [untimed], currentAdmissionStartedAt: '2026-08-01T00:00:00Z' });
    expect(columnsInCurrentAdmission(p)).toEqual([untimed]);
  });
});

describe('earlierAdmissionColumnCount', () => {
  it('counts the rounds hidden by the current boundary', () => {
    const p = patient({
      flowsheetHistory: [
        column({ recordedAt: '2026-05-01T08:00:00Z' }),
        column({ recordedAt: '2026-05-02T08:00:00Z' }),
        column({ recordedAt: '2026-08-01T08:00:00Z' }),
      ],
      currentAdmissionStartedAt: '2026-08-01T00:00:00Z',
    });
    expect(earlierAdmissionColumnCount(p)).toBe(2);
  });

  it('is zero for a legacy patient with no boundary', () => {
    const p = patient({ flowsheetHistory: [column(), column()] });
    expect(earlierAdmissionColumnCount(p)).toBe(0);
  });
});

describe('latestColumn', () => {
  it('never resurrects a stale round from a previous admission', () => {
    const mayLast = column({ recordedAt: '2026-05-15T08:00:00Z', vitals: { heartRate: 90 } });
    const p = patient({
      flowsheetHistory: [mayLast],
      currentAdmissionStartedAt: '2026-08-01T00:00:00Z',
    });
    expect(latestColumn(p)).toBeUndefined();
  });

  it('returns the most recent round of the current admission', () => {
    const early = column({ recordedAt: '2026-08-01T08:00:00Z', vitals: { heartRate: 40 } });
    const late = column({ recordedAt: '2026-08-01T14:00:00Z', vitals: { heartRate: 44 } });
    const p = patient({
      flowsheetHistory: [early, late],
      currentAdmissionStartedAt: '2026-08-01T00:00:00Z',
    });
    expect(latestColumn(p)).toBe(late);
  });
});
