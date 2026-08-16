/**
 * Post-operative refeeding timeline, by lesion type (Bauck 2023).
 *
 * When water and food can safely start is not the same question for a
 * non-strangulating impaction and a large-colon resection — the table below
 * is the four-way split the source gives. `Patient.lesionType` is a
 * clinician-set classification, never inferred from `diagnosis` free text:
 * "large colon volvulus" doesn't say on its own whether a resection was
 * done.
 */

import type { LesionType } from '../types';

export const LESION_TYPE_LABEL: Record<LesionType, string> = {
  NON_STRANGULATING: 'Non-strangulating lesion (small or large intestine)',
  SI_STRANGULATING: 'Strangulating small intestine',
  LI_SIRS: 'Large intestine with SIRS',
  LI_RESECTION: 'Large intestine resection',
};

export interface NutritionStage {
  /** Hours after recovery from anaesthesia. Undefined when gated on SIRS resolving instead. */
  waterHoursAfterRecovery?: number;
  foodHoursAfterRecovery?: number;
  /** True when the source gates the start on SIRS resolving rather than a fixed time. */
  gatedOnSirsResolving?: boolean;
  diet: string;
}

export const NUTRITION_TIMELINE: Record<LesionType, NutritionStage> = {
  NON_STRANGULATING: {
    waterHoursAfterRecovery: 3,
    foodHoursAfterRecovery: 6,
    diet: 'Hay or grazing — small amounts (~2 min) every 4–6h, increased gradually',
  },
  SI_STRANGULATING: {
    waterHoursAfterRecovery: 12,
    foodHoursAfterRecovery: 12,
    diet: 'Same, if comfortable and without reflux',
  },
  LI_SIRS: {
    gatedOnSirsResolving: true,
    diet: 'Roughage; consider low-bulk',
  },
  LI_RESECTION: {
    gatedOnSirsResolving: true,
    diet: 'Low-bulk + psyllium/vegetable gel',
  },
};

export const NUTRITION_TIMELINE_SOURCE = 'Bauck 2023 (Vet Clin Equine 39:263-286), postoperative nutrition table';

export interface NutritionReading {
  waterStatus: 'due-now' | 'not-yet' | 'gated-on-sirs' | 'unknown';
  waterReading: string;
  foodStatus: 'due-now' | 'not-yet' | 'gated-on-sirs' | 'unknown';
  foodReading: string;
  diet: string;
}

/**
 * Reads the timeline against an actual clock, so the UI can say "food due at
 * 14:00" rather than just "food at 6–12h" — but never claims a time it can't
 * anchor: without `surgeryPerformedAt` both statuses read as `unknown`
 * rather than guessing from admission time.
 */
export function readNutritionTimeline(
  lesionType: LesionType,
  surgeryPerformedAt: string | undefined,
  sirsResolved: boolean | undefined,
  now: Date,
): NutritionReading {
  const stage = NUTRITION_TIMELINE[lesionType];

  const readGated = (label: string): { status: NutritionReading['waterStatus']; reading: string } => {
    if (sirsResolved === undefined) {
      return { status: 'unknown', reading: `${label}: gated on SIRS resolving — not yet assessed this stay.` };
    }
    return sirsResolved
      ? { status: 'due-now', reading: `${label}: SIRS has resolved — may start.` }
      : { status: 'gated-on-sirs', reading: `${label}: waiting on SIRS to resolve.` };
  };

  const readTimed = (
    label: string,
    hoursAfterRecovery: number | undefined,
  ): { status: NutritionReading['waterStatus']; reading: string } => {
    if (hoursAfterRecovery === undefined) return { status: 'unknown', reading: `${label}: not defined for this lesion type.` };
    if (!surgeryPerformedAt) {
      return {
        status: 'unknown',
        reading: `${label}: ${hoursAfterRecovery}h after recovery from anaesthesia — set the surgery time to compute a clock time.`,
      };
    }
    const dueAt = new Date(new Date(surgeryPerformedAt).getTime() + hoursAfterRecovery * 60 * 60 * 1000);
    const due = now.getTime() >= dueAt.getTime();
    const clock = dueAt.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
    return {
      status: due ? 'due-now' : 'not-yet',
      reading: due
        ? `${label}: due since ${clock} (${hoursAfterRecovery}h post-recovery).`
        : `${label}: due at ${clock} (${hoursAfterRecovery}h post-recovery).`,
    };
  };

  const water = stage.gatedOnSirsResolving
    ? readGated('Water')
    : readTimed('Water', stage.waterHoursAfterRecovery);
  const food = stage.gatedOnSirsResolving
    ? readGated('Food')
    : readTimed('Food', stage.foodHoursAfterRecovery);

  return {
    waterStatus: water.status,
    waterReading: water.reading,
    foodStatus: food.status,
    foodReading: food.reading,
    diet: stage.diet,
  };
}

/**
 * Return-to-exercise protocol, anchored to discharge — the same table the
 * source recommends printing for the owner. A fixed schedule, not adjusted
 * for how the horse is actually doing at each check-in; that judgement stays
 * with the attending clinician.
 */
export const EXERCISE_RETURN_PROTOCOL = {
  stallDays: 30,
  smallPaddockDays: 30,
  fullPastureDays: 30,
  athleticReturnDays: 90,
  source:
    'Bauck 2023 — 30 days stall rest, 30 days small paddock, 30 days full pasture, gradual return to athletic work at 90 days.',
} as const;

export interface ExercisePhase {
  label: string;
  daysElapsed: number;
  daysRemaining: number;
}

/** Undefined before discharge — the clock only starts once the horse actually goes home. */
export function exerciseReturnPhase(dischargedAt: string | undefined, now: Date): ExercisePhase | undefined {
  if (!dischargedAt) return undefined;
  const daysElapsed = Math.floor((now.getTime() - new Date(dischargedAt).getTime()) / (24 * 60 * 60 * 1000));
  const { stallDays, smallPaddockDays, fullPastureDays, athleticReturnDays } = EXERCISE_RETURN_PROTOCOL;

  if (daysElapsed < stallDays) {
    return { label: 'Stall rest', daysElapsed, daysRemaining: stallDays - daysElapsed };
  }
  if (daysElapsed < stallDays + smallPaddockDays) {
    return { label: 'Small paddock', daysElapsed, daysRemaining: stallDays + smallPaddockDays - daysElapsed };
  }
  if (daysElapsed < stallDays + smallPaddockDays + fullPastureDays) {
    return {
      label: 'Full pasture',
      daysElapsed,
      daysRemaining: stallDays + smallPaddockDays + fullPastureDays - daysElapsed,
    };
  }
  if (daysElapsed < athleticReturnDays) {
    return { label: 'Approaching athletic return', daysElapsed, daysRemaining: athleticReturnDays - daysElapsed };
  }
  return { label: 'Cleared for gradual athletic return', daysElapsed, daysRemaining: 0 };
}
