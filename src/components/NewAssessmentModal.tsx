import React, { useState } from 'react';
import type { Patient, EquineSex } from '../types';
import { PatientMarkIcon } from './ui/PatientMark';
import {
  SEX_OPTIONS,
  ageInDays,
  ageClassFromDays,
  formatAge,
  patientAge,
} from '../data/patientIdentity';
import { defaultSchedule } from '../utils/schedule';
import { suggestBodySystems } from '../data/bodySystems';
import { BreedSelect } from './ui/BreedSelect';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onAddPatient: (newPatient: Patient) => void;
  onSelectPatientForRound: (patientId: string) => void;
}

/** Convert an approximate age in the picker back to a date of birth. */
const AGE_PRESETS: { label: string; days: number }[] = [
  { label: 'Born today', days: 0 },
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '6 months', days: 182 },
  { label: '1 year', days: 365 },
  { label: '2 years', days: 730 },
  { label: '5 years', days: 1826 },
  { label: '10 years', days: 3652 },
  { label: '15 years', days: 5478 },
  { label: '20 years', days: 7305 },
];

const dobFromDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

/**
 * Admission and round selection.
 *
 * Admitting a patient used to write a fabricated flowsheet column — heart rate
 * 44, temperature 38.0 °C, lactate 1.2, timestamped "14:30" — so every new
 * horse arrived with a normal set of vitals nobody had taken, attributed to
 * nobody. It also seeded invented colic scores. A newly admitted patient now
 * starts with an empty chart and a monitoring schedule, which is the truth.
 */
export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAddPatient,
  onSelectPatientForRound,
}) => {
  const [tab, setTab] = useState<'round' | 'admission'>('round');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState('500');
  const [location, setLocation] = useState('');
  const [sex, setSex] = useState<EquineSex>('UNKNOWN');
  const [ageMode, setAgeMode] = useState<'dob' | 'approx'>('approx');
  const [dob, setDob] = useState('');
  const [approxDays, setApproxDays] = useState<number>(1826);
  const [diagnosis, setDiagnosis] = useState('');

  if (!isOpen) return null;

  const effectiveDob = ageMode === 'dob' ? dob : dobFromDaysAgo(approxDays);
  const days = ageInDays(effectiveDob, new Date());
  const ageClass = ageClassFromDays(days);
  const isFoal = days !== undefined && days <= 180;
  // A neonate weighing 500 kg is a dangerous default to leave sitting in the
  // field, since every dose is weight-based. Flag it rather than silently
  // overwriting what the clinician typed.
  const weightLooksWrong =
    isFoal && Number(weightKg) > 200 && Number.isFinite(Number(weightKg));

  const handleStartRound = () => {
    if (selectedPatientId) {
      onSelectPatientForRound(selectedPatientId);
      onClose();
    }
  };

  const handleCreateAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newP: Patient = {
      id: `p_${Date.now()}`,
      name: name.trim(),
      caseNumber: `#${Math.floor(10000 + Math.random() * 90000)}`,
      breed: breed.trim() || 'Not recorded',
      weightKg: parseFloat(weightKg) || 500,
      age: days === undefined ? 'Unknown' : formatAge(days),
      dateOfBirth: effectiveDob || undefined,
      sex,
      location: location.trim() || 'Not assigned',
      status: 'ACTIVE',
      statusLabel: 'AWAITING ARRIVAL',
      // Pre-registered, not yet physically here — PatientManagementView's
      // "Mark arrived" moves this to ACTIVE and opens the admission boundary
      // (currentAdmissionStartedAt) at the moment the horse actually arrives,
      // not at the moment the record was typed up.
      lifecycle: 'AWAITING_ARRIVAL',
      lastObsTime: 'No round charted',
      isFoal,
      diagnosis: diagnosis.trim() || undefined,
      bodySystems: diagnosis.trim() ? suggestBodySystems(diagnosis) : undefined,
      // No fabricated scores. Scores are computed on read from charted data —
      // see buildPanels in utils/intelligence.ts — so nothing needs seeding here.
      sirsCriteriaMet: false,
      category: isFoal ? 'NEONATAL_FOAL' : 'ADULT_COLIC',
      gender: sex,
      admissionDate: new Date().toISOString().split('T')[0],
      // Set on arrival, not here — see the lifecycle comment above.
      owner: { name: 'Not recorded' },
      schedule: defaultSchedule(isFoal),
      // An empty chart. The first column appears when someone charts a round.
      flowsheetHistory: [],
      treatments: [],
      labPanels: [],
    };

    onAddPatient(newP);
    setName('');
    setBreed('');
    setLocation('');
    setDiagnosis('');
    setSex('UNKNOWN');
    onClose();
  };

  const labelCls = 'font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1';
  const inputCls =
    'w-full p-2 border border-[#c4c5d7] rounded font-body-md text-sm focus:outline-none focus:border-[#0037b0]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full border border-[#E2E8F0] shadow-xl overflow-hidden animate-fade-in max-h-[92vh] flex flex-col">
        <div className="p-3 bg-[#f8f9ff] border-b border-[#E2E8F0] flex justify-between items-center flex-shrink-0">
          <div className="flex gap-1 font-label-caps text-xs">
            {(['round', 'admission'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  tab === t ? 'bg-[#1d4ed8] text-white' : 'text-[#434655] hover:bg-[#e5eeff]'
                }`}
              >
                {t === 'round' ? 'Start a round' : 'Admit a patient'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#434655] hover:bg-[#e5eeff] p-1 rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {tab === 'round' ? (
            <div className="space-y-3">
              <h3 className="font-headline text-lg text-[#0b1c30]">
                Which patient are you charting?
              </h3>

              <div className="space-y-1.5">
                {patients.map((p) => {
                  const age = patientAge(p, new Date());
                  return (
                    <label
                      key={p.id}
                      onClick={() => setSelectedPatientId(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedPatientId === p.id
                          ? 'border-[#0037b0] bg-[#e5eeff]/50 shadow-sm'
                          : 'border-[#E2E8F0] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PatientMarkIcon patient={p} size={34} />
                        <div className="min-w-0">
                          <div className="font-headline text-sm text-[#0b1c30] truncate">
                            {p.name}
                            {p.isTest && (
                              <span className="ml-1.5 text-[9px] font-label-caps bg-[#EDE9FE] text-[#6D28D9] border border-[#6D28D9]/30 px-1 py-px rounded align-middle">
                                TEST
                              </span>
                            )}
                          </div>
                          <div className="font-derived-value text-xs text-[#434655] truncate">
                            {age.label} · {p.breed} · {p.location}
                          </div>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="patientSelect"
                        checked={selectedPatientId === p.id}
                        onChange={() => setSelectedPatientId(p.id)}
                        className="accent-[#0037b0] flex-shrink-0"
                      />
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleStartRound}
                disabled={!selectedPatientId}
                className="mt-3 w-full bg-[#0037b0] hover:bg-[#1d4ed8] disabled:opacity-40 text-white py-2.5 rounded font-label-caps text-xs font-bold transition shadow-sm"
              >
                Go to the round sheet
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateAdmission} className="space-y-3">
              <h3 className="font-headline text-lg text-[#0b1c30]">Admit a patient</h3>

              <div>
                <label className={labelCls} htmlFor="adm-name">
                  Name
                </label>
                <input
                  id="adm-name"
                  required
                  autoFocus
                  placeholder="e.g. Spirit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="adm-breed">
                    Breed
                  </label>
                  <BreedSelect
                    id="adm-breed"
                    value={breed}
                    onChange={setBreed}
                    className={inputCls}
                    otherInputClassName={`${inputCls} mt-1.5`}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="adm-weight">
                    Weight (kg)
                  </label>
                  <input
                    id="adm-weight"
                    type="number"
                    min="1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className={inputCls}
                    style={weightLooksWrong ? { borderColor: '#C2410C' } : undefined}
                  />
                  {weightLooksWrong && (
                    <p className="font-derived-value text-[11px] text-[#C2410C] mt-0.5">
                      {weightKg} kg for a {formatAge(days)} foal — every dose is calculated
                      from this.
                    </p>
                  )}
                </div>
              </div>

              {/* Age drives the reference intervals, so it is captured properly */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`${labelCls} mb-0`}>Age</span>
                  <div className="flex rounded border border-[#E2E8F0] overflow-hidden text-[10px] font-label-caps">
                    {(['approx', 'dob'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setAgeMode(m)}
                        className={`px-2 py-0.5 ${
                          ageMode === m ? 'bg-[#1d4ed8] text-white' : 'bg-white text-[#434655]'
                        }`}
                      >
                        {m === 'approx' ? 'Approximate' : 'Date of birth'}
                      </button>
                    ))}
                  </div>
                </div>

                {ageMode === 'dob' ? (
                  <input
                    type="date"
                    value={dob}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setDob(e.target.value)}
                    aria-label="Date of birth"
                    className={inputCls}
                  />
                ) : (
                  <select
                    value={approxDays}
                    onChange={(e) => setApproxDays(Number(e.target.value))}
                    aria-label="Approximate age"
                    className={inputCls}
                  >
                    {AGE_PRESETS.map((a) => (
                      <option key={a.days} value={a.days}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                )}

                {days !== undefined && (
                  <p className="font-derived-value text-[11px] text-[#434655] mt-1">
                    {formatAge(days)} · charted as{' '}
                    <span className="font-bold">{isFoal ? 'a foal' : 'an adult'}</span>, reference
                    intervals from the{' '}
                    {!ageClass || ageClass === 'ADULT'
                      ? 'adult'
                      : ageClass.toLowerCase().replace(/_/g, ' ')}{' '}
                    band
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Sex</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {SEX_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setSex(o.value)}
                      title={o.hint}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-label-caps transition-colors ${
                        sex === o.value
                          ? 'bg-[#e5eeff] border-[#0037b0] text-[#0037b0] font-bold'
                          : 'bg-white border-[#E2E8F0] text-[#434655] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <span className="text-base leading-none">{o.symbol}</span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="adm-location">
                    Stall / location
                  </label>
                  <input
                    id="adm-location"
                    value={location}
                    placeholder="e.g. Barn 1 — Stall 5"
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="adm-dx">
                    Presenting problem
                  </label>
                  <input
                    id="adm-dx"
                    value={diagnosis}
                    placeholder="e.g. Small intestinal strangulation"
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <p className="font-derived-value text-[11px] text-[#747686] bg-[#f8f9ff] border border-[#E2E8F0] rounded p-2">
                The chart starts empty — no vitals are recorded until someone charts a round. A{' '}
                {isFoal ? 'q2h TPR and q6h physical' : 'q4h TPR and q12h physical'} monitoring
                schedule is set up automatically.
              </p>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-[#0037b0] hover:bg-[#1d4ed8] disabled:opacity-40 text-white py-2.5 rounded font-label-caps text-xs font-bold transition shadow-sm"
              >
                Admit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
