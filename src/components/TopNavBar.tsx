import React from 'react';
import { ViewTab, Patient } from '../types';

interface TopNavBarProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  activePatient: Patient;
  patients: Patient[];
  setActivePatientId: (id: string) => void;
  onOpenNewAssessment: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentTab,
  setCurrentTab,
  activePatient,
  patients,
  setActivePatientId,
  onOpenNewAssessment,
}) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-[44px] bg-[#f8f9ff] dark:bg-[#213145] border-b border-[#E2E8F0] dark:border-[#c4c5d7] select-none">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Logo & Brand */}
        <button 
          onClick={() => setCurrentTab('overview')}
          className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded bg-[#0037b0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            EQ
          </div>
          <span className="text-xl font-headline font-bold text-[#0037b0] dark:text-[#b7c4ff] tracking-tight">
            EquineClinical
          </span>
        </button>

        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-label-caps text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded border border-[#047857]/20 ml-2">
          <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse"></span>
          <span>System Status: All Sensors Online</span>
        </div>
      </div>

      {/* Patient Switcher & Navigation Tabs */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Active Patient Quick Dropdown */}
        <div className="hidden sm:flex items-center gap-2 bg-[#e5eeff] px-2.5 py-1 rounded border border-[#E2E8F0]">
          <span className="material-symbols-outlined text-sm text-[#0037b0]" style={{ fontVariationSettings: "'FILL' 1" }}>
            pets
          </span>
          <select 
            value={activePatient.id}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="bg-transparent text-xs font-headline font-bold text-[#0b1c30] focus:outline-none cursor-pointer pr-1"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.caseNumber})
              </option>
            ))}
          </select>
          {activePatient.status === 'CRITICAL' && (
            <span className="text-[10px] font-bold text-white bg-[#B91C1C] px-1.5 py-0.5 rounded animate-pulse-critical">
              ALERT
            </span>
          )}
        </div>

        {/* Desktop View Switcher */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 h-full text-xs font-label-caps">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentTab === 'dashboard' 
                ? 'bg-[#1d4ed8] text-white font-bold' 
                : 'text-[#434655] hover:bg-[#e5eeff]'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('flowsheet')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentTab === 'flowsheet' 
                ? 'bg-[#1d4ed8] text-white font-bold' 
                : 'text-[#434655] hover:bg-[#e5eeff]'
            }`}
          >
            Flowsheet
          </button>
          <button
            onClick={() => setCurrentTab('intelligence')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentTab === 'intelligence' 
                ? 'bg-[#1d4ed8] text-white font-bold' 
                : 'text-[#434655] hover:bg-[#e5eeff]'
            }`}
          >
            Live Intel
          </button>
          <button
            onClick={() => setCurrentTab('scores')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentTab === 'scores' 
                ? 'bg-[#1d4ed8] text-white font-bold' 
                : 'text-[#434655] hover:bg-[#e5eeff]'
            }`}
          >
            Scores
          </button>
          <button
            onClick={() => setCurrentTab('calculator')}
            className={`px-2.5 py-1 rounded transition-colors ${
              currentTab === 'calculator' 
                ? 'bg-[#1d4ed8] text-white font-bold' 
                : 'text-[#434655] hover:bg-[#e5eeff]'
            }`}
          >
            Dose Calc
          </button>
        </nav>

        {/* Action Controls & Avatar */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <button 
            onClick={onOpenNewAssessment}
            className="hidden sm:flex items-center gap-1 bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-label-caps px-2.5 py-1 rounded transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Assess</span>
          </button>

          <button 
            title="Notifications"
            className="text-[#434655] dark:text-[#d3e4fe] hover:bg-[#e5eeff] dark:hover:bg-[#d3e4fe]/20 p-1.5 rounded-full transition-colors relative"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#B91C1C] rounded-full"></span>
          </button>

          <button 
            title="Settings"
            onClick={() => setCurrentTab('overview')}
            className="text-[#434655] dark:text-[#d3e4fe] hover:bg-[#e5eeff] dark:hover:bg-[#d3e4fe]/20 p-1.5 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>

          {/* Clinician Avatar */}
          <div className="w-7 h-7 rounded-full bg-[#e5eeff] overflow-hidden border border-[#E2E8F0] ml-1 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
              alt="Clinician Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
