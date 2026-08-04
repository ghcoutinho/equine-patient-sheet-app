import React from 'react';
import type { AssessmentSeverity } from '../../types';
import { panelHasData, type ScorePanel } from '../../utils/intelligence';

/**
 * Renders a computed `ScorePanel` — SIRS, GI severity, CAS, foal survival,
 * whichever `buildPanels` returns. One rendering for every scored panel in
 * the app, so a change to how a score is shown (the ledger, the range bar,
 * the "not charted" state) never has to be made twice and drift.
 *
 * Extracted from LiveIntelligenceView, which was the only renderer until
 * NeonatalAssessmentView needed the same thing for the round-driven Foal
 * Survival Score.
 */

const SEVERITY_ACCENT: Record<AssessmentSeverity, string> = {
  normal: '#047857',
  watch: '#B45309',
  warning: '#C2410C',
  critical: '#B91C1C',
};

const SEVERITY_TINT: Record<AssessmentSeverity, string> = {
  normal: 'bg-[#ECFDF5] border-[#047857]/30',
  watch: 'bg-[#FFFBEB] border-[#B45309]/30',
  warning: 'bg-[#FFF7ED] border-[#C2410C]/30',
  critical: 'bg-[#FEF2F2] border-[#B91C1C]/40',
};

export const ScorePanelCard: React.FC<{ panel: ScorePanel; onChart: () => void }> = ({
  panel,
  onChart,
}) => {
  const accent = SEVERITY_ACCENT[panel.severity];
  const hasData = panelHasData(panel);
  const maxTotal = panel.criteria.reduce((s, c) => s + c.maxPoints, 0);
  const pct = (n: number) => (maxTotal > 0 ? Math.min(100, (n / maxTotal) * 100) : 0);

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 p-4 pb-3">
        <span className="w-1 self-stretch rounded" style={{ backgroundColor: accent }} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-headline text-base font-bold text-[#0b1c30]">{panel.title}</h2>
            <span className="font-label-caps text-[10px] bg-[#d3e4fe] text-[#434655] border border-[#c4c5d7] px-1.5 py-0.5 rounded">
              {panel.source}
            </span>
          </div>

          {hasData ? (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl text-[#0b1c30]">
                {panel.score.isExact ? panel.score.min : `${panel.score.min}–${panel.score.max}`}
              </span>
              <span className="font-derived-value text-xs text-[#747686]">of {maxTotal}</span>
            </div>
          ) : (
            <p className="font-derived-value text-xs text-[#434655] mt-1">
              No input for this panel has been charted.{' '}
              <button onClick={onChart} className="text-[#0037b0] underline">
                Record a round
              </button>
              .
            </p>
          )}
        </div>
      </div>

      {hasData && (
        <>
          {/*
            The charted numbers themselves, not just the points they earned.
            A score of 3 means nothing without knowing it came from a heart
            rate of 110 — the value is what the clinician acts on.
          */}
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {panel.criteria.map((c) => {
              const charted = c.points !== undefined && c.evidence;
              return (
                <span
                  key={c.id}
                  title={`${c.label} · rule: ${c.rule}`}
                  className={`inline-flex items-baseline gap-1.5 rounded px-2 py-1 border ${
                    !charted
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#747686]'
                      : (c.points as number) > 0
                        ? 'bg-[#FEF2F2] border-[#B91C1C]/40'
                        : 'bg-[#ECFDF5] border-[#047857]/30'
                  }`}
                >
                  <span className="font-label-caps text-[10px] uppercase tracking-wide text-[#434655]">
                    {c.label}
                  </span>
                  {charted ? (
                    <span
                      className={`font-clinical-value text-sm font-bold ${
                        (c.points as number) > 0 ? 'text-[#B91C1C]' : 'text-[#047857]'
                      }`}
                    >
                      {c.evidence}
                    </span>
                  ) : (
                    <span className="font-derived-value text-[11px] italic">not charted</span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Confirmed points solid, the uncharted band hatched */}
          <div className="px-4">
            <div
              className="w-full h-6 rounded-full overflow-hidden flex border border-[#E2E8F0] bg-[#eff4ff]"
              role="img"
              aria-label={`${panel.score.min} confirmed of a possible ${panel.score.max}, out of ${maxTotal}`}
            >
              <div
                className="h-full transition-all"
                style={{ width: `${pct(panel.score.min)}%`, backgroundColor: accent }}
              />
              {!panel.score.isExact && (
                <div
                  className="h-full rail-track border-r border-dashed"
                  style={{
                    width: `${pct(panel.score.max) - pct(panel.score.min)}%`,
                    backgroundColor: `${accent}33`,
                    borderColor: accent,
                  }}
                  title="Range still possible from parameters that have not been charted"
                />
              )}
            </div>
            <div className="flex justify-between font-label-caps text-[10px] text-[#747686] mt-1">
              <span>0</span>
              <span>{maxTotal}</span>
            </div>
          </div>

          {panel.interpretation && (
            <p
              className={`mx-4 mt-3 font-derived-value text-xs text-[#0b1c30] rounded border p-2.5 ${SEVERITY_TINT[panel.severity]}`}
            >
              {panel.interpretation}
            </p>
          )}

          {/* The ledger: every criterion, its rule, and what it contributed */}
          <details className="mt-3 group">
            <summary className="cursor-pointer list-none px-4 py-2 border-t border-[#E2E8F0] font-label-caps text-[10px] tracking-widest text-[#434655] uppercase flex items-center gap-1.5 hover:bg-[#f8f9ff]">
              <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
                expand_more
              </span>
              Contribution ledger
            </summary>
            <ul className="divide-y divide-[#E2E8F0] font-derived-value text-xs">
              {panel.criteria.map((c) => (
                <li
                  key={c.id}
                  className={`flex justify-between items-center gap-3 px-4 py-2 ${
                    c.points === undefined ? 'bg-[#F8FAFC] text-[#747686]' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className="text-[#0b1c30] font-semibold">{c.label}</span>
                    <span className="block text-[11px] text-[#747686]">
                      {c.rule}
                      {c.evidence ? ` · charted ${c.evidence}` : ''}
                    </span>
                  </span>
                  <span className="whitespace-nowrap">
                    {c.points === undefined ? (
                      <span className="italic">not charted (0–{c.maxPoints})</span>
                    ) : (
                      <span
                        className={`font-bold ${c.points > 0 ? 'text-[#B91C1C]' : 'text-[#047857]'}`}
                      >
                        {c.points > 0 ? `+${c.points}` : '0'}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}

      {panel.note && (
        <p className="px-4 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC] font-derived-value text-[11px] text-[#747686]">
          {panel.note}
        </p>
      )}
    </section>
  );
};
