import type { FlowsheetColumn, TriggerThresholds } from '../types';
import { summariseGutSounds } from './gutSounds';
import { severityOf } from '../data/clinicalAssessments';
import {
  plasmaLactateBand,
  PLASMA_LACTATE_BANDS,
  PERITONEAL_LACTATE,
  comparePeritonealLactate,
  PCV_TP,
  readPcvTp,
  readReflux,
  REFLUX,
  readHeartRate,
} from '../data/colicThresholds';

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
  // Reported significance threshold for net gastric reflux.
  refluxLiters: REFLUX.significantAbove,
  painScore: 2,
  // Superseded by the published survival bands, kept only for callers that
  // still pass a custom threshold object.
  lactateMmolL: PLASMA_LACTATE_BANDS.allLivedBelow,
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
  /** The round before this one. Needed for every trend-based trigger. */
  previous?: FlowsheetColumn,
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

  // 4 — Net gastric reflux. Volume changes the interpretation, not just the
  // alarm level: the 10–20 L band is reported for proximal enteritis, where a
  // celiotomy is the wrong operation.
  const refluxRead = readReflux(
    has(column.gi.refluxVolumeL) ? column.gi.refluxVolumeL : undefined,
  );
  if (refluxRead?.suggestsDpj) {
    out.push({
      id: 'reflux',
      label: 'Reflux in the proximal enteritis band',
      evidence: `${refluxRead.litres} L net reflux`,
      rule: `≥ ${REFLUX.dpjRangeLow} L — separate enteritis from strangulation before operating`,
      severity: 'critical',
    });
  } else if (refluxRead?.significant) {
    out.push({
      id: 'reflux',
      label: 'Significant gastric reflux',
      evidence: `${refluxRead.litres} L net reflux`,
      rule: `≥ ${REFLUX.significantAbove} L`,
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

  // 11 — Plasma lactate, read as a published survival band rather than a
  // single line. Below 3.6 every horse in the reported series survived; above
  // 7.0 none did; between them the number does not decide the case.
  const lactate = column.labs.lactate;
  const band = plasmaLactateBand(has(lactate) ? lactate : undefined);
  if (band === 'DIED') {
    out.push({
      id: 'lactate',
      label: 'Lactate above the reported survival ceiling',
      evidence: `Lactate ${lactate} mmol/L`,
      rule: `> ${PLASMA_LACTATE_BANDS.allDiedAbove} mmol/L — no survivor reported above this`,
      severity: 'critical',
    });
  } else if (band === 'UNCERTAIN') {
    out.push({
      id: 'lactate',
      label: 'Lactate in the indeterminate band',
      evidence: `Lactate ${lactate} mmol/L`,
      rule: `${PLASMA_LACTATE_BANDS.allLivedBelow}–${PLASMA_LACTATE_BANDS.allDiedAbove} mmol/L — survivors and non-survivors both reported`,
      severity: 'warning',
    });
  }

  // 12 — Peritoneal fluid lactate, absolute and against plasma. The comparison
  // is the more specific finding and fires even when both values are modest.
  const pfl = column.labs.peritonealLactate;
  if (has(pfl) && pfl > PERITONEAL_LACTATE.noSurvivorAbove) {
    out.push({
      id: 'peritoneal-lactate',
      label: 'Peritoneal lactate above the reported survival ceiling',
      evidence: `Peritoneal lactate ${pfl} mmol/L`,
      rule: `> ${PERITONEAL_LACTATE.noSurvivorAbove} mmol/L — no survivor reported above this`,
      severity: 'critical',
    });
  }
  const cmp = comparePeritonealLactate(
    has(pfl) ? pfl : undefined,
    has(lactate) ? lactate : undefined,
  );
  if (cmp?.exceedsPlasma) {
    out.push({
      id: 'pfl-gradient',
      label: 'Peritoneal lactate exceeds plasma',
      evidence: `Peritoneal ${cmp.peritoneal} vs plasma ${cmp.plasma} mmol/L (+${cmp.gradient})`,
      rule: 'Peritoneal > plasma — reported indicator of strangulated small intestine',
      severity: 'critical',
    });
  }

  // 13 — Haemoconcentration and PCV/TP splitting.
  const pcvTp = readPcvTp(
    has(column.labs.pcv) ? column.labs.pcv : undefined,
    has(column.labs.tp) ? column.labs.tp : undefined,
    has(previous?.labs?.pcv) ? previous?.labs?.pcv : undefined,
    has(previous?.labs?.tp) ? previous?.labs?.tp : undefined,
  );
  if (pcvTp?.splitting) {
    out.push({
      id: 'pcv-tp-split',
      label: 'PCV / TP splitting',
      evidence: `PCV ${pcvTp.pcv}% rising, TP ${pcvTp.tp} g/dL falling`,
      rule: 'PCV up with TP down — protein loss, not simple dehydration',
      severity: 'critical',
    });
  } else if (pcvTp?.pcvGrave) {
    out.push({
      id: 'pcv',
      label: 'Marked haemoconcentration',
      evidence: `PCV ${pcvTp.pcv}%`,
      rule: `> ${PCV_TP.graveAbove}%`,
      severity: 'critical',
    });
  }

  // 14 — Heart rate direction. A rate that climbs under treatment is the
  // adverse finding whatever its absolute value, and nothing read the
  // derivative before.
  const hrRead = readHeartRate(
    has(column.vitals.heartRate) ? column.vitals.heartRate : undefined,
    has(previous?.vitals?.heartRate) ? previous?.vitals?.heartRate : undefined,
  );
  if (hrRead?.trajectory === 'RISING') {
    out.push({
      id: 'hr-rising',
      label: 'Heart rate climbing',
      evidence: `${hrRead.previous} → ${hrRead.current} bpm`,
      rule: 'Rising across consecutive rounds',
      severity: hrRead.severity === 'critical' ? 'critical' : 'warning',
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
