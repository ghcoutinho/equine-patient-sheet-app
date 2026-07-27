import React, { useMemo, useState } from 'react';
import { Patient, DrugFormularyItem } from '../../types';
import { EXPANDED_FORMULARY } from '../../data/expandedFormulary';
import {
  computeDose,
  parseDoseUnit,
  VOLUME_BLOCKED_MESSAGE,
} from '../../utils/doseCalculation';

interface DoseCalculatorViewProps {
  patient: Patient;
  onApplyMedicationToFlowsheet?: (medName: string, doseText: string) => void;
}

/** Stable React key — the formulary contains 9 duplicated ids. */
const rowKey = (drug: DrugFormularyItem, index: number) => `${drug.id}-${index}`;

export const DoseCalculatorView: React.FC<DoseCalculatorViewProps> = ({
  patient,
  onApplyMedicationToFlowsheet,
}) => {
  const [weightKg, setWeightKg] = useState<number>(patient.weightKg || 500);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [doseOverride, setDoseOverride] = useState<number | null>(null);
  const [concentrationOverride, setConcentrationOverride] = useState<string>('');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const isFoal = patient.isFoal || patient.category === 'NEONATAL_FOAL';

  const categories = useMemo(() => {
    const set = new Set<string>();
    EXPANDED_FORMULARY.forEach((d) => d.categories?.forEach((c) => set.add(c)));
    return ['ALL', ...Array.from(set).sort()];
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return EXPANDED_FORMULARY.filter((d) => {
      const matchesPatient =
        d.patientType === 'BOTH' || d.patientType === (isFoal ? 'FOAL' : 'ADULT');
      if (!matchesPatient) return false;
      if (category !== 'ALL' && !(d.categories || []).includes(category)) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        (d.brandName || '').toLowerCase().includes(q) ||
        (d.indications || []).some((i) => i.toLowerCase().includes(q))
      );
    });
  }, [search, category, isFoal]);

  const selected = selectedIndex !== null ? results[selectedIndex] : undefined;

  const selectDrug = (index: number) => {
    setSelectedIndex(index);
    setDoseOverride(null);
    setConcentrationOverride('');
  };

  const dose = selected ? doseOverride ?? selected.doseDefault : 0;
  const concentration = selected
    ? concentrationOverride.trim() !== ''
      ? Number(concentrationOverride)
      : selected.concentration
    : 0;

  const result = selected
    ? computeDose({
        weightKg,
        dose,
        doseUnit: selected.doseUnit,
        concentration: Number.isFinite(concentration) ? concentration : 0,
      })
    : null;

  const spec = selected ? parseDoseUnit(selected.doseUnit) : null;
  const isRate = spec?.kind === 'per-kg-rate';
  const accent = isRate ? '#8B5CF6' : '#0037b0';

  const handleApply = () => {
    if (!selected || !result) return;
    const text = `${selected.name} ${dose} ${selected.doseUnit} — ${result.summary}${
      selected.route?.length ? ` ${selected.route[0]}` : ''
    }${selected.frequency ? ` ${selected.frequency}` : ''}`;
    onApplyMedicationToFlowsheet?.(selected.name, text);
    setAppliedNotice(`Recorded: ${text}`);
    setTimeout(() => setAppliedNotice(null), 4000);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      {/* Header & weight */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#0037b0] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
              VETERINARY PHARMACOLOGY
            </span>
            <span className="text-xs font-derived-value text-[#434655]">
              {EXPANDED_FORMULARY.length} drugs · {results.length} for this patient
            </span>
          </div>
          <h1 className="font-display text-2xl text-[#0b1c30] mt-1">
            Precision Dose &amp; CRI Calculator
          </h1>
          <p className="font-body-md text-sm text-[#434655] mt-1">
            Active Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> (
            {patient.breed}) · {isFoal ? 'foal' : 'adult'} formulary
          </p>
        </div>

        <div className="bg-[#eff4ff] border border-[#E2E8F0] p-4 rounded-lg flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="font-label-caps text-[10px] text-[#434655] block" htmlFor="weight">
              PATIENT WEIGHT
            </label>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl text-[#0037b0] font-bold">{weightKg}</span>
              <span className="font-label-caps text-xs text-[#434655]">kg</span>
            </div>
          </div>
          <div className="flex-1 md:w-48">
            <input
              id="weight"
              type="range"
              min="40"
              max="900"
              step="5"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#e5eeff] rounded-lg appearance-none cursor-pointer accent-[#0037b0]"
            />
            <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-1">
              <span>Foal 40</span>
              <span>Light 400</span>
              <span>Draft 800</span>
            </div>
          </div>
        </div>
      </div>

      {appliedNotice && (
        <div
          role="status"
          className="p-3 bg-[#ECFDF5] border border-[#047857] text-[#047857] rounded-lg font-derived-value text-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{appliedNotice}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(null);
          }}
          placeholder={`Search ${EXPANDED_FORMULARY.length} drugs by name, brand or indication…`}
          aria-label="Search the formulary"
          className="flex-1 min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSelectedIndex(null);
          }}
          aria-label="Filter by category"
          className="min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-body-md text-sm sm:w-72 focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'ALL' ? 'All categories' : c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Results */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-[#f8f9ff] border-b border-[#E2E8F0] font-label-caps text-xs text-[#434655]">
            {results.length} result{results.length === 1 ? '' : 's'}
          </div>
          <ul className="max-h-[560px] overflow-y-auto divide-y divide-[#E2E8F0]">
            {results.length === 0 && (
              <li className="p-6 text-center font-body-md text-sm text-[#434655]">
                No drug matches those filters.
              </li>
            )}
            {results.map((drug, i) => {
              const active = selectedIndex === i;
              const rate = parseDoseUnit(drug.doseUnit).kind === 'per-kg-rate';
              return (
                <li key={rowKey(drug, i)}>
                  <button
                    type="button"
                    onClick={() => selectDrug(i)}
                    aria-current={active}
                    className={`w-full text-left px-4 py-3 min-h-[44px] transition ${
                      active ? 'bg-[#e5eeff]' : 'hover:bg-[#f8f9ff]'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-headline text-sm font-bold text-[#0b1c30]">
                        {drug.name}
                        {drug.brandName && (
                          <span className="font-body-md font-normal text-[#747686]">
                            {' '}
                            ({drug.brandName})
                          </span>
                        )}
                      </span>
                      {rate && (
                        <span className="text-[10px] font-label-caps px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 flex-shrink-0">
                          CRI
                        </span>
                      )}
                    </span>
                    <span className="block font-derived-value text-xs text-[#434655] mt-0.5">
                      {drug.doseMin === drug.doseMax
                        ? `${drug.doseDefault} ${drug.doseUnit}`
                        : `${drug.doseMin}–${drug.doseMax} ${drug.doseUnit}`}
                      {drug.route?.length ? ` · ${drug.route.join('/')}` : ''}
                      {drug.frequency ? ` · ${drug.frequency}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Calculator */}
        {!selected || !result ? (
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c5d7]">vaccines</span>
            <p className="font-body-md text-sm text-[#434655] mt-2">
              Select a drug to calculate a dose for {patient.name}.
            </p>
          </div>
        ) : (
          <div
            className="bg-white rounded-lg shadow-sm p-6 space-y-5"
            style={{ border: `${isRate ? 2 : 1}px solid ${isRate ? accent : '#E2E8F0'}` }}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-[#0b1c30]">
                  {selected.name}
                  {selected.brandName && (
                    <span className="font-body-md font-normal text-[#747686]">
                      {' '}
                      ({selected.brandName})
                    </span>
                  )}
                </h2>
                <p className="font-derived-value text-xs text-[#434655]">
                  {(selected.categories || []).join(' · ')}
                </p>
              </div>
              <span
                className="px-2 py-0.5 rounded font-label-caps text-xs whitespace-nowrap"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
              >
                {selected.route?.join('/') || '—'}
              </span>
            </div>

            {/* Dose */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-caps text-xs text-[#434655]" htmlFor="dose">
                  Target dose ({selected.doseUnit})
                </label>
                <span className="font-clinical-value text-sm font-bold" style={{ color: accent }}>
                  {dose} {selected.doseUnit}
                </span>
              </div>
              {selected.doseMin < selected.doseMax ? (
                <>
                  <input
                    id="dose"
                    type="range"
                    min={selected.doseMin}
                    max={selected.doseMax}
                    step={(selected.doseMax - selected.doseMin) / 100}
                    value={dose}
                    onChange={(e) => setDoseOverride(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#e5eeff]"
                    style={{ accentColor: accent }}
                  />
                  <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-0.5">
                    <span>Min {selected.doseMin}</span>
                    <span>Formulary default {selected.doseDefault}</span>
                    <span>Max {selected.doseMax}</span>
                  </div>
                </>
              ) : (
                <p className="font-derived-value text-xs text-[#434655]">
                  Single published dose — no range on file.
                </p>
              )}
              {spec?.qualifier && (
                <p className="font-derived-value text-[11px] text-[#B45309] mt-1">
                  Dose is expressed as: {spec.qualifier}
                </p>
              )}
            </div>

            {/* Concentration */}
            <div>
              <label className="font-label-caps text-xs text-[#434655] block mb-1" htmlFor="conc">
                Concentration (mg/mL)
              </label>
              <input
                id="conc"
                type="number"
                step="0.1"
                value={concentrationOverride !== '' ? concentrationOverride : selected.concentration || ''}
                onChange={(e) => setConcentrationOverride(e.target.value)}
                placeholder="Not on file — enter what is on the bottle"
                className="w-full min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded font-clinical-value text-sm focus:ring-2 focus:outline-none no-spinner"
                style={{ ['--tw-ring-color' as string]: accent }}
              />
              {!selected.concentration && (
                <p className="font-derived-value text-[11px] text-[#B45309] mt-1">
                  No concentration in the formulary for this drug — enter the product
                  concentration to get a volume.
                </p>
              )}
            </div>

            {/* Result */}
            <div className="p-4 bg-[#f8f9ff] rounded border border-[#E2E8F0] grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="font-label-caps text-[10px] text-[#434655] block">
                  {isRate ? 'AMOUNT PER HOUR' : 'TOTAL DOSE'}
                </span>
                <span className="font-display text-2xl text-[#0b1c30]">
                  {result.amount ?? '—'}
                  <span className="text-xs text-[#747686]"> {result.amountUnit ?? ''}</span>
                </span>
              </div>
              <div>
                <span className="font-label-caps text-[10px] text-[#434655] block">
                  {isRate ? 'INFUSION RATE' : 'VOLUME TO ADMINISTER'}
                </span>
                {result.volume !== undefined ? (
                  <span className="font-display text-2xl" style={{ color: accent }}>
                    {result.volume}
                    <span className="text-xs text-[#747686]"> {result.volumeUnit}</span>
                  </span>
                ) : (
                  <span className="font-derived-value text-xs text-[#B45309] block mt-1">
                    {VOLUME_BLOCKED_MESSAGE[result.volumeBlocked!]}
                  </span>
                )}
              </div>
            </div>

            {selected.frequency && (
              <p className="font-derived-value text-xs text-[#434655]">
                Formulary frequency: <strong>{selected.frequency}</strong>
              </p>
            )}

            {/* Dosing that changes with foal age */}
            {selected.foalAgeBands && selected.foalAgeBands.length > 0 && (
              <div className="rounded border border-[#B45309]/30 bg-[#FFFBEB] overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#B45309]/20">
                  <span className="font-label-caps text-[10px] text-[#B45309] font-bold uppercase tracking-wider">
                    Dose varies with foal age
                  </span>
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody className="text-xs">
                    {selected.foalAgeBands.map((band) => (
                      <tr key={band.label} className="border-b border-[#B45309]/10 last:border-0">
                        <td className="px-3 py-1.5 font-body-md text-[#0b1c30] whitespace-nowrap">
                          {band.label}
                        </td>
                        <td className="px-3 py-1.5 font-clinical-value text-[#0b1c30]">
                          {band.dose}
                        </td>
                        <td className="px-3 py-1.5 text-[#747686] font-sans whitespace-nowrap">
                          {[band.route, band.frequency].filter(Boolean).join(' · ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-3 py-1.5 font-derived-value text-[10px] text-[#B45309]">
                  The slider above uses a single figure. Pick the band that matches this foal.
                </p>
              </div>
            )}

            {selected.sourceNote && (
              <p className="font-derived-value text-[11px] text-[#747686]">
                Source: {selected.sourceNote}
              </p>
            )}

            {selected.indications?.length > 0 && (
              <div>
                <span className="font-label-caps text-[10px] text-[#434655] block mb-1">
                  INDICATIONS
                </span>
                <p className="font-body-md text-xs text-[#0b1c30]">
                  {selected.indications.join(' · ')}
                </p>
              </div>
            )}

            {selected.cautions && (
              <div className="p-3 rounded border bg-[#FFF7ED] border-[#C2410C]/30">
                <span className="font-label-caps text-[10px] text-[#C2410C] block mb-0.5">
                  CAUTIONS
                </span>
                <p className="font-body-md text-xs text-[#0b1c30]">{selected.cautions}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 rounded font-label-caps text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 min-h-[44px]"
              style={{ backgroundColor: accent }}
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              <span>{isRate ? 'START CRI & RECORD' : 'RECORD ON FLOWSHEET'}</span>
            </button>

            <p className="font-derived-value text-[11px] text-[#747686] text-center">
              Decision support only — verify every dose against your own formulary before
              administration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
