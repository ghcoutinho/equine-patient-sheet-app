import type { AssessmentSeverity, GutSoundGrade, GutSoundsQuadrants, GIData } from '../types';

/**
 * Four-quadrant gut sound auscultation.
 *
 * Ported from the Colic Monitoring Tool, where the four quadrants were labelled
 * L-UP / L-LOW / R-UP / R-LOW. They are renamed here to the anatomical
 * dorsal/ventral convention used when auscultating the equine abdomen.
 *
 * Grading and the mapping to a motility impression are a charting convention,
 * not a validated index. Nothing here should be presented as a published score.
 */

export const GUT_SOUND_GRADES: GutSoundGrade[] = ['++', '+', '-', '0'];

export const GUT_SOUND_GRADE_LABELS: Record<GutSoundGrade, string> = {
  '++': 'Hypermotile',
  '+': 'Normal',
  '-': 'Reduced',
  '0': 'Absent',
};

export const GUT_SOUND_QUADRANTS = [
  { key: 'leftDorsal', short: 'LD', label: 'Left dorsal' },
  { key: 'rightDorsal', short: 'RD', label: 'Right dorsal' },
  { key: 'leftVentral', short: 'LV', label: 'Left ventral' },
  { key: 'rightVentral', short: 'RV', label: 'Right ventral' },
] as const;

export type GutSoundQuadrantKey = (typeof GUT_SOUND_QUADRANTS)[number]['key'];

export const DEFAULT_GUT_SOUNDS: GutSoundsQuadrants = {
  leftDorsal: '+',
  rightDorsal: '+',
  leftVentral: '+',
  rightVentral: '+',
};

export interface GutSoundsSummary {
  /** Quadrants with audible motility ('+' or '++'). */
  activeQuadrants: number;
  /** Quadrants with no audible motility ('0'). */
  absentQuadrants: number;
  hypermotile: boolean;
  severity: AssessmentSeverity;
  /** Short human-readable impression, e.g. "Reduced — 2 of 4 quadrants active". */
  label: string;
  /** Motility impression, matching the existing GIData.motility vocabulary. */
  motility: NonNullable<GIData['motility']>;
  /**
   * Gut-sound grade in the Colic Assessment Score vocabulary:
   * 0 = normal, 1 = reduced, 2 = absent.
   */
  casGrade: 0 | 1 | 2;
}

const gradesOf = (q: GutSoundsQuadrants): GutSoundGrade[] => [
  q.leftDorsal,
  q.rightDorsal,
  q.leftVentral,
  q.rightVentral,
];

export function summariseGutSounds(q: GutSoundsQuadrants): GutSoundsSummary {
  const grades = gradesOf(q);
  const activeQuadrants = grades.filter((g) => g === '+' || g === '++').length;
  const absentQuadrants = grades.filter((g) => g === '0').length;
  const hypermotile = grades.some((g) => g === '++');

  let severity: AssessmentSeverity;
  if (activeQuadrants === 4) severity = hypermotile ? 'watch' : 'normal';
  else if (activeQuadrants === 3) severity = 'watch';
  else if (activeQuadrants > 0) severity = 'warning';
  else severity = 'critical';

  const casGrade: 0 | 1 | 2 = activeQuadrants === 4 ? 0 : activeQuadrants === 0 ? 2 : 1;

  let motility: NonNullable<GIData['motility']>;
  if (activeQuadrants === 0) motility = 'Absent';
  else if (hypermotile && activeQuadrants === 4) motility = 'Hyper-motile';
  else if (activeQuadrants === 4) motility = 'Normal';
  else motility = 'Decreased';

  let label: string;
  if (absentQuadrants === 4) label = 'Absent in all 4 quadrants';
  else if (activeQuadrants === 4 && hypermotile) label = 'Hypermotile';
  else if (activeQuadrants === 4) label = 'Normal in all 4 quadrants';
  else label = `${motility} — ${activeQuadrants} of 4 quadrants active`;

  return { activeQuadrants, absentQuadrants, hypermotile, severity, label, motility, casGrade };
}

/** Compact charting form, e.g. "LD:+ RD:+ LV:- RV:0". Used in notes and exports. */
export function formatGutSounds(q: GutSoundsQuadrants): string {
  return GUT_SOUND_QUADRANTS.map(({ key, short }) => `${short}:${q[key]}`).join(' ');
}

/** Parse the compact form back. Returns null when the string is not recognised. */
export function parseGutSounds(text: string): GutSoundsQuadrants | null {
  const out: Partial<GutSoundsQuadrants> = {};
  for (const { key, short } of GUT_SOUND_QUADRANTS) {
    const match = text.match(new RegExp(`${short}\\s*:\\s*(\\+\\+|\\+|-|0)`, 'i'));
    if (!match) return null;
    out[key] = match[1] as GutSoundGrade;
  }
  return out as GutSoundsQuadrants;
}
