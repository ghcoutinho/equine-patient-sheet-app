export type PatientStatus = 'CRITICAL' | 'WATCH' | 'NORMAL' | 'ACTIVE' | 'DISCHARGED' | 'DECEASED';

export type ViewTab = 
  | 'overview' 
  | 'dashboard' 
  | 'flowsheet' 
  | 'intelligence' 
  | 'assess' 
  | 'scores' 
  | 'calculator'
  | 'ranges';

export type FlowsheetSection = 'VITALS' | 'GI' | 'LABS';

/**
 * Triage weight carried by a structured (non-numeric) clinical finding.
 * Used for cell colour and for escalating call-surgeon triggers. It is a
 * display/triage weighting agreed with the attending clinician — not a
 * validated score, and it is never presented as one.
 */
export type AssessmentSeverity = 'normal' | 'watch' | 'warning' | 'critical';

/**
 * Auscultation grade for a single abdominal quadrant.
 * '++' hypermotile · '+' normal · '-' reduced · '0' absent
 */
export type GutSoundGrade = '++' | '+' | '-' | '0';

/**
 * Gut sounds recorded per abdominal quadrant rather than as a single
 * impression. Ported from the Colic Monitoring Tool, renamed from
 * upper/lower to the anatomical dorsal/ventral convention.
 */
export interface GutSoundsQuadrants {
  leftDorsal: GutSoundGrade;
  leftVentral: GutSoundGrade;
  rightDorsal: GutSoundGrade;
  rightVentral: GutSoundGrade;
}

export interface ManureRecord {
  passed: boolean;
  amount?: 'Small' | 'Moderate' | 'Abundant';
  consistency?: 'Normal pellets' | 'Soft / cow-pat' | 'Watery diarrhoea' | 'Mucus-covered';
}

export interface VitalsData {
  temperatureC?: number; // °C
  temperatureF?: number; // °F
  heartRate?: number; // bpm
  respiratoryRate?: number; // brpm
  mucousMembranes?: string;
  crtSeconds?: number; // seconds
  mentation?: string;
}

export interface GIData {
  refluxVolumeL?: number; // Liters
  motility?: 'Normal' | 'Decreased' | 'Absent' | 'Hyper-motile';
  borborygmi?: string;
  /** Four-quadrant auscultation. `motility` is derived from this when present. */
  gutSounds?: GutSoundsQuadrants;
  refluxAppearance?: string;
  nasogastricTube?: string;
  manure?: ManureRecord;
  rectalExam?: string;
  flashUltrasound?: string;
  peritonealFluid?: string;
  responseToTherapy?: string;
}

export interface PainData {
  /** 0–3 composite pain score. 0 is a finding, not missing data. */
  score?: number;
  behaviour?: string;
  analgesia?: string;
}

export interface LaminitisData {
  digitalPulse?: string;
  /** Obel grade 0–4. 0 is a finding, not missing data. */
  obelGrade?: number;
  cryotherapy?: string;
}

export interface SupportData {
  ivCatheterSite?: string;
  incisionStatus?: string;
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
  pain?: PainData;
  laminitis?: LaminitisData;
  support?: SupportData;
  note?: string;
}

/**
 * Thresholds that escalate a finding to a "call the surgeon" alert.
 * Defaults follow the Colic Monitoring Tool; the attending clinician can
 * override them per patient.
 */
export interface TriggerThresholds {
  heartRateBpm: number;
  respRateBpm: number;
  refluxLiters: number;
  painScore: number;
  lactateMmolL: number;
  temperatureC: number;
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
  /**
   * Dosing that changes with foal age, where the source stratifies it.
   * Neonatal clearance is lower and volume of distribution larger, so a single
   * mg/kg figure is wrong for at least one age band.
   */
  foalAgeBands?: { label: string; dose: string; route?: string; frequency?: string }[];
  /** Provenance for entries taken from a specific published table. */
  sourceNote?: string;
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
