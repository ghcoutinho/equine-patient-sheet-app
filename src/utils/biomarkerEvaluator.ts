import type { FlowsheetEntry, BiomarkerEvaluator } from '../types';

export function evaluateBiomarkers(entry: FlowsheetEntry): BiomarkerEvaluator {
  const result: BiomarkerEvaluator = {};

  // SAA Evaluation
  if (entry.saa !== undefined) {
    let interpretation: 'NORMAL' | 'ACTIVE_INFLAMMATION' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' = 'NORMAL';
    if (entry.saa > 1250) {
      interpretation = 'HIGH_MORTALITY_RISK';
    } else if (entry.saa > 1050) {
      interpretation = 'SEPSIS_RISK';
    } else if (entry.saa > 50) {
      interpretation = 'ACTIVE_INFLAMMATION';
    }
    result.saa = { value: entry.saa, interpretation };
  }

  // NGAL Evaluation
  if (entry.ngal !== undefined) {
    let interpretation: 'NORMAL' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' = 'NORMAL';
    if (entry.ngal > 1104) {
      interpretation = 'HIGH_MORTALITY_RISK';
    } else if (entry.ngal > 455) {
      interpretation = 'SEPSIS_RISK';
    }
    result.ngal = { value: entry.ngal, interpretation };
  }

  // RPR Evaluation (Calculated from RDW and Platelets if not explicitly provided)
  let rprValue = entry.rdw !== undefined && entry.platelets !== undefined 
    ? entry.rdw / entry.platelets 
    : entry.rpr;

  if (rprValue !== undefined) {
    let interpretation: 'NORMAL' | 'AT_RISK' | 'SEPSIS_RISK' = 'NORMAL';
    if (rprValue > 0.09) {
      interpretation = 'SEPSIS_RISK';
    } else if (rprValue > 0.051) {
      interpretation = 'AT_RISK';
    }
    result.rpr = { value: rprValue, interpretation };
  }

  return result;
}
