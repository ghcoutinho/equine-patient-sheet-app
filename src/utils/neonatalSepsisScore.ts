import type { FlowsheetEntry, Patient, NeonatalSepsisResult } from '../types';
import { calculateScoreBounds } from './missingDataHandler';

export function calculateNeonatalSepsisScore(
  patient: Patient,
  entry: FlowsheetEntry
): NeonatalSepsisResult {
  
  // Brewer & Koterba parameters
  const scoreItems: Array<{ value: number | undefined; min: number; max: number }> = [];

  // WBC
  if (entry.wbc !== undefined) {
    if (entry.wbc < 2000) scoreItems.push({ value: 3, min: 3, max: 3 });
    else if (entry.wbc >= 2000 && entry.wbc < 4000) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if ((entry.wbc >= 4000 && entry.wbc <= 8000) || entry.wbc > 12000) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 3 });
  }

  // Bands (absolute)
  if (entry.bands !== undefined) {
    // Assuming bands is percentage, absolute = wbc * bands / 100
    // But if entry.bands is absolute count? The type doesn't specify.
    // Let's assume entry.bands is absolute count for B&K if value > 50, otherwise percentage?
    // Let's assume entry.bands is absolute if > 10, else percentage. 
    // Actually, type definition doesn't say. Let's just treat entry.bands as absolute if it's > 50, else maybe it's %.
    // To be safe, if we only have % and WBC we can calculate.
    // Let's assume it's absolute count for now as per clinical_reference.
    const absoluteBands = entry.bands < 50 && entry.wbc ? (entry.bands / 100) * entry.wbc : entry.bands;
    if (absoluteBands > 500) scoreItems.push({ value: 3, min: 3, max: 3 });
    else if (absoluteBands >= 200 && absoluteBands <= 500) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (absoluteBands >= 50 && absoluteBands < 200) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 3 });
  }

  // Toxic neutrophils
  if (entry.toxicNeutrophils !== undefined) {
    scoreItems.push({ value: entry.toxicNeutrophils ? 2 : 0, min: 0, max: 2 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Fibrinogen
  if (entry.fibrinogen !== undefined) {
    if (entry.fibrinogen > 800) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.fibrinogen >= 500 && entry.fibrinogen <= 800) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // IgG
  if (entry.igg !== undefined) {
    if (entry.igg < 400) scoreItems.push({ value: 4, min: 4, max: 4 });
    else if (entry.igg >= 400 && entry.igg <= 800) scoreItems.push({ value: 2, min: 2, max: 2 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 4 });
  }

  // Glucose
  if (entry.glucose !== undefined) {
    if (entry.glucose < 40) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.glucose >= 40 && entry.glucose <= 80) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Blood gas (Metabolic acidosis or PaO2/PaCO2)
  let bgScore = 0;
  if (entry.pao2 !== undefined && entry.paco2 !== undefined) {
    if (entry.pao2 < 60 || entry.paco2 > 50) bgScore = 1;
    scoreItems.push({ value: bgScore, min: bgScore, max: bgScore });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // Clinical parameters
  if (entry.hypotonia !== undefined) {
    if (entry.hypotonia === 'SEVERE') scoreItems.push({ value: 3, min: 3, max: 3 });
    else if (entry.hypotonia === 'MILD') scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 3 });
  }

  if (entry.petechiae !== undefined || entry.mucousMembranes === 'INJECTED') {
    if (entry.petechiae || entry.mucousMembranes === 'INJECTED') {
      scoreItems.push({ value: 2, min: 2, max: 2 });
    } else {
      scoreItems.push({ value: 0, min: 0, max: 0 });
    }
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  if (entry.temperature !== undefined) {
    if (entry.temperature > 38.6 || entry.temperature < 37.2) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 1 });
  }

  // History (using Patient object)
  let historyScore = 0;
  if (patient.damHistory) { // Dam history flags could be parsed here, but we will assign 2 if there is abnormal history
    historyScore += 2;
  }
  if (patient.gestationalAgeDays && patient.gestationalAgeDays < 320) {
    historyScore += 2;
  }
  scoreItems.push({ value: historyScore, min: historyScore, max: historyScore });

  const brewerScore = calculateScoreBounds(scoreItems);
  
  let interpretation: NeonatalSepsisResult['interpretation'] = 'LOW_RISK';
  if (brewerScore.min > 11) {
    interpretation = 'HIGH_RISK';
  } else if (brewerScore.max >= 7) {
    interpretation = 'EQUIVOCAL'; // Using the modified > 7 screening threshold
  }

  // SIRS criteria for Neonates
  const sirsItems: Array<{ value: number | undefined; min: number; max: number }> = [];
  
  if (entry.temperature !== undefined) {
    sirsItems.push({ value: (entry.temperature > 39.5 || entry.temperature < 37.2) ? 1 : 0, min: 0, max: 1 });
  } else {
    sirsItems.push({ value: undefined, min: 0, max: 1 });
  }

  if (entry.heartRate !== undefined) {
    sirsItems.push({ value: (entry.heartRate > 120 || entry.heartRate < 60) ? 1 : 0, min: 0, max: 1 });
  } else {
    sirsItems.push({ value: undefined, min: 0, max: 1 });
  }

  if (entry.respiratoryRate !== undefined) {
    sirsItems.push({ value: entry.respiratoryRate > 56 ? 1 : 0, min: 0, max: 1 });
  } else {
    sirsItems.push({ value: undefined, min: 0, max: 1 });
  }

  if (entry.wbc !== undefined) {
    sirsItems.push({ value: (entry.wbc > 12500 || entry.wbc < 4000) ? 1 : 0, min: 0, max: 1 });
  } else {
    sirsItems.push({ value: undefined, min: 0, max: 1 });
  }

  const sirsCriteriaCount = calculateScoreBounds(sirsItems);

  return {
    brewerScore,
    sirsCriteriaCount,
    interpretation
  };
}
