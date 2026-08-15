import type { Treatment, CriEvent } from '../types';

/** CRI (drug infusion) and FLUID (crystalloid line) are mechanically the same continuous-line shape — rate × elapsed time, start/rate-change/bag-change/pause/stop. */
export function isContinuousLine(treatment: Treatment): boolean {
  return treatment.kind === 'CRI' || treatment.kind === 'FLUID';
}

/**
 * Infused volume for a continuous line, derived from rate × elapsed time —
 * never typed, never asked of the clinician (Architecture principle D).
 *
 * Only a volume-based rate (mL/hr or mL/kg/hr) can produce a volume. A
 * mass-based rate (mg/kg/hr, mcg/kg/min, mU/kg/min) would need the product's
 * concentration to convert back to a volume, and this never guesses that
 * conversion — it returns undefined rather than fabricate a number (rule 1).
 * In practice this rarely bites: DoseEntryPanel's formulary path already
 * stores the *computed* volume rate (e.g. "2.08 mL/hr"), not the mg/kg/hr
 * dosing spec, so most formulary CRIs are volume-based already.
 */

const HOUR = 60 * 60 * 1000;

function toMlPerHour(rateValue: number, rateUnit: string, weightKg: number): number | undefined {
  if (rateUnit === 'mL/hr') return rateValue;
  if (rateUnit === 'mL/kg/hr') return Number.isFinite(weightKg) ? rateValue * weightKg : undefined;
  return undefined;
}

/**
 * Volume infused so far, in mL. Walks the event log when one exists —
 * accumulating rate × elapsed time across running segments, closing a
 * segment on RATE_CHANGE/PAUSE/STOP and opening a new one on
 * START/RESUME/RATE_CHANGE — or falls back to a single constant-rate segment
 * from `startedAt` to `stoppedAt` (or `now`) when there is no log yet.
 *
 * Returns undefined when nothing can be computed without guessing: not a
 * continuous line, no rate at all, or a rate in a unit this can't convert to
 * volume. Applies to both CRI (a drug infusion) and FLUID (a crystalloid
 * line) — mechanically identical, both rate × elapsed time, and fluid
 * balance (utils/fluidBalance.ts) needs the FLUID case as much as the CRI
 * one.
 */
export function infusedVolumeMl(
  treatment: Treatment,
  now: Date,
  weightKg: number,
): number | undefined {
  if (!isContinuousLine(treatment)) return undefined;

  const events = treatment.criEvents;
  if (events && events.length > 0) {
    const sorted = [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    let total = 0;
    let currentMlPerHour: number | undefined;
    let segmentStartMs: number | undefined;
    let running = false;

    const closeSegment = (endMs: number) => {
      if (running && segmentStartMs !== undefined && currentMlPerHour !== undefined) {
        const hours = (endMs - segmentStartMs) / HOUR;
        if (hours > 0) total += currentMlPerHour * hours;
      }
    };

    for (const e of sorted) {
      const ms = new Date(e.at).getTime();
      if (Number.isNaN(ms)) continue;

      if (e.kind === 'START' || e.kind === 'RESUME') {
        segmentStartMs = ms;
        running = true;
        if (e.rateValue !== undefined && e.rateUnit) {
          currentMlPerHour = toMlPerHour(e.rateValue, e.rateUnit, weightKg);
        }
      } else if (e.kind === 'RATE_CHANGE') {
        closeSegment(ms);
        segmentStartMs = ms;
        if (e.rateValue !== undefined && e.rateUnit) {
          currentMlPerHour = toMlPerHour(e.rateValue, e.rateUnit, weightKg);
        }
      } else if (e.kind === 'PAUSE' || e.kind === 'STOP') {
        closeSegment(ms);
        running = false;
        segmentStartMs = undefined;
      }
      // BAG_CHANGE changes nothing about rate or running state.
    }

    if (running && segmentStartMs !== undefined) closeSegment(now.getTime());
    return total;
  }

  // Legacy fallback: no event log, one constant segment at the treatment's
  // own rate for its whole life so far.
  if (treatment.rateValue === undefined || !treatment.rateUnit) return undefined;
  const mlPerHour = toMlPerHour(treatment.rateValue, treatment.rateUnit, weightKg);
  if (mlPerHour === undefined) return undefined;

  const startMs = new Date(treatment.startedAt).getTime();
  const endMs = treatment.stoppedAt ? new Date(treatment.stoppedAt).getTime() : now.getTime();
  const hours = (endMs - startMs) / HOUR;
  if (!Number.isFinite(hours) || hours <= 0) return undefined;
  return mlPerHour * hours;
}

/** The rate currently in effect, from the most recent START/RATE_CHANGE event, or the treatment's own rate if there is no log. */
export function currentRate(treatment: Treatment): { value: number; unit: string } | undefined {
  const events = treatment.criEvents;
  if (events && events.length > 0) {
    const withRate = [...events]
      .filter((e) => e.rateValue !== undefined && e.rateUnit)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    if (withRate.length > 0) {
      return { value: withRate[0].rateValue!, unit: withRate[0].rateUnit! };
    }
  }
  if (treatment.rateValue !== undefined && treatment.rateUnit) {
    return { value: treatment.rateValue, unit: treatment.rateUnit };
  }
  return undefined;
}

/** True when the most recent PAUSE has no later RESUME/STOP — the line is paused, not stopped. */
export function isPaused(treatment: Treatment): boolean {
  const events = treatment.criEvents;
  if (!events || events.length === 0) return false;
  const sorted = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const last = sorted[0];
  return last.kind === 'PAUSE';
}

export function newCriEventId(): string {
  return `cri_${Math.random().toString(36).slice(2, 9)}`;
}

/** Everything except `id`/`at`/`by` — those come from the call site's newCriEventId()/stampRecorded(). */
export type CriEventInput = Omit<CriEvent, 'id' | 'at' | 'by'>;
