import type {
  Patient,
  FlowsheetColumn,
  FlowsheetEntry,
  ScoreBounds,
  AssessmentSeverity,
} from '../types';
import { calculateScoreBounds } from './missingDataHandler';
import { severityOf } from '../data/clinicalAssessments';
import { summariseGutSounds } from './gutSounds';

/**
 * The bridge between what is charted and what the scoring engines expect.
 *
 * The flowsheet stores clinician-facing values — "Pink, moist", four gut-sound
 * quadrants, ionised calcium in mmol/L. The scoring engines expect a flat
 * numeric record. Nothing in this file invents a value: a parameter that was
 * not charted stays `undefined`, which widens the score's uncertainty band
 * rather than quietly scoring as normal.
 */

const MM_MAP: Record<string, NonNullable<FlowsheetEntry['mucousMembranes']>> = {
  'Pink, moist': 'PINK',
  'Injected / hyperaemic': 'INJECTED',
  'Pale / tacky': 'PALE',
  'Muddy / dry': 'MUDDY',
  'Brick-red / toxic': 'TOXIC_RING',
  'Cyanotic / blue': 'CYANOTIC',
};

/** A structured finding is 'NORMAL' only when the catalogue grades it normal. */
function normalOrAbnormal(
  definitionId: string,
  value: string | undefined,
): 'NORMAL' | 'ABNORMAL' | undefined {
  if (!value) return undefined;
  return severityOf(definitionId, value) === 'normal' ? 'NORMAL' : 'ABNORMAL';
}

const numeric = (v: number | 'Pending' | undefined): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

/**
 * Total calcium, mg/dL, from the most recently collected full lab panel.
 *
 * The flowsheet round only charts ionised calcium (mmol/L) — a different
 * analyte in different units, deliberately not fed to any threshold expecting
 * total calcium (see the note below). Total calcium only exists in the full
 * `LabPanel` system, so this is the one scoring input `columnToEntry` sources
 * from somewhere other than the current round.
 */
function latestTotalCalcium(patient: Patient): number | undefined {
  const panels = patient.labPanels ?? [];
  if (!panels.length) return undefined;
  const latest = [...panels].sort(
    (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  )[0];
  const v = latest.values.lab_calcium;
  return Number.isFinite(v) ? v : undefined;
}

/** Map a charted round onto the flat record the scoring engines consume. */
export function columnToEntry(
  patient: Patient,
  column: FlowsheetColumn | undefined,
): Partial<FlowsheetEntry> {
  const calcium = latestTotalCalcium(patient);
  if (!column) return { calcium };
  const { vitals, gi, labs } = column;

  const gutSounds = gi?.gutSounds ? summariseGutSounds(gi.gutSounds) : undefined;

  return {
    patientId: patient.id,
    timestamp: column.recordedAt || column.time,
    recordedBy: column.recordedBy,

    heartRate: vitals?.heartRate,
    respiratoryRate: vitals?.respiratoryRate,
    // Foals are charted in °F and adults in °C. The scoring thresholds are all
    // Celsius, so a Fahrenheit reading is converted rather than dropped —
    // previously a foal's temperature never reached any panel at all.
    temperature: Number.isFinite(vitals?.temperatureC)
      ? vitals?.temperatureC
      : Number.isFinite(vitals?.temperatureF)
        ? Math.round((((vitals?.temperatureF as number) - 32) * 5) / 9 * 10) / 10
        : undefined,
    mucousMembranes: vitals?.mucousMembranes ? MM_MAP[vitals.mucousMembranes] : undefined,
    capillaryRefillTime: vitals?.crtSeconds,

    lactate: numeric(labs?.lactate),
    pcv: numeric(labs?.pcv),
    glucose: numeric(labs?.glucose),
    igg: numeric(labs?.igg),

    gastricRefluxVol: gi?.refluxVolumeL,
    gutSounds: gutSounds
      ? gutSounds.motility === 'Absent'
        ? 'ABSENT'
        : gutSounds.motility === 'Hyper-motile'
          ? 'HYPERMOTILE'
          : gutSounds.motility === 'Normal'
            ? 'NORMAL'
            : 'HYPOMOTILE'
      : undefined,
    abdominalUltrasound: normalOrAbnormal('flashUltrasound', gi?.flashUltrasound),
    rectalExam: normalOrAbnormal('rectalExam', gi?.rectalExam),

    // Total calcium, not the round's ionised calcium (mmol/L) — see
    // latestTotalCalcium. Feeding ionised mmol/L into a total-calcium mg/dL
    // threshold would score every patient abnormal, so the two stay separate.
    calcium,
  };
}

/* ------------------------------------------------------------------ */
/* Criterion-level scoring, so the rail can show its working            */
/* ------------------------------------------------------------------ */

export interface Criterion {
  id: string;
  label: string;
  /** Points contributed. `undefined` when the input was not charted. */
  points?: number;
  maxPoints: number;
  /** The charted value this was derived from. */
  evidence?: string;
  /** The threshold applied, verbatim. */
  rule: string;
}

export interface ScorePanel {
  id: string;
  title: string;
  /** Where the thresholds come from. Never a citation the code does not implement. */
  source: string;
  score: ScoreBounds;
  criteria: Criterion[];
  /** Plain-language reading of the score, or undefined when it is inconclusive. */
  interpretation?: string;
  severity: AssessmentSeverity;
  /** Caveat shown under the panel. */
  note?: string;
}

const boundsOf = (criteria: Criterion[]): ScoreBounds =>
  calculateScoreBounds(
    criteria.map((c) => ({ value: c.points, min: 0, max: c.maxPoints })),
  );

const fmt = (n: number | undefined, unit: string): string | undefined =>
  Number.isFinite(n) ? `${n} ${unit}` : undefined;

/**
 * SIRS in the adult horse, four criteria, positive at two or more.
 * Thresholds and the associated mortality figures are Biondi et al. 2026, and
 * are implemented here exactly as published — no additional criteria are added.
 */
export function sirsPanel(entry: Partial<FlowsheetEntry>): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'temp',
      label: 'Temperature',
      maxPoints: 1,
      rule: '< 37.0 °C or > 38.5 °C',
      evidence: fmt(entry.temperature, '°C'),
      points:
        entry.temperature === undefined
          ? undefined
          : entry.temperature < 37.0 || entry.temperature > 38.5
            ? 1
            : 0,
    },
    {
      id: 'hr',
      label: 'Heart rate',
      maxPoints: 1,
      rule: '> 52 bpm',
      evidence: fmt(entry.heartRate, 'bpm'),
      points: entry.heartRate === undefined ? undefined : entry.heartRate > 52 ? 1 : 0,
    },
    {
      id: 'rr',
      label: 'Respiratory rate',
      maxPoints: 1,
      rule: '> 20 breaths/min',
      evidence: fmt(entry.respiratoryRate, 'brpm'),
      points:
        entry.respiratoryRate === undefined ? undefined : entry.respiratoryRate > 20 ? 1 : 0,
    },
    {
      id: 'wbc',
      label: 'White cell count',
      maxPoints: 1,
      rule: '< 5,000 or > 12,500 /µL',
      evidence: fmt(entry.wbc, '/µL'),
      points: entry.wbc === undefined ? undefined : entry.wbc < 5000 || entry.wbc > 12500 ? 1 : 0,
    },
  ];

  const score = boundsOf(criteria);
  const positive = score.min >= 2;
  const cannotExclude = !positive && score.max >= 2;

  return {
    id: 'sirs',
    title: 'SIRS criteria (adult)',
    source: 'Biondi et al. 2026',
    score,
    criteria,
    severity: positive ? 'critical' : cannotExclude ? 'watch' : 'normal',
    interpretation: positive
      ? 'SIRS-positive (≥ 2 criteria). Reported mortality 50% vs 11.7% in SIRS-negative horses.'
      : cannotExclude
        ? 'Not SIRS-positive on what is charted, but uncharted criteria could still take it to ≥ 2.'
        : 'SIRS-negative on all four criteria. Reported mortality 11.7%.',
    note: score.isExact
      ? undefined
      : 'Range reflects criteria that have not been charted this round.',
  };
}

/**
 * A gastrointestinal severity ledger for the adult colic patient.
 *
 * This is a ward triage aggregation of individually published admission
 * cut-offs — it is deliberately NOT presented as the Colic Assessment Score or
 * any other named index, because the weightings are ours, not a validated
 * model's.
 */
export function giSeverityPanel(entry: Partial<FlowsheetEntry>): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'hr',
      label: 'Heart rate',
      maxPoints: 2,
      rule: '> 80 bpm = 2 · 60–80 = 1',
      evidence: fmt(entry.heartRate, 'bpm'),
      points:
        entry.heartRate === undefined ? undefined : entry.heartRate > 80 ? 2 : entry.heartRate >= 60 ? 1 : 0,
    },
    {
      id: 'lactate',
      label: 'Blood lactate',
      maxPoints: 2,
      rule: '> 4 mmol/L = 2 · 2–4 = 1',
      evidence: fmt(entry.lactate, 'mmol/L'),
      points:
        entry.lactate === undefined ? undefined : entry.lactate > 4 ? 2 : entry.lactate >= 2 ? 1 : 0,
    },
    {
      id: 'pcv',
      label: 'Haematocrit',
      maxPoints: 2,
      rule: '> 50% = 2 · 46–50% = 1',
      evidence: fmt(entry.pcv, '%'),
      points: entry.pcv === undefined ? undefined : entry.pcv > 50 ? 2 : entry.pcv > 46 ? 1 : 0,
    },
    {
      id: 'reflux',
      label: 'Net gastric reflux',
      maxPoints: 2,
      rule: '> 4 L = 2 · 2–4 L = 1',
      evidence: fmt(entry.gastricRefluxVol, 'L'),
      points:
        entry.gastricRefluxVol === undefined
          ? undefined
          : entry.gastricRefluxVol > 4
            ? 2
            : entry.gastricRefluxVol >= 2
              ? 1
              : 0,
    },
    {
      id: 'gut',
      label: 'Gut sounds',
      maxPoints: 2,
      rule: 'Absent = 2 · reduced = 1',
      evidence: entry.gutSounds,
      points:
        entry.gutSounds === undefined
          ? undefined
          : entry.gutSounds === 'ABSENT'
            ? 2
            : entry.gutSounds === 'HYPOMOTILE'
              ? 1
              : 0,
    },
    {
      id: 'rectal',
      label: 'Rectal examination',
      maxPoints: 2,
      rule: 'Abnormal finding = 2',
      evidence: entry.rectalExam,
      points: entry.rectalExam === undefined ? undefined : entry.rectalExam === 'ABNORMAL' ? 2 : 0,
    },
    {
      id: 'us',
      label: 'FLASH ultrasound',
      maxPoints: 2,
      rule: 'Abnormal finding = 2',
      evidence: entry.abdominalUltrasound,
      points:
        entry.abdominalUltrasound === undefined
          ? undefined
          : entry.abdominalUltrasound === 'ABNORMAL'
            ? 2
            : 0,
    },
    {
      id: 'mm',
      label: 'Mucous membranes',
      maxPoints: 2,
      rule: 'Muddy, toxic or cyanotic = 2 · pale or injected = 1',
      evidence: entry.mucousMembranes,
      points:
        entry.mucousMembranes === undefined
          ? undefined
          : ['MUDDY', 'TOXIC_RING', 'CYANOTIC'].includes(entry.mucousMembranes)
            ? 2
            : entry.mucousMembranes === 'PINK'
              ? 0
              : 1,
    },
  ];

  const score = boundsOf(criteria);
  const charted = criteria.filter((c) => c.points !== undefined).length;

  return {
    id: 'gi-severity',
    title: 'GI severity ledger',
    source: 'Ward triage weighting — not a validated index',
    score,
    criteria,
    severity: score.min >= 8 ? 'critical' : score.min >= 4 ? 'warning' : 'normal',
    interpretation:
      charted === 0
        ? undefined
        : `${score.min} point${score.min === 1 ? '' : 's'} confirmed from ${charted} of ${criteria.length} parameters.`,
    note: 'Weightings are a ward convention for triage. Do not report this as a published score.',
  };
}

/**
 * Colic assessment score (adult horse), Farrell, Kersh, Liepman & Dembek 2021
 * (Front Vet Sci 8:697589, "Development of a Colic Scoring System to Predict
 * Outcome in Horses"). Six variables from the retrospective/prospective study
 * (Table 2), each 0/1/2, summed 0–12; the published cutoff of > 7 maximised
 * sensitivity (84–86%) and specificity (62–64%) for non-survival, AUC 0.82.
 *
 * Lactate, ultrasound and rectal exam only take the published 0/2 endpoints —
 * the source table leaves their middle column blank. The lactate table prints
 * "0–2" then ">2.1"; the gap between 2 and 2.1 is treated as a typesetting
 * artefact of rounding, not an intended dead zone, and closed at > 2 mmol/L.
 */
export function casPanel(entry: Partial<FlowsheetEntry>): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'hr',
      label: 'Heart rate',
      maxPoints: 2,
      rule: '26–45 = 0 · 46–60 = 1 · ≥ 61 = 2',
      evidence: fmt(entry.heartRate, 'bpm'),
      points:
        entry.heartRate === undefined
          ? undefined
          : entry.heartRate >= 61
            ? 2
            : entry.heartRate >= 46
              ? 1
              : 0,
    },
    {
      id: 'rr',
      label: 'Respiratory rate',
      maxPoints: 2,
      rule: '5–16 = 0 · 17–28 = 1 · ≥ 29 = 2',
      evidence: fmt(entry.respiratoryRate, 'brpm'),
      points:
        entry.respiratoryRate === undefined
          ? undefined
          : entry.respiratoryRate >= 29
            ? 2
            : entry.respiratoryRate >= 17
              ? 1
              : 0,
    },
    {
      id: 'calcium',
      label: 'Total calcium',
      maxPoints: 2,
      rule: '≥ 11.9 = 0 · 10.6–11.8 = 1 · 6–10.5 = 2',
      evidence: fmt(entry.calcium, 'mg/dL'),
      points:
        entry.calcium === undefined
          ? undefined
          : entry.calcium >= 11.9
            ? 0
            : entry.calcium >= 10.6
              ? 1
              : 2,
    },
    {
      id: 'lactate',
      label: 'Blood lactate',
      maxPoints: 2,
      rule: '0–2 = 0 · > 2 = 2',
      evidence: fmt(entry.lactate, 'mmol/L'),
      points: entry.lactate === undefined ? undefined : entry.lactate > 2 ? 2 : 0,
    },
    {
      id: 'us',
      label: 'Abdominal ultrasound',
      maxPoints: 2,
      rule: 'Normal = 0 · abnormal = 2',
      evidence: entry.abdominalUltrasound,
      points:
        entry.abdominalUltrasound === undefined
          ? undefined
          : entry.abdominalUltrasound === 'ABNORMAL'
            ? 2
            : 0,
    },
    {
      id: 'rectal',
      label: 'Rectal examination',
      maxPoints: 2,
      rule: 'Normal = 0 · abnormal = 2',
      evidence: entry.rectalExam,
      points: entry.rectalExam === undefined ? undefined : entry.rectalExam === 'ABNORMAL' ? 2 : 0,
    },
  ];

  const score = boundsOf(criteria);
  // Cutoff is > 7 predicts non-survival, so a score of exactly 7 anywhere in
  // the range still predicts survival.
  const diePredicted = score.min > 7;
  const survivePredicted = score.max <= 7;

  return {
    id: 'cas',
    title: 'Colic assessment score (adult)',
    source: 'Farrell et al. 2021 (Front Vet Sci 8:697589)',
    score,
    criteria,
    severity: diePredicted ? 'critical' : survivePredicted ? 'normal' : 'warning',
    interpretation: diePredicted
      ? `CAS ${score.min}/12 — above the published cutoff of 7 for predicted non-survival (sensitivity 84–86%, specificity 62–64%).`
      : survivePredicted
        ? `CAS ${score.min === score.max ? score.min : `${score.min}–${score.max}`}/12 — at or below the cutoff of 7, predicting survival.`
        : `CAS ${score.min}–${score.max}/12 — uncharted criteria could still take this either side of the cutoff of 7.`,
    note: score.isExact
      ? undefined
      : 'Range reflects criteria that have not been charted this round; total calcium comes from the most recent lab panel, not the round itself.',
  };
}

/**
 * Foal survival, Brewer & Koterba's seven-item screen as implemented here.
 * Each item is one point for the favourable finding; the published score is
 * 0–7, so a value is only meaningful once most items are charted.
 */
export function foalSurvivalPanel(
  patient: Patient,
  entry: Partial<FlowsheetEntry>,
): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'gestation',
      label: 'Carried to term',
      maxPoints: 1,
      rule: '≥ 320 days gestation',
      evidence: fmt(patient.gestationalAgeDays, 'days'),
      points:
        patient.gestationalAgeDays === undefined
          ? undefined
          : patient.gestationalAgeDays >= 320
            ? 1
            : 0,
    },
    {
      id: 'extremities',
      label: 'Extremities warm',
      maxPoints: 1,
      rule: 'No cold extremities',
      evidence: entry.coldExtremities === undefined ? undefined : entry.coldExtremities ? 'cold' : 'warm',
      points: entry.coldExtremities === undefined ? undefined : entry.coldExtremities ? 0 : 1,
    },
    {
      id: 'sites',
      label: 'Infectious sites',
      maxPoints: 1,
      rule: 'Fewer than 2 sites',
      evidence:
        entry.infectiousSitesCount === undefined
          ? undefined
          : `${entry.infectiousSitesCount} site${entry.infectiousSitesCount === 1 ? '' : 's'}`,
      points:
        entry.infectiousSitesCount === undefined
          ? undefined
          : entry.infectiousSitesCount < 2
            ? 1
            : 0,
    },
    {
      id: 'glucose',
      label: 'Blood glucose',
      maxPoints: 1,
      rule: '> 40 mg/dL',
      evidence: fmt(entry.glucose, 'mg/dL'),
      points: entry.glucose === undefined ? undefined : entry.glucose > 40 ? 1 : 0,
    },
    {
      id: 'wbc',
      label: 'White cell count',
      maxPoints: 1,
      rule: '4,000–12,500 /µL',
      evidence: fmt(entry.wbc, '/µL'),
      points:
        entry.wbc === undefined ? undefined : entry.wbc >= 4000 && entry.wbc <= 12500 ? 1 : 0,
    },
    {
      id: 'igg',
      label: 'IgG',
      maxPoints: 1,
      rule: '> 800 mg/dL',
      evidence: fmt(entry.igg, 'mg/dL'),
      points: entry.igg === undefined ? undefined : entry.igg > 800 ? 1 : 0,
    },
  ];

  const score = boundsOf(criteria);
  const charted = criteria.filter((c) => c.points !== undefined).length;

  return {
    id: 'foal-survival',
    title: 'Foal survival screen',
    source: 'Brewer & Koterba items, 0–6 as implemented',
    score,
    criteria,
    severity: score.max <= 2 ? 'critical' : score.min >= 5 ? 'normal' : 'watch',
    interpretation:
      charted === 0
        ? undefined
        : `${score.min}–${score.max} of 6 favourable items, from ${charted} charted parameter${charted === 1 ? '' : 's'}.`,
    note: 'Six of the seven published items are charted here; no survival percentage is derived, because this app does not implement the published regression.',
  };
}

/**
 * SIRS in the neonatal foal. Separate from the adult panel because the
 * thresholds differ in every criterion — an adult-normal heart rate of 60 is
 * bradycardic in a neonate — and applying adult cut-offs to a foal would
 * misclassify most of them.
 */
export function neonatalSirsPanel(entry: Partial<FlowsheetEntry>): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'temp',
      label: 'Temperature',
      maxPoints: 1,
      rule: '< 37.2 °C or > 39.5 °C',
      evidence: fmt(entry.temperature, '°C'),
      points:
        entry.temperature === undefined
          ? undefined
          : entry.temperature < 37.2 || entry.temperature > 39.5
            ? 1
            : 0,
    },
    {
      id: 'hr',
      label: 'Heart rate',
      maxPoints: 1,
      rule: '< 60 or > 120 bpm',
      evidence: fmt(entry.heartRate, 'bpm'),
      points:
        entry.heartRate === undefined
          ? undefined
          : entry.heartRate < 60 || entry.heartRate > 120
            ? 1
            : 0,
    },
    {
      id: 'rr',
      label: 'Respiratory rate',
      maxPoints: 1,
      rule: '> 56 breaths/min',
      evidence: fmt(entry.respiratoryRate, 'brpm'),
      points:
        entry.respiratoryRate === undefined ? undefined : entry.respiratoryRate > 56 ? 1 : 0,
    },
    {
      id: 'wbc',
      label: 'White cell count',
      maxPoints: 1,
      rule: '< 4,000 or > 12,500 /µL',
      evidence: fmt(entry.wbc, '/µL'),
      points: entry.wbc === undefined ? undefined : entry.wbc < 4000 || entry.wbc > 12500 ? 1 : 0,
    },
  ];

  const score = boundsOf(criteria);
  const positive = score.min >= 2;

  return {
    id: 'sirs-neonatal',
    title: 'SIRS criteria (neonatal foal)',
    source: 'Neonatal thresholds — foal-specific, not the adult cut-offs',
    score,
    criteria,
    severity: positive ? 'critical' : score.max >= 2 ? 'watch' : 'normal',
    interpretation: positive
      ? 'SIRS-positive (≥ 2 criteria) on neonatal thresholds.'
      : score.max >= 2
        ? 'Not SIRS-positive on what is charted; uncharted criteria could still reach ≥ 2.'
        : 'SIRS-negative on all four neonatal criteria.',
    note: score.isExact
      ? undefined
      : 'Range reflects criteria that have not been charted this round.',
  };
}

/** Panels appropriate to this patient, in the order the ward reads them. */
export function buildPanels(
  patient: Patient,
  entry: Partial<FlowsheetEntry>,
): ScorePanel[] {
  return patient.isFoal
    ? [neonatalSirsPanel(entry), foalSurvivalPanel(patient, entry)]
    : [sirsPanel(entry), giSeverityPanel(entry), casPanel(entry)];
}

/** True when at least one input for this panel was actually charted. */
export const panelHasData = (p: ScorePanel): boolean =>
  p.criteria.some((c) => c.points !== undefined);
