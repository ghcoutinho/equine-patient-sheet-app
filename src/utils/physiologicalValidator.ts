import type { PatientCategory, FlowsheetEntry } from '../types';

interface ValidationRule {
  min: number;
  max: number;
}

export interface ClinicalAlert {
  field: string;
  message: string;
  severity: 'warning' | 'critical' | 'info';
}

const VALIDATION_RULES: Record<PatientCategory, Record<string, ValidationRule>> = {
  NEONATAL_FOAL: {
    heartRate: { min: 40, max: 250 },
    respiratoryRate: { min: 10, max: 120 },
    temperature: { min: 35.0, max: 41.5 },
    wbc: { min: 0, max: 50000 },
    lactate: { min: 0, max: 30 },
    glucose: { min: 0, max: 400 },
    igg: { min: 0, max: 4000 },
  },
  ADULT_COLIC: {
    heartRate: { min: 20, max: 120 },
    respiratoryRate: { min: 6, max: 100 },
    temperature: { min: 35.0, max: 41.5 },
    wbc: { min: 0, max: 50000 },
    lactate: { min: 0, max: 30 },
    glucose: { min: 0, max: 400 },
    pcv: { min: 10, max: 80 },
    albumin: { min: 10, max: 60 },
  },
  ADULT_GI: {
    heartRate: { min: 20, max: 120 },
    respiratoryRate: { min: 6, max: 100 },
    temperature: { min: 35.0, max: 41.5 },
    wbc: { min: 0, max: 50000 },
    lactate: { min: 0, max: 30 },
    glucose: { min: 0, max: 400 },
    pcv: { min: 10, max: 80 },
    albumin: { min: 10, max: 60 },
  }
};

export function validatePhysiologicalParameters(
  category: PatientCategory,
  entry: Partial<FlowsheetEntry>
): { isValid: boolean; errors: string[]; alerts: ClinicalAlert[] } {
  const errors: string[] = [];
  const alerts: ClinicalAlert[] = [];
  const rules = VALIDATION_RULES[category];

  if (!rules) return { isValid: true, errors: [], alerts: [] }; // Fallback

  for (const [key, value] of Object.entries(entry)) {
    if (typeof value === 'number' && rules[key]) {
      const { min, max } = rules[key];
      if (value < min || value > max) {
        errors.push(`Value ${value} for ${key} is outside plausible range (${min}-${max})`);
      }
    }
  }

  // Eosinopenia (Negative Prognostic Indicator)
  if (entry.eosinopenia) {
    alerts.push({
      field: 'eosinopenia',
      message: 'Severe Eosinopenia is an independent negative prognostic indicator (High Risk).',
      severity: 'critical'
    });
  }

  // Adult specific prognostic cutoffs (Bottegaro 2024 & McGovern 2025)
  if (category === 'ADULT_COLIC' || category === 'ADULT_GI') {
    // Bottegaro 2024 Cutoffs
    if (entry.heartRate !== undefined && entry.heartRate > 75) {
      alerts.push({ field: 'heartRate', message: 'HR > 75 bpm associated with non-survival.', severity: 'critical' });
    }
    if (entry.respiratoryRate !== undefined && entry.respiratoryRate > 33) {
      alerts.push({ field: 'respiratoryRate', message: 'RR > 33 associated with non-survival.', severity: 'critical' });
    }
    if (entry.lactate !== undefined && entry.lactate > 3.7) {
      alerts.push({ field: 'lactate', message: 'Lactate > 3.7 mmol/L associated with non-survival.', severity: 'critical' });
    }
    if (entry.pcv !== undefined && entry.pcv > 46) {
      alerts.push({ field: 'pcv', message: 'Haematocrit > 46% associated with non-survival.', severity: 'critical' });
    }
    if (entry.albumin !== undefined && entry.albumin > 32) {
      alerts.push({ field: 'albumin', message: 'Albumin > 32 g/L associated with non-survival.', severity: 'critical' });
    }

    // McGovern 2025 Cutoffs
    if (entry.postOpReflux) {
      alerts.push({ field: 'postOpReflux', message: 'Development of Post-Op Reflux drops survival to 44%.', severity: 'critical' });
    }
    if (entry.creatinine !== undefined && entry.creatinine > 159) {
      alerts.push({ field: 'creatinine', message: 'Creatinine > 159 µmol/L in acute GI disease significantly drops survival.', severity: 'critical' });
    }
    if (entry.lactate !== undefined && entry.lactate > 2.8 && entry.lactate <= 3.7) {
      alerts.push({ field: 'lactate', message: 'Lactate > 2.8 mmol/L drops survival in acute diarrhea/colitis.', severity: 'warning' });
    }
    if (entry.syndecan1 !== undefined && entry.syndecan1 > 11.26) {
      alerts.push({ field: 'syndecan1', message: 'Syndecan-1 > 11.26 ng/mL indicates severe sepsis/intestinal disease.', severity: 'critical' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    alerts
  };
}
