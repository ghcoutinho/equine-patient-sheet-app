import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';
import { episodeTimeline, type EpisodeEvent, type EpisodeEventKind } from '../../utils/episodeTimeline';
import { clockTime, dayLabel } from '../../utils/treatments';

interface EvolutionViewProps {
  patient: Patient;
}

const KIND_ICON: Record<EpisodeEventKind, string> = {
  ROUND: 'vital_signs',
  ROUND_EDITED: 'edit',
  LAB_PANEL: 'science',
  TREATMENT_STARTED: 'play_circle',
  TREATMENT_GIVEN: 'check_circle',
  TREATMENT_RATE_CHANGE: 'speed',
  TREATMENT_BAG_CHANGE: 'water_drop',
  TREATMENT_PAUSED: 'pause_circle',
  TREATMENT_RESUMED: 'play_circle',
  TREATMENT_STOPPED: 'stop_circle',
};

const KIND_COLOR: Record<EpisodeEventKind, string> = {
  ROUND: '#0037b0',
  ROUND_EDITED: '#747686',
  LAB_PANEL: '#0E7490',
  TREATMENT_STARTED: '#0037b0',
  TREATMENT_GIVEN: '#047857',
  TREATMENT_RATE_CHANGE: '#B45309',
  TREATMENT_BAG_CHANGE: '#0E7490',
  TREATMENT_PAUSED: '#747686',
  TREATMENT_RESUMED: '#047857',
  TREATMENT_STOPPED: '#747686',
};

/**
 * The evolution timeline — every round, lab and treatment event this
 * admission, merged into one chronological feed. "Evolução" in the original
 * vision: the record read forward, not one screen at a time.
 */
export const EvolutionView: React.FC<EvolutionViewProps> = ({ patient }) => {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const events = episodeTimeline(patient);

  // Group by day label so the feed reads like a chart, not an endless list.
  const groups: { day: string; events: EpisodeEvent[] }[] = [];
  for (const e of events) {
    const day = dayLabel(e.at, now);
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.events.push(e);
    else groups.push({ day, events: [e] });
  }

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#6D28D9] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            EVOLUTION
          </span>
          <span className="text-xs font-derived-value text-[#434655]">
            Rounds, labs and treatments — current admission
          </span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">{patient.name}</h1>
        <p className="font-body-md text-sm text-[#434655] mt-1">
          {events.length} event{events.length === 1 ? '' : 's'} charted
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-8 rounded-lg border border-[#E2E8F0] shadow-sm text-center">
          <p className="font-body-md text-sm text-[#434655]">
            Nothing charted for this admission yet.
          </p>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.day} className="space-y-2">
            <h2 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider sticky top-0 bg-[#F8FAFC] py-1">
              {g.day}
            </h2>
            <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-[#E2E8F0]">
                {g.events.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 p-3 hover:bg-[#f8f9ff]">
                    <div className="w-14 flex-shrink-0 text-right font-derived-value text-sm font-bold text-[#0b1c30] mt-0.5">
                      {clockTime(e.at)}
                    </div>
                    <span
                      className="material-symbols-outlined text-lg mt-0.5 flex-shrink-0"
                      style={{ color: KIND_COLOR[e.kind] }}
                    >
                      {KIND_ICON[e.kind]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body-md text-sm text-[#0b1c30] font-bold">
                          {e.label}
                        </span>
                        {e.flagged && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFF7ED] border border-[#C2410C]/30 text-[#C2410C] font-label-caps text-[9px]">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            override
                          </span>
                        )}
                      </div>
                      {e.detail && (
                        <p className="font-derived-value text-xs text-[#434655] mt-0.5">
                          {e.detail}
                        </p>
                      )}
                      {e.note && (
                        <p className="font-derived-value text-xs text-[#747686] mt-0.5 italic">
                          {e.note}
                        </p>
                      )}
                      <p className="font-derived-value text-[10px] text-[#94a3b8] mt-0.5">
                        {e.by || 'Unattributed'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
