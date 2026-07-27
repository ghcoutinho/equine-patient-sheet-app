import React, { useState } from 'react';
import type { ViewTab } from '../types';
import {
  MOBILE_PRIMARY,
  NAV_ORDER,
  NAV_GROUP_LABEL,
  itemsInGroup,
} from '../data/navigation';

interface MobileBottomNavProps {
  currentTab: ViewTab;
  setCurrentTab: (tab: ViewTab) => void;
  hasCriticalAlert?: boolean;
}

/**
 * Tablet and phone navigation. Four primary destinations plus a sheet holding
 * everything else, so no tab is unreachable below the desktop breakpoint —
 * previously five of the ten views simply had no route on small screens.
 * Labels come from the shared nav list, so a tab is called the same thing here
 * as it is in the side rail.
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  hasCriticalAlert = false,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const overflowActive = !MOBILE_PRIMARY.some((i) => i.id === currentTab);

  const go = (tab: ViewTab) => {
    setCurrentTab(tab);
    setSheetOpen(false);
  };

  return (
    <>
      {sheetOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setSheetOpen(false)}
          aria-hidden
        />
      )}

      {sheetOpen && (
        <div
          role="dialog"
          aria-label="All views"
          className="lg:hidden fixed bottom-[64px] left-2 right-2 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-h-[70vh] overflow-y-auto p-3"
        >
          {NAV_ORDER.map((group) => (
            <div key={group} className="mb-3 last:mb-0">
              <h3 className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase px-1 pb-1">
                {NAV_GROUP_LABEL[group]}
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {itemsInGroup(group).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded text-left transition-colors ${
                      currentTab === item.id
                        ? 'bg-[#1d4ed8] text-white'
                        : 'bg-[#f8f9ff] text-[#434655] hover:bg-[#e5eeff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="font-label-caps text-[11px] leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <nav
        aria-label="Main navigation"
        className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-stretch px-1 py-1.5 bg-[#f8f9ff] border-t border-[#E2E8F0] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] select-none"
      >
        {MOBILE_PRIMARY.map((item) => {
          const active = currentTab === item.id;
          const flagged = item.id === 'intelligence' && hasCriticalAlert;
          return (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 p-1 rounded-lg transition-colors ${
                active ? 'text-[#0037b0] font-bold bg-[#e5eeff]' : 'text-[#434655]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-xl ${flagged ? 'text-[#B91C1C]' : ''}`}
                style={item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-label-caps text-[10px] mt-0.5">{item.shortLabel}</span>
              {flagged && (
                <span className="absolute top-0.5 right-3 w-2 h-2 bg-[#B91C1C] rounded-full animate-pulse-critical" />
              )}
            </button>
          );
        })}

        <button
          onClick={() => setSheetOpen((v) => !v)}
          aria-expanded={sheetOpen}
          aria-label="All views"
          className={`flex flex-col items-center justify-center flex-1 p-1 rounded-lg transition-colors ${
            sheetOpen || overflowActive
              ? 'text-[#0037b0] font-bold bg-[#e5eeff]'
              : 'text-[#434655]'
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {sheetOpen ? 'close' : 'more_horiz'}
          </span>
          <span className="font-label-caps text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
