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
  /** Mass (or activity, or volume) unit of the numerator: mg, mcg, g, IU, mU, mL, L. */
  massUnit?: string;
  ratePer?: RatePer;
  /**
   * Free text the formulary appends to the unit, e.g. "as MgSO4",
   * "elemental Ca (or ~0.2-0.4 mL/kg of 23% solution)". Clinically load-bearing,
   * so it is preserved and shown rather than parsed away.
   */
  qualifier?: string;
}

const cleanQualifier = (s: string | undefined): string | undefined => {
  const t = (s || '').trim().replace(/^[(\s]+|[)\s]+$/g, '').trim();
  return t.length > 0 ? t : undefined;
};

export function parseDoseUnit(doseUnit: string): DoseUnitSpec {
  const u = (doseUnit || '').trim();

  // Rate: "mg/kg/hr", "mg/kg/h", "mU/kg/min", "mcg/kg/min", "IU/kg/hr"
  let m = u.match(/^([A-Za-z]+)\/kg\/(hours?|hrs?|h|min(?:utes?)?)\b(.*)$/i);
  if (m) {
    return {
      kind: 'per-kg-rate',
      massUnit: m[1],
      ratePer: /min/i.test(m[2]) ? 'min' : 'hr',
      qualifier: cleanQualifier(m[3]),
    };
  }

  // Per kg, optionally with trailing free text:
  // "mg/kg", "mL/kg", "mg/kg (combined)", "mg/kg elemental Ca (or ~0.2-0.4 mL/kg ...)"
  m = u.match(/^([A-Za-z]+)\/kg\b(.*)$/i);
  if (m) return { kind: 'per-kg', massUnit: m[1], qualifier: cleanQualifier(m[2]) };

  // Totals: "mg (total)", "IU (total)", "L total (not weight-based; ~4-8 mL/kg)"
  m = u.match(/^([A-Za-z]+)\s*(?:\(total\)|total\b)(.*)$/i);
  if (m) return { kind: 'total', massUnit: m[1], qualifier: cleanQualifier(m[2]) };

  // capsules, drops, strips, mg/m2, bare "kg"/"g"/"IU"/"mcg", "-"
  return { kind: 'opaque' };
}

/** Volume units the dose may already be expressed in. */
const VOLUME_UNITS: Record<string, string> = { ml: 'mL', l: 'L' };

/**
 * Unit families that can be divided into one another. A dose in IU over a
 * concentration in IU/mL is a perfectly good volume; it is only mixing families
 * — IU over mg/mL — that is meaningless.
 */
type UnitFamily = 'mass' | 'activity';

const UNIT_FAMILY: Record<string, { family: UnitFamily; factor: number }> = {
  // mass, normalised to milligrams
  g: { family: 'mass', factor: 1000 },
  mg: { family: 'mass', factor: 1 },
  mcg: { family: 'mass', factor: 0.001 },
  ug: { family: 'mass', factor: 0.001 },
  // biological activity, normalised to international units
  iu: { family: 'activity', factor: 1 },
  u: { family: 'activity', factor: 1 },
  miu: { family: 'activity', factor: 0.001 },
  mu: { family: 'activity', factor: 0.001 },
};

const lookupUnit = (unit: string | undefined) => UNIT_FAMILY[(unit || '').toLowerCase()];

/** Numerator of a concentration string such as "IU/mL", "mg/mL" or "%". */
function concentrationNumerator(concentrationUnit: string | undefined): string | undefined {
  const u = (concentrationUnit || '').trim();
  if (!u) return undefined;
  // A percentage solution is g per 100 mL, i.e. 10 mg/mL per percentage point.
  if (u === '%') return '%';
  const m = u.match(/^([A-Za-z]+)\s*\/\s*m?L$/i);
  return m ? m[1] : undefined;
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
  /** 0 or undefined means no concentration is on file. */
  concentration?: number;
  /**
   * Unit of the concentration, e.g. "mg/mL", "IU/mL", "%". Defaults to the
   * conventional partner for the dose unit, so an IU/kg drug assumes IU/mL
   * rather than failing as a unit mismatch.
   */
  concentrationUnit?: string;
}

/** The concentration unit a bottle of this drug conventionally carries. */
export function defaultConcentrationUnit(doseUnit: string): string {
  const spec = parseDoseUnit(doseUnit);
  const f = lookupUnit(spec.massUnit);
  if (f?.family === 'activity') return `${spec.massUnit}/mL`;
  if ((spec.massUnit || '').toLowerCase() === 'mcg') return 'mg/mL';
  return 'mg/mL';
}

/** Concentration units offered for a given dose unit. */
export function concentrationUnitOptions(doseUnit: string): string[] {
  const spec = parseDoseUnit(doseUnit);
  const f = lookupUnit(spec.massUnit);
  if (f?.family === 'activity') return ['IU/mL', 'mU/mL'];
  return ['mg/mL', 'mcg/mL', 'g/mL', '%'];
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

  // A dose already expressed in mL or L is its own volume; no concentration needed.
  const volumeUnitName = VOLUME_UNITS[(spec.massUnit || '').toLowerCase()];
  if (volumeUnitName) {
    return {
      amount,
      amountUnit,
      volume: amount,
      volumeUnit: `${volumeUnitName}${rateSuffix}`,
      ratePer: spec.ratePer,
      summary: `${amount} ${volumeUnitName}${rateSuffix}`,
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

  const doseUnitInfo = lookupUnit(spec.massUnit);
  const concUnitRaw = input.concentrationUnit || defaultConcentrationUnit(input.doseUnit);
  const concNumerator = concentrationNumerator(concUnitRaw);

  if (!doseUnitInfo || !concNumerator) {
    return { ...base, volumeBlocked: 'unit-mismatch' };
  }

  // "%" is g per 100 mL, so 1% == 10 mg/mL. Only meaningful for mass doses.
  const concInfo =
    concNumerator === '%'
      ? doseUnitInfo.family === 'mass'
        ? { family: 'mass' as UnitFamily, factor: 1, perMl: concentration * 10 }
        : null
      : (() => {
          const info = lookupUnit(concNumerator);
          return info ? { ...info, perMl: concentration } : null;
        })();

  if (!concInfo || concInfo.family !== doseUnitInfo.family) {
    // e.g. an IU/kg dose against a mg/mL concentration.
    return { ...base, volumeBlocked: 'unit-mismatch' };
  }

  // Normalise both sides to the family's base unit before dividing.
  const amountBase = amount * doseUnitInfo.factor;
  const perMlBase = concInfo.perMl * concInfo.factor;
  if (!(perMlBase > 0)) return { ...base, volumeBlocked: 'no-concentration' };

  const volume = round(amountBase / perMlBase);
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
