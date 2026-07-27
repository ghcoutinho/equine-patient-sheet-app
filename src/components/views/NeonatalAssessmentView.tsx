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
  // Sepsis commonly seeds more than one site, so this is a multi-select and the
  // list is extensible — the fixed four-option dropdown could not record
  // "umbilicus and both hocks".
  const [infectiousSites, setInfectiousSites] = useState<string[]>(() =>
    patient.fssInfectiousSite
      ? patient.fssInfectiousSite.split(';').map((v) => v.trim()).filter(Boolean)
      : [],
  );
  const [siteOptions, setSiteOptions] = useState<string[]>(() => {
    const base = [
      'Umbilicus (omphalophlebitis)',
      'Joint (septic arthritis)',
      'Physis / osteomyelitis',
      'Respiratory (pneumonia)',
      'Gastrointestinal (enteritis)',
      'Central nervous system (meningitis)',
      'Ophthalmic (uveitis)',
    ];
    const existing = patient.fssInfectiousSite
      ? patient.fssInfectiousSite.split(';').map((v) => v.trim()).filter(Boolean)
      : [];
    return Array.from(new Set([...base, ...existing]));
  });
  const [newSite, setNewSite] = useState('');

  // Numeric results. Absent means genuinely pending; a value ends the pending
  // state, so the score narrows as results arrive rather than being toggled.
  const [glucose, setGlucose] = useState<string>('');
  const [igg, setIgg] = useState<string>('');

  const num = (v: string) => (v.trim() === '' ? undefined : Number.isFinite(Number(v)) ? Number(v) : undefined);
  const glucoseValue = num(glucose);
  const iggValue = num(igg);
  const glucosePending = glucoseValue === undefined;
  const iggPending = iggValue === undefined;

  const toggleSite = (site: string) =>
    setInfectiousSites((prev) =>
      prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site],
    );

  const addSite = () => {
    const v = newSite.trim();
    if (!v) return;
    setSiteOptions((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setInfectiousSites((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setNewSite('');
  };

  // Compute Foal Survival Score (FSS)
  // Foal Survival Score contributions. Infectious sites score on the published
  // "fewer than 2 sites" criterion rather than on "none identified".
  const confirmedScore =
    (gestationDays < 320 ? 0 : gestationDays < 330 ? 1 : 2) +
    (coldExtremities ? 0 : 2) +
    (infectiousSites.length < 2 ? 1 : 0) +
    (glucoseValue !== undefined && glucoseValue > 40 ? 1 : 0) +
    (iggValue !== undefined && iggValue > 800 ? 1 : 0);
  // Pending results can still add their point, so the ceiling reflects
  // uncertainty rather than assuming the worst.
  const maxPendingScore = confirmedScore + (glucosePending ? 1 : 0) + (iggPending ? 1 : 0);

  /**
   * Foal Survival Score band. The published scale runs 0–7, where 0 is roughly a
   * 3% and 7 a 97% probability of survival, with a threshold around 5 for
   * predicting survival. The wording here describes the score band only — it is
   * deliberately not a percentage, because interpolating one between the two
   * published anchors would invent precision the model does not have.
   */
  const fssBand = ((score: number) => {
    if (score >= 5) return { label: 'FAVOURABLE BAND', colour: '#047857' };
    if (score >= 3) return { label: 'GUARDED BAND', colour: '#C2410C' };
    return { label: 'POOR BAND', colour: '#B91C1C' };
  })(confirmedScore);


  const handleUpdate = () => {
    const updated: Patient = {
      ...patient,
      fssPrematurityDays: gestationDays,
      fssColdExtremities: coldExtremities,
      fssInfectiousSite: infectiousSites.join('; '),
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
            {confirmedScore === maxPendingScore
              ? confirmedScore
              : `${confirmedScore}-${maxPendingScore}`}
            <span className="text-sm text-[#747686]">/7</span>
          </span>
          <span
            className="font-derived-value text-[11px] block font-bold mt-0.5"
            style={{ color: fssBand.colour }}
          >
            {fssBand.label}
          </span>
          {confirmedScore !== maxPendingScore && (
            <span className="font-derived-value text-[10px] text-[#747686] block">
              {(glucosePending ? 1 : 0) + (iggPending ? 1 : 0)} result
              {(glucosePending ? 1 : 0) + (iggPending ? 1 : 0) === 1 ? '' : 's'} pending
            </span>
          )}
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

          {/* Infectious / inflammatory sites — multi-select and extensible */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-label-caps text-xs text-[#434655]">
                Infectious / inflammatory sites
              </span>
              <span className="font-derived-value text-[11px] text-[#747686]">
                {infectiousSites.length} selected
                {infectiousSites.length >= 2 && ' — scores 0'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Infectious sites">
              {siteOptions.map((site) => {
                const on = infectiousSites.includes(site);
                return (
                  <button
                    key={site}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSite(site)}
                    className={`min-h-[44px] px-3 rounded-lg border text-xs text-left transition ${
                      on
                        ? 'bg-[#6D28D9] border-[#6D28D9] text-white font-bold'
                        : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
                    }`}
                  >
                    {site}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSite();
                  }
                }}
                placeholder="Add another site…"
                aria-label="Add another infectious site"
                className="flex-1 min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#6D28D9] focus:outline-none"
              />
              <button
                type="button"
                onClick={addSite}
                className="min-h-[44px] px-4 rounded bg-[#6D28D9] text-white font-label-caps text-xs font-bold"
              >
                Add
              </button>
            </div>
            {infectiousSites.length === 0 && (
              <p className="font-derived-value text-[11px] text-[#747686] mt-1">
                None selected — scores 1 point (fewer than 2 sites).
              </p>
            )}
          </div>

          {/* Laboratory results — entered, not toggled */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
            <span className="font-label-caps text-xs text-[#434655] block uppercase tracking-wider">
              Laboratory results
            </span>

            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-xs text-[#434655]">Blood glucose (mg/dL)</span>
                <span
                  className={`px-2 py-0.5 rounded font-label-caps text-[10px] ${
                    glucosePending
                      ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30'
                      : glucoseValue! > 40
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'bg-[#B91C1C] text-white'
                  }`}
                >
                  {glucosePending ? 'PENDING' : glucoseValue! > 40 ? '+1 POINT' : 'HYPOGLYCAEMIC'}
                </span>
              </div>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="e.g. 95"
                className="w-full font-clinical-value text-lg p-3 bg-white border-2 rounded focus:ring-2 focus:ring-[#6D28D9] focus:outline-none no-spinner"
                style={{ borderColor: glucosePending ? '#c4c5d7' : glucoseValue! > 40 ? '#047857' : '#B91C1C' }}
              />
              <span className="font-derived-value text-[11px] text-[#747686]">
                Scores 1 point above 40 mg/dL.
              </span>
            </label>

            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-xs text-[#434655]">IgG snapshot (mg/dL)</span>
                <span
                  className={`px-2 py-0.5 rounded font-label-caps text-[10px] ${
                    iggPending
                      ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30'
                      : iggValue! > 800
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : iggValue! < 400
                          ? 'bg-[#B91C1C] text-white'
                          : 'bg-[#FFF7ED] text-[#C2410C]'
                  }`}
                >
                  {iggPending
                    ? 'PENDING'
                    : iggValue! > 800
                      ? '+1 POINT'
                      : iggValue! < 400
                        ? 'COMPLETE FPT'
                        : 'PARTIAL FPT'}
                </span>
              </div>
              <input
                type="number"
                value={igg}
                onChange={(e) => setIgg(e.target.value)}
                placeholder="e.g. 850"
                className="w-full font-clinical-value text-lg p-3 bg-white border-2 rounded focus:ring-2 focus:ring-[#6D28D9] focus:outline-none no-spinner"
                style={{
                  borderColor: iggPending ? '#c4c5d7' : iggValue! > 800 ? '#047857' : iggValue! < 400 ? '#B91C1C' : '#C2410C',
                }}
              />
              <span className="font-derived-value text-[11px] text-[#747686]">
                Complete failure of passive transfer below 400 mg/dL; partial 400–800.
              </span>
            </label>

            <button
              type="button"
              onClick={handleUpdate}
              className="w-full min-h-[44px] rounded bg-[#6D28D9] text-white font-label-caps text-xs font-bold"
            >
              Save assessment
            </button>
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
                <span>0 · ~3% survival</span>
                <span className="text-[#B45309]">5 · survival threshold</span>
                <span className="text-[#047857]">7 · ~97% survival</span>
              </div>
            </div>

            <p className="font-derived-value text-xs text-[#434655] mt-6 bg-[#eff4ff] p-3 rounded border border-[#E2E8F0]">
              {confirmedScore === maxPendingScore ? (
                <>
                  All Foal Survival Score inputs are recorded — the score is exact at{' '}
                  <strong>{confirmedScore}/7</strong>.
                </>
              ) : (
                <>
                  Pending results could raise the score from <strong>{confirmedScore}</strong> to{' '}
                  <strong>{maxPendingScore}</strong> of 7. Enter glucose and IgG to resolve it.
                </>
              )}
              {iggValue !== undefined && iggValue < 400 && (
                <> Complete failure of passive transfer (IgG {iggValue} mg/dL).</>
              )}
              {iggValue !== undefined && iggValue >= 400 && iggValue <= 800 && (
                <> Partial failure of passive transfer (IgG {iggValue} mg/dL).</>
              )}
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
