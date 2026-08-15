import React, { useState, useEffect } from 'react';
import { Patient, FlowsheetColumn, AssessmentSeverity } from '../../types';
import { GutSoundsGlyph } from '../ui/GutSoundsQuadrant';
import { formatManure } from '../../utils/manure';
import { severityOf } from '../../data/clinicalAssessments';
import { summariseGutSounds } from '../../utils/gutSounds';
import { evaluateCallSurgeonTriggers } from '../../utils/callSurgeonTriggers';
import { columnsInCurrentAdmission, earlierAdmissionColumnCount, latestColumn } from '../../utils/admission';
import { nsaidGivenWithin } from '../../utils/nsaid';
import { stampRecorded } from '../../utils/recorded';
import { classifyAgainstReference } from '../../utils/referenceLookup';
import { ageClassFor } from '../../data/ageStratifiedReferenceRanges';
import { BODY_SYSTEM_META } from '../../data/bodySystems';
import { computeDue, DUE_STYLES, TASK_KIND_ICON, markDone } from '../../utils/schedule';
import { Sparkline } from '../ui/Sparkline';
import { ClinicianRequiredNotice } from '../ui/ClinicianRequiredNotice';

/**
 * Series plotted in the trend rail. Reference bounds are the adult intervals
 * used elsewhere in the app, so the shaded band on the chart is the same band
 * the flowsheet cells are coloured against.
 */
const TREND_SERIES: {
  id: string;
  label: string;
  units: string;
  color: string;
  referenceMin?: number;
  referenceMax?: number;
  pick: (c: FlowsheetColumn) => number | undefined;
}[] = [
  {
    id: 'hr',
    label: 'Heart rate',
    units: 'bpm',
    color: '#1D4ED8',
    referenceMin: 28,
    referenceMax: 44,
    pick: (c) => c.vitals?.heartRate,
  },
  {
    id: 'rr',
    label: 'Respiratory rate',
    units: 'brpm',
    color: '#6D28D9',
    referenceMin: 8,
    referenceMax: 16,
    pick: (c) => c.vitals?.respiratoryRate,
  },
  {
    id: 'lactate',
    label: 'Lactate',
    units: 'mmol/L',
    color: '#0E7490',
    referenceMin: 0.5,
    referenceMax: 1.5,
    pick: (c) => (typeof c.labs?.lactate === 'number' ? c.labs.lactate : undefined),
  },
  {
    id: 'pcv',
    label: 'Haematocrit',
    units: '%',
    color: '#B45309',
    referenceMin: 32,
    referenceMax: 48,
    pick: (c) => (typeof c.labs?.pcv === 'number' ? c.labs.pcv : undefined),
  },
  {
    id: 'reflux',
    label: 'Net gastric reflux',
    units: 'L',
    color: '#C2410C',
    referenceMax: 2,
    pick: (c) => c.gi?.refluxVolumeL,
  },
];

const SEVERITY_CELL: Record<AssessmentSeverity, string> = {
  normal: 'text-[#047857]',
  watch: 'bg-[#FFFBEB] text-[#B45309] font-bold',
  warning: 'bg-[#FFF7ED] text-[#C2410C] font-bold',
  critical: 'bg-[#B91C1C] text-white font-bold',
};

interface FlowsheetViewProps {
  patient: Patient;
  clinician?: string;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenNewAssessment: () => void;
}

export const FlowsheetView: React.FC<FlowsheetViewProps> = ({
  patient,
  clinician,
  onUpdatePatient,
  onOpenNewAssessment,
}) => {
  // Ticks once a minute so "12 min late" stays honest without re-rendering
  // the grid on every frame.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [showEarlier, setShowEarlier] = useState(false);

  // Rounds from a previous stay don't show by default — a reactivated
  // patient's grid should not resurrect stale columns into the current
  // admission's view. Nothing is hidden permanently: the toggle below reveals
  // them, and every earlier round is still in patient.flowsheetHistory.
  const earlierCount = earlierAdmissionColumnCount(patient);
  const visibleColumns = showEarlier ? patient.flowsheetHistory : columnsInCurrentAdmission(patient);
  /** Position within flowsheetHistory — edit/delete always act on the real column, not its position in the filtered view. */
  const realIndex = (col: FlowsheetColumn) => patient.flowsheetHistory.indexOf(col);

  // No clinician, no save — see CLAUDE.md rule 2 and Architecture principle A.
  const hasClinician = !!clinician?.trim();

  const due = computeDue(patient.schedule, now);

  const handleMarkDone = (taskId: string) => {
    onUpdatePatient({ ...patient, schedule: markDone(patient.schedule, taskId, new Date()) });
  };

  const handleDeleteRound = (idx: number) => {
    const next = patient.flowsheetHistory.filter((_, i) => i !== idx);
    onUpdatePatient({ ...patient, flowsheetHistory: next });
    setConfirmDeleteIdx(null);
  };

  const startEditRound = (idx: number) => {
    const c = patient.flowsheetHistory[idx];
    setEditingIdx(idx);
    setEditDraft({
      time: c.time,
      heartRate: c.vitals.heartRate?.toString() ?? '',
      temperature: (c.vitals.temperatureC ?? c.vitals.temperatureF)?.toString() ?? '',
      respiratoryRate: c.vitals.respiratoryRate?.toString() ?? '',
      refluxVolumeL: c.gi.refluxVolumeL?.toString() ?? '',
      lactate: typeof c.labs.lactate === 'number' ? String(c.labs.lactate) : '',
      note: c.note ?? '',
    });
  };

  const num = (v: string) => (v.trim() === '' ? undefined : Number.isFinite(Number(v)) ? Number(v) : undefined);

  const saveEditRound = (idx: number) => {
    if (!hasClinician) return;
    const c = patient.flowsheetHistory[idx];
    const isFoal = patient.isFoal || patient.category === 'NEONATAL_FOAL';
    const t = num(editDraft.temperature);
    const edited = stampRecorded(clinician!);
    const updated: FlowsheetColumn = {
      ...c,
      time: editDraft.time || c.time,
      editedBy: edited.by,
      editedAt: edited.at,
      vitals: {
        ...c.vitals,
        heartRate: num(editDraft.heartRate),
        respiratoryRate: num(editDraft.respiratoryRate),
        temperatureC: isFoal ? c.vitals.temperatureC : t,
        temperatureF: isFoal ? t : c.vitals.temperatureF,
      },
      gi: { ...c.gi, refluxVolumeL: num(editDraft.refluxVolumeL) },
      labs: { ...c.labs, lactate: num(editDraft.lactate) },
      note: editDraft.note || undefined,
    };
    const next = patient.flowsheetHistory.map((col, i) => (i === idx ? updated : col));
    onUpdatePatient({ ...patient, flowsheetHistory: next });
    setEditingIdx(null);
  };

  const [newHR, setNewHR] = useState<string>('');
  const [newTemp, setNewTemp] = useState<string>('');
  const [newReflux, setNewReflux] = useState<string>('');
  const [newLactate, setNewLactate] = useState<string>('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  const handleAddNewTimepoint = () => {
    if ((!newHR && !newTemp && !newReflux && !newLactate) || !hasClinician) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const recorded = stampRecorded(clinician!);

    const newColumn: FlowsheetColumn = {
      time: timeStr,
      recordedAt: recorded.at,
      recordedBy: recorded.by,
      vitals: {
        heartRate: newHR ? parseFloat(newHR) : undefined,
        temperatureC: newTemp ? parseFloat(newTemp) : undefined,
      },
      gi: {
        refluxVolumeL: newReflux ? parseFloat(newReflux) : undefined,
        // Motility is auscultated, not inferred from reflux volume. This used
        // to chart "Absent" or "Decreased" purely from the litres in the
        // bucket, which put a finding in the record that nobody listened for.
      },
      labs: {
        lactate: newLactate ? parseFloat(newLactate) : undefined,
      },
    };

    const updated = {
      ...patient,
      lastObsTime: 'Just now',
      flowsheetHistory: [...patient.flowsheetHistory, newColumn],
    };

    onUpdatePatient(updated);
    setNewHR('');
    setNewTemp('');
    setNewReflux('');
    setNewLactate('');
    setIsAddingEntry(false);
  };

  // Helper for status styling
  const getHRClass = (hr?: number) => {
    if (!hr) return 'text-[#434655]';
    if (hr > 100) return 'bg-[#B91C1C] text-white font-bold';
    if (hr > 60) return 'bg-[#FFF7ED] text-[#C2410C] font-bold';
    if (hr > 50) return 'bg-[#FFFBEB] text-[#B45309] font-bold';
    return 'text-[#047857]';
  };

  const getTempClass = (temp?: number) => {
    if (!temp) return 'text-[#434655]';
    if (temp > 39.2) return 'bg-[#B91C1C] text-white font-bold';
    if (temp > 38.5) return 'bg-[#FFF7ED] text-[#C2410C] font-bold';
    if (temp > 38.2) return 'bg-[#FFFBEB] text-[#B45309] font-bold';
    return 'text-[#047857]';
  };

  const getRefluxClass = (vol?: number) => {
    if (vol === undefined) return 'text-[#434655]';
    if (vol > 6.0) return 'bg-[#B91C1C] text-white font-bold';
    if (vol > 4.0) return 'bg-[#FFF7ED] text-[#C2410C] font-bold';
    if (vol > 2.0) return 'bg-[#FFFBEB] text-[#B45309] font-bold';
    return 'text-[#047857]';
  };

  const ageClass = ageClassFor(patient.age, patient.isFoal || patient.category === 'NEONATAL_FOAL');

  /** Colour a lab value from the published interval for this patient's age. */
  const refClass = (parameterId: string, value?: number | string) => {
    if (value === 'Pending' || value === undefined) return 'bg-[#F8FAFC] text-[#475569] italic';
    const val = typeof value === 'number' ? value : parseFloat(value);
    const severity = classifyAgainstReference(parameterId, val, ageClass);
    if (severity === undefined) return 'text-[#0b1c30]'; // no published interval — never guess
    return SEVERITY_CELL[severity];
  };

  const getLactateClass = (lac?: number | string) => refClass('lactate', lac);

  const colCount = visibleColumns.length + 2;

  /** Section divider row. */
  const sectionRow = (label: string, accent: string) => (
    <tr>
      <td
        colSpan={colCount}
        className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs uppercase tracking-wider font-bold"
        style={{ color: accent }}
      >
        {label}
      </td>
    </tr>
  );

  /**
   * Row for a structured (non-numeric) finding. Cells are coloured by the
   * finding's triage severity; an unrecorded cell stays visibly empty so
   * "not assessed" never reads as a normal result.
   */
  const structuredRow = (
    key: string,
    label: string,
    accent: string,
    read: (col: FlowsheetColumn) => string | undefined,
    definitionId?: string,
  ) => {
    const anyValue = visibleColumns.some((c) => read(c) !== undefined);
    if (!anyValue) return null;
    return (
      <tr key={key} className="group hover:bg-[#f8f9ff] transition relative">
        <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
          <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
          <span className="text-[#0b1c30] font-bold">{label}</span>
        </td>
        {visibleColumns.map((col, idx) => {
          const v = read(col);
          const sev = definitionId ? severityOf(definitionId, v) : 'normal';
          return (
            <td
              key={idx}
              className={`px-3 py-3 border-b border-r border-[#E2E8F0] text-center text-xs leading-tight ${
                v ? SEVERITY_CELL[sev] : 'text-[#94a3b8]'
              }`}
            >
              {v ?? '--'}
            </td>
          );
        })}
        <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff] text-[10px] text-[#747686] font-sans">
          Record round
        </td>
      </tr>
    );
  };

  const latestForTriggers = latestColumn(patient);
  const nsaidRecently = nsaidGivenWithin(
    patient,
    latestForTriggers?.recordedAt ? new Date(latestForTriggers.recordedAt) : now,
    4,
  );
  const triggers = evaluateCallSurgeonTriggers(
    latestForTriggers,
    undefined,
    visibleColumns.length > 1 ? visibleColumns[visibleColumns.length - 2] : undefined,
    nsaidRecently,
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      {/* Context Top Bar */}
      <div className="bg-white px-4 md:px-6 py-3 border-b border-[#E2E8F0] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-lg md:text-xl text-[#0b1c30] font-bold">
            Clinical Flowsheet: <span className="text-[#0037b0]">{patient.name}</span>
          </h1>
          <span className="text-xs font-body-md text-[#434655] bg-[#e5eeff] px-2 py-0.5 rounded">
            Case {patient.caseNumber} • {patient.breed}
          </span>
          {patient.isTest && (
            <span className="text-[10px] font-label-caps px-1.5 py-0.5 rounded bg-[#FFFBEB] border border-[#B45309]/30 text-[#B45309]">
              TEST
            </span>
          )}
        </div>

        <div className="flex gap-2 text-xs font-label-caps">
          <button 
            onClick={onOpenNewAssessment}
            className="px-3 py-1 bg-[#0037b0] text-white rounded font-bold hover:bg-[#1d4ed8] transition flex items-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Record Round</span>
          </button>
          <button className="px-3 py-1 bg-[#e5eeff] text-[#434655] rounded border border-[#E2E8F0] hover:bg-[#dce9ff] transition">
            Export PDF
          </button>
        </div>
      </div>

      {/* Diagnosis banner + body systems + next due */}
      <div className="bg-white px-4 md:px-6 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center gap-x-6 gap-y-3 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <span className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider block">
            Primary diagnosis
          </span>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="font-headline text-base font-bold text-[#0b1c30]">
              {patient.diagnosis || 'Not recorded'}
            </span>
            {(patient.bodySystems ?? []).map((sys) => {
              const meta = BODY_SYSTEM_META[sys];
              return (
                <span
                  key={sys}
                  title={meta.label}
                  aria-label={meta.label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-sans"
                  style={{ color: meta.colour, borderColor: `${meta.colour}55`, backgroundColor: `${meta.colour}12` }}
                >
                  <span className="material-symbols-outlined text-base">{meta.icon}</span>
                  {meta.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Next due */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider">
            Next due
          </span>
          {due.length === 0 && (
            <span className="font-derived-value text-xs text-[#747686]">No schedule set</span>
          )}
          {due.slice(0, 3).map((d) => {
            const st = DUE_STYLES[d.state];
            return (
              <button
                key={d.task.id}
                type="button"
                onClick={() => handleMarkDone(d.task.id)}
                title={`Mark ${d.task.label} done now`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans min-h-[32px] ${st.chip}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {TASK_KIND_ICON[d.task.kind]}
                </span>
                <span className="font-bold">{d.task.label}</span>
                <span className="opacity-90">{d.label}</span>
              </button>
            );
          })}
          {due.length > 0 && (
            <span className="font-derived-value text-[10px] text-[#747686]">
              tap to mark done
            </span>
          )}
        </div>
      </div>

      {/* Grid Canvas + Intelligence Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Flowsheet Table */}
        <div className="flex-1 overflow-auto p-4">
          {confirmDeleteIdx !== null && patient.flowsheetHistory[confirmDeleteIdx] && (
            <div className="mb-3 bg-white border border-[#B91C1C]/30 rounded p-4" role="alertdialog">
              <p className="font-body-md text-sm text-[#0b1c30]">
                Delete the{' '}
                <strong>{patient.flowsheetHistory[confirmDeleteIdx].time}</strong> round
                {patient.flowsheetHistory[confirmDeleteIdx].recordedBy
                  ? ` recorded by ${patient.flowsheetHistory[confirmDeleteIdx].recordedBy}`
                  : ''}
                ? This removes the observations permanently.
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteRound(confirmDeleteIdx)}
                  className="min-h-[40px] px-4 rounded bg-[#B91C1C] text-white font-label-caps text-xs font-bold"
                >
                  Delete round
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteIdx(null)}
                  className="min-h-[40px] px-4 rounded border border-[#E2E8F0] bg-white font-label-caps text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {editingIdx !== null && patient.flowsheetHistory[editingIdx] && (
            <div className="mb-3 bg-white border border-[#0037b0]/30 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline text-sm font-bold text-[#0b1c30]">
                  Edit round · {patient.flowsheetHistory[editingIdx].time}
                </h3>
                <span className="font-derived-value text-[11px] text-[#747686]">
                  Saved as edited by {clinician || 'Unattributed'}
                </span>
              </div>
              <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(
                  [
                    ['time', 'Time', 'text'],
                    ['heartRate', 'HR (bpm)', 'number'],
                    ['temperature', 'Temp', 'number'],
                    ['respiratoryRate', 'RR', 'number'],
                    ['refluxVolumeL', 'Reflux (L)', 'number'],
                    ['lactate', 'Lactate', 'number'],
                  ] as const
                ).map(([field, label, type]) => (
                  <label key={field} className="block">
                    <span className="font-label-caps text-[10px] text-[#434655] block mb-1">
                      {label}
                    </span>
                    <input
                      type={type}
                      step="0.1"
                      value={editDraft[field] ?? ''}
                      onChange={(e) => setEditDraft({ ...editDraft, [field]: e.target.value })}
                      className="w-full min-h-[40px] px-2 bg-white border border-[#c4c5d7] rounded font-clinical-value text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none no-spinner"
                    />
                  </label>
                ))}
              </div>
              <label className="block mt-3">
                <span className="font-label-caps text-[10px] text-[#434655] block mb-1">Note</span>
                <input
                  value={editDraft.note ?? ''}
                  onChange={(e) => setEditDraft({ ...editDraft, note: e.target.value })}
                  className="w-full min-h-[40px] px-2 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
                />
              </label>
              <div className="flex gap-2 mt-3 items-center">
                <button
                  type="button"
                  onClick={() => saveEditRound(editingIdx)}
                  disabled={!hasClinician}
                  className="min-h-[40px] px-4 rounded bg-[#0037b0] text-white font-label-caps text-xs font-bold disabled:bg-[#c4c5d7] disabled:cursor-not-allowed"
                >
                  Save changes
                </button>
                {!hasClinician && <ClinicianRequiredNotice />}
                <button
                  type="button"
                  onClick={() => setEditingIdx(null)}
                  className="min-h-[40px] px-4 rounded border border-[#E2E8F0] bg-white font-label-caps text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/*
            The card used to clip its own content with overflow-hidden while the
            table was pinned to w-full, so once a patient had more than a few
            rounds the later columns were squeezed to nothing and could not be
            reached. The card now scrolls horizontally and the table takes its
            natural width, so each column keeps its min-width and the parameter
            column stays pinned on the left as you scroll along.
          */}
          {earlierCount > 0 && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowEarlier((v) => !v)}
                className="text-xs font-label-caps text-[#0037b0] underline"
              >
                {showEarlier
                  ? 'Hide earlier admission rounds'
                  : `Show ${earlierCount} earlier admission round${earlierCount === 1 ? '' : 's'}`}
              </button>
            </div>
          )}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-x-auto overflow-y-visible relative">
            <table className="text-left border-collapse min-w-full w-max">
              {/* Header Row */}
              <thead className="sticky top-0 z-20 bg-[#f8f9ff] shadow-sm">
                <tr>
                  <th className="sticky left-0 z-30 bg-[#f8f9ff] px-4 py-3 border-b border-r border-[#E2E8F0] w-52 font-label-caps text-xs text-[#434655]">
                    Parameter
                  </th>
                  {visibleColumns.map((col, idx) => (
                    <th
                      key={idx}
                      className={`px-2 py-2 border-b border-r border-[#E2E8F0] font-clinical-value text-sm text-center min-w-[110px] align-top ${
                        idx === visibleColumns.length - 1 ? 'bg-[#e5eeff] font-bold text-[#0037b0]' : ''
                      }`}
                    >
                      <span className="block">{col.time}</span>
                      <span className="block font-derived-value text-[9px] text-[#747686] font-normal truncate">
                        {col.recordedBy || 'Unattributed'}
                        {col.editedBy && ' · edited'}
                      </span>
                      <span className="flex items-center justify-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => startEditRound(realIndex(col))}
                          title={`Edit the ${col.time} round`}
                          aria-label={`Edit the ${col.time} round`}
                          className="w-7 h-7 rounded hover:bg-white/70 text-[#434655] flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteIdx(realIndex(col))}
                          title={`Delete the ${col.time} round`}
                          aria-label={`Delete the ${col.time} round`}
                          className="w-7 h-7 rounded hover:bg-white/70 text-[#B91C1C] flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 border-b border-[#E2E8F0] font-label-caps text-xs text-[#0037b0] text-center min-w-[120px] bg-[#eff4ff]">
                    + New Entry
                  </th>
                </tr>
              </thead>

              <tbody className="font-clinical-value text-sm tabular-nums">
                {/* Section Header: Vitals */}
                <tr>
                  <td colSpan={colCount} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#1D4ED8] uppercase tracking-wider font-bold">
                    Vitals
                  </td>
                </tr>

                {/* Row: Heart Rate */}
                <tr className="group hover:bg-[#f8f9ff] transition relative">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1D4ED8]" />
                    <div className="flex flex-col">
                      <span className="text-[#0b1c30] font-bold">Heart Rate</span>
                      <span className="text-[10px] text-[#434655] uppercase font-sans">bpm</span>
                    </div>
                  </td>
                  {visibleColumns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-4 py-3 border-b border-r border-[#E2E8F0] text-center ${getHRClass(col.vitals.heartRate)}`}
                    >
                      {col.vitals.heartRate ? `${col.vitals.heartRate} ↗` : '--'}
                    </td>
                  ))}
                  <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff]">
                    <input 
                      type="number"
                      placeholder="--"
                      value={newHR}
                      onChange={(e) => { setNewHR(e.target.value); setIsAddingEntry(true); }}
                      className="w-full bg-white border border-[#c4c5d7] rounded text-center font-clinical-value text-xs py-1 text-[#0b1c30] focus:ring-1 focus:ring-[#0037b0] no-spinner"
                    />
                  </td>
                </tr>

                {/* Row: Temperature */}
                <tr className="group hover:bg-[#f8f9ff] transition relative">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#1D4ED8]" />
                    <div className="flex flex-col">
                      <span className="text-[#0b1c30] font-bold">Temperature</span>
                      <span className="text-[10px] text-[#434655] uppercase font-sans">
                        {patient.isFoal ? '°F' : '°C'}
                      </span>
                    </div>
                  </td>
                  {visibleColumns.map((col, idx) => {
                    const temp = patient.isFoal ? col.vitals.temperatureF : col.vitals.temperatureC;
                    return (
                      <td 
                        key={idx} 
                        className={`px-4 py-3 border-b border-r border-[#E2E8F0] text-center ${getTempClass(temp)}`}
                      >
                        {temp ? `${temp} ↗` : '--'}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff]">
                    <input 
                      type="number"
                      placeholder="--"
                      value={newTemp}
                      onChange={(e) => { setNewTemp(e.target.value); setIsAddingEntry(true); }}
                      className="w-full bg-white border border-[#c4c5d7] rounded text-center font-clinical-value text-xs py-1 text-[#0b1c30] focus:ring-1 focus:ring-[#0037b0] no-spinner"
                    />
                  </td>
                </tr>

                {structuredRow(
                  'crt',
                  'CRT',
                  '#1D4ED8',
                  (c) => (c.vitals.crtSeconds !== undefined ? `${c.vitals.crtSeconds} s` : undefined),
                )}
                {structuredRow(
                  'mm',
                  'Mucous membranes',
                  '#1D4ED8',
                  (c) => c.vitals.mucousMembranes,
                  'mucousMembranes',
                )}
                {structuredRow(
                  'mentation',
                  'Mentation',
                  '#1D4ED8',
                  (c) => c.vitals.mentation,
                  'mentation',
                )}

                {/* Section Header: Pain */}
                {visibleColumns.some((c) => c.pain) && (
                  <>
                    {sectionRow('Pain & Analgesia', '#6D28D9')}
                    {structuredRow(
                      'pain-score',
                      'Pain score',
                      '#6D28D9',
                      (c) => (c.pain?.score !== undefined ? `${c.pain.score}/3` : undefined),
                    )}
                    {structuredRow(
                      'pain-behaviour',
                      'Pain behaviour',
                      '#6D28D9',
                      (c) => c.pain?.behaviour,
                      'painBehaviour',
                    )}
                    {structuredRow(
                      'analgesia',
                      'Analgesia given',
                      '#6D28D9',
                      (c) => c.pain?.analgesia,
                      'analgesia',
                    )}
                  </>
                )}

                {/* Section Header: GI / Colic */}
                <tr>
                  <td colSpan={colCount} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#B45309] uppercase tracking-wider font-bold">
                    GI / Colic
                  </td>
                </tr>

                {/* Row: Gut sounds — four quadrants */}
                {visibleColumns.some((c) => c.gi.gutSounds) && (
                  <tr className="group hover:bg-[#f8f9ff] transition relative">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B45309]" />
                      <div className="flex flex-col">
                        <span className="text-[#0b1c30] font-bold">Gut sounds</span>
                        <span className="text-[10px] text-[#434655] uppercase font-sans">
                          4 quadrants
                        </span>
                      </div>
                    </td>
                    {visibleColumns.map((col, idx) => {
                      const q = col.gi.gutSounds;
                      if (!q) {
                        return (
                          <td
                            key={idx}
                            className="px-3 py-2 border-b border-r border-[#E2E8F0] text-center text-[#94a3b8]"
                          >
                            --
                          </td>
                        );
                      }
                      const s = summariseGutSounds(q);
                      return (
                        <td
                          key={idx}
                          className="px-3 py-2 border-b border-r border-[#E2E8F0] text-center align-middle"
                        >
                          <GutSoundsGlyph value={q} size={40} />
                          <span className="block text-[9px] text-[#747686] font-sans mt-0.5">
                            {s.activeQuadrants}/4 active
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff] text-[10px] text-[#747686] font-sans">
                      Record round
                    </td>
                  </tr>
                )}

                {/* Row: Reflux Volume */}
                <tr className="group hover:bg-[#f8f9ff] transition relative">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B45309]" />
                    <div className="flex flex-col">
                      <span className="text-[#0b1c30] font-bold">Reflux Vol</span>
                      <span className="text-[10px] text-[#434655] uppercase font-sans">Liters</span>
                    </div>
                  </td>
                  {visibleColumns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-4 py-3 border-b border-r border-[#E2E8F0] text-center ${getRefluxClass(col.gi.refluxVolumeL)}`}
                    >
                      {col.gi.refluxVolumeL !== undefined ? `${col.gi.refluxVolumeL} L ↗` : '--'}
                    </td>
                  ))}
                  <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff]">
                    <input 
                      type="number"
                      placeholder="--"
                      value={newReflux}
                      onChange={(e) => { setNewReflux(e.target.value); setIsAddingEntry(true); }}
                      className="w-full bg-white border border-[#c4c5d7] rounded text-center font-clinical-value text-xs py-1 text-[#0b1c30] focus:ring-1 focus:ring-[#0037b0] no-spinner"
                    />
                  </td>
                </tr>

                {structuredRow(
                  'reflux-appearance',
                  'Reflux appearance',
                  '#B45309',
                  (c) => c.gi.refluxAppearance,
                  'refluxAppearance',
                )}
                {structuredRow(
                  'ngt',
                  'Nasogastric tube',
                  '#B45309',
                  (c) => c.gi.nasogastricTube,
                  'nasogastricTube',
                )}
                {structuredRow(
                  'manure',
                  'Manure passed',
                  '#B45309',
                  (c) => (c.gi.manure ? formatManure(c.gi.manure) : undefined),
                )}
                {structuredRow(
                  'rectal',
                  'Rectal examination',
                  '#B45309',
                  (c) => c.gi.rectalExam,
                  'rectalExam',
                )}
                {structuredRow(
                  'flash',
                  'FLASH ultrasound',
                  '#B45309',
                  (c) => c.gi.flashUltrasound,
                  'flashUltrasound',
                )}
                {structuredRow(
                  'peritoneal',
                  'Peritoneal fluid',
                  '#B45309',
                  (c) => c.gi.peritonealFluid,
                  'peritonealFluid',
                )}
                {structuredRow(
                  'response',
                  'Response to therapy',
                  '#B45309',
                  (c) => c.gi.responseToTherapy,
                  'responseToTherapy',
                )}

                {/* Section Header: Labs */}
                <tr>
                  <td colSpan={colCount} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#0E7490] uppercase tracking-wider font-bold">
                    Labs
                  </td>
                </tr>

                {/* Row: Lactate */}
                <tr className="group hover:bg-[#f8f9ff] transition relative">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0E7490]" />
                    <div className="flex flex-col">
                      <span className="text-[#0b1c30] font-bold">Lactate</span>
                      <span className="text-[10px] text-[#434655] uppercase font-sans">mmol/L</span>
                    </div>
                  </td>
                  {visibleColumns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`px-4 py-3 border-b border-r border-[#E2E8F0] text-center ${getLactateClass(col.labs.lactate)}`}
                    >
                      {col.labs.lactate ? `${col.labs.lactate} ↗` : 'Pend'}
                    </td>
                  ))}
                  <td className="px-2 py-2 border-b border-[#E2E8F0] text-center bg-[#eff4ff]">
                    <input 
                      type="number"
                      step="0.1"
                      placeholder="--"
                      value={newLactate}
                      onChange={(e) => { setNewLactate(e.target.value); setIsAddingEntry(true); }}
                      className="w-full bg-white border border-[#c4c5d7] rounded text-center font-clinical-value text-xs py-1 text-[#0b1c30] focus:ring-1 focus:ring-[#0037b0] no-spinner"
                    />
                  </td>
                </tr>

                {/* Section: Laminitis watch */}
                {visibleColumns.some((c) => c.laminitis) && (
                  <>
                    {sectionRow('Laminitis Watch', '#A21CAF')}
                    {structuredRow(
                      'digital-pulse',
                      'Digital pulse',
                      '#A21CAF',
                      (c) => c.laminitis?.digitalPulse,
                      'digitalPulse',
                    )}
                    {structuredRow(
                      'obel',
                      'Obel grade',
                      '#A21CAF',
                      (c) =>
                        c.laminitis?.obelGrade !== undefined
                          ? `${c.laminitis.obelGrade}/4`
                          : undefined,
                    )}
                    {structuredRow(
                      'cryo',
                      'Cryotherapy',
                      '#A21CAF',
                      (c) => c.laminitis?.cryotherapy,
                      'cryotherapy',
                    )}
                  </>
                )}

                {/* Section: Catheter & incision */}
                {visibleColumns.some((c) => c.support) && (
                  <>
                    {sectionRow('Catheter & Incision', '#0E7490')}
                    {structuredRow(
                      'catheter',
                      'IV catheter site',
                      '#0E7490',
                      (c) => c.support?.ivCatheterSite,
                      'ivCatheterSite',
                    )}
                    {structuredRow(
                      'incision',
                      'Incision status',
                      '#0E7490',
                      (c) => c.support?.incisionStatus,
                      'incisionStatus',
                    )}
                  </>
                )}
              </tbody>
            </table>

            {/* Quick Action Footer for Adding Data */}
            {isAddingEntry && (
              <div className="p-3 bg-[#e5eeff] border-t border-[#E2E8F0] flex justify-end items-center gap-2">
                {!hasClinician && <ClinicianRequiredNotice />}
                <span className="text-xs font-derived-value text-[#434655]">
                  New entry ready to save
                </span>
                <button
                  onClick={handleAddNewTimepoint}
                  disabled={!hasClinician}
                  className="bg-[#0037b0] hover:bg-[#1d4ed8] disabled:bg-[#c4c5d7] disabled:cursor-not-allowed text-white text-xs font-label-caps px-4 py-1.5 rounded shadow-sm font-bold"
                >
                  Save Column Entry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Intelligence Panel */}
        <aside className="w-80 bg-white border-l border-[#E2E8F0] hidden xl:flex flex-col overflow-y-auto p-4 space-y-6">
          <div className="border-b border-[#E2E8F0] pb-3">
            <h3 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-2">
              Live Intelligence
            </h3>

            {/* SIRS Alert Chip */}
            {patient.sirsCriteriaMet && (
              <div className="bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded p-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#B91C1C] animate-pulse-critical" />
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[#B91C1C] text-lg mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  <div>
                    <p className="font-label-caps text-xs text-[#B91C1C] font-bold">
                      SIRS Criteria Met
                    </p>
                    <p className="font-derived-value text-xs text-[#434655] mt-1">
                      {patient.sirsDescription}
                    </p>
                    <span className="inline-block mt-2 bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] text-[9px] text-[#747686] font-sans tracking-widest">
                      [SIRS 2016]
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Call-surgeon triggers, computed from the latest charted round */}
            {triggers.length > 0 && (
              <div className="mt-3" role="status" aria-live="polite">
                <p className="font-label-caps text-[11px] text-[#B91C1C] font-bold uppercase tracking-wider mb-1.5">
                  Call-surgeon triggers · {triggers.length}
                </p>
                <ul className="space-y-1.5">
                  {triggers.map((t) => (
                    <li
                      key={t.id}
                      className="bg-white border border-[#E2E8F0] rounded p-2 flex items-start gap-2"
                    >
                      <span
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          t.severity === 'critical'
                            ? 'bg-[#B91C1C]'
                            : t.severity === 'warning'
                              ? 'bg-[#C2410C]'
                              : 'bg-[#B45309]'
                        }`}
                        aria-hidden
                      />
                      <span className="text-xs leading-tight">
                        <span className="font-bold text-[#0b1c30] block">{t.label}</span>
                        <span className="text-[#434655]">{t.evidence}</span>
                        <span className="block text-[10px] text-[#747686] font-sans">
                          {t.rule}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[9px] text-[#747686] font-sans mt-1.5">
                  Ward escalation rules — decision support only.
                </p>
              </div>
            )}
          </div>

          {/* Trends, drawn from the charted columns */}
          <div className="space-y-4">
            {TREND_SERIES.map((s) => {
              const points = visibleColumns.map((col) => ({
                value: s.pick(col),
                label: col.time,
              }));
              const latest = [...points].reverse().find((p) => Number.isFinite(p.value));
              const out =
                latest &&
                ((s.referenceMax !== undefined && (latest.value as number) > s.referenceMax) ||
                  (s.referenceMin !== undefined && (latest.value as number) < s.referenceMin));
              return (
                <div key={s.id}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-label-caps text-xs" style={{ color: s.color }}>
                      {s.label}
                    </span>
                    {latest ? (
                      <span
                        className={`font-clinical-value text-xs px-1.5 py-0.5 rounded ${
                          out
                            ? 'bg-[#B91C1C] text-white'
                            : 'bg-[#ECFDF5] text-[#047857] border border-[#047857]/30'
                        }`}
                      >
                        {latest.value} {s.units}
                      </span>
                    ) : (
                      <span className="font-derived-value text-[10px] text-[#747686]">
                        no value
                      </span>
                    )}
                  </div>
                  <Sparkline
                    points={points}
                    referenceMin={s.referenceMin}
                    referenceMax={s.referenceMax}
                    color={s.color}
                    height={44}
                    label={s.label}
                  />
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
