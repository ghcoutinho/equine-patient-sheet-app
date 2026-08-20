import { describe, it, expect } from 'vitest';
import type { FlowsheetColumn } from '../../types';
import { carryForward } from '../carryForward';

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '08:00',
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

const pickHr = (c: FlowsheetColumn) => c.vitals.heartRate;

describe('carryForward', () => {
  it('is not carried when the requested column charted the value itself', () => {
    const cols = [column({ time: '08:00', vitals: { heartRate: 60 } })];
    const r = carryForward(cols, 0, pickHr);
    expect(r?.value).toBe(60);
    expect(r?.carried).toBe(false);
    expect(r?.sourceColumn).toBe(cols[0]);
  });

  it('carries the most recent prior value when the requested column is blank', () => {
    const cols = [
      column({ time: '08:00', vitals: { heartRate: 60 } }),
      column({ time: '10:00', vitals: {} }),
    ];
    const r = carryForward(cols, 1, pickHr);
    expect(r?.value).toBe(60);
    expect(r?.carried).toBe(true);
    expect(r?.sourceColumn).toBe(cols[0]);
  });

  it('skips back past multiple blank columns to the last charted one', () => {
    const cols = [
      column({ time: '08:00', vitals: { heartRate: 60 } }),
      column({ time: '09:00', vitals: {} }),
      column({ time: '10:00', vitals: {} }),
    ];
    const r = carryForward(cols, 2, pickHr);
    expect(r?.value).toBe(60);
    expect(r?.sourceColumn.time).toBe('08:00');
  });

  it('is undefined when nothing was ever charted up to this point', () => {
    const cols = [column({ time: '08:00', vitals: {} }), column({ time: '10:00', vitals: {} })];
    expect(carryForward(cols, 1, pickHr)).toBeUndefined();
  });

  it('never looks forward — a later column cannot fill in an earlier one', () => {
    const cols = [
      column({ time: '08:00', vitals: {} }),
      column({ time: '10:00', vitals: { heartRate: 60 } }),
    ];
    expect(carryForward(cols, 0, pickHr)).toBeUndefined();
  });

  it('treats a charted zero as a real value, not a gap to fill', () => {
    const cols = [
      column({ time: '08:00', vitals: { crtSeconds: 5 } }),
      column({ time: '09:00', vitals: { crtSeconds: 0 } }),
    ];
    const r = carryForward(cols, 1, (c) => c.vitals.crtSeconds);
    expect(r?.value).toBe(0);
    expect(r?.carried).toBe(false);
  });
});
