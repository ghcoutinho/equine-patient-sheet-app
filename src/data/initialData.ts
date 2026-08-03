import { Patient, MedicationCalc } from '../types';
import { defaultSchedule } from '../utils/schedule';

const DEFAULT_ADULT_SCHEDULE = defaultSchedule(false);
const DEFAULT_FOAL_SCHEDULE = defaultSchedule(true);

/**
 * Sample patients shipped with the app. Every record is flagged isTest so it can
 * be filtered out of the ward board or purged once real cases are admitted, and
 * so a demo case can never be mistaken for a live one.
 */
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Thunder (TEST)',
    isTest: true,
    lifecycle: 'ACTIVE',
    diagnosis: 'Large colon volvulus — post-operative',
    bodySystems: ['GASTROINTESTINAL', 'CARDIOVASCULAR'],
    schedule: DEFAULT_ADULT_SCHEDULE,
    caseNumber: '#88219',
    breed: 'Thoroughbred',
    weightKg: 520,
    age: '6 Yrs',
    location: 'Barn 1 - Stall 4',
    status: 'CRITICAL',
    statusLabel: 'SIRS ALERT',
    lastObsTime: '4 min ago',
    category: 'ADULT_COLIC',
    gender: 'Gelding',
    admissionDate: '2026-07-26',
    owner: { name: 'John Doe' },
    sirsCriteriaMet: true,
    sirsDescription: 'HR > 60, Temp > 38.5°C, Lactate > 2.0 mmol/L',
    flowsheetHistory: [
      {
        time: '14:00',
        vitals: { heartRate: 90, temperatureC: 38.2, respiratoryRate: 28 },
        gi: { refluxVolumeL: 2.0, motility: 'Decreased' },
        labs: { lactate: 1.8, pcv: 42, tp: 7.2, ionizedCalcium: 1.25 }
      },
      {
        time: '14:15',
        vitals: { heartRate: 92, temperatureC: 38.9, respiratoryRate: 32 },
        gi: { refluxVolumeL: 4.5, motility: 'Absent' },
        labs: { lactate: 3.1, pcv: 46, tp: 7.6, ionizedCalcium: 'Pending' }
      },
      {
        time: '14:30',
        vitals: { heartRate: 110, temperatureC: 39.5, respiratoryRate: 36 },
        gi: { refluxVolumeL: 8.0, motility: 'Absent' },
        labs: { lactate: 6.2, pcv: 52, tp: 8.1, ionizedCalcium: 'Pending' }
      }
    ]
  },
  {
    id: 'p2',
    name: 'Star Gazer (TEST)',
    isTest: true,
    lifecycle: 'ACTIVE',
    diagnosis: 'Small intestinal strangulating obstruction',
    bodySystems: ['GASTROINTESTINAL'],
    schedule: DEFAULT_ADULT_SCHEDULE,
    caseNumber: '#88219',
    breed: 'Arabian',
    weightKg: 450,
    age: '8 Yrs',
    location: 'Barn 2 - Stall 2',
    status: 'WATCH',
    statusLabel: 'COLIC WATCH',
    lastObsTime: '14 min ago',
    category: 'ADULT_GI',
    gender: 'Mare',
    admissionDate: '2026-07-25',
    owner: { name: 'Jane Smith' },
    criActive: 'Lidocaine Active',
    sirsCriteriaMet: true,
    sirsDescription: 'HR > 60 & RR > 30 detected.',
    flowsheetHistory: [
      {
        time: '13:30',
        vitals: { heartRate: 44, temperatureC: 38.0, respiratoryRate: 20 },
        gi: { refluxVolumeL: 1.5, motility: 'Decreased' },
        labs: { lactate: 1.4, pcv: 38, tp: 6.8, ionizedCalcium: 1.28 }
      },
      {
        time: '14:00',
        vitals: { heartRate: 48, temperatureC: 38.4, respiratoryRate: 24 },
        gi: { refluxVolumeL: 2.0, motility: 'Decreased' },
        labs: { lactate: 1.8, pcv: 40, tp: 7.0, ionizedCalcium: 1.22 }
      },
      {
        time: '14:15',
        vitals: { heartRate: 52, temperatureC: 38.9, respiratoryRate: 36 },
        gi: { refluxVolumeL: 4.5, motility: 'Absent' },
        labs: { lactate: 2.4, pcv: 44, tp: 7.4, ionizedCalcium: 'Pending' }
      }
    ]
  },
  {
    id: 'p3',
    name: 'Bella (TEST)',
    isTest: true,
    lifecycle: 'ACTIVE',
    diagnosis: 'Pelvic flexure impaction — medical management',
    bodySystems: ['GASTROINTESTINAL'],
    schedule: DEFAULT_ADULT_SCHEDULE,
    caseNumber: '#91024',
    breed: 'Warmblood',
    weightKg: 610,
    age: '11 Yrs',
    location: 'Barn 3 - Stall 8',
    status: 'NORMAL',
    statusLabel: 'MONITORING',
    lastObsTime: '42 min ago',
    category: 'ADULT_COLIC',
    gender: 'Mare',
    admissionDate: '2026-07-24',
    owner: { name: 'Acme Farms' },
    sirsCriteriaMet: false,
    sirsDescription: 'Normal parameters.',
    flowsheetHistory: [
      {
        time: '12:00',
        vitals: { heartRate: 38, temperatureC: 37.6, respiratoryRate: 14 },
        gi: { refluxVolumeL: 0, motility: 'Normal' },
        labs: { lactate: 1.1, pcv: 36, tp: 6.5, ionizedCalcium: 1.30 }
      },
      {
        time: '13:00',
        vitals: { heartRate: 40, temperatureC: 37.8, respiratoryRate: 16 },
        gi: { refluxVolumeL: 0, motility: 'Normal' },
        labs: { lactate: 1.2, pcv: 37, tp: 6.6, ionizedCalcium: 1.30 }
      }
    ]
  },
  {
    id: 'p4',
    name: 'Thunder (Foal) (TEST)',
    isTest: true,
    lifecycle: 'ACTIVE',
    diagnosis: 'Neonatal sepsis, suspected failure of passive transfer',
    bodySystems: ['HAEMOLYMPHATIC', 'GASTROINTESTINAL'],
    schedule: DEFAULT_FOAL_SCHEDULE,
    caseNumber: '#89421',
    breed: 'Quarter Horse',
    weightKg: 45,
    age: '2 Days',
    location: 'ICU - Incubator 1',
    status: 'CRITICAL',
    statusLabel: 'SIRS ALERT',
    lastObsTime: '2 min ago',
    category: 'NEONATAL_FOAL',
    gender: 'Colt',
    admissionDate: '2026-07-26',
    owner: { name: 'John Doe' },
    isFoal: true,
    sirsCriteriaMet: true,
    sirsDescription: '2/4 Criteria met (Temp, HR). High risk of sepsis.',
    fssPrematurityDays: 338,
    fssColdExtremities: true,
    fssInfectiousSite: 'Umbilicus',
    flowsheetHistory: [
      {
        time: '10:00',
        vitals: { heartRate: 90, temperatureF: 101.5, respiratoryRate: 40 },
        gi: { motility: 'Decreased' },
        labs: { glucose: 'Pending', igg: 'Pending', lactate: 2.8 }
      },
      {
        time: '12:00',
        vitals: { heartRate: 110, temperatureF: 102.8, respiratoryRate: 52 },
        gi: { motility: 'Absent' },
        labs: { glucose: 'Pending', igg: 'Pending', lactate: 4.1 }
      }
    ]
  }
];

export const MEDICATIONS: MedicationCalc[] = [
  {
    id: 'm1',
    name: 'Flunixin Meglumine',
    category: 'NSAID • Analgesic / Anti-inflammatory',
    concentrationMgMl: 50,
    defaultDoseMgKg: 1.1,
    minDoseMgKg: 0.5,
    maxDoseMgKg: 2.2,
    route: 'IV'
  },
  {
    id: 'm2',
    name: 'Dextrose 50%',
    category: 'Carbohydrate Supplement • Energy',
    concentrationMgMl: 500,
    defaultDoseMgKg: 2.5, // 2.5% final concentration
    minDoseMgKg: 1.0,
    maxDoseMgKg: 5.0,
    isCRI: true,
    criUnit: '% final concentration',
    route: 'CRI'
  },
  {
    id: 'm3',
    name: 'Lidocaine 2%',
    category: 'Local Anesthetic • Anti-arrhythmic / Prokinetic',
    concentrationMgMl: 20,
    defaultDoseMgKg: 1.3, // mg/kg loading or mg/kg/hr
    minDoseMgKg: 0.5,
    maxDoseMgKg: 3.0,
    isCRI: true,
    criUnit: 'mg/kg/hr',
    route: 'CRI'
  },
  {
    id: 'm4',
    name: 'Phenylbutazone',
    category: 'NSAID • Analgesic',
    concentrationMgMl: 200,
    defaultDoseMgKg: 2.2,
    minDoseMgKg: 1.1,
    maxDoseMgKg: 4.4,
    route: 'IV'
  }
];
