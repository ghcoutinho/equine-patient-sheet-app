import React, { useState } from 'react';
import { Patient, FlowsheetColumn, AssessmentSeverity } from '../../types';
import { GutSoundsGlyph } from '../ui/GutSoundsQuadrant';
import { formatManure } from '../../utils/manure';
import { severityOf } from '../../data/clinicalAssessments';
import { summariseGutSounds } from '../../utils/gutSounds';
import { evaluateCallSurgeonTriggers, latestColumn } from '../../utils/callSurgeonTriggers';
import { classifyAgainstReference } from '../../utils/referenceLookup';
import { ageClassFor } from '../../data/ageStratifiedReferenceRanges';

const SEVERITY_CELL: Record<AssessmentSeverity, string> = {
  normal: 'text-[#047857]',
  watch: 'bg-[#FFFBEB] text-[#B45309] font-bold',
  warning: 'bg-[#FFF7ED] text-[#C2410C] font-bold',
  critical: 'bg-[#B91C1C] text-white font-bold',
};

interface FlowsheetViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenNewAssessment: () => void;
}

export const FlowsheetView: React.FC<FlowsheetViewProps> = ({
  patient,
  onUpdatePatient,
  onOpenNewAssessment,
}) => {
  const [newHR, setNewHR] = useState<string>('');
  const [newTemp, setNewTemp] = useState<string>('');
  const [newReflux, setNewReflux] = useState<string>('');
  const [newLactate, setNewLactate] = useState<string>('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  const handleAddNewTimepoint = () => {
    if (!newHR && !newTemp && !newReflux && !newLactate) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newColumn: FlowsheetColumn = {
      time: timeStr,
      vitals: {
        heartRate: newHR ? parseFloat(newHR) : undefined,
        temperatureC: newTemp ? parseFloat(newTemp) : undefined,
      },
      gi: {
        refluxVolumeL: newReflux ? parseFloat(newReflux) : undefined,
        motility: newReflux && parseFloat(newReflux) > 4 ? 'Absent' : 'Decreased',
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

  const colCount = patient.flowsheetHistory.length + 2;

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
    const anyValue = patient.flowsheetHistory.some((c) => read(c) !== undefined);
    if (!anyValue) return null;
    return (
      <tr key={key} className="group hover:bg-[#f8f9ff] transition relative">
        <td className="sticky left-0 z-10 bg-white px-4 py-3 border-b border-r border-[#E2E8F0] group-hover:bg-[#f8f9ff]">
          <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
          <span className="text-[#0b1c30] font-bold">{label}</span>
        </td>
        {patient.flowsheetHistory.map((col, idx) => {
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

  const triggers = evaluateCallSurgeonTriggers(latestColumn(patient.flowsheetHistory));

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

      {/* Grid Canvas + Intelligence Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Flowsheet Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden relative">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Header Row */}
              <thead className="sticky top-0 z-20 bg-[#f8f9ff] shadow-sm">
                <tr>
                  <th className="sticky left-0 z-30 bg-[#f8f9ff] px-4 py-3 border-b border-r border-[#E2E8F0] w-52 font-label-caps text-xs text-[#434655]">
                    Parameter
                  </th>
                  {patient.flowsheetHistory.map((col, idx) => (
                    <th 
                      key={idx} 
                      className={`px-4 py-3 border-b border-r border-[#E2E8F0] font-clinical-value text-sm text-center min-w-[90px] ${
                        idx === patient.flowsheetHistory.length - 1 ? 'bg-[#e5eeff] font-bold text-[#0037b0]' : ''
                      }`}
                    >
                      {col.time}
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
                  <td colSpan={patient.flowsheetHistory.length + 2} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#1D4ED8] uppercase tracking-wider font-bold">
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
                  {patient.flowsheetHistory.map((col, idx) => (
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
                  {patient.flowsheetHistory.map((col, idx) => {
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
                {patient.flowsheetHistory.some((c) => c.pain) && (
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
                  <td colSpan={patient.flowsheetHistory.length + 2} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#B45309] uppercase tracking-wider font-bold">
                    GI / Colic
                  </td>
                </tr>

                {/* Row: Gut sounds — four quadrants */}
                {patient.flowsheetHistory.some((c) => c.gi.gutSounds) && (
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
                    {patient.flowsheetHistory.map((col, idx) => {
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
                  {patient.flowsheetHistory.map((col, idx) => (
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
                  <td colSpan={patient.flowsheetHistory.length + 2} className="bg-[#eff4ff] px-4 py-1.5 border-b border-[#E2E8F0] font-label-caps text-xs text-[#0E7490] uppercase tracking-wider font-bold">
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
                  {patient.flowsheetHistory.map((col, idx) => (
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
                {patient.flowsheetHistory.some((c) => c.laminitis) && (
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
                {patient.flowsheetHistory.some((c) => c.support) && (
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
                <span className="text-xs font-derived-value text-[#434655]">
                  New entry ready to save
                </span>
                <button
                  onClick={handleAddNewTimepoint}
                  className="bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-label-caps px-4 py-1.5 rounded shadow-sm font-bold"
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
                          t.severity === 'critical' ? 'bg-[#B91C1C]' : 'bg-[#C2410C]'
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

          {/* Sparkline Trend Overview */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="font-label-caps text-xs text-[#1D4ED8]">HR Trend</span>
                <span className="font-clinical-value text-xs bg-[#B91C1C] text-white px-1 rounded">
                  {patient.flowsheetHistory[patient.flowsheetHistory.length - 1]?.vitals?.heartRate || 110}
                </span>
              </div>
              <div className="h-12 bg-[#eff4ff] rounded border border-[#E2E8F0] flex items-end p-1 gap-1">
                <div className="w-1/5 bg-[#047857] h-[40%] rounded-t-sm" />
                <div className="w-1/5 bg-[#047857] h-[45%] rounded-t-sm" />
                <div className="w-1/5 bg-[#C2410C] h-[60%] rounded-t-sm" />
                <div className="w-1/5 bg-[#C2410C] h-[75%] rounded-t-sm" />
                <div className="w-1/5 bg-[#B91C1C] h-[100%] rounded-t-sm animate-pulse-critical" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="font-label-caps text-xs text-[#0E7490]">Lactate Trend</span>
                <span className="font-clinical-value text-xs bg-[#B91C1C] text-white px-1 rounded">
                  {patient.flowsheetHistory[patient.flowsheetHistory.length - 1]?.labs?.lactate || 6.2}
                </span>
              </div>
              <div className="h-12 bg-[#eff4ff] rounded border border-[#E2E8F0] flex items-end p-1 gap-1">
                <div className="w-1/4 bg-[#047857] h-[25%] rounded-t-sm" />
                <div className="w-1/4 bg-[#047857] h-[35%] rounded-t-sm" />
                <div className="w-1/4 bg-[#475569] h-[35%] rounded-t-sm opacity-30 border border-dashed" />
                <div className="w-1/4 bg-[#B91C1C] h-[95%] rounded-t-sm animate-pulse-critical" />
              </div>
            </div>
          </div>

          {/* Current Score Footer */}
          <div className="mt-auto pt-4 border-t border-[#E2E8F0]">
            <div className="bg-[#f8f9ff] border border-[#E2E8F0] rounded p-3 text-center">
              <span className="font-label-caps text-xs text-[#434655] block mb-1">
                Current CAS Score
              </span>
              <span className="font-display text-2xl text-[#334155]">
                {patient.casScoreConfirmed}
                <span className="text-sm text-[#747686]">/20</span>
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
