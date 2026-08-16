import type { ScheduledTask, ScheduleTaskKind, Patient, GIData } from '../types';
import { SALMONELLA_SURVEILLANCE } from '../data/salmonella';

/**
 * Monitoring schedule and "next due" computation.
 *
 * The ward works to intervals — TPR q2h, full physical q4h, antimicrobials
 * q6h — and the thing a clinician most wants from a flowsheet at a glance is
 * what is coming next and whether anything is late. That is computed here
 * rather than in the view so the board, the flowsheet and any future handover
 * sheet all read the same numbers.
 */

export type DueState = 'OVERDUE' | 'DUE_NOW' | 'SOON' | 'SCHEDULED';

export interface DueTask {
  task: ScheduledTask;
  /** Milliseconds until due; negative when overdue. */
  dueInMs: number;
  dueAt: Date;
  state: DueState;
  /** "in 45 min", "12 min late". */
  label: string;
}

export const TASK_KIND_LABEL: Record<ScheduleTaskKind, string> = {
  TPR: 'TPR',
  PHYSICAL_EXAM: 'Physical exam',
  MEDICATION: 'Medication',
  LAB: 'Lab',
  NG_TUBE: 'NG tube reassessment',
  SALMONELLA: 'Salmonella resample',
};

export const TASK_KIND_ICON: Record<ScheduleTaskKind, string> = {
  TPR: 'thermostat',
  PHYSICAL_EXAM: 'stethoscope',
  MEDICATION: 'syringe',
  LAB: 'science',
  NG_TUBE: 'timer',
  SALMONELLA: 'coronavirus',
};

/**
 * Ward convention, not a published figure — supplied by the attending
 * clinician (2026-08-14), the same way INSENSIBLE_LOSS was.
 */
export const NG_TUBE_REASSESSMENT_HOURS = 2;

/** Sensible starting schedule for a newly admitted patient. */
export function defaultSchedule(isFoal: boolean): ScheduledTask[] {
  return [
    { id: 'tpr', kind: 'TPR', label: 'TPR', intervalHours: isFoal ? 2 : 4, active: true },
    {
      id: 'exam',
      kind: 'PHYSICAL_EXAM',
      label: 'Full physical exam',
      intervalHours: isFoal ? 6 : 12,
      active: true,
    },
    { id: 'labs', kind: 'LAB', label: 'Lactate / PCV / TP', intervalHours: 12, active: true },
    // Bauck 2023: collected on every colic admission, not just clinically
    // suspected ones — never `lastDoneAt`, so it's due immediately until the
    // first sample is logged.
    {
      id: 'salmonella',
      kind: 'SALMONELLA',
      label: TASK_KIND_LABEL.SALMONELLA,
      intervalHours: SALMONELLA_SURVEILLANCE.routineIntervalHours,
      active: true,
    },
  ];
}

/**
 * Setting or clearing isolation status retunes the resample interval
 * immediately (72h routine / 12h isolated) rather than waiting for the next
 * sample to be logged — the point of isolation is to sample *more often*
 * starting now, not from whenever the next result happens to land.
 */
export function setSalmonellaIsolation(
  schedule: ScheduledTask[] | undefined,
  isolation: boolean,
): ScheduledTask[] {
  return (schedule ?? []).map((t) =>
    t.id === 'salmonella'
      ? {
          ...t,
          intervalHours: isolation
            ? SALMONELLA_SURVEILLANCE.isolationIntervalHours
            : SALMONELLA_SURVEILLANCE.routineIntervalHours,
        }
      : t,
  );
}

const MIN = 60_000;
const HOUR = 60 * MIN;

function humanise(ms: number): string {
  const abs = Math.abs(ms);
  const mins = Math.round(abs / MIN);
  const text =
    mins < 60
      ? `${mins} min`
      : `${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ''}`;
  return ms < 0 ? `${text} late` : `in ${text}`;
}

/**
 * Compute due state for every active task.
 *
 * `now` is injected rather than read from the clock so this is testable and so
 * the caller controls re-render cadence.
 */
export function computeDue(tasks: ScheduledTask[] | undefined, now: Date): DueTask[] {
  if (!tasks?.length) return [];
  return tasks
    .filter((t) => t.active)
    .map((t) => {
      // With no recorded completion the task is due immediately.
      const anchor = t.lastDoneAt ? new Date(t.lastDoneAt).getTime() : now.getTime();
      const dueAtMs = t.lastDoneAt ? anchor + t.intervalHours * HOUR : now.getTime();
      const dueInMs = dueAtMs - now.getTime();

      let state: DueState;
      if (dueInMs < -5 * MIN) state = 'OVERDUE';
      else if (dueInMs <= 5 * MIN) state = 'DUE_NOW';
      else if (dueInMs <= 30 * MIN) state = 'SOON';
      else state = 'SCHEDULED';

      return {
        task: t,
        dueInMs,
        dueAt: new Date(dueAtMs),
        state,
        label: t.lastDoneAt ? humanise(dueInMs) : 'not yet recorded',
      };
    })
    .sort((a, b) => a.dueInMs - b.dueInMs);
}

/** The single most pressing task, for the flowsheet's "next due" column. */
export function nextDue(tasks: ScheduledTask[] | undefined, now: Date): DueTask | undefined {
  return computeDue(tasks, now)[0];
}

/** Mark a task done, returning a new schedule array. */
export function markDone(
  tasks: ScheduledTask[] | undefined,
  taskId: string,
  at: Date,
): ScheduledTask[] {
  return (tasks ?? []).map((t) =>
    t.id === taskId ? { ...t, lastDoneAt: at.toISOString() } : t,
  );
}

/**
 * The NG-tube task exists only while a tube is actually in — charted, not
 * assumed. "In place" opens it (or resets its clock, if it's already
 * running); "Not placed"/"Removed" closes it. A round that doesn't touch the
 * nasogastric-tube field at all leaves the schedule untouched — silence
 * about the tube this round is not evidence it came out (rule 2).
 */
function upsertNgTubeTask(
  schedule: ScheduledTask[],
  nasogastricTube: string | undefined,
  at: Date,
): ScheduledTask[] {
  if (nasogastricTube === 'In place') {
    const existing = schedule.find((t) => t.id === 'ngTube');
    if (existing) return markDone(schedule, 'ngTube', at);
    return [
      ...schedule,
      {
        id: 'ngTube',
        kind: 'NG_TUBE',
        label: TASK_KIND_LABEL.NG_TUBE,
        intervalHours: NG_TUBE_REASSESSMENT_HOURS,
        active: true,
        lastDoneAt: at.toISOString(),
      },
    ];
  }
  if (nasogastricTube === 'Not placed' || nasogastricTube === 'Removed') {
    return schedule.map((t) => (t.id === 'ngTube' ? { ...t, active: false } : t));
  }
  return schedule;
}

/**
 * Saving a round completes the observations it contains: any vitals complete
 * TPR, a full set of structured findings completes the physical exam, and lab
 * values complete the lab task. Charting the nasogastric tube as in place
 * opens or resets its own reassessment timer.
 */
export function completeTasksForRound(
  patient: Patient,
  column: { vitals?: object; labs?: object; gi?: Partial<GIData> },
  at: Date,
): ScheduledTask[] {
  let schedule = patient.schedule ?? [];
  const has = (o: object | undefined) =>
    !!o && Object.values(o).some((v) => v !== undefined);

  if (has(column.vitals)) schedule = markDone(schedule, 'tpr', at);
  if (has(column.gi)) schedule = markDone(schedule, 'exam', at);
  if (has(column.labs)) schedule = markDone(schedule, 'labs', at);
  schedule = upsertNgTubeTask(schedule, column.gi?.nasogastricTube, at);
  return schedule;
}

export const DUE_STYLES: Record<DueState, { chip: string; dot: string; label: string }> = {
  OVERDUE: { chip: 'bg-[#B91C1C] text-white', dot: 'bg-white', label: 'Overdue' },
  DUE_NOW: { chip: 'bg-[#C2410C] text-white', dot: 'bg-white', label: 'Due now' },
  SOON: { chip: 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30', dot: 'bg-[#B45309]', label: 'Soon' },
  SCHEDULED: { chip: 'bg-[#eff4ff] text-[#434655] border border-[#E2E8F0]', dot: 'bg-[#747686]', label: 'Scheduled' },
};
