import { describe, it, expect } from 'vitest';
import type { Treatment } from '../../types';
import {
  intervalFromFrequency,
  normaliseRoute,
  treatmentStatus,
  orderedTreatments,
  upcomingDoses,
  runningLines,
  activeInfusions,
  lastAdministration,
  formatDuration,
} from '../treatments';

/**
 * The treatment sheet.
 *
 * Two kinds of order are being tracked: intermittent drugs, which have a next
 * dose, and continuous lines, which have a running time and no next dose.
 * Confusing the two is what the state machine here exists to prevent.
 */

const NOW = new Date('2026-07-31T12:00:00Z');
const MIN = 60_000;
const HOUR = 60 * MIN;

const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();

const treatment = (over: Partial<Treatment> = {}): Treatment => ({
  id: 't1',
  kind: 'MEDICATION',
  drug: 'Flunixin',
  startedAt: at(0),
  administrations: [],
  ...over,
});

describe('intervalFromFrequency', () => {
  it('reads the q-notation', () => {
    expect(intervalFromFrequency('q6h')).toBe(6);
    expect(intervalFromFrequency('q12h')).toBe(12);
    expect(intervalFromFrequency('q 8 h')).toBe(8);
  });

  it('resolves a range to the shorter, more frequent interval', () => {
    // Under-dosing an antimicrobial is the worse error, so q8-12h means q8h.
    expect(intervalFromFrequency('q8-12h')).toBe(8);
    expect(intervalFromFrequency('q6-8h')).toBe(6);
  });

  it('reads the Latin abbreviations', () => {
    expect(intervalFromFrequency('BID')).toBe(12);
    expect(intervalFromFrequency('bid')).toBe(12);
    expect(intervalFromFrequency('TID')).toBe(8);
    expect(intervalFromFrequency('QID')).toBe(6);
    expect(intervalFromFrequency('SID')).toBe(24);
    expect(intervalFromFrequency('once daily')).toBe(24);
  });

  it('gives a CRI no interval at all — an infusion has a rate, not a schedule', () => {
    expect(intervalFromFrequency('CRI')).toBeUndefined();
    expect(intervalFromFrequency('continuous rate infusion')).toBeUndefined();
    expect(intervalFromFrequency('constant infusion')).toBeUndefined();
  });

  it('returns undefined rather than guessing at anything else', () => {
    expect(intervalFromFrequency('PRN')).toBeUndefined();
    expect(intervalFromFrequency('once')).toBeUndefined();
    expect(intervalFromFrequency('')).toBeUndefined();
    expect(intervalFromFrequency(undefined)).toBeUndefined();
  });
});

describe('normaliseRoute', () => {
  it('keeps a canonical route as it is, whatever the case', () => {
    expect(normaliseRoute('IV')).toBe('IV');
    expect(normaliseRoute('iv')).toBe('IV');
    expect(normaliseRoute('IV CRI')).toBe('IV CRI');
  });

  it('folds the punctuated and alias spellings together', () => {
    expect(normaliseRoute('I.V.')).toBe('IV');
    expect(normaliseRoute('SQ')).toBe('SC');
    expect(normaliseRoute('NG')).toBe('Via nasogastric tube');
    expect(normaliseRoute('IO')).toBe('Intraosseous');
    expect(normaliseRoute('CRI')).toBe('IV CRI');
  });

  it('defaults an absent route to IV and passes anything unrecognised through', () => {
    expect(normaliseRoute(undefined)).toBe('IV');
    expect(normaliseRoute('')).toBe('IV');
    expect(normaliseRoute('Intrathecal')).toBe('Intrathecal');
  });
});

describe('treatmentStatus — intermittent orders', () => {
  const q6 = (lastGivenOffsetMs?: number): Treatment =>
    treatment({
      intervalHours: 6,
      startedAt: at(-6 * HOUR),
      administrations:
        lastGivenOffsetMs === undefined
          ? []
          : [{ id: 'a1', at: at(lastGivenOffsetMs), by: 'Dr Test' }],
    });

  it('is OVERDUE only past five minutes late', () => {
    expect(treatmentStatus(q6(-6 * HOUR - 5 * MIN - 1), NOW).state).toBe('OVERDUE');
    expect(treatmentStatus(q6(-6 * HOUR - 5 * MIN), NOW).state).toBe('DUE_NOW');
  });

  it('is DUE_NOW across the five-minute window either side', () => {
    expect(treatmentStatus(q6(-6 * HOUR), NOW).state).toBe('DUE_NOW');
    expect(treatmentStatus(q6(-6 * HOUR + 5 * MIN), NOW).state).toBe('DUE_NOW');
  });

  it('is DUE_SOON out to the full hour, then simply RUNNING', () => {
    expect(treatmentStatus(q6(-6 * HOUR + 5 * MIN + 1), NOW).state).toBe('DUE_SOON');
    expect(treatmentStatus(q6(-5 * HOUR), NOW).state).toBe('DUE_SOON');
    expect(treatmentStatus(q6(-5 * HOUR + 1), NOW).state).toBe('RUNNING');
  });

  it('counts from the last dose actually given, not from the start time', () => {
    const s = treatmentStatus(q6(-2 * HOUR), NOW);
    expect(s.nextDueAt?.toISOString()).toBe(at(4 * HOUR));
    expect(s.lastGivenAt?.toISOString()).toBe(at(-2 * HOUR));
    expect(s.label).toBe('in 4 h');
  });

  it('falls back to the start time when nothing has been given yet', () => {
    const s = treatmentStatus(q6(), NOW);
    expect(s.lastGivenAt).toBeUndefined();
    expect(s.nextDueAt?.toISOString()).toBe(at(0));
    expect(s.state).toBe('DUE_NOW');
  });

  it('reports lateness as late', () => {
    expect(treatmentStatus(q6(-8 * HOUR), NOW).label).toBe('2 h late');
  });
});

describe('treatmentStatus — continuous lines and closed orders', () => {
  it('a line with no interval is simply running, with no next dose', () => {
    const s = treatmentStatus(treatment({ kind: 'CRI', startedAt: at(-90 * MIN) }), NOW);
    expect(s.state).toBe('RUNNING');
    expect(s.nextDueAt).toBeUndefined();
    expect(s.label).toBe('running 1 h 30 min');
    expect(s.runningForMs).toBe(90 * MIN);
  });

  it('a stopped order reports how long it ran and stays on the sheet', () => {
    const s = treatmentStatus(
      treatment({ startedAt: at(-8 * HOUR), stoppedAt: at(-2 * HOUR) }),
      NOW,
    );
    expect(s.state).toBe('STOPPED');
    expect(s.label).toBe('ran 6 h');
    expect(s.runningForMs).toBe(6 * HOUR);
  });

  it('an order timed for later has not started', () => {
    const s = treatmentStatus(treatment({ startedAt: at(2 * HOUR), intervalHours: 6 }), NOW);
    expect(s.state).toBe('NOT_STARTED');
    expect(s.label).toContain('starts');
  });
});

describe('lastAdministration', () => {
  it('is the most recent dose regardless of the order they were recorded in', () => {
    const t = treatment({
      administrations: [
        { id: 'a1', at: at(-6 * HOUR), by: 'Dr Test' },
        { id: 'a3', at: at(-1 * HOUR), by: 'Dr Test' },
        { id: 'a2', at: at(-3 * HOUR), by: 'Dr Test' },
      ],
    });
    expect(lastAdministration(t)?.id).toBe('a3');
  });

  it('is undefined when nothing has been given', () => {
    expect(lastAdministration(treatment())).toBeUndefined();
    expect(lastAdministration(treatment({ administrations: [] }))).toBeUndefined();
  });
});

describe('upcomingDoses', () => {
  it('projects forward at the order interval and stops at the horizon', () => {
    const doses = upcomingDoses([treatment({ intervalHours: 6, startedAt: at(0) })], NOW, 24);
    expect(doses).toHaveLength(4);
    expect(doses.map((d) => d.ordinal)).toEqual([1, 2, 3, 4]);
    expect(doses[0].at.toISOString()).toBe(at(6 * HOUR));
    expect(doses[3].at.toISOString()).toBe(at(24 * HOUR));
  });

  it('caps the projection at 24 doses so a frequent order cannot flood the view', () => {
    // Every 30 minutes over a 24 hour horizon would be 48 doses.
    const doses = upcomingDoses([treatment({ intervalHours: 0.5, startedAt: at(0) })], NOW, 24);
    expect(doses).toHaveLength(24);
    expect(doses[23].at.toISOString()).toBe(at(12 * HOUR));
  });

  it('honours a shorter horizon', () => {
    expect(upcomingDoses([treatment({ intervalHours: 6, startedAt: at(0) })], NOW, 12)).toHaveLength(2);
  });

  it('marks a dose that is already late', () => {
    const doses = upcomingDoses(
      [treatment({ intervalHours: 6, startedAt: at(-8 * HOUR) })],
      NOW,
      24,
    );
    expect(doses[0].overdue).toBe(true);
    expect(doses[1].overdue).toBe(false);
  });

  it('projects nothing for a continuous line or a stopped order', () => {
    expect(upcomingDoses([treatment({ kind: 'CRI' })], NOW, 24)).toEqual([]);
    expect(
      upcomingDoses([treatment({ intervalHours: 6, stoppedAt: at(-1 * HOUR) })], NOW, 24),
    ).toEqual([]);
    expect(upcomingDoses(undefined, NOW, 24)).toEqual([]);
  });

  it('interleaves several orders in time order', () => {
    const doses = upcomingDoses(
      [
        treatment({ id: 'a', intervalHours: 8, startedAt: at(0) }),
        treatment({ id: 'b', intervalHours: 6, startedAt: at(0) }),
      ],
      NOW,
      12,
    );
    // b is q6h (+6, +12), a is q8h (+8) — merged into one ordered list.
    expect(doses.map((d) => d.treatment.id)).toEqual(['b', 'a', 'b']);
    expect(doses.map((d) => d.at.toISOString())).toEqual([
      at(6 * HOUR),
      at(8 * HOUR),
      at(12 * HOUR),
    ]);
  });
});

describe('runningLines and activeInfusions', () => {
  it('lists only open continuous lines, longest running first', () => {
    const lines = runningLines(
      [
        treatment({ id: 'short', startedAt: at(-1 * HOUR) }),
        treatment({ id: 'long', startedAt: at(-9 * HOUR) }),
        treatment({ id: 'intermittent', intervalHours: 6 }),
        treatment({ id: 'closed', stoppedAt: at(-1 * HOUR) }),
      ],
      NOW,
    );
    expect(lines.map((l) => l.treatment.id)).toEqual(['long', 'short']);
    expect(lines[0].runningForMs).toBe(9 * HOUR);
  });

  it('activeInfusions agrees on which lines are up', () => {
    const ts = [
      treatment({ id: 'cri' }),
      treatment({ id: 'intermittent', intervalHours: 6 }),
      treatment({ id: 'closed', stoppedAt: at(-1 * HOUR) }),
    ];
    expect(activeInfusions(ts).map((t) => t.id)).toEqual(['cri']);
    expect(activeInfusions(undefined)).toEqual([]);
  });
});

describe('orderedTreatments', () => {
  it('reads the way the ward does: late first, stopped last', () => {
    const ts = [
      treatment({ id: 'stopped', stoppedAt: at(-1 * HOUR) }),
      treatment({ id: 'running', kind: 'CRI' }),
      treatment({ id: 'overdue', intervalHours: 6, startedAt: at(-9 * HOUR) }),
      treatment({ id: 'notStarted', startedAt: at(2 * HOUR), intervalHours: 6 }),
      treatment({ id: 'dueNow', intervalHours: 6, startedAt: at(-6 * HOUR) }),
    ];
    expect(orderedTreatments(ts, NOW).map((s) => s.treatment.id)).toEqual([
      'overdue',
      'dueNow',
      'running',
      'notStarted',
      'stopped',
    ]);
  });

  it('is empty for no treatments', () => {
    expect(orderedTreatments(undefined, NOW)).toEqual([]);
  });
});

describe('formatDuration', () => {
  it('scales from minutes to days', () => {
    expect(formatDuration(45 * MIN)).toBe('45 min');
    expect(formatDuration(90 * MIN)).toBe('1 h 30 min');
    expect(formatDuration(6 * HOUR)).toBe('6 h');
    expect(formatDuration(50 * HOUR)).toBe('2 d 2 h');
  });

  it('reads a negative span by magnitude, so callers can add "late"', () => {
    expect(formatDuration(-12 * MIN)).toBe('12 min');
  });
});
