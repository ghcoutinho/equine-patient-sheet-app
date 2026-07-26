import type { FlowsheetEntry, CASResult } from '../types';
import { calculateScoreBounds } from './missingDataHandler';

export function calculateCAS(entry: FlowsheetEntry): CASResult {
  const scoreItems: Array<{ value: number | undefined; min: number; max: number }> = [];

  // Heart Rate (Approximation: 0 = <60, 1 = 60-80, 2 = >80)
  if (entry.heartRate !== undefined) {
    if (entry.heartRate > 80) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.heartRate >= 60) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Respiratory Rate (Approximation: 0 = <30, 1 = 30-60, 2 = >60)
  if (entry.respiratoryRate !== undefined) {
    if (entry.respiratoryRate > 60) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.respiratoryRate >= 30) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Calcium (Approximation: 0 = normal, 1 = mild hypo, 2 = severe hypo)
  if (entry.calcium !== undefined) {
    if (entry.calcium < 9.0) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.calcium < 10.5) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Blood Lactate (Approximation: 0 = <2, 1 = 2-4, 2 = >4)
  if (entry.lactate !== undefined) {
    if (entry.lactate > 4) scoreItems.push({ value: 2, min: 2, max: 2 });
    else if (entry.lactate >= 2) scoreItems.push({ value: 1, min: 1, max: 1 });
    else scoreItems.push({ value: 0, min: 0, max: 0 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Abdominal Ultrasound (0 = Normal, 2 = Abnormal)
  if (entry.abdominalUltrasound !== undefined) {
    scoreItems.push({ value: entry.abdominalUltrasound === 'ABNORMAL' ? 2 : 0, min: 0, max: 2 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  // Rectal Examination (0 = Normal, 2 = Abnormal)
  if (entry.rectalExam !== undefined) {
    scoreItems.push({ value: entry.rectalExam === 'ABNORMAL' ? 2 : 0, min: 0, max: 2 });
  } else {
    scoreItems.push({ value: undefined, min: 0, max: 2 });
  }

  const scoreBounds = calculateScoreBounds(scoreItems);

  let prediction: CASResult['prediction'] = 'SURVIVE';
  if (scoreBounds.min > 7) {
    prediction = 'DIE';
  }

  return {
    score: scoreBounds,
    prediction
  };
}

export function getPrognosticFlags(entry: FlowsheetEntry): string[] {
  const flags: string[] = [];
  // Adult Colic Admission Cutoffs (Bottegaro 2024 & McGovern 2025)
  if (entry.heartRate && entry.heartRate > 75) flags.push('High Risk: Heart Rate > 75 bpm');
  if (entry.respiratoryRate && entry.respiratoryRate > 33) flags.push('High Risk: Respiratory Rate > 33 breaths/min');
  if (entry.lactate && entry.lactate > 3.7) flags.push('High Risk: Lactate > 3.7 mmol/L');
  if (entry.pcv && entry.pcv > 46) flags.push('High Risk: Haematocrit > 46%');
  
  // Acute Diarrhea Risk
  if (entry.creatinine && entry.creatinine > 159) flags.push('High Risk (Acute Diarrhea): Creatinine > 159 µmol/L');
  if (entry.lactate && entry.lactate > 2.8) flags.push('High Risk (Acute Diarrhea): Lactate > 2.8 mmol/L');

  return flags;
}
