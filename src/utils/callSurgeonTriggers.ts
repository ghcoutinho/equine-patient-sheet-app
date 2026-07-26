import type { FlowsheetColumn, TriggerThresholds } from '../types';
import { summariseGutSounds } from './gutSounds';
import { severityOf } from '../data/clinicalAssessments';

/**
 * "Call the surgeon" escalation engine.
 *
 * Ported from the Colic Monitoring Tool, which evaluated eleven hard triggers
 * against the charted round. Every trigger here is a threshold on a value the
 * clinician actually recorded — nothing is inferred, and a trigger is never
 * raised from absent data.
 *
 * Clinical decision support only. These are ward escalation rules, not a
 * validated outcome model, and they are labelled as such wherever displayed.
 */

export const DEFAULT_TRIGGER_THRESHOLDS: TriggerThresholds = {
  heartRateBpm: 60,
  respRateBpm: 30,
  refluxLiters: 2,
  painScore: 2,
  lactateMmolL: 4,
  temperatureC: 38.5,
};

export interface ClinicalTrigger {
  id: string;
  label: string;
  /** What was charted, verbatim, so the clinician can see the evidence. */
  evidence: string;
  /** The rule that fired. */
  rule: string;
  severity: 'warning' | 'critical';
}

/** True only for real, finite numbers — a charted 0 counts, an empty cell does not. */
const has = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function evaluateCallSurgeonTriggers(
  column: FlowsheetColumn | undefined,
  thresholds: TriggerThresholds = DEFAULT_TRIGGER_THRESHOLDS,
): ClinicalTrigger[] {
  if (!column) return [];
  const t = thresholds;
  const out: ClinicalTrigger[] = [];

  // 1 — Tachycardia
  if (has(column.vitals.heartRate) && column.vitals.heartRate > t.heartRateBpm) {
    out.push({
      id: 'hr',
      label: 'Tachycardia',
      evidence: `HR ${column.vitals.heartRate} bpm`,
      rule: `> ${t.heartRateBpm} bpm`,
      severity: 'critical',
    });
  }

  // 2 — Tachypnoea
  if (has(column.vitals.respiratoryRate) && column.vitals.respiratoryRate > t.respRateBpm) {
    out.push({
      id: 'rr',
      label: 'Tachypnoea',
      evidence: `RR ${column.vitals.respiratoryRate} brpm`,
      rule: `> ${t.respRateBpm} brpm`,
      severity: 'warning',
    });
  }

  // 3 — Pyrexia (°C only; foals are charted in °F and are excluded here)
  if (has(column.vitals.temperatureC) && column.vitals.temperatureC > t.temperatureC) {
    out.push({
      id: 'temp',
      label: 'Pyrexia',
      evidence: `Temp ${column.vitals.temperatureC} °C`,
      rule: `> ${t.temperatureC} °C`,
      severity: 'warning',
    });
  }

  // 4 — Net gastric reflux
  if (has(column.gi.refluxVolumeL) && column.gi.refluxVolumeL >= t.refluxLiters) {
    out.push({
      id: 'reflux',
      label: 'Significant gastric reflux',
      evidence: `${column.gi.refluxVolumeL} L net reflux`,
      rule: `≥ ${t.refluxLiters} L`,
      severity: 'critical',
    });
  }

  // 5 — Pain score
  if (has(column.pain?.score) && (column.pain?.score as number) >= t.painScore) {
    out.push({
      id: 'pain',
      label: 'Uncontrolled pain',
      evidence: `Pain score ${column.pain?.score}/3`,
      rule: `≥ ${t.painScore}/3`,
      severity: 'critical',
    });
  }

  // 6 — Refractory response to medical therapy
  if (severityOf('responseToTherapy', column.gi.responseToTherapy) === 'critical') {
    out.push({
      id: 'refractory',
      label: 'Refractory to medical therapy',
      evidence: column.gi.responseToTherapy as string,
      rule: 'Refractory or deteriorating',
      severity: 'critical',
    });
  }

  // 7 — Gut sounds absent in every quadrant
  if (column.gi.gutSounds) {
    const summary = summariseGutSounds(column.gi.gutSounds);
    if (summary.activeQuadrants === 0) {
      out.push({
        id: 'gut-sounds',
        label: 'Absent gut sounds',
        evidence: summary.label,
        rule: 'No audible motility in any quadrant',
        severity: 'critical',
      });
    }
  }

  // 8 — Rectal examination
  if (severityOf('rectalExam', column.gi.rectalExam) === 'critical') {
    out.push({
      id: 'rectal',
      label: 'Rectal finding',
      evidence: column.gi.rectalExam as string,
      rule: 'Strangulating or obstructive finding',
      severity: 'critical',
    });
  }

  // 9 — FLASH ultrasound
  if (severityOf('flashUltrasound', column.gi.flashUltrasound) === 'critical') {
    out.push({
      id: 'flash',
      label: 'FLASH ultrasound finding',
      evidence: column.gi.flashUltrasound as string,
      rule: 'Distended SI loops or free peritoneal fluid',
      severity: 'critical',
    });
  }

  // 10 — Peritoneal fluid
  if (severityOf('peritonealFluid', column.gi.peritonealFluid) === 'critical') {
    out.push({
      id: 'peritoneal',
      label: 'Peritoneal fluid appearance',
      evidence: column.gi.peritonealFluid as string,
      rule: 'Serosanguineous, frank blood or enterocentesis',
      severity: 'critical',
    });
  }

  // 11 — Lactate
  const lactate = column.labs.lactate;
  if (has(lactate) && lactate >= t.lactateMmolL) {
    out.push({
      id: 'lactate',
      label: 'Hyperlactataemia',
      evidence: `Lactate ${lactate} mmol/L`,
      rule: `≥ ${t.lactateMmolL} mmol/L`,
      severity: 'critical',
    });
  }

  // Laminitis watch — supportive, not a surgical call
  if (severityOf('digitalPulse', column.laminitis?.digitalPulse) === 'critical') {
    out.push({
      id: 'digital-pulse',
      label: 'Bounding digital pulses',
      evidence: column.laminitis?.digitalPulse as string,
      rule: 'Laminitis watch',
      severity: 'warning',
    });
  }
  if (has(column.laminitis?.obelGrade) && (column.laminitis?.obelGrade as number) >= 2) {
    out.push({
      id: 'obel',
      label: 'Laminitis',
      evidence: `Obel grade ${column.laminitis?.obelGrade}/4`,
      rule: '≥ grade 2',
      severity: 'warning',
    });
  }

  return out;
}

/** Convenience: the most recent round of a patient's history. */
export function latestColumn(history: FlowsheetColumn[]): FlowsheetColumn | undefined {
  return history.length > 0 ? history[history.length - 1] : undefined;
}
