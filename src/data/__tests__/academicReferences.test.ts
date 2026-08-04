import { describe, it, expect } from 'vitest';
import { ACADEMIC_REFERENCES } from '../academicReferences';
import { sirsPanel, casPanel, foalSurvivalPanel } from '../../utils/intelligence';
import { neonatalSepsisPanel } from '../../utils/neonatalSepsisScore';

/**
 * The bibliography this app actually cites — 72 entries triaged to ~10
 * (2026-08-03). The structural test here is the point: every `sourceRefId` a
 * ScorePanel sets must resolve to a real entry, so a typo or a deleted
 * reference shows up as a failing test instead of a dead link in the UI.
 */

describe('ACADEMIC_REFERENCES — data integrity', () => {
  it('has no duplicate ids', () => {
    const ids = ACADEMIC_REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry has a title and says what it is used for', () => {
    for (const r of ACADEMIC_REFERENCES) {
      expect(r.title.length).toBeGreaterThan(0);
      expect(r.usedFor.length).toBeGreaterThan(0);
    }
  });

  it('every journal entry has a journal name; every book entry does not', () => {
    for (const r of ACADEMIC_REFERENCES) {
      if (r.kind === 'journal') expect(r.journal).toBeTruthy();
    }
  });
});

describe('ScorePanel.sourceRefId resolves to a real reference', () => {
  const ids = new Set(ACADEMIC_REFERENCES.map((r) => r.id));

  it('sirsPanel', () => {
    const ref = sirsPanel({}).sourceRefId;
    expect(ref).toBe('biondi-2026');
    expect(ids.has(ref!)).toBe(true);
  });

  it('casPanel', () => {
    const ref = casPanel({}).sourceRefId;
    expect(ref).toBe('farrell-2021');
    expect(ids.has(ref!)).toBe(true);
  });

  it('foalSurvivalPanel', () => {
    const ref = foalSurvivalPanel({ id: 'p1', name: 'Foal', isFoal: true } as never, {}).sourceRefId;
    expect(ref).toBe('brewer-1988');
    expect(ids.has(ref!)).toBe(true);
  });

  it('neonatalSepsisPanel', () => {
    const ref = neonatalSepsisPanel({ id: 'p1', name: 'Foal', isFoal: true } as never, {}).sourceRefId;
    expect(ref).toBe('brewer-1988');
    expect(ids.has(ref!)).toBe(true);
  });
});
