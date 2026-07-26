import React from 'react';
import { ViewTab } from '../types';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  hasCriticalAlert?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  hasCriticalAlert = true,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-[#f8f9ff] dark:bg-[#213145] border-t border-[#E2E8F0] dark:border-[#c4c5d7] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] rounded-t-xl select-none">
      <button
        onClick={() => setCurrentTab('flowsheet')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentTab === 'flowsheet'
            ? 'text-[#0037b0] font-bold'
            : 'text-[#434655] hover:bg-[#e5eeff]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">history</span>
        <span className="font-label-caps text-[10px] mt-0.5">Timeline</span>
      </button>

      <button
        onClick={() => setCurrentTab('assess')}
        className={`flex flex-col items-center justify-center rounded-full px-3.5 py-1 transition-transform active:scale-95 shadow-md ${
          currentTab === 'assess'
            ? 'bg-[#8b4ef7] text-white'
            : 'bg-[#e5eeff] text-[#0037b0]'
        }`}
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          add_box
        </span>
        <span className="font-label-caps text-[10px] font-bold mt-0.5">Assess</span>
      </button>

      <button
        onClick={() => setCurrentTab('intelligence')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors relative ${
          currentTab === 'intelligence'
            ? 'text-[#B91C1C] font-bold'
            : 'text-[#434655] hover:bg-[#e5eeff]'
        }`}
      >
        <span 
          className={`material-symbols-outlined text-xl ${hasCriticalAlert ? 'text-[#B91C1C]' : ''}`} 
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          warning
        </span>
        <span className="font-label-caps text-[10px] mt-0.5">Alerts</span>
        {hasCriticalAlert && (
          <span className="absolute top-1 right-2 w-2 h-2 bg-[#B91C1C] rounded-full animate-pulse-critical"></span>
        )}
      </button>

      <button
        onClick={() => setCurrentTab('calculator')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentTab === 'calculator'
            ? 'text-[#0037b0] font-bold'
            : 'text-[#434655] hover:bg-[#e5eeff]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">vaccines</span>
        <span className="font-label-caps text-[10px] mt-0.5">Dose Calc</span>
      </button>

      <button
        onClick={() => setCurrentTab('dashboard')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentTab === 'dashboard'
            ? 'text-[#0037b0] font-bold'
            : 'text-[#434655] hover:bg-[#e5eeff]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">grid_view</span>
        <span className="font-label-caps text-[10px] mt-0.5">Ward</span>
      </button>
    </nav>
  );
};
