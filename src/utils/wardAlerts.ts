import type { Patient } from '../types';
import { columnsInCurrentAdmission, latestColumn } from './admission';
import { evaluateCallSurgeonTriggers, type ClinicalTrigger } from './callSurgeonTriggers';
import { nsaidGivenWithin } from './nsaid';
import { COMPLICATION_META, orTierFor, type OrTier } from '../data/complications';

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

const rank: Record<ClinicalTrigger['severity'], number> = { critical: 3, warning: 2, watch: 1 };

/** The single most severe trigger, for a one-line reason on the card. */
export function topTrigger(triggers: ClinicalTrigger[]): ClinicalTrigger | undefined {
  return [...triggers].sort((a, b) => rank[b.severity] - rank[a.severity])[0];
}

const OR_TIER_TO_SEVERITY: Partial<Record<OrTier, ClinicalTrigger['severity']>> = {
  CRITICAL: 'critical',
  ALERT: 'warning',
  WATCH: 'watch',
};

/**
 * Open complications feed the same trigger list a Flowsheet reads, ranked
 * by Loomes et al. 2025's odds ratio rather than by prevalence — see
 * `data/complications.ts`. A complication with no published elective-surgery
 * comparator (`NOT_ESTABLISHED`) produces no trigger; there is nothing to
 * rank it against.
 */
function complicationTriggers(patient: Patient): ClinicalTrigger[] {
  return (patient.complications ?? [])
    .filter((c) => !c.resolvedAt)
    .map((c): ClinicalTrigger | undefined => {
      const severity = OR_TIER_TO_SEVERITY[orTierFor(c.complicationId)];
      if (!severity) return undefined;
      return {
        id: `complication-${c.id}`,
        label: COMPLICATION_META[c.complicationId].label,
        evidence: 'Open complication charted this stay',
        rule: 'Loomes et al. 2025 — odds ratio vs. elective surgery',
        severity,
      };
    })
    .filter((t): t is ClinicalTrigger => t !== undefined);
}

export function wardAlert(patient: Patient): WardAlert {
  const scoped = columnsInCurrentAdmission(patient);
  const latest = latestColumn(patient);
  const previous = scoped.length > 1 ? scoped[scoped.length - 2] : undefined;
  const at = latest?.recordedAt ? new Date(latest.recordedAt) : new Date();
  const nsaidRecently = nsaidGivenWithin(patient, at, 4);
  const triggers = [
    ...evaluateCallSurgeonTriggers(latest, undefined, previous, nsaidRecently),
    ...complicationTriggers(patient),
  ];

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
