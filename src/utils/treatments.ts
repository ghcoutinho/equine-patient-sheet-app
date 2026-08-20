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
  /** Continuous line (fluid/CRI) up and infusing. Never used for an intermittent order. */
  | 'RUNNING'
  /** Intermittent order, first dose not yet given, comfortably before it's due. */
  | 'SCHEDULED'
  /** Intermittent order, at least one dose given, comfortably waiting for the next. */
  | 'GIVEN'
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

/**
 * Routes of administration, offered as a list rather than typed free-hand so
 * the sheet stays searchable and "IV", "iv" and "I.V." do not become three
 * different routes.
 */
export const ROUTES = [
  'IV',
  'IV bolus',
  'IV CRI',
  'IM',
  'SC',
  'PO',
  'PR',
  'Intraosseous',
  'Intra-articular',
  'Intrauterine',
  'Intranasal',
  'Nebulised',
  'Topical',
  'Ophthalmic',
  'Epidural',
  'Regional limb perfusion',
  'Via nasogastric tube',
] as const;

export type Route = (typeof ROUTES)[number];

/**
 * Units offered for a manually-entered continuous rate, so a structured
 * `rateValue`/`rateUnit` pair can be captured even outside the formulary
 * calculator — a fixed list rather than free text for the same reason
 * `ROUTES` is, and the prerequisite for computing infused volume from rate
 * and elapsed time rather than asking the clinician to track it by hand.
 */
export const RATE_UNITS = [
  'mL/hr',
  'mL/kg/hr',
  'mg/kg/hr',
  'mg/kg/min',
  'mcg/kg/min',
  'mU/kg/min',
  'IU/hr',
] as const;

/** Map a formulary route abbreviation onto the canonical list. */
export function normaliseRoute(raw: string | undefined): string {
  const r = (raw || '').trim();
  if (!r) return 'IV';
  const exact = ROUTES.find((o) => o.toLowerCase() === r.toLowerCase());
  if (exact) return exact;
  const compact = r.replace(/[.\s]/g, '').toUpperCase();
  const alias: Record<string, string> = {
    IV: 'IV',
    IM: 'IM',
    SC: 'SC',
    SQ: 'SC',
    PO: 'PO',
    PR: 'PR',
    IO: 'Intraosseous',
    IA: 'Intra-articular',
    NG: 'Via nasogastric tube',
    CRI: 'IV CRI',
    NEB: 'Nebulised',
  };
  return alias[compact] ?? r;
}

/**
 * Turn a formulary frequency into hours between doses.
 *
 * A range such as "q8-12h" resolves to the shorter interval, which is the more
 * frequent order — under-dosing an antimicrobial is the worse error. Anything
 * describing a continuous infusion returns undefined, because a CRI has a rate,
 * not an interval.
 */
export function intervalFromFrequency(freq: string | undefined): number | undefined {
  const f = (freq || '').trim().toLowerCase();
  if (!f) return undefined;
  if (/\bcri\b|continuous|infusion/.test(f)) return undefined;
  if (/\bsid\b|\bq24\b|once daily/.test(f)) return 24;
  if (/\bbid\b/.test(f)) return 12;
  if (/\btid\b/.test(f)) return 8;
  if (/\bqid\b/.test(f)) return 6;
  const m = f.match(/q\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*h/);
  if (m) return Number(m[1]);
  return undefined;
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
  SCHEDULED: { chip: 'bg-[#eff4ff] text-[#0037b0] border border-[#0037b0]/30', label: 'Scheduled' },
  GIVEN: { chip: 'bg-[#ECFDF5] text-[#047857] border border-[#047857]/30', label: 'Given' },
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

/** "2:15" (h:mm) — the countdown format for "next dose due in x:xx". */
export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / MIN));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
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
  // Future dates: the forward schedule projects doses into tomorrow and beyond,
  // and "Tomorrow" reads better on a ward board than a locale date string.
  if (days === -1) return 'Tomorrow';
  return `in ${Math.abs(days)} d`;
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
  // 'Running' is reserved for a continuous line actually up (see above) — an
  // intermittent order comfortably before its next dose is either still
  // waiting on its first ('Scheduled') or was already given at least once
  // and is waiting on the next ('Given'). Conflating the two under one
  // "Running" label was previously ambiguous about whether anything had
  // been given at all.
  else state = lastGivenAt ? 'GIVEN' : 'SCHEDULED';

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
  GIVEN: 3,
  SCHEDULED: 3,
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

/**
 * The forward schedule: every dose still to come, and every line still running.
 *
 * The past timeline answers "what happened"; this answers "what is about to".
 * Doses are projected forward from the next due time at the order's interval,
 * so the ward can see the shape of the next shift rather than one dose at a
 * time. Continuous lines have no doses to project, so they appear once as a
 * running band with the time they were started and how long they have been up.
 */
export interface UpcomingDose {
  id: string;
  treatment: Treatment;
  at: Date;
  /** 1 for the next dose, 2 for the one after, and so on. */
  ordinal: number;
  /** True when this dose is already late. */
  overdue: boolean;
}

export function upcomingDoses(
  treatments: Treatment[] | undefined,
  now: Date,
  horizonHours = 24,
): UpcomingDose[] {
  const horizon = now.getTime() + horizonHours * HOUR;
  const out: UpcomingDose[] = [];

  for (const t of treatments ?? []) {
    if (t.stoppedAt || !t.intervalHours) continue;
    const status = treatmentStatus(t, now);
    if (!status.nextDueAt) continue;

    let at = status.nextDueAt.getTime();
    let ordinal = 1;
    // Cap the projection so a q1h order cannot flood the view.
    while (at <= horizon && ordinal <= 24) {
      out.push({
        id: `${t.id}-${ordinal}`,
        treatment: t,
        at: new Date(at),
        ordinal,
        overdue: at < now.getTime(),
      });
      at += t.intervalHours * HOUR;
      ordinal += 1;
    }
  }

  return out.sort((a, b) => a.at.getTime() - b.at.getTime());
}

/** Continuous lines still up, with how long each has been running. */
export function runningLines(
  treatments: Treatment[] | undefined,
  now: Date,
): { treatment: Treatment; runningForMs: number }[] {
  return (treatments ?? [])
    .filter((t) => !t.stoppedAt && !t.intervalHours)
    .map((t) => ({
      treatment: t,
      runningForMs: now.getTime() - new Date(t.startedAt).getTime(),
    }))
    .filter((r) => Number.isFinite(r.runningForMs))
    .sort((a, b) => b.runningForMs - a.runningForMs);
}

/** Continuous lines still up, for the flowsheet banner and the alert rail. */
export function activeInfusions(treatments: Treatment[] | undefined): Treatment[] {
  return (treatments ?? []).filter((t) => !t.stoppedAt && !t.intervalHours);
}

export function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
