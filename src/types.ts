export type PatientCategory = 'ADULT_COLIC' | 'NEONATAL_FOAL' | 'ADULT_GI';

export type PatientType = 'ADULT' | 'FOAL' | 'BOTH';

export interface Patient {
  id: string;
  name: string;
  category: PatientCategory;
  age: string; // e.g., '12 hours', '5 years'
  weightKg: number;
  breed: string;
  gender: string;
  status: 'ACTIVE' | 'DISCHARGED' | 'DECEASED';
  admissionDate: string;
  
  // Neonatal specific
  gestationalAgeDays?: number;
  colostrumIntake?: 'ADEQUATE' | 'POOR' | 'NONE' | 'UNKNOWN';
  damHistory?: string;
}

export interface DrugFormularyItem {
  id: string;
  name: string;
  brandName?: string;
  category: string;
  doseMin: number;
  doseMax: number;
  doseDefault: number;
  doseUnit: string; // mg/kg, mcg/kg, IU/kg, mL/kg
  concentration: number;
  concentrationUnit: string; // mg/mL
  route: string[]; // IV, IM, PO, SC
  frequency: string; // q4h, q6h, q8h, q12h, q24h, PRN, CRI
  indications: string[];
  cautions: string;
  notes: string;
  isCRI: boolean;
  patientType: PatientType;
}

export interface ScoreBounds {
  min: number;
  max: number;
  isExact: boolean;
}

export interface NeonatalSepsisResult {
  brewerScore: ScoreBounds;
  sirsCriteriaCount: ScoreBounds;
  interpretation: 'LOW_RISK' | 'EQUIVOCAL' | 'HIGH_RISK';
}

export interface FoalSurvivalResult {
  score: ScoreBounds;
  survivalProbabilityRange: [number, number]; // e.g. [3, 97]
}

export interface AdultSepsisResult {
  score: ScoreBounds;
  interpretation: 'LOW_RISK' | 'POSSIBLE' | 'HIGHLY_PROBABLE';
}

export interface CASResult {
  score: ScoreBounds;
  prediction: 'SURVIVE' | 'DIE';
}

export interface BiomarkerEvaluator {
  saa?: { value: number; interpretation: 'NORMAL' | 'ACTIVE_INFLAMMATION' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' };
  ngal?: { value: number; interpretation: 'NORMAL' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK' };
  rpr?: { value: number; interpretation: 'NORMAL' | 'AT_RISK' | 'SEPSIS_RISK' };
}

export interface FlowsheetEntry {
  id: string;
  patientId: string;
  timestamp: string;
  recordedBy: string;
  
  // Vital Signs
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  mucousMembranes?: 'PINK' | 'PALE' | 'INJECTED' | 'CYANOTIC' | 'JAUNDICED' | 'TOXIC_RING';
  capillaryRefillTime?: number;
  
  // Lab values
  wbc?: number;
  bands?: number;
  toxicNeutrophils?: boolean;
  fibrinogen?: number;
  lactate?: number;
  glucose?: number;
  creatinine?: number;
  igg?: number;
  pao2?: number;
  paco2?: number;
  calcium?: number;
  pcv?: number;
  ck?: number;
  rbc?: number;
  saa?: number;
  ngal?: number;
  platelets?: number;
  rdw?: number;

  // Clinical signs
  coldExtremities?: boolean;
  hypotonia?: 'MILD' | 'SEVERE' | 'NONE';
  petechiae?: boolean;
  infectiousSitesCount?: number;
  
  // GI specific
  gutSounds?: 'NORMAL' | 'HYPOMOTILE' | 'ABSENT' | 'HYPERMOTILE';
  gastricRefluxVol?: number;
  abdominalUltrasound?: 'NORMAL' | 'ABNORMAL';
  rectalExam?: 'NORMAL' | 'ABNORMAL';
}
