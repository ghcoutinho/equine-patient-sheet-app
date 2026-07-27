import type { LabParameterRange } from '../data/cornellReferenceRanges';
import {
  CORNELL_EQUINE_HEMATOLOGY,
  CORNELL_EQUINE_CHEMISTRY,
  CORNELL_EQUINE_IMMUNOLOGY,
  CORNELL_EQUINE_BLOOD_GAS,
  ALL_CORNELL_LABS,
} from '../data/cornellReferenceRanges';

/**
 * The full laboratory panel.
 *
 * The central rule here is that a parameter which is *calculated* from others
 * is never typed in. MCHC is haemoglobin over haematocrit; globulin is total
 * protein minus albumin. Letting a clinician enter those separately means the
 * panel can contradict itself, and the entered value silently wins over the
 * arithmetic. So derived parameters are computed on read, shown with the
 * formula that produced them, and cannot be edited.
 */

export type LabSection =
  | 'Haematology'
  | 'Differential'
  | 'Chemistry'
  | 'Blood gas'
  | 'Immunology';

export interface LabField {
  id: string;
  name: string;
  units: string;
  section: LabSection;
  /** Published interval, when one exists for the adult horse. */
  range?: LabParameterRange;
  /** Short note shown under the field. */
  hint?: string;
}

const byId = new Map(ALL_CORNELL_LABS.map((r) => [r.id, r]));
const range = (id: string): LabParameterRange | undefined => byId.get(id);

const field = (
  id: string,
  name: string,
  units: string,
  section: LabSection,
  hint?: string,
): LabField => ({ id, name, units, section, range: range(id), hint });

/* ------------------------------------------------------------------ */
/* Entered parameters                                                   */
/* ------------------------------------------------------------------ */

/**
 * Haematology. The analyser reports RBC, haemoglobin and haematocrit directly;
 * the three red cell indices below them are arithmetic and appear in DERIVED.
 */
export const HAEMATOLOGY_FIELDS: LabField[] = [
  field('lab_pcv', 'Haematocrit (PCV)', '%', 'Haematology'),
  field('lab_rbc', 'Red cell count', 'M/µL', 'Haematology'),
  field('lab_hgb', 'Haemoglobin (Hb)', 'g/dL', 'Haematology'),
  field('lab_platelets', 'Platelets', 'K/µL', 'Haematology'),
  field('lab_wbc', 'White cell count', 'K/µL', 'Haematology'),
  field('lab_fibrinogen', 'Fibrinogen', 'mg/dL', 'Haematology'),
  field('lab_rdw', 'RDW', '%', 'Haematology'),
];

/**
 * Differential. Entered as absolute counts, because that is what the analyser
 * reports and what the reference intervals are written against. The
 * percentages are derived from the total white cell count.
 */
export const DIFFERENTIAL_FIELDS: LabField[] = [
  field('lab_neuts_seg', 'Segmented neutrophils', 'K/µL', 'Differential'),
  field('lab_neuts_band', 'Band neutrophils', 'K/µL', 'Differential', 'Any band is abnormal in the horse'),
  field('lab_lymphocytes', 'Lymphocytes', 'K/µL', 'Differential'),
  field('lab_monocytes', 'Monocytes', 'K/µL', 'Differential'),
  field('lab_eosinophils', 'Eosinophils', 'K/µL', 'Differential'),
  field('lab_basophils', 'Basophils', 'K/µL', 'Differential'),
];

export const CHEMISTRY_FIELDS: LabField[] = [
  field('lab_sodium', 'Sodium (Na⁺)', 'mEq/L', 'Chemistry'),
  field('lab_potassium', 'Potassium (K⁺)', 'mEq/L', 'Chemistry'),
  field('lab_chloride', 'Chloride (Cl⁻)', 'mEq/L', 'Chemistry'),
  field('lab_bicarbonate', 'Bicarbonate (HCO₃⁻)', 'mEq/L', 'Chemistry'),
  field('lab_bun', 'Urea nitrogen (BUN)', 'mg/dL', 'Chemistry'),
  field('lab_creatinine', 'Creatinine', 'mg/dL', 'Chemistry'),
  field('lab_glucose', 'Glucose', 'mg/dL', 'Chemistry'),
  field('lab_lactate', 'Lactate', 'mmol/L', 'Chemistry'),
  field('lab_tp', 'Total protein', 'g/dL', 'Chemistry'),
  field('lab_albumin', 'Albumin', 'g/dL', 'Chemistry'),
  field('lab_calcium', 'Calcium, total (Ca)', 'mg/dL', 'Chemistry'),
  field('lab_ionized_calcium', 'Calcium, ionised (Ca²⁺)', 'mmol/L', 'Chemistry'),
  field('lab_phosphate', 'Phosphate (PO₄³⁻)', 'mg/dL', 'Chemistry'),
  field('lab_magnesium', 'Magnesium (Mg²⁺)', 'mEq/L', 'Chemistry'),
  field('lab_ast', 'AST', 'U/L', 'Chemistry'),
  field('lab_ggt', 'GGT', 'U/L', 'Chemistry'),
  field('lab_gldh', 'GLDH', 'U/L', 'Chemistry'),
  field('lab_alp', 'ALP', 'U/L', 'Chemistry'),
  field('lab_ldh', 'LDH', 'U/L', 'Chemistry'),
  field('lab_ck', 'CK', 'U/L', 'Chemistry'),
  field('lab_tbili', 'Total bilirubin', 'mg/dL', 'Chemistry'),
  field('lab_dbili', 'Direct bilirubin', 'mg/dL', 'Chemistry'),
  field('lab_bile_acids', 'Bile acids', 'µmol/L', 'Chemistry'),
  field('lab_triglycerides', 'Triglycerides', 'mg/dL', 'Chemistry'),
  field('lab_cholesterol', 'Cholesterol', 'mg/dL', 'Chemistry'),
  field('lab_iron', 'Iron (Fe)', 'µg/dL', 'Chemistry'),
  field('lab_tibc', 'TIBC', 'µg/dL', 'Chemistry'),
  field('lab_saa', 'Serum amyloid A', 'µg/mL', 'Chemistry'),
];

export const BLOOD_GAS_FIELDS: LabField[] = [
  field('lab_ph', 'pH', '', 'Blood gas'),
  field('lab_pco2', 'Carbon dioxide tension (pCO₂)', 'mmHg', 'Blood gas'),
  field('lab_po2', 'Oxygen tension (pO₂)', 'mmHg', 'Blood gas'),
  field('lab_hco3', 'Bicarbonate (HCO₃⁻)', 'mEq/L', 'Blood gas'),
  field('lab_base_excess', 'Base excess', 'mEq/L', 'Blood gas'),
];

export const IMMUNOLOGY_FIELDS: LabField[] = [
  field('lab_igg', 'IgG', 'mg/dL', 'Immunology', 'Foal transfer of passive immunity'),
  field('lab_igm', 'IgM', 'mg/dL', 'Immunology'),
  field('lab_iga', 'IgA', 'mg/dL', 'Immunology'),
];

export const LAB_SECTIONS: { section: LabSection; fields: LabField[] }[] = [
  { section: 'Haematology', fields: HAEMATOLOGY_FIELDS },
  { section: 'Differential', fields: DIFFERENTIAL_FIELDS },
  { section: 'Chemistry', fields: CHEMISTRY_FIELDS },
  { section: 'Blood gas', fields: BLOOD_GAS_FIELDS },
  { section: 'Immunology', fields: IMMUNOLOGY_FIELDS },
];

export const ALL_ENTERED_FIELDS: LabField[] = LAB_SECTIONS.flatMap((s) => s.fields);

/* ------------------------------------------------------------------ */
/* Derived parameters                                                   */
/* ------------------------------------------------------------------ */

export interface DerivedParameter {
  id: string;
  name: string;
  units: string;
  section: LabSection;
  /** Parameter ids this calculation needs. */
  inputs: string[];
  /** The arithmetic, written out for the clinician to check. */
  formula: string;
  compute: (v: Record<string, number>) => number;
  range?: LabParameterRange;
  decimals?: number;
}

const d = (
  id: string,
  name: string,
  units: string,
  section: LabSection,
  inputs: string[],
  formula: string,
  compute: (v: Record<string, number>) => number,
  decimals = 1,
): DerivedParameter => ({
  id,
  name,
  units,
  section,
  inputs,
  formula,
  compute,
  range: range(id),
  decimals,
});

const DIFFERENTIAL_PERCENTAGES: DerivedParameter[] = (
  [
    ['lab_neuts_seg', 'Segmented neutrophils'],
    ['lab_neuts_band', 'Band neutrophils'],
    ['lab_lymphocytes', 'Lymphocytes'],
    ['lab_monocytes', 'Monocytes'],
    ['lab_eosinophils', 'Eosinophils'],
    ['lab_basophils', 'Basophils'],
  ] as const
).map(([id, name]) =>
  d(
    `${id}_pct`,
    `${name} (%)`,
    '%',
    'Differential',
    [id, 'lab_wbc'],
    `${name} ÷ WBC × 100`,
    (v) => (v[id] / v.lab_wbc) * 100,
    1,
  ),
);

export const DERIVED_PARAMETERS: DerivedParameter[] = [
  // Red cell indices. RBC is in millions/µL and haematocrit is a percentage,
  // which is where the factors of 10 and 100 come from.
  d(
    'lab_mcv',
    'MCV (mean corpuscular volume)',
    'fL',
    'Haematology',
    ['lab_pcv', 'lab_rbc'],
    'PCV × 10 ÷ RBC',
    (v) => (v.lab_pcv * 10) / v.lab_rbc,
  ),
  d(
    'lab_mch',
    'MCH (mean corpuscular haemoglobin)',
    'pg',
    'Haematology',
    ['lab_hgb', 'lab_rbc'],
    'Haemoglobin × 10 ÷ RBC',
    (v) => (v.lab_hgb * 10) / v.lab_rbc,
  ),
  d(
    'lab_mchc',
    'MCHC (mean corpuscular haemoglobin concentration)',
    'g/dL',
    'Haematology',
    ['lab_hgb', 'lab_pcv'],
    'Haemoglobin × 100 ÷ PCV',
    (v) => (v.lab_hgb * 100) / v.lab_pcv,
  ),
  d(
    'lab_rpr',
    'RDW : platelet ratio',
    '',
    'Haematology',
    ['lab_rdw', 'lab_platelets'],
    'RDW ÷ platelets',
    (v) => v.lab_rdw / v.lab_platelets,
    3,
  ),

  ...DIFFERENTIAL_PERCENTAGES,

  d(
    'lab_globulin',
    'Globulin',
    'g/dL',
    'Chemistry',
    ['lab_tp', 'lab_albumin'],
    'Total protein − albumin',
    (v) => v.lab_tp - v.lab_albumin,
    2,
  ),
  d(
    'lab_ag_ratio',
    'Albumin : globulin ratio',
    '',
    'Chemistry',
    ['lab_tp', 'lab_albumin'],
    'Albumin ÷ (total protein − albumin)',
    (v) => v.lab_albumin / (v.lab_tp - v.lab_albumin),
    2,
  ),
  d(
    'lab_anion_gap',
    'Anion gap',
    'mEq/L',
    'Chemistry',
    ['lab_sodium', 'lab_potassium', 'lab_chloride', 'lab_bicarbonate'],
    '(Na⁺ + K⁺) − (Cl⁻ + HCO₃⁻)',
    (v) => v.lab_sodium + v.lab_potassium - (v.lab_chloride + v.lab_bicarbonate),
  ),
  d(
    'lab_ibili',
    'Indirect bilirubin',
    'mg/dL',
    'Chemistry',
    ['lab_tbili', 'lab_dbili'],
    'Total bilirubin − direct bilirubin',
    (v) => v.lab_tbili - v.lab_dbili,
    2,
  ),
  d(
    'lab_sat',
    'Transferrin saturation',
    '%',
    'Chemistry',
    ['lab_iron', 'lab_tibc'],
    'Iron ÷ TIBC × 100',
    (v) => (v.lab_iron / v.lab_tibc) * 100,
  ),
  d(
    'lab_osmolality',
    'Calculated osmolality',
    'mOsm/kg',
    'Chemistry',
    ['lab_sodium', 'lab_glucose', 'lab_bun'],
    '2 × Na⁺ + glucose ÷ 18 + BUN ÷ 2.8',
    (v) => 2 * v.lab_sodium + v.lab_glucose / 18 + v.lab_bun / 2.8,
  ),
  d(
    'lab_corrected_na',
    'Sodium corrected for glucose (Na⁺)',
    'mEq/L',
    'Chemistry',
    ['lab_sodium', 'lab_glucose'],
    'Na⁺ + 1.6 × (glucose − 100) ÷ 100',
    (v) => v.lab_sodium + (1.6 * (v.lab_glucose - 100)) / 100,
  ),
];

/** Ids that are calculated, so the entry form knows never to offer them. */
export const DERIVED_IDS = new Set(DERIVED_PARAMETERS.map((p) => p.id));

export interface DerivedResult {
  parameter: DerivedParameter;
  /** Undefined when an input is missing or the arithmetic is undefined. */
  value?: number;
  /** Inputs that were not entered, so the UI can say what is needed. */
  missing: string[];
}

const nameOf = (id: string): string =>
  ALL_ENTERED_FIELDS.find((f) => f.id === id)?.name ??
  DERIVED_PARAMETERS.find((p) => p.id === id)?.name ??
  id;

/**
 * Compute every derived parameter it can. A parameter with a missing input
 * returns `value: undefined` and lists what is missing — it is never guessed
 * and never falls back to zero.
 */
export function computeDerived(values: Record<string, number>): DerivedResult[] {
  return DERIVED_PARAMETERS.map((parameter) => {
    const missing = parameter.inputs.filter((id) => !Number.isFinite(values[id]));
    if (missing.length > 0) {
      return { parameter, missing: missing.map(nameOf) };
    }
    const raw = parameter.compute(values);
    // Division by zero and negative-protein nonsense both land here.
    if (!Number.isFinite(raw)) return { parameter, missing: [] };
    const factor = 10 ** (parameter.decimals ?? 1);
    return { parameter, value: Math.round(raw * factor) / factor, missing: [] };
  });
}

export const derivedInSection = (
  results: DerivedResult[],
  section: LabSection,
): DerivedResult[] => results.filter((r) => r.parameter.section === section);

/**
 * The differential should account for the whole white cell count. A total that
 * does not match is a transcription error, and is worth saying out loud.
 */
export function differentialCheck(
  values: Record<string, number>,
): { sum: number; wbc: number; agrees: boolean } | undefined {
  const parts = DIFFERENTIAL_FIELDS.map((f) => values[f.id]).filter((n) =>
    Number.isFinite(n),
  );
  if (parts.length === 0 || !Number.isFinite(values.lab_wbc)) return undefined;
  const sum = Math.round(parts.reduce((a, b) => a + b, 0) * 100) / 100;
  const wbc = values.lab_wbc;
  // 5% tolerance covers analyser rounding without hiding a real mismatch.
  return { sum, wbc, agrees: Math.abs(sum - wbc) <= Math.max(0.2, wbc * 0.05) };
}

export type LabFlag = 'low' | 'normal' | 'high' | 'critical-low' | 'critical-high';

export const LAB_FLAG_STYLE: Record<LabFlag, { text: string; chip: string; mark: string }> = {
  'critical-low': {
    text: 'text-[#B91C1C] font-bold',
    chip: 'bg-[#B91C1C] text-white',
    mark: 'LL',
  },
  low: { text: 'text-[#C2410C] font-bold', chip: 'bg-[#FFF7ED] text-[#C2410C] border border-[#C2410C]/30', mark: 'L' },
  normal: { text: 'text-[#0b1c30]', chip: '', mark: '' },
  high: { text: 'text-[#C2410C] font-bold', chip: 'bg-[#FFF7ED] text-[#C2410C] border border-[#C2410C]/30', mark: 'H' },
  'critical-high': {
    text: 'text-[#B91C1C] font-bold',
    chip: 'bg-[#B91C1C] text-white',
    mark: 'HH',
  },
};

/** Flag a value against its published interval. Undefined when none exists. */
export function flagValue(
  r: LabParameterRange | undefined,
  value: number | undefined,
): LabFlag | undefined {
  if (!r || !Number.isFinite(value)) return undefined;
  const v = value as number;
  if (r.criticalMax !== undefined && v > r.criticalMax) return 'critical-high';
  if (r.criticalMin !== undefined && v < r.criticalMin) return 'critical-low';
  if (v > r.referenceMax) return 'high';
  if (v < r.referenceMin) return 'low';
  return 'normal';
}

export function formatRange(r: LabParameterRange | undefined): string {
  if (!r) return 'no published interval';
  return `${r.referenceMin}–${r.referenceMax}`;
}

export {
  CORNELL_EQUINE_HEMATOLOGY,
  CORNELL_EQUINE_CHEMISTRY,
  CORNELL_EQUINE_IMMUNOLOGY,
  CORNELL_EQUINE_BLOOD_GAS,
};
