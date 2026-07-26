export interface FlowsheetRowDef {
  id: string;
  label: string;
  unit: string;
  type: 'number' | 'select' | 'boolean';
  options?: string[]; // for select
  category: 'VITALS' | 'CLINICAL' | 'LABS' | 'GI' | 'BIOMARKERS';
}

export const NEONATAL_FLOWSHEET_ROWS: FlowsheetRowDef[] = [
  { id: 'temperature', label: 'Temp', unit: '°C', type: 'number', category: 'VITALS' },
  { id: 'heartRate', label: 'HR', unit: 'bpm', type: 'number', category: 'VITALS' },
  { id: 'respiratoryRate', label: 'RR', unit: 'bpm', type: 'number', category: 'VITALS' },
  { id: 'mucousMembranes', label: 'MM', unit: '', type: 'select', options: ['PINK', 'PALE', 'INJECTED', 'CYANOTIC', 'JAUNDICED', 'TOXIC_RING'], category: 'VITALS' },
  { id: 'capillaryRefillTime', label: 'CRT', unit: 's', type: 'number', category: 'VITALS' },
  
  { id: 'hypotonia', label: 'Hypotonia', unit: '', type: 'select', options: ['NONE', 'MILD', 'SEVERE'], category: 'CLINICAL' },
  { id: 'coldExtremities', label: 'Cold Extr.', unit: '', type: 'boolean', category: 'CLINICAL' },
  { id: 'petechiae', label: 'Petechiae', unit: '', type: 'boolean', category: 'CLINICAL' },
  { id: 'infectiousSitesCount', label: 'Inf. Sites', unit: 'count', type: 'number', category: 'CLINICAL' },

  { id: 'wbc', label: 'WBC', unit: '/µL', type: 'number', category: 'LABS' },
  { id: 'bands', label: 'Bands', unit: '/µL', type: 'number', category: 'LABS' },
  { id: 'toxicNeutrophils', label: 'Toxic Neutr.', unit: '', type: 'boolean', category: 'LABS' },
  { id: 'fibrinogen', label: 'Fibrinogen', unit: 'mg/dL', type: 'number', category: 'LABS' },
  { id: 'lactate', label: 'Lactate', unit: 'mmol/L', type: 'number', category: 'LABS' },
  { id: 'glucose', label: 'Glucose', unit: 'mg/dL', type: 'number', category: 'LABS' },
  { id: 'creatinine', label: 'Creatinine', unit: 'mg/dL', type: 'number', category: 'LABS' },
  { id: 'igg', label: 'IgG', unit: 'mg/dL', type: 'number', category: 'LABS' },

  { id: 'saa', label: 'SAA', unit: 'mg/L', type: 'number', category: 'BIOMARKERS' },
  { id: 'ngal', label: 'NGAL', unit: 'µg/L', type: 'number', category: 'BIOMARKERS' },
  { id: 'rpr', label: 'RPR', unit: 'ratio', type: 'number', category: 'BIOMARKERS' }
];

export const ADULT_COLIC_FLOWSHEET_ROWS: FlowsheetRowDef[] = [
  { id: 'temperature', label: 'Temp', unit: '°C', type: 'number', category: 'VITALS' },
  { id: 'heartRate', label: 'HR', unit: 'bpm', type: 'number', category: 'VITALS' },
  { id: 'respiratoryRate', label: 'RR', unit: 'bpm', type: 'number', category: 'VITALS' },
  { id: 'mucousMembranes', label: 'MM', unit: '', type: 'select', options: ['PINK', 'PALE', 'INJECTED', 'CYANOTIC', 'TOXIC_RING'], category: 'VITALS' },
  { id: 'capillaryRefillTime', label: 'CRT', unit: 's', type: 'number', category: 'VITALS' },

  { id: 'gutSounds', label: 'Gut Sounds', unit: '', type: 'select', options: ['NORMAL', 'HYPOMOTILE', 'ABSENT', 'HYPERMOTILE'], category: 'GI' },
  { id: 'gastricRefluxVol', label: 'Net Reflux', unit: 'L', type: 'number', category: 'GI' },
  { id: 'abdominalUltrasound', label: 'Ultrasound', unit: '', type: 'select', options: ['NORMAL', 'ABNORMAL'], category: 'GI' },
  { id: 'rectalExam', label: 'Rectal Exam', unit: '', type: 'select', options: ['NORMAL', 'ABNORMAL'], category: 'GI' },

  { id: 'pcv', label: 'PCV', unit: '%', type: 'number', category: 'LABS' },
  { id: 'lactate', label: 'Lactate', unit: 'mmol/L', type: 'number', category: 'LABS' },
  { id: 'wbc', label: 'WBC', unit: '/µL', type: 'number', category: 'LABS' },
  { id: 'calcium', label: 'Calcium', unit: 'mg/dL', type: 'number', category: 'LABS' },
  { id: 'ck', label: 'CK', unit: 'U/L', type: 'number', category: 'LABS' },
  { id: 'rbc', label: 'RBC', unit: 'x10^6/µL', type: 'number', category: 'LABS' }
];
