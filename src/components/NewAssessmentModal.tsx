import React, { useState } from 'react';
import { Patient } from '../types';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddPatient: (newPatient: Patient) => void;
  onSelectPatientForRound: (patientId: string) => void;
}

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddPatient,
  onSelectPatientForRound,
}) => {
  const [tab, setTab] = useState<'round' | 'admission'>('round');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');

  // Admission form state
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Quarter Horse');
  const [weightKg, setWeightKg] = useState('500');
  const [location, setLocation] = useState('Barn 1 - Stall 5');
  const [isFoal, setIsFoal] = useState(false);

  if (!isOpen) return null;

  const handleStartRound = () => {
    if (selectedPatientId) {
      onSelectPatientForRound(selectedPatientId);
      onClose();
    }
  };

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newP: Patient = {
      id: `p_${Date.now()}`,
      name,
      caseNumber: `#${Math.floor(10000 + Math.random() * 90000)}`,
      breed,
      weightKg: parseFloat(weightKg) || 500,
      age: 'Unknown',
      location,
      status: 'WATCH',
      statusLabel: 'ADMITTED',
      lastObsTime: 'Just admitted',
      isFoal,
      sirsCriteriaMet: false,
      casScoreConfirmed: 1,
      casScoreMaxPending: 3,
      category: isFoal ? 'NEONATAL_FOAL' : 'ADULT_COLIC',
      gender: 'Unknown',
      admissionDate: new Date().toISOString().split('T')[0],
      owner: { name: 'Unknown' },
      flowsheetHistory: [
        {
          time: '14:30',
          vitals: { heartRate: 44, temperatureC: 38.0, respiratoryRate: 18 },
          gi: { motility: 'Normal' },
          labs: { lactate: 1.2 }
        }
      ]
    };

    onAddPatient(newP);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full border border-[#E2E8F0] shadow-xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 bg-[#f8f9ff] border-b border-[#E2E8F0] flex justify-between items-center">
          <div className="flex gap-2 font-label-caps text-xs">
            <button
              onClick={() => setTab('round')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'round' ? 'bg-[#0037b0] text-white font-bold' : 'text-[#434655] hover:bg-[#e5eeff]'
              }`}
            >
              Record Clinical Round
            </button>
            <button
              onClick={() => setTab('admission')}
              className={`px-3 py-1.5 rounded transition-colors ${
                tab === 'admission' ? 'bg-[#0037b0] text-white font-bold' : 'text-[#434655] hover:bg-[#e5eeff]'
              }`}
            >
              New Patient Admission
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-[#434655] hover:bg-[#e5eeff] p-1 rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {tab === 'round' ? (
            <div className="space-y-4">
              <h3 className="font-headline text-lg text-[#0b1c30]">
                Select Active Patient for Vitals Assessment
              </h3>

              <div className="space-y-2">
                {patients.map((p) => (
                  <label
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPatientId === p.id 
                        ? 'border-[#0037b0] bg-[#e5eeff]/50 shadow-sm' 
                        : 'border-[#E2E8F0] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#0037b0] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          pets
                        </span>
                      </div>
                      <div>
                        <div className="font-headline text-sm text-[#0b1c30]">{p.name}</div>
                        <div className="font-derived-value text-xs text-[#434655]">
                          Case {p.caseNumber} • {p.breed} • {p.location}
                        </div>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="patientSelect"
                      checked={selectedPatientId === p.id}
                      onChange={() => setSelectedPatientId(p.id)}
                      className="accent-[#0037b0]"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={handleStartRound}
                className="mt-4 w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-3 rounded font-label-caps text-xs font-bold transition shadow-sm"
              >
                PROCEED TO ROUND ASSESSMENT
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateAdmission} className="space-y-4">
              <h3 className="font-headline text-lg text-[#0b1c30]">
                Admit New Patient to Ward
              </h3>

              <div>
                <label className="font-label-caps text-xs text-[#434655] block mb-1">
                  Horse Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spirit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-[#c4c5d7] rounded font-headline text-sm focus:ring-1 focus:ring-[#0037b0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-caps text-xs text-[#434655] block mb-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full p-2.5 border border-[#c4c5d7] rounded font-headline text-sm"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-xs text-[#434655] block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full p-2.5 border border-[#c4c5d7] rounded font-headline text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#434655] block mb-1">
                  Stall / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 border border-[#c4c5d7] rounded font-headline text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFoalChk"
                  checked={isFoal}
                  onChange={(e) => setIsFoal(e.target.checked)}
                  className="w-4 h-4 accent-[#0037b0]"
                />
                <label htmlFor="isFoalChk" className="font-body-md text-xs text-[#0b1c30]">
                  Patient is a Foal (Enable Neonatal FSS Score)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-3 rounded font-label-caps text-xs font-bold transition shadow-sm mt-2"
              >
                CONFIRM ADMISSION
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
