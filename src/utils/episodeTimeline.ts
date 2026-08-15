import type { Patient, Treatment, CriEventKind } from '../types';
import { columnsInCurrentAdmission } from './admission';

/**
 * The evolution timeline — everything charted this admission, merged into one
 * chronological feed: rounds, lab panels, and every treatment event (started,
 * given, rate/bag changed, paused, resumed, stopped). "Evolução" in the
 * original vision — the record read forward instead of screen by screen.
 *
 * Rounds are scoped to the current admission (utils/admission.ts); labs and
 * treatments are not, because neither LabPanelView nor TreatmentsView scopes
 * them today — extending the admission boundary to those is a bigger change
 * than merging feeds, and this timeline should read the same "what's on the
 * sheet" state those views already show, not a narrower one of its own.
 */

export type EpisodeEventKind =
  | 'ROUND'
  | 'ROUND_EDITED'
  | 'LAB_PANEL'
  | 'TREATMENT_STARTED'
  | 'TREATMENT_GIVEN'
  | 'TREATMENT_RATE_CHANGE'
  | 'TREATMENT_BAG_CHANGE'
  | 'TREATMENT_PAUSED'
  | 'TREATMENT_RESUMED'
  | 'TREATMENT_STOPPED';

export interface EpisodeEvent {
  id: string;
  at: Date;
  kind: EpisodeEventKind;
  by?: string;
  label: string;
  detail?: string;
  note?: string;
  /** An early-dose override or anything else worth a second look. */
  flagged?: boolean;
}

const CRI_EVENT_KIND: Record<Exclude<CriEventKind, 'START'>, EpisodeEventKind> = {
  RATE_CHANGE: 'TREATMENT_RATE_CHANGE',
  BAG_CHANGE: 'TREATMENT_BAG_CHANGE',
  PAUSE: 'TREATMENT_PAUSED',
  RESUME: 'TREATMENT_RESUMED',
  STOP: 'TREATMENT_STOPPED',
};

const CRI_EVENT_VERB: Record<Exclude<CriEventKind, 'START'>, string> = {
  RATE_CHANGE: 'rate changed',
  BAG_CHANGE: 'bag changed',
  PAUSE: 'paused',
  RESUME: 'resumed',
  STOP: 'stopped',
};

function roundEvents(patient: Patient): EpisodeEvent[] {
  const out: EpisodeEvent[] = [];
  for (const c of columnsInCurrentAdmission(patient)) {
    if (c.recordedAt) {
      out.push({
        id: `${c.id ?? c.time}-round`,
        at: new Date(c.recordedAt),
        kind: 'ROUND',
        by: c.recordedBy,
        label: `Round charted, ${c.time}`,
        note: c.note,
      });
    }
    if (c.editedAt) {
      out.push({
        id: `${c.id ?? c.time}-edit`,
        at: new Date(c.editedAt),
        kind: 'ROUND_EDITED',
        by: c.editedBy,
        label: `Round edited, ${c.time}`,
      });
    }
  }
  return out;
}

function labEvents(patient: Patient): EpisodeEvent[] {
  return (patient.labPanels ?? []).map((p) => {
    const count = Object.keys(p.values).length;
    return {
      id: `${p.id}-lab`,
      at: new Date(p.collectedAt),
      kind: 'LAB_PANEL' as const,
      by: p.recordedBy,
      label: p.sampleType ? `Lab panel — ${p.sampleType}` : 'Lab panel',
      detail: `${count} result${count === 1 ? '' : 's'}`,
      note: p.note,
    };
  });
}

function treatmentEvents(treatments: Treatment[] | undefined): EpisodeEvent[] {
  const out: EpisodeEvent[] = [];
  for (const t of treatments ?? []) {
    out.push({
      id: `${t.id}-start`,
      at: new Date(t.startedAt),
      kind: 'TREATMENT_STARTED',
      by: t.prescribedBy,
      label: `${t.drug} started`,
      detail: t.rateText || t.amountText || t.doseText,
      note: t.note,
    });

    for (const a of t.administrations ?? []) {
      out.push({
        id: `${t.id}-${a.id}`,
        at: new Date(a.at),
        kind: 'TREATMENT_GIVEN',
        by: a.by,
        label: `${t.drug} given`,
        detail: a.amountText || t.doseText,
        note: a.earlyOverrideReason ?? a.note,
        flagged: !!a.earlyOverrideReason,
      });
    }

    for (const e of t.criEvents ?? []) {
      if (e.kind === 'START') continue; // already covered by startedAt above
      out.push({
        id: `${t.id}-${e.id}`,
        at: new Date(e.at),
        kind: CRI_EVENT_KIND[e.kind],
        by: e.by,
        label: `${t.drug} ${CRI_EVENT_VERB[e.kind]}`,
        detail:
          e.rateValue !== undefined
            ? `${e.rateValue} ${e.rateUnit}`
            : e.bagVolumeL !== undefined
              ? `${e.bagVolumeL} L bag`
              : undefined,
        note: e.note,
      });
    }

    // Fallback for a treatment stopped before the CRI event log existed, or
    // a non-continuous order that never gets a STOP event at all.
    const hasStopEvent = (t.criEvents ?? []).some((e) => e.kind === 'STOP');
    if (t.stoppedAt && !hasStopEvent) {
      out.push({
        id: `${t.id}-stop`,
        at: new Date(t.stoppedAt),
        kind: 'TREATMENT_STOPPED',
        by: t.stoppedBy,
        label: `${t.drug} stopped`,
        detail: t.stopReason,
      });
    }
  }
  return out;
}

export function episodeTimeline(patient: Patient): EpisodeEvent[] {
  const events = [
    ...roundEvents(patient),
    ...labEvents(patient),
    ...treatmentEvents(patient.treatments),
  ];
  return events
    .filter((e) => !Number.isNaN(e.at.getTime()))
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}
