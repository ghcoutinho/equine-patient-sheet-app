import React from 'react';
import { ViewTab, Patient } from '../../types';

interface ClinicalSuiteOverviewProps {
  patients: Patient[];
  onNavigate: (tab: ViewTab) => void;
  onOpenNewAssessment: () => void;
}

export const ClinicalSuiteOverview: React.FC<ClinicalSuiteOverviewProps> = ({
  patients,
  onNavigate,
  onOpenNewAssessment,
}) => {
  const criticalCount = patients.filter(p => p.status === 'CRITICAL').length;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0037b0] via-[#1d4ed8] to-[#1e40af] text-white rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-label-caps tracking-wider border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#ECFDF5] animate-pulse" />
            EQUINE CLINICAL INTELLIGENCE SUITE
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Precision Vitals & Clinical Flowsheet
          </h1>

          <p className="font-body-md text-sm md:text-base text-blue-100 opacity-90 leading-relaxed">
            Standardized ICU & ward monitoring for equine emergency, colic assessment, neonatal sepsis scoring, and automated continuous rate infusion calculators.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-white text-[#0037b0] hover:bg-blue-50 px-4 py-2.5 rounded-lg font-label-caps text-xs font-bold transition shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
              <span>OPEN PATIENT WARD ({patients.length})</span>
            </button>

            <button
              onClick={onOpenNewAssessment}
              className="bg-blue-600/60 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-label-caps text-xs font-bold transition border border-white/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>RECORD NEW ROUND</span>
            </button>
          </div>
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            pets
          </span>
        </div>
      </div>

      {/* Quick Launcher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('flowsheet')}
          className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#1d4ed8] shadow-sm hover:shadow-md transition cursor-pointer group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-lg bg-[#e5eeff] text-[#1d4ed8] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">table_chart</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-[#0b1c30] group-hover:text-[#0037b0] transition">
            Clinical Flowsheet Grid
          </h3>
          <p className="font-body-md text-xs text-[#434655]">
            Sticky timepoint columns, structural family group headers (Vitals, GI, Labs), and color-coded status highlights.
          </p>
          <div className="flex items-center text-xs font-label-caps text-[#0037b0] font-bold gap-1 pt-1">
            <span>EXPLORE FLOWSHEET</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('intelligence')}
          className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#B91C1C] shadow-sm hover:shadow-md transition cursor-pointer group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-lg bg-[#B91C1C]/10 text-[#B91C1C] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>
          <h3 className="font-headline text-lg font-bold text-[#0b1c30] group-hover:text-[#B91C1C] transition">
            Live Intelligence & SIRS
          </h3>
          <p className="font-body-md text-xs text-[#434655]">
            Real-time SIRS criteria detection, Colic Assessment Score (CAS) bounded track, and GI sepsis risk meters.
          </p>
          <div className="flex items-center text-xs font-label-caps text-[#B91C1C] font-bold gap-1 pt-1">
            <span>VIEW ACTIVE ALERTS ({criticalCount})</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('calculator')}
          className="bg-white p-6 rounded-lg border border-[#E2E8F0] hover:border-[#8B5CF6] shadow-sm hover:shadow-md transition cursor-pointer group space-y-3 relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">vaccines</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-[#0b1c30] group-hover:text-[#8B5CF6] transition">
            Dose & CRI Calculator
          </h3>
          <p className="font-body-md text-xs text-[#434655]">
            Weight-adjusted dosing for Flunixin, Dextrose, Lidocaine CRI with Violet safety protocols.
          </p>
          <div className="flex items-center text-xs font-label-caps text-[#8B5CF6] font-bold gap-1 pt-1">
            <span>OPEN DOSE CALCULATOR</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};
