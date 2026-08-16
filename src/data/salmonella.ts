/**
 * Salmonella surveillance protocol (Bauck 2023).
 *
 * The synthesis this app draws on is explicit: collect on the admission of
 * every colic case, not only clinically suspected ones — asymptomatic
 * shedding is exactly what routine surveillance is for. Resampling runs
 * every 72h, tightened to every 12h once a patient meets the isolation
 * criteria. The isolation criteria themselves (fever + diarrhoea +
 * leukopenia together) only ever *suggest* isolation here — a clinician has
 * to actually set `Patient.salmonellaIsolation` before the resample
 * interval tightens; see `utils/schedule.ts`.
 */

export const SALMONELLA_SURVEILLANCE = {
  routineIntervalHours: 72,
  isolationIntervalHours: 12,
  /** > 102°F. */
  isolationTemperatureAboveC: 38.9,
  isolationWbcBelowKPerUl: 5.0,
  source:
    'Bauck 2023 — collect on every colic admission; resample every 72h routinely, every 12h once isolated; isolation criteria: temperature > 102°F (38.9°C) + diarrhoea + WBC < 5,000/µL.',
} as const;

export interface SalmonellaIsolationReading {
  feverHit: boolean;
  diarrheaHit: boolean;
  leukopeniaHit: boolean;
  meetsCriteria: boolean;
  reading: string;
}

/**
 * All three criteria together, per Bauck 2023's listing — not any one alone.
 * Returns undefined when nothing relevant was charted, so a round with no
 * temperature, no manure record and no WBC produces no reading at all.
 */
export function evaluateSalmonellaIsolation(
  temperatureC: number | undefined,
  hasDiarrhea: boolean | undefined,
  wbcKPerUl: number | undefined,
): SalmonellaIsolationReading | undefined {
  if (temperatureC === undefined && hasDiarrhea === undefined && wbcKPerUl === undefined) {
    return undefined;
  }

  const feverHit = temperatureC !== undefined && temperatureC > SALMONELLA_SURVEILLANCE.isolationTemperatureAboveC;
  const diarrheaHit = hasDiarrhea === true;
  const leukopeniaHit = wbcKPerUl !== undefined && wbcKPerUl < SALMONELLA_SURVEILLANCE.isolationWbcBelowKPerUl;
  const meetsCriteria = feverHit && diarrheaHit && leukopeniaHit;

  const hit: string[] = [];
  if (feverHit) hit.push(`fever ${temperatureC}°C`);
  if (diarrheaHit) hit.push('diarrhoea');
  if (leukopeniaHit) hit.push(`WBC ${wbcKPerUl} K/µL`);
  const reading = meetsCriteria
    ? `Meets all three isolation criteria: ${hit.join(', ')}.`
    : hit.length > 0
      ? `Meets ${hit.length} of 3 isolation criteria (${hit.join(', ')}) — isolation is suggested only when all three are present.`
      : 'Meets none of the three isolation criteria on what is charted this round.';

  return { feverHit, diarrheaHit, leukopeniaHit, meetsCriteria, reading };
}
