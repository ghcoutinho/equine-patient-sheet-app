import type { AssessmentSeverity } from '../types';
import {
  ALL_FOAL_PARAMETERS,
  type AgeClass,
} from '../data/ageStratifiedReferenceRanges';
import { ALL_CORNELL_LABS } from '../data/cornellReferenceRanges';

/**
 * Classify a charted lab value against the age-appropriate published interval.
 *
 * Foal bands come from the age-stratified dataset; adults fall back to the
 * Cornell intervals. When no interval exists for that parameter at that age the
 * result is `undefined` — the caller must render the value uncoloured rather
 * than guess, because "no published interval" is not the same as "normal".
 */
export function classifyAgainstReference(
  parameterId: string,
  value: number | undefined,
  ageClass: AgeClass,
): AssessmentSeverity | undefined {
  if (!Number.isFinite(value)) return undefined;
  const v = value as number;

  if (ageClass !== 'ADULT') {
    const param = ALL_FOAL_PARAMETERS.find((p) => p.id === parameterId);
    const band = param?.byAge[ageClass];
    if (band) {
      const { min, max } = band;
      if (max !== undefined && v > max) return 'warning';
      if (min !== undefined && v < min) return 'warning';
      return 'normal';
    }
    // Fall through to adult intervals only when the foal dataset is silent.
  }

  const adult = ALL_CORNELL_LABS.find((r) => r.id === parameterId || r.id === `lab_${parameterId}`);
  if (!adult) return undefined;

  if (adult.criticalMax !== undefined && v > adult.criticalMax) return 'critical';
  if (adult.criticalMin !== undefined && v < adult.criticalMin) return 'critical';
  if (v > adult.referenceMax || v < adult.referenceMin) return 'warning';
  return 'normal';
}
