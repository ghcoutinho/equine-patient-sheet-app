import React, { useState } from 'react';
import { Patient, MedicationCalc } from '../../types';
import { MEDICATIONS } from '../../data/initialData';

interface DoseCalculatorViewProps {
  patient: Patient;
  onApplyMedicationToFlowsheet?: (medName: string, doseText: string) => void;
}

export const DoseCalculatorView: React.FC<DoseCalculatorViewProps> = ({
  patient,
  onApplyMedicationToFlowsheet,
}) => {
  const [weightKg, setWeightKg] = useState<number>(patient.weightKg || 500);

  // Dose sliders state
  const [doses, setDoses] = useState<Record<string, number>>({
    m1: 1.1, // Flunixin Meglumine
    m2: 2.5, // Dextrose 50%
    m3: 1.3, // Lidocaine 2%
    m4: 2.2, // Phenylbutazone
  });

  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const handleDoseChange = (id: string, val: number) => {
    setDoses(prev => ({ ...prev, [id]: val }));
  };

  const handleApply = (med: MedicationCalc) => {
    const doseMgKg = doses[med.id] || med.defaultDoseMgKg;
    const totalMg = (weightKg * doseMgKg).toFixed(1);
    const totalMl = med.concentrationMgMl ? ((weightKg * doseMgKg) / (med.concentrationMgMl / 10)).toFixed(1) : '--';

    const text = med.isCRI
      ? `${med.name} CRI @ ${doseMgKg} ${med.criUnit || 'mg/kg/hr'} (${totalMl} mL/hr)`
      : `${med.name} ${doseMgKg} mg/kg (${totalMg} mg / ${totalMl} mL ${med.route})`;

    if (onApplyMedicationToFlowsheet) {
      onApplyMedicationToFlowsheet(med.name, text);
    }

    setAppliedNotice(`Applied ${text} to flowsheet!`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
      {/* Header & Patient Weight Selector */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0037b0] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
              VETERINARY PHARMACOLOGY
            </span>
            <span className="text-xs font-derived-value text-[#434655]">
              Equine Weight-Adjusted Calculations
            </span>
          </div>
          <h1 className="font-display text-2xl text-[#0b1c30] mt-1">
            Precision Dose & CRI Calculator
          </h1>
          <p className="font-body-md text-sm text-[#434655] mt-1">
            Active Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> ({patient.breed})
          </p>
        </div>

        {/* Interactive Weight Dial */}
        <div className="bg-[#eff4ff] border border-[#E2E8F0] p-4 rounded-lg flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="font-label-caps text-[10px] text-[#434655] block">
              PATIENT WEIGHT
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl text-[#0037b0] font-bold">
                {weightKg}
              </span>
              <span className="font-label-caps text-xs text-[#434655]">kg</span>
            </div>
          </div>

          <div className="flex-1 md:w-48">
            <input
              type="range"
              min="40"
              max="900"
              step="5"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#e5eeff] rounded-lg appearance-none cursor-pointer accent-[#0037b0]"
            />
            <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-1">
              <span>Foal (40kg)</span>
              <span>Light (400kg)</span>
              <span>Draft (800kg)</span>
            </div>
          </div>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-3 bg-[#ECFDF5] border border-[#047857] text-[#047857] rounded-lg font-label-caps text-xs flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Medication Calculation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MEDICATIONS.map((med) => {
          const targetDose = doses[med.id] || med.defaultDoseMgKg;
          const totalMg = (weightKg * targetDose).toFixed(1);
          // Standard concentration volume math
          const totalMl = med.concentrationMgMl ? ((weightKg * targetDose) / (med.concentrationMgMl / 10)).toFixed(1) : '--';

          const isCRI = med.isCRI;

          return (
            <div
              key={med.id}
              className={`bg-white rounded-lg p-6 flex flex-col justify-between relative transition-all shadow-sm ${
                isCRI 
                  ? 'border-2 border-[#8B5CF6] shadow-[0_0_12px_rgba(139,92,246,0.15)]' 
                  : 'border border-[#E2E8F0]'
              }`}
            >
              {/* CRI Special Caution Strip */}
              {isCRI && (
                <div className="absolute top-0 left-0 right-0 bg-[#8B5CF6] text-white text-[10px] font-label-caps font-bold px-3 py-0.5 rounded-t-md flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">vaccines</span>
                    CRI CONTINUOUS RATE INFUSION
                  </span>
                  <span>VIOLET SAFETY PROTOCOL</span>
                </div>
              )}

              <div className={`space-y-4 ${isCRI ? 'mt-4' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#0b1c30]">
                      {med.name}
                    </h3>
                    <p className="font-derived-value text-xs text-[#434655]">
                      {med.category}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded font-label-caps text-xs ${
                    isCRI ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold border border-[#8B5CF6]/30' : 'bg-[#e5eeff] text-[#0037b0]'
                  }`}>
                    {med.route}
                  </span>
                </div>

                {/* Target Dose Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-label-caps text-xs text-[#434655]">
                      Target Dose ({med.criUnit || 'mg/kg'})
                    </label>
                    <span className="font-clinical-value text-sm text-[#0037b0] font-bold">
                      {targetDose} {med.criUnit || 'mg/kg'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={med.minDoseMgKg}
                    max={med.maxDoseMgKg}
                    step="0.1"
                    value={targetDose}
                    onChange={(e) => handleDoseChange(med.id, parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                      isCRI ? 'accent-[#8B5CF6] bg-[#8B5CF6]/20' : 'accent-[#0037b0] bg-[#e5eeff]'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-0.5">
                    <span>Min: {med.minDoseMgKg}</span>
                    <span>Max: {med.maxDoseMgKg}</span>
                  </div>
                </div>

                {/* Calculated Result Display */}
                <div className="p-4 bg-[#f8f9ff] rounded border border-[#E2E8F0] grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="font-label-caps text-[10px] text-[#434655] block">
                      TOTAL DOSE (MG)
                    </span>
                    <span className="font-display text-2xl text-[#0b1c30]">
                      {totalMg}
                      <span className="text-xs text-[#747686]"> mg</span>
                    </span>
                  </div>

                  <div>
                    <span className="font-label-caps text-[10px] text-[#434655] block">
                      {isCRI ? 'INFUSION RATE' : 'VOLUME TO ADMINISTER'}
                    </span>
                    <span className={`font-display text-2xl ${isCRI ? 'text-[#8B5CF6]' : 'text-[#0037b0]'}`}>
                      {totalMl}
                      <span className="text-xs text-[#747686]"> {isCRI ? 'mL/hr' : 'mL'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleApply(med)}
                className={`mt-6 w-full py-2.5 rounded font-label-caps text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 ${
                  isCRI
                    ? 'bg-[#8B5CF6] hover:bg-[#7c3aed] text-white'
                    : 'bg-[#0037b0] hover:bg-[#1d4ed8] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-base">add_task</span>
                <span>{isCRI ? 'START CRI INFUSION & RECORD' : 'APPLY TO PATIENT FLOWSHEET'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
