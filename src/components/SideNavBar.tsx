import React from 'react';
import type { ViewTab, Patient } from '../types';
import { NAV_ORDER, NAV_GROUP_LABEL, itemsInGroup } from '../data/navigation';
import { nextDue, DUE_STYLES } from '../utils/schedule';
import { PatientMarkIcon } from './ui/PatientMark';
import { patientAge } from '../data/patientIdentity';

interface SideNavBarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  activePatient: Patient;
  onOpenNewAssessment: () => void;
}

/**
 * Desktop navigation rail. Every tab appears here exactly once, grouped by what
 * the clinician is trying to do — chart, decide, look something up, manage the
 * record. The top bar deliberately carries no tabs of its own.
 */
export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  setCurrentTab,
  activePatient,
  onOpenNewAssessment,
}) => {
  const due = nextDue(activePatient.schedule, new Date());

  return (
    <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-[44px] w-64 bg-[#f8f9ff] border-r border-[#E2E8F0] z-40 select-none">
      {/* Active patient context */}
      <div className="p-4 border-b border-[#E2E8F0] flex flex-col items-center text-center bg-white">
        <PatientMarkIcon patient={activePatient} size={48} showStatus className="mb-2" />

        <h2 className="font-headline text-base font-bold text-[#0037b0] leading-tight">
          {activePatient.name}
          {activePatient.isTest && (
            <span className="ml-1.5 align-middle text-[9px] font-label-caps bg-[#EDE9FE] text-[#6D28D9] border border-[#6D28D9]/30 px-1 py-px rounded">
              TEST
            </span>
          )}
        </h2>

        <p className="font-body-md text-[11px] text-[#747686] mt-0.5">
          {patientAge(activePatient, new Date()).label} · {activePatient.weightKg} kg
        </p>

        <p className="font-body-md text-xs text-[#434655] mt-0.5 flex items-center justify-center gap-1.5">
          <span>Case {activePatient.caseNumber}</span>
          <span aria-hidden>•</span>
          <span
            className={`font-bold ${
              activePatient.status === 'CRITICAL'
                ? 'text-[#B91C1C]'
                : activePatient.status === 'WATCH'
                  ? 'text-[#B45309]'
                  : 'text-[#047857]'
            }`}
          >
            {activePatient.statusLabel || activePatient.status}
          </span>
        </p>

        {due && (
          <button
            onClick={() => setCurrentTab('flowsheet')}
            className={`mt-2 w-full text-[10px] font-label-caps px-2 py-1 rounded flex items-center justify-center gap-1.5 ${DUE_STYLES[due.state].chip}`}
            title={`Next due: ${due.task.label}`}
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="truncate">
              {due.task.label} · {due.label}
            </span>
          </button>
        )}

        <button
          onClick={onOpenNewAssessment}
          className="mt-2 w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-2 rounded font-label-caps text-xs transition-colors shadow-sm flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Assessment</span>
        </button>
      </div>

      {/* Navigation, one entry per tab */}
      <nav className="flex-1 py-3 overflow-y-auto" aria-label="Main navigation">
        {NAV_ORDER.map((group) => (
          <div key={group} className="mb-3">
            <h3 className="px-6 pb-1 font-label-caps text-[10px] tracking-widest text-[#747686] uppercase">
              {NAV_GROUP_LABEL[group]}
            </h3>
            <div className="flex flex-col gap-0.5">
              {itemsInGroup(group).map((item) => {
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    title={item.hint}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 px-6 py-2 text-xs font-label-caps tracking-wider transition-all text-left ${
                      active
                        ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
                        : 'text-[#434655] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-lg"
                      style={item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};
