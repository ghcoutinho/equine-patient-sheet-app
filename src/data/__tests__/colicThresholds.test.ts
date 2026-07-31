import { describe, it, expect } from 'vitest';
import {
  plasmaLactateBand,
  comparePeritonealLactate,
  readPcvTp,
  readReflux,
  readHeartRate,
  PLASMA_LACTATE_BANDS,
  PERITONEAL_LACTATE,
  PCV_TP,
  REFLUX,
  HEART_RATE,
} from '../colicThresholds';

/**
 * Published colic thresholds.
 *
 * These are the numbers a surgeon acts on, so the band edges are pinned
 * exactly. The important property is that the indeterminate band stays
 * indeterminate: 3.6 and 7.0 are the reported series' limits, and a value
 * sitting on either edge must not be rounded into a verdict the source does
 * not support.
 */

describe('plasmaLactateBand', () => {
  it('is UNCERTAIN exactly at 3.6 and exactly at 7.0', () => {
    expect(plasmaLactateBand(3.6)).toBe('UNCERTAIN');
    expect(plasmaLactateBand(7.0)).toBe('UNCERTAIN');
  });

  it('bands either side of those edges', () => {
    expect(plasmaLactateBand(3.59)).toBe('SURVIVED');
    expect(plasmaLactateBand(7.01)).toBe('DIED');
    expect(plasmaLactateBand(5)).toBe('UNCERTAIN');
  });

  it('calls the resting reference maximum NORMAL, inclusive', () => {
    expect(plasmaLactateBand(1.5)).toBe('NORMAL');
    expect(plasmaLactateBand(1.51)).toBe('SURVIVED');
    expect(plasmaLactateBand(0)).toBe('NORMAL');
  });

  it('returns undefined when nothing was charted', () => {
    expect(plasmaLactateBand(undefined)).toBeUndefined();
    expect(plasmaLactateBand(Number.NaN)).toBeUndefined();
  });

  it('keeps the published edges where the source put them', () => {
    expect(PLASMA_LACTATE_BANDS.allLivedBelow).toBe(3.6);
    expect(PLASMA_LACTATE_BANDS.allDiedAbove).toBe(7.0);
    expect(PLASMA_LACTATE_BANDS.referenceMax).toBe(1.5);
  });
});

describe('comparePeritonealLactate', () => {
  it('peritoneal 6.4 against plasma 5.2 → gradient +1.2, exceeds plasma', () => {
    const c = comparePeritonealLactate(6.4, 5.2);
    expect(c?.gradient).toBe(1.2);
    expect(c?.exceedsPlasma).toBe(true);
    expect(c?.aboveSurvivalCeiling).toBe(false);
    expect(c?.severity).toBe('critical');
    expect(c?.reading).toContain('strangulated small intestine');
  });

  it('does not call it a gradient when peritoneal sits below plasma', () => {
    const c = comparePeritonealLactate(4.0, 5.2);
    expect(c?.gradient).toBe(-1.2);
    expect(c?.exceedsPlasma).toBe(false);
    expect(c?.severity).toBe('normal');
  });

  it('equal values are not an exceedance', () => {
    const c = comparePeritonealLactate(5.2, 5.2);
    expect(c?.gradient).toBe(0);
    expect(c?.exceedsPlasma).toBe(false);
  });

  it('flags the reported survival ceiling above 9.4 mmol/L', () => {
    expect(comparePeritonealLactate(9.4, 2)?.aboveSurvivalCeiling).toBe(false);
    const c = comparePeritonealLactate(9.5, 2);
    expect(c?.aboveSurvivalCeiling).toBe(true);
    expect(c?.severity).toBe('critical');
    expect(PERITONEAL_LACTATE.noSurvivorAbove).toBe(9.4);
  });

  it('needs both samples — the comparison is the finding', () => {
    expect(comparePeritonealLactate(6.4, undefined)).toBeUndefined();
    expect(comparePeritonealLactate(undefined, 5.2)).toBeUndefined();
  });
});

describe('readPcvTp', () => {
  it('PCV 44→52 with TP 6.8→5.1 is splitting', () => {
    const r = readPcvTp(52, 5.1, 44, 6.8);
    expect(r?.splitting).toBe(true);
    expect(r?.pcvGrave).toBe(true);
    expect(r?.severity).toBe('critical');
    expect(r?.reading).toContain('grave');
  });

  it('splitting is critical even below the grave PCV threshold', () => {
    const r = readPcvTp(46, 5.1, 44, 6.8);
    expect(r?.splitting).toBe(true);
    expect(r?.pcvGrave).toBe(false);
    expect(r?.severity).toBe('critical');
    expect(r?.reading).toContain('protein loss');
  });

  it('both rising together is simple dehydration, not splitting', () => {
    const r = readPcvTp(48, 7.2, 44, 6.8);
    expect(r?.splitting).toBe(false);
    expect(r?.severity).toBe('watch');
    expect(r?.reading).toContain('simple dehydration');
  });

  it('a single sample cannot show splitting and says so', () => {
    const r = readPcvTp(44, 6.8);
    expect(r?.splitting).toBe(false);
    expect(r?.severity).toBe('normal');
    expect(r?.reading).toContain('needs a previous round');
  });

  it('a single grave PCV is a warning on its own', () => {
    const r = readPcvTp(52, 6.8);
    expect(r?.pcvGrave).toBe(true);
    expect(r?.splitting).toBe(false);
    expect(r?.severity).toBe('warning');
  });

  it('the grave threshold is exclusive at 50%', () => {
    expect(readPcvTp(50, 6.8)?.pcvGrave).toBe(false);
    expect(readPcvTp(50.1, 6.8)?.pcvGrave).toBe(true);
    expect(PCV_TP.graveAbove).toBe(50);
  });

  it('returns undefined without both current values', () => {
    expect(readPcvTp(undefined, 6.8)).toBeUndefined();
    expect(readPcvTp(44, undefined)).toBeUndefined();
  });
});

describe('readReflux', () => {
  it('2 L is significant but is not the enteritis band', () => {
    const r = readReflux(2);
    expect(r?.significant).toBe(true);
    expect(r?.suggestsDpj).toBe(false);
    expect(r?.severity).toBe('warning');
    expect(r?.reading).toContain('small intestinal obstruction');
  });

  it('just under 2 L is not significant', () => {
    const r = readReflux(1.9);
    expect(r?.significant).toBe(false);
    expect(r?.severity).toBe('normal');
  });

  it('10 L reaches the proximal enteritis band and changes the reading', () => {
    const r = readReflux(10);
    expect(r?.suggestsDpj).toBe(true);
    expect(r?.significant).toBe(true);
    expect(r?.severity).toBe('critical');
    // The point of the band: this is the volume where a celiotomy may be the
    // wrong operation, so the text must not read as "more surgical".
    expect(r?.reading).toContain('proximal enteritis');
    expect(r?.reading).toContain('wrong operation');
  });

  it('just under 10 L stays in the obstruction reading', () => {
    expect(readReflux(9.9)?.suggestsDpj).toBe(false);
  });

  it('above the band still reads as enteritis-possible', () => {
    expect(readReflux(25)?.suggestsDpj).toBe(true);
  });

  it('respects a charted zero', () => {
    const r = readReflux(0);
    expect(r?.significant).toBe(false);
    expect(r?.severity).toBe('normal');
  });

  it('returns undefined when nothing was charted', () => {
    expect(readReflux(undefined)).toBeUndefined();
  });

  it('keeps the published band where the source put it', () => {
    expect(REFLUX.significantAbove).toBe(2);
    expect(REFLUX.dpjRangeLow).toBe(10);
    expect(REFLUX.dpjRangeHigh).toBe(20);
  });
});

describe('readHeartRate', () => {
  it('52 → 68 bpm is RISING', () => {
    const r = readHeartRate(68, 52);
    expect(r?.trajectory).toBe('RISING');
    expect(r?.delta).toBe(16);
    expect(r?.severity).toBe('warning');
  });

  it('holds a ±2 bpm dead-band so measurement noise is not a trend', () => {
    expect(readHeartRate(54, 52)?.trajectory).toBe('STEADY');
    expect(readHeartRate(50, 52)?.trajectory).toBe('STEADY');
    expect(readHeartRate(52, 52)?.trajectory).toBe('STEADY');
    // One beat past the dead-band is a direction.
    expect(readHeartRate(55, 52)?.trajectory).toBe('RISING');
    expect(readHeartRate(49, 52)?.trajectory).toBe('FALLING');
  });

  it('a falling rate is the favourable direction', () => {
    const r = readHeartRate(60, 80);
    expect(r?.trajectory).toBe('FALLING');
    expect(r?.delta).toBe(-20);
    expect(r?.severity).toBe('normal');
    expect(r?.reading).toContain('favourable');
  });

  it('rising into the non-survivor mean is critical', () => {
    const r = readHeartRate(84, 70);
    expect(r?.trajectory).toBe('RISING');
    expect(r?.severity).toBe('critical');
    expect(HEART_RATE.lcvNonSurvivorMean).toBe(81);
  });

  it('a rate that will not fall is itself a finding', () => {
    const r = readHeartRate(84, 84);
    expect(r?.trajectory).toBe('STEADY');
    expect(r?.severity).toBe('critical');
    expect(r?.reading).toContain('will not fall');
  });

  it('a single value has no trajectory and says the direction matters more', () => {
    const r = readHeartRate(68, undefined);
    expect(r?.trajectory).toBeUndefined();
    expect(r?.previous).toBeUndefined();
    expect(r?.severity).toBe('warning');
    expect(r?.reading).toContain('single value');
  });

  it('returns undefined when nothing was charted', () => {
    expect(readHeartRate(undefined, 52)).toBeUndefined();
  });
});
