import type { FlowsheetEntry, Patient, FoalSurvivalResult } from '../types';
import { calculateScoreBounds } from './missingDataHandler';

export function calculateFoalSurvivalScore(
  patient: Patient,
  entry: FlowsheetEntry
): FoalSurvivalResult {
  const scoreItems: Array<{ value: number | undefined; min: number; max: number }> = [];

  // 1. Prematurity (Good = 1 point)
  if (patient.gestationalAgeDays !== undefined) {
    scoreItems.push({ value: patient.gestationalAgeDays >= 320 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 2. Cold extremities (Good = 1 point)
  if (entry.coldExtremities !== undefined) {
    scoreItems.push({ value: !entry.coldExtremities ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 3. Infectious/Inflammatory sites < 2 (Good = 1 point)
  if (entry.infectiousSitesCount !== undefined) {
    scoreItems.push({ value: entry.infectiousSitesCount < 2 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 4. Blood glucose normal (Good = 1 point, assuming > 40)
  if (entry.glucose !== undefined) {
    scoreItems.push({ value: entry.glucose > 40 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 5. Total WBC count normal (Good = 1 point, 4000-12500)
  if (entry.wbc !== undefined) {
    scoreItems.push({ value: (entry.wbc >= 4000 && entry.wbc <= 12500) ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // 6. IgG levels adequate (Good = 1 point, assuming > 800)
  if (entry.igg !== undefined) {
    scoreItems.push({ value: entry.igg > 800 ? 1 : 0, min: 0, max: 1 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  const scoreBounds = calculateScoreBounds(scoreItems);

  // Map score 0-6 to 3-97% (Rough linear approximation as per PMC4189956 description for the 0-7 scale)
  // We'll scale 0-6 to represent the survival probability
  const minProb = Math.max(3, Math.min(97, Math.round((scoreBounds.min / 6) * 94 + 3)));
  const maxProb = Math.max(3, Math.min(97, Math.round((scoreBounds.max / 6) * 94 + 3)));

  return {
    score: scoreBounds,
    survivalProbabilityRange: [minProb, maxProb]
  };
}
