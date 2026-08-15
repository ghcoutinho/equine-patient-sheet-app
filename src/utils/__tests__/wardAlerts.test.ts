import { describe, it, expect } from 'vitest';
import type { Patient, FlowsheetColumn } from '../../types';
import { wardAlert, wardAlerts, topTrigger } from '../wardAlerts';

/**
 * Ward-wide deterioration alerts — computed from the same call-surgeon
 * triggers a patient's own Flowsheet reads, not the static status/statusLabel
 * fields sample data set once and nothing ever recomputed.
 */

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
    ...over,
  }) as Patient;

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '08:00',
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

describe('wardAlert', () => {
  it('is normal for a patient with nothing charted', () => {
    expect(wardAlert(patient()).severity).toBe('normal');
  });

  it('is critical when a critical trigger fires, e.g. marked tachycardia', () => {
    const p = patient({
      flowsheetHistory: [column({ vitals: { heartRate: 110 } })],
    });
    const alert = wardAlert(p);
    expect(alert.severity).toBe('critical');
    expect(alert.triggers.some((t) => t.id === 'hr')).toBe(true);
  });

  it('is critical when SIRS criteria are met, even with no other trigger firing', () => {
    const p = patient({ sirsCriteriaMet: true });
    expect(wardAlert(p).severity).toBe('critical');
  });

  it('is warning when only a warning-severity trigger fires', () => {
    const p = patient({
      flowsheetHistory: [column({ vitals: { respiratoryRate: 32 } })],
    });
    expect(wardAlert(p).severity).toBe('warning');
  });

  it('reads from the current-admission boundary, not stale rounds from a previous stay', () => {
    const p = patient({
      currentAdmissionStartedAt: '2026-08-05T00:00:00Z',
      flowsheetHistory: [
        column({ recordedAt: '2026-05-01T00:00:00Z', vitals: { heartRate: 110 } }),
      ],
    });
    expect(wardAlert(p).severity).toBe('normal');
  });
});

describe('wardAlerts', () => {
  it('excludes a patient who has not arrived yet', () => {
    const p = patient({ lifecycle: 'AWAITING_ARRIVAL', sirsCriteriaMet: true });
    expect(wardAlerts([p])).toHaveLength(0);
  });

  it('excludes a discharged or archived patient', () => {
    const discharged = patient({ id: 'p2', lifecycle: 'DISCHARGED', sirsCriteriaMet: true });
    const archived = patient({ id: 'p3', lifecycle: 'ARCHIVED', sirsCriteriaMet: true });
    expect(wardAlerts([discharged, archived])).toHaveLength(0);
  });

  it('includes an active patient, and a legacy patient with no lifecycle field at all', () => {
    const active = patient({ id: 'p1', lifecycle: 'ACTIVE' });
    const legacy = patient({ id: 'p2', lifecycle: undefined });
    expect(wardAlerts([active, legacy]).map((a) => a.patient.id)).toEqual(['p1', 'p2']);
  });
});

describe('topTrigger', () => {
  it('picks the critical trigger over a warning one', () => {
    const t = topTrigger([
      { id: 'rr', label: 'Tachypnoea', evidence: '', rule: '', severity: 'warning' },
      { id: 'hr', label: 'Tachycardia', evidence: '', rule: '', severity: 'critical' },
    ]);
    expect(t?.id).toBe('hr');
  });

  it('is undefined for an empty list', () => {
    expect(topTrigger([])).toBeUndefined();
  });
});
