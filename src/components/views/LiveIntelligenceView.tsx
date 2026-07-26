import React from 'react';
import { Patient } from '../../types';
import { evaluateCallSurgeonTriggers, latestColumn } from '../../utils/callSurgeonTriggers';

interface LiveIntelligenceViewProps {
  patient: Patient;
  onOpenNewAssessment: () => void;
}

export const LiveIntelligenceView: React.FC<LiveIntelligenceViewProps> = ({
  patient,
  onOpenNewAssessment,
}) => {
  const latest = latestColumn(patient.flowsheetHistory);
  const triggers = evaluateCallSurgeonTriggers(latest);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto bg-[#F8FAFC]">
      {/* Left Dummy/Context Pane */}
      <main className="flex-1 p-6 lg:p-8 hidden md:flex flex-col justify-center items-center border-r border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#e5eeff] text-[#0037b0] flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-3xl">edit_document</span>
          </div>
          <h2 className="font-headline text-xl text-[#0b1c30]">
            Clinical Intelligence Rail
          </h2>
          <p className="font-body-md text-sm text-[#434655]">
            Focus is on active patient real-time decision support, SIRS alerts, and colic assessment scoring for <span className="font-bold text-[#0037b0]">{patient.name}</span>.
          </p>
          <button
            onClick={onOpenNewAssessment}
            className="mt-4 px-4 py-2 bg-[#0037b0] text-white rounded text-xs font-label-caps hover:bg-[#1d4ed8] transition shadow-sm"
          >
            Log New Clinical Assessment
          </button>
        </div>
      </main>

      {/* Right Live Intelligence Rail */}
      <aside className="w-full md:w-[420px] lg:w-[460px] bg-white border-l border-[#E2E8F0] flex flex-col p-6 space-y-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="font-headline text-xl font-bold text-[#0b1c30]">
            Live Intelligence
          </h3>
          <span className="material-symbols-outlined text-[#434655]">monitoring</span>
        </div>

        {/* Alerts & Notifications */}
        <section className="relative space-y-3">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#6D28D9] rounded-r" />
          <div className="pl-4">
            <h4 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-3">
              Alerts & Notifications
            </h4>

            {/* Critical Alert */}
            {patient.sirsCriteriaMet && (
              <div className="bg-[#B91C1C] text-white rounded border border-[#B91C1C] p-3.5 shadow-md mb-2 animate-pulse-critical relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      warning
                    </span>
                    <div>
                      <div className="font-body-md font-bold leading-tight text-sm">
                        SIRS Criteria Met
                      </div>
                      <div className="font-derived-value text-xs opacity-90 mt-1">
                        {patient.sirsDescription || 'HR > 60 & RR > 30 detected.'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-label-caps whitespace-nowrap">
                    [SIRS 2016]
                  </span>
                </div>
              </div>
            )}

            {/* Call-surgeon triggers, computed from the latest charted round */}
            {triggers.length === 0 ? (
              <div className="bg-[#eff4ff] border border-[#E2E8F0] rounded p-3 text-xs text-[#434655] font-derived-value">
                No call-surgeon triggers on the latest round
                {latest ? ` (${latest.time})` : ' — no round charted yet'}.
              </div>
            ) : (
              triggers.map((t) => (
                <div
                  key={t.id}
                  className={`rounded p-3 mb-2 flex items-start justify-between border ${
                    t.severity === 'critical'
                      ? 'bg-[#B91C1C]/5 border-[#B91C1C]/30'
                      : 'bg-[#FFF7ED] border-[#C2410C]/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`material-symbols-outlined mt-0.5 ${
                        t.severity === 'critical' ? 'text-[#B91C1C]' : 'text-[#C2410C]'
                      }`}
                    >
                      {t.severity === 'critical' ? 'warning' : 'info'}
                    </span>
                    <div>
                      <div className="font-body-md text-sm text-[#0b1c30] font-semibold leading-tight">
                        {t.label}
                      </div>
                      <div className="font-derived-value text-xs text-[#434655] mt-0.5">
                        {t.evidence} · rule: {t.rule}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white text-[#434655] px-1.5 py-0.5 rounded font-label-caps border border-[#c4c5d7] whitespace-nowrap">
                    [Ward rule]
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Bounded Score Track: Colic Assessment Score (CAS) */}
        <section className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#334155] rounded-r" />
          <div className="pl-4">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-1">
                  Colic Assessment Score (CAS)
                </h4>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl text-[#0b1c30]">
                    {patient.casScoreConfirmed}-{patient.casScoreMaxPending}
                  </span>
                  <span className="text-[10px] bg-[#d3e4fe] text-[#434655] px-1.5 py-0.5 rounded font-label-caps border border-[#c4c5d7]">
                    [Frontiers 2021]
                  </span>
                </div>
              </div>

              <span className="font-derived-value text-xs text-[#C2410C] bg-[#FFF7ED] px-2 py-1 rounded font-bold border border-[#C2410C]/20">
                Action Range
              </span>
            </div>

            {/* Score Track Bar */}
            <div className="w-full h-8 bg-[#e5eeff] rounded-full overflow-hidden flex relative border border-[#E2E8F0] shadow-inner mb-2">
              {/* Baseline 0-2 */}
              <div className="h-full bg-[#ECFDF5] border-r border-[#E2E8F0]" style={{ width: '15%' }} />
              {/* Confirmed Score */}
              <div className="h-full bg-[#334155] relative" style={{ width: '15%' }}>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-white font-derived-value text-xs font-bold">
                  {patient.casScoreConfirmed}
                </div>
              </div>
              {/* Uncertainty Band (diagonal hatching for pending) */}
              <div 
                className="h-full bg-[#334155]/20 rail-track border-r-2 border-dashed border-[#334155]" 
                style={{ width: '40%' }} 
              />
              {/* Remaining Scale */}
              <div className="h-full bg-transparent" style={{ width: '30%' }} />

              {/* Threshold Markers */}
              <div className="absolute top-0 bottom-0 left-[25%] w-px bg-[#B45309]/50 border-l border-dashed border-[#B45309]" title="Mild Threshold" />
              <div className="absolute top-0 bottom-0 left-[55%] w-px bg-[#B91C1C]/50 border-l border-dashed border-[#B91C1C]" title="Severe Threshold" />
            </div>

            <div className="flex justify-between font-label-caps text-[10px] text-[#434655]">
              <span>0</span>
              <span className="text-[#B45309] font-bold">Mild (5)</span>
              <span className="text-[#B91C1C] font-bold">Severe (11)</span>
              <span>20</span>
            </div>

            <p className="font-derived-value text-xs text-[#434655] mt-2 bg-[#eff4ff] p-2 rounded border border-[#E2E8F0]">
              Confirmed score is {patient.casScoreConfirmed}. Pending parameters (Calcium) could increase total to {patient.casScoreMaxPending}.
            </p>
          </div>
        </section>

        {/* CAS Contribution Ledger */}
        <section className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0E7490] rounded-r" />
          <div className="pl-4">
            <h4 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-3">
              CAS Contribution Ledger
            </h4>
            <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden">
              <ul className="divide-y divide-[#E2E8F0] font-derived-value text-xs">
                <li className="flex justify-between items-center p-3 hover:bg-[#eff4ff] transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    Heart Rate
                  </span>
                  <span className="font-bold text-[#0b1c30]">+2</span>
                </li>

                <li className="flex justify-between items-center p-3 hover:bg-[#eff4ff] transition-colors">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0E7490]" />
                    Lactate
                  </span>
                  <span className="font-bold text-[#0b1c30]">+1</span>
                </li>

                <li className="flex justify-between items-center p-3 bg-[#F8FAFC] text-[#475569]">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                    Ionized Calcium
                  </span>
                  <span className="italic">Pending (Max +8)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Dual-Threshold Meter: Adult GI Sepsis Risk */}
        <section className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#B45309] rounded-r" />
          <div className="pl-4">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-1">
                  Adult GI Sepsis Risk
                </h4>
                <span className="text-[10px] bg-[#d3e4fe] text-[#434655] px-1.5 py-0.5 rounded font-label-caps border border-[#c4c5d7]">
                  [Internal Guideline]
                </span>
              </div>
            </div>

            {/* Meter */}
            <div className="w-full h-10 bg-[#e5eeff] rounded overflow-hidden flex relative border border-[#E2E8F0] shadow-inner mt-4">
              {/* Fill Gradient */}
              <div className="h-full bg-gradient-to-r from-[#ECFDF5] via-[#FFF7ED] to-[#C2410C] opacity-80" style={{ width: '65%' }} />

              {/* Screening Threshold at 40% */}
              <div className="absolute top-0 bottom-0 left-[40%] flex flex-col items-center z-10">
                <div className="w-px h-full bg-[#B45309]" />
                <span className="absolute -top-4 text-[9px] font-label-caps text-[#B45309] bg-white px-1 border border-[#E2E8F0] rounded whitespace-nowrap z-20">
                  Screening
                </span>
              </div>

              {/* Confirmation Threshold at 80% */}
              <div className="absolute top-0 bottom-0 left-[80%] flex flex-col items-center z-10">
                <div className="w-px h-full bg-[#B91C1C]" />
                <span className="absolute -top-4 text-[9px] font-label-caps text-[#B91C1C] bg-white px-1 border border-[#E2E8F0] rounded whitespace-nowrap z-20">
                  Confirm
                </span>
              </div>

              {/* Current Value Marker (Diamond) */}
              <div className="absolute top-0 bottom-0 left-[65%] w-0.5 bg-[#0b1c30] z-20 flex items-center justify-center">
                <div className="absolute w-3 h-3 bg-[#0b1c30] rotate-45 shadow-sm" />
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
};
