import React, { useEffect, useRef, useState } from 'react';
import type { ViewTab, Patient } from '../types';
import { navLabel } from '../data/navigation';

interface TopNavBarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  activePatient: Patient;
  patients: Patient[];
  setActivePatientId: (id: string) => void;
  onOpenNewAssessment: () => void;
  clinician: string;
  setClinician: (name: string) => void;
}

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

/**
 * Top bar: identity and context only.
 *
 * It used to duplicate five of the side-nav tabs under different names, so the
 * same destination was reachable from two places with two labels and two active
 * states. Navigation now lives in the side rail (desktop) and the bottom bar
 * (tablet and phone); this bar answers "which patient, which view, who is
 * charting".
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  setCurrentTab,
  activePatient,
  patients,
  setActivePatientId,
  onOpenNewAssessment,
  clinician,
  setClinician,
}) => {
  const [editingClinician, setEditingClinician] = useState(false);
  const [draft, setDraft] = useState(clinician);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(clinician);
  }, [clinician]);

  useEffect(() => {
    if (!editingClinician) return;
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEditingClinician(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingClinician(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [editingClinician]);

  const commit = () => {
    setClinician(draft.trim());
    setEditingClinician(false);
  };

  const named = clinician.trim().length > 0;

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center gap-3 px-3 md:px-5 h-[44px] bg-[#f8f9ff] border-b border-[#E2E8F0] select-none">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setCurrentTab('overview')}
          title="About this suite"
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div className="w-6 h-6 rounded bg-[#0037b0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            EQ
          </div>
          <span className="hidden sm:inline text-lg font-headline font-bold text-[#0037b0] tracking-tight">
            EquineClinical
          </span>
        </button>

        {/* Where you are. Not a control — navigation lives in the rails. */}
        <span className="hidden md:flex items-center gap-2 text-xs font-label-caps text-[#747686] min-w-0">
          <span className="material-symbols-outlined text-sm" aria-hidden>
            chevron_right
          </span>
          <span className="truncate text-[#434655]">{navLabel(currentTab)}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Active patient */}
        <div className="flex items-center gap-1.5 bg-[#e5eeff] px-2 py-1 rounded border border-[#E2E8F0] min-w-0">
          <span
            className="material-symbols-outlined text-sm text-[#0037b0] flex-shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
            aria-hidden
          >
            pets
          </span>
          <select
            aria-label="Active patient"
            value={activePatient.id}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="bg-transparent text-xs font-headline font-bold text-[#0b1c30] focus:outline-none cursor-pointer max-w-[8rem] md:max-w-none truncate"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.caseNumber})
                {p.isTest ? ' — test' : ''}
              </option>
            ))}
          </select>
          {activePatient.status === 'CRITICAL' && (
            <span className="hidden sm:inline text-[10px] font-bold text-white bg-[#B91C1C] px-1.5 py-0.5 rounded">
              ALERT
            </span>
          )}
        </div>

        <button
          onClick={onOpenNewAssessment}
          className="flex items-center gap-1 bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-label-caps px-2.5 py-1 rounded transition-colors shadow-sm flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            add
          </span>
          <span className="hidden sm:inline">Assess</span>
        </button>

        {/* Who is charting. Rounds are stamped with this name. */}
        <div className="relative flex-shrink-0" ref={popoverRef}>
          <button
            onClick={() => setEditingClinician((v) => !v)}
            aria-expanded={editingClinician}
            title={
              named
                ? `Charting as ${clinician} — click to change`
                : 'No clinician set — rounds save as "Unattributed". Click to set your name.'
            }
            className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border transition-colors ${
              named
                ? 'bg-white border-[#E2E8F0] hover:bg-[#eff4ff]'
                : 'bg-[#FFFBEB] border-[#B45309]/40 hover:bg-[#FEF3C7]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                named ? 'bg-[#0037b0] text-white' : 'bg-[#B45309] text-white'
              }`}
            >
              {named ? initialsOf(clinician) : '!'}
            </span>
            <span
              className={`hidden md:inline text-xs font-label-caps max-w-[9rem] truncate ${
                named ? 'text-[#434655]' : 'text-[#B45309] font-bold'
              }`}
            >
              {named ? clinician : 'Set your name'}
            </span>
          </button>

          {editingClinician && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-72 bg-white border border-[#E2E8F0] rounded shadow-lg p-3 z-50">
              <label
                htmlFor="clinician-name"
                className="block font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-1.5"
              >
                Charting as
              </label>
              <input
                id="clinician-name"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit();
                }}
                placeholder="e.g. Dr G. Coutinho"
                className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm font-body-md focus:outline-none focus:border-[#0037b0]"
              />
              <p className="font-derived-value text-[11px] text-[#434655] mt-2 leading-snug">
                Every round and every edit is stamped with this name. Leave it blank and
                entries save as <span className="font-bold">Unattributed</span>. Stored in this
                browser only.
              </p>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setEditingClinician(false)}
                  className="text-xs font-label-caps px-2.5 py-1 rounded text-[#434655] hover:bg-[#eff4ff]"
                >
                  Cancel
                </button>
                <button
                  onClick={commit}
                  className="text-xs font-label-caps px-2.5 py-1 rounded bg-[#0037b0] text-white hover:bg-[#1d4ed8]"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
