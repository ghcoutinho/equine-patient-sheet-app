import type { Treatment, TreatmentKind, Administration } from '../types';

/**
 * The treatment sheet: what is running, what is due, what has stopped.
 *
 * Two different questions are being asked of two different kinds of order. An
 * intermittent drug wants "when is the next dose"; a fluid line or CRI wants
 * "how long has this been running and is it still up". Both are computed here
 * so the sheet, the flowsheet's next-due chip and any later charge sheet agree.
 *
 * Nothing here invents a time. A treatment with no administrations and no
 * interval is reported as running since `startedAt` and nothing more.
 */

const MIN = 60_000;
const HOUR = 60 * MIN;

export type TreatmentState =
  | 'NOT_STARTED'
  | 'RUNNING'
  | 'DUE_SOON'
  | 'DUE_NOW'
  | 'OVERDUE'
  | 'STOPPED';

export interface TreatmentStatus {
  treatment: Treatment;
  state: TreatmentState;
  /** Next scheduled dose, for intermittent orders only. */
  nextDueAt?: Date;
  dueInMs?: number;
  /** "in 45 min", "12 min late", "running 6 h 20 min". */
  label: string;
  /** Milliseconds the line has been up; undefined before it starts. */
  runningForMs?: number;
  /** Time the last dose was actually given. */
  lastGivenAt?: Date;
}

export const TREATMENT_KIND_LABEL: Record<TreatmentKind, string> = {
  MEDICATION: 'Medication',
  FLUID: 'Fluid',
  CRI: 'CRI',
};

export const TREATMENT_KIND_ICON: Record<TreatmentKind, string> = {
  MEDICATION: 'syringe',
  FLUID: 'water_drop',
  CRI: 'ivfluid_balance',
};

export const TREATMENT_STATE_STYLE: Record<
  TreatmentState,
  { chip: string; label: string }
> = {
  NOT_STARTED: { chip: 'bg-[#eff4ff] text-[#434655] border border-[#E2E8F0]', label: 'Not started' },
  RUNNING: { chip: 'bg-[#ECFDF5] text-[#047857] border border-[#047857]/30', label: 'Running' },
  DUE_SOON: { chip: 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30', label: 'Due soon' },
  DUE_NOW: { chip: 'bg-[#C2410C] text-white', label: 'Due now' },
  OVERDUE: { chip: 'bg-[#B91C1C] text-white', label: 'Overdue' },
  STOPPED: { chip: 'bg-[#F1F5F9] text-[#747686] border border-[#E2E8F0]', label: 'Stopped' },
};

export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const mins = Math.round(abs / MIN);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  if (h < 48) return rem ? `${h} h ${rem} min` : `${h} h`;
  return `${Math.floor(h / 24)} d ${h % 24} h`;
}

/** "14:20" in the browser's locale-independent 24-hour form. */
export function clockTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

export function dayLabel(iso: string | Date, now: Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.floor((startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / (24 * HOUR));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days > 1) return `${days} d ago`;
  return d.toLocaleDateString();
}

/** The most recent administration, or undefined if none has been recorded. */
export function lastAdministration(t: Treatment): Administration | undefined {
  if (!t.administrations?.length) return undefined;
  return [...t.administrations].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )[0];
}

export function treatmentStatus(t: Treatment, now: Date): TreatmentStatus {
  const startMs = new Date(t.startedAt).getTime();
  const nowMs = now.getTime();
  const last = lastAdministration(t);
  const lastGivenAt = last ? new Date(last.at) : undefined;

  if (t.stoppedAt) {
    const stoppedMs = new Date(t.stoppedAt).getTime();
    return {
      treatment: t,
      state: 'STOPPED',
      label: `ran ${formatDuration(stoppedMs - startMs)}`,
      runningForMs: stoppedMs - startMs,
      lastGivenAt,
    };
  }

  if (Number.isFinite(startMs) && startMs > nowMs) {
    return {
      treatment: t,
      state: 'NOT_STARTED',
      label: `starts ${clockTime(t.startedAt)}`,
      lastGivenAt,
    };
  }

  const runningForMs = Number.isFinite(startMs) ? nowMs - startMs : undefined;

  // Continuous lines have no next dose — they are simply up until stopped.
  if (!t.intervalHours) {
    return {
      treatment: t,
      state: 'RUNNING',
      label: runningForMs === undefined ? 'running' : `running ${formatDuration(runningForMs)}`,
      runningForMs,
      lastGivenAt,
    };
  }

  // Intermittent: next dose is one interval after the last one actually given,
  // or after the start time if none has been recorded yet.
  const anchorMs = lastGivenAt ? lastGivenAt.getTime() : startMs;
  const nextDueMs = anchorMs + t.intervalHours * HOUR;
  const dueInMs = nextDueMs - nowMs;

  let state: TreatmentState;
  if (dueInMs < -5 * MIN) state = 'OVERDUE';
  else if (dueInMs <= 5 * MIN) state = 'DUE_NOW';
  else if (dueInMs <= 60 * MIN) state = 'DUE_SOON';
  else state = 'RUNNING';

  return {
    treatment: t,
    state,
    nextDueAt: new Date(nextDueMs),
    dueInMs,
    runningForMs,
    lastGivenAt,
    label: dueInMs < 0 ? `${formatDuration(dueInMs)} late` : `in ${formatDuration(dueInMs)}`,
  };
}

const STATE_RANK: Record<TreatmentState, number> = {
  OVERDUE: 0,
  DUE_NOW: 1,
  DUE_SOON: 2,
  RUNNING: 3,
  NOT_STARTED: 4,
  STOPPED: 5,
};

/** Ordered the way the ward reads it: late first, stopped last. */
export function orderedTreatments(
  treatments: Treatment[] | undefined,
  now: Date,
): TreatmentStatus[] {
  return (treatments ?? [])
    .map((t) => treatmentStatus(t, now))
    .sort((a, b) => {
      const rank = STATE_RANK[a.state] - STATE_RANK[b.state];
      if (rank !== 0) return rank;
      if (a.dueInMs !== undefined && b.dueInMs !== undefined) return a.dueInMs - b.dueInMs;
      return (
        new Date(b.treatment.startedAt).getTime() - new Date(a.treatment.startedAt).getTime()
      );
    });
}

/** Everything given or started, newest first, for the chronological view. */
export interface TreatmentEvent {
  id: string;
  at: Date;
  kind: 'STARTED' | 'GIVEN' | 'STOPPED';
  treatment: Treatment;
  by?: string;
  detail?: string;
}

export function treatmentTimeline(treatments: Treatment[] | undefined): TreatmentEvent[] {
  const events: TreatmentEvent[] = [];
  for (const t of treatments ?? []) {
    events.push({
      id: `${t.id}-start`,
      at: new Date(t.startedAt),
      kind: 'STARTED',
      treatment: t,
      by: t.prescribedBy,
      detail: t.rateText || t.amountText || t.doseText,
    });
    for (const a of t.administrations ?? []) {
      events.push({
        id: `${t.id}-${a.id}`,
        at: new Date(a.at),
        kind: 'GIVEN',
        treatment: t,
        by: a.by,
        detail: a.amountText || t.doseText,
      });
    }
    if (t.stoppedAt) {
      events.push({
        id: `${t.id}-stop`,
        at: new Date(t.stoppedAt),
        kind: 'STOPPED',
        treatment: t,
        by: t.stoppedBy,
        detail: t.stopReason,
      });
    }
  }
  return events
    .filter((e) => !Number.isNaN(e.at.getTime()))
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}

/** Continuous lines still up, for the flowsheet banner and the alert rail. */
export function activeInfusions(treatments: Treatment[] | undefined): Treatment[] {
  return (treatments ?? []).filter((t) => !t.stoppedAt && !t.intervalHours);
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
