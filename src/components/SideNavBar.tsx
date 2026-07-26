import React from 'react';
import { ViewTab, Patient } from '../types';

interface SideNavBarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  activePatient: Patient;
  onOpenNewAssessment: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentTab,
  setCurrentTab,
  activePatient,
  onOpenNewAssessment,
}) => {
  return (
    <aside className="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-[44px] w-64 bg-[#f8f9ff] dark:bg-[#213145] border-r border-[#E2E8F0] dark:border-[#c4c5d7] z-40 select-none">
      {/* Patient Header Block */}
      <div className="p-5 border-b border-[#E2E8F0] dark:border-[#c4c5d7] flex flex-col items-center text-center bg-white dark:bg-[#0b1c30]/20">
        <div className="w-14 h-14 rounded-full bg-[#e5eeff] overflow-hidden mb-2 border-2 border-[#E2E8F0] flex items-center justify-center text-[#0037b0] relative">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            pets
          </span>
          {activePatient.status === 'CRITICAL' && (
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#B91C1C] border-2 border-white rounded-full animate-pulse-critical" />
          )}
        </div>

        <h2 className="font-headline text-lg font-bold text-[#0037b0] dark:text-[#b7c4ff] leading-tight">
          Patient: {activePatient.name}
        </h2>
        
        <p className="font-body-md text-xs text-[#434655] dark:text-[#c4c5d7] mt-0.5 flex items-center justify-center gap-1.5">
          <span>Case {activePatient.caseNumber}</span>
          <span>•</span>
          <span className={`font-bold ${
            activePatient.status === 'CRITICAL' ? 'text-[#B91C1C] animate-pulse-critical' :
            activePatient.status === 'WATCH' ? 'text-[#B45309]' : 'text-[#047857]'
          }`}>
            {activePatient.statusLabel || activePatient.status}
          </span>
        </p>

        <button
          onClick={onOpenNewAssessment}
          className="mt-3 w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-2 rounded font-label-caps text-xs transition-colors shadow-sm flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>New Assessment</span>
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => setCurrentTab('flowsheet')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'flowsheet'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">table_chart</span>
          <span>Flowsheet</span>
        </button>

        <button
          onClick={() => setCurrentTab('assess')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'assess'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            vital_signs
          </span>
          <span>Vitals & Round</span>
        </button>

        <button
          onClick={() => setCurrentTab('intelligence')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'intelligence'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">emergency</span>
          <span>GI / Colic Intel</span>
        </button>

        <button
          onClick={() => setCurrentTab('scores')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'scores'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">analytics</span>
          <span>Scores & Foal</span>
        </button>

        <button
          onClick={() => setCurrentTab('calculator')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'calculator'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">vaccines</span>
          <span>Dose Calculator</span>
        </button>

        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex items-center gap-3 px-6 py-2.5 text-xs font-label-caps tracking-wider transition-all text-left ${
            currentTab === 'dashboard'
              ? 'bg-[#1d4ed8] text-white font-bold rounded-r-full mr-4 shadow-sm'
              : 'text-[#434655] dark:text-[#d3e4fe] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
          <span>Patient Ward</span>
        </button>
      </div>

      {/* Footer Support Links */}
      <div className="p-4 border-t border-[#E2E8F0] dark:border-[#c4c5d7] flex flex-col gap-1 text-xs font-label-caps">
        <button 
          onClick={() => setCurrentTab('overview')}
          className="flex items-center gap-3 px-3 py-2 text-[#434655] hover:bg-[#eff4ff] rounded transition-colors text-left"
        >
          <span className="material-symbols-outlined text-base">help</span>
          <span>Support & Docs</span>
        </button>
        <button 
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-3 px-3 py-2 text-[#434655] hover:bg-[#eff4ff] rounded transition-colors text-left"
        >
          <span className="material-symbols-outlined text-base">inventory_2</span>
          <span>Archive Cases</span>
        </button>
      </div>
    </aside>
  );
};
