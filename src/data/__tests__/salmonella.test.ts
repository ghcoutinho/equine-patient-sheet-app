import { describe, it, expect } from 'vitest';
import { evaluateSalmonellaIsolation, SALMONELLA_SURVEILLANCE } from '../salmonella';

describe('evaluateSalmonellaIsolation', () => {
  it('returns undefined when nothing is charted', () => {
    expect(evaluateSalmonellaIsolation(undefined, undefined, undefined)).toBeUndefined();
  });

  it('meets criteria only when fever, diarrhoea and leukopenia are all present', () => {
    const r = evaluateSalmonellaIsolation(39.5, true, 4.0);
    expect(r?.meetsCriteria).toBe(true);
    expect(r?.reading).toContain('Meets all three');
  });

  it('does not meet criteria with only two of the three', () => {
    const r = evaluateSalmonellaIsolation(39.5, true, 6.0);
    expect(r?.meetsCriteria).toBe(false);
    expect(r?.reading).toContain('2 of 3');
  });

  it('does not fire on fever alone', () => {
    const r = evaluateSalmonellaIsolation(39.5, undefined, undefined);
    expect(r?.meetsCriteria).toBe(false);
    expect(r?.feverHit).toBe(true);
  });

  it('is exact at the published boundary — not above 38.9°C does not count as fever', () => {
    expect(evaluateSalmonellaIsolation(38.9, true, 4.0)?.feverHit).toBe(false);
    expect(evaluateSalmonellaIsolation(38.91, true, 4.0)?.feverHit).toBe(true);
  });

  it('is exact at the WBC boundary — not below 5.0 K/µL does not count as leukopenia', () => {
    expect(evaluateSalmonellaIsolation(39.5, true, 5.0)?.leukopeniaHit).toBe(false);
    expect(evaluateSalmonellaIsolation(39.5, true, 4.99)?.leukopeniaHit).toBe(true);
  });

  it('holds the published surveillance constants', () => {
    expect(SALMONELLA_SURVEILLANCE.routineIntervalHours).toBe(72);
    expect(SALMONELLA_SURVEILLANCE.isolationIntervalHours).toBe(12);
    expect(SALMONELLA_SURVEILLANCE.source).toContain('Bauck');
  });
});
