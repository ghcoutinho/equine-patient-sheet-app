import { describe, it, expect } from 'vitest';
import type { FlowsheetEntry, Patient } from '../../types';
import { neonatalSepsisPanel } from '../neonatalSepsisScore';

/**
 * Brewer & Koterba's neonatal sepsis score.
 *
 * The point of this rewrite was resolving the absolute-vs-percentage guess on
 * band neutrophils (deleted, not decided — entry.bands is always absolute
 * now) and the history item that scored any non-empty dam-history text as
 * abnormal (replaced with a real clinician judgement,
 * patient.abnormalPerinatalHistory). Both are pinned here.
 */

const foal = (over: Partial<Patient> = {}): Patient =>
  ({ id: 'p1', name: 'Foal', isFoal: true, ...over }) as Patient;

describe('neonatalSepsisPanel — WBC', () => {
  const points = (wbc: number) =>
    neonatalSepsisPanel(foal(), { wbc }).criteria.find((c) => c.id === 'wbc')?.points;

  it('bands at the published edges', () => {
    expect(points(1999)).toBe(3);
    expect(points(2000)).toBe(2);
    expect(points(3999)).toBe(2);
    expect(points(4000)).toBe(1);
    expect(points(8000)).toBe(1);
    expect(points(8001)).toBe(0);
    expect(points(12000)).toBe(0);
    expect(points(12001)).toBe(1);
  });
});

describe('neonatalSepsisPanel — band neutrophils, absolute count only', () => {
  it('bands are read as an absolute cells/µL count, no percentage guess', () => {
    const p = (bands: number) =>
      neonatalSepsisPanel(foal(), { bands }).criteria.find((c) => c.id === 'bands')?.points;
    // A value like 40 used to trigger "assume it's a percentage of WBC" —
    // now it is just 40 cells/µL, below the 50 floor, scoring 0.
    expect(p(40)).toBe(0);
    expect(p(50)).toBe(1);
    expect(p(199)).toBe(1);
    expect(p(200)).toBe(2);
    expect(p(500)).toBe(2);
    expect(p(501)).toBe(3);
  });
});

describe('neonatalSepsisPanel — toxic neutrophils, fibrinogen, IgG, glucose', () => {
  it('scores toxic neutrophils as present/absent', () => {
    expect(
      neonatalSepsisPanel(foal(), { toxicNeutrophils: true }).criteria.find((c) => c.id === 'toxicNeutrophils')?.points,
    ).toBe(2);
    expect(
      neonatalSepsisPanel(foal(), { toxicNeutrophils: false }).criteria.find((c) => c.id === 'toxicNeutrophils')?.points,
    ).toBe(0);
  });

  it('bands fibrinogen at the published edges', () => {
    const p = (fibrinogen: number) =>
      neonatalSepsisPanel(foal(), { fibrinogen }).criteria.find((c) => c.id === 'fibrinogen')?.points;
    expect(p(499)).toBe(0);
    expect(p(500)).toBe(1);
    expect(p(800)).toBe(1);
    expect(p(801)).toBe(2);
  });

  it('bands IgG at the published edges', () => {
    const p = (igg: number) =>
      neonatalSepsisPanel(foal(), { igg }).criteria.find((c) => c.id === 'igg')?.points;
    expect(p(399)).toBe(4);
    expect(p(400)).toBe(2);
    expect(p(800)).toBe(2);
    expect(p(801)).toBe(0);
  });

  it('bands glucose at the published edges', () => {
    const p = (glucose: number) =>
      neonatalSepsisPanel(foal(), { glucose }).criteria.find((c) => c.id === 'glucose')?.points;
    expect(p(39)).toBe(2);
    expect(p(40)).toBe(1);
    expect(p(80)).toBe(1);
    expect(p(81)).toBe(0);
  });
});

describe('neonatalSepsisPanel — blood gas needs both values together', () => {
  it('scores 1 when either PaO2 is low or PaCO2 is high', () => {
    expect(
      neonatalSepsisPanel(foal(), { pao2: 55, paco2: 45 }).criteria.find((c) => c.id === 'bloodGas')?.points,
    ).toBe(1);
    expect(
      neonatalSepsisPanel(foal(), { pao2: 70, paco2: 55 }).criteria.find((c) => c.id === 'bloodGas')?.points,
    ).toBe(1);
  });

  it('scores 0 when both are within range', () => {
    expect(
      neonatalSepsisPanel(foal(), { pao2: 70, paco2: 45 }).criteria.find((c) => c.id === 'bloodGas')?.points,
    ).toBe(0);
  });

  it('stays uncharted with only one of the two values, not scored as 0', () => {
    const p = neonatalSepsisPanel(foal(), { pao2: 55 }).criteria.find((c) => c.id === 'bloodGas');
    expect(p?.points).toBeUndefined();
    expect(p?.evidence).toBeUndefined();
  });
});

describe('neonatalSepsisPanel — hypotonia and petechiae/injected membranes', () => {
  it('bands hypotonia', () => {
    const p = (hypotonia: FlowsheetEntry['hypotonia']) =>
      neonatalSepsisPanel(foal(), { hypotonia }).criteria.find((c) => c.id === 'hypotonia')?.points;
    expect(p('NONE')).toBe(0);
    expect(p('MILD')).toBe(1);
    expect(p('SEVERE')).toBe(3);
  });

  it('scores petechiae OR injected membranes as a single combined finding', () => {
    const petechiaeOnly = neonatalSepsisPanel(foal(), { petechiae: true, mucousMembranes: 'PINK' });
    const injectedOnly = neonatalSepsisPanel(foal(), { petechiae: false, mucousMembranes: 'INJECTED' });
    const neither = neonatalSepsisPanel(foal(), { petechiae: false, mucousMembranes: 'PINK' });
    expect(petechiaeOnly.criteria.find((c) => c.id === 'petechiaeOrInjected')?.points).toBe(2);
    expect(injectedOnly.criteria.find((c) => c.id === 'petechiaeOrInjected')?.points).toBe(2);
    expect(neither.criteria.find((c) => c.id === 'petechiaeOrInjected')?.points).toBe(0);
  });
});

describe('neonatalSepsisPanel — history, no longer inferred from free text', () => {
  it('reads patient.abnormalPerinatalHistory, a real clinician judgement', () => {
    const abnormal = neonatalSepsisPanel(foal({ abnormalPerinatalHistory: true }), {});
    const normal = neonatalSepsisPanel(foal({ abnormalPerinatalHistory: false }), {});
    expect(abnormal.criteria.find((c) => c.id === 'perinatalHistory')?.points).toBe(2);
    expect(normal.criteria.find((c) => c.id === 'perinatalHistory')?.points).toBe(0);
  });

  it('a normal dam-history note does not score as abnormal', () => {
    // The old bug: any non-empty damHistory text, including a benign note,
    // scored 2 points. damHistory is no longer read for scoring at all.
    const p = neonatalSepsisPanel(
      foal({ damHistory: 'Normal foaling, no complications', abnormalPerinatalHistory: false }),
      {},
    );
    expect(p.criteria.find((c) => c.id === 'perinatalHistory')?.points).toBe(0);
  });

  it('is uncharted, not normal, when abnormalPerinatalHistory was never set', () => {
    const p = neonatalSepsisPanel(foal({ damHistory: 'some note' }), {});
    expect(p.criteria.find((c) => c.id === 'perinatalHistory')?.points).toBeUndefined();
  });

  it('scores prematurity from gestationalAgeDays, separately from history', () => {
    const premature = neonatalSepsisPanel(foal({ gestationalAgeDays: 300 }), {});
    const term = neonatalSepsisPanel(foal({ gestationalAgeDays: 340 }), {});
    expect(premature.criteria.find((c) => c.id === 'prematurity')?.points).toBe(2);
    expect(term.criteria.find((c) => c.id === 'prematurity')?.points).toBe(0);
  });
});

describe('neonatalSepsisPanel — overall interpretation', () => {
  it('is high risk when every confirmed point crosses 11', () => {
    const p = neonatalSepsisPanel(
      foal({ abnormalPerinatalHistory: true, gestationalAgeDays: 300 }),
      { wbc: 1000, bands: 600, toxicNeutrophils: true, fibrinogen: 900, igg: 300 },
    );
    expect(p.score.min).toBeGreaterThan(11);
    expect(p.severity).toBe('critical');
    expect(p.interpretation).toContain('high risk');
  });

  it('is normal-severity, exact, when every criterion is charted favourably', () => {
    const p = neonatalSepsisPanel(
      foal({ abnormalPerinatalHistory: false, gestationalAgeDays: 340 }),
      {
        // wbc 10,000 sits in the 8,000-12,000 gap that scores 0 (not the
        // 4,000-8,000 band, which scores 1 — see the WBC edge tests above).
        wbc: 10000,
        bands: 10,
        toxicNeutrophils: false,
        fibrinogen: 300,
        igg: 1000,
        glucose: 90,
        pao2: 80,
        paco2: 40,
        hypotonia: 'NONE',
        petechiae: false,
        mucousMembranes: 'PINK',
        temperature: 38.0,
      },
    );
    expect(p.score).toEqual({ min: 0, max: 0, isExact: true });
    expect(p.severity).toBe('normal');
    expect(p.interpretation).toContain('below the equivocal band');
  });

  it('has no interpretation when nothing at all is charted', () => {
    const p = neonatalSepsisPanel(foal(), {});
    expect(p.interpretation).toBeUndefined();
    expect(p.score).toEqual({ min: 0, max: 27, isExact: false });
  });

  it('the neonatal SIRS count is not duplicated here — this panel only scores the Brewer & Koterba items', () => {
    const p = neonatalSepsisPanel(foal(), { temperature: 40, heartRate: 130, respiratoryRate: 60, wbc: 15000 });
    // heartRate and respiratoryRate feed neonatalSirsPanel, not this one —
    // confirm this panel has no criterion reading them.
    expect(p.criteria.some((c) => c.id === 'heartRate' || c.id === 'respiratoryRate')).toBe(false);
  });
});
