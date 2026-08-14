export type PatientStatus =
  | 'CRITICAL'
  | 'WATCH'
  | 'NORMAL'
  | 'ACTIVE'
  | 'DISCHARGED'
  | 'DECEASED'
  | 'ARCHIVED';

/** Lifecycle states a patient record can be in, independent of clinical acuity. */
export type PatientLifecycle = 'AWAITING_ARRIVAL' | 'ACTIVE' | 'DISCHARGED' | 'ARCHIVED';

/**
 * Who and when — Architecture principle A. Any write stamps this at the point
 * of entry, never at save time. Built by `stampRecorded` in
 * `utils/recorded.ts`, which is the only place a `Recorded` value is ever
 * constructed, so `at` and `by` can never be set independently of each other.
 *
 * Existing write paths (`FlowsheetColumn.recordedAt`/`recordedBy`,
 * `Treatment.startedAt`/`prescribedBy`, `LabPanel.collectedAt`/`recordedBy`,
 * `Administration.at`/`by`) keep their own flat field names rather than
 * nesting a `recorded: Recorded` object — nesting would change the shape of
 * data already sitting in every clinician's `localStorage`, and
 * `SCHEMA_VERSION` bumping to account for it would wipe every stored patient.
 * `Recorded` is the shared shape those field pairs are held to, not a new
 * field on `Patient`.
 */
export interface Recorded {
  /** ISO timestamp, stamped at the moment of entry. */
  at: string;
  /** The clinician charting — never "Unattributed"; see CLAUDE.md rule 2. */
  by: string;
}

/**
 * Body systems involved in the primary problem. Drives the icon strip on the
 * flowsheet so the system under treatment is legible at a glance.
 */
export type BodySystem =
  | 'GASTROINTESTINAL'
  | 'RESPIRATORY'
  | 'NEUROLOGIC'
  | 'CARDIOVASCULAR'
  | 'MUSCULOSKELETAL'
  | 'URINARY'
  | 'REPRODUCTIVE'
  | 'INTEGUMENT'
  | 'OPHTHALMIC'
  | 'HEPATIC'
  | 'HAEMOLYMPHATIC'
  | 'ENDOCRINE';

export type ViewTab =
  | 'overview'
  | 'dashboard'
  | 'flowsheet'
  | 'intelligence'
  | 'assess'
  | 'scores'
  | 'calculator'
  | 'ranges'
  | 'patients'
  | 'meds'
  | 'labs'
  | 'sources';

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
  lactate?: number; // mmol/L — plasma
  /**
   * Peritoneal fluid lactate, mmol/L. Kept separate from plasma because the
   * comparison between the two is the finding: peritoneal exceeding plasma is
   * reported as an indicator of strangulated small intestine, and that is lost
   * if the two share a field.
   */
  peritonealLactate?: number; // mmol/L
  pcv?: number; // %
  tp?: number; // g/dL
  ionizedCalcium?: number | 'Pending'; // mmol/L
  glucose?: number | 'Pending'; // mg/dL
  igg?: number | 'Pending'; // mg/dL
  /** Total white cell count, K/µL. Leukopenia is an endotoxaemia sign. */
  wbc?: number;
}

/**
 * Neonatal clinical exam findings — Brewer & Koterba sepsis-score and Foal
 * Survival Score inputs that don't belong under GI, pain or laminitis.
 * Infectious sites is a list (not a count) so the record keeps which sites,
 * not just how many; the scoring engines read `infectiousSites.length`.
 */
export interface NeonatalExamData {
  coldExtremities?: boolean;
  hypotonia?: 'MILD' | 'SEVERE' | 'NONE';
  petechiae?: boolean;
  infectiousSites?: string[];
  /** Toxic granulation on the differential — read from the smear, not a count. */
  toxicNeutrophils?: boolean;
}

export interface FlowsheetColumn {
  /** Stable identity so a round can be edited or removed. */
  id?: string;
  time: string; // e.g. "14:00"
  /** Full ISO timestamp; `time` remains the display label. */
  recordedAt?: string;
  recordedBy?: string;
  editedBy?: string;
  editedAt?: string;
  vitals: VitalsData;
  gi: GIData;
  labs: LabsData;
  pain?: PainData;
  laminitis?: LaminitisData;
  support?: SupportData;
  neonatal?: NeonatalExamData;
  note?: string;
}

/** What kind of task is on the schedule. */
export type ScheduleTaskKind = 'TPR' | 'PHYSICAL_EXAM' | 'MEDICATION' | 'LAB';

/**
 * A recurring item on the patient's monitoring schedule. Intervals are set by
 * the attending clinician; `lastDoneAt` is the anchor the next due time is
 * computed from.
 */
export interface ScheduledTask {
  id: string;
  kind: ScheduleTaskKind;
  label: string;
  /** Hours between repeats. */
  intervalHours: number;
  /** ISO timestamp of the last completion, if any. */
  lastDoneAt?: string;
  /** Drug name and dose text, for MEDICATION tasks. */
  detail?: string;
  active: boolean;
}

/**
 * What kind of thing is running on the patient. Fluids and CRIs are continuous
 * and are followed by rate and elapsed time; intermittent medications are
 * followed by interval and next-dose time. The distinction changes what the
 * ward needs to see, so it is modelled rather than inferred from the drug name.
 */
export type TreatmentKind = 'MEDICATION' | 'FLUID' | 'CRI';

/** A single recorded administration of an intermittent medication. */
export interface Administration extends Recorded {
  id: string;
  /** What was actually given, e.g. "11.44 mL". */
  amountText?: string;
  note?: string;
}

/**
 * A drug, fluid or infusion on the patient's treatment sheet.
 *
 * `startedAt` is the time of application for a one-off, or the time the line
 * was started for anything continuous. A treatment stays on the sheet after it
 * ends — `stoppedAt` closes it rather than deleting it, so the record of what
 * ran and for how long survives, which is also what a future charge sheet will
 * be built from.
 */
export interface Treatment {
  id: string;
  kind: TreatmentKind;
  drug: string;
  /** Links back to the formulary entry the dose came from, when there is one. */
  formularyId?: string;
  /** Dose as prescribed, e.g. "1.1 mg/kg". */
  doseText?: string;
  /** Amount per administration derived by the calculator, e.g. "11.44 mL". */
  amountText?: string;
  route?: string;
  /** Hours between doses. Absent for continuous lines and single doses. */
  intervalHours?: number;
  /** Rate for continuous lines, e.g. "2 mL/kg/hr" or "0.05 mg/kg/min". */
  rateText?: string;
  /** ISO timestamp: time of application, or time the infusion was started. */
  startedAt: string;
  /** ISO timestamp; set when the treatment is discontinued. */
  stoppedAt?: string;
  stoppedBy?: string;
  stopReason?: string;
  prescribedBy?: string;
  administrations: Administration[];
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

/**
 * Sex in the equine vocabulary. The terms are age-dependent — a colt becomes a
 * stallion or gelding, a filly becomes a mare — so this is recorded alongside
 * the date of birth and the two together drive how the patient is labelled.
 */
export type EquineSex =
  | 'MARE'
  | 'FILLY'
  | 'STALLION'
  | 'COLT'
  | 'GELDING'
  | 'UNKNOWN';

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
  sirsCriteriaMet: boolean;
  sirsDescription?: string;
  
  // Neonatal specific if applicable
  isFoal?: boolean;
  fssPrematurityDays?: number;
  fssColdExtremities?: boolean;
  fssInfectiousSite?: string;
  
  criActive?: string;

  /** Sample data shipped with the app, so it can be filtered or purged. */
  isTest?: boolean;
  lifecycle?: PatientLifecycle;
  dischargedAt?: string;
  archivedAt?: string;
  /**
   * When the current admission/stay started, ISO timestamp. Set on admission
   * and again on every reactivation — never touched otherwise. Charted rounds
   * before this boundary are an earlier stay, not deleted, just not "current"
   * by default. See src/utils/admission.ts.
   */
  currentAdmissionStartedAt?: string;
  /** Primary problem, shown as the flowsheet banner. */
  diagnosis?: string;
  bodySystems?: BodySystem[];
  attendingClinician?: string;
  schedule?: ScheduledTask[];
  /** Drugs, fluids and infusions, open and closed. */
  treatments?: Treatment[];
  /** Full laboratory panels, newest last. */
  labPanels?: LabPanel[];
  /**
   * Date of birth, ISO `YYYY-MM-DD`. When present the age class is computed
   * from it rather than typed, so it stays correct as the patient ages —
   * which matters for a foal, where the reference intervals change weekly.
   */
  dateOfBirth?: string;
  sex?: EquineSex;
  
  // Merged from old patient
  category: PatientCategory;
  gender: string;
  admissionDate: string;
  owner: OwnerProfile;
  admissionExam?: AdmissionPhysicalExam;
  gestationalAgeDays?: number;
  colostrumIntake?: 'ADEQUATE' | 'POOR' | 'NONE' | 'UNKNOWN';
  /** Free-text note. Not read for scoring — see abnormalPerinatalHistory. */
  damHistory?: string;
  /**
   * Brewer & Koterba's history item (dystocia, placentitis, previous foal
   * loss, etc.) — a clinician judgement, not inferred from damHistory being
   * non-empty. The neonatal sepsis score previously scored any dam-history
   * text as abnormal, including a normal foaling note.
   */
  abnormalPerinatalHistory?: boolean;
}

/**
 * A full laboratory panel drawn at one point in time.
 *
 * Only entered parameters are stored. Anything calculable from them — the red
 * cell indices, globulin, the differential percentages — is computed on read,
 * so a stored panel can never disagree with its own arithmetic.
 */
export interface LabPanel {
  id: string;
  /** ISO timestamp the sample was collected. */
  collectedAt: string;
  recordedBy?: string;
  sampleType?: string;
  /** Parameter id to entered value. Derived parameters never appear here. */
  values: Record<string, number>;
  note?: string;
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

export interface BiomarkerEvaluator {
  saa?: {
    value: number;
    interpretation: 'NORMAL' | 'ACTIVE_INFLAMMATION' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK';
    source: string;
  };
  ngal?: {
    value: number;
    interpretation: 'NORMAL' | 'SEPSIS_RISK' | 'HIGH_MORTALITY_RISK';
    source: string;
  };
  rpr?: { value: number; interpretation: 'NORMAL' | 'AT_RISK' | 'SEPSIS_RISK'; source: string };
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
  mucousMembranes?:
    | 'PINK'
    | 'PALE'
    | 'INJECTED'
    | 'CYANOTIC'
    | 'JAUNDICED'
    | 'TOXIC_RING'
    | 'MUDDY';
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
