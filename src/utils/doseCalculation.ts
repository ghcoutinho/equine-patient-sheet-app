/**
 * Weight-based dose and volume arithmetic for the formulary.
 *
 * The formulary carries 22 distinct dose units and only one concentration
 * unit (mg/mL), so plenty of entries cannot be converted to a volume at all —
 * an IU/kg dose against a mg/mL concentration is not a computation, it is a
 * category error. Every one of those cases returns an explicit reason instead
 * of a number. Nothing here guesses.
 */

export type RatePer = 'hr' | 'min';

export interface DoseUnitSpec {
  /** 'per-kg' = mg/kg · 'per-kg-rate' = mg/kg/hr · 'total' = mg (total) · 'opaque' = capsules, drops, strips */
  kind: 'per-kg' | 'per-kg-rate' | 'total' | 'opaque';
  /** Mass (or activity, or volume) unit of the numerator: mg, mcg, g, IU, mU, mL. */
  massUnit?: string;
  ratePer?: RatePer;
}

export function parseDoseUnit(doseUnit: string): DoseUnitSpec {
  const u = (doseUnit || '').trim();

  // "mg (total)", "IU (total)", "mcg (total)", "mL (total)"
  const total = u.match(/^([A-Za-z]+)\s*\(total\)$/i);
  if (total) return { kind: 'total', massUnit: total[1] };

  // "mg/kg/hr", "mU/kg/min", "mcg/kg/min", "IU/kg/hr"
  const rate = u.match(/^([A-Za-z]+)\/kg\/(hr|min)$/i);
  if (rate) {
    return {
      kind: 'per-kg-rate',
      massUnit: rate[1],
      ratePer: rate[2].toLowerCase() as RatePer,
    };
  }

  // "mg/kg", "mcg/kg", "IU/kg", "mL/kg", "g/kg"
  const perKg = u.match(/^([A-Za-z]+)\/kg$/i);
  if (perKg) return { kind: 'per-kg', massUnit: perKg[1] };

  // capsules, drops, strips, mg/m2, bare "kg"/"g"/"IU"/"mcg", "-"
  return { kind: 'opaque' };
}

/** Factor converting `unit` into milligrams. null when it is not a mass at all. */
function toMilligrams(unit: string | undefined): number | null {
  switch ((unit || '').toLowerCase()) {
    case 'mg':
      return 1;
    case 'mcg':
      return 0.001;
    case 'g':
      return 1000;
    default:
      return null; // IU, mU, mL, capsules — not convertible against mg/mL
  }
}

export type VolumeBlockedReason =
  | 'no-concentration'
  | 'unit-mismatch'
  | 'not-weight-based';

export interface DoseResult {
  /** Total amount to give, e.g. 572 mg. For rates this is per hour or per minute. */
  amount?: number;
  amountUnit?: string;
  /** Volume to draw up, in mL (or mL/hr, mL/min for a rate). */
  volume?: number;
  volumeUnit?: string;
  /** Why no volume could be produced. Present only when `volume` is undefined. */
  volumeBlocked?: VolumeBlockedReason;
  ratePer?: RatePer;
  /** Human-readable single line, for charting into the flowsheet. */
  summary: string;
}

export interface DoseInput {
  weightKg: number;
  dose: number;
  doseUnit: string;
  /** mg/mL. 0 or undefined means the formulary has no concentration on file. */
  concentration?: number;
}

const round = (n: number): number => {
  if (!Number.isFinite(n)) return 0;
  if (n >= 100) return Math.round(n * 10) / 10;
  if (n >= 1) return Math.round(n * 100) / 100;
  return Math.round(n * 1000) / 1000;
};

export function computeDose(input: DoseInput): DoseResult {
  const { weightKg, dose, concentration } = input;
  const spec = parseDoseUnit(input.doseUnit);

  if (spec.kind === 'opaque') {
    return {
      summary: `${dose} ${input.doseUnit} — not weight-based, give as written`,
      volumeBlocked: 'not-weight-based',
    };
  }

  const rateSuffix = spec.ratePer ? `/${spec.ratePer}` : '';
  const amount =
    spec.kind === 'total' ? dose : round(weightKg * dose);
  const amountUnit = `${spec.massUnit}${rateSuffix}`;

  // A dose already expressed in mL is its own volume; no concentration needed.
  if ((spec.massUnit || '').toLowerCase() === 'ml') {
    return {
      amount,
      amountUnit,
      volume: amount,
      volumeUnit: `mL${rateSuffix}`,
      ratePer: spec.ratePer,
      summary: `${amount} mL${rateSuffix}`,
    };
  }

  const base: DoseResult = {
    amount,
    amountUnit,
    ratePer: spec.ratePer,
    summary: `${amount} ${amountUnit}`,
  };

  if (!concentration || concentration <= 0) {
    return { ...base, volumeBlocked: 'no-concentration' };
  }

  const mgFactor = toMilligrams(spec.massUnit);
  if (mgFactor === null) {
    // e.g. an IU/kg dose against a mg/mL concentration.
    return { ...base, volumeBlocked: 'unit-mismatch' };
  }

  const volume = round((amount * mgFactor) / concentration);
  const volumeUnit = `mL${rateSuffix}`;

  return {
    ...base,
    volume,
    volumeUnit,
    summary: `${amount} ${amountUnit} (${volume} ${volumeUnit})`,
  };
}

export const VOLUME_BLOCKED_MESSAGE: Record<VolumeBlockedReason, string> = {
  'no-concentration':
    'No concentration on file — enter the concentration on the bottle to get a volume.',
  'unit-mismatch':
    'Dose and concentration units are not compatible; volume cannot be derived.',
  'not-weight-based': 'Dose is not weight-based.',
};
