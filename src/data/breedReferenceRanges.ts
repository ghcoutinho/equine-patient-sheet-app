/**
 * Breed- and type-stratified erythron values, and the equine haemostasis panel.
 *
 * Reference intervals vary by breed as much as some analytes vary by age: a
 * Clydesdale with a PCV of 42% is well outside its breed mean, while the same
 * value in a Thoroughbred is unremarkable. The app records patient.breed, so
 * these are looked up rather than left to the reader.
 *
 * Source: Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed.
 * Elsevier; 2018. Chapter 15, Tables 15.1, 15.2 and 15.6.
 *
 * The source states, of every table here: "These numbers are for reference
 * only. Each laboratory should establish its own normal equine values."
 */

export interface MeanSd {
  mean: number;
  sd?: number;
}

/** Table 15.2 — mean ± SD erythron values in adult horses, by breed. */
export interface BreedErythron {
  breed: string;
  rbc?: MeanSd; // x10^6/µL
  hgb?: MeanSd; // g/dL
  pcv?: MeanSd; // %
  mcv?: MeanSd; // fL
  mch?: MeanSd; // pg
  mchc?: MeanSd; // %
}

export const BREED_ERYTHRON: BreedErythron[] = [
  {
    breed: 'Thoroughbred',
    rbc: { mean: 9.35, sd: 1.05 }, hgb: { mean: 14.8, sd: 1.3 }, pcv: { mean: 41.7, sd: 3.8 },
    mcv: { mean: 44.7, sd: 3.4 }, mch: { mean: 15.9, sd: 1.4 }, mchc: { mean: 35.8, sd: 1.4 },
  },
  {
    breed: 'Standardbred',
    rbc: { mean: 8.37, sd: 1.02 }, hgb: { mean: 13.6, sd: 1.6 }, pcv: { mean: 38.3, sd: 3.5 },
    mcv: { mean: 46.1, sd: 4.0 }, mch: { mean: 16.3, sd: 1.4 }, mchc: { mean: 35.5, sd: 1.6 },
  },
  {
    breed: 'Quarter Horse',
    rbc: { mean: 8.26, sd: 1.02 }, hgb: { mean: 13.3, sd: 1.6 }, pcv: { mean: 38.0, sd: 4.0 },
    mcv: { mean: 46.2, sd: 3.9 }, mch: { mean: 16.1, sd: 1.7 }, mchc: { mean: 34.9, sd: 1.6 },
  },
  {
    breed: 'Appaloosa',
    rbc: { mean: 8.60, sd: 1.11 }, hgb: { mean: 13.3, sd: 1.6 }, pcv: { mean: 38.4, sd: 4.7 },
    mcv: { mean: 44.8, sd: 4.4 }, mch: { mean: 15.5, sd: 1.3 }, mchc: { mean: 34.5, sd: 0.8 },
  },
  {
    breed: 'Arabian',
    rbc: { mean: 8.41, sd: 1.21 }, hgb: { mean: 13.8, sd: 2.1 }, pcv: { mean: 39.3, sd: 5.0 },
    mcv: { mean: 46.9, sd: 1.9 }, mch: { mean: 16.4, sd: 0.9 }, mchc: { mean: 34.9, sd: 1.0 },
  },
  {
    breed: 'Clydesdale',
    rbc: { mean: 7.30, sd: 0.87 }, hgb: { mean: 12.4, sd: 1.1 }, pcv: { mean: 33.0, sd: 3.0 },
    mcv: { mean: 44.6 }, mchc: { mean: 38.1 },
  },
  {
    breed: 'Percheron',
    rbc: { mean: 7.39, sd: 1.08 }, hgb: { mean: 11.7, sd: 1.4 },
  },
  {
    breed: 'Mixed cold-blooded',
    rbc: { mean: 7.76, sd: 1.23 }, pcv: { mean: 33.0, sd: 7.0 }, mcv: { mean: 42.3 },
  },
];

/** Table 15.1 — reference ranges by horse type. */
export interface TypeRange {
  min: number;
  max: number;
}

export interface TypeErythron {
  type: 'Light horse' | 'Draft horse' | 'Miniature horse' | 'Donkey';
  sourceNote: string;
  rbc?: TypeRange; // x10^6/µL
  hgb?: TypeRange; // g/dL
  pcv?: TypeRange; // %
  mcv?: TypeRange; // fL
  mch?: TypeRange; // µg (as printed)
  mchc?: TypeRange; // g/dL
}

export const TYPE_ERYTHRON: TypeErythron[] = [
  {
    type: 'Light horse',
    sourceNote: 'North Carolina State University Clinical Pathology Laboratory equine reference values',
    rbc: { min: 6.0, max: 10.0 }, hgb: { min: 12.0, max: 17.0 }, pcv: { min: 32, max: 50 },
    mcv: { min: 42, max: 58 }, mch: { min: 15, max: 20 }, mchc: { min: 32, max: 38 },
  },
  {
    type: 'Draft horse',
    sourceNote: 'Jain N. Schalm’s Veterinary Hematology. 4th ed. Lea & Febiger; 1986',
    rbc: { min: 5.5, max: 9.5 }, hgb: { min: 8.0, max: 14.0 }, pcv: { min: 24, max: 44 },
  },
  {
    type: 'Miniature horse',
    sourceNote:
      'Harvey R, Hambright M, Rowe L. Clinical biochemical and hematologic values of the American Miniature Horse. Am J Vet Res. 1984;45:987',
    rbc: { min: 4.3, max: 10.3 }, hgb: { min: 9.0, max: 16.0 }, pcv: { min: 24, max: 42 },
    mcv: { min: 38, max: 61 }, mch: { min: 14, max: 23 }, mchc: { min: 33, max: 40 },
  },
  {
    type: 'Donkey',
    sourceNote:
      'Zinkl J, Mae D, Merida P, et al. Reference ranges and the influence of age and sex on hematologic and serum biochemical values in donkeys (Equus asinus). Am J Vet Res. 1990;51:408',
    rbc: { min: 4.7, max: 9.0 }, hgb: { min: 9.5, max: 16.5 }, pcv: { min: 28, max: 47 },
    mcv: { min: 46, max: 67 }, mch: { min: 16, max: 23 }, mchc: { min: 32, max: 36 },
  },
];

/** Table 15.6 — haemostatic reference values. The app had no coagulation panel at all. */
export interface HaemostasisRange {
  parameter: string;
  units: string;
  display: string;
  reference: string;
  /** Recorded where the printed units look inconsistent with the value. */
  unitWarning?: string;
}

export const HAEMOSTASIS_PANEL: HaemostasisRange[] = [
  { parameter: 'Platelet count', units: '/µL', display: '75,000–300,000', reference: 'NCSU' },
  {
    parameter: 'Fibrinogen',
    units: 'mg/dL',
    display: '< 400',
    reference: 'NCSU',
    unitWarning:
      'Table 15.6 prints the unit as g/dL. A value of 400 is consistent with mg/dL, the conventional unit used elsewhere in this app, and is 1000x off as g/dL. Recorded as mg/dL — confirm against your laboratory.',
  },
  { parameter: 'Prothrombin time (PT)', units: 'seconds', display: '8.5–9.9', reference: 'NCSU' },
  { parameter: 'aPTT', units: 'seconds', display: '30–44', reference: 'NCSU' },
  {
    parameter: 'Fibrin degradation products',
    units: 'mg/dL',
    display: '< 20',
    reference: 'NCSU',
    unitWarning: 'Reproduced as printed in Table 15.6; FDPs are more commonly reported in µg/mL.',
  },
  {
    parameter: 'Antithrombin III',
    units: '% PNEP',
    display: '63–131',
    reference: 'Johnstone IB, Physick-Sheard P, Crane S. Am J Vet Res. 1989;50:1751',
  },
  {
    parameter: 'Antithrombin III',
    units: '% PNHP',
    display: '218 ± 18',
    reference: 'Bernard W, Morris DD, Divers TJ, et al. Am J Vet Res. 1987;48:866',
  },
  {
    parameter: 'Plasminogen',
    units: '% PNEP',
    display: '64.6–155.9',
    reference: 'Welles EG, Prasse KW, Duncan A. Am J Vet Res. 1990;51:1080',
  },
  {
    parameter: 'Protein C',
    units: '% PNEP',
    display: '104.5 ± 13.8',
    reference: 'Welles EG, Prasse KW, Duncan A, et al. Am J Vet Res. 1990;51:1075',
  },
];

export const EQUINE_INTERNAL_MEDICINE_SOURCE =
  'Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018. Chapter 15, Tables 15.1, 15.2 and 15.6.';

/** Match a free-text breed field to a row in Table 15.2. */
export function breedErythronFor(breed: string | undefined): BreedErythron | undefined {
  if (!breed) return undefined;
  const b = breed.trim().toLowerCase();
  return BREED_ERYTHRON.find((e) => b.includes(e.breed.toLowerCase()));
}

/** ± 2 SD around a breed mean, the conventional stand-in for a reference interval. */
export function breedInterval(v: MeanSd | undefined): { min: number; max: number } | undefined {
  if (!v || v.sd === undefined) return undefined;
  const round = (n: number) => Math.round(n * 10) / 10;
  return { min: round(v.mean - 2 * v.sd), max: round(v.mean + 2 * v.sd) };
}
