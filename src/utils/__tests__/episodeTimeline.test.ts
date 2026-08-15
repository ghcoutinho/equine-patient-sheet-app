import { describe, it, expect } from 'vitest';
import type { Patient, Treatment, FlowsheetColumn, LabPanel } from '../../types';
import { episodeTimeline } from '../episodeTimeline';

/**
 * The evolution timeline — rounds, labs and every treatment event merged
 * into one chronological feed, newest first.
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
    treatments: [],
    labPanels: [],
    ...over,
  }) as Patient;

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '08:00',
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

const labPanel = (over: Partial<LabPanel> = {}): LabPanel => ({
  id: 'lab1',
  collectedAt: at(-2),
  values: { lactate: 1.2 },
  ...over,
});

const treatment = (over: Partial<Treatment> = {}): Treatment => ({
  id: 't1',
  kind: 'MEDICATION',
  drug: 'Flunixin',
  startedAt: at(-6),
  administrations: [],
  ...over,
});

describe('episodeTimeline', () => {
  it('sorts every event newest first, across rounds, labs and treatments', () => {
    const p = patient({
      flowsheetHistory: [column({ recordedAt: at(-5), recordedBy: 'Dr A' })],
      labPanels: [labPanel({ collectedAt: at(-3) })],
      treatments: [treatment({ startedAt: at(-1) })],
    });
    const events = episodeTimeline(p);
    expect(events.map((e) => e.kind)).toEqual(['TREATMENT_STARTED', 'LAB_PANEL', 'ROUND']);
  });

  it('emits a round-edited event alongside the round, when edited', () => {
    const p = patient({
      flowsheetHistory: [
        column({ recordedAt: at(-5), recordedBy: 'Dr A', editedAt: at(-4), editedBy: 'Dr B' }),
      ],
    });
    const events = episodeTimeline(p);
    expect(events.map((e) => e.kind)).toEqual(['ROUND_EDITED', 'ROUND']);
    expect(events[0].by).toBe('Dr B');
    expect(events[1].by).toBe('Dr A');
  });

  it('never emits a round with no recordedAt — nothing to place in time', () => {
    const p = patient({ flowsheetHistory: [column({ recordedAt: undefined })] });
    expect(episodeTimeline(p)).toHaveLength(0);
  });

  it('excludes a round from before the current admission boundary', () => {
    const p = patient({
      currentAdmissionStartedAt: at(-1),
      flowsheetHistory: [column({ recordedAt: at(-10), recordedBy: 'Dr A' })],
    });
    expect(episodeTimeline(p)).toHaveLength(0);
  });

  it('flags a dose given under an early-dose override', () => {
    const t = treatment({
      administrations: [
        { id: 'a1', at: at(-1), by: 'Dr A', earlyOverrideReason: 'clinical urgency' },
      ],
    });
    const events = episodeTimeline(patient({ treatments: [t] }));
    const given = events.find((e) => e.kind === 'TREATMENT_GIVEN');
    expect(given?.flagged).toBe(true);
    expect(given?.note).toBe('clinical urgency');
  });

  it('does not flag a dose given on time', () => {
    const t = treatment({ administrations: [{ id: 'a1', at: at(-1), by: 'Dr A' }] });
    const events = episodeTimeline(patient({ treatments: [t] }));
    expect(events.find((e) => e.kind === 'TREATMENT_GIVEN')?.flagged).toBeFalsy();
  });

  it('emits every CRI event kind except START, which startedAt already covers', () => {
    const t = treatment({
      kind: 'CRI',
      startedAt: at(-6),
      criEvents: [
        { id: 'e1', kind: 'START', at: at(-6), by: 'Dr A', rateValue: 2, rateUnit: 'mL/hr' },
        { id: 'e2', kind: 'RATE_CHANGE', at: at(-4), by: 'Dr A', rateValue: 4, rateUnit: 'mL/hr' },
        { id: 'e3', kind: 'BAG_CHANGE', at: at(-2), by: 'Dr A', bagVolumeL: 1 },
        { id: 'e4', kind: 'PAUSE', at: at(-1), by: 'Dr A' },
      ],
    });
    const events = episodeTimeline(patient({ treatments: [t] }));
    const kinds = events.map((e) => e.kind);
    expect(kinds).toContain('TREATMENT_RATE_CHANGE');
    expect(kinds).toContain('TREATMENT_BAG_CHANGE');
    expect(kinds).toContain('TREATMENT_PAUSED');
    expect(kinds.filter((k) => k === 'TREATMENT_STARTED')).toHaveLength(1);
  });

  it('falls back to stoppedAt for a treatment with no STOP event in its log', () => {
    const t = treatment({ stoppedAt: at(-1), stoppedBy: 'Dr A', stopReason: 'course complete' });
    const events = episodeTimeline(patient({ treatments: [t] }));
    const stop = events.find((e) => e.kind === 'TREATMENT_STOPPED');
    expect(stop?.by).toBe('Dr A');
    expect(stop?.detail).toBe('course complete');
  });

  it('does not double-emit a stop when the CRI log already has one', () => {
    const t = treatment({
      kind: 'CRI',
      stoppedAt: at(-1),
      stoppedBy: 'Dr A',
      criEvents: [{ id: 'e1', kind: 'STOP', at: at(-1), by: 'Dr A' }],
    });
    const events = episodeTimeline(patient({ treatments: [t] }));
    expect(events.filter((e) => e.kind === 'TREATMENT_STOPPED')).toHaveLength(1);
  });
});
