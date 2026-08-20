import React, { useMemo, useRef, useState } from 'react';
import type { Patient, LabPanel } from '../../types';
import {
  LAB_SECTIONS,
  computeDerived,
  derivedInSection,
  differentialCheck,
  flagValue,
  formatRange,
  LAB_FLAG_STYLE,
  type LabSection,
  type LabField,
  type DerivedResult,
} from '../../utils/labs';
import { extractLabValuesFromPdf, type ExtractedLabValue } from '../../utils/pdfLabExtractor';
import { useEnterAdvance } from '../../utils/formNavigation';
import { clockTime, dayLabel, newId } from '../../utils/treatments';
import { patientAge } from '../../data/patientIdentity';
import { ClinicianRequiredNotice } from '../ui/ClinicianRequiredNotice';
import { SalmonellaPanel } from './SalmonellaPanel';

interface LabPanelViewProps {
  patient: Patient;
  clinician: string;
  onUpdatePatient: (patient: Patient) => void;
}

const SECTION_ACCENT: Record<LabSection, string> = {
  Haematology: '#B91C1C',
  Differential: '#6D28D9',
  Chemistry: '#0E7490',
  'Blood gas': '#0037b0',
  Immunology: '#B45309',
};

const isoLocal = (d: Date): string => {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const SAMPLE_TYPES = [
  'Venous blood',
  'Arterial blood',
  'Jugular catheter',
  'Peritoneal fluid',
  'Synovial fluid',
  'Cerebrospinal fluid',
];

/**
 * The full laboratory panel.
 *
 * Entered parameters and calculated ones are kept visibly separate. A field the
 * analyser reports gets an input; a field that is arithmetic on other fields
 * gets a read-only row showing the value, the formula, and — when an input is
 * missing — exactly which one, so it is obvious what to type next rather than
 * the row simply being blank.
 */
export const LabPanelView: React.FC<LabPanelViewProps> = ({
  patient,
  clinician,
  onUpdatePatient,
}) => {
  const panels = useMemo(
    () =>
      [...(patient.labPanels ?? [])].sort(
        (a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime(),
      ),
    [patient.labPanels],
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(panels[0]?.id ?? null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [collectedAt, setCollectedAt] = useState(() => isoLocal(new Date()));
  const [sampleType, setSampleType] = useState(SAMPLE_TYPES[0]);
  const [note, setNote] = useState('');
  const [openSections, setOpenSections] = useState<Set<LabSection>>(
    new Set<LabSection>(['Haematology', 'Chemistry']),
  );
  const [hideEmpty, setHideEmpty] = useState(true);

  // PDF import — a staging area, not a save path. Extraction only ever
  // populates this list; nothing reaches `draft` (and so nothing reaches the
  // patient record) until the reviewer explicitly accepts each row.
  const [importRows, setImportRows] = useState<(ExtractedLabValue & { include: boolean })[] | null>(
    null,
  );
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const advanceOnEnter = useEnterAdvance(formRef);

  const now = new Date();
  const age = patientAge(patient, now);
  const editing = editingId !== null;
  const viewing = panels.find((p) => p.id === viewingId);

  const numericDraft = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(draft)) {
      const n = Number(v);
      // A charted zero is a result. Only a blank field is "not entered".
      if (v.trim() !== '' && Number.isFinite(n)) out[k] = n;
    }
    return out;
  }, [draft]);

  const activeValues = useMemo(
    () => (editing ? numericDraft : (viewing?.values ?? {})),
    [editing, numericDraft, viewing],
  );
  const derived = useMemo(() => computeDerived(activeValues), [activeValues]);
  const diffCheck = useMemo(() => differentialCheck(activeValues), [activeValues]);
  const enteredCount = Object.keys(activeValues).length;

  const write = (labPanels: LabPanel[]) => onUpdatePatient({ ...patient, labPanels });

  // No clinician, no save — see CLAUDE.md rule 2 and Architecture principle A.
  const hasClinician = !!clinician?.trim();

  const resetImport = () => {
    setImportRows(null);
    setImportError(null);
    setImportBusy(false);
  };

  const startNew = () => {
    setDraft({});
    setCollectedAt(isoLocal(new Date()));
    setSampleType(SAMPLE_TYPES[0]);
    setNote('');
    setEditingId('new');
    resetImport();
  };

  const startEdit = (panel: LabPanel) => {
    setDraft(
      Object.fromEntries(Object.entries(panel.values).map(([k, v]) => [k, String(v)])),
    );
    setCollectedAt(isoLocal(new Date(panel.collectedAt)));
    setSampleType(panel.sampleType ?? SAMPLE_TYPES[0]);
    setNote(panel.note ?? '');
    setEditingId(panel.id);
    resetImport();
  };

  const cancelEditing = () => {
    setEditingId(null);
    resetImport();
  };

  /**
   * Reads a PDF entirely client-side (no backend exists to send it to — see
   * CLAUDE.md Architecture principle A) and matches it against known lab
   * fields. Extraction is heuristic by nature — different analysers and labs
   * lay out the same panel differently — so this only ever populates the
   * review table below; see acceptImport for the one path from there into
   * the actual form.
   */
  const handlePdfSelected = async (file: File | undefined) => {
    if (!file) return;
    setImportBusy(true);
    setImportError(null);
    setImportRows(null);
    try {
      const { matches } = await extractLabValuesFromPdf(file);
      if (matches.length === 0) {
        setImportError(
          `No recognisable lab values found in "${file.name}". Enter results manually below.`,
        );
      } else {
        setImportRows(matches.map((m) => ({ ...m, include: true })));
      }
    } catch {
      setImportError(`Could not read "${file.name}" as a PDF. Enter results manually below.`);
    } finally {
      setImportBusy(false);
    }
  };

  const updateImportRow = (
    fieldId: string,
    patch: Partial<ExtractedLabValue & { include: boolean }>,
  ) =>
    setImportRows((rows) =>
      rows ? rows.map((r) => (r.fieldId === fieldId ? { ...r, ...patch } : r)) : rows,
    );

  /**
   * The only bridge from an extracted PDF value into the form — and it lands
   * in `draft`, the exact same state manual typing writes to, so an accepted
   * value is flagged, edited and saved through the identical path a typed one
   * is. Nothing here touches `patient.labPanels` directly.
   */
  const acceptImport = () => {
    if (!importRows) return;
    const accepted = importRows.filter((r) => r.include);
    if (accepted.length === 0) return;
    setDraft((d) => {
      const next = { ...d };
      for (const r of accepted) next[r.fieldId] = String(r.value);
      return next;
    });
    setOpenSections((prev) => {
      const next = new Set(prev);
      for (const r of accepted) next.add(r.field.section);
      return next;
    });
    setImportRows(null);
  };

  const save = () => {
    if (enteredCount === 0 || !hasClinician) return;
    const base = {
      collectedAt: new Date(collectedAt).toISOString(),
      sampleType,
      values: numericDraft,
      note: note.trim() || undefined,
      // save() blocks the write until a clinician is set. collectedAt is the
      // clinical event time the user chose, not the write time, so this
      // doesn't route through stampRecorded the way other write paths do —
      // there's no separate "when was this saved" field to pair it with.
      recordedBy: clinician,
    };
    if (editingId === 'new') {
      const panel: LabPanel = { id: newId('lab'), ...base };
      write([...(patient.labPanels ?? []), panel]);
      setViewingId(panel.id);
    } else {
      write(
        (patient.labPanels ?? []).map((p) =>
          p.id === editingId ? { ...p, ...base } : p,
        ),
      );
      setViewingId(editingId);
    }
    setEditingId(null);
    resetImport();
  };

  const remove = (panel: LabPanel) => {
    if (!window.confirm(`Delete the panel collected ${clockTime(panel.collectedAt)}?`)) return;
    write((patient.labPanels ?? []).filter((p) => p.id !== panel.id));
    if (viewingId === panel.id) setViewingId(null);
  };

  const toggleSection = (s: LabSection) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 lg:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#0b1c30]">
              Laboratory
            </h1>
            <p className="font-body-md text-sm text-[#434655] mt-0.5">
              {patient.name} · {age.label} · intervals shown are the{' '}
              {age.ageClass === 'ADULT' ? 'adult' : 'foal'} reference set
              {age.between && ' (age falls between published cohorts)'}
            </p>
          </div>
          {!editing && (
            <button
              onClick={startNew}
              className="px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New panel
            </button>
          )}
        </div>

        {!editing && (
          <SalmonellaPanel patient={patient} clinician={clinician} onUpdatePatient={onUpdatePatient} />
        )}

        {/* Panel picker */}
        {panels.length > 0 && !editing && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {panels.map((p) => {
              const active = viewingId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setViewingId(p.id)}
                  className={`flex-shrink-0 text-left px-3 py-2 rounded border transition-colors ${
                    active
                      ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                      : 'bg-white text-[#434655] border-[#E2E8F0] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className="font-derived-value text-sm font-bold">
                    {clockTime(p.collectedAt)}
                  </div>
                  <div className="font-label-caps text-[10px] opacity-80">
                    {dayLabel(p.collectedAt, now)} · {Object.keys(p.values).length} results
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {editing ? (
          <div ref={formRef} onKeyDown={advanceOnEnter}>
            {/* Panel header */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 mb-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="lab-collected"
                    className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1"
                  >
                    Collected
                  </label>
                  <input
                    id="lab-collected"
                    type="datetime-local"
                    value={collectedAt}
                    onChange={(e) => setCollectedAt(e.target.value)}
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lab-sample"
                    className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1"
                  >
                    Sample
                  </label>
                  <select
                    id="lab-sample"
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white"
                  >
                    {SAMPLE_TYPES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="lab-note"
                    className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1"
                  >
                    Note
                  </label>
                  <input
                    id="lab-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <p className="font-derived-value text-[11px] text-[#747686] mt-2">
                Press <kbd className="px-1 border border-[#c4c5d7] rounded bg-[#f8f9ff]">Enter</kbd>{' '}
                to jump to the next field. Calculated parameters have no input — they are
                worked out from what you enter.
              </p>
            </div>

            {/* PDF import — a staging table, not a save path. See handlePdfSelected /
                acceptImport: nothing here reaches the patient record without the
                reviewer accepting each row, and the row still has to be entered
                through "Save panel" below like anything typed by hand. */}
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-headline text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    Import from a PDF report
                  </h3>
                  <p className="font-derived-value text-[11px] text-[#747686] mt-0.5 max-w-md">
                    Reads the PDF entirely on this device — nothing is uploaded anywhere.
                    Matching is best-effort and must be checked against the source before you
                    accept it; nothing is saved until you press "Save panel" below.
                  </p>
                </div>
                <label className="px-3 py-1.5 text-xs font-label-caps bg-white border border-[#0037b0]/40 text-[#0037b0] rounded hover:bg-[#eff4ff] cursor-pointer flex-shrink-0 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    {importBusy ? 'hourglass_top' : 'attach_file'}
                  </span>
                  {importBusy ? 'Reading…' : 'Choose PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={importBusy}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handlePdfSelected(file);
                    }}
                  />
                </label>
              </div>

              {importError && (
                <p className="font-derived-value text-xs text-[#B45309] bg-[#FFFBEB] border border-[#B45309]/30 rounded p-2 mt-2">
                  {importError}
                </p>
              )}

              {importRows && (
                <div className="border border-[#E2E8F0] rounded overflow-hidden mt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#f8f9ff] border-b border-[#E2E8F0]">
                        <tr className="text-left font-label-caps text-[10px] text-[#747686] uppercase">
                          <th className="p-2 w-8"></th>
                          <th className="p-2">Field</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Matched from PDF — check this against the report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {importRows.map((r) => (
                          <tr key={r.fieldId} className={r.include ? '' : 'opacity-40'}>
                            <td className="p-2 align-top">
                              <input
                                type="checkbox"
                                checked={r.include}
                                onChange={(e) =>
                                  updateImportRow(r.fieldId, { include: e.target.checked })
                                }
                                className="accent-[#0037b0]"
                              />
                            </td>
                            <td className="p-2 align-top font-body-md text-[#0b1c30] whitespace-nowrap">
                              {r.field.name}
                              <span className="block text-[10px] text-[#747686]">
                                {r.field.units}
                              </span>
                            </td>
                            <td className="p-2 align-top">
                              <input
                                type="number"
                                step="any"
                                value={r.value}
                                onChange={(e) =>
                                  updateImportRow(r.fieldId, { value: Number(e.target.value) })
                                }
                                className="w-24 font-clinical-value text-sm px-1.5 py-1 border border-[#c4c5d7] rounded no-spinner"
                              />
                            </td>
                            <td
                              className="p-2 align-top font-derived-value text-[10px] text-[#747686] max-w-xs truncate"
                              title={r.sourceLine}
                            >
                              "{r.sourceLine}"
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 p-2 bg-[#f8f9ff] border-t border-[#E2E8F0]">
                    <span className="font-derived-value text-[11px] text-[#434655] self-center mr-auto">
                      {importRows.filter((r) => r.include).length} of {importRows.length} selected
                    </span>
                    <button
                      onClick={() => setImportRows(null)}
                      className="px-2.5 py-1 text-xs font-label-caps text-[#434655] rounded hover:bg-white"
                    >
                      Discard
                    </button>
                    <button
                      onClick={acceptImport}
                      disabled={importRows.every((r) => !r.include)}
                      className="px-3 py-1 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Insert into form below
                    </button>
                  </div>
                </div>
              )}
            </div>

            {LAB_SECTIONS.map(({ section, fields }) => (
              <SectionCard
                key={section}
                section={section}
                open={openSections.has(section)}
                onToggle={() => toggleSection(section)}
                enteredCount={fields.filter((f) => activeValues[f.id] !== undefined).length}
                totalCount={fields.length}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 p-3">
                  {fields.map((f) => (
                    <EntryField
                      key={f.id}
                      field={f}
                      value={draft[f.id] ?? ''}
                      onChange={(v) => setDraft((d) => ({ ...d, [f.id]: v }))}
                    />
                  ))}
                </div>
                <DerivedBlock results={derivedInSection(derived, section)} />
                {section === 'Differential' && diffCheck && (
                  <p
                    className={`mx-3 mb-3 font-derived-value text-xs rounded border p-2 ${
                      diffCheck.agrees
                        ? 'bg-[#ECFDF5] border-[#047857]/30 text-[#047857]'
                        : 'bg-[#FFF7ED] border-[#C2410C]/40 text-[#C2410C]'
                    }`}
                  >
                    Differential sums to {diffCheck.sum} K/µL against a white cell count of{' '}
                    {diffCheck.wbc} K/µL —{' '}
                    {diffCheck.agrees ? 'consistent' : 'these do not agree; check the entry'}.
                  </p>
                )}
              </SectionCard>
            ))}

            <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-[#F8FAFC] py-3 border-t border-[#E2E8F0]">
              <span className="font-derived-value text-xs text-[#434655] self-center mr-auto">
                {enteredCount} result{enteredCount === 1 ? '' : 's'} entered ·{' '}
                {derived.filter((d) => d.value !== undefined).length} calculated
              </span>
              <button
                onClick={cancelEditing}
                className="px-3 py-1.5 text-xs font-label-caps text-[#434655] rounded hover:bg-[#eff4ff]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={enteredCount === 0 || !hasClinician}
                className="px-4 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] disabled:opacity-40"
              >
                Save panel
              </button>
              {!hasClinician && <ClinicianRequiredNotice className="self-center" />}
            </div>
          </div>
        ) : viewing ? (
          <div>
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-3 mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="font-derived-value text-sm text-[#434655]">
                Collected {clockTime(viewing.collectedAt)} {dayLabel(viewing.collectedAt, now)} ·{' '}
                {viewing.sampleType} · {viewing.recordedBy || 'Unattributed'}
                {viewing.note && ` · ${viewing.note}`}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 font-label-caps text-[10px] text-[#434655]">
                  <input
                    type="checkbox"
                    checked={hideEmpty}
                    onChange={(e) => setHideEmpty(e.target.checked)}
                    className="accent-[#0037b0]"
                  />
                  Hide unmeasured
                </label>
                <button
                  onClick={() => startEdit(viewing)}
                  className="px-2.5 py-1 text-xs font-label-caps border border-[#E2E8F0] rounded text-[#434655] hover:bg-[#eff4ff]"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(viewing)}
                  className="px-2.5 py-1 text-xs font-label-caps border border-[#B91C1C]/40 rounded text-[#B91C1C] hover:bg-[#B91C1C]/5"
                >
                  Delete
                </button>
              </div>
            </div>

            {LAB_SECTIONS.map(({ section, fields }) => {
              const rows = hideEmpty
                ? fields.filter((f) => activeValues[f.id] !== undefined)
                : fields;
              const derivedRows = derivedInSection(derived, section).filter(
                (d) => !hideEmpty || d.value !== undefined,
              );
              if (rows.length === 0 && derivedRows.length === 0) return null;
              return (
                <SectionCard
                  key={section}
                  section={section}
                  open={openSections.has(section)}
                  onToggle={() => toggleSection(section)}
                  enteredCount={fields.filter((f) => activeValues[f.id] !== undefined).length}
                  totalCount={fields.length}
                >
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {rows.map((f) => (
                        <ResultRow
                          key={f.id}
                          name={f.name}
                          units={f.units}
                          value={activeValues[f.id]}
                          range={f.range}
                        />
                      ))}
                      {derivedRows.map((d) => (
                        <ResultRow
                          key={d.parameter.id}
                          name={d.parameter.name}
                          units={d.parameter.units}
                          value={d.value}
                          range={d.parameter.range}
                          calculated={d.parameter.formula}
                          missing={d.missing}
                        />
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              );
            })}

            {diffCheck && !diffCheck.agrees && (
              <p className="font-derived-value text-xs bg-[#FFF7ED] border border-[#C2410C]/40 text-[#C2410C] rounded p-2.5 mt-3">
                The differential sums to {diffCheck.sum} K/µL but the white cell count is{' '}
                {diffCheck.wbc} K/µL. One of them has been mistyped.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#c4c5d7] rounded-lg p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c5d7]">science</span>
            <p className="font-body-md text-sm text-[#434655] mt-2 max-w-md mx-auto">
              No laboratory panel on file for {patient.name}. Enter what the analyser
              reported — the red cell indices, differential percentages, globulin and the
              albumin:globulin ratio are worked out for you.
            </p>
            <button
              onClick={startNew}
              className="mt-3 px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8]"
            >
              Enter the first panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const SectionCard: React.FC<{
  section: LabSection;
  open: boolean;
  onToggle: () => void;
  enteredCount: number;
  totalCount: number;
  children: React.ReactNode;
}> = ({ section, open, onToggle, enteredCount, totalCount, children }) => (
  <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden mb-3">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-3 p-3 bg-[#f8f9ff] border-b border-[#E2E8F0] text-left"
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-1 h-6 rounded flex-shrink-0"
          style={{ backgroundColor: SECTION_ACCENT[section] }}
        />
        <span className="font-headline text-base font-bold text-[#0b1c30]">{section}</span>
        <span className="font-derived-value text-xs text-[#747686]">
          {enteredCount} of {totalCount} measured
        </span>
      </span>
      <span className="material-symbols-outlined text-[#434655]">
        {open ? 'expand_less' : 'expand_more'}
      </span>
    </button>
    {open && children}
  </section>
);

const EntryField: React.FC<{
  field: LabField;
  value: string;
  onChange: (v: string) => void;
}> = ({ field, value, onChange }) => {
  const n = value.trim() === '' ? undefined : Number(value);
  const flag = flagValue(field.range, Number.isFinite(n) ? n : undefined);
  const style = flag ? LAB_FLAG_STYLE[flag] : undefined;

  return (
    <div>
      <label
        htmlFor={`lab-${field.id}`}
        className="font-label-caps text-[10px] text-[#434655] block mb-0.5 truncate"
        title={field.name}
      >
        {field.name}
        {field.units && <span className="text-[#747686]"> ({field.units})</span>}
      </label>
      <div className="flex items-center gap-1.5">
        <input
          id={`lab-${field.id}`}
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-clinical-value text-sm px-2 py-1.5 border-2 rounded focus:outline-none focus:ring-1 no-spinner"
          style={{
            borderColor:
              flag && flag !== 'normal'
                ? flag.startsWith('critical')
                  ? '#B91C1C'
                  : '#C2410C'
                : '#c4c5d7',
          }}
        />
        {style && flag !== 'normal' && (
          <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${style.chip}`}>
            {style.mark}
          </span>
        )}
      </div>
      <span className="font-derived-value text-[10px] text-[#747686]">
        {formatRange(field.range)}
        {field.hint ? ` · ${field.hint}` : ''}
      </span>
    </div>
  );
};

const DerivedBlock: React.FC<{ results: DerivedResult[] }> = ({ results }) => {
  if (results.length === 0) return null;
  return (
    <div className="mx-3 mb-3 border border-[#E2E8F0] rounded bg-[#f8f9ff] overflow-hidden">
      <div className="px-3 py-1.5 border-b border-[#E2E8F0] font-label-caps text-[10px] tracking-widest text-[#747686] uppercase flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">function</span>
        Calculated — not entered
      </div>
      <ul className="divide-y divide-[#E2E8F0]">
        {results.map((r) => {
          const flag = flagValue(r.parameter.range, r.value);
          const style = flag ? LAB_FLAG_STYLE[flag] : undefined;
          return (
            <li
              key={r.parameter.id}
              className="flex items-center justify-between gap-3 px-3 py-1.5"
            >
              <span className="min-w-0">
                <span className="font-body-md text-xs text-[#0b1c30]">
                  {r.parameter.name}
                </span>
                <span className="block font-derived-value text-[10px] text-[#747686]">
                  {r.parameter.formula}
                </span>
              </span>
              <span className="text-right flex-shrink-0">
                {r.value === undefined ? (
                  <span className="font-derived-value text-[11px] text-[#747686] italic">
                    {r.missing.length ? `needs ${r.missing.join(' and ')}` : 'not computable'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 justify-end">
                    <span
                      className={`font-clinical-value text-sm ${style?.text ?? 'text-[#0b1c30]'}`}
                    >
                      {r.value} {r.parameter.units}
                    </span>
                    {style && flag !== 'normal' && (
                      <span className={`text-[10px] font-bold px-1 rounded ${style.chip}`}>
                        {style.mark}
                      </span>
                    )}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ResultRow: React.FC<{
  name: string;
  units: string;
  value?: number;
  range?: { referenceMin: number; referenceMax: number; criticalMin?: number; criticalMax?: number };
  calculated?: string;
  missing?: string[];
}> = ({ name, units, value, range, calculated, missing }) => {
  const flag = flagValue(range as never, value);
  const style = flag ? LAB_FLAG_STYLE[flag] : undefined;
  return (
    <tr className={calculated ? 'bg-[#f8f9ff]' : ''}>
      <td className="px-3 py-1.5">
        <span className="font-body-md text-sm text-[#0b1c30]">{name}</span>
        {calculated && (
          <span className="block font-derived-value text-[10px] text-[#747686]">
            calculated · {calculated}
          </span>
        )}
      </td>
      <td className="px-3 py-1.5 text-right whitespace-nowrap">
        {value === undefined ? (
          <span className="font-derived-value text-xs text-[#747686] italic">
            {missing?.length ? `needs ${missing.join(' and ')}` : '—'}
          </span>
        ) : (
          <span className={`font-clinical-value text-sm ${style?.text ?? 'text-[#0b1c30]'}`}>
            {value} {units}
          </span>
        )}
      </td>
      <td className="px-3 py-1.5 text-right w-10">
        {style && flag !== 'normal' && (
          <span className={`text-[10px] font-bold px-1 rounded ${style.chip}`}>{style.mark}</span>
        )}
      </td>
      <td className="px-3 py-1.5 text-right font-derived-value text-[11px] text-[#747686] whitespace-nowrap w-28">
        {formatRange(range as never)}
      </td>
    </tr>
  );
};
