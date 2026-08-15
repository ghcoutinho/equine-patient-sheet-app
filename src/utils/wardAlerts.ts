import type { Patient } from '../types';
import { columnsInCurrentAdmission, latestColumn } from './admission';
import { evaluateCallSurgeonTriggers, type ClinicalTrigger } from './callSurgeonTriggers';

/**
 * Ward-wide deterioration alerts.
 *
 * `patient.status`/`statusLabel` on the dashboard were static — set once in
 * sample data (`status: 'CRITICAL'`, `statusLabel: 'SIRS ALERT'`) and never
 * recomputed by anything, the same class of defect rule 1 exists to prevent.
 * A patient's card stayed red or amber forever regardless of what was
 * actually charted. This computes real severity from the same
 * call-surgeon-trigger engine a patient's own Flowsheet already reads — the
 * HR-rising trigger among them — so the ward view surfaces deterioration
 * without anyone having to open each patient individually.
 */

export type WardSeverity = 'critical' | 'warning' | 'normal';

export interface WardAlert {
  patient: Patient;
  severity: WardSeverity;
  triggers: ClinicalTrigger[];
}

const rank: Record<ClinicalTrigger['severity'], number> = { critical: 2, warning: 1 };

/** The single most severe trigger, for a one-line reason on the card. */
export function topTrigger(triggers: ClinicalTrigger[]): ClinicalTrigger | undefined {
  return [...triggers].sort((a, b) => rank[b.severity] - rank[a.severity])[0];
}

export function wardAlert(patient: Patient): WardAlert {
  const scoped = columnsInCurrentAdmission(patient);
  const latest = latestColumn(patient);
  const previous = scoped.length > 1 ? scoped[scoped.length - 2] : undefined;
  const triggers = evaluateCallSurgeonTriggers(latest, undefined, previous);

  const severity: WardSeverity =
    patient.sirsCriteriaMet || triggers.some((t) => t.severity === 'critical')
      ? 'critical'
      : triggers.some((t) => t.severity === 'warning')
        ? 'warning'
        : 'normal';

  return { patient, severity, triggers };
}

/** One alert per patient currently being cared for — not a pre-registered or discharged/archived record. */
export function wardAlerts(patients: Patient[]): WardAlert[] {
  return patients
    .filter((p) => (p.lifecycle ?? 'ACTIVE') === 'ACTIVE')
    .map(wardAlert);
}
