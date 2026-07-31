import React, { useMemo, useState } from 'react';
import type { Patient, Treatment, TreatmentKind } from '../../types';
import {
  orderedTreatments,
  treatmentTimeline,
  TREATMENT_KIND_LABEL,
  TREATMENT_STATE_STYLE,
  clockTime,
  dayLabel,
  formatDuration,
  newId,
  upcomingDoses,
  runningLines,
  type TreatmentStatus,
} from '../../utils/treatments';
import { DoseEntryPanel } from './DoseEntryPanel';

interface TreatmentsViewProps {
  patient: Patient;
  clinician: string;
  onUpdatePatient: (patient: Patient) => void;
}

const KIND_ICON: Record<TreatmentKind, string> = {
  MEDICATION: 'syringe',
  FLUID: 'water_drop',
  CRI: 'monitor_heart',
};

/**
 * Medications & Support — the treatment sheet.
 *
 * Everything the patient is on, ordered by urgency, with the time each order
 * started, when the last dose actually went in, and when the next one is due.
 * Continuous lines are followed by elapsed time until someone stops them; a
 * stopped order stays on the sheet with the times it ran between, because that
 * record is the audit trail and the basis of any later charge sheet.
 */
export const TreatmentsView: React.FC<TreatmentsViewProps> = ({
  patient,
  clinician,
  onUpdatePatient,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [mode, setMode] = useState<'sheet' | 'upcoming' | 'timeline'>('sheet');
  const [horizonHours, setHorizonHours] = useState(24);
  const [showStopped, setShowStopped] = useState(false);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const statuses = useMemo(
    () => orderedTreatments(patient.treatments, now),
    [patient.treatments, now],
  );
  const timeline = useMemo(() => treatmentTimeline(patient.treatments), [patient.treatments]);
  const upcoming = useMemo(
    () => upcomingDoses(patient.treatments, now, horizonHours),
    [patient.treatments, now, horizonHours],
  );
  const running = useMemo(() => runningLines(patient.treatments, now), [patient.treatments, now]);

  const open = statuses.filter((s) => s.state !== 'STOPPED');
  const stopped = statuses.filter((s) => s.state === 'STOPPED');
  const visible = showStopped ? statuses : open;

  const write = (treatments: Treatment[]) => {
    onUpdatePatient({ ...patient, treatments });
    setNow(new Date());
  };

  const addTreatment = (t: Treatment) => {
    write([...(patient.treatments ?? []), t]);
    setAdding(false);
  };

  const recordGiven = (t: Treatment) => {
    const at = new Date();
    write(
      (patient.treatments ?? []).map((x) =>
        x.id === t.id
          ? {
              ...x,
              administrations: [
                ...(x.administrations ?? []),
                {
                  id: newId('adm'),
                  at: at.toISOString(),
                  by: clinician || 'Unattributed',
                  amountText: x.amountText,
                },
              ],
            }
          : x,
      ),
    );
  };

  const stopTreatment = (t: Treatment) => {
    const reason = window.prompt(`Reason for stopping ${t.drug}? (optional)`) ?? undefined;
    write(
      (patient.treatments ?? []).map((x) =>
        x.id === t.id
          ? {
              ...x,
              stoppedAt: new Date().toISOString(),
              stoppedBy: clinician || 'Unattributed',
              stopReason: reason?.trim() || undefined,
            }
          : x,
      ),
    );
  };

  const resumeTreatment = (t: Treatment) => {
    write(
      (patient.treatments ?? []).map((x) =>
        x.id === t.id
          ? { ...x, stoppedAt: undefined, stoppedBy: undefined, stopReason: undefined }
          : x,
      ),
    );
  };

  const removeTreatment = (t: Treatment) => {
    if (!window.confirm(`Remove ${t.drug} from the sheet entirely? This deletes its history.`))
      return;
    write((patient.treatments ?? []).filter((x) => x.id !== t.id));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#0b1c30]">
              Medications &amp; Support
            </h1>
            <p className="font-body-md text-sm text-[#434655] mt-0.5">
              {patient.name} · {patient.weightKg} kg ·{' '}
              {open.length === 0
                ? 'nothing running'
                : `${open.length} order${open.length === 1 ? '' : 's'} open`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded border border-[#E2E8F0] overflow-hidden">
              {(
                [
                  ['sheet', 'Sheet'],
                  ['upcoming', 'Coming up'],
                  ['timeline', 'Given'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-label-caps transition-colors ${
                    mode === m ? 'bg-[#1d4ed8] text-white' : 'bg-white text-[#434655] hover:bg-[#eff4ff]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setNow(new Date())}
              title="Recompute due times"
              className="px-2.5 py-1.5 text-xs font-label-caps bg-white border border-[#E2E8F0] rounded text-[#434655] hover:bg-[#eff4ff] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {clockTime(now)}
            </button>
            <button
              onClick={() => setAdding((v) => !v)}
              className="px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">{adding ? 'close' : 'add'}</span>
              {adding ? 'Cancel' : 'Add treatment'}
            </button>
          </div>
        </div>

        {/* New order — the same calculator the Dose Calculator tab uses, so
            adding a medication here never means leaving this screen. */}
        {adding && (
          <div className="mb-5">
            <DoseEntryPanel patient={patient} clinician={clinician} onAddTreatment={addTreatment} />
          </div>
        )}

        {/* Sheet */}
        {mode === 'sheet' ? (
          <>
            {statuses.length === 0 ? (
              <div className="bg-white border border-dashed border-[#c4c5d7] rounded-lg p-10 text-center">
                <span className="material-symbols-outlined text-4xl text-[#c4c5d7]">
                  medication
                </span>
                <p className="font-body-md text-sm text-[#434655] mt-2">
                  Nothing on the treatment sheet for {patient.name} yet.
                </p>
                <button
                  onClick={() => setAdding(true)}
                  className="mt-3 px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8]"
                >
                  Add the first treatment
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((s) => (
                  <TreatmentRow
                    key={s.treatment.id}
                    status={s}
                    now={now}
                    expanded={expanded === s.treatment.id}
                    onToggle={() =>
                      setExpanded(expanded === s.treatment.id ? null : s.treatment.id)
                    }
                    onGiven={() => recordGiven(s.treatment)}
                    onStop={() => stopTreatment(s.treatment)}
                    onResume={() => resumeTreatment(s.treatment)}
                    onRemove={() => removeTreatment(s.treatment)}
                  />
                ))}
              </div>
            )}

            {stopped.length > 0 && (
              <button
                onClick={() => setShowStopped((v) => !v)}
                className="mt-3 text-xs font-label-caps text-[#0037b0] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {showStopped ? 'visibility_off' : 'history'}
                </span>
                {showStopped ? 'Hide' : 'Show'} {stopped.length} stopped treatment
                {stopped.length === 1 ? '' : 's'}
              </button>
            )}
          </>
        ) : mode === 'upcoming' ? (
          /* Forward schedule: what is due, and what is still running */
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-derived-value text-xs text-[#434655]">
                Projected from each order's interval — {upcoming.length} dose
                {upcoming.length === 1 ? '' : 's'} in the next {horizonHours} hours.
              </p>
              <div className="flex rounded border border-[#E2E8F0] overflow-hidden">
                {[8, 24, 48].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizonHours(h)}
                    className={`px-2.5 py-1 text-xs font-label-caps ${
                      horizonHours === h
                        ? 'bg-[#1d4ed8] text-white'
                        : 'bg-white text-[#434655] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {h} h
                  </button>
                ))}
              </div>
            </div>

            {/* Continuous lines: duration rather than doses */}
            {running.length > 0 && (
              <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
                <h2 className="px-3 py-2 bg-[#f8f9ff] border-b border-[#E2E8F0] font-label-caps text-[10px] tracking-widest text-[#747686] uppercase">
                  Running now — fluids and infusions
                </h2>
                <ul className="divide-y divide-[#E2E8F0]">
                  {running.map(({ treatment: t, runningForMs }) => (
                    <li key={t.id} className="p-3">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="font-headline text-sm font-bold text-[#0b1c30]">
                          {t.drug}
                        </span>
                        <span className="font-derived-value text-xs text-[#047857] bg-[#ECFDF5] border border-[#047857]/30 px-2 py-0.5 rounded whitespace-nowrap">
                          up {formatDuration(runningForMs)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#ECFDF5] border border-[#047857]/30 overflow-hidden">
                        <div
                          className="h-full bg-[#047857]"
                          style={{
                            // Proportion of the last 24 h this line has been up.
                            width: `${Math.min(100, (runningForMs / (24 * 3600_000)) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between font-derived-value text-[10px] text-[#747686] mt-0.5">
                        <span>
                          started {clockTime(t.startedAt)} {dayLabel(t.startedAt, now)}
                          {t.rateText ? ` · ${t.rateText}` : ''}
                          {t.route ? ` · ${t.route}` : ''}
                        </span>
                        <span>running until stopped</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Scheduled doses, grouped by hour */}
            {upcoming.length === 0 ? (
              <div className="bg-white border border-dashed border-[#c4c5d7] rounded-lg p-8 text-center">
                <p className="font-body-md text-sm text-[#434655]">
                  No intermittent doses scheduled in the next {horizonHours} hours.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
                <ul className="divide-y divide-[#E2E8F0]">
                  {upcoming.map((u) => (
                    <li
                      key={u.id}
                      className={`flex items-center gap-3 p-2.5 ${
                        u.overdue ? 'bg-[#FEF2F2]' : u.ordinal === 1 ? 'bg-[#f8f9ff]' : ''
                      }`}
                    >
                      <div className="w-16 flex-shrink-0 text-right">
                        <div
                          className={`font-derived-value text-sm font-bold ${
                            u.overdue ? 'text-[#B91C1C]' : 'text-[#0b1c30]'
                          }`}
                        >
                          {clockTime(u.at)}
                        </div>
                        <div className="font-label-caps text-[10px] text-[#747686]">
                          {dayLabel(u.at, now)}
                        </div>
                      </div>
                      <span
                        className={`w-1 self-stretch rounded ${
                          u.overdue ? 'bg-[#B91C1C]' : u.ordinal === 1 ? 'bg-[#C2410C]' : 'bg-[#c4c5d7]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-body-md text-sm text-[#0b1c30] truncate">
                          <span className="font-semibold">{u.treatment.drug}</span>
                          {u.ordinal === 1 && (
                            <span
                              className={`ml-2 font-label-caps text-[10px] px-1.5 py-0.5 rounded ${
                                u.overdue
                                  ? 'bg-[#B91C1C] text-white'
                                  : 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30'
                              }`}
                            >
                              {u.overdue ? 'Overdue' : 'Next'}
                            </span>
                          )}
                        </div>
                        <div className="font-derived-value text-xs text-[#434655] truncate">
                          {[
                            u.treatment.amountText || u.treatment.doseText,
                            u.treatment.route,
                            `q${u.treatment.intervalHours}h`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                      {u.ordinal === 1 && (
                        <button
                          onClick={() => recordGiven(u.treatment)}
                          className="px-2.5 py-1 text-xs font-label-caps bg-[#047857] text-white rounded hover:bg-[#065f46] flex-shrink-0"
                        >
                          Given
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Chronological */
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
            {timeline.length === 0 ? (
              <p className="p-8 text-center font-body-md text-sm text-[#434655]">
                No treatment events recorded.
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {timeline.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 p-3 hover:bg-[#f8f9ff]">
                    <div className="w-16 flex-shrink-0 text-right">
                      <div className="font-derived-value text-sm font-bold text-[#0b1c30]">
                        {clockTime(e.at)}
                      </div>
                      <div className="font-label-caps text-[10px] text-[#747686]">
                        {dayLabel(e.at, now)}
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined text-lg mt-0.5 ${
                        e.kind === 'STOPPED'
                          ? 'text-[#747686]'
                          : e.kind === 'STARTED'
                            ? 'text-[#0037b0]'
                            : 'text-[#047857]'
                      }`}
                    >
                      {e.kind === 'STOPPED'
                        ? 'stop_circle'
                        : e.kind === 'STARTED'
                          ? 'play_circle'
                          : 'check_circle'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-body-md text-sm text-[#0b1c30]">
                        <span className="font-semibold">{e.treatment.drug}</span>
                        <span className="text-[#747686]">
                          {' '}
                          ·{' '}
                          {e.kind === 'STARTED'
                            ? 'started'
                            : e.kind === 'GIVEN'
                              ? 'given'
                              : 'stopped'}
                        </span>
                      </div>
                      <div className="font-derived-value text-xs text-[#434655]">
                        {[e.detail, e.treatment.route, e.by].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface RowProps {
  status: TreatmentStatus;
  now: Date;
  expanded: boolean;
  onToggle: () => void;
  onGiven: () => void;
  onStop: () => void;
  onResume: () => void;
  onRemove: () => void;
}

const TreatmentRow: React.FC<RowProps> = ({
  status,
  now,
  expanded,
  onToggle,
  onGiven,
  onStop,
  onResume,
  onRemove,
}) => {
  const t = status.treatment;
  const style = TREATMENT_STATE_STYLE[status.state];
  const continuous = !t.intervalHours && t.kind !== 'MEDICATION';

  return (
    <div
      className={`bg-white border rounded-lg shadow-sm overflow-hidden ${
        status.state === 'OVERDUE'
          ? 'border-[#B91C1C]/50'
          : status.state === 'STOPPED'
            ? 'border-[#E2E8F0] opacity-75'
            : 'border-[#E2E8F0]'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <span
          className={`material-symbols-outlined text-xl flex-shrink-0 ${
            status.state === 'STOPPED' ? 'text-[#747686]' : 'text-[#0037b0]'
          }`}
        >
          {KIND_ICON[t.kind]}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline text-sm font-bold text-[#0b1c30]">{t.drug}</span>
            <span className="font-label-caps text-[10px] text-[#747686] border border-[#E2E8F0] rounded px-1.5 py-px">
              {TREATMENT_KIND_LABEL[t.kind]}
            </span>
            <span className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded ${style.chip}`}>
              {style.label} · {status.label}
            </span>
          </div>
          <div className="font-derived-value text-xs text-[#434655] mt-0.5 truncate">
            {[
              t.doseText,
              t.amountText,
              t.route,
              continuous
                ? t.rateText
                : t.intervalHours
                  ? `q${t.intervalHours}h`
                  : 'single dose',
              `started ${clockTime(t.startedAt)} ${dayLabel(t.startedAt, now)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {status.state !== 'STOPPED' && t.kind === 'MEDICATION' && (
            <button
              onClick={onGiven}
              className="px-2.5 py-1 text-xs font-label-caps bg-[#047857] text-white rounded hover:bg-[#065f46] flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              <span className="hidden sm:inline">Given</span>
            </button>
          )}
          {status.state !== 'STOPPED' ? (
            <button
              onClick={onStop}
              className="px-2.5 py-1 text-xs font-label-caps border border-[#B91C1C]/40 text-[#B91C1C] rounded hover:bg-[#B91C1C]/5"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-2.5 py-1 text-xs font-label-caps border border-[#E2E8F0] text-[#434655] rounded hover:bg-[#eff4ff]"
            >
              Resume
            </button>
          )}
          <button
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide detail' : 'Show detail'}
            className="p-1 text-[#434655] hover:bg-[#eff4ff] rounded"
          >
            <span className="material-symbols-outlined text-lg">
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#E2E8F0] bg-[#f8f9ff] p-3 space-y-3">
          <dl className="grid sm:grid-cols-3 gap-x-4 gap-y-1.5 font-derived-value text-xs">
            <div>
              <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Started</dt>
              <dd className="text-[#0b1c30]">
                {clockTime(t.startedAt)} · {dayLabel(t.startedAt, now)}
                {t.prescribedBy ? ` · ${t.prescribedBy}` : ''}
              </dd>
            </div>
            {status.runningForMs !== undefined && (
              <div>
                <dt className="font-label-caps text-[10px] text-[#747686] uppercase">
                  {t.stoppedAt ? 'Ran for' : 'Running for'}
                </dt>
                <dd className="text-[#0b1c30]">{formatDuration(status.runningForMs)}</dd>
              </div>
            )}
            {status.nextDueAt && (
              <div>
                <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Next due</dt>
                <dd className="text-[#0b1c30]">
                  {clockTime(status.nextDueAt)} · {status.label}
                </dd>
              </div>
            )}
            {t.stoppedAt && (
              <div className="sm:col-span-3">
                <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Stopped</dt>
                <dd className="text-[#0b1c30]">
                  {clockTime(t.stoppedAt)} · {dayLabel(t.stoppedAt, now)}
                  {t.stoppedBy ? ` · ${t.stoppedBy}` : ''}
                  {t.stopReason ? ` — ${t.stopReason}` : ''}
                </dd>
              </div>
            )}
            {t.note && (
              <div className="sm:col-span-3">
                <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Note</dt>
                <dd className="text-[#0b1c30]">{t.note}</dd>
              </div>
            )}
          </dl>

          <div>
            <h4 className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
              Administrations ({t.administrations?.length ?? 0})
            </h4>
            {!t.administrations?.length ? (
              <p className="font-derived-value text-xs text-[#434655]">
                None recorded yet.
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0] bg-white border border-[#E2E8F0] rounded">
                {[...t.administrations]
                  .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                  .map((a) => (
                    <li
                      key={a.id}
                      className="flex justify-between items-center px-2.5 py-1.5 font-derived-value text-xs"
                    >
                      <span className="text-[#0b1c30]">
                        {clockTime(a.at)} · {dayLabel(a.at, now)}
                        {a.amountText ? ` · ${a.amountText}` : ''}
                      </span>
                      <span className="text-[#747686]">{a.by || 'Unattributed'}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <button
            onClick={onRemove}
            className="text-xs font-label-caps text-[#B91C1C] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Remove from sheet
          </button>
        </div>
      )}
    </div>
  );
};
