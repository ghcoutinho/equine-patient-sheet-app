import type { Patient, FlowsheetColumn } from '../types';

/**
 * The current admission boundary.
 *
 * Patients don't get a separate Episode entity here — flowsheetHistory,
 * treatments and labPanels all still live flat on Patient, keyed only to the
 * horse. Splitting them out into a real per-episode structure is a bigger
 * restructure than a single-device, single-clinician tool needs today, and
 * every view that reads them would have to change at once to follow.
 *
 * What was actually missing was narrower: nothing marked where one stay
 * ended and the next began. `PatientManagementView`'s "Reactivate" button
 * already existed and just flipped `lifecycle` back to `'ACTIVE'` — so a
 * horse discharged in May and readmitted in August would resume charting
 * onto the same continuous `flowsheetHistory`, and the "most recent round"
 * every scoring panel, trigger and "Prev:" reference reads from could be
 * three months stale with nothing saying so.
 *
 * `currentAdmissionStartedAt` is that boundary — set once on admission and
 * again on every reactivation, never touched otherwise. Nothing before it is
 * deleted (nothing in this app deletes charted history); it's just not
 * "current" by default, the same way discharge/archive already preserve the
 * whole record rather than removing it.
 */

/** True when a charted round happened on or after the current admission started. */
function isInCurrentAdmission(column: FlowsheetColumn, patient: Patient): boolean {
  const boundary = patient.currentAdmissionStartedAt;
  if (!boundary) return true; // no boundary set — legacy patient, nothing to exclude by
  if (!column.recordedAt) return true; // can't place it in time — don't hide it on a guess
  return new Date(column.recordedAt).getTime() >= new Date(boundary).getTime();
}

/** Rounds charted during the current admission, oldest first. */
export function columnsInCurrentAdmission(patient: Patient): FlowsheetColumn[] {
  return patient.flowsheetHistory.filter((c) => isInCurrentAdmission(c, patient));
}

/** How many charted rounds predate the current admission boundary. */
export function earlierAdmissionColumnCount(patient: Patient): number {
  return patient.flowsheetHistory.length - columnsInCurrentAdmission(patient).length;
}

/**
 * The most recent round of the *current* admission — never a stale round
 * left over from a previous stay. Every scoring panel, call-surgeon trigger
 * and "Prev:" reference value reads through this rather than indexing
 * `flowsheetHistory` directly, so a reactivated patient with nothing charted
 * yet this stay reads as "no round charted" rather than resurrecting May's
 * numbers into August's score.
 */
export function latestColumn(patient: Patient): FlowsheetColumn | undefined {
  const scoped = columnsInCurrentAdmission(patient);
  return scoped.length > 0 ? scoped[scoped.length - 1] : undefined;
}
