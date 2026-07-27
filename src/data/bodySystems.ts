import type { BodySystem } from '../types';

/**
 * Body-system iconography for the flowsheet diagnosis banner.
 *
 * Icons are Material Symbols ligature names, which the app already loads. The
 * set is chosen so each system is distinguishable at 20px — anatomical where a
 * usable glyph exists (neurology, respiratory, cardiovascular, GI, urinary,
 * hepatic, ophthalmic), functional where it does not.
 */
export const BODY_SYSTEM_META: Record<
  BodySystem,
  { label: string; icon: string; colour: string }
> = {
  GASTROINTESTINAL: { label: 'Gastrointestinal', icon: 'gastroenterology', colour: '#B45309' },
  RESPIRATORY: { label: 'Respiratory', icon: 'pulmonology', colour: '#0E7490' },
  NEUROLOGIC: { label: 'Neurologic', icon: 'neurology', colour: '#6D28D9' },
  CARDIOVASCULAR: { label: 'Cardiovascular', icon: 'cardiology', colour: '#B91C1C' },
  MUSCULOSKELETAL: { label: 'Musculoskeletal', icon: 'orthopedics', colour: '#334155' },
  URINARY: { label: 'Urinary', icon: 'nephrology', colour: '#0369A1' },
  REPRODUCTIVE: { label: 'Reproductive', icon: 'obstetrics', colour: '#A21CAF' },
  INTEGUMENT: { label: 'Skin', icon: 'dermatology', colour: '#C2410C' },
  OPHTHALMIC: { label: 'Ophthalmic', icon: 'visibility', colour: '#7C3AED' },
  HEPATIC: { label: 'Hepatic', icon: 'hepatology', colour: '#A16207' },
  HAEMOLYMPHATIC: { label: 'Haemolymphatic', icon: 'bloodtype', colour: '#BE123C' },
  ENDOCRINE: { label: 'Endocrine', icon: 'endocrinology', colour: '#047857' },
};

export const ALL_BODY_SYSTEMS = Object.keys(BODY_SYSTEM_META) as BodySystem[];

/**
 * Suggest systems from free-text diagnosis wording. A hint for the admission
 * form only — the clinician confirms, and nothing is inferred silently.
 */
export function suggestBodySystems(diagnosis: string | undefined): BodySystem[] {
  if (!diagnosis) return [];
  const d = diagnosis.toLowerCase();
  const hits = new Set<BodySystem>();
  const rules: [RegExp, BodySystem][] = [
    [/colic|colon|caecum|cecum|intestin|impaction|volvulus|displacement|enteritis|colitis|diarrh|ulcer|reflux/, 'GASTROINTESTINAL'],
    [/pneumon|respirat|rhodococcus|pleur|airway|asthma|nasal|lung/, 'RESPIRATORY'],
    [/neuro|seizure|ataxi|encephal|myelo|wobbler|hie|maladjust/, 'NEUROLOGIC'],
    [/cardi|arrhythm|murmur|fibrillat|endocard/, 'CARDIOVASCULAR'],
    [/laminit|fractur|tendon|joint|arthr|myopath|rhabdo|musculoskelet/, 'MUSCULOSKELETAL'],
    [/renal|kidney|urinar|bladder|azotaem|azotem|cystitis/, 'URINARY'],
    [/uterin|placent|dystocia|retained fetal|reproduct|metritis/, 'REPRODUCTIVE'],
    [/derm|skin|wound|cellulit|pastern/, 'INTEGUMENT'],
    [/ocular|eye|uveitis|cornea|ophthalm/, 'OPHTHALMIC'],
    [/hepat|liver|cholangi|icterus|jaundice/, 'HEPATIC'],
    [/anaem|anemi|sepsis|septic|coagul|dic|thrombocyt|isoerythrolysis/, 'HAEMOLYMPHATIC'],
    [/cushing|ppid|insulin|metabolic syndrome|thyroid|endocrin/, 'ENDOCRINE'],
  ];
  rules.forEach(([re, sys]) => {
    if (re.test(d)) hits.add(sys);
  });
  return Array.from(hits);
}
