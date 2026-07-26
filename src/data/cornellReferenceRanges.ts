export interface LabParameterRange {
  id: string;
  name: string;
  sectionGroup: 'Hematology' | 'Chemistry' | 'Immunology' | 'Quick Labs';
  units: string;
  referenceMin: number;
  referenceMax: number;
  criticalMin?: number;
  criticalMax?: number;
}

export const CORNELL_EQUINE_CHEMISTRY: LabParameterRange[] = [
  { id: 'lab_sodium', name: 'Sodium', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 134, referenceMax: 142 },
  { id: 'lab_potassium', name: 'Potassium', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 2.4, referenceMax: 4.8 },
  { id: 'lab_chloride', name: 'Chloride', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 95, referenceMax: 104 },
  { id: 'lab_bicarbonate', name: 'Bicarbonate', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 24, referenceMax: 31 },
  { id: 'lab_anion_gap', name: 'Anion Gap', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 12, referenceMax: 19 },
  { id: 'lab_bun', name: 'Urea nitrogen (BUN)', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 10, referenceMax: 22 },
  { id: 'lab_creatinine', name: 'Creatinine', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 0.8, referenceMax: 1.5, criticalMax: 3.5 },
  { id: 'lab_calcium', name: 'Calcium', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 10.8, referenceMax: 12.9 },
  { id: 'lab_phosphate', name: 'Phosphate', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 2.1, referenceMax: 4.7 },
  { id: 'lab_magnesium', name: 'Magnesium', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 1.2, referenceMax: 1.9 },
  { id: 'lab_tp', name: 'Total protein', sectionGroup: 'Chemistry', units: 'g/dL', referenceMin: 5.4, referenceMax: 7.0, criticalMin: 4.5, criticalMax: 9.0 },
  { id: 'lab_albumin', name: 'Albumin', sectionGroup: 'Chemistry', units: 'g/dL', referenceMin: 2.9, referenceMax: 3.6, criticalMin: 2.0 },
  { id: 'lab_globulin', name: 'Globulin', sectionGroup: 'Chemistry', units: 'g/dL', referenceMin: 2.3, referenceMax: 3.8 },
  { id: 'lab_ag_ratio', name: 'A/G ratio', sectionGroup: 'Chemistry', units: '', referenceMin: 0.8, referenceMax: 1.5 },
  { id: 'lab_glucose', name: 'Glucose', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 71, referenceMax: 122, criticalMin: 40, criticalMax: 250 },
  { id: 'lab_ast', name: 'AST', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 222, referenceMax: 489 },
  { id: 'lab_gldh', name: 'GLDH', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 2, referenceMax: 10 },
  { id: 'lab_ldh', name: 'LDH', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 218, referenceMax: 555 },
  { id: 'lab_alp', name: 'ALP', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 88, referenceMax: 261 },
  { id: 'lab_ggt', name: 'GGT', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 8, referenceMax: 33 },
  { id: 'lab_tbili', name: 'Total bilirubin', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 0.5, referenceMax: 2.1 },
  { id: 'lab_dbili', name: 'Direct bilirubin', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 0.1, referenceMax: 0.3 },
  { id: 'lab_ibili', name: 'Indirect bilirubin', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 0.3, referenceMax: 2.0 },
  { id: 'lab_cholesterol', name: 'Cholesterol', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 68, referenceMax: 133 },
  { id: 'lab_triglycerides', name: 'Triglycerides', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 14, referenceMax: 65, criticalMax: 500 },
  { id: 'lab_amylase', name: 'Amylase', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 3, referenceMax: 8 },
  { id: 'lab_lipase', name: 'Lipase DGGR', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 7, referenceMax: 16 },
  { id: 'lab_ck', name: 'CK', sectionGroup: 'Chemistry', units: 'U/L', referenceMin: 171, referenceMax: 567, criticalMax: 10000 },
  { id: 'lab_iron', name: 'Iron', sectionGroup: 'Chemistry', units: 'ug/dL', referenceMin: 95, referenceMax: 217 },
  { id: 'lab_tibc', name: 'TIBC', sectionGroup: 'Chemistry', units: 'ug/dL', referenceMin: 289, referenceMax: 535 },
  { id: 'lab_sat', name: '%Sat', sectionGroup: 'Chemistry', units: '%', referenceMin: 27, referenceMax: 56 },
  { id: 'lab_bile_acids', name: 'Bile Acids', sectionGroup: 'Chemistry', units: 'umol/L', referenceMin: 2, referenceMax: 10 },
  { id: 'lab_nefa', name: 'NEFA', sectionGroup: 'Chemistry', units: 'mEq/L', referenceMin: 0.02, referenceMax: 0.43 },
  { id: 'lab_bhb', name: 'BHB', sectionGroup: 'Chemistry', units: 'mg/dL', referenceMin: 1.0, referenceMax: 3.1 },
  { id: 'lab_fructosamine', name: 'Fructosamine', sectionGroup: 'Chemistry', units: 'umol/L', referenceMin: 284, referenceMax: 387 },
  { id: 'lab_ionized_calcium', name: 'Ionized Calcium (ABL-800 Flex)', sectionGroup: 'Chemistry', units: 'mmol/L', referenceMin: 1.40, referenceMax: 1.72, criticalMin: 1.0, criticalMax: 2.0 },
  { id: 'lab_saa', name: 'SAA', sectionGroup: 'Chemistry', units: 'ug/mL', referenceMin: 0, referenceMax: 8, criticalMax: 100 },
];

export const CORNELL_EQUINE_HEMATOLOGY: LabParameterRange[] = [
  { id: 'lab_pcv', name: 'Hematocrit (PCV %)', sectionGroup: 'Hematology', units: '%', referenceMin: 32, referenceMax: 48, criticalMin: 20, criticalMax: 65 },
  { id: 'lab_rbc', name: 'RBC', sectionGroup: 'Hematology', units: 'M/uL', referenceMin: 6.5, referenceMax: 11.0 },
  { id: 'lab_hgb', name: 'Hemoglobin', sectionGroup: 'Hematology', units: 'g/dL', referenceMin: 11.0, referenceMax: 18.0 },
  { id: 'lab_mcv', name: 'MCV', sectionGroup: 'Hematology', units: 'fL', referenceMin: 38, referenceMax: 49 },
  { id: 'lab_mch', name: 'MCH', sectionGroup: 'Hematology', units: 'pg', referenceMin: 13, referenceMax: 17 },
  { id: 'lab_mchc', name: 'MCHC', sectionGroup: 'Hematology', units: 'g/dL', referenceMin: 34, referenceMax: 38 },
  { id: 'lab_platelets', name: 'Platelets', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 100, referenceMax: 300, criticalMin: 40 },
  { id: 'lab_wbc', name: 'WBC', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 5.4, referenceMax: 11.4, criticalMin: 2.5, criticalMax: 20.0 },
  { id: 'lab_neuts_seg', name: 'Neutrophils (seg)', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 2.7, referenceMax: 6.8 },
  { id: 'lab_neuts_band', name: 'Neutrophils (band)', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 0, referenceMax: 0, criticalMax: 0.5 },
  { id: 'lab_lymphocytes', name: 'Lymphocytes', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 1.5, referenceMax: 4.5 },
  { id: 'lab_monocytes', name: 'Monocytes', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 0, referenceMax: 0.8 },
  { id: 'lab_eosinophils', name: 'Eosinophils', sectionGroup: 'Hematology', units: 'K/uL', referenceMin: 0, referenceMax: 0.6 },
  { id: 'lab_fibrinogen', name: 'Fibrinogen', sectionGroup: 'Hematology', units: 'mg/dL', referenceMin: 100, referenceMax: 400, criticalMax: 800 },
];

export const CORNELL_EQUINE_IMMUNOLOGY: LabParameterRange[] = [
  { id: 'lab_igg', name: 'IgG', sectionGroup: 'Immunology', units: 'mg/dL', referenceMin: 1000, referenceMax: 3000, criticalMin: 400 },
  { id: 'lab_igm', name: 'IgM', sectionGroup: 'Immunology', units: 'mg/dL', referenceMin: 60, referenceMax: 250 },
  { id: 'lab_iga', name: 'IgA', sectionGroup: 'Immunology', units: 'mg/dL', referenceMin: 100, referenceMax: 400 },
];

// Special category for Quick Labs
export const QUICK_LABS: LabParameterRange[] = [
  { id: 'ht_pcv', name: 'Hematocrit (PCV %)', sectionGroup: 'Quick Labs', units: '%', referenceMin: 32, referenceMax: 48, criticalMin: 20, criticalMax: 65 },
  { id: 'tp', name: 'Total protein', sectionGroup: 'Quick Labs', units: 'g/dL', referenceMin: 5.4, referenceMax: 7.0, criticalMin: 4.5, criticalMax: 9.0 },
  { id: 'lactate', name: 'Systemic Lactate', sectionGroup: 'Quick Labs', units: 'mmol/L', referenceMin: 0.5, referenceMax: 1.5, criticalMax: 5.0 },
];

export const ALL_CORNELL_LABS = [
  ...QUICK_LABS,
  ...CORNELL_EQUINE_HEMATOLOGY,
  ...CORNELL_EQUINE_CHEMISTRY,
  ...CORNELL_EQUINE_IMMUNOLOGY
];
