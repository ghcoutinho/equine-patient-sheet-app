import type { ScheduledTask, ScheduleTaskKind, Patient } from '../types';

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
};

export const TASK_KIND_ICON: Record<ScheduleTaskKind, string> = {
  TPR: 'thermostat',
  PHYSICAL_EXAM: 'stethoscope',
  MEDICATION: 'syringe',
  LAB: 'science',
};

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
  ];
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
 * Saving a round completes the observations it contains: any vitals complete
 * TPR, a full set of structured findings completes the physical exam, and lab
 * values complete the lab task.
 */
export function completeTasksForRound(
  patient: Patient,
  column: { vitals?: object; labs?: object; gi?: object },
  at: Date,
): ScheduledTask[] {
  let schedule = patient.schedule ?? [];
  const has = (o: object | undefined) =>
    !!o && Object.values(o).some((v) => v !== undefined);

  if (has(column.vitals)) schedule = markDone(schedule, 'tpr', at);
  if (has(column.gi)) schedule = markDone(schedule, 'exam', at);
  if (has(column.labs)) schedule = markDone(schedule, 'labs', at);
  return schedule;
}

export const DUE_STYLES: Record<DueState, { chip: string; dot: string; label: string }> = {
  OVERDUE: { chip: 'bg-[#B91C1C] text-white', dot: 'bg-white', label: 'Overdue' },
  DUE_NOW: { chip: 'bg-[#C2410C] text-white', dot: 'bg-white', label: 'Due now' },
  SOON: { chip: 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30', dot: 'bg-[#B45309]', label: 'Soon' },
  SCHEDULED: { chip: 'bg-[#eff4ff] text-[#434655] border border-[#E2E8F0]', dot: 'bg-[#747686]', label: 'Scheduled' },
};
