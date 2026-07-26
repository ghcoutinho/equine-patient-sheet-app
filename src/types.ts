export type PatientCategory = 'ADULT_COLIC' | 'NEONATAL_FOAL' | 'ADULT_GI';

export type PatientType = 'ADULT' | 'FOAL' | 'BOTH';

export interface OwnerProfile {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  insuranceInfo?: string;
}

export interface AdmissionPhysicalExam {
  classification: 'CRITICAL' | 'STABLE' | 'NEEDS_TRIAGE' | 'ROUTINE';
  notes?: string;
}

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
  
  owner: OwnerProfile;
  admissionExam?: AdmissionPhysicalExam;

  // Neonatal specific
  gestationalAgeDays?: number;
  colostrumIntake?: 'ADEQUATE' | 'POOR' | 'NONE' | 'UNKNOWN';
  damHistory?: string;
}

export interface DrugFormularyItem {
  id: string;
  name: string;
  brandName?: string;
  categories: string[];
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
  eosinopenia?: boolean;
  albumin?: number; // g/L
  creatinine?: number; // µmol/L
  syndecan1?: number; // ng/mL
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
  rpr?: number;

  // Clinical signs
  coldExtremities?: boolean;
  hypotonia?: 'MILD' | 'SEVERE' | 'NONE';
  petechiae?: boolean;
  infectiousSitesCount?: number;
  
  // GI specific
  gutSounds?: 'NORMAL' | 'HYPOMOTILE' | 'ABSENT' | 'HYPERMOTILE';
  gastricRefluxVol?: number;
  postOpReflux?: boolean;
  abdominalUltrasound?: 'NORMAL' | 'ABNORMAL';
  rectalExam?: 'NORMAL' | 'ABNORMAL';
}
