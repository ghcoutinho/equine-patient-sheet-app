import type { FlowsheetEntry, Patient } from '../types';
import { calculateScoreBounds } from './missingDataHandler';
import type { Criterion, ScorePanel } from './intelligence';

/**
 * Brewer & Koterba's neonatal sepsis score (Equine Vet J 1988, 20(1):18-22),
 * implemented as a ScorePanel — the same shape as sirsPanel, casPanel and
 * foalSurvivalPanel — rather than the standalone result type this used to
 * return, so it renders through the one shared ScorePanelCard instead of
 * needing its own display.
 *
 * This file previously carried its own copy of the neonatal SIRS count
 * (temperature/heart rate/respiratory rate/WBC). That was a second,
 * independent implementation of exactly what neonatalSirsPanel already
 * computes — dropped here rather than kept as a duplicate.
 *
 * Band neutrophils used to guess whether the charted value was an absolute
 * count or a percentage ("if bands is charted under 50, assume it's a
 * percentage of the total; otherwise assume absolute") because nothing
 * upstream told it which. That guess is gone: entry.bands is now always an
 * absolute cells/µL count, converted at the same K/µL boundary as WBC (see
 * wbcPerMicrolitre in intelligence.ts) before it ever reaches this file.
 *
 * The history item previously scored any non-empty patient.damHistory text
 * as an abnormal finding — including a normal foaling note, since the check
 * was presence-of-text, not content. It now reads
 * patient.abnormalPerinatalHistory, a clinician judgement entered
 * separately, and is split into two criteria (perinatal history,
 * prematurity) instead of one opaque combined score, so the ledger shows
 * which one actually contributed.
 */
export function neonatalSepsisPanel(patient: Patient, entry: Partial<FlowsheetEntry>): ScorePanel {
  const criteria: Criterion[] = [
    {
      id: 'wbc',
      label: 'White cell count',
      maxPoints: 3,
      rule: '< 2,000 = 3 · 2,000–4,000 = 2 · 4,000–8,000 or > 12,000 = 1',
      evidence: entry.wbc === undefined ? undefined : `${entry.wbc} /µL`,
      points:
        entry.wbc === undefined
          ? undefined
          : entry.wbc < 2000
            ? 3
            : entry.wbc < 4000
              ? 2
              : (entry.wbc >= 4000 && entry.wbc <= 8000) || entry.wbc > 12000
                ? 1
                : 0,
    },
    {
      id: 'bands',
      label: 'Band neutrophils',
      maxPoints: 3,
      rule: '> 500 = 3 · 200–500 = 2 · 50–200 = 1 /µL',
      evidence: entry.bands === undefined ? undefined : `${entry.bands} /µL`,
      points:
        entry.bands === undefined
          ? undefined
          : entry.bands > 500
            ? 3
            : entry.bands >= 200
              ? 2
              : entry.bands >= 50
                ? 1
                : 0,
    },
    {
      id: 'toxicNeutrophils',
      label: 'Toxic neutrophils',
      maxPoints: 2,
      rule: 'Present = 2',
      evidence: entry.toxicNeutrophils === undefined ? undefined : entry.toxicNeutrophils ? 'present' : 'absent',
      points: entry.toxicNeutrophils === undefined ? undefined : entry.toxicNeutrophils ? 2 : 0,
    },
    {
      id: 'fibrinogen',
      label: 'Fibrinogen',
      maxPoints: 2,
      rule: '> 800 = 2 · 500–800 = 1 mg/dL',
      evidence: entry.fibrinogen === undefined ? undefined : `${entry.fibrinogen} mg/dL`,
      points:
        entry.fibrinogen === undefined
          ? undefined
          : entry.fibrinogen > 800
            ? 2
            : entry.fibrinogen >= 500
              ? 1
              : 0,
    },
    {
      id: 'igg',
      label: 'IgG',
      maxPoints: 4,
      rule: '< 400 = 4 · 400–800 = 2 mg/dL',
      evidence: entry.igg === undefined ? undefined : `${entry.igg} mg/dL`,
      points:
        entry.igg === undefined
          ? undefined
          : entry.igg < 400
            ? 4
            : entry.igg <= 800
              ? 2
              : 0,
    },
    {
      id: 'glucose',
      label: 'Blood glucose',
      maxPoints: 2,
      rule: '< 40 = 2 · 40–80 = 1 mg/dL',
      evidence: entry.glucose === undefined ? undefined : `${entry.glucose} mg/dL`,
      points:
        entry.glucose === undefined
          ? undefined
          : entry.glucose < 40
            ? 2
            : entry.glucose <= 80
              ? 1
              : 0,
    },
    {
      id: 'bloodGas',
      label: 'Blood gas',
      maxPoints: 1,
      rule: 'PaO2 < 60 or PaCO2 > 50 = 1',
      evidence:
        entry.pao2 === undefined || entry.paco2 === undefined
          ? undefined
          : `PaO2 ${entry.pao2} · PaCO2 ${entry.paco2} mmHg`,
      // Brewer & Koterba's blood-gas item needs both values together — a
      // PaO2 alone can't rule the item out, so it stays uncharted rather
      // than scoring 0 on a single value.
      points:
        entry.pao2 === undefined || entry.paco2 === undefined
          ? undefined
          : entry.pao2 < 60 || entry.paco2 > 50
            ? 1
            : 0,
    },
    {
      id: 'hypotonia',
      label: 'Muscle tone',
      maxPoints: 3,
      rule: 'Severe = 3 · mild = 1',
      evidence: entry.hypotonia === undefined ? undefined : entry.hypotonia.toLowerCase(),
      points:
        entry.hypotonia === undefined
          ? undefined
          : entry.hypotonia === 'SEVERE'
            ? 3
            : entry.hypotonia === 'MILD'
              ? 1
              : 0,
    },
    {
      id: 'petechiaeOrInjected',
      label: 'Petechiae or injected membranes',
      maxPoints: 2,
      rule: 'Either present = 2',
      evidence:
        entry.petechiae === undefined && entry.mucousMembranes === undefined
          ? undefined
          : entry.petechiae || entry.mucousMembranes === 'INJECTED'
            ? 'present'
            : 'absent',
      points:
        entry.petechiae === undefined && entry.mucousMembranes === undefined
          ? undefined
          : entry.petechiae || entry.mucousMembranes === 'INJECTED'
            ? 2
            : 0,
    },
    {
      id: 'temperature',
      label: 'Temperature',
      maxPoints: 1,
      rule: '> 38.6 °C or < 37.2 °C = 1',
      evidence: entry.temperature === undefined ? undefined : `${entry.temperature} °C`,
      points:
        entry.temperature === undefined
          ? undefined
          : entry.temperature > 38.6 || entry.temperature < 37.2
            ? 1
            : 0,
    },
    {
      id: 'perinatalHistory',
      label: 'Perinatal history',
      maxPoints: 2,
      rule: 'Abnormal history = 2',
      evidence:
        patient.abnormalPerinatalHistory === undefined
          ? undefined
          : patient.abnormalPerinatalHistory
            ? 'abnormal'
            : 'normal',
      points:
        patient.abnormalPerinatalHistory === undefined
          ? undefined
          : patient.abnormalPerinatalHistory
            ? 2
            : 0,
    },
    {
      id: 'prematurity',
      label: 'Prematurity',
      maxPoints: 2,
      rule: '< 320 days gestation = 2',
      evidence: patient.gestationalAgeDays === undefined ? undefined : `${patient.gestationalAgeDays} days`,
      points:
        patient.gestationalAgeDays === undefined
          ? undefined
          : patient.gestationalAgeDays < 320
            ? 2
            : 0,
    },
  ];

  const score = calculateScoreBounds(
    criteria.map((c) => ({ value: c.points, min: 0, max: c.maxPoints })),
  );
  const charted = criteria.filter((c) => c.points !== undefined).length;
  const highRisk = score.min > 11;
  const equivocal = !highRisk && score.max >= 7;

  return {
    id: 'neonatal-sepsis',
    title: 'Neonatal sepsis score',
    source: 'Brewer & Koterba 1988 (Equine Vet J 20(1):18-22)',
    score,
    criteria,
    severity: highRisk ? 'critical' : equivocal ? 'warning' : 'normal',
    interpretation:
      charted === 0
        ? undefined
        : highRisk
          ? `${score.min}/27 — above 11, high risk on the published screen.`
          : equivocal
            ? `${score.min}–${score.max}/27 — could reach the ≥ 7 equivocal band on uncharted criteria.`
            : `${score.min}–${score.max}/27 — below the equivocal band on what is charted.`,
    note: score.isExact
      ? undefined
      : 'Range reflects criteria that have not been charted this round.',
  };
}
