import React, { useMemo, useState } from 'react';
import type { Patient, Complication, ComplicationId, ComplicationFrame } from '../../types';
import {
  COMPLICATION_META,
  COMPLICATION_OR,
  COMPLICATION_OR_SOURCE,
  FRAME_LABEL,
  FRAME_ORDER,
  OR_TIER_LABEL,
  orTierFor,
  type OrTier,
} from '../../data/complications';
import { stampRecorded } from '../../utils/recorded';
import { clockTime, dayLabel, newId } from '../../utils/treatments';
import { ClinicianRequiredNotice } from '../ui/ClinicianRequiredNotice';

interface ComplicationsViewProps {
  patient: Patient;
  clinician: string;
  onUpdatePatient: (patient: Patient) => void;
}

const OR_TIER_STYLE: Record<OrTier, { chip: string; dot: string }> = {
  CRITICAL: { chip: 'bg-[#FEF2F2] text-[#B91C1C]', dot: '#B91C1C' },
  ALERT: { chip: 'bg-[#FFF7ED] text-[#C2410C]', dot: '#C2410C' },
  WATCH: { chip: 'bg-[#FFFBEB] text-[#B45309]', dot: '#B45309' },
  NOT_ESTABLISHED: { chip: 'bg-[#F1F5F9] text-[#747686]', dot: '#c4c5d7' },
};

const ALL_COMPLICATION_IDS = Object.keys(COMPLICATION_META) as ComplicationId[];

/**
 * Complications charted this stay, grouped by consequence rather than by
 * name — Gandini et al. 2023's central finding was that no standard
 * definition of "complication" exists in the equine colic-surgery
 * literature, so this view leans on the one axis that paper's own tables
 * are organised by: what happened as a result (resolved medically, forced a
 * return to surgery, was fatal, or surfaced after discharge). Open items are
 * additionally ranked by Loomes et al. 2025's odds ratio versus elective
 * surgery, since raw prevalence would bury a rarer but far more predictive
 * finding like fever under a more common but less specific one like colic.
 */
export const ComplicationsView: React.FC<ComplicationsViewProps> = ({
  patient,
  clinician,
  onUpdatePatient,
}) => {
  const complications = useMemo(
    () => [...(patient.complications ?? [])].sort((a, b) => b.at.localeCompare(a.at)),
    [patient.complications],
  );
  const now = new Date();
  const hasClinician = !!clinician?.trim();

  const [adding, setAdding] = useState(false);
  const [complicationId, setComplicationId] = useState<ComplicationId>(ALL_COMPLICATION_IDS[0]);
  const [frame, setFrame] = useState<ComplicationFrame>('MEDICAL');
  const [note, setNote] = useState('');

  const write = (next: Complication[]) => onUpdatePatient({ ...patient, complications: next });

  const openItems = complications.filter((c) => !c.resolvedAt);
  const resolvedItems = complications.filter((c) => c.resolvedAt);

  const rankedOpen = useMemo(() => {
    const tierRank: Record<OrTier, number> = { CRITICAL: 3, ALERT: 2, WATCH: 1, NOT_ESTABLISHED: 0 };
    return [...openItems].sort(
      (a, b) => tierRank[orTierFor(b.complicationId)] - tierRank[orTierFor(a.complicationId)],
    );
  }, [openItems]);

  const startAdd = () => {
    setComplicationId(ALL_COMPLICATION_IDS[0]);
    setFrame('MEDICAL');
    setNote('');
    setAdding(true);
  };

  const save = () => {
    if (!hasClinician) return;
    const entry: Complication = {
      id: newId('complication'),
      complicationId,
      frame,
      note: note.trim() || undefined,
      ...stampRecorded(clinician),
    };
    write([...complications, entry]);
    setAdding(false);
  };

  const resolve = (c: Complication) => {
    if (!hasClinician) return;
    write(
      complications.map((x) =>
        x.id === c.id ? { ...x, resolvedAt: new Date().toISOString(), resolvedBy: clinician } : x,
      ),
    );
  };

  const remove = (c: Complication) => {
    if (!window.confirm(`Delete this ${COMPLICATION_META[c.complicationId].label} entry?`)) return;
    write(complications.filter((x) => x.id !== c.id));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#0b1c30]">Complications</h1>
            <p className="font-body-md text-sm text-[#434655] mt-0.5">
              {patient.name} · grouped by consequence, ranked by odds ratio vs. elective surgery
              where that's published
            </p>
          </div>
          {!adding && (
            <button
              onClick={startAdd}
              className="px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Log complication
            </button>
          )}
        </div>

        {adding && (
          <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 mb-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1">
                  Complication
                </label>
                <select
                  value={complicationId}
                  onChange={(e) => setComplicationId(e.target.value as ComplicationId)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white"
                >
                  {ALL_COMPLICATION_IDS.map((id) => (
                    <option key={id} value={id}>
                      {COMPLICATION_META[id].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1">
                  Consequence
                </label>
                <select
                  value={frame}
                  onChange={(e) => setFrame(e.target.value as ComplicationFrame)}
                  className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white"
                >
                  {FRAME_ORDER.map((f) => (
                    <option key={f} value={f}>
                      {FRAME_LABEL[f]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {COMPLICATION_META[complicationId].definition ? (
              <p className="font-derived-value text-xs text-[#434655] bg-[#f8f9ff] border border-[#E2E8F0] rounded p-2 mt-3">
                <span className="font-label-caps text-[10px] text-[#747686] uppercase">
                  Standardised definition
                </span>{' '}
                — {COMPLICATION_META[complicationId].definition} ({COMPLICATION_META[complicationId].source})
              </p>
            ) : (
              <p className="font-derived-value text-xs text-[#747686] italic bg-[#F1F5F9] rounded p-2 mt-3">
                No standardised definition proposed yet in the literature this app draws on — use
                clinical judgement and record what was observed in the note.
              </p>
            )}

            <div className="mt-3">
              <label className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1">
                Note
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was observed"
                className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setAdding(false)}
                className="px-3 py-1.5 text-xs font-label-caps text-[#434655] rounded hover:bg-[#eff4ff]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!hasClinician}
                className="px-4 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] disabled:opacity-40"
              >
                Save
              </button>
              {!hasClinician && <ClinicianRequiredNotice className="self-center" />}
            </div>
          </div>
        )}

        <section className="mb-5">
          <h2 className="font-label-caps text-[11px] tracking-widest text-[#747686] uppercase mb-2">
            Open ({rankedOpen.length})
          </h2>
          {rankedOpen.length === 0 ? (
            <p className="font-derived-value text-sm text-[#747686] italic">None charted.</p>
          ) : (
            <ul className="space-y-2">
              {rankedOpen.map((c) => (
                <ComplicationRow key={c.id} c={c} now={now} onResolve={() => resolve(c)} onDelete={() => remove(c)} />
              ))}
            </ul>
          )}
        </section>

        {resolvedItems.length > 0 && (
          <section>
            <h2 className="font-label-caps text-[11px] tracking-widest text-[#747686] uppercase mb-2">
              Resolved / closed ({resolvedItems.length})
            </h2>
            <ul className="space-y-2">
              {resolvedItems.map((c) => (
                <ComplicationRow key={c.id} c={c} now={now} onDelete={() => remove(c)} />
              ))}
            </ul>
          </section>
        )}

        <p className="font-derived-value text-[11px] text-[#747686] mt-6">
          Odds ratios: {COMPLICATION_OR_SOURCE}. Only {Object.keys(COMPLICATION_OR).length} of{' '}
          {ALL_COMPLICATION_IDS.length} complications tracked here have a published elective-surgery
          comparator — the rest are colic-only findings and show as "{OR_TIER_LABEL.NOT_ESTABLISHED}".
        </p>
      </div>
    </div>
  );
};

const ComplicationRow: React.FC<{
  c: Complication;
  now: Date;
  onResolve?: () => void;
  onDelete: () => void;
}> = ({ c, now, onResolve, onDelete }) => {
  const meta = COMPLICATION_META[c.complicationId];
  const tier = orTierFor(c.complicationId);
  const style = OR_TIER_STYLE[tier];
  const orEntry = COMPLICATION_OR[c.complicationId];

  return (
    <li className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: style.dot }} />
            <span className="font-body-md text-sm font-bold text-[#0b1c30]">{meta.label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.chip}`}>
              {orEntry ? `OR ${orEntry.or.toFixed(2)} (95% CI ${orEntry.ci95})` : OR_TIER_LABEL[tier]}
            </span>
            <span className="font-derived-value text-[10px] text-[#747686]">{FRAME_LABEL[c.frame]}</span>
          </div>
          {c.note && <p className="font-derived-value text-xs text-[#434655] mt-1">{c.note}</p>}
          <p className="font-derived-value text-[10px] text-[#747686] mt-1">
            {clockTime(c.at)} {dayLabel(c.at, now)} · {c.by}
            {c.resolvedAt && ` · resolved ${clockTime(c.resolvedAt)} ${dayLabel(c.resolvedAt, now)} by ${c.resolvedBy}`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onResolve && (
            <button
              onClick={onResolve}
              className="px-2.5 py-1 text-xs font-label-caps border border-[#E2E8F0] rounded text-[#434655] hover:bg-[#eff4ff]"
            >
              Resolve
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-2.5 py-1 text-xs font-label-caps border border-[#B91C1C]/40 rounded text-[#B91C1C] hover:bg-[#B91C1C]/5"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};
