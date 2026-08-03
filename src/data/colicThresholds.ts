/**
 * Published thresholds for the equine acute abdomen, in one place.
 *
 * These were previously scattered across the trigger engine and the scoring
 * panels as bare numbers, which made it impossible to tell a committed
 * published cut-off from a ward convention someone had typed in. Every entry
 * here carries its provenance, and the UI shows it.
 *
 * Values are the source authors' committed thresholds — decision aids, not
 * absolutes. Anything this app invents is labelled `Ward convention`.
 */

export type ThresholdProvenance = 'published' | 'ward-convention';

export interface Threshold {
  value: number;
  units: string;
  /** Cited source, or the honest admission that it is ours. */
  source: string;
  provenance: ThresholdProvenance;
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Lactate                                                              */
/* ------------------------------------------------------------------ */

/**
 * Plasma lactate is reported as a survival *band*, not a single cut-off:
 * every horse below 3.6 mmol/L survived and every horse above 7.0 died, with
 * a genuinely uncertain middle. Collapsing that to one trigger line at
 * 4 mmol/L — as this app did — throws away the most useful part of the
 * finding, which is that between 3.6 and 7.0 the number does not decide.
 */
export type LactateBand = 'SURVIVED' | 'UNCERTAIN' | 'DIED' | 'NORMAL';

export const PLASMA_LACTATE_BANDS = {
  /** Upper limit of the resting reference interval. */
  referenceMax: 1.5,
  /** No horse above this value in the reported series survived. */
  allDiedAbove: 7.0,
  /** Every horse below this value in the reported series survived. */
  allLivedBelow: 3.6,
  source: 'Colic Surgery in the Horse (Freeman) — reported survival series',
} as const;

export function plasmaLactateBand(value: number | undefined): LactateBand | undefined {
  if (!Number.isFinite(value)) return undefined;
  const v = value as number;
  if (v <= PLASMA_LACTATE_BANDS.referenceMax) return 'NORMAL';
  if (v < PLASMA_LACTATE_BANDS.allLivedBelow) return 'SURVIVED';
  if (v > PLASMA_LACTATE_BANDS.allDiedAbove) return 'DIED';
  return 'UNCERTAIN';
}

export const LACTATE_BAND_TEXT: Record<
  LactateBand,
  { label: string; reading: string; severity: 'normal' | 'watch' | 'warning' | 'critical' }
> = {
  NORMAL: {
    label: 'Within reference',
    reading: 'At or below the resting reference maximum of 1.5 mmol/L.',
    severity: 'normal',
  },
  SURVIVED: {
    label: 'Below the survival threshold',
    reading:
      'Below 3.6 mmol/L — every horse under this value in the reported series survived. Raised, so worth repeating, but not a prognostic marker against surgery.',
    severity: 'watch',
  },
  UNCERTAIN: {
    label: 'Indeterminate band',
    reading:
      'Between 3.6 and 7.0 mmol/L, where the reported series contains both survivors and non-survivors. This number does not decide the case — the trend across serial samples does.',
    severity: 'warning',
  },
  DIED: {
    label: 'Above the reported survival ceiling',
    reading:
      'Above 7.0 mmol/L — no horse above this value survived in the reported series. Grave, and a prompt for the prognosis and cost conversation.',
    severity: 'critical',
  },
};

/**
 * Peritoneal fluid lactate. Two separate findings live here: the absolute
 * ceiling, and the comparison against plasma, which is the more specific of
 * the two — peritoneal exceeding plasma points at strangulated small
 * intestine even when both are individually unremarkable.
 */
export const PERITONEAL_LACTATE = {
  /** No survivor above this value in the reported series. */
  noSurvivorAbove: 9.4,
  source: 'Colic Surgery in the Horse (Freeman); The Equine Acute Abdomen (Blikslager)',
} as const;

export interface PeritonealComparison {
  peritoneal: number;
  plasma: number;
  /** Peritoneal minus plasma. Positive is the finding of interest. */
  gradient: number;
  exceedsPlasma: boolean;
  aboveSurvivalCeiling: boolean;
  reading: string;
  severity: 'normal' | 'watch' | 'warning' | 'critical';
}

export function comparePeritonealLactate(
  peritoneal: number | undefined,
  plasma: number | undefined,
): PeritonealComparison | undefined {
  if (!Number.isFinite(peritoneal) || !Number.isFinite(plasma)) return undefined;
  const pf = peritoneal as number;
  const pl = plasma as number;
  const gradient = Math.round((pf - pl) * 100) / 100;
  const exceedsPlasma = pf > pl;
  const aboveSurvivalCeiling = pf > PERITONEAL_LACTATE.noSurvivorAbove;

  let reading: string;
  let severity: PeritonealComparison['severity'];

  if (aboveSurvivalCeiling) {
    severity = 'critical';
    reading = `Peritoneal lactate ${pf} mmol/L is above ${PERITONEAL_LACTATE.noSurvivorAbove} mmol/L, the value above which no survivor was reported.`;
  } else if (exceedsPlasma) {
    severity = 'critical';
    reading = `Peritoneal lactate exceeds plasma by ${gradient} mmol/L. A peritoneal-over-plasma gradient is reported as an indicator of strangulated small intestine.`;
  } else {
    severity = 'normal';
    reading = `Peritoneal lactate does not exceed plasma (gradient ${gradient} mmol/L), which does not support strangulated small intestine on this sample.`;
  }

  return { peritoneal: pf, plasma: pl, gradient, exceedsPlasma, aboveSurvivalCeiling, reading, severity };
}

/* ------------------------------------------------------------------ */
/* Haemoconcentration and PCV/TP splitting                              */
/* ------------------------------------------------------------------ */

export const PCV_TP = {
  /** Packed cell volume above which the case is reported as grave. */
  graveAbove: 50,
  /** Total protein below which colloid support is discussed. */
  colloidBelowTp: 4.0,
  /** Albumin below which colloid support is discussed. */
  colloidBelowAlbumin: 2.0,
  source: 'Colic Surgery in the Horse (Freeman); The Equine Acute Abdomen (Blikslager)',
} as const;

export interface PcvTpReading {
  pcv: number;
  tp: number;
  /** True when PCV is rising while TP falls — protein loss into the gut lumen. */
  splitting: boolean;
  pcvGrave: boolean;
  reading: string;
  severity: 'normal' | 'watch' | 'warning' | 'critical';
}

/**
 * PCV/TP "splitting".
 *
 * In simple dehydration both rise together. When packed cell volume climbs
 * while total protein falls, protein is being lost into the bowel lumen or
 * peritoneal cavity, and the pair is reported as grave. Detecting it needs two
 * samples, so a single round cannot show it — the function takes the previous
 * values and returns undefined rather than guessing from one.
 */
export function readPcvTp(
  pcv: number | undefined,
  tp: number | undefined,
  previousPcv?: number,
  previousTp?: number,
): PcvTpReading | undefined {
  if (!Number.isFinite(pcv) || !Number.isFinite(tp)) return undefined;
  const p = pcv as number;
  const t = tp as number;
  const pcvGrave = p > PCV_TP.graveAbove;

  const canCompare = Number.isFinite(previousPcv) && Number.isFinite(previousTp);
  const splitting =
    canCompare && p > (previousPcv as number) && t < (previousTp as number);

  let reading: string;
  let severity: PcvTpReading['severity'];

  if (splitting && pcvGrave) {
    severity = 'critical';
    reading = `PCV has risen to ${p}% while total protein fell to ${t} g/dL. Splitting with a PCV above ${PCV_TP.graveAbove}% is reported as grave — protein is being lost, not simply concentrated.`;
  } else if (splitting) {
    severity = 'critical';
    reading = `PCV rose from ${previousPcv}% to ${p}% while total protein fell from ${previousTp} to ${t} g/dL. In simple dehydration both rise together; splitting indicates protein loss into the lumen or peritoneal cavity.`;
  } else if (pcvGrave) {
    severity = 'warning';
    reading = `PCV ${p}% is above the ${PCV_TP.graveAbove}% threshold reported as grave.`;
  } else if (canCompare && p > (previousPcv as number) && t > (previousTp as number)) {
    severity = 'watch';
    reading = `PCV and total protein are both rising (${previousPcv}→${p}%, ${previousTp}→${t} g/dL), the pattern of simple dehydration rather than protein loss.`;
  } else {
    severity = 'normal';
    reading = canCompare
      ? `PCV ${p}%, total protein ${t} g/dL — no splitting pattern against the previous round.`
      : `PCV ${p}%, total protein ${t} g/dL. Splitting needs a previous round to compare against.`;
  }

  return { pcv: p, tp: t, splitting, pcvGrave, reading, severity };
}

/* ------------------------------------------------------------------ */
/* Nasogastric reflux                                                   */
/* ------------------------------------------------------------------ */

export const REFLUX = {
  /** Volume above which reflux is reported as significant. */
  significantAbove: 2,
  /** Lower bound of the volume band that suggests proximal enteritis. */
  dpjRangeLow: 10,
  dpjRangeHigh: 20,
  source: 'Colic Surgery in the Horse (Freeman); The Equine Acute Abdomen (Blikslager)',
} as const;

export interface RefluxReading {
  litres: number;
  significant: boolean;
  suggestsDpj: boolean;
  reading: string;
  severity: 'normal' | 'watch' | 'warning' | 'critical';
}

/**
 * Reflux volume changes the *interpretation*, not just the alarm level.
 *
 * Two litres is significant and supports obstruction. Ten to twenty litres is
 * the volume band reported for proximal enteritis (DPJ) — a medical diagnosis
 * where a celiotomy is the wrong answer. The app previously raised a single
 * critical trigger at 2 L and said nothing more, so a 15 L reflux read as
 * "more surgical" when it may well be less.
 */
export function readReflux(litres: number | undefined): RefluxReading | undefined {
  if (!Number.isFinite(litres)) return undefined;
  const v = litres as number;
  const significant = v >= REFLUX.significantAbove;
  const suggestsDpj = v >= REFLUX.dpjRangeLow;

  if (suggestsDpj) {
    return {
      litres: v,
      significant,
      suggestsDpj: true,
      severity: 'critical',
      reading: `${v} L is in or above the ${REFLUX.dpjRangeLow}–${REFLUX.dpjRangeHigh} L band reported for proximal enteritis. Distinguish enteritis from strangulating obstruction before committing to surgery — the volume alone does not separate them, and a celiotomy for enteritis is the wrong operation.`,
    };
  }
  if (significant) {
    return {
      litres: v,
      significant,
      suggestsDpj: false,
      severity: 'warning',
      reading: `${v} L net reflux is above the ${REFLUX.significantAbove} L significance threshold and supports small intestinal obstruction.`,
    };
  }
  return {
    litres: v,
    significant: false,
    suggestsDpj: false,
    severity: 'normal',
    reading: `${v} L net reflux is below the ${REFLUX.significantAbove} L significance threshold.`,
  };
}

/* ------------------------------------------------------------------ */
/* Heart rate trajectory                                                */
/* ------------------------------------------------------------------ */

export const HEART_RATE = {
  /** Reported mean in large colon volvulus survivors. */
  lcvSurvivorMean: 48,
  /** Reported mean in large colon volvulus non-survivors. */
  lcvNonSurvivorMean: 81,
  source: 'Colic Surgery in the Horse (Freeman) — large colon volvulus series',
} as const;

export type Trajectory = 'RISING' | 'FALLING' | 'STEADY';

export interface HeartRateReading {
  current: number;
  previous?: number;
  delta?: number;
  trajectory?: Trajectory;
  reading: string;
  severity: 'normal' | 'watch' | 'warning' | 'critical';
}

/**
 * Serial heart rate, read on the derivative.
 *
 * A single heart rate is a weaker signal than its direction: 60 and falling is
 * a better position than 52 and climbing. The app charted the numbers and
 * plotted them, but nothing computed the direction, so the most useful part of
 * the most useful monitor was left to the eye.
 */
export function readHeartRate(
  current: number | undefined,
  previous: number | undefined,
): HeartRateReading | undefined {
  if (!Number.isFinite(current)) return undefined;
  const hr = current as number;

  if (!Number.isFinite(previous)) {
    return {
      current: hr,
      reading: `${hr} bpm. A single value; the direction across serial rounds carries more weight than any one reading.`,
      severity: hr >= HEART_RATE.lcvNonSurvivorMean ? 'critical' : hr > 60 ? 'warning' : 'normal',
    };
  }

  const prev = previous as number;
  const delta = hr - prev;
  // Two beats absorbs measurement noise without hiding a real trend.
  const trajectory: Trajectory = delta > 2 ? 'RISING' : delta < -2 ? 'FALLING' : 'STEADY';

  const near = (v: number, target: number) => Math.abs(v - target) <= 8;
  let severity: HeartRateReading['severity'];
  let reading: string;

  if (trajectory === 'RISING') {
    severity = hr >= HEART_RATE.lcvNonSurvivorMean ? 'critical' : 'warning';
    reading = `${prev} → ${hr} bpm, rising by ${delta}. A climbing rate is the adverse direction whatever the absolute value${
      near(hr, HEART_RATE.lcvNonSurvivorMean)
        ? `, and ${hr} bpm sits near the ${HEART_RATE.lcvNonSurvivorMean} bpm mean reported in large colon volvulus non-survivors`
        : ''
    }.`;
  } else if (trajectory === 'FALLING') {
    severity = hr >= HEART_RATE.lcvNonSurvivorMean ? 'warning' : 'normal';
    reading = `${prev} → ${hr} bpm, falling by ${Math.abs(delta)}. A falling rate is the favourable direction${
      hr > 60 ? ', though the absolute value is still raised' : ''
    }.`;
  } else {
    severity = hr >= HEART_RATE.lcvNonSurvivorMean ? 'critical' : hr > 60 ? 'warning' : 'normal';
    reading = `${prev} → ${hr} bpm, essentially unchanged. In a horse under treatment, a rate that will not fall is itself a finding.`;
  }

  return { current: hr, previous: prev, delta, trajectory, reading, severity };
}

/* ------------------------------------------------------------------ */
/* Endotoxemia — a cage-side read                                       */
/* ------------------------------------------------------------------ */

export const ENDOTOXEMIA = {
  /** Total white cell count below which leukopenia is called, K/µL. */
  leukopeniaBelow: 5.0,
  crtProlongedAbove: 2,
  source: 'The Equine Acute Abdomen (Blikslager); Colic Surgery in the Horse (Freeman)',
} as const;

/**
 * Endotoxemia is a clinical diagnosis. The laboratory assay is unreliable, so
 * what matters is the set of cage-side signs — and one of them reads
 * backwards: a falling white cell count is neutrophil extravasation, an
 * adverse sign, not the patient improving. That is worth stating explicitly
 * next to a value the lab panel would otherwise just flag "L".
 */
export interface EndotoxaemiaSign {
  id: string;
  label: string;
  present: boolean | undefined;
  evidence?: string;
  note?: string;
}

export const TOXIC_MEMBRANE_VALUES = [
  'Brick-red / toxic',
  'Muddy / dry',
  'Cyanotic / blue',
  'Injected / hyperaemic',
];

/* ------------------------------------------------------------------ */
/* The bland-tap caveat                                                 */
/* ------------------------------------------------------------------ */

/**
 * A normal abdominocentesis never excludes strangulation: in large colon
 * volvulus the tap is reported normal in roughly half to three-quarters of
 * cases. The app displayed a peritoneal-fluid trigger that fired on an
 * abnormal tap and stayed silent on a normal one, which reads as reassurance.
 */
export const BLAND_TAP_CAVEAT =
  'A normal peritoneal tap does not exclude strangulation — it is reported normal in roughly 50–73% of large colon volvulus cases. Read it with the heart rate trend and lactate, and send cytology.';

export const TIME_IS_TISSUE_CAVEAT =
  'Beyond about four hours of strangulation, resection is the expectation rather than the exception. Decision delay is measured in dead intestine.';

/* ------------------------------------------------------------------ */
/* Fluid balance — insensible loss                                      */
/* ------------------------------------------------------------------ */

/**
 * Insensible loss (respiratory + cutaneous + faecal water) cannot be measured
 * at the bedside — it only ever exists as an estimate. This range is a ward
 * convention supplied by the attending clinician, not a published figure, and
 * not yet wired to any panel. Not used by any function today; recorded here
 * so it's captured for the fluid-balance panel once that is built. When it
 * is, the balance must render as a range with this component labelled, per
 * rule 1 — never as a single confident number built on an estimate.
 */
export const INSENSIBLE_LOSS = {
  minMlPerKgPerDay: 10.4,
  maxMlPerKgPerDay: 33.6,
  source: 'Ward convention — supplied by the attending clinician, not a published figure.',
  provenance: 'ward-convention' as const,
} as const;
