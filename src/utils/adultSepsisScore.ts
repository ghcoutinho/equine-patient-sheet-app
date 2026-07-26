import type { FlowsheetEntry, AdultSepsisResult } from '../types';
import { calculateScoreBounds } from './missingDataHandler';

export function calculateAdultSepsisScore(
  entry: FlowsheetEntry
): AdultSepsisResult {
  const scoreItems: Array<{ value: number | undefined; min: number; max: number }> = [];

  // 1. Temperature (< 37.0°C or > 38.5°C = 1 point)
  if (entry.temperature !== undefined) {
    scoreItems.push({ value: (entry.temperature < 37.0 || entry.temperature > 38.5) ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 2. Heart Rate (> 52 bpm = 1 point)
  if (entry.heartRate !== undefined) {
    scoreItems.push({ value: entry.heartRate > 52 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 3. Respiratory Rate (> 20 breaths/min = 1 point)
  if (entry.respiratoryRate !== undefined) {
    scoreItems.push({ value: entry.respiratoryRate > 20 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 4. WBC Count (< 5,000 or > 12,500 or >10% bands = 1 point)
  if (entry.wbc !== undefined || entry.bands !== undefined) {
    let abnormal = false;
    if (entry.wbc !== undefined && (entry.wbc < 5000 || entry.wbc > 12500)) abnormal = true;
    if (entry.bands !== undefined && entry.bands > 10) abnormal = true; // Assumes bands as % here
    scoreItems.push({ value: abnormal ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 5. Blood Lactate (> 2.06 mmol/L = 1 point)
  if (entry.lactate !== undefined) {
    scoreItems.push({ value: entry.lactate > 2.06 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 6. Mucous Membranes Abnormal (Anything other than PINK = 1 point)
  if (entry.mucousMembranes !== undefined) {
    scoreItems.push({ value: entry.mucousMembranes !== 'PINK' ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  const scoreBounds = calculateScoreBounds(scoreItems);

  let interpretation: AdultSepsisResult['interpretation'] = 'LOW_RISK';
  if (scoreBounds.min >= 3) {
    interpretation = 'HIGHLY_PROBABLE';
  } else if (scoreBounds.max >= 2) {
    interpretation = 'POSSIBLE'; // ≥ 2 is SIRS-positive per Biondi 2026
  }

  return {
    score: scoreBounds,
    interpretation
  };
}
