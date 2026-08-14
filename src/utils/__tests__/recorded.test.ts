import { describe, it, expect } from 'vitest';
import { stampRecorded } from '../recorded';

describe('stampRecorded', () => {
  it('stamps at and by together, from a single call', () => {
    const r = stampRecorded('Dr Test');
    expect(r.by).toBe('Dr Test');
    expect(Number.isFinite(new Date(r.at).getTime())).toBe(true);
  });

  it('never returns an empty attribution when a name is given', () => {
    const r = stampRecorded('Dr G. Coutinho');
    expect(r.by.length).toBeGreaterThan(0);
  });
});
