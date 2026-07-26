import type { AssessmentSeverity } from '../types';

/**
 * Catalogue of structured, one-tap clinical assessments.
 *
 * Ported from the Colic Monitoring Tool, where each of these lived as a
 * hand-written branch inside a single 1,600-line component. Here they are data,
 * so adding an assessment is an entry in this file rather than a new component.
 *
 * `severity` is a triage weighting used for cell colour and for escalating
 * call-surgeon triggers. It reflects ward convention, not a published score,
 * and must never be rendered as one.
 */

export interface AssessmentOption {
  value: string;
  severity: AssessmentSeverity;
  /** Optional clarifier shown under the option label. */
  hint?: string;
}

export type AssessmentFamily = 'vitals' | 'pain' | 'gi' | 'laminitis' | 'support';

export interface AssessmentDefinition {
  id: string;
  label: string;
  family: AssessmentFamily;
  prompt: string;
  /** Preferred column count for the option grid at tablet width and above. */
  columns: 1 | 2;
  options: AssessmentOption[];
}

export const FAMILY_ACCENT: Record<AssessmentFamily, string> = {
  vitals: '#1D4ED8',
  pain: '#6D28D9',
  gi: '#B45309',
  laminitis: '#A21CAF',
  support: '#0E7490',
};

export const SEVERITY_STYLES: Record<
  AssessmentSeverity,
  { selected: string; dot: string; label: string }
> = {
  normal: {
    selected: 'bg-[#ECFDF5] border-[#047857] text-[#047857]',
    dot: 'bg-[#047857]',
    label: 'Normal',
  },
  watch: {
    selected: 'bg-[#FFFBEB] border-[#B45309] text-[#B45309]',
    dot: 'bg-[#B45309]',
    label: 'Watch',
  },
  warning: {
    selected: 'bg-[#FFF7ED] border-[#C2410C] text-[#C2410C]',
    dot: 'bg-[#C2410C]',
    label: 'Warning',
  },
  critical: {
    selected: 'bg-[#B91C1C] border-[#B91C1C] text-white',
    dot: 'bg-[#B91C1C]',
    label: 'Critical',
  },
};

export const MUCOUS_MEMBRANES: AssessmentDefinition = {
  id: 'mucousMembranes',
  label: 'Mucous membranes',
  family: 'vitals',
  prompt: 'Select mucous membrane appearance',
  columns: 2,
  options: [
    { value: 'Pink, moist', severity: 'normal' },
    { value: 'Injected / hyperaemic', severity: 'warning' },
    { value: 'Pale / tacky', severity: 'warning' },
    { value: 'Muddy / dry', severity: 'critical' },
    { value: 'Brick-red / toxic', severity: 'critical' },
    { value: 'Cyanotic / blue', severity: 'critical' },
  ],
};

export const MENTATION: AssessmentDefinition = {
  id: 'mentation',
  label: 'Mentation',
  family: 'vitals',
  prompt: 'Select mentation',
  columns: 2,
  options: [
    { value: 'BAR', severity: 'normal', hint: 'Bright, alert, responsive' },
    { value: 'QAR', severity: 'watch', hint: 'Quiet, alert, responsive' },
    { value: 'Dull / depressed', severity: 'warning' },
    { value: 'Stuporous / somnolent', severity: 'critical' },
    { value: 'Agitated / severe pain', severity: 'critical' },
  ],
};

export const PAIN_BEHAVIOUR: AssessmentDefinition = {
  id: 'painBehaviour',
  label: 'Pain behaviour',
  family: 'pain',
  prompt: 'Select observed pain behaviour',
  columns: 1,
  options: [
    { value: 'Quiet / resting', severity: 'normal' },
    { value: 'Mild flank watching / pawing', severity: 'watch' },
    { value: 'Restless / frequent lying down', severity: 'warning' },
    { value: 'Violent rolling / uncontrolled pain', severity: 'critical' },
  ],
};

export const ANALGESIA: AssessmentDefinition = {
  id: 'analgesia',
  label: 'Analgesia given',
  family: 'pain',
  prompt: 'Select analgesia administered this round',
  columns: 1,
  options: [
    { value: 'None needed', severity: 'normal' },
    { value: 'Flunixin meglumine 1.1 mg/kg IV', severity: 'watch' },
    { value: 'Buprenorphine 0.006 mg/kg IV', severity: 'watch' },
    { value: 'Xylazine 0.5 mg/kg IV', severity: 'watch' },
    { value: 'Detomidine 0.01 mg/kg IV', severity: 'watch' },
    { value: 'Butylscopolamine 0.3 mg/kg IV', severity: 'watch' },
  ],
};

export const RECTAL_EXAM: AssessmentDefinition = {
  id: 'rectalExam',
  label: 'Rectal examination',
  family: 'gi',
  prompt: 'Select rectal examination findings',
  columns: 1,
  options: [
    { value: 'Normal / empty pelvic flexure', severity: 'normal' },
    { value: 'Pelvic flexure impaction', severity: 'warning', hint: 'Firm faecal mass' },
    { value: 'Tympany / gas distension', severity: 'warning' },
    { value: 'Large colon displacement', severity: 'warning', hint: 'Left dorsal / right dorsal' },
    { value: 'Small intestinal distension', severity: 'critical', hint: 'Tensional loops' },
    { value: 'Tight tensional bands', severity: 'critical', hint: 'Strangulation risk' },
  ],
};

export const FLASH_ULTRASOUND: AssessmentDefinition = {
  id: 'flashUltrasound',
  label: 'FLASH abdominal ultrasound',
  family: 'gi',
  prompt: 'Select FLASH ultrasound findings',
  columns: 1,
  options: [
    { value: 'Normal motility, normal wall', severity: 'normal', hint: 'Wall < 3 mm' },
    { value: 'Thickened small intestinal wall', severity: 'warning', hint: '> 3 mm' },
    { value: 'Thickened colon wall', severity: 'warning', hint: '> 5 mm' },
    { value: 'Increased hyperechoic peritoneal fluid', severity: 'warning' },
    { value: 'Distended SI loops', severity: 'critical', hint: '> 4 cm, tensional' },
    { value: 'Anechoic / moderate free fluid', severity: 'critical' },
  ],
};

export const PERITONEAL_FLUID: AssessmentDefinition = {
  id: 'peritonealFluid',
  label: 'Peritoneal fluid appearance',
  family: 'gi',
  prompt: 'Select gross appearance of the abdominocentesis sample',
  columns: 2,
  options: [
    { value: 'Clear yellow', severity: 'normal' },
    { value: 'Turbid / clouded', severity: 'warning' },
    { value: 'Serosanguineous', severity: 'critical', hint: 'Pink / red' },
    { value: 'Frank blood', severity: 'critical' },
    { value: 'Enterocentesis', severity: 'critical', hint: 'Feed material' },
  ],
};

export const REFLUX_APPEARANCE: AssessmentDefinition = {
  id: 'refluxAppearance',
  label: 'Reflux appearance',
  family: 'gi',
  prompt: 'Select reflux appearance',
  columns: 2,
  options: [
    { value: 'None / no reflux', severity: 'normal' },
    { value: 'Yellow / bilious', severity: 'watch' },
    { value: 'Green feed-tinged', severity: 'warning' },
    { value: 'Fetid / malodorous', severity: 'critical' },
    { value: 'Haemorrhagic / dark red', severity: 'critical' },
  ],
};

export const NASOGASTRIC_TUBE: AssessmentDefinition = {
  id: 'nasogastricTube',
  label: 'Nasogastric tube',
  family: 'gi',
  prompt: 'Nasogastric tube status',
  columns: 2,
  options: [
    { value: 'In place', severity: 'watch' },
    { value: 'Not placed', severity: 'normal' },
    { value: 'Removed', severity: 'normal' },
  ],
};

export const RESPONSE_TO_THERAPY: AssessmentDefinition = {
  id: 'responseToTherapy',
  label: 'Response to medical therapy',
  family: 'gi',
  prompt: 'Response to medical analgesia',
  columns: 1,
  options: [
    { value: 'Complete resolution', severity: 'normal' },
    { value: 'Partial / transient response', severity: 'warning' },
    { value: 'Refractory / unresponsive', severity: 'critical' },
    { value: 'Rapid deterioration', severity: 'critical' },
  ],
};

export const DIGITAL_PULSE: AssessmentDefinition = {
  id: 'digitalPulse',
  label: 'Digital pulse (LF / RF)',
  family: 'laminitis',
  prompt: 'Select digital pulse status',
  columns: 1,
  options: [
    { value: 'Normal / cool hooves', severity: 'normal' },
    { value: 'Slightly bounding', severity: 'watch' },
    { value: 'Markedly bounding / warm hooves', severity: 'critical' },
    { value: 'Absent pulse', severity: 'warning' },
  ],
};

export const CRYOTHERAPY: AssessmentDefinition = {
  id: 'cryotherapy',
  label: 'Digital cryotherapy',
  family: 'laminitis',
  prompt: 'Cryotherapy status',
  columns: 2,
  options: [
    { value: 'Ice boots on', severity: 'normal' },
    { value: 'Continuous slurry', severity: 'normal' },
    { value: 'Off — not indicated', severity: 'watch' },
    { value: 'Off — indicated but not applied', severity: 'critical' },
  ],
};

export const IV_CATHETER_SITE: AssessmentDefinition = {
  id: 'ivCatheterSite',
  label: 'IV catheter site',
  family: 'support',
  prompt: 'Catheter site assessment',
  columns: 1,
  options: [
    { value: 'Clean and patent', severity: 'normal' },
    { value: 'Flushed / patent', severity: 'normal' },
    { value: 'Mild peri-catheter oedema', severity: 'warning' },
    { value: 'Thrombophlebitis', severity: 'critical' },
    { value: 'Catheter removed', severity: 'watch' },
  ],
};

export const INCISION_STATUS: AssessmentDefinition = {
  id: 'incisionStatus',
  label: 'Incision status',
  family: 'support',
  prompt: 'Incision assessment',
  columns: 1,
  options: [
    { value: 'Dry and comfortable', severity: 'normal' },
    { value: 'Mild oedema', severity: 'watch' },
    { value: 'Serous discharge', severity: 'warning' },
    { value: 'Purulent discharge', severity: 'critical' },
    { value: 'Dehiscence / hernia', severity: 'critical' },
  ],
};

export const ASSESSMENTS: AssessmentDefinition[] = [
  MUCOUS_MEMBRANES,
  MENTATION,
  PAIN_BEHAVIOUR,
  ANALGESIA,
  RECTAL_EXAM,
  FLASH_ULTRASOUND,
  PERITONEAL_FLUID,
  REFLUX_APPEARANCE,
  NASOGASTRIC_TUBE,
  RESPONSE_TO_THERAPY,
  DIGITAL_PULSE,
  CRYOTHERAPY,
  IV_CATHETER_SITE,
  INCISION_STATUS,
];

const SEVERITY_BY_VALUE = new Map<string, AssessmentSeverity>();
for (const def of ASSESSMENTS) {
  for (const opt of def.options) {
    SEVERITY_BY_VALUE.set(`${def.id}::${opt.value}`, opt.severity);
  }
}

/** Severity of a recorded value. Unknown or unrecorded values are 'normal'. */
export function severityOf(
  definitionId: string,
  value: string | undefined,
): AssessmentSeverity {
  if (!value) return 'normal';
  return SEVERITY_BY_VALUE.get(`${definitionId}::${value}`) ?? 'normal';
}

export const MANURE_AMOUNTS = ['Small', 'Moderate', 'Abundant'] as const;
export const MANURE_CONSISTENCIES = [
  'Normal pellets',
  'Soft / cow-pat',
  'Watery diarrhoea',
  'Mucus-covered',
] as const;
