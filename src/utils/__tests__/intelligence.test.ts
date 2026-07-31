import { describe, it, expect } from 'vitest';
import type { FlowsheetColumn, Patient } from '../../types';
import { columnToEntry } from '../intelligence';

/**
 * The bridge from a charted round to the scoring engines.
 *
 * Foals are charted in °F and adults in °C. A bug where only the Celsius field
 * was read meant a foal's temperature never reached any scoring panel at all,
 * so the conversion is pinned here rather than left to the view.
 */

const patient = (over: Partial<Patient> = {}): Patient =>
  ({ id: 'p1', name: 'Foal', isFoal: true, ...over }) as Patient;

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '14:00',
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

describe('columnToEntry — temperature', () => {
  it('101.2 °F charted on a foal reaches the panels as 38.4 °C', () => {
    const e = columnToEntry(patient(), column({ vitals: { temperatureF: 101.2 } }));
    expect(e.temperature).toBe(38.4);
  });

  it('passes an adult Celsius reading straight through', () => {
    const e = columnToEntry(
      patient({ isFoal: false }),
      column({ vitals: { temperatureC: 38.2 } }),
    );
    expect(e.temperature).toBe(38.2);
  });

  it('prefers the Celsius field when both are somehow present', () => {
    const e = columnToEntry(
      patient(),
      column({ vitals: { temperatureC: 38.0, temperatureF: 104 } }),
    );
    expect(e.temperature).toBe(38.0);
  });

  it('leaves the temperature uncharted rather than inventing one', () => {
    expect(columnToEntry(patient(), column()).temperature).toBeUndefined();
  });

  it('converts across the range a foal is actually charted in', () => {
    const at = (f: number) =>
      columnToEntry(patient(), column({ vitals: { temperatureF: f } })).temperature;
    expect(at(98.6)).toBe(37);
    expect(at(100.0)).toBe(37.8);
    expect(at(103.0)).toBe(39.4);
  });
});

describe('columnToEntry — nothing is invented', () => {
  it('returns an empty record for no round at all', () => {
    expect(columnToEntry(patient(), undefined)).toEqual({});
  });

  it('leaves every uncharted vital undefined', () => {
    const e = columnToEntry(patient(), column());
    expect(e.heartRate).toBeUndefined();
    expect(e.respiratoryRate).toBeUndefined();
    expect(e.lactate).toBeUndefined();
    expect(e.pcv).toBeUndefined();
    expect(e.capillaryRefillTime).toBeUndefined();
    expect(e.mucousMembranes).toBeUndefined();
  });

  it('carries a charted zero through instead of dropping it', () => {
    const e = columnToEntry(
      patient(),
      column({ vitals: { heartRate: 0 }, gi: { refluxVolumeL: 0 }, labs: { lactate: 0 } }),
    );
    expect(e.heartRate).toBe(0);
    expect(e.gastricRefluxVol).toBe(0);
    expect(e.lactate).toBe(0);
  });

  it('treats a pending lab as not yet known, not as a number', () => {
    const e = columnToEntry(patient(), column({ labs: { glucose: 'Pending' } }));
    expect(e.glucose).toBeUndefined();
  });

  it('maps the mucous membrane wording onto the scoring code', () => {
    const e = columnToEntry(
      patient(),
      column({ vitals: { mucousMembranes: 'Brick-red / toxic' } }),
    );
    expect(e.mucousMembranes).toBe('TOXIC_RING');
  });
});
