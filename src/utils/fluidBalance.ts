import type { Patient, Treatment } from '../types';
import { columnsInCurrentAdmission } from './admission';
import { infusedVolumeMl, isContinuousLine } from './cri';
import { INSENSIBLE_LOSS } from '../data/colicThresholds';

/**
 * Fluid balance for the current admission — intake from the structured rates
 * Track 2 built, output from reflux (already charted) plus insensible loss.
 *
 * Insensible loss cannot be measured at the bedside; it only ever exists as
 * an estimate (see INSENSIBLE_LOSS in colicThresholds.ts). Rule 1 forbids
 * displaying a single confident number built on an estimate, so output and
 * balance are both ranges, never collapsed to a midpoint — a "here's your
 * number" balance would misrepresent how much of it is a ward convention
 * rather than something charted.
 */

const HOUR = 60 * 60 * 1000;

/** A plain volume already given, e.g. "26 mL" — not a rate like "2.08 mL/hr", which intake already counts through the continuous line's own event log. */
const BOLUS_ML = /^(\d+(?:\.\d+)?)\s*mL$/;

export interface FluidBalanceItem {
  label: string;
  ml: number;
  detail?: string;
}

export interface ExcludedIntake {
  drug: string;
  reason: string;
}

export interface FluidBalance {
  /** How long the estimate covers — since the current admission started, or since patient.admissionDate for a patient with no boundary set yet. */
  elapsedHours: number;
  intakeMl: number;
  intakeItems: FluidBalanceItem[];
  /** Continuous or bolus volumes that exist but can't be counted without guessing — surfaced, not silently dropped (rule 9). */
  excludedIntake: ExcludedIntake[];
  refluxOutputMl: number;
  insensibleLossMinMl: number;
  insensibleLossMaxMl: number;
  outputMinMl: number;
  outputMaxMl: number;
  balanceMinMl: number;
  balanceMaxMl: number;
}

function admissionStart(patient: Patient): Date | undefined {
  const iso = patient.currentAdmissionStartedAt ?? patient.admissionDate;
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function continuousIntake(
  treatments: Treatment[],
  now: Date,
  weightKg: number,
): { items: FluidBalanceItem[]; excluded: ExcludedIntake[] } {
  const items: FluidBalanceItem[] = [];
  const excluded: ExcludedIntake[] = [];
  for (const t of treatments) {
    if (!isContinuousLine(t)) continue;
    const ml = infusedVolumeMl(t, now, weightKg);
    if (ml === undefined) {
      if (t.rateValue !== undefined && t.rateUnit) {
        excluded.push({
          drug: t.drug,
          reason: `rate is ${t.rateValue} ${t.rateUnit} — not a volume, can't convert without the product's concentration`,
        });
      }
      continue;
    }
    items.push({
      label: t.drug,
      ml,
      detail: t.rateUnit ? `continuous, ${t.rateValue} ${t.rateUnit}` : 'continuous',
    });
  }
  return { items, excluded };
}

function bolusIntake(treatments: Treatment[]): FluidBalanceItem[] {
  const items: FluidBalanceItem[] = [];
  for (const t of treatments) {
    for (const a of t.administrations ?? []) {
      const m = a.amountText ? BOLUS_ML.exec(a.amountText.trim()) : null;
      if (!m) continue;
      items.push({ label: `${t.drug} bolus`, ml: Number(m[1]) });
    }
  }
  return items;
}

function refluxOutput(patient: Patient): number {
  return (
    columnsInCurrentAdmission(patient).reduce((sum, c) => sum + (c.gi?.refluxVolumeL ?? 0), 0) *
    1000
  );
}

/**
 * Returns undefined when there isn't enough to compute from — no weight, or
 * no admission start to measure elapsed time against — rather than showing
 * broken arithmetic.
 */
export function fluidBalance(patient: Patient, now: Date): FluidBalance | undefined {
  const weightKg = patient.weightKg;
  if (!Number.isFinite(weightKg) || weightKg <= 0) return undefined;

  const start = admissionStart(patient);
  if (!start) return undefined;
  const elapsedHours = Math.max(0, (now.getTime() - start.getTime()) / HOUR);
  const elapsedDays = elapsedHours / 24;

  const treatments = patient.treatments ?? [];
  const continuous = continuousIntake(treatments, now, weightKg);
  const bolus = bolusIntake(treatments);
  const intakeItems = [...continuous.items, ...bolus];
  const intakeMl = intakeItems.reduce((sum, i) => sum + i.ml, 0);

  const reflux = refluxOutput(patient);
  const insensibleLossMinMl = INSENSIBLE_LOSS.minMlPerKgPerDay * weightKg * elapsedDays;
  const insensibleLossMaxMl = INSENSIBLE_LOSS.maxMlPerKgPerDay * weightKg * elapsedDays;

  const outputMinMl = reflux + insensibleLossMinMl;
  const outputMaxMl = reflux + insensibleLossMaxMl;

  return {
    elapsedHours,
    intakeMl,
    intakeItems,
    excludedIntake: continuous.excluded,
    refluxOutputMl: reflux,
    insensibleLossMinMl,
    insensibleLossMaxMl,
    outputMinMl,
    outputMaxMl,
    balanceMinMl: intakeMl - outputMaxMl,
    balanceMaxMl: intakeMl - outputMinMl,
  };
}
