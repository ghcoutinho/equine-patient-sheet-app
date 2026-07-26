/**
 * Age-stratified equine reference intervals.
 *
 * Cornell's published intervals (see cornellReferenceRanges.ts) state explicitly
 * that they "are only applicable for adult animals and not young animals", so
 * foal values are drawn from the peer-reviewed literature and carried here with
 * their own provenance. Every interval records which source it came from, the
 * population it was derived in, and whether it is a true reference interval, an
 * upper limit or a mean ± SD. Nothing is interpolated between age bands and
 * nothing is invented — where a source has no value, the entry is absent.
 *
 * Units are converted to the conventional units used elsewhere in the app.
 * Conversions applied to Sant et al. (2024), which publishes in SI:
 *   haemoglobin  g/L  ÷ 10  -> g/dL
 *   haematocrit  L/L  x 100 -> %
 *   cell counts  x10^9/L    -> K/µL   (numerically identical)
 *   protein      g/L  ÷ 10  -> g/dL
 *   fibrinogen   g/L  x 100 -> mg/dL
 */

export type AgeClass = 'NEONATE_0_2D' | 'FOAL_5_10D' | 'FOAL_20_32D' | 'ADULT';

export const AGE_CLASSES: { id: AgeClass; label: string; detail: string }[] = [
  { id: 'NEONATE_0_2D', label: 'Neonate', detail: '0–2 days' },
  { id: 'FOAL_5_10D', label: 'Foal', detail: '5–10 days' },
  { id: 'FOAL_20_32D', label: 'Foal', detail: '20–32 days' },
  { id: 'ADULT', label: 'Adult', detail: 'mature horse' },
];

export type ValueKind = 'interval' | 'upper-limit' | 'median-iqr' | 'mean-sd';

export interface RangeSource {
  id: string;
  citation: string;
  doi?: string;
  url?: string;
  /** Population and method caveats a clinician should weigh before using it. */
  caveat?: string;
}

export const RANGE_SOURCES: Record<string, RangeSource> = {
  sant2024: {
    id: 'sant2024',
    citation:
      'Sant C, Lima DM, d’Abadie R, Pargass I, Georges KC. Hematological profile of healthy Thoroughbred foals from birth to one month of age in Trinidad, West Indies. Am J Vet Res. 2024;85(2):ajvr.23.09.0206.',
    doi: '10.2460/ajvr.23.09.0206',
    url: 'https://avmajournals.avma.org/view/journals/ajvr/85/2/ajvr.23.09.0206.xml',
    caveat:
      'n = 67/66/61 healthy Thoroughbred foals, Trinidad (tropical). Non-parametric 95% reference intervals per ASVCP guidelines. The authors note haemoglobin and haematocrit were lower, and WBC and neutrophil counts higher, than North American foals — treat as indicative rather than definitive outside comparable populations. Fibrinogen by heat precipitation and refractometer, so resolution is coarse (1 g/L steps).',
  },
  axonPalmer2008: {
    id: 'axonPalmer2008',
    citation:
      'Axon JE, Palmer JE. Clinical pathology of the foal. Vet Clin North Am Equine Pract. 2008;24(2):357–385. Reproduced in Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018: Table 20.12.',
    caveat:
      'Published as upper limits only (values below the limit are considered normal), not as two-sided reference intervals. Consolidated in Table 20.12 alongside Divers & Byars (2011), Barton & LeRoy (2007) and Armengou et al. (2013).',
  },
  wilkins2018: {
    id: 'wilkins2018',
    citation:
      'Wilkins PA. Disorders of foals. In: Reed SM, Bayly WM, Sellon DC, eds. Equine Internal Medicine. 4th ed. Elsevier; 2018: Table 20.9.',
    caveat: 'Arterial blood gas values reported as mean ± SD in term foals by postnatal age.',
  },
  martinCuervo2025: {
    id: 'martinCuervo2025',
    citation:
      'Martín-Cuervo M, et al. Blood parameters in neonatal foal and colostrum quality as possible early markers for increased risk of developing Rhodococcus equi pneumonia. Front Vet Sci. 2025;12:1654052.',
    doi: '10.3389/fvets.2025.1654052',
    url: 'https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2025.1654052/full',
    caveat:
      'n = 178 healthy Arabian / Arabian-cross foals sampled in the first 24 hours. Reported as median (IQR), not a formal reference interval.',
  },
  cornell: {
    id: 'cornell',
    citation:
      'Cornell University Animal Health Diagnostic Center, Clinical Pathology Laboratory. Equine reference intervals (Cobas 501 chemistry, Advia 2120 haematology, immunology).',
    url: 'https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals',
    caveat:
      'Cornell states these intervals are applicable to adult animals only; young animals show age-dependent variation.',
  },
};

export interface AgeValue {
  min?: number;
  max?: number;
  /** For mean-sd entries. */
  mean?: number;
  sd?: number;
  kind: ValueKind;
  sourceId: keyof typeof RANGE_SOURCES;
  n?: number;
  note?: string;
}

export interface AgeStratifiedParameter {
  id: string;
  name: string;
  panel: 'Haematology' | 'Chemistry' | 'Hepatobiliary' | 'Blood gas';
  units: string;
  byAge: Partial<Record<AgeClass, AgeValue>>;
}

const S = (min: number, max: number, n?: number): AgeValue => ({
  min,
  max,
  kind: 'interval',
  sourceId: 'sant2024',
  n,
});

const UL = (max: number): AgeValue => ({ max, kind: 'upper-limit', sourceId: 'axonPalmer2008' });

/** Complete blood count, by foal age band. Sant et al. 2024. */
export const FOAL_HAEMATOLOGY: AgeStratifiedParameter[] = [
  {
    id: 'hgb', name: 'Haemoglobin', panel: 'Haematology', units: 'g/dL',
    byAge: { NEONATE_0_2D: S(9.5, 16.6, 66), FOAL_5_10D: S(7.8, 15.0, 66), FOAL_20_32D: S(8.5, 14.2, 56) },
  },
  {
    id: 'pcv', name: 'Haematocrit (PCV)', panel: 'Haematology', units: '%',
    byAge: { NEONATE_0_2D: S(32, 48, 67), FOAL_5_10D: S(22, 41, 66), FOAL_20_32D: S(22, 40, 56) },
  },
  {
    id: 'mchc', name: 'MCHC', panel: 'Haematology', units: 'g/dL',
    byAge: { NEONATE_0_2D: S(28.9, 37.8, 65), FOAL_5_10D: S(33.1, 39.0, 66), FOAL_20_32D: S(28.4, 39.6, 56) },
  },
  {
    id: 'platelets', name: 'Platelets', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(43, 423, 59), FOAL_5_10D: S(72, 457, 55), FOAL_20_32D: S(106, 718, 48) },
  },
  {
    id: 'tpp', name: 'Total plasma protein', panel: 'Haematology', units: 'g/dL',
    byAge: { NEONATE_0_2D: S(5.7, 7.6, 23), FOAL_5_10D: S(5.4, 7.5, 22), FOAL_20_32D: S(5.4, 7.4, 15) },
  },
  {
    id: 'fibrinogen', name: 'Fibrinogen', panel: 'Haematology', units: 'mg/dL',
    byAge: {
      NEONATE_0_2D: { ...S(100, 800, 21), note: 'Heat precipitation; 1 g/L resolution' },
      FOAL_5_10D: { ...S(100, 700, 16), note: 'Heat precipitation; 1 g/L resolution' },
      FOAL_20_32D: { ...S(100, 1000, 15), note: 'Heat precipitation; 1 g/L resolution' },
    },
  },
  {
    id: 'wbc', name: 'WBC', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(6.4, 21.4, 67), FOAL_5_10D: S(6.3, 22.4, 66), FOAL_20_32D: S(5.3, 21.9, 55) },
  },
  {
    id: 'neuts_seg', name: 'Neutrophils (segmented)', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(3.88, 17.69, 67), FOAL_5_10D: S(3.35, 18.29, 66), FOAL_20_32D: S(2.23, 17.13, 55) },
  },
  {
    id: 'neuts_band', name: 'Neutrophils (band)', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(0.0, 0.46, 67), FOAL_5_10D: S(0.0, 0.30, 67), FOAL_20_32D: S(0.0, 0.0, 58) },
  },
  {
    id: 'lymphocytes', name: 'Lymphocytes', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(0.92, 4.64, 67), FOAL_5_10D: S(1.04, 5.04, 66), FOAL_20_32D: S(1.15, 5.84, 55) },
  },
  {
    id: 'monocytes', name: 'Monocytes', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(0.0, 1.27, 67), FOAL_5_10D: S(0.0, 1.14, 66), FOAL_20_32D: S(0.0, 1.35, 58) },
  },
  {
    id: 'eosinophils', name: 'Eosinophils', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(0.0, 0.10, 67), FOAL_5_10D: S(0.0, 0.24, 66), FOAL_20_32D: S(0.0, 0.73, 58) },
  },
  {
    id: 'basophils', name: 'Basophils', panel: 'Haematology', units: 'K/µL',
    byAge: { NEONATE_0_2D: S(0.0, 0.21, 67), FOAL_5_10D: S(0.0, 0.43, 66), FOAL_20_32D: S(0.0, 0.20, 60) },
  },
];

/**
 * Hepatobiliary enzymes and bilirubin. Axon & Palmer, via Equine Internal
 * Medicine Table 20.12. Published age points are 1 day / 7 days / 1 month,
 * mapped onto the nearest age band. Upper limits only.
 */
export const FOAL_HEPATOBILIARY: AgeStratifiedParameter[] = [
  {
    id: 'alp', name: 'Alkaline phosphatase', panel: 'Hepatobiliary', units: 'IU/L',
    byAge: { NEONATE_0_2D: UL(2670), FOAL_5_10D: UL(1170), FOAL_20_32D: UL(866) },
  },
  {
    id: 'ggt', name: 'GGT', panel: 'Hepatobiliary', units: 'IU/L',
    byAge: { NEONATE_0_2D: UL(33), FOAL_5_10D: UL(98), FOAL_20_32D: UL(44) },
  },
  {
    id: 'sdh', name: 'Sorbitol dehydrogenase', panel: 'Hepatobiliary', units: 'IU/L',
    byAge: { NEONATE_0_2D: UL(21), FOAL_5_10D: UL(18), FOAL_20_32D: UL(6) },
  },
  {
    id: 'ast', name: 'AST', panel: 'Hepatobiliary', units: 'IU/L',
    byAge: { NEONATE_0_2D: UL(340), FOAL_5_10D: UL(620), FOAL_20_32D: UL(440) },
  },
  {
    id: 'gldh', name: 'GLDH', panel: 'Hepatobiliary', units: 'IU/L',
    byAge: { NEONATE_0_2D: UL(27.5), FOAL_5_10D: UL(17) },
  },
  {
    id: 'tbili', name: 'Total bilirubin', panel: 'Hepatobiliary', units: 'mg/dL',
    byAge: { NEONATE_0_2D: UL(4.5), FOAL_5_10D: UL(3.3), FOAL_20_32D: UL(1.7) },
  },
  {
    id: 'dbili', name: 'Direct bilirubin', panel: 'Hepatobiliary', units: 'mg/dL',
    byAge: { NEONATE_0_2D: UL(0.35), FOAL_5_10D: UL(0.7), FOAL_20_32D: UL(0.6) },
  },
  {
    id: 'ammonia', name: 'Ammonia', panel: 'Hepatobiliary', units: 'µg/dL',
    byAge: { FOAL_5_10D: UL(60) },
  },
  {
    id: 'bile_acids', name: 'Bile acids', panel: 'Hepatobiliary', units: 'µmol/L',
    byAge: { NEONATE_0_2D: UL(82), FOAL_5_10D: UL(30), FOAL_20_32D: UL(17) },
  },
];

/** Renal and hepatic markers in the first 24 hours. Martín-Cuervo et al. 2025. */
export const FOAL_CHEMISTRY: AgeStratifiedParameter[] = [
  {
    id: 'urea', name: 'Urea', panel: 'Chemistry', units: 'mg/dL',
    byAge: {
      NEONATE_0_2D: { min: 23, max: 37, mean: 29, kind: 'median-iqr', sourceId: 'martinCuervo2025', n: 178 },
    },
  },
  {
    id: 'creatinine', name: 'Creatinine', panel: 'Chemistry', units: 'mg/dL',
    byAge: {
      NEONATE_0_2D: { min: 1.1, max: 1.6, mean: 1.3, kind: 'median-iqr', sourceId: 'martinCuervo2025', n: 178 },
    },
  },
  {
    id: 'ggt_chem', name: 'GGT', panel: 'Chemistry', units: 'U/L',
    byAge: {
      NEONATE_0_2D: { min: 10, max: 24, mean: 14, kind: 'median-iqr', sourceId: 'martinCuervo2025', n: 178 },
    },
  },
];

/**
 * Arterial blood gas in term foals by postnatal age. Wilkins, Equine Internal
 * Medicine Table 20.9. A time series rather than an age band, so it is kept
 * separate and rendered as its own table.
 */
export interface BloodGasPoint {
  postnatalAge: string;
  pao2: { mean: number; sd: number };
  paco2: { mean: number; sd: number };
  ph: { mean: number; sd: number };
  premature?: boolean;
}

export const FOAL_BLOOD_GAS: BloodGasPoint[] = [
  { postnatalAge: '2 min', pao2: { mean: 56.4, sd: 2.3 }, paco2: { mean: 54.1, sd: 2.0 }, ph: { mean: 7.31, sd: 0.02 } },
  { postnatalAge: '15 min', pao2: { mean: 57.5, sd: 3.6 }, paco2: { mean: 50.4, sd: 2.7 }, ph: { mean: 7.32, sd: 0.03 } },
  { postnatalAge: '30 min', pao2: { mean: 57.0, sd: 1.8 }, paco2: { mean: 51.5, sd: 1.5 }, ph: { mean: 7.35, sd: 0.01 } },
  { postnatalAge: '60 min', pao2: { mean: 60.9, sd: 2.7 }, paco2: { mean: 47.3, sd: 2.2 }, ph: { mean: 7.36, sd: 0.01 } },
  { postnatalAge: '2 h', pao2: { mean: 66.5, sd: 2.3 }, paco2: { mean: 47.7, sd: 1.7 }, ph: { mean: 7.36, sd: 0.01 } },
  { postnatalAge: '4 h', pao2: { mean: 75.7, sd: 4.9 }, paco2: { mean: 45.0, sd: 1.9 }, ph: { mean: 7.35, sd: 0.02 } },
  { postnatalAge: '12 h', pao2: { mean: 73.5, sd: 3.0 }, paco2: { mean: 44.3, sd: 1.2 }, ph: { mean: 7.36, sd: 0.02 } },
  { postnatalAge: '48 h', pao2: { mean: 74.9, sd: 3.3 }, paco2: { mean: 46.1, sd: 1.1 }, ph: { mean: 7.37, sd: 0.01 } },
  { postnatalAge: '4 days', pao2: { mean: 81.2, sd: 3.1 }, paco2: { mean: 45.8, sd: 1.1 }, ph: { mean: 7.40, sd: 0.01 } },
  { postnatalAge: '7 days', pao2: { mean: 86.9, sd: 2.2 }, paco2: { mean: 46.7, sd: 1.1 }, ph: { mean: 7.37, sd: 0.01 } },
  { postnatalAge: '0.5–11 h (premature)', pao2: { mean: 53.7, sd: 1.5 }, paco2: { mean: 55.3, sd: 3.6 }, ph: { mean: 7.21, sd: 0.05 }, premature: true },
];

export const ALL_FOAL_PARAMETERS: AgeStratifiedParameter[] = [
  ...FOAL_HAEMATOLOGY,
  ...FOAL_CHEMISTRY,
  ...FOAL_HEPATOBILIARY,
];

/** Format an interval for display, honouring the kind of value it is. */
export function formatAgeValue(v: AgeValue): string {
  switch (v.kind) {
    case 'upper-limit':
      return `< ${v.max}`;
    case 'median-iqr':
      return `${v.mean} (${v.min}–${v.max})`;
    case 'mean-sd':
      return `${v.mean} ± ${v.sd}`;
    default:
      return `${v.min}–${v.max}`;
  }
}

export const VALUE_KIND_LABEL: Record<ValueKind, string> = {
  interval: '95% reference interval',
  'upper-limit': 'upper limit',
  'median-iqr': 'median (IQR)',
  'mean-sd': 'mean ± SD',
};

/** Pick the age band a patient falls into, from an age string like "2 Days". */
export function ageClassFor(ageText: string | undefined, isFoal: boolean | undefined): AgeClass {
  if (!isFoal) return 'ADULT';
  const t = (ageText || '').toLowerCase();
  const num = parseFloat(t);
  if (!Number.isFinite(num)) return 'NEONATE_0_2D';
  const days = /week/.test(t) ? num * 7 : /month/.test(t) ? num * 30 : /year/.test(t) ? num * 365 : num;
  if (days <= 2) return 'NEONATE_0_2D';
  if (days <= 10) return 'FOAL_5_10D';
  if (days <= 32) return 'FOAL_20_32D';
  return 'ADULT';
}
