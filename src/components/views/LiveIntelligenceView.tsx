import React, { useMemo } from 'react';
import type { Patient, ViewTab } from '../../types';
import { evaluateCallSurgeonTriggers } from '../../utils/callSurgeonTriggers';
import { latestColumn } from '../../utils/admission';
import { columnToEntry, buildPanels } from '../../utils/intelligence';
import { getPrognosticFlags } from '../../utils/prognosis';
import { evaluateBiomarkers } from '../../utils/biomarkerEvaluator';
import {
  orderedTreatments,
  clockTime,
  TREATMENT_STATE_STYLE,
} from '../../utils/treatments';
import { computeDue, DUE_STYLES } from '../../utils/schedule';
import { ColicReadouts } from './ColicReadouts';
import { ScorePanelCard } from '../ui/ScorePanelCard';

interface LiveIntelligenceViewProps {
  patient: Patient;
  onNavigate: (tab: ViewTab) => void;
  onOpenNewAssessment: () => void;
}

/**
 * Clinical intelligence for the active patient.
 *
 * Everything on this screen is computed from the most recent charted round.
 * The previous version showed a hardcoded "+2 Heart Rate / +1 Lactate" ledger,
 * a score track drawn at fixed percentages and a sepsis meter pinned at 65% —
 * none of which were derived from the patient. Where an input has not been
 * charted, the panel says so and widens its range instead of scoring it.
 */
export const LiveIntelligenceView: React.FC<LiveIntelligenceViewProps> = ({
  patient,
  onNavigate,
  onOpenNewAssessment,
}) => {
  const now = useMemo(() => new Date(), []);
  const latest = latestColumn(patient);
  // The round before the latest, for every reading that needs a direction
  // rather than a value — heart rate trajectory, PCV/TP splitting.
  const previous =
    patient.flowsheetHistory.length > 1
      ? patient.flowsheetHistory[patient.flowsheetHistory.length - 2]
      : undefined;
  const triggers = evaluateCallSurgeonTriggers(latest, undefined, previous);
  const entry = useMemo(() => columnToEntry(patient, latest), [patient, latest]);
  const panels = useMemo(() => buildPanels(patient, entry), [patient, entry]);
  const flags = useMemo(() => getPrognosticFlags(entry), [entry]);
  const biomarkers = useMemo(() => evaluateBiomarkers(entry), [entry]);
  // Everything still open, urgent first. Filtering to only overdue orders hid
  // running lines entirely, which read as "nothing is on this patient".
  const openTreatments = orderedTreatments(patient.treatments, now).filter(
    (t) => t.state !== 'STOPPED',
  );
  const dueTasks = computeDue(patient.schedule, now).filter(
    (d) => d.state === 'OVERDUE' || d.state === 'DUE_NOW',
  );

  const biomarkerRows = [
    biomarkers.saa && { label: 'Serum amyloid A', ...biomarkers.saa, unit: 'mg/L' },
    biomarkers.ngal && { label: 'NGAL', ...biomarkers.ngal, unit: 'ng/mL' },
    biomarkers.rpr && { label: 'RDW : platelet ratio', ...biomarkers.rpr, unit: '' },
  ].filter(Boolean) as {
    label: string;
    value: number;
    interpretation: string;
    unit: string;
    source: string;
  }[];

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto bg-[#F8FAFC]">
      {/* Left: the computed picture */}
      <main className="flex-1 p-4 lg:p-6 border-r border-[#E2E8F0] min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-[#0b1c30]">
              Clinical Intelligence
            </h1>
            <p className="font-body-md text-sm text-[#434655] mt-0.5">
              {patient.name}
              {patient.diagnosis ? ` · ${patient.diagnosis}` : ''} ·{' '}
              {latest ? (
                <>
                  computed from the round at{' '}
                  <span className="font-bold text-[#0b1c30]">{latest.time}</span>
                  {latest.recordedBy ? ` by ${latest.recordedBy}` : ''}
                </>
              ) : (
                'no round charted yet'
              )}
            </p>
          </div>
          <button
            onClick={onOpenNewAssessment}
            className="px-3 py-1.5 bg-[#0037b0] text-white rounded text-xs font-label-caps hover:bg-[#1d4ed8] shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New round
          </button>
        </div>

        {!latest ? (
          <div className="bg-white border border-dashed border-[#c4c5d7] rounded-lg p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c5d7]">
              monitoring
            </span>
            <p className="font-body-md text-sm text-[#434655] mt-2 max-w-sm mx-auto">
              Nothing has been charted for {patient.name}, so there is nothing to compute.
              Record a round and every panel here fills in.
            </p>
            <button
              onClick={() => onNavigate('assess')}
              className="mt-3 px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8]"
            >
              Go to Vitals &amp; Round
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ColicReadouts patient={patient} latest={latest} previous={previous} />

            {panels.map((p) => (
              <ScorePanelCard
                key={p.id}
                panel={p}
                onChart={() => onNavigate('assess')}
                onViewSource={() => onNavigate('sources')}
              />
            ))}

            {/*
              Adult colic admission cut-offs. Deliberately hidden for foals: a
              heart rate of 100 crosses the adult > 75 bpm threshold but is
              unremarkable in a six-day-old, so showing this panel on a neonate
              would flag normal physiology as high risk.
            */}
            {!patient.isFoal && (
            <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
              <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-1">
                Admission risk cut-offs
              </h2>
              <p className="font-derived-value text-xs text-[#747686] mb-3">
                Individual published thresholds for the adult colic patient (Bottegaro 2024,
                McGovern 2025), each evaluated on its own — not summed into a score.
              </p>
              {flags.length === 0 ? (
                <p className="font-derived-value text-xs text-[#434655] bg-[#ECFDF5] border border-[#047857]/30 rounded p-2.5">
                  None of the charted parameters cross a published high-risk cut-off.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {flags.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 font-derived-value text-xs text-[#0b1c30] bg-[#FFF7ED] border border-[#C2410C]/30 rounded p-2.5"
                    >
                      <span className="material-symbols-outlined text-sm text-[#C2410C]">
                        priority_high
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            )}

            {/* Biomarkers only appear once one has been entered */}
            {biomarkerRows.length > 0 && (
              <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
                <h2 className="font-headline text-base font-bold text-[#0b1c30]">
                  Inflammatory biomarkers
                </h2>
                <p className="font-derived-value text-xs text-[#747686] mb-3">
                  Neonatal foal sepsis markers — hover a value for the study and cut-off it applies.
                </p>
                <ul className="divide-y divide-[#E2E8F0]">
                  {biomarkerRows.map((b) => (
                    <li key={b.label} className="flex justify-between items-center py-2">
                      <span className="font-body-md text-sm text-[#0b1c30]">{b.label}</span>
                      <span className="flex items-center gap-2">
                        <span
                          className="font-derived-value text-sm font-bold text-[#0b1c30]"
                          title={b.source}
                        >
                          {b.value} {b.unit}
                        </span>
                        <span
                          className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded border ${
                            b.interpretation === 'NORMAL'
                              ? 'bg-[#ECFDF5] text-[#047857] border-[#047857]/30'
                              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#B91C1C]/30'
                          }`}
                        >
                          {b.interpretation.replace(/_/g, ' ')}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Right: what needs doing now */}
      <aside className="w-full xl:w-[400px] bg-white border-l border-[#E2E8F0] flex flex-col p-4 lg:p-5 space-y-5 flex-shrink-0">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
          <h2 className="font-headline text-lg font-bold text-[#0b1c30]">Right now</h2>
          <span className="font-derived-value text-xs text-[#747686]">{clockTime(now)}</span>
        </div>

        {/* Call-surgeon triggers */}
        <section>
          <h3 className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-2">
            Call-surgeon triggers
          </h3>
          {triggers.length === 0 ? (
            <p className="bg-[#eff4ff] border border-[#E2E8F0] rounded p-2.5 text-xs text-[#434655] font-derived-value">
              None on the latest round
              {latest ? ` (${latest.time})` : ' — nothing charted yet'}.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {triggers.map((t) => (
                <li
                  key={t.id}
                  className={`rounded p-2.5 border ${
                    t.severity === 'critical'
                      ? 'bg-[#FEF2F2] border-[#B91C1C]/40'
                      : 'bg-[#FFF7ED] border-[#C2410C]/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`material-symbols-outlined text-base ${
                        t.severity === 'critical' ? 'text-[#B91C1C]' : 'text-[#C2410C]'
                      }`}
                    >
                      {t.severity === 'critical' ? 'warning' : 'info'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-body-md text-sm text-[#0b1c30] font-semibold leading-tight">
                        {t.label}
                      </div>
                      <div className="font-derived-value text-xs text-[#434655] mt-0.5">
                        {t.evidence} · rule: {t.rule}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Overdue monitoring */}
        <section>
          <h3 className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-2">
            Monitoring due
          </h3>
          {dueTasks.length === 0 ? (
            <p className="bg-[#eff4ff] border border-[#E2E8F0] rounded p-2.5 text-xs text-[#434655] font-derived-value">
              Nothing on the monitoring schedule is due.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {dueTasks.map((d) => (
                <li key={d.task.id}>
                  <button
                    onClick={() => onNavigate('assess')}
                    className={`w-full text-left rounded px-2.5 py-1.5 font-label-caps text-xs flex justify-between items-center ${DUE_STYLES[d.state].chip}`}
                  >
                    <span>{d.task.label}</span>
                    <span>{d.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Treatments */}
        <section>
          <h3 className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase mb-2">
            Treatments
          </h3>
          {openTreatments.length === 0 ? (
            <p className="bg-[#eff4ff] border border-[#E2E8F0] rounded p-2.5 text-xs text-[#434655] font-derived-value">
              Nothing on the treatment sheet.{' '}
              <button
                onClick={() => onNavigate('meds')}
                className="text-[#0037b0] underline"
              >
                Open it
              </button>
              .
            </p>
          ) : (
            <ul className="space-y-1.5">
              {openTreatments.map((t) => (
                <li key={t.treatment.id}>
                  <button
                    onClick={() => onNavigate('meds')}
                    className={`w-full text-left rounded px-2.5 py-1.5 flex justify-between items-center gap-2 ${TREATMENT_STATE_STYLE[t.state].chip}`}
                  >
                    <span className="font-body-md text-xs font-semibold truncate">
                      {t.treatment.drug}
                    </span>
                    <span className="font-label-caps text-[10px] whitespace-nowrap">
                      {t.treatment.rateText && !t.treatment.intervalHours
                        ? t.treatment.rateText
                        : t.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="font-derived-value text-[11px] text-[#747686] border-t border-[#E2E8F0] pt-3 leading-snug">
          Every figure on this screen is derived from charted values. Panels with
          uncharted inputs show a range, not a point estimate — a blank parameter is not
          the same as a normal one.
        </p>
      </aside>
    </div>
  );
};
