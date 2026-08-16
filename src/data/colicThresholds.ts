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

/**
 * Peritoneal fluid cytology: total protein, total nucleated cell count and
 * % degenerate neutrophils, the three quantitative findings a septic
 * peritonitis read on tap depends on (gross appearance and odor are
 * structured picks — see `PERITONEAL_FLUID`/`PERITONEAL_ODOR` in
 * `data/clinicalAssessments.ts` — and intracellular bacteria is a boolean,
 * not a threshold). Any of the three inputs may be missing; the reading only
 * uses what was charted.
 */
export const PERITONEAL_CYTOLOGY = {
  proteinNormalBelow: 2.5, // g/dL
  proteinSuspectAbove: 3.0, // g/dL — suspect peritonitis
  tccNormalBelow: 10000, // /µL
  tccSepticAbove: 50000, // /µL — septic peritonitis
  degenerateNeutrophilsNormalBelow: 30, // %
  degenerateNeutrophilsSepticAbove: 50, // % — septic peritonitis confirmed
  source: 'Colic Surgery in the Horse (Freeman); The Equine Acute Abdomen (Blikslager)',
} as const;

export interface PeritonealCytologyReading {
  protein?: number;
  tcc?: number;
  degenerateNeutrophilsPct?: number;
  reading: string;
  severity: 'normal' | 'watch' | 'warning' | 'critical';
}

export function readPeritonealCytology(
  protein: number | undefined,
  tcc: number | undefined,
  degenerateNeutrophilsPct: number | undefined,
): PeritonealCytologyReading | undefined {
  const has = (v: number | undefined): v is number => Number.isFinite(v);
  if (!has(protein) && !has(tcc) && !has(degenerateNeutrophilsPct)) return undefined;

  const septic =
    (has(tcc) && tcc > PERITONEAL_CYTOLOGY.tccSepticAbove) ||
    (has(degenerateNeutrophilsPct) &&
      degenerateNeutrophilsPct > PERITONEAL_CYTOLOGY.degenerateNeutrophilsSepticAbove);
  const suspect = has(protein) && protein > PERITONEAL_CYTOLOGY.proteinSuspectAbove;

  const parts: string[] = [];
  if (has(protein)) parts.push(`total protein ${protein} g/dL`);
  if (has(tcc)) parts.push(`TCC ${tcc}/µL`);
  if (has(degenerateNeutrophilsPct)) parts.push(`${degenerateNeutrophilsPct}% degenerate neutrophils`);
  const charted = parts.join(', ');

  let severity: PeritonealCytologyReading['severity'];
  let reading: string;
  if (septic) {
    severity = 'critical';
    reading = `${charted} — TCC above ${PERITONEAL_CYTOLOGY.tccSepticAbove}/µL or degenerate neutrophils above ${PERITONEAL_CYTOLOGY.degenerateNeutrophilsSepticAbove}% is reported as confirming septic peritonitis.`;
  } else if (suspect) {
    severity = 'warning';
    reading = `${charted} — total protein above ${PERITONEAL_CYTOLOGY.proteinSuspectAbove} g/dL raises suspicion of peritonitis.`;
  } else {
    severity = 'normal';
    reading = `${charted} — within the reported normal range.`;
  }

  return { protein, tcc, degenerateNeutrophilsPct, reading, severity };
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

/**
 * Lactate, read on the derivative — same principle as heart rate above, same
 * dead-band reasoning (small assay noise should not flip the direction).
 */
export function readLactateTrend(
  current: number | undefined,
  previous: number | undefined,
): HeartRateReading | undefined {
  if (!Number.isFinite(current)) return undefined;
  const c = current as number;
  if (!Number.isFinite(previous)) {
    return {
      current: c,
      reading: `${c} mmol/L. A single value; the direction across serial rounds carries more weight than any one reading.`,
      severity: c > PLASMA_LACTATE_BANDS.allDiedAbove ? 'critical' : c > PLASMA_LACTATE_BANDS.allLivedBelow ? 'warning' : 'normal',
    };
  }
  const p = previous as number;
  const delta = c - p;
  // 0.2 mmol/L absorbs typical point-of-care assay noise without hiding a real trend.
  const trajectory: Trajectory = delta > 0.2 ? 'RISING' : delta < -0.2 ? 'FALLING' : 'STEADY';

  let severity: HeartRateReading['severity'];
  let reading: string;
  if (trajectory === 'RISING') {
    severity = c > PLASMA_LACTATE_BANDS.allDiedAbove ? 'critical' : 'warning';
    reading = `${p} → ${c} mmol/L, rising by ${delta.toFixed(1)}. A climbing lactate under treatment is the adverse direction whatever the absolute value.`;
  } else if (trajectory === 'FALLING') {
    severity = c > PLASMA_LACTATE_BANDS.allDiedAbove ? 'warning' : 'normal';
    reading = `${p} → ${c} mmol/L, falling by ${Math.abs(delta).toFixed(1)}. A falling lactate is the favourable direction.`;
  } else {
    severity = c > PLASMA_LACTATE_BANDS.allDiedAbove ? 'critical' : c > PLASMA_LACTATE_BANDS.allLivedBelow ? 'warning' : 'normal';
    reading = `${p} → ${c} mmol/L, essentially unchanged.`;
  }
  return { current: c, previous: p, delta, trajectory, reading, severity };
}

/* ------------------------------------------------------------------ */
/* Pyrexia — three published tiers, not one line                        */
/* ------------------------------------------------------------------ */

/**
 * Three fever tiers by reported clinical significance, not one arbitrary
 * cut-off. The previous single 38.5°C line collapsed a published gradient:
 * mild pyrexia is associated with postoperative colic and relaparotomy;
 * >39.2°C carries a reported 5-fold odds of postoperative infection;
 * >39.4°C is additionally associated with diarrhoea and laminitis.
 */
export type PyrexiaTier = 'MILD' | 'SIGNIFICANT' | 'HIGH';

export const PYREXIA = {
  mildAbove: 38.6,
  significantAbove: 39.2,
  highAbove: 39.4,
  /**
   * NSAID adjustment: −0.3°C off every tier when an NSAID has been given
   * recently. This generalises a single adjusted pair Bauck 2023 states
   * (>39.2°C without NSAIDs = >38.9°C with NSAIDs, a 0.3°C shift) across all
   * three of Loomes 2025's tiers — that generalisation is this app's own
   * synthesis of the two sources, not a number either paper states directly
   * for all three tiers.
   */
  nsaidAdjustmentC: 0.3,
  source: 'Loomes et al. 2025 (Equine Vet J 57:827-861), Table 4 — weighted prevalence and odds ratios by fever tier; NSAID adjustment generalised from Bauck 2023 (Vet Clin Equine 39:263-286)',
  provenance: 'published' as const,
} as const;

export interface PyrexiaReading {
  temperatureC: number;
  tier: PyrexiaTier;
  nsaidAdjusted: boolean;
  reading: string;
  severity: 'watch' | 'warning' | 'critical';
}

/**
 * Reads a °C temperature against the three published tiers, shifted down
 * `nsaidAdjustmentC` if an NSAID was charted recently (masks fever). Returns
 * undefined when the temperature sits below even the mild tier — no trigger
 * fires from a normal reading.
 */
export function readPyrexia(
  temperatureC: number | undefined,
  nsaidGivenRecently: boolean,
): PyrexiaReading | undefined {
  if (!Number.isFinite(temperatureC)) return undefined;
  const t = temperatureC as number;
  const adj = nsaidGivenRecently ? PYREXIA.nsaidAdjustmentC : 0;
  const mild = PYREXIA.mildAbove - adj;
  const significant = PYREXIA.significantAbove - adj;
  const high = PYREXIA.highAbove - adj;

  let tier: PyrexiaTier;
  let severity: PyrexiaReading['severity'];
  let detail: string;
  if (t > high) {
    tier = 'HIGH';
    severity = 'critical';
    detail = 'associated in the reported series with diarrhoea, postoperative colic, relaparotomy and laminitis';
  } else if (t > significant) {
    tier = 'SIGNIFICANT';
    severity = 'warning';
    detail = 'odds ratio 5.06 for postoperative infection (95% CI 2.10–12.20) — cultures indicated';
  } else if (t > mild) {
    tier = 'MILD';
    severity = 'watch';
    detail = 'associated in the reported series with postoperative colic and relaparotomy';
  } else {
    return undefined;
  }

  const reading = nsaidGivenRecently
    ? `${t} °C — ${detail}. Thresholds lowered ${PYREXIA.nsaidAdjustmentC}°C: an NSAID was charted within the last 4 hours and can mask fever.`
    : `${t} °C — ${detail}.`;

  return { temperatureC: t, tier, nsaidAdjusted: nsaidGivenRecently, reading, severity };
}

/**
 * Temperature, read on the derivative, same as heart rate and lactate above.
 * Uses the same 0.3°C NSAID-aware tiers as readPyrexia so a climbing
 * temperature is judged against the same effective thresholds a snapshot
 * reading would be.
 */
export function readTemperatureTrend(
  current: number | undefined,
  previous: number | undefined,
  nsaidGivenRecently: boolean,
): HeartRateReading | undefined {
  if (!Number.isFinite(current)) return undefined;
  const c = current as number;
  const pyrexia = readPyrexia(c, nsaidGivenRecently);
  if (!Number.isFinite(previous)) {
    return {
      current: c,
      reading: `${c} °C. A single value; the direction across serial rounds carries more weight than any one reading.`,
      severity: pyrexia?.severity ?? 'normal',
    };
  }
  const p = previous as number;
  const delta = c - p;
  // 0.2°C absorbs typical thermometer noise without hiding a real trend.
  const trajectory: Trajectory = delta > 0.2 ? 'RISING' : delta < -0.2 ? 'FALLING' : 'STEADY';

  let severity: HeartRateReading['severity'];
  let reading: string;
  if (trajectory === 'RISING') {
    severity = pyrexia?.severity ?? 'normal';
    reading = `${p} → ${c} °C, rising by ${delta.toFixed(1)}. A climbing temperature under treatment is the adverse direction whatever the absolute value.`;
  } else if (trajectory === 'FALLING') {
    severity = pyrexia ? 'watch' : 'normal';
    reading = `${p} → ${c} °C, falling by ${Math.abs(delta).toFixed(1)}. A falling temperature is the favourable direction${pyrexia ? ', though the absolute value is still raised' : ''}.`;
  } else {
    severity = pyrexia?.severity ?? 'normal';
    reading = `${p} → ${c} °C, essentially unchanged.${pyrexia ? ' A temperature that will not fall is itself a finding.' : ''}`;
  }
  return { current: c, previous: p, delta, trajectory, reading, severity };
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

/* ------------------------------------------------------------------ */
/* Serum amyloid A, post-coeliotomy window                              */
/* ------------------------------------------------------------------ */

/**
 * SAA rises as an expected response to coeliotomy itself, not only to
 * complications. `biomarkerEvaluator.ts` used to flag anything over 50 µg/mL
 * as "active inflammation" with no source at all — this replaces that with
 * Bowlby et al. 2021's actual finding, applied only within the window it
 * describes.
 */
export const SAA_POSTOP = {
  /** Upper bound of the normal range in the first 48h after coeliotomy. */
  normalCeilingWithin48h: 568, // µg/mL
  windowHours: 48,
  source:
    'Bowlby et al. 2021, cited in Bauck 2023 — serum amyloid A up to 568 µg/mL is reported in healthy horses in the first 48h after coeliotomy and intestinal decompression, without GI disease.',
} as const;
