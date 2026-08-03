import { describe, it, expect } from 'vitest';
import type { FlowsheetColumn, FlowsheetEntry, Patient } from '../../types';
import { columnToEntry, casPanel, sirsPanel } from '../intelligence';

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

describe('columnToEntry — total calcium from the lab panel, not the round', () => {
  it('sources calcium from the most recently collected panel', () => {
    const p = patient({
      labPanels: [
        { id: 'l1', collectedAt: '2026-07-30T08:00:00Z', values: { lab_calcium: 12.5 } },
        { id: 'l2', collectedAt: '2026-07-31T08:00:00Z', values: { lab_calcium: 9.5 } },
      ],
    });
    expect(columnToEntry(p, column()).calcium).toBe(9.5);
  });

  it('is undefined with no lab panel on file, not zero', () => {
    expect(columnToEntry(patient(), column()).calcium).toBeUndefined();
  });

  it('does not read the round\'s ionised calcium as total calcium', () => {
    // ionizedCalcium is mmol/L; feeding it into a total-calcium (mg/dL)
    // threshold would misclassify every patient charted with it.
    const e = columnToEntry(patient(), column({ labs: { ionizedCalcium: 1.3 } }));
    expect(e.calcium).toBeUndefined();
  });
});

describe('columnToEntry — biomarkers sourced from the lab panel', () => {
  const withPanel = (values: Record<string, number>) =>
    patient({ labPanels: [{ id: 'l1', collectedAt: '2026-07-31T08:00:00Z', values }] });

  it('sources SAA and NGAL directly from the panel', () => {
    const e = columnToEntry(withPanel({ lab_saa: 1300, lab_ngal: 900 }), column());
    expect(e.saa).toBe(1300);
    expect(e.ngal).toBe(900);
  });

  it('sources RPR as the already-derived RDW:platelet ratio, not re-divided here', () => {
    const e = columnToEntry(withPanel({ lab_rdw: 20, lab_platelets: 150 }), column());
    expect(e.rpr).toBe(0.133);
  });

  it('are all undefined with no lab panel on file', () => {
    const e = columnToEntry(patient(), column());
    expect(e.saa).toBeUndefined();
    expect(e.ngal).toBeUndefined();
    expect(e.rpr).toBeUndefined();
  });
});

describe('columnToEntry — bands, fibrinogen and blood gas from the lab panel', () => {
  const withPanel = (values: Record<string, number>) =>
    patient({ labPanels: [{ id: 'l1', collectedAt: '2026-07-31T08:00:00Z', values }] });

  it('converts band neutrophils from K/µL to /µL, same as WBC', () => {
    const e = columnToEntry(withPanel({ lab_neuts_band: 0.6 }), column());
    expect(e.bands).toBe(600);
  });

  it('passes fibrinogen and blood gas through in their charted units', () => {
    const e = columnToEntry(withPanel({ lab_fibrinogen: 900, lab_po2: 55, lab_pco2: 58 }), column());
    expect(e.fibrinogen).toBe(900);
    expect(e.pao2).toBe(55);
    expect(e.paco2).toBe(58);
  });

  it('stay undefined rather than zero with no panel on file', () => {
    const e = columnToEntry(patient(), column());
    expect(e.bands).toBeUndefined();
    expect(e.fibrinogen).toBeUndefined();
    expect(e.pao2).toBeUndefined();
    expect(e.paco2).toBeUndefined();
  });
});

describe('columnToEntry — neonatal exam findings', () => {
  it('maps cold extremities, hypotonia and petechiae from the round', () => {
    const e = columnToEntry(
      patient(),
      column({
        neonatal: { coldExtremities: true, hypotonia: 'SEVERE', petechiae: true },
      }),
    );
    expect(e.coldExtremities).toBe(true);
    expect(e.hypotonia).toBe('SEVERE');
    expect(e.petechiae).toBe(true);
  });

  it('respects a charted "warm"/"no petechiae" rather than treating false as missing', () => {
    const e = columnToEntry(
      patient(),
      column({ neonatal: { coldExtremities: false, petechiae: false } }),
    );
    expect(e.coldExtremities).toBe(false);
    expect(e.petechiae).toBe(false);
  });

  it('reduces infectious sites to a count for the scoring engines', () => {
    const e = columnToEntry(
      patient(),
      column({
        neonatal: { infectiousSites: ['Umbilicus (omphalophlebitis)', 'Joint (septic arthritis)'] },
      }),
    );
    expect(e.infectiousSitesCount).toBe(2);
  });

  it('is undefined, not zero, when the neonatal section was never charted', () => {
    const e = columnToEntry(patient(), column());
    expect(e.coldExtremities).toBeUndefined();
    expect(e.hypotonia).toBeUndefined();
    expect(e.petechiae).toBeUndefined();
    expect(e.infectiousSitesCount).toBeUndefined();
  });
});

describe('columnToEntry — WBC is charted in K/µL and scored in cells/µL', () => {
  it('converts a charted 9.0 K/µL to 9,000 cells/µL', () => {
    const e = columnToEntry(patient(), column({ labs: { wbc: 9.0 } }));
    expect(e.wbc).toBe(9000);
  });

  it('a normal 9.0 K/µL does NOT read as leukopenic', () => {
    // The trap: mapped without conversion, 9 would fall under the < 5,000
    // SIRS threshold and score every ordinary patient as profoundly
    // leukopenic. This is the assertion that fails if the conversion is
    // ever removed.
    const e = columnToEntry(patient({ isFoal: false }), column({ labs: { wbc: 9.0 } }));
    const wbcCriterion = sirsPanel(e).criteria.find((c) => c.id === 'wbc');
    expect(wbcCriterion?.points).toBe(0);
  });

  it('a genuinely leukopenic 4.0 K/µL does score the SIRS criterion', () => {
    const e = columnToEntry(patient({ isFoal: false }), column({ labs: { wbc: 4.0 } }));
    expect(e.wbc).toBe(4000);
    expect(sirsPanel(e).criteria.find((c) => c.id === 'wbc')?.points).toBe(1);
  });

  it('a leukocytosis of 13.0 K/µL scores it too', () => {
    const e = columnToEntry(patient({ isFoal: false }), column({ labs: { wbc: 13.0 } }));
    expect(sirsPanel(e).criteria.find((c) => c.id === 'wbc')?.points).toBe(1);
  });

  it('falls back to the lab panel when the round has no WBC', () => {
    const p = patient({
      labPanels: [
        { id: 'l1', collectedAt: '2026-07-31T08:00:00Z', values: { lab_wbc: 6.2 } },
      ],
    });
    expect(columnToEntry(p, column()).wbc).toBe(6200);
  });

  it('prefers the round over the lab panel, the round being fresher', () => {
    const p = patient({
      labPanels: [
        { id: 'l1', collectedAt: '2026-07-31T08:00:00Z', values: { lab_wbc: 6.2 } },
      ],
    });
    expect(columnToEntry(p, column({ labs: { wbc: 11.0 } })).wbc).toBe(11000);
  });

  it('stays uncharted rather than scoring as normal when nowhere has it', () => {
    const e = columnToEntry(patient({ isFoal: false }), column());
    expect(e.wbc).toBeUndefined();
    const panel = sirsPanel(e);
    expect(panel.criteria.find((c) => c.id === 'wbc')?.points).toBeUndefined();
    expect(panel.score.isExact).toBe(false);
  });

  it('respects a charted zero', () => {
    expect(columnToEntry(patient(), column({ labs: { wbc: 0 } })).wbc).toBe(0);
  });
});

describe('casPanel — Farrell et al. 2021 colic assessment score', () => {
  const entry = (over: Partial<FlowsheetEntry> = {}): Partial<FlowsheetEntry> => ({
    heartRate: 40,
    respiratoryRate: 12,
    calcium: 12.0,
    lactate: 1.0,
    abdominalUltrasound: 'NORMAL',
    rectalExam: 'NORMAL',
    ...over,
  });

  it('scores every criterion favourably as 0/12, predicting survival', () => {
    const p = casPanel(entry());
    expect(p.score).toEqual({ min: 0, max: 0, isExact: true });
    expect(p.severity).toBe('normal');
    expect(p.interpretation).toContain('predicting survival');
  });

  it('bands heart rate at the published edges', () => {
    const points = (hr: number) => casPanel(entry({ heartRate: hr })).criteria[0].points;
    expect(points(45)).toBe(0);
    expect(points(46)).toBe(1);
    expect(points(60)).toBe(1);
    expect(points(61)).toBe(2);
  });

  it('bands respiratory rate at the published edges', () => {
    const points = (rr: number) => casPanel(entry({ respiratoryRate: rr })).criteria[1].points;
    expect(points(16)).toBe(0);
    expect(points(17)).toBe(1);
    expect(points(28)).toBe(1);
    expect(points(29)).toBe(2);
  });

  it('bands total calcium inverted — low calcium is the adverse finding', () => {
    const points = (ca: number) => casPanel(entry({ calcium: ca })).criteria[2].points;
    expect(points(11.9)).toBe(0);
    expect(points(11.8)).toBe(1);
    expect(points(10.6)).toBe(1);
    expect(points(10.5)).toBe(2);
  });

  it('closes the lactate table\'s printed gap at > 2 mmol/L', () => {
    const points = (lac: number) => casPanel(entry({ lactate: lac })).criteria[3].points;
    expect(points(2)).toBe(0);
    expect(points(2.01)).toBe(2);
  });

  it('scores an abnormal ultrasound or rectal exam at the full 2 points', () => {
    expect(casPanel(entry({ abdominalUltrasound: 'ABNORMAL' })).criteria[4].points).toBe(2);
    expect(casPanel(entry({ rectalExam: 'ABNORMAL' })).criteria[5].points).toBe(2);
  });

  it('predicts non-survival once every criterion is charted worst-case: 12/12', () => {
    const p = casPanel(
      entry({
        heartRate: 90,
        respiratoryRate: 40,
        calcium: 8.0,
        lactate: 5.0,
        abdominalUltrasound: 'ABNORMAL',
        rectalExam: 'ABNORMAL',
      }),
    );
    expect(p.score).toEqual({ min: 12, max: 12, isExact: true });
    expect(p.severity).toBe('critical');
    expect(p.interpretation).toContain('non-survival');
  });

  it('sits exactly on the cutoff at 7/12 and still predicts survival — cutoff is > 7', () => {
    // HR 61 (2) + RR 29 (2) + calcium 10.5 (2) + lactate 2.5 (2) = 8, too high;
    // build exactly 7 instead: HR 61 (2) + RR 29 (2) + calcium 10.6 (1) + abnormal
    // rectal (2) = 7, everything else favourable.
    const p = casPanel(
      entry({
        heartRate: 61,
        respiratoryRate: 29,
        calcium: 10.6,
        lactate: 1.0,
        abdominalUltrasound: 'NORMAL',
        rectalExam: 'ABNORMAL',
      }),
    );
    expect(p.score).toEqual({ min: 7, max: 7, isExact: true });
    expect(p.severity).toBe('normal');
    expect(p.interpretation).toContain('predicting survival');
  });

  it('widens the range and does not score a missing criterion as favourable', () => {
    const p = casPanel({ heartRate: 40, respiratoryRate: 12 });
    // calcium, lactate, ultrasound, rectal all uncharted: 0 + 0 + [0,2]*4
    expect(p.score).toEqual({ min: 0, max: 8, isExact: false });
    expect(p.note).toContain('not been charted');
  });

  it('is indeterminate when missing data straddles the cutoff', () => {
    // Only heart rate charted at the worst band: min could stay at 2, max
    // could reach 2 + 2*5 = 12, straddling the > 7 cutoff either way.
    const p = casPanel({ heartRate: 61 });
    expect(p.score.min).toBeLessThanOrEqual(7);
    expect(p.score.max).toBeGreaterThan(7);
    expect(p.severity).toBe('warning');
    expect(p.interpretation).toContain('either side of the cutoff');
  });
});
