import type { ComplicationId, ComplicationFrame } from '../types';

/**
 * Complication definitions and severity tiers.
 *
 * Two published findings drive this module. Gandini et al. 2023 (Equine Vet
 * J 55:563-572) found that none of 272 reviewed studies defined
 * "complication" explicitly — up to 20 different operational definitions
 * existed for postoperative reflux alone. Loomes et al. 2025 (Equine Vet J
 * 57:827-861) found that raw prevalence is the wrong way to prioritise a
 * flag: fever is far less common than postoperative colic but carries a far
 * higher odds ratio versus elective surgery (17.97 vs. 4.11) — the more
 * specific finding, not the more frequent one.
 *
 * `COMPLICATION_DEFINITIONS` answers the first gap; `orTierFor` answers the
 * second. Where the source synthesis this app draws on didn't propose a
 * specific numeric definition, this leaves it unset rather than inventing
 * one — the absence is itself a faithful reflection of what the literature
 * doesn't yet agree on, not a bug to paper over.
 */

export interface ComplicationMeta {
  label: string;
  /** Standardised definition proposed for this app, where the source literature supports one. Undefined, not guessed, where it doesn't. */
  definition?: string;
  source?: string;
}

export const COMPLICATION_META: Record<ComplicationId, ComplicationMeta> = {
  POR: {
    label: 'Postoperative reflux / ileus',
    definition: '>2 L of net nasogastric reflux',
    source: 'Bauck 2023; Gandini et al. 2023 (20 definitions found in the literature — this app picks one)',
  },
  INCISIONAL: {
    label: 'Incisional complication (incl. SSI)',
    definition: 'Incisional discharge present from 12 h post-op onward, or infection (positive culture or abnormal appearance)',
    source: 'Gandini et al. 2023',
  },
  POC: {
    label: 'Postoperative colic',
    definition: 'Behavioural signs of abdominal pain after surgery',
    source: 'Gandini et al. 2023',
  },
  DIARRHEA: {
    label: 'Diarrhoea / colitis',
    definition: '≥1 episode of liquid or pasty faeces in excess of normal consistency',
    source: 'Gandini et al. 2023',
  },
  THROMBOPHLEBITIS: {
    label: 'Jugular thrombophlebitis',
    definition: 'Induration, heat or pain along the jugular vein, with or without ultrasonographic evidence',
    source: 'Gandini et al. 2023',
  },
  PYREXIA: {
    label: 'Pyrexia',
    definition: 'See the three published fever tiers on the Flowsheet and Clinical Intelligence screens (readPyrexia) rather than a single cut-off here',
    source: 'Loomes et al. 2025',
  },
  LAMINITIS: {
    label: 'Laminitis',
    definition: 'Increased digital pulses plus reluctance to move, or forelimb lameness',
    source: 'Gandini et al. 2023',
  },
  SIRS_ENDOTOXEMIA: {
    label: 'SIRS / endotoxaemia',
    definition: '≥2 of: tachycardia, tachypnoea, abnormal temperature, abnormal leukogram',
    source: 'Gandini et al. 2023',
  },
  RESPIRATORY: {
    label: 'Respiratory complication (incl. pneumonia)',
    definition: 'Radiographic or ultrasonographic confirmation, with or without clinical signs',
    source: 'Gandini et al. 2023',
  },
  SALMONELLA: {
    label: 'Salmonella-positive',
    definition: 'Positive PCR or culture, regardless of clinical signs',
    source: 'Gandini et al. 2023',
  },
  // The following have no numeric definition proposed in the source
  // synthesis this app draws on — left undefined rather than invented.
  PERITONITIS: { label: 'Peritonitis / rupture / anastomotic leak' },
  ADHESIONS: { label: 'Adhesions' },
  ANASTOMOSIS_PROBLEM: { label: 'Anastomotic problem' },
  HEMOPERITONEUM: { label: 'Haemoperitoneum' },
  MYOPATHY_NEUROPATHY: { label: 'Myopathy / neuropathy' },
  NON_VIABLE_BOWEL: { label: 'Non-viable bowel found at relaparotomy' },
  INCISIONAL_HERNIA: { label: 'Incisional hernia' },
  WEIGHT_LOSS: { label: 'Weight loss' },
  RECURRENCE: { label: 'Recurrence of the original problem' },
};

export const FRAME_LABEL: Record<ComplicationFrame, string> = {
  MEDICAL: 'Resolved medically',
  RELAPAROTOMY: 'Required relaparotomy',
  FATAL: 'Fatal / euthanasia',
  POST_DISCHARGE: 'Post-discharge',
};

export const FRAME_ORDER: ComplicationFrame[] = ['MEDICAL', 'RELAPAROTOMY', 'FATAL', 'POST_DISCHARGE'];

/**
 * The 5 complications Gandini et al. 2023 (Table 4, frame 4 — post-discharge)
 * reports as most prevalent after leaving hospital, in prevalence order.
 * Drives the post-discharge follow-up checklist in `ComplicationsView.tsx` —
 * a prompt for what to specifically ask about at a discharge recheck, not a
 * new taxonomy: every id here is already a member of `ComplicationId`.
 */
export const POST_DISCHARGE_PRIORITY: { id: ComplicationId; prevalence: number; notePrompt: string }[] = [
  { id: 'POC', prevalence: 28.7, notePrompt: 'Date of occurrence' },
  { id: 'INCISIONAL_HERNIA', prevalence: 17.3, notePrompt: 'Estimated size' },
  { id: 'INCISIONAL', prevalence: 9.2, notePrompt: 'Treatment started' },
  { id: 'LAMINITIS', prevalence: 5.1, notePrompt: 'Obel grade' },
  { id: 'ADHESIONS', prevalence: 4.8, notePrompt: 'Basis for clinical suspicion' },
];

export const POST_DISCHARGE_PRIORITY_SOURCE = 'Gandini et al. 2023, Table 4 (post-discharge frame)';

/**
 * Odds ratio, colic surgery vs. elective/non-abdominal surgery — the eight
 * complications Loomes et al. 2025 (Table 4) reported a comparator for.
 * Everything else in `ComplicationId` occurs only after colic (no elective
 * comparator exists in the literature) and has no OR — `orTierFor` reports
 * that honestly as `NOT_ESTABLISHED` rather than assigning a tier with
 * nothing behind it.
 */
export const COMPLICATION_OR: Partial<
  Record<ComplicationId, { or: number; ci95: string; significant: boolean }>
> = {
  PYREXIA: { or: 17.97, ci95: '14.58–22.39', significant: true },
  DIARRHEA: { or: 12.5, ci95: '9.15–17.57', significant: true },
  INCISIONAL: { or: 11.48, ci95: '7.97–17.09', significant: true },
  THROMBOPHLEBITIS: { or: 9.15, ci95: '5.11–18.55', significant: true },
  RESPIRATORY: { or: 4.96, ci95: '3.01–8.63', significant: true },
  LAMINITIS: { or: 4.3, ci95: '2.79–6.91', significant: true },
  POC: { or: 4.11, ci95: '3.60–4.71', significant: true },
  MYOPATHY_NEUROPATHY: { or: 1.86, ci95: '0.86–4.16', significant: false },
};

export const COMPLICATION_OR_SOURCE = 'Loomes et al. 2025 (Equine Vet J 57:827-861), Table 4';

export type OrTier = 'CRITICAL' | 'ALERT' | 'WATCH' | 'NOT_ESTABLISHED';

export const OR_TIER_LABEL: Record<OrTier, string> = {
  CRITICAL: 'Critical (OR > 10)',
  ALERT: 'Alert (OR 4–10)',
  WATCH: 'Watch',
  NOT_ESTABLISHED: 'No elective-surgery comparator in the literature',
};

/**
 * Three tiers by reported odds ratio versus elective surgery — the
 * prioritisation Loomes et al. 2025 supports, not raw prevalence. A
 * non-significant OR (myopathy/neuropathy) is Watch regardless of its point
 * estimate; a complication with no OR at all (most colic-only findings —
 * peritonitis, POR, adhesions, etc.) is reported as such, not silently
 * defaulted into a tier the data doesn't support.
 */
export function orTierFor(id: ComplicationId): OrTier {
  const entry = COMPLICATION_OR[id];
  if (!entry) return 'NOT_ESTABLISHED';
  if (!entry.significant) return 'WATCH';
  if (entry.or > 10) return 'CRITICAL';
  if (entry.or >= 4) return 'ALERT';
  return 'WATCH';
}
