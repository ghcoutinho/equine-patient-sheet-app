import { describe, it, expect } from 'vitest';
import { orTierFor, COMPLICATION_META } from '../complications';
import type { ComplicationId } from '../../types';

describe('orTierFor', () => {
  it('ranks a high odds ratio as critical', () => {
    expect(orTierFor('PYREXIA')).toBe('CRITICAL');
  });

  it('ranks a mid odds ratio as alert', () => {
    expect(orTierFor('LAMINITIS')).toBe('ALERT');
    expect(orTierFor('POC')).toBe('ALERT');
  });

  it('ranks a non-significant odds ratio as watch regardless of point estimate', () => {
    expect(orTierFor('MYOPATHY_NEUROPATHY')).toBe('WATCH');
  });

  it('reports NOT_ESTABLISHED for a complication with no elective-surgery comparator', () => {
    expect(orTierFor('PERITONITIS')).toBe('NOT_ESTABLISHED');
    expect(orTierFor('ADHESIONS')).toBe('NOT_ESTABLISHED');
  });

  it('has a meta entry for every ComplicationId', () => {
    const ids = Object.keys(COMPLICATION_META) as ComplicationId[];
    for (const id of ids) {
      expect(COMPLICATION_META[id].label).toBeTruthy();
    }
    expect(ids.length).toBe(19);
  });
});
