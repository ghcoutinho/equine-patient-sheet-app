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

export type AssessmentFamily = 'vitals' | 'pain' | 'gi' | 'laminitis' | 'support' | 'neonatal';

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
  neonatal: '#DB2777',
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

/**
 * Composite Pain Scale (CPS) — the 9 purely behavioural sub-items of
 * Bussières et al. 2008's 13-parameter scale, exactly as applied to visceral
 * colic pain in van Loon et al. 2014 (Table 2). The scale's other 4
 * sub-items (heart rate, respiratory rate, digestive sounds, temperature)
 * are physiological and are derived from vitals/GI fields already charted
 * elsewhere — see `cpsPanel` in `utils/intelligence.ts` — not entered again
 * here. Each option's severity (normal/watch/warning/critical) doubles as
 * its 0–3 CPS point value; `cpsPanel` reads it back via `severityOf`.
 */
export const CPS_APPEARANCE: AssessmentDefinition = {
  id: 'cpsAppearance',
  label: 'CPS — Appearance',
  family: 'pain',
  prompt: 'Reluctance to move, restlessness, agitation and anxiety',
  columns: 1,
  options: [
    { value: 'Bright and alert, lowered head and ears, no reluctance to move', severity: 'normal' },
    { value: 'Bright, occasional head movements, no reluctance to move', severity: 'watch' },
    {
      value:
        'Restlessness, pricked up ears, abnormal facial expressions (teeth grinding, yawning, grimace face), dilated pupils',
      severity: 'warning',
    },
    { value: 'Excited, continuous body movements, abnormal facial expression', severity: 'critical' },
  ],
};

export const CPS_SWEATING: AssessmentDefinition = {
  id: 'cpsSweating',
  label: 'CPS — Sweating',
  family: 'pain',
  prompt: 'Sweating',
  columns: 1,
  options: [
    { value: 'No obvious signs of sweat', severity: 'normal' },
    { value: 'Damp to the touch', severity: 'watch' },
    { value: 'Wet to the touch, beads of sweat apparent over the body', severity: 'warning' },
    { value: 'Excessive sweating, beads running off the animal', severity: 'critical' },
  ],
};

export const CPS_KICKING_ABDOMEN: AssessmentDefinition = {
  id: 'cpsKickingAbdomen',
  label: 'CPS — Kicking at abdomen',
  family: 'pain',
  prompt: 'Kicking at abdomen',
  columns: 1,
  options: [
    { value: 'Quietly standing, no kicking', severity: 'normal' },
    { value: 'Occasional kicking at abdomen (1–2 times/5 min)', severity: 'watch' },
    { value: 'Frequent kicking at abdomen (3–4 times/5 min)', severity: 'warning' },
    {
      value: 'Excessive kicking at abdomen (>5 times/5 min), intermittent attempts to lie down and roll',
      severity: 'critical',
    },
  ],
};

export const CPS_PAWING: AssessmentDefinition = {
  id: 'cpsPawing',
  label: 'CPS — Pawing on the floor',
  family: 'pain',
  prompt: 'Pawing on the floor',
  columns: 1,
  options: [
    { value: 'Quietly standing, no pawing', severity: 'normal' },
    { value: 'Occasional pawing (1–2 times/5 min)', severity: 'watch' },
    { value: 'Frequent pawing (3–4 times/5 min)', severity: 'warning' },
    { value: 'Excessive pawing (>5 times/5 min)', severity: 'critical' },
  ],
};

export const CPS_POSTURE: AssessmentDefinition = {
  id: 'cpsPosture',
  label: 'CPS — Posture',
  family: 'pain',
  prompt: 'Weight distribution, comfort',
  columns: 1,
  options: [
    { value: 'Stands quietly, normal walk', severity: 'normal' },
    { value: 'Occasional weight shift, slight muscle tremors', severity: 'watch' },
    { value: 'Non-weight bearing, abnormal weight distribution', severity: 'warning' },
    { value: 'Stretching out, prostration, muscle tremors', severity: 'critical' },
  ],
};

export const CPS_HEAD_MOVEMENT: AssessmentDefinition = {
  id: 'cpsHeadMovement',
  label: 'CPS — Head movement',
  family: 'pain',
  prompt: 'Head movement',
  columns: 1,
  options: [
    { value: 'No evidence of discomfort, head straight ahead for the most part', severity: 'normal' },
    {
      value:
        'Intermittent head movements laterally/vertically, looking at flanks (1–2/5 min), lip curling (1–2/5 min)',
      severity: 'watch',
    },
    {
      value:
        'Intermittent and rapid head movements, frequent looking at flank (3–4/5 min), lip curling (3–4/5 min)',
      severity: 'warning',
    },
    {
      value:
        'Continuous head movements, excessively looking at flank (>5/5 min), lip curling (>5/5 min)',
      severity: 'critical',
    },
  ],
};

export const CPS_APPETITE: AssessmentDefinition = {
  id: 'cpsAppetite',
  label: 'CPS — Appetite',
  family: 'pain',
  prompt: 'Appetite',
  columns: 1,
  options: [
    { value: 'Eats hay readily or is not allowed to eat hay', severity: 'normal' },
    { value: 'Hesitates to eat hay', severity: 'watch' },
    {
      value:
        'Shows little interest in hay, eats very little, or takes hay in mouth but does not chew or swallow',
      severity: 'warning',
    },
    { value: 'Neither shows interest in nor eats hay', severity: 'critical' },
  ],
};

export const CPS_INTERACTIVE_BEHAVIOUR: AssessmentDefinition = {
  id: 'cpsInteractiveBehaviour',
  label: 'CPS — Interactive behaviour',
  family: 'pain',
  prompt: 'Response to observer',
  columns: 1,
  options: [
    { value: 'Pays attention to people', severity: 'normal' },
    { value: 'Exaggerated response to auditory stimulus (observer calling the horse)', severity: 'watch' },
    {
      value: 'Excessive-to-aggressive response to auditory stimulus (biting, turning hindquarters to kick)',
      severity: 'warning',
    },
    { value: 'Stupor, prostration, no response to auditory stimulus', severity: 'critical' },
  ],
};

export const CPS_RESPONSE_TO_PALPATION: AssessmentDefinition = {
  id: 'cpsResponseToPalpation',
  label: 'CPS — Response to palpation',
  family: 'pain',
  prompt: 'Response to palpation of the painful area (abdominal incision)',
  columns: 1,
  options: [
    { value: 'No reaction to palpation', severity: 'normal' },
    { value: 'Mild reaction to palpation', severity: 'watch' },
    { value: 'Resistance to palpation', severity: 'warning' },
    { value: 'Violent reaction to palpation', severity: 'critical' },
  ],
};

export const CPS_DEFINITIONS: AssessmentDefinition[] = [
  CPS_APPEARANCE,
  CPS_SWEATING,
  CPS_KICKING_ABDOMEN,
  CPS_PAWING,
  CPS_POSTURE,
  CPS_HEAD_MOVEMENT,
  CPS_APPETITE,
  CPS_INTERACTIVE_BEHAVIOUR,
  CPS_RESPONSE_TO_PALPATION,
];

/**
 * Equine Acute Abdominal Pain Scale (EAAPS) — Maskato et al. 2020, Table 1.
 * A single pick: the horse's highest-scoring behaviour category wins ("if
 * two or more behaviours are demonstrated, the score is assigned based on
 * the behaviour with the highest value"), which is exactly what a
 * single-select already does. Severity here is a rough display banding, not
 * the scale's own validated cut-offs — those (2.5 discriminant, 3.5 surgical
 * treatment, 4.5 mortality) are read out explicitly in ColicReadouts.
 */
export const EAAPS: AssessmentDefinition = {
  id: 'eaapsBehaviour',
  label: 'EAAPS',
  family: 'pain',
  prompt: 'Select the horse’s highest-scoring pain behaviour',
  columns: 1,
  options: [
    { value: 'No overt pain behaviours', severity: 'normal' },
    { value: 'Flank watching, or Flehmen / lip curling', severity: 'watch' },
    { value: 'Sternal recumbency stretching, or restlessness', severity: 'watch' },
    { value: 'Kicking at abdomen, or pawing', severity: 'warning' },
    { value: 'Attempting to lie down or crouching, or lateral recumbency', severity: 'warning' },
    { value: 'Rolling', severity: 'critical' },
  ],
};

/** The EAAPS's own 0–5 integer score for each option — Table 1's score column. */
export const EAAPS_SCORE: Record<string, number> = {
  'No overt pain behaviours': 0,
  'Flank watching, or Flehmen / lip curling': 1,
  'Sternal recumbency stretching, or restlessness': 2,
  'Kicking at abdomen, or pawing': 3,
  'Attempting to lie down or crouching, or lateral recumbency': 4,
  Rolling: 5,
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

export const PERITONEAL_ODOR: AssessmentDefinition = {
  id: 'peritonealOdor',
  label: 'Peritoneal fluid odor',
  family: 'gi',
  prompt: 'Select peritoneal fluid odor',
  columns: 2,
  options: [
    { value: 'Normal / no odor', severity: 'normal' },
    { value: 'Fetid / foul', severity: 'critical', hint: 'Reported with intestinal rupture' },
  ],
};

export const PERITONEAL_BACTERIA: AssessmentDefinition = {
  id: 'peritonealBacteria',
  label: 'Intracellular bacteria on cytology',
  family: 'gi',
  prompt: 'Intracellular bacteria seen on peritoneal fluid cytology?',
  columns: 2,
  options: [
    { value: 'Absent', severity: 'normal' },
    {
      value: 'Present',
      severity: 'critical',
      hint: 'Confirms septic peritonitis — emergency surgery',
    },
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

/**
 * Post-anaesthetic fluorescein ocular exam. Corneal abrasion is reported in
 * 17.6% of horses after general anaesthesia (Loomes et al. 2025) and is
 * clinically under-diagnosed because it needs fluorescein to detect — no
 * odds ratio by duration of anaesthesia is reported, so this stays a simple
 * pass/fail finding rather than feeding the OR-tier complication model.
 */
export const OCULAR_EXAM: AssessmentDefinition = {
  id: 'ocularExam',
  label: 'Post-anaesthetic ocular exam (fluorescein)',
  family: 'support',
  prompt: 'Fluorescein-stain ocular exam finding',
  columns: 2,
  options: [
    { value: 'Normal — no staining', severity: 'normal' },
    {
      value: 'Corneal abrasion present',
      severity: 'critical',
      hint: 'Reported in 17.6% of horses after general anaesthesia (Loomes et al. 2025)',
    },
  ],
};

/**
 * Extremity temperature, a Foal Survival Score item (Brewer & Koterba). Warm
 * is favourable — this is why `entry.coldExtremities` scores 1 point when
 * `false` in foalSurvivalPanel.
 */
export const COLD_EXTREMITIES: AssessmentDefinition = {
  id: 'coldExtremities',
  label: 'Extremity temperature',
  family: 'neonatal',
  prompt: 'Extremities warm or cold?',
  columns: 2,
  options: [
    { value: 'Warm', severity: 'normal' },
    { value: 'Cold', severity: 'critical', hint: 'Peripheral hypoperfusion' },
  ],
};

/** Neonatal sepsis score item (Brewer & Koterba). */
export const HYPOTONIA: AssessmentDefinition = {
  id: 'hypotonia',
  label: 'Muscle tone',
  family: 'neonatal',
  prompt: 'Tone on handling',
  columns: 1,
  options: [
    { value: 'Normal', severity: 'normal' },
    { value: 'Mild hypotonia', severity: 'watch' },
    { value: 'Severe hypotonia', severity: 'critical' },
  ],
};

/** Neonatal sepsis score item (Brewer & Koterba). */
export const PETECHIAE: AssessmentDefinition = {
  id: 'petechiae',
  label: 'Petechiation',
  family: 'neonatal',
  prompt: 'Petechiae present?',
  columns: 2,
  options: [
    { value: 'Absent', severity: 'normal' },
    { value: 'Present', severity: 'critical' },
  ],
};

/** Neonatal sepsis score item (Brewer & Koterba) — read from the differential, not counted. */
export const TOXIC_NEUTROPHILS: AssessmentDefinition = {
  id: 'toxicNeutrophils',
  label: 'Toxic neutrophils',
  family: 'neonatal',
  prompt: 'Toxic granulation on the differential?',
  columns: 2,
  options: [
    { value: 'Absent', severity: 'normal' },
    { value: 'Present', severity: 'critical' },
  ],
};

/**
 * Neonatal sepsis score history item (Brewer & Koterba) — a clinician
 * judgement on the perinatal history (dystocia, placentitis, previous foal
 * loss), not inferred from whether a free-text dam-history note is empty.
 */
export const ABNORMAL_PERINATAL_HISTORY: AssessmentDefinition = {
  id: 'abnormalPerinatalHistory',
  label: 'Perinatal history',
  family: 'neonatal',
  prompt: 'Abnormal perinatal history?',
  columns: 2,
  options: [
    { value: 'Normal', severity: 'normal' },
    { value: 'Abnormal', severity: 'critical', hint: 'Dystocia, placentitis, previous foal loss' },
  ],
};

export const ASSESSMENTS: AssessmentDefinition[] = [
  MUCOUS_MEMBRANES,
  MENTATION,
  PAIN_BEHAVIOUR,
  ...CPS_DEFINITIONS,
  EAAPS,
  ANALGESIA,
  RECTAL_EXAM,
  FLASH_ULTRASOUND,
  PERITONEAL_FLUID,
  PERITONEAL_ODOR,
  PERITONEAL_BACTERIA,
  REFLUX_APPEARANCE,
  NASOGASTRIC_TUBE,
  RESPONSE_TO_THERAPY,
  DIGITAL_PULSE,
  CRYOTHERAPY,
  IV_CATHETER_SITE,
  INCISION_STATUS,
  OCULAR_EXAM,
  COLD_EXTREMITIES,
  HYPOTONIA,
  PETECHIAE,
  TOXIC_NEUTROPHILS,
  ABNORMAL_PERINATAL_HISTORY,
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

const SEVERITY_RANK: Record<AssessmentSeverity, number> = {
  normal: 0,
  watch: 1,
  warning: 2,
  critical: 3,
};

/**
 * The worst severity across a multi-select finding — a rectal exam or FLASH
 * scan can turn up more than one thing at once, and the most severe one is
 * what should colour the cell and drive a trigger, not whichever was
 * selected first.
 */
export function severityOfAny(
  definitionId: string,
  values: string[] | undefined,
): AssessmentSeverity {
  if (!values?.length) return 'normal';
  return values.reduce<AssessmentSeverity>((worst, v) => {
    const sev = severityOf(definitionId, v);
    return SEVERITY_RANK[sev] > SEVERITY_RANK[worst] ? sev : worst;
  }, 'normal');
}

export const MANURE_AMOUNTS = ['Small', 'Moderate', 'Abundant'] as const;
export const MANURE_CONSISTENCIES = [
  'Normal pellets',
  'Soft / cow-pat',
  'Watery diarrhoea',
  'Mucus-covered',
] as const;
