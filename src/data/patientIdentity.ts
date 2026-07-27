import type { EquineSex, Patient } from '../types';
import { ageClassFor, type AgeClass } from './ageStratifiedReferenceRanges';

/**
 * Who the patient is: age, sex, and how to draw them.
 *
 * Age was previously a free-text string ("Unknown", "3 years"), which meant the
 * app could not tell a two-day-old from a two-year-old and the age-stratified
 * reference intervals had nothing to key off. Date of birth is now the primary
 * record and everything else is derived from it, so a foal's age class moves
 * on its own as the days pass.
 */

export const SEX_OPTIONS: {
  value: EquineSex;
  label: string;
  /** Sex symbol. Gelding is Mars with a strike, the conventional castrate mark. */
  symbol: string;
  /** True for the young-animal term, so the picker can hide it for adults. */
  juvenile: boolean;
  hint: string;
}[] = [
  { value: 'MARE', label: 'Mare', symbol: '♀', juvenile: false, hint: 'Adult female' },
  { value: 'FILLY', label: 'Filly', symbol: '♀', juvenile: true, hint: 'Female under 4 years' },
  { value: 'STALLION', label: 'Stallion', symbol: '♂', juvenile: false, hint: 'Entire adult male' },
  { value: 'COLT', label: 'Colt', symbol: '♂', juvenile: true, hint: 'Entire male under 4 years' },
  { value: 'GELDING', label: 'Gelding', symbol: '⚲', juvenile: false, hint: 'Castrated male' },
  { value: 'UNKNOWN', label: 'Not recorded', symbol: '?', juvenile: false, hint: '' },
];

export const sexOption = (sex: EquineSex | undefined) =>
  SEX_OPTIONS.find((o) => o.value === sex) ?? SEX_OPTIONS[SEX_OPTIONS.length - 1];

/** Days between a date of birth and now. Negative dates return undefined. */
export function ageInDays(dateOfBirth: string | undefined, now: Date): number | undefined {
  if (!dateOfBirth) return undefined;
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return undefined;
  const days = Math.floor((now.getTime() - dob.getTime()) / 86_400_000);
  return days >= 0 ? days : undefined;
}

/**
 * Age class for reference-interval lookup.
 *
 * The bands are the study populations the intervals were actually measured in
 * (0–2 d, 5–10 d, 20–32 d), not tidy round numbers. A foal aged 3 days falls
 * between two published cohorts; it is assigned to the nearer one and
 * `betweenBands` says so, because presenting a 5–10 day interval as if it were
 * measured at 3 days would overstate what the source supports.
 */
export function ageClassFromDays(days: number | undefined): AgeClass | undefined {
  if (days === undefined) return undefined;
  if (days <= 2) return 'NEONATE_0_2D';
  if (days <= 10) return 'FOAL_5_10D';
  if (days <= 32) return 'FOAL_20_32D';
  // Past a month the published foal cohorts run out. Weanlings and yearlings
  // are not adults physiologically, but no interval set here covers them, so
  // they fall to adult and the UI flags the assumption.
  return 'ADULT';
}

/** True when the patient's age sits in a gap between the published cohorts. */
export function betweenBands(days: number | undefined): boolean {
  if (days === undefined) return false;
  return (days > 2 && days < 5) || (days > 10 && days < 20) || (days > 32 && days < 365);
}

/** "3 d", "6 weeks", "4 mo", "7 y 2 mo". */
export function formatAge(days: number | undefined): string {
  if (days === undefined) return 'age not recorded';
  if (days === 0) return 'born today';
  if (days === 1) return '1 day';
  if (days < 14) return `${days} days`;
  if (days < 60) return `${Math.floor(days / 7)} weeks`;
  if (days < 730) return `${Math.floor(days / 30)} months`;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return months ? `${years} y ${months} mo` : `${years} years`;
}

/**
 * The single source of truth for a patient's age.
 *
 * Prefers the date of birth. Falls back to the legacy free-text `age` field and
 * the `isFoal` flag for records created before dates were captured, so nothing
 * charted under the old model is lost.
 */
export interface PatientAge {
  days?: number;
  ageClass: AgeClass;
  label: string;
  isFoal: boolean;
  /** True when the class was inferred from the old free-text field. */
  inferred: boolean;
  /** True when the age sits between two published cohorts. */
  between: boolean;
}

export function patientAge(patient: Patient, now: Date): PatientAge {
  const days = ageInDays(patient.dateOfBirth, now);
  const fromDob = ageClassFromDays(days);
  if (fromDob) {
    return {
      days,
      ageClass: fromDob,
      label: formatAge(days),
      // Under six months the patient is still managed as a foal even once the
      // published haematology cohorts have run out.
      isFoal: (days as number) <= 180,
      inferred: false,
      between: betweenBands(days),
    };
  }

  // Legacy records: no date of birth on file.
  const isFoal = patient.isFoal || patient.category === 'NEONATAL_FOAL';
  return {
    ageClass: isFoal ? ageClassFor(patient.age, true) : 'ADULT',
    label: patient.age && patient.age !== 'Unknown' ? patient.age : 'age not recorded',
    isFoal,
    inferred: true,
    between: false,
  };
}

/**
 * How to draw the patient's mark.
 *
 * Material Symbols has no horse glyph, so the horseshoe and horse-head marks
 * are drawn as inline SVG in `PatientMark`. This returns which one to use and
 * the sex symbol that sits with it.
 */
export interface PatientMark {
  shape: 'horseshoe' | 'horsehead';
  symbol: string;
  sexLabel: string;
  /** "Mare · 7 years", for the title attribute and screen readers. */
  description: string;
}

export function patientMark(patient: Patient, now: Date): PatientMark {
  const age = patientAge(patient, now);
  const sex = sexOption(patient.sex);
  return {
    // A foal gets the horse's head, an adult the horseshoe — a shod, working
    // horse. It reads at a glance which population you are looking at.
    shape: age.isFoal ? 'horsehead' : 'horseshoe',
    symbol: sex.symbol,
    sexLabel: sex.label,
    description: `${sex.value === 'UNKNOWN' ? 'Sex not recorded' : sex.label} · ${age.label}`,
  };
}

