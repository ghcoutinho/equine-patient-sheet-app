import React, { useState } from 'react';
import { Patient } from '../../types';

interface NeonatalAssessmentViewProps {
  patient: Patient;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

export const NeonatalAssessmentView: React.FC<NeonatalAssessmentViewProps> = ({
  patient,
  onUpdatePatient,
}) => {
  const [gestationDays, setGestationDays] = useState<number>(patient.fssPrematurityDays || 338);
  const [coldExtremities, setColdExtremities] = useState<boolean>(patient.fssColdExtremities || true);
  const [infectiousSite, setInfectiousSite] = useState<string>(patient.fssInfectiousSite || 'Umbilicus');
  const [glucosePending, setGlucosePending] = useState<boolean>(true);
  const [iggPending, setIggPending] = useState<boolean>(true);

  // Compute Foal Survival Score (FSS)
  const confirmedScore = (gestationDays < 320 ? 0 : gestationDays < 330 ? 1 : 2) + 
                        (coldExtremities ? 0 : 2) + 
                        (infectiousSite === 'None' ? 2 : 0);
  const maxPendingScore = confirmedScore + (glucosePending ? 2 : 0) + (iggPending ? 3 : 0);

  const handleUpdate = () => {
    const updated: Patient = {
      ...patient,
      fssPrematurityDays: gestationDays,
      fssColdExtremities: coldExtremities,
      fssInfectiousSite: infectiousSite,
      casScoreConfirmed: confirmedScore,
      casScoreMaxPending: maxPendingScore,
    };
    onUpdatePatient(updated);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#6D28D9] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
              NEONATAL SUITE
            </span>
            <span className="text-xs font-derived-value text-[#434655]">
              [Brewer 1988 / FSS Model]
            </span>
          </div>
          <h1 className="font-display text-2xl text-[#0b1c30] mt-1">
            Foal Survival Score & Sepsis Assessment
          </h1>
          <p className="font-body-md text-sm text-[#434655] mt-1">
            Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> ({patient.age || '2 Days'}) • Case {patient.caseNumber}
          </p>
        </div>

        <div className="bg-[#eff4ff] border border-[#E2E8F0] p-3 rounded-lg text-center min-w-[140px]">
          <span className="font-label-caps text-[10px] text-[#434655] block">
            FSS SCORE RANGE
          </span>
          <span className="font-display text-3xl text-[#6D28D9] font-bold">
            {confirmedScore}-{maxPendingScore}
          </span>
          <span className="font-derived-value text-[11px] text-[#B91C1C] block font-bold mt-0.5">
            HIGH SEPSIS RISK
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Parameter Controls */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm space-y-6">
          <h2 className="font-headline text-lg text-[#0b1c30] border-b border-[#E2E8F0] pb-2">
            FSS Clinical Parameters
          </h2>

          {/* Prematurity / Gestation Days */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-caps text-xs text-[#434655]">Gestation Length (Days)</label>
              <span className="font-clinical-value text-sm text-[#0037b0]">{gestationDays} Days</span>
            </div>
            <input
              type="range"
              min="300"
              max="350"
              value={gestationDays}
              onChange={(e) => { setGestationDays(parseInt(e.target.value)); handleUpdate(); }}
              className="w-full h-2 bg-[#e5eeff] rounded-lg appearance-none cursor-pointer accent-[#0037b0]"
            />
            <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-1">
              <span>Severe Premature (&lt;320)</span>
              <span>Near Term (330)</span>
              <span>Full Term (340+)</span>
            </div>
          </div>

          {/* Cold Extremities Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#f8f9ff] rounded border border-[#E2E8F0]">
            <div>
              <span className="font-label-caps text-xs text-[#0b1c30] block">Cold Extremities / Hypothermia</span>
              <span className="font-derived-value text-xs text-[#434655]">Signs of peripheral hypoperfusion</span>
            </div>
            <button
              onClick={() => { setColdExtremities(!coldExtremities); handleUpdate(); }}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                coldExtremities ? 'bg-[#B91C1C]' : 'bg-[#c4c5d7]'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                coldExtremities ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Infectious Sites */}
          <div>
            <label className="font-label-caps text-xs text-[#434655] block mb-1">Infectious Site Identified</label>
            <select
              value={infectiousSite}
              onChange={(e) => { setInfectiousSite(e.target.value); handleUpdate(); }}
              className="w-full font-headline text-sm p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:ring-[#6D28D9] focus:outline-none"
            >
              <option value="Umbilicus">Umbilicus (Omphalophlebitis)</option>
              <option value="Joints">Joint Septicemia</option>
              <option value="Respiratory">Pneumonia / Respiratory</option>
              <option value="None">None Identified</option>
            </select>
          </div>

          {/* Pending Labs Toggles */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
            <span className="font-label-caps text-xs text-[#434655] block uppercase tracking-wider">
              Pending Laboratory Tests
            </span>

            <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-xs font-derived-value">
              <span>Glucose Result</span>
              <button
                onClick={() => setGlucosePending(!glucosePending)}
                className={`px-2.5 py-1 rounded font-label-caps text-[11px] ${
                  glucosePending ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30' : 'bg-[#ECFDF5] text-[#047857]'
                }`}
              >
                {glucosePending ? 'PENDING' : 'RECEIVED'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-xs font-derived-value">
              <span>IgG Snapshot</span>
              <button
                onClick={() => setIggPending(!iggPending)}
                className={`px-2.5 py-1 rounded font-label-caps text-[11px] ${
                  iggPending ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30' : 'bg-[#ECFDF5] text-[#047857]'
                }`}
              >
                {iggPending ? 'PENDING' : 'RECEIVED'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Foal Intelligence Panel */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="font-headline text-lg text-[#0b1c30] border-b border-[#E2E8F0] pb-2 mb-4">
              Neonatal Sepsis Score Track
            </h2>

            {/* Bounded Score Track */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="font-label-caps text-xs text-[#434655]">
                  Foal Survival Track
                </span>
                <span className="font-derived-value text-xs text-[#B91C1C] font-bold">
                  Sepsis Threshold Met
                </span>
              </div>

              <div className="w-full h-10 bg-[#e5eeff] rounded-full overflow-hidden flex relative border border-[#E2E8F0] shadow-inner">
                {/* Low Risk 0-3 */}
                <div className="h-full bg-[#ECFDF5] border-r border-[#E2E8F0]" style={{ width: '30%' }} />
                {/* Confirmed Score */}
                <div className="h-full bg-[#6D28D9] flex items-center justify-end pr-2 text-white font-derived-value font-bold text-xs" style={{ width: '20%' }}>
                  {confirmedScore}
                </div>
                {/* Pending Band */}
                <div className="h-full bg-[#6D28D9]/20 rail-track border-r-2 border-dashed border-[#6D28D9]" style={{ width: '30%' }} />
              </div>

              <div className="flex justify-between font-label-caps text-[10px] text-[#434655]">
                <span>0 (Non-survival)</span>
                <span className="text-[#B45309]">Sepsis Alert (5)</span>
                <span className="text-[#047857]">High Survival (11+)</span>
              </div>
            </div>

            <p className="font-derived-value text-xs text-[#434655] mt-6 bg-[#eff4ff] p-3 rounded border border-[#E2E8F0]">
              Pending IgG lab test result could increase total score from {confirmedScore} to {maxPendingScore}. High probability of failure of passive transfer (FPT).
            </p>
          </div>

          <div className="p-4 bg-[#B91C1C]/10 border border-[#B91C1C]/30 rounded text-xs font-derived-value text-[#B91C1C] space-y-1">
            <div className="font-bold font-label-caps flex items-center gap-1">
              <span className="material-symbols-outlined text-base">emergency</span>
              ICU RECOMMENDATION
            </div>
            <p>Administer IV Plasma Transfusion & Start Broad-Spectrum Antimicrobial Therapy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
