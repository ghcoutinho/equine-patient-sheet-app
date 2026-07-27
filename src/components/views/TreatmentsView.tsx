import React, { useMemo, useState } from 'react';
import type { Patient, Treatment, TreatmentKind, DrugFormularyItem } from '../../types';
import { EXPANDED_FORMULARY } from '../../data/expandedFormulary';
import {
  computeDose,
  defaultConcentrationUnit,
  VOLUME_BLOCKED_MESSAGE,
} from '../../utils/doseCalculation';
import {
  orderedTreatments,
  treatmentTimeline,
  TREATMENT_KIND_LABEL,
  TREATMENT_STATE_STYLE,
  clockTime,
  dayLabel,
  formatDuration,
  newId,
  type TreatmentStatus,
} from '../../utils/treatments';

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

/** Parse "q6h", "q12h", "q8-12h", "SID", "BID", "TID", "QID" into hours. */
function intervalFromFrequency(freq: string | undefined): number | undefined {
  const f = (freq || '').trim().toLowerCase();
  if (!f) return undefined;
  if (/\bsid\b|\bq24\b|once daily/.test(f)) return 24;
  if (/\bbid\b/.test(f)) return 12;
  if (/\btid\b/.test(f)) return 8;
  if (/\bqid\b/.test(f)) return 6;
  // "q6h", "q8-12h" — take the shorter end, which is the more frequent order.
  const m = f.match(/q\s*(\d+)(?:\s*[–-]\s*(\d+))?\s*h/);
  if (m) return Number(m[1]);
  if (/\bcri\b|continuous|infusion/.test(f)) return undefined;
  return undefined;
}

const isoLocal = (d: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
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
  const [mode, setMode] = useState<'sheet' | 'timeline'>('sheet');
  const [showStopped, setShowStopped] = useState(false);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New-order form state
  const [search, setSearch] = useState('');
  const [pickedId, setPickedId] = useState<string>('');
  const [kind, setKind] = useState<TreatmentKind>('MEDICATION');
  const [drugName, setDrugName] = useState('');
  const [dose, setDose] = useState('');
  const [doseUnit, setDoseUnit] = useState('mg/kg');
  const [concentration, setConcentration] = useState('');
  const [route, setRoute] = useState('IV');
  const [intervalHours, setIntervalHours] = useState('');
  const [rateText, setRateText] = useState('');
  const [startedAt, setStartedAt] = useState(() => isoLocal(new Date()));
  const [note, setNote] = useState('');

  const statuses = useMemo(
    () => orderedTreatments(patient.treatments, now),
    [patient.treatments, now],
  );
  const timeline = useMemo(() => treatmentTimeline(patient.treatments), [patient.treatments]);

  const open = statuses.filter((s) => s.state !== 'STOPPED');
  const stopped = statuses.filter((s) => s.state === 'STOPPED');
  const visible = showStopped ? statuses : open;

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return EXPANDED_FORMULARY.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || (d.brandName || '').toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search]);

  const write = (treatments: Treatment[]) => {
    onUpdatePatient({ ...patient, treatments });
    setNow(new Date());
  };

  const pickDrug = (d: DrugFormularyItem) => {
    setPickedId(d.id);
    setDrugName(d.name);
    setSearch(d.name);
    setDose(String(d.doseDefault));
    setDoseUnit(d.doseUnit);
    setConcentration(d.concentration > 0 ? String(d.concentration) : '');
    setRoute(d.route[0] || 'IV');
    const iv = intervalFromFrequency(d.frequency);
    if (d.isCRI) {
      setKind('CRI');
      setIntervalHours('');
      setRateText(`${d.doseDefault} ${d.doseUnit}`);
    } else {
      setKind('MEDICATION');
      setIntervalHours(iv ? String(iv) : '');
      setRateText('');
    }
  };

  // Live preview of the volume this order works out to, using the same engine
  // as the dose calculator so the two can never disagree.
  const preview = useMemo(() => {
    const doseNum = Number(dose);
    if (!Number.isFinite(doseNum) || !doseUnit) return undefined;
    const concNum = Number(concentration);
    return computeDose({
      weightKg: patient.weightKg,
      dose: doseNum,
      doseUnit,
      concentration: Number.isFinite(concNum) && concNum > 0 ? concNum : undefined,
      concentrationUnit: defaultConcentrationUnit(doseUnit),
    });
  }, [dose, doseUnit, concentration, patient.weightKg]);

  const resetForm = () => {
    setSearch('');
    setPickedId('');
    setDrugName('');
    setDose('');
    setDoseUnit('mg/kg');
    setConcentration('');
    setRoute('IV');
    setIntervalHours('');
    setRateText('');
    setNote('');
    setStartedAt(isoLocal(new Date()));
  };

  const addTreatment = () => {
    const name = (drugName || search).trim();
    if (!name) return;
    const iv = Number(intervalHours);
    const t: Treatment = {
      id: newId('tx'),
      kind,
      drug: name,
      formularyId: pickedId || undefined,
      doseText: dose ? `${dose} ${doseUnit}` : undefined,
      amountText:
        preview?.volume !== undefined
          ? `${preview.volume} ${preview.volumeUnit}`
          : undefined,
      route: route || undefined,
      intervalHours: kind === 'MEDICATION' && Number.isFinite(iv) && iv > 0 ? iv : undefined,
      rateText: kind === 'MEDICATION' ? undefined : rateText.trim() || undefined,
      startedAt: new Date(startedAt).toISOString(),
      prescribedBy: clinician || 'Unattributed',
      administrations: [],
      note: note.trim() || undefined,
    };
    write([...(patient.treatments ?? []), t]);
    resetForm();
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
              {(['sheet', 'timeline'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-label-caps transition-colors ${
                    mode === m ? 'bg-[#1d4ed8] text-white' : 'bg-white text-[#434655] hover:bg-[#eff4ff]'
                  }`}
                >
                  {m === 'sheet' ? 'Sheet' : 'By time'}
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

        {/* New order form */}
        {adding && (
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 mb-5">
            <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-3">
              New treatment
            </h2>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Drug, fluid or infusion
                </label>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setDrugName(e.target.value);
                    setPickedId('');
                  }}
                  placeholder="Search the formulary, or type any name"
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                />
                {matches.length > 0 && !pickedId && (
                  <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E2E8F0] rounded shadow-lg max-h-56 overflow-y-auto">
                    {matches.map((d, i) => (
                      <li key={`${d.id}-${i}`}>
                        <button
                          onClick={() => pickDrug(d)}
                          className="w-full text-left px-3 py-2 hover:bg-[#eff4ff] text-sm"
                        >
                          <span className="font-semibold text-[#0b1c30]">{d.name}</span>
                          {d.brandName && (
                            <span className="text-[#747686] text-xs"> · {d.brandName}</span>
                          )}
                          <span className="block text-xs text-[#434655] font-derived-value">
                            {d.doseDefault} {d.doseUnit}
                            {d.frequency ? ` · ${d.frequency}` : ''}
                            {d.route.length ? ` · ${d.route.join('/')}` : ''}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Type
                </label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as TreatmentKind)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#0037b0]"
                >
                  {(Object.keys(TREATMENT_KIND_LABEL) as TreatmentKind[]).map((k) => (
                    <option key={k} value={k}>
                      {TREATMENT_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Dose
                </label>
                <div className="flex gap-1">
                  <input
                    value={dose}
                    onChange={(e) => setDose(e.target.value)}
                    inputMode="decimal"
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                  />
                  <input
                    value={doseUnit}
                    onChange={(e) => setDoseUnit(e.target.value)}
                    aria-label="Dose unit"
                    className="w-24 border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Concentration ({defaultConcentrationUnit(doseUnit)})
                </label>
                <input
                  value={concentration}
                  onChange={(e) => setConcentration(e.target.value)}
                  inputMode="decimal"
                  placeholder="on the bottle"
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                />
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Route
                </label>
                <input
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                />
              </div>

              {kind === 'MEDICATION' ? (
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                    Interval (hours)
                  </label>
                  <input
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(e.target.value)}
                    inputMode="numeric"
                    placeholder="blank = single dose"
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                    Rate
                  </label>
                  <input
                    value={rateText}
                    onChange={(e) => setRateText(e.target.value)}
                    placeholder="e.g. 2 mL/kg/hr, or 0.05 mg/kg/min"
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                  />
                </div>
              )}

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  {kind === 'MEDICATION' ? 'Time of application' : 'Time started'}
                </label>
                <input
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1">
                  Note
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#0037b0]"
                />
              </div>
            </div>

            {/* Derived amount, or an explicit reason there isn't one */}
            {preview && (
              <div className="mt-3 bg-[#eff4ff] border border-[#E2E8F0] rounded p-2.5 font-derived-value text-xs text-[#434655]">
                {preview.amount !== undefined && (
                  <span className="text-[#0b1c30] font-bold">
                    {preview.amount} {preview.amountUnit}
                  </span>
                )}
                {preview.volume !== undefined ? (
                  <span>
                    {' '}
                    → draw up{' '}
                    <span className="text-[#0b1c30] font-bold">
                      {preview.volume} {preview.volumeUnit}
                    </span>{' '}
                    at {patient.weightKg} kg
                  </span>
                ) : (
                  <span> · {VOLUME_BLOCKED_MESSAGE[preview.volumeBlocked ?? 'no-concentration']}</span>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  resetForm();
                  setAdding(false);
                }}
                className="px-3 py-1.5 text-xs font-label-caps text-[#434655] rounded hover:bg-[#eff4ff]"
              >
                Cancel
              </button>
              <button
                onClick={addTreatment}
                disabled={!(drugName || search).trim()}
                className="px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add to sheet
              </button>
            </div>
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
