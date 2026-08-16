import { describe, it, expect } from 'vitest';
import {
  readNutritionTimeline,
  exerciseReturnPhase,
  EXERCISE_RETURN_PROTOCOL,
  LESION_TYPE_LABEL,
} from '../nutritionTimeline';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('readNutritionTimeline — timed lesion types', () => {
  const surgeryAt = '2026-08-15T08:00:00Z';

  it('reads water/food as not-yet before the published hours have elapsed', () => {
    const r = readNutritionTimeline(
      'NON_STRANGULATING',
      surgeryAt,
      undefined,
      new Date(new Date(surgeryAt).getTime() + 1 * HOUR),
    );
    expect(r.waterStatus).toBe('not-yet');
    expect(r.foodStatus).toBe('not-yet');
  });

  it('reads water as due-now once its hour threshold is crossed, independent of food', () => {
    const r = readNutritionTimeline(
      'NON_STRANGULATING',
      surgeryAt,
      undefined,
      new Date(new Date(surgeryAt).getTime() + 4 * HOUR),
    );
    expect(r.waterStatus).toBe('due-now'); // water at 3h
    expect(r.foodStatus).toBe('not-yet'); // food at 6h
  });

  it('is unknown, not guessed, without a recorded surgery time', () => {
    const r = readNutritionTimeline('SI_STRANGULATING', undefined, undefined, new Date());
    expect(r.waterStatus).toBe('unknown');
    expect(r.foodStatus).toBe('unknown');
    expect(r.waterReading).toContain('set the surgery time');
  });

  it('carries the correct diet text per lesion type', () => {
    const r = readNutritionTimeline('SI_STRANGULATING', surgeryAt, undefined, new Date());
    expect(r.diet).toContain('without reflux');
  });
});

describe('readNutritionTimeline — SIRS-gated lesion types', () => {
  it('is gated-on-sirs when SIRS has not resolved', () => {
    const r = readNutritionTimeline('LI_SIRS', undefined, false, new Date());
    expect(r.waterStatus).toBe('gated-on-sirs');
    expect(r.foodStatus).toBe('gated-on-sirs');
  });

  it('is due-now once SIRS has resolved', () => {
    const r = readNutritionTimeline('LI_RESECTION', undefined, true, new Date());
    expect(r.waterStatus).toBe('due-now');
    expect(r.foodStatus).toBe('due-now');
  });

  it('is unknown when SIRS status has not been assessed at all', () => {
    const r = readNutritionTimeline('LI_SIRS', undefined, undefined, new Date());
    expect(r.waterStatus).toBe('unknown');
  });

  it('ignores surgery time entirely for a SIRS-gated lesion type', () => {
    const r = readNutritionTimeline('LI_RESECTION', '2026-08-15T08:00:00Z', true, new Date());
    expect(r.waterStatus).toBe('due-now');
  });
});

describe('LESION_TYPE_LABEL', () => {
  it('has a label for every lesion type the timeline defines', () => {
    expect(Object.keys(LESION_TYPE_LABEL)).toHaveLength(4);
  });
});

describe('exerciseReturnPhase', () => {
  it('is undefined before discharge', () => {
    expect(exerciseReturnPhase(undefined, new Date())).toBeUndefined();
  });

  it('is stall rest for the first 30 days', () => {
    const dischargedAt = '2026-08-01T00:00:00Z';
    const p = exerciseReturnPhase(dischargedAt, new Date(new Date(dischargedAt).getTime() + 10 * DAY));
    expect(p?.label).toBe('Stall rest');
    expect(p?.daysElapsed).toBe(10);
    expect(p?.daysRemaining).toBe(20);
  });

  it('moves to small paddock at day 30', () => {
    const dischargedAt = '2026-08-01T00:00:00Z';
    const p = exerciseReturnPhase(dischargedAt, new Date(new Date(dischargedAt).getTime() + 30 * DAY));
    expect(p?.label).toBe('Small paddock');
  });

  it('moves to full pasture at day 60', () => {
    const dischargedAt = '2026-08-01T00:00:00Z';
    const p = exerciseReturnPhase(dischargedAt, new Date(new Date(dischargedAt).getTime() + 60 * DAY));
    expect(p?.label).toBe('Full pasture');
  });

  it('clears for gradual athletic return at day 90', () => {
    const dischargedAt = '2026-08-01T00:00:00Z';
    const p = exerciseReturnPhase(dischargedAt, new Date(new Date(dischargedAt).getTime() + 90 * DAY));
    expect(p?.label).toBe('Cleared for gradual athletic return');
    expect(p?.daysRemaining).toBe(0);
  });

  it('holds the published day counts', () => {
    expect(EXERCISE_RETURN_PROTOCOL.stallDays).toBe(30);
    expect(EXERCISE_RETURN_PROTOCOL.smallPaddockDays).toBe(30);
    expect(EXERCISE_RETURN_PROTOCOL.fullPastureDays).toBe(30);
    expect(EXERCISE_RETURN_PROTOCOL.athleticReturnDays).toBe(90);
  });
});
