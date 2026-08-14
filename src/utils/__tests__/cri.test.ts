import { describe, it, expect } from 'vitest';
import type { Treatment, CriEvent } from '../../types';
import { infusedVolumeMl, currentRate, isPaused } from '../cri';

/**
 * CRI volume math — derived from rate × elapsed time, never typed
 * (Architecture principle D).
 */

const NOW = new Date('2026-08-01T12:00:00Z');
const HOUR = 60 * 60 * 1000;
const at = (offsetHours: number) => new Date(NOW.getTime() + offsetHours * HOUR).toISOString();

const event = (over: Partial<CriEvent>): CriEvent => ({
  id: 'e1',
  kind: 'START',
  at: at(0),
  by: 'Dr Test',
  ...over,
});

const cri = (over: Partial<Treatment> = {}): Treatment => ({
  id: 't1',
  kind: 'CRI',
  drug: 'Lidocaine',
  startedAt: at(0),
  administrations: [],
  ...over,
});

describe('infusedVolumeMl — legacy fallback (no event log)', () => {
  it('computes rate x elapsed hours for mL/hr', () => {
    const t = cri({ startedAt: at(-4), rateValue: 10, rateUnit: 'mL/hr' });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(40);
  });

  it('multiplies by weight for mL/kg/hr', () => {
    const t = cri({ startedAt: at(-2), rateValue: 1, rateUnit: 'mL/kg/hr' });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(1000);
  });

  it('stops accumulating at stoppedAt, not now', () => {
    const t = cri({ startedAt: at(-10), stoppedAt: at(-8), rateValue: 10, rateUnit: 'mL/hr' });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(20);
  });

  it('refuses to guess a volume from a mass-based rate', () => {
    const t = cri({ startedAt: at(-4), rateValue: 0.05, rateUnit: 'mg/kg/hr' });
    expect(infusedVolumeMl(t, NOW, 500)).toBeUndefined();
  });

  it('is undefined for a non-CRI treatment', () => {
    const t = cri({ kind: 'MEDICATION', rateValue: 10, rateUnit: 'mL/hr' });
    expect(infusedVolumeMl(t, NOW, 500)).toBeUndefined();
  });

  it('is undefined with no rate at all', () => {
    expect(infusedVolumeMl(cri({ startedAt: at(-4) }), NOW, 500)).toBeUndefined();
  });
});

describe('infusedVolumeMl — event log', () => {
  it('integrates a single constant-rate segment same as the legacy path', () => {
    const t = cri({
      startedAt: at(-4),
      criEvents: [event({ kind: 'START', at: at(-4), rateValue: 10, rateUnit: 'mL/hr' })],
    });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(40);
  });

  it('applies the new rate only after a RATE_CHANGE', () => {
    const t = cri({
      startedAt: at(-4),
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-4), rateValue: 10, rateUnit: 'mL/hr' }),
        event({ id: 'e2', kind: 'RATE_CHANGE', at: at(-2), rateValue: 20, rateUnit: 'mL/hr' }),
      ],
    });
    // 2h at 10 mL/hr + 2h at 20 mL/hr = 20 + 40 = 60
    expect(infusedVolumeMl(t, NOW, 500)).toBe(60);
  });

  it('stops accumulating during a pause and resumes after RESUME', () => {
    const t = cri({
      startedAt: at(-4),
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-4), rateValue: 10, rateUnit: 'mL/hr' }),
        event({ id: 'e2', kind: 'PAUSE', at: at(-3) }),
        event({ id: 'e3', kind: 'RESUME', at: at(-1) }),
      ],
    });
    // 1h running before pause + 1h running after resume = 2h at 10 mL/hr = 20
    expect(infusedVolumeMl(t, NOW, 500)).toBe(20);
  });

  it('stops accumulating entirely after STOP, even if now is later', () => {
    const t = cri({
      startedAt: at(-6),
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-6), rateValue: 10, rateUnit: 'mL/hr' }),
        event({ id: 'e2', kind: 'STOP', at: at(-4) }),
      ],
    });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(20);
  });

  it('a bag change does not reset or affect the running total', () => {
    const t = cri({
      startedAt: at(-4),
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-4), rateValue: 10, rateUnit: 'mL/hr' }),
        event({ id: 'e2', kind: 'BAG_CHANGE', at: at(-2), bagVolumeL: 1 }),
      ],
    });
    expect(infusedVolumeMl(t, NOW, 500)).toBe(40);
  });
});

describe('currentRate', () => {
  it('reads the most recent rate-bearing event over the treatment default', () => {
    const t = cri({
      rateValue: 10,
      rateUnit: 'mL/hr',
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-4), rateValue: 10, rateUnit: 'mL/hr' }),
        event({ id: 'e2', kind: 'RATE_CHANGE', at: at(-1), rateValue: 25, rateUnit: 'mL/hr' }),
      ],
    });
    expect(currentRate(t)).toEqual({ value: 25, unit: 'mL/hr' });
  });

  it('falls back to the treatment default with no event log', () => {
    const t = cri({ rateValue: 10, rateUnit: 'mL/hr' });
    expect(currentRate(t)).toEqual({ value: 10, unit: 'mL/hr' });
  });
});

describe('isPaused', () => {
  it('is true only when the most recent event is a PAUSE', () => {
    const paused = cri({
      criEvents: [
        event({ id: 'e1', kind: 'START', at: at(-4) }),
        event({ id: 'e2', kind: 'PAUSE', at: at(-1) }),
      ],
    });
    expect(isPaused(paused)).toBe(true);

    const resumed = cri({
      criEvents: [
        event({ id: 'e1', kind: 'PAUSE', at: at(-2) }),
        event({ id: 'e2', kind: 'RESUME', at: at(-1) }),
      ],
    });
    expect(isPaused(resumed)).toBe(false);
  });

  it('is false with no event log', () => {
    expect(isPaused(cri())).toBe(false);
  });
});
