import type {
  Patient,
  FlowsheetColumn,
  FlowsheetEntry,
  ScoreBounds,
  AssessmentSeverity,
} from '../types';
import { calculateScoreBounds } from './missingDataHandler';
import { severityOf, severityOfAny } from '../data/clinicalAssessments';
import { summariseGutSounds } from './gutSounds';
import { computeDerived } from './labs';
import { neonatalSepsisPanel } from './neonatalSepsisScore';

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

/**
 * A multi-select finding is 'NORMAL' only when the catalogue grades every
 * selected value normal — one abnormal finding among several selected is
 * still abnormal.
 */
function normalOrAbnormal(
  definitionId: string,
  values: string[] | undefined,
): 'NORMAL' | 'ABNORMAL' | undefined {
  if (!values?.length) return undefined;
  return severityOfAny(definitionId, values) === 'normal' ? 'NORMAL' : 'ABNORMAL';
}

const numeric = (v: number | 'Pending' | undefined): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

/**
 * CPS point value (0-3) of a selected behaviour, via the same severity tag
 * the option is styled with — normal/watch/warning/critical maps onto the
 * scale's own 0/1/2/3, so the two never need to be kept in sync separately.
 */
const CPS_SEVERITY_POINTS: Record<AssessmentSeverity, number> = {
  normal: 0,
  watch: 1,
  warning: 2,
  critical: 3,
};
const cpsPoints = (definitionId: string, value: string | undefined): number | undefined =>
  value === undefined ? undefined : CPS_SEVERITY_POINTS[severityOf(definitionId, value)];

/**
 * A parameter from the most recently collected full lab panel.
 *
 * Some scoring inputs are not part of the quick round. Total calcium is the
 * clearest case — the round charts *ionised* calcium in mmol/L, a different
 * analyte in different units — but band neutrophils, fibrinogen and blood gas
 * live only in the panel too. Those come from here rather than being
 * re-entered, per principle E.
 */
function latestPanelValue(patient: Patient, parameterId: string): number | undefined {
  const panels = patient.labPanels ?? [];
  if (!panels.length) return undefined;
  const latest = [...panels].sort(
    (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  )[0];
  const v = latest.values[parameterId];
  return Number.isFinite(v) ? v : undefined;
}

/**
 * A *derived* parameter (RPR — RDW ÷ platelets) from the most recent panel.
 *
 * Reuses labs.ts's own computeDerived rather than re-dividing RDW by
 * platelets a second way — biomarkerEvaluator.ts used to do exactly that as
 * a fallback, which is the same "two engines can disagree" shape the FSS
 * split-brain and the dose-calculator merge were both written from.
 */
function latestDerivedPanelValue(patient: Patient, derivedId: string): number | undefined {
  const panels = patient.labPanels ?? [];
  if (!panels.length) return undefined;
  const latest = [...panels].sort(
    (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  )[0];
  return computeDerived(latest.values).find((r) => r.parameter.id === derivedId)?.value;
}

/**
 * Hours between `Patient.surgeryPerformedAt` and when the most recent lab
 * panel was collected — SAA is panel-sourced, so its post-op window has to
 * be measured against the panel's own `collectedAt`, not the round's time.
 * Undefined when there is no surgery time or no panel to measure against.
 */
function hoursSincePostop(patient: Patient): number | undefined {
  if (!patient.surgeryPerformedAt) return undefined;
  const panels = patient.labPanels ?? [];
  if (!panels.length) return undefined;
  const latest = [...panels].sort(
    (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
  )[0];
  const surgeryMs = new Date(patient.surgeryPerformedAt).getTime();
  const collectedMs = new Date(latest.collectedAt).getTime();
  if (!Number.isFinite(surgeryMs) || !Number.isFinite(collectedMs)) return undefined;
  return (collectedMs - surgeryMs) / (60 * 60 * 1000);
}

/** Thousands per microlitre → per microlitre. */
const K_PER_UL_TO_PER_UL = 1000;

/**
 * White cell count, converted to cells/µL for the scoring engines.
 *
 * The app charts WBC in K/µL — `RoundEntryView`'s field is labelled "White cell
 * count (K/µL)" and `lab_wbc` is K/µL — but every published threshold the score
 * panels implement is written in cells/µL (SIRS `< 5,000` / `> 12,500`, Brewer
 * & Koterba `< 2000`). The two conventions coexisted in this codebase with
 * nothing converting between them, and `columnToEntry` simply never mapped WBC
 * at all, so the SIRS white-cell criterion could never score — which quietly
 * masked the collision. Mapping it without this conversion would read a charted
 * 9.0 K/µL as 9 cells/µL and call every patient profoundly leukopenic.
 *
 * `ColicReadouts` and `ENDOTOXEMIA.leukopeniaBelow` deliberately stay in K/µL;
 * they read the charted value directly and are not affected by this.
 */
function wbcPerMicrolitre(
  patient: Patient,
  labs: FlowsheetColumn['labs'] | undefined,
): number | undefined {
  const charted = numeric(labs?.wbc) ?? latestPanelValue(patient, 'lab_wbc');
  return charted === undefined ? undefined : charted * K_PER_UL_TO_PER_UL;
}

/** Map a charted round onto the flat record the scoring engines consume. */
export function columnToEntry(
  patient: Patient,
  column: FlowsheetColumn | undefined,
): Partial<FlowsheetEntry> {
  // Sourced from the most recent full lab panel, not the quick round — none
  // of these are part of TPR/GI/quick-labs charting. bands is charted in K/µL
  // like WBC and gets the same conversion, for the same reason (see
  // wbcPerMicrolitre) — the neonatal sepsis score's absolute-count thresholds
  // are written in cells/µL.
  const calcium = latestPanelValue(patient, 'lab_calcium');
  const saa = latestPanelValue(patient, 'lab_saa');
  const ngal = latestPanelValue(patient, 'lab_ngal');
  const rpr = latestDerivedPanelValue(patient, 'lab_rpr');
  const bandsKPerUl = latestPanelValue(patient, 'lab_neuts_band');
  const bands = bandsKPerUl === undefined ? undefined : bandsKPerUl * K_PER_UL_TO_PER_UL;
  const fibrinogen = latestPanelValue(patient, 'lab_fibrinogen');
  const pao2 = latestPanelValue(patient, 'lab_po2');
  const paco2 = latestPanelValue(patient, 'lab_pco2');
  const panelSourced = {
    calcium,
    saa,
    ngal,
    rpr,
    bands,
    fibrinogen,
    pao2,
    paco2,
    hoursSincePostop: hoursSincePostop(patient),
  };

  if (!column) return { ...panelSourced, wbc: wbcPerMicrolitre(patient, undefined) };
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
    // Charted in K/µL, scored in cells/µL — see wbcPerMicrolitre.
    wbc: wbcPerMicrolitre(patient, labs),

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

    coldExtremities: column.neonatal?.coldExtremities,
    hypotonia: column.neonatal?.hypotonia,
    petechiae: column.neonatal?.petechiae,
    toxicNeutrophils: column.neonatal?.toxicNeutrophils,
    // The record keeps which sites (clinically useful — "umbilicus and both
    // hocks" matters for antimicrobial choice); the score only needs the count.
    infectiousSitesCount: column.neonatal?.infectiousSites?.length,

    // calcium/saa/ngal/rpr: see panelSourced above. Total calcium specifically
    // is never the round's ionised calcium (mmol/L) — feeding ionised mmol/L
    // into a total-calcium mg/dL threshold would score every patient abnormal.
    ...panelSourced,

    cpsAppearance: cpsPoints('cpsAppearance', column.pain?.cps?.cpsAppearance),
    cpsSweating: cpsPoints('cpsSweating', column.pain?.cps?.cpsSweating),
    cpsKickingAbdomen: cpsPoints('cpsKickingAbdomen', column.pain?.cps?.cpsKickingAbdomen),
    cpsPawing: cpsPoints('cpsPawing', column.pain?.cps?.cpsPawing),
    cpsPosture: cpsPoints('cpsPosture', column.pain?.cps?.cpsPosture),
    cpsHeadMovement: cpsPoints('cpsHeadMovement', column.pain?.cps?.cpsHeadMovement),
    cpsAppetite: cpsPoints('cpsAppetite', column.pain?.cps?.cpsAppetite),
    cpsInteractiveBehaviour: cpsPoints(
      'cpsInteractiveBehaviour',
      column.pain?.cps?.cpsInteractiveBehaviour,
    ),
    cpsResponseToPalpation: cpsPoints(
      'cpsResponseToPalpation',
      column.pain?.cps?.cpsResponseToPalpation,
    ),
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
  /**
   * Id into data/academicReferences.ts, when the source is a specific paper
   * on that list — lets the panel's citation link to its actual entry rather
   * than just naming it. Undefined for book sources (Freeman/Blikslager are
   * on the list too, but colicThresholds.ts's panels aren't ScorePanels) and
   * for ward-convention panels, which have nothing to link to.
   */
  sourceRefId?: string;
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
    sourceRefId: 'biondi-2026',
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
    sourceRefId: 'farrell-2021',
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
 * Composite Pain Scale (CPS) — Bussières et al. 2008's 13-parameter scale,
 * applied to visceral colic pain and correlated with survival in van Loon
 * et al. 2014. Total 0–39: 9 behavioural sub-items entered directly (see
 * `data/clinicalAssessments.ts`'s CPS_* definitions), plus 4 physiological
 * sub-items derived here from vitals/gut sounds already charted elsewhere —
 * never re-entered, per the same "don't ask twice" principle as the other
 * panels in this file.
 *
 * van Loon 2014 publishes no single validated cut-off (unlike CAS's 7) —
 * only that non-survivors' scores were significantly higher throughout the
 * post-operative period (median AUC ~10 vs ~4 in survivors, P < 0.001). The
 * severity banding below is therefore explicitly a ward convention
 * referencing that reported non-survivor range, not part of the source
 * study itself — same treatment as `giSeverityPanel`.
 *
 * The respiratory-rate top tier is printed in the source table as "18
 * breaths pm" with no comparator, immediately below "17–18" — every other
 * row in the table uses a `>` top tier, so this is read as ">18", not as an
 * exact-18 duplicate of the row above it.
 */
export function cpsPanel(entry: Partial<FlowsheetEntry>): ScorePanel {
  // ScorePanelCard's chip row treats a criterion as "charted" only when it
  // has both points and evidence — the CPS behavioural items only ever
  // produce a point value, so the point itself (out of 3) doubles as the
  // evidence shown, same as showing "110 bpm" for heart rate below.
  const behaviourEvidence = (points: number | undefined): string | undefined =>
    points === undefined ? undefined : `${points}/3`;

  const criteria: Criterion[] = [
    {
      id: 'cpsAppearance',
      label: 'Appearance',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsAppearance),
      points: entry.cpsAppearance,
    },
    {
      id: 'cpsSweating',
      label: 'Sweating',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsSweating),
      points: entry.cpsSweating,
    },
    {
      id: 'cpsKickingAbdomen',
      label: 'Kicking at abdomen',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsKickingAbdomen),
      points: entry.cpsKickingAbdomen,
    },
    {
      id: 'cpsPawing',
      label: 'Pawing on the floor',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsPawing),
      points: entry.cpsPawing,
    },
    {
      id: 'cpsPosture',
      label: 'Posture',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsPosture),
      points: entry.cpsPosture,
    },
    {
      id: 'cpsHeadMovement',
      label: 'Head movement',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsHeadMovement),
      points: entry.cpsHeadMovement,
    },
    {
      id: 'cpsAppetite',
      label: 'Appetite',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsAppetite),
      points: entry.cpsAppetite,
    },
    {
      id: 'cpsInteractiveBehaviour',
      label: 'Interactive behaviour',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsInteractiveBehaviour),
      points: entry.cpsInteractiveBehaviour,
    },
    {
      id: 'cpsResponseToPalpation',
      label: 'Response to palpation',
      maxPoints: 3,
      rule: 'Bussières et al. 2008, Table 2',
      evidence: behaviourEvidence(entry.cpsResponseToPalpation),
      points: entry.cpsResponseToPalpation,
    },
    {
      id: 'hr',
      label: 'Heart rate',
      maxPoints: 3,
      rule: '24–44 = 0 · 45–52 = 1 · 53–60 = 2 · > 60 = 3',
      evidence: fmt(entry.heartRate, 'bpm'),
      points:
        entry.heartRate === undefined
          ? undefined
          : entry.heartRate > 60
            ? 3
            : entry.heartRate >= 53
              ? 2
              : entry.heartRate >= 45
                ? 1
                : 0,
    },
    {
      id: 'rr',
      label: 'Respiratory rate',
      maxPoints: 3,
      rule: '8–13 = 0 · 14–16 = 1 · 17–18 = 2 · > 18 = 3',
      evidence: fmt(entry.respiratoryRate, 'brpm'),
      points:
        entry.respiratoryRate === undefined
          ? undefined
          : entry.respiratoryRate > 18
            ? 3
            : entry.respiratoryRate >= 17
              ? 2
              : entry.respiratoryRate >= 14
                ? 1
                : 0,
    },
    {
      id: 'gutSounds',
      label: 'Digestive sounds',
      maxPoints: 3,
      rule: 'Normal = 0 · decreased = 1 · absent = 2 · hypermotile = 3',
      evidence: entry.gutSounds,
      points:
        entry.gutSounds === undefined
          ? undefined
          : entry.gutSounds === 'NORMAL'
            ? 0
            : entry.gutSounds === 'HYPOMOTILE'
              ? 1
              : entry.gutSounds === 'ABSENT'
                ? 2
                : 3,
    },
    {
      id: 'temp',
      label: 'Rectal temperature',
      maxPoints: 3,
      rule: '36.9–38.5°C = 0 · 36.4–36.9 or 38.5–39.0 = 1 · 35.9–36.4 or 39.0–39.5 = 2 · beyond = 3',
      evidence: fmt(entry.temperature, '°C'),
      points:
        entry.temperature === undefined
          ? undefined
          : entry.temperature >= 36.9 && entry.temperature <= 38.5
            ? 0
            : (entry.temperature >= 36.4 && entry.temperature < 36.9) ||
                (entry.temperature > 38.5 && entry.temperature <= 39.0)
              ? 1
              : (entry.temperature >= 35.9 && entry.temperature < 36.4) ||
                  (entry.temperature > 39.0 && entry.temperature <= 39.5)
                ? 2
                : 3,
    },
  ];

  const score = boundsOf(criteria);
  // Ward-convention banding referencing the reported non-survivor range —
  // see the doc comment above. Not the source study's own cut-off.
  const wardCritical = score.min >= 17;
  const wardNormal = score.max <= 3;

  return {
    id: 'cps',
    title: 'Composite Pain Scale (CPS)',
    source: 'van Loon et al. 2014 (Vet J 200:109-115), scale by Bussières et al. 2008',
    sourceRefId: 'van-loon-2014',
    score,
    criteria,
    severity: wardCritical ? 'critical' : wardNormal ? 'normal' : 'warning',
    interpretation: `CPS ${score.min === score.max ? score.min : `${score.min}–${score.max}`}/39. No single validated cut-off is published; non-survivors' scores were significantly higher throughout the post-operative period in the original series (median area-under-curve ≈10 vs ≈4 in survivors, P < 0.001).`,
    note: score.isExact
      ? undefined
      : 'Range reflects sub-items that have not been charted this round.',
  };
}

/**
 * Foal survival, Brewer & Koterba's seven-item screen as implemented here.
 * Each item is one point for the favourable finding; the published score is
 * 0–7, so a value is only meaningful once most items are charted.
 */
/**
 * `${value} (legacy record)`, marking a criterion that fell back to a
 * pre-restructure Patient field rather than the round. See patientAge in
 * patientIdentity.ts for the same pattern applied to age.
 */
const legacyEvidence = (text: string | undefined, usedFallback: boolean): string | undefined =>
  text === undefined ? undefined : usedFallback ? `${text} (legacy record)` : text;

export function foalSurvivalPanel(
  patient: Patient,
  entry: Partial<FlowsheetEntry>,
): ScorePanel {
  // Gestational age, cold extremities and infectious sites moved to
  // patient.gestationalAgeDays and the round's Neonatal Exam section
  // (2026-08-03). Records charted before that fall back to the legacy
  // fssPrematurityDays/fssColdExtremities/fssInfectiousSite fields rather
  // than losing their score.
  const gestationDays = patient.gestationalAgeDays ?? patient.fssPrematurityDays;
  const gestationFromLegacy =
    patient.gestationalAgeDays === undefined && patient.fssPrematurityDays !== undefined;

  const coldExtremities = entry.coldExtremities ?? patient.fssColdExtremities;
  const coldExtremitiesFromLegacy =
    entry.coldExtremities === undefined && patient.fssColdExtremities !== undefined;

  const legacySites = patient.fssInfectiousSite
    ? patient.fssInfectiousSite.split(';').map((v) => v.trim()).filter(Boolean).length
    : undefined;
  const infectiousSitesCount = entry.infectiousSitesCount ?? legacySites;
  const infectiousSitesFromLegacy = entry.infectiousSitesCount === undefined && legacySites !== undefined;

  const criteria: Criterion[] = [
    {
      id: 'gestation',
      label: 'Carried to term',
      maxPoints: 1,
      rule: '≥ 320 days gestation',
      evidence: legacyEvidence(fmt(gestationDays, 'days'), gestationFromLegacy),
      points: gestationDays === undefined ? undefined : gestationDays >= 320 ? 1 : 0,
    },
    {
      id: 'extremities',
      label: 'Extremities warm',
      maxPoints: 1,
      rule: 'No cold extremities',
      evidence: legacyEvidence(
        coldExtremities === undefined ? undefined : coldExtremities ? 'cold' : 'warm',
        coldExtremitiesFromLegacy,
      ),
      points: coldExtremities === undefined ? undefined : coldExtremities ? 0 : 1,
    },
    {
      id: 'sites',
      label: 'Infectious sites',
      maxPoints: 1,
      rule: 'Fewer than 2 sites',
      evidence: legacyEvidence(
        infectiousSitesCount === undefined
          ? undefined
          : `${infectiousSitesCount} site${infectiousSitesCount === 1 ? '' : 's'}`,
        infectiousSitesFromLegacy,
      ),
      points: infectiousSitesCount === undefined ? undefined : infectiousSitesCount < 2 ? 1 : 0,
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
  const anyLegacy = gestationFromLegacy || coldExtremitiesFromLegacy || infectiousSitesFromLegacy;

  return {
    id: 'foal-survival',
    title: 'Foal survival screen',
    source: 'Brewer & Koterba items, 0–6 as implemented',
    sourceRefId: 'brewer-1988',
    score,
    criteria,
    severity: score.max <= 2 ? 'critical' : score.min >= 5 ? 'normal' : 'watch',
    interpretation:
      charted === 0
        ? undefined
        : `${score.min}–${score.max} of 6 favourable items, from ${charted} charted parameter${charted === 1 ? '' : 's'}.`,
    note: `Six of the seven published items are charted here; no survival percentage is derived, because this app does not implement the published regression.${
      anyLegacy
        ? ' One or more items marked "(legacy record)" came from this patient’s pre-restructure fields rather than a charted round.'
        : ''
    }`,
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
    ? [neonatalSirsPanel(entry), foalSurvivalPanel(patient, entry), neonatalSepsisPanel(patient, entry)]
    : [sirsPanel(entry), giSeverityPanel(entry), casPanel(entry), cpsPanel(entry)];
}

/** True when at least one input for this panel was actually charted. */
export const panelHasData = (p: ScorePanel): boolean =>
  p.criteria.some((c) => c.points !== undefined);
