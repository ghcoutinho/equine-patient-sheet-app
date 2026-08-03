import type { FlowsheetEntry, BiomarkerEvaluator } from '../types';

/**
 * Inflammatory biomarkers, neonatal foal sepsis.
 *
 * This module was wired into Clinical Intelligence before it could ever
 * receive data — SAA, NGAL and RPR were not chartable anywhere — and its
 * thresholds carried no source at all, published or otherwise. Both are fixed
 * as of this pass: the values are now sourced (see intelligence.ts's
 * columnToEntry, which reads them from the most recent lab panel), and every
 * cutoff below traces to a specific paper except the SAA "elevated" floor,
 * which is labelled as unsourced rather than attributed to one.
 */

const SAA_SOURCE =
  'Hoeberg et al. 2022, J Vet Intern Med — "Serum amyloid A as a marker to detect sepsis and predict outcome in hospitalized neonatal foals" (n=590). Sepsis cut-off 1,050 mg/L (30.2% sens, 90.7% spec); non-survival cut-off 1,250 mg/L (22.1% sens, 90.8% spec).';

const NGAL_SOURCE =
  'Laurberg et al. 2023, PLOS One — "Use of admission serum NGAL concentrations as a marker of sepsis and outcome in neonatal foals." Sepsis cut-off 455 µg/L (71.4% sens, 100% spec); non-survival cut-off 1,104 µg/L (39.3% sens, 95.2% spec).';

const RPR_SOURCE =
  'Scalco et al. 2023, J Vet Intern Med — "Red blood cell distribution width to platelet ratio in neonatal foals with sepsis." Sepsis cut-off 0.0928 (62.7% sens, 66.2% spec, AUC 0.821).';

export function evaluateBiomarkers(entry: Partial<FlowsheetEntry>): BiomarkerEvaluator {
  const result: BiomarkerEvaluator = {};

  if (entry.saa !== undefined) {
    let interpretation: 'NORMAL' | 'ACTIVE_INFLAMMATION' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' =
      'NORMAL';
    if (entry.saa > 1250) {
      interpretation = 'HIGH_MORTALITY_RISK';
    } else if (entry.saa > 1050) {
      interpretation = 'SEPSIS_RISK';
    } else if (entry.saa > 50) {
      // Not one of Hoeberg's two reported cut-offs — a general "clearly above
      // the healthy-horse baseline" floor, unsourced. Flagged rather than
      // attributed, per rule 3.
      interpretation = 'ACTIVE_INFLAMMATION';
    }
    result.saa = { value: entry.saa, interpretation, source: SAA_SOURCE };
  }

  if (entry.ngal !== undefined) {
    let interpretation: 'NORMAL' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' = 'NORMAL';
    if (entry.ngal > 1104) {
      interpretation = 'HIGH_MORTALITY_RISK';
    } else if (entry.ngal > 455) {
      interpretation = 'SEPSIS_RISK';
    }
    result.ngal = { value: entry.ngal, interpretation, source: NGAL_SOURCE };
  }

  // RPR is a derived lab parameter (RDW ÷ platelets) computed on read by
  // labs.ts's computeDerived — see intelligence.ts's columnToEntry, which
  // reads the already-derived lab_rpr rather than re-dividing RDW by
  // platelets a second way here.
  if (entry.rpr !== undefined) {
    let interpretation: 'NORMAL' | 'AT_RISK' | 'SEPSIS_RISK' = 'NORMAL';
    if (entry.rpr >= 0.0928) {
      interpretation = 'SEPSIS_RISK';
    } else if (entry.rpr > 0.051) {
      // Scalco reports one cut-off (0.0928), not a three-tier band. The
      // intermediate "at risk" floor here is unsourced — flagged, not cited.
      interpretation = 'AT_RISK';
    }
    result.rpr = { value: entry.rpr, interpretation, source: RPR_SOURCE };
  }

  return result;
}
