export interface ReferenceRange {
  parameter: string;
  min: number;
  max: number;
  unit: string;
  isAbnormalLowSIRS?: boolean;
  isAbnormalHighSIRS?: boolean;
  notes?: string;
}

export const NEONATAL_REFERENCE_RANGES: Record<string, ReferenceRange[]> = {
  vitals: [
    { parameter: 'Temperature', min: 37.8, max: 38.9, unit: '°C', isAbnormalLowSIRS: true, isAbnormalHighSIRS: true, notes: 'SIRS: < 37.2°C or > 39.5°C' },
    { parameter: 'Heart Rate', min: 70, max: 100, unit: 'bpm', isAbnormalLowSIRS: true, isAbnormalHighSIRS: true, notes: 'SIRS: < 60 bpm or > 120 bpm' },
    { parameter: 'Respiratory Rate', min: 30, max: 40, unit: 'bpm', isAbnormalHighSIRS: true, notes: 'SIRS: > 56 bpm' }
  ],
  hematology: [
    { parameter: 'WBC', min: 5000, max: 12000, unit: '/µL', isAbnormalLowSIRS: true, isAbnormalHighSIRS: true, notes: 'SIRS: < 4000 or > 12500' },
    { parameter: 'Band Neutrophils', min: 0, max: 50, unit: '/µL', isAbnormalHighSIRS: true, notes: 'SIRS: > 10% bands' },
    { parameter: 'Fibrinogen', min: 150, max: 400, unit: 'mg/dL' },
    { parameter: 'Lactate', min: 0, max: 2.0, unit: 'mmol/L', notes: 'Severe: > 4.0 mmol/L' }
  ],
  chemistry: [
    { parameter: 'Glucose', min: 80, max: 120, unit: 'mg/dL', notes: 'Hypoglycemia: < 80, Severe: < 40' },
    { parameter: 'Creatinine', min: 1.0, max: 2.0, unit: 'mg/dL', notes: 'Negative prognostic indicator if > 2.5' },
    { parameter: 'IgG', min: 800, max: 3000, unit: 'mg/dL', notes: 'Partial FPT: 400-800, Complete FPT: < 400' }
  ],
  biomarkers: [
    { parameter: 'SAA', min: 0, max: 20, unit: 'mg/L', notes: 'Sepsis Detection: > 1050 mg/L' },
    { parameter: 'NGAL', min: 0, max: 450, unit: 'µg/L', notes: 'Sepsis Detection: > 455 µg/L' },
    { parameter: 'RPR (RDW/Plt)', min: 0, max: 0.05, unit: 'ratio', notes: 'Sepsis Risk: > 0.09' }
  ]
};
