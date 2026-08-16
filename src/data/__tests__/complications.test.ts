import { describe, it, expect } from 'vitest';
import { orTierFor, COMPLICATION_META, POST_DISCHARGE_PRIORITY } from '../complications';
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

describe('POST_DISCHARGE_PRIORITY', () => {
  it('lists exactly the 5 complications Gandini 2023 reports for the post-discharge frame', () => {
    expect(POST_DISCHARGE_PRIORITY).toHaveLength(5);
  });

  it('is ordered by prevalence, highest first', () => {
    const prevalences = POST_DISCHARGE_PRIORITY.map((p) => p.prevalence);
    expect(prevalences).toEqual([...prevalences].sort((a, b) => b - a));
  });

  it('every id is a real ComplicationId with a meta entry', () => {
    for (const { id } of POST_DISCHARGE_PRIORITY) {
      expect(COMPLICATION_META[id]).toBeDefined();
    }
  });

  it('every entry has a note prompt guiding what to record', () => {
    for (const { notePrompt } of POST_DISCHARGE_PRIORITY) {
      expect(notePrompt.length).toBeGreaterThan(0);
    }
  });
});
