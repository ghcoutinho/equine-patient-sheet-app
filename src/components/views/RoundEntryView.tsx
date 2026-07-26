import React, { useState } from 'react';
import { Patient, FlowsheetColumn } from '../../types';

interface RoundEntryViewProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  onDone: () => void;
}

export const RoundEntryView: React.FC<RoundEntryViewProps> = ({
  patient,
  onUpdatePatient,
  onDone,
}) => {
  const latest = patient.flowsheetHistory[patient.flowsheetHistory.length - 1];

  const [hr, setHr] = useState<string>(latest?.vitals?.heartRate?.toString() || '');
  const [temp, setTemp] = useState<string>(
    (patient.isFoal ? latest?.vitals?.temperatureF : latest?.vitals?.temperatureC)?.toString() || ''
  );
  const [rr, setRr] = useState<string>(latest?.vitals?.respiratoryRate?.toString() || '');
  const [reflux, setReflux] = useState<string>(latest?.gi?.refluxVolumeL?.toString() || '');
  const [motility, setMotility] = useState<string>(latest?.gi?.motility || 'Decreased');
  const [lactate, setLactate] = useState<string>(latest?.labs?.lactate?.toString() || '');

  // Active accordion tabs
  const [openSection, setOpenSection] = useState<'vitals' | 'gi' | 'labs'>('vitals');

  const handleSaveRound = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const numHr = hr ? parseFloat(hr) : undefined;
    const numTemp = temp ? parseFloat(temp) : undefined;
    const numRr = rr ? parseFloat(rr) : undefined;
    const numReflux = reflux ? parseFloat(reflux) : undefined;
    const numLactate = lactate ? parseFloat(lactate) : undefined;

    const newColumn: FlowsheetColumn = {
      time: timeStr,
      vitals: {
        heartRate: numHr,
        temperatureC: !patient.isFoal ? numTemp : undefined,
        temperatureF: patient.isFoal ? numTemp : undefined,
        respiratoryRate: numRr,
      },
      gi: {
        refluxVolumeL: numReflux,
        motility: motility as any,
      },
      labs: {
        lactate: numLactate,
      },
    };

    // Calculate SIRS
    const sirs = (numHr && numHr > 60) || (numTemp && numTemp > 38.5) || (numLactate && numLactate > 2.0);

    const updatedPatient: Patient = {
      ...patient,
      sirsCriteriaMet: !!sirs,
      lastObsTime: 'Just now',
      flowsheetHistory: [...patient.flowsheetHistory, newColumn],
    };

    onUpdatePatient(updatedPatient);
    onDone();
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl text-[#0b1c30]">Record Clinical Round</h1>
          <p className="font-body-md text-xs text-[#434655] mt-0.5">
            Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> ({patient.caseNumber})
          </p>
        </div>
        <span className="font-clinical-value text-sm text-[#0037b0] bg-[#e5eeff] px-2.5 py-1 rounded font-bold">
          NOW
        </span>
      </div>

      {/* Accordion 1: Vitals */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'vitals' ? 'gi' : 'vitals')}
          className="w-full p-4 bg-[#f8f9ff] flex items-center justify-between border-b border-[#E2E8F0] text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
            <span className="font-label-caps text-sm text-[#0b1c30] uppercase tracking-wider font-bold">
              Vitals Assessment
            </span>
          </div>
          <span className="material-symbols-outlined text-[#434655]">
            {openSection === 'vitals' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {openSection === 'vitals' && (
          <div className="p-4 space-y-4">
            {/* Heart Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]">Heart Rate (bpm)</label>
                {latest?.vitals?.heartRate && (
                  <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Prev: {latest.vitals.heartRate}
                  </span>
                )}
              </div>
              <input
                type="number"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                placeholder="e.g. 88"
                className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#0037b0] focus:outline-none no-spinner"
              />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]">
                  Temperature ({patient.isFoal ? '°F' : '°C'})
                </label>
                {(latest?.vitals?.temperatureC || latest?.vitals?.temperatureF) && (
                  <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Prev: {latest.vitals.temperatureF || latest.vitals.temperatureC}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder={patient.isFoal ? 'e.g. 102.8' : 'e.g. 38.9'}
                className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#0037b0] focus:outline-none no-spinner"
              />
            </div>

            {/* Respiratory Rate */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]">Respiratory Rate (brpm)</label>
                {latest?.vitals?.respiratoryRate && (
                  <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Prev: {latest.vitals.respiratoryRate}
                  </span>
                )}
              </div>
              <input
                type="number"
                value={rr}
                onChange={(e) => setRr(e.target.value)}
                placeholder="e.g. 24"
                className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#0037b0] focus:outline-none no-spinner"
              />
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: GI / Colic */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'gi' ? 'labs' : 'gi')}
          className="w-full p-4 bg-[#f8f9ff] flex items-center justify-between border-b border-[#E2E8F0] text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
            <span className="font-label-caps text-sm text-[#0b1c30] uppercase tracking-wider font-bold">
              GI / Colic Round
            </span>
          </div>
          <span className="material-symbols-outlined text-[#434655]">
            {openSection === 'gi' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {openSection === 'gi' && (
          <div className="p-4 space-y-4">
            {/* Reflux Volume */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]">Reflux Volume (Liters)</label>
                {latest?.gi?.refluxVolumeL !== undefined && (
                  <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Prev: {latest.gi.refluxVolumeL} L
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.5"
                value={reflux}
                onChange={(e) => setReflux(e.target.value)}
                placeholder="e.g. 4.5"
                className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#B45309] focus:outline-none no-spinner"
              />
            </div>

            {/* Motility */}
            <div>
              <label className="font-label-caps text-xs text-[#434655] block mb-1">Motility</label>
              <select
                value={motility}
                onChange={(e) => setMotility(e.target.value)}
                className="w-full font-headline text-base p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#B45309] focus:outline-none"
              >
                <option value="Normal">Normal Motility</option>
                <option value="Decreased">Decreased Motility</option>
                <option value="Absent">Absent Motility</option>
                <option value="Hyper-motile">Hyper-motile</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Labs */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'labs' ? 'vitals' : 'labs')}
          className="w-full p-4 bg-[#f8f9ff] flex items-center justify-between border-b border-[#E2E8F0] text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0E7490]" />
            <span className="font-label-caps text-sm text-[#0b1c30] uppercase tracking-wider font-bold">
              Lab Tests
            </span>
          </div>
          <span className="material-symbols-outlined text-[#434655]">
            {openSection === 'labs' ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {openSection === 'labs' && (
          <div className="p-4 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]">Lactate (mmol/L)</label>
                {latest?.labs?.lactate && (
                  <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    Prev: {latest.labs.lactate}
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.1"
                value={lactate}
                onChange={(e) => setLactate(e.target.value)}
                placeholder="e.g. 3.2"
                className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#0E7490] focus:outline-none no-spinner"
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Round Button */}
      <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 max-w-2xl mx-auto px-4 z-30">
        <button
          onClick={handleSaveRound}
          className="w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-3.5 rounded-lg font-label-caps text-sm font-bold shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">save</span>
          <span>SAVE ROUND ASSESSMENT</span>
        </button>
      </div>
    </div>
  );
};
