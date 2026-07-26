export type PatientStatus = 'CRITICAL' | 'WATCH' | 'NORMAL' | 'ACTIVE' | 'DISCHARGED' | 'DECEASED';

export type ViewTab = 
  | 'overview' 
  | 'dashboard' 
  | 'flowsheet' 
  | 'intelligence' 
  | 'assess' 
  | 'scores' 
  | 'calculator';

export type FlowsheetSection = 'VITALS' | 'GI' | 'LABS';

export interface VitalsData {
  temperatureC?: number; // °C
  temperatureF?: number; // °F
  heartRate?: number; // bpm
  respiratoryRate?: number; // brpm
}

export interface GIData {
  refluxVolumeL?: number; // Liters
  motility?: 'Normal' | 'Decreased' | 'Absent' | 'Hyper-motile';
  borborygmi?: string;
}

export interface LabsData {
  lactate?: number; // mmol/L
  pcv?: number; // %
  tp?: number; // g/dL
  ionizedCalcium?: number | 'Pending'; // mmol/L
  glucose?: number | 'Pending'; // mg/dL
  igg?: number | 'Pending'; // mg/dL
}

export interface FlowsheetColumn {
  time: string; // e.g. "14:00"
  vitals: VitalsData;
  gi: GIData;
  labs: LabsData;
  note?: string;
}

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
  caseNumber: string;
  breed: string;
  weightKg: number;
  age: string; // Made required to merge
  location: string;
  status: PatientStatus;
  statusLabel?: string; 
  lastObsTime: string; 
  flowsheetHistory: FlowsheetColumn[];
  
  // Scoring details
  casScoreConfirmed: number;
  casScoreMaxPending: number;
  sirsCriteriaMet: boolean;
  sirsDescription?: string;
  
  // Neonatal specific if applicable
  isFoal?: boolean;
  fssPrematurityDays?: number;
  fssColdExtremities?: boolean;
  fssInfectiousSite?: string;
  
  criActive?: string;
  
  // Merged from old patient
  category: PatientCategory;
  gender: string;
  admissionDate: string;
  owner: OwnerProfile;
  admissionExam?: AdmissionPhysicalExam;
  gestationalAgeDays?: number;
  colostrumIntake?: 'ADEQUATE' | 'POOR' | 'NONE' | 'UNKNOWN';
  damHistory?: string;
}

export interface MedicationCalc {
  id: string;
  name: string;
  category: string;
  concentrationMgMl?: number;
  defaultDoseMgKg: number;
  minDoseMgKg: number;
  maxDoseMgKg: number;
  isCRI?: boolean;
  criUnit?: string;
  route: 'IV' | 'IM' | 'PO' | 'CRI';
}

export interface DrugFormularyItem {
  id: string;
  name: string;
  brandName?: string;
  categories: string[];
  doseMin: number;
  doseMax: number;
  doseDefault: number;
  doseUnit: string; 
  concentration: number;
  concentrationUnit: string; 
  route: string[]; 
  frequency: string; 
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
  survivalProbabilityRange: [number, number]; 
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
  albumin?: number;
  creatinine?: number;
  syndecan1?: number;
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
