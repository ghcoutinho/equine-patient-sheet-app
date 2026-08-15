import { describe, it, expect } from 'vitest';
import type { Patient, ScheduledTask } from '../../types';
import {
  computeDue,
  nextDue,
  markDone,
  completeTasksForRound,
  defaultSchedule,
} from '../schedule';

/**
 * Monitoring schedule.
 *
 * `now` is injected, so the due-state edges can be pinned exactly rather than
 * raced against the clock. The edges matter: a task one millisecond the wrong
 * side of a boundary changes the colour of a chip on the ward board.
 */

const NOW = new Date('2026-07-31T12:00:00Z');
const MIN = 60_000;
const HOUR = 60 * MIN;

/** A task whose next dose lands exactly `dueInMs` from NOW. */
const dueIn = (dueInMs: number, over: Partial<ScheduledTask> = {}): ScheduledTask => ({
  id: 'tpr',
  kind: 'TPR',
  label: 'TPR',
  intervalHours: 4,
  active: true,
  lastDoneAt: new Date(NOW.getTime() + dueInMs - 4 * HOUR).toISOString(),
  ...over,
});

describe('computeDue — state boundaries', () => {
  it('is OVERDUE only past five minutes late', () => {
    expect(computeDue([dueIn(-5 * MIN - 1)], NOW)[0].state).toBe('OVERDUE');
    // Exactly five minutes late is still DUE_NOW.
    expect(computeDue([dueIn(-5 * MIN)], NOW)[0].state).toBe('DUE_NOW');
  });

  it('is DUE_NOW across the five-minute window either side', () => {
    expect(computeDue([dueIn(0)], NOW)[0].state).toBe('DUE_NOW');
    expect(computeDue([dueIn(5 * MIN)], NOW)[0].state).toBe('DUE_NOW');
  });

  it('is SOON from just past five minutes to thirty', () => {
    expect(computeDue([dueIn(5 * MIN + 1)], NOW)[0].state).toBe('SOON');
    expect(computeDue([dueIn(30 * MIN)], NOW)[0].state).toBe('SOON');
  });

  it('is SCHEDULED past thirty minutes', () => {
    expect(computeDue([dueIn(30 * MIN + 1)], NOW)[0].state).toBe('SCHEDULED');
    expect(computeDue([dueIn(4 * HOUR)], NOW)[0].state).toBe('SCHEDULED');
  });
});

describe('computeDue — behaviour', () => {
  it('treats a task with no recorded completion as due now, and says so', () => {
    const task: ScheduledTask = {
      id: 'tpr',
      kind: 'TPR',
      label: 'TPR',
      intervalHours: 4,
      active: true,
    };
    const [d] = computeDue([task], NOW);
    expect(d.state).toBe('DUE_NOW');
    expect(d.dueInMs).toBe(0);
    // It must not claim a time nobody recorded.
    expect(d.label).toBe('not yet recorded');
  });

  it('humanises the wait, and marks lateness as late', () => {
    expect(computeDue([dueIn(45 * MIN)], NOW)[0].label).toBe('in 45 min');
    expect(computeDue([dueIn(-12 * MIN)], NOW)[0].label).toBe('12 min late');
    expect(computeDue([dueIn(90 * MIN)], NOW)[0].label).toBe('in 1 h 30 min');
    expect(computeDue([dueIn(2 * HOUR)], NOW)[0].label).toBe('in 2 h');
  });

  it('drops inactive tasks', () => {
    const tasks = [dueIn(0), dueIn(0, { id: 'exam', active: false })];
    expect(computeDue(tasks, NOW)).toHaveLength(1);
  });

  it('sorts most pressing first', () => {
    const tasks = [
      dueIn(2 * HOUR, { id: 'labs' }),
      dueIn(-30 * MIN, { id: 'tpr' }),
      dueIn(10 * MIN, { id: 'exam' }),
    ];
    expect(computeDue(tasks, NOW).map((d) => d.task.id)).toEqual(['tpr', 'exam', 'labs']);
  });

  it('returns nothing for an empty or absent schedule', () => {
    expect(computeDue([], NOW)).toEqual([]);
    expect(computeDue(undefined, NOW)).toEqual([]);
  });
});

describe('nextDue', () => {
  it('is the single most pressing task', () => {
    const tasks = [dueIn(2 * HOUR, { id: 'labs' }), dueIn(-30 * MIN, { id: 'tpr' })];
    expect(nextDue(tasks, NOW)?.task.id).toBe('tpr');
  });

  it('is undefined when there is nothing scheduled', () => {
    expect(nextDue(undefined, NOW)).toBeUndefined();
    expect(nextDue([dueIn(0, { active: false })], NOW)).toBeUndefined();
  });
});

describe('markDone', () => {
  it('anchors the named task to the completion time and leaves the rest alone', () => {
    const tasks = [dueIn(0), dueIn(0, { id: 'labs', kind: 'LAB' })];
    const updated = markDone(tasks, 'tpr', NOW);
    expect(updated[0].lastDoneAt).toBe(NOW.toISOString());
    expect(updated[1].lastDoneAt).toBe(tasks[1].lastDoneAt);
  });

  it('does not mutate the array it was given', () => {
    const tasks = [dueIn(0)];
    const before = tasks[0].lastDoneAt;
    markDone(tasks, 'tpr', NOW);
    expect(tasks[0].lastDoneAt).toBe(before);
  });

  it('is a no-op for an unknown task id, and safe on no schedule', () => {
    expect(markDone([dueIn(0)], 'nope', NOW)[0].lastDoneAt).not.toBe(NOW.toISOString());
    expect(markDone(undefined, 'tpr', NOW)).toEqual([]);
  });
});

describe('completeTasksForRound', () => {
  const withSchedule = (): Patient =>
    ({
      schedule: [
        { id: 'tpr', kind: 'TPR', label: 'TPR', intervalHours: 4, active: true },
        { id: 'exam', kind: 'PHYSICAL_EXAM', label: 'Exam', intervalHours: 12, active: true },
        { id: 'labs', kind: 'LAB', label: 'Labs', intervalHours: 12, active: true },
      ],
    }) as Patient;

  const doneAt = (s: ScheduledTask[], id: string) => s.find((t) => t.id === id)?.lastDoneAt;

  it('completes only the observations the round actually contains', () => {
    const s = completeTasksForRound(withSchedule(), { vitals: { heartRate: 44 } }, NOW);
    expect(doneAt(s, 'tpr')).toBe(NOW.toISOString());
    expect(doneAt(s, 'exam')).toBeUndefined();
    expect(doneAt(s, 'labs')).toBeUndefined();
  });

  it('completes each task from its own section', () => {
    const s = completeTasksForRound(
      withSchedule(),
      { vitals: { heartRate: 44 }, gi: { motility: 'Normal' }, labs: { lactate: 1.2 } },
      NOW,
    );
    expect(doneAt(s, 'tpr')).toBe(NOW.toISOString());
    expect(doneAt(s, 'exam')).toBe(NOW.toISOString());
    expect(doneAt(s, 'labs')).toBe(NOW.toISOString());
  });

  it('does not complete a task from a section that is present but empty', () => {
    const s = completeTasksForRound(withSchedule(), { vitals: {}, labs: { lactate: undefined } }, NOW);
    expect(doneAt(s, 'tpr')).toBeUndefined();
    expect(doneAt(s, 'labs')).toBeUndefined();
  });

  it('opens an NG-tube reassessment task when the tube is charted in place', () => {
    const s = completeTasksForRound(
      withSchedule(),
      { gi: { nasogastricTube: 'In place' } },
      NOW,
    );
    const task = s.find((t) => t.id === 'ngTube');
    expect(task?.active).toBe(true);
    expect(task?.intervalHours).toBe(2);
    expect(task?.lastDoneAt).toBe(NOW.toISOString());
  });

  it('resets the NG-tube clock on a later round that still finds it in place', () => {
    const withTube: Patient = {
      ...withSchedule(),
      schedule: [
        ...withSchedule().schedule!,
        {
          id: 'ngTube',
          kind: 'NG_TUBE',
          label: 'NG tube reassessment',
          intervalHours: 2,
          active: true,
          lastDoneAt: new Date(NOW.getTime() - HOUR).toISOString(),
        },
      ],
    };
    const later = new Date(NOW.getTime() + HOUR);
    const s = completeTasksForRound(withTube, { gi: { nasogastricTube: 'In place' } }, later);
    expect(doneAt(s, 'ngTube')).toBe(later.toISOString());
  });

  it('closes the NG-tube task when the tube is charted removed', () => {
    const withTube: Patient = {
      ...withSchedule(),
      schedule: [
        ...withSchedule().schedule!,
        {
          id: 'ngTube',
          kind: 'NG_TUBE',
          label: 'NG tube reassessment',
          intervalHours: 2,
          active: true,
          lastDoneAt: NOW.toISOString(),
        },
      ],
    };
    const s = completeTasksForRound(withTube, { gi: { nasogastricTube: 'Removed' } }, NOW);
    expect(s.find((t) => t.id === 'ngTube')?.active).toBe(false);
  });

  it('leaves the NG-tube schedule untouched when the round does not chart the field at all', () => {
    const withTube: Patient = {
      ...withSchedule(),
      schedule: [
        ...withSchedule().schedule!,
        {
          id: 'ngTube',
          kind: 'NG_TUBE',
          label: 'NG tube reassessment',
          intervalHours: 2,
          active: true,
          lastDoneAt: new Date(NOW.getTime() - HOUR).toISOString(),
        },
      ],
    };
    const s = completeTasksForRound(withTube, { vitals: { heartRate: 40 } }, NOW);
    expect(doneAt(s, 'ngTube')).toBe(new Date(NOW.getTime() - HOUR).toISOString());
  });

  it('never opens an NG-tube task from a round that never mentions one', () => {
    const s = completeTasksForRound(withSchedule(), { vitals: { heartRate: 40 } }, NOW);
    expect(s.find((t) => t.id === 'ngTube')).toBeUndefined();
  });
});

describe('defaultSchedule', () => {
  it('monitors a foal more closely than an adult', () => {
    const foal = defaultSchedule(true);
    const adult = defaultSchedule(false);
    expect(foal.find((t) => t.id === 'tpr')?.intervalHours).toBe(2);
    expect(adult.find((t) => t.id === 'tpr')?.intervalHours).toBe(4);
    expect(foal.find((t) => t.id === 'exam')?.intervalHours).toBe(6);
    expect(adult.find((t) => t.id === 'exam')?.intervalHours).toBe(12);
  });

  it('starts every task active and with no completion recorded', () => {
    const s = defaultSchedule(false);
    expect(s.every((t) => t.active)).toBe(true);
    expect(s.every((t) => t.lastDoneAt === undefined)).toBe(true);
  });
});
