import React, { useState } from 'react';
import type { Patient, ViewTab, FlowsheetColumn } from '../../types';
import { latestColumn } from '../../utils/callSurgeonTriggers';
import { columnToEntry, foalSurvivalPanel } from '../../utils/intelligence';
import { neonatalSepsisPanel } from '../../utils/neonatalSepsisScore';
import { newId } from '../../utils/treatments';
import { ScorePanelCard } from '../ui/ScorePanelCard';
import { OptionGrid } from '../ui/OptionGrid';
import { ABNORMAL_PERINATAL_HISTORY } from '../../data/clinicalAssessments';

interface NeonatalAssessmentViewProps {
  patient: Patient;
  clinician?: string;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigate: (tab: ViewTab) => void;
}

const toNumber = (s: string): number | undefined => {
  if (s.trim() === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/**
 * Gestational age and the two lab results the Foal Survival Score needs but
 * the quick round doesn't collect (glucose and IgG are typed here as a
 * send-out or point-of-care result, not toggled).
 *
 * The score itself is no longer computed here — cold extremities and
 * infectious sites moved to the round's Neonatal Exam section (Phase B), and
 * this view previously ran its own hand-rolled copy of the same arithmetic
 * `foalSurvivalPanel` already implements, reading glucose/IgG from local
 * state that was never persisted and vanished on navigate-away. Both are
 * fixed: this renders the same computed ScorePanel the Clinical Intelligence
 * screen shows, and glucose/IgG are saved onto the flowsheet like any other
 * lab result, so they survive and feed every other view too.
 */
export const NeonatalAssessmentView: React.FC<NeonatalAssessmentViewProps> = ({
  patient,
  clinician,
  onUpdatePatient,
  onNavigate,
}) => {
  const [gestationDays, setGestationDays] = useState<number>(
    patient.gestationalAgeDays ?? patient.fssPrematurityDays ?? 338,
  );
  const [glucose, setGlucose] = useState<string>('');
  const [igg, setIgg] = useState<string>('');

  const glucoseValue = toNumber(glucose);
  const iggValue = toNumber(igg);
  const glucosePending = glucoseValue === undefined;
  const iggPending = iggValue === undefined;

  const latest = latestColumn(patient.flowsheetHistory);
  const entry = columnToEntry(patient, latest);
  const survivalPanel = foalSurvivalPanel(patient, entry);
  const sepsisPanel = neonatalSepsisPanel(patient, entry);

  const saveGestation = (days: number) => {
    setGestationDays(days);
    onUpdatePatient({ ...patient, gestationalAgeDays: days });
  };

  const saveAbnormalHistory = (value: string | undefined) => {
    onUpdatePatient({
      ...patient,
      abnormalPerinatalHistory: value === undefined ? undefined : value === 'Abnormal',
    });
  };

  const saveLabs = () => {
    if (glucoseValue === undefined && iggValue === undefined) return;
    const now = new Date();
    const column: FlowsheetColumn = {
      id: newId('round'),
      time: `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
      recordedAt: now.toISOString(),
      recordedBy: clinician || 'Unattributed',
      vitals: {},
      gi: {},
      labs: { glucose: glucoseValue, igg: iggValue },
    };
    onUpdatePatient({
      ...patient,
      flowsheetHistory: [...patient.flowsheetHistory, column],
      lastObsTime: 'Just now',
    });
    setGlucose('');
    setIgg('');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#6D28D9] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            NEONATAL SUITE
          </span>
          <span className="text-xs font-derived-value text-[#434655]">Brewer &amp; Koterba</span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">Foal Survival Score</h1>
        <p className="font-body-md text-sm text-[#434655] mt-1">
          Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> (
          {patient.age || 'age not recorded'}) • Case {patient.caseNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: what this view still enters directly */}
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm space-y-6">
          <h2 className="font-headline text-lg text-[#0b1c30] border-b border-[#E2E8F0] pb-2">
            Admission &amp; labs
          </h2>

          {/* Gestation — an admission-time fact, not a per-round observation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-caps text-xs text-[#434655]">Gestation length (days)</label>
              <span className="font-clinical-value text-sm text-[#0037b0]">{gestationDays} days</span>
            </div>
            <input
              type="range"
              min="300"
              max="350"
              value={gestationDays}
              onChange={(e) => saveGestation(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-[#e5eeff] rounded-lg appearance-none cursor-pointer accent-[#0037b0]"
            />
            <div className="flex justify-between text-[10px] font-derived-value text-[#434655] mt-1">
              <span>Severe premature (&lt;320)</span>
              <span>Near term (330)</span>
              <span>Full term (340+)</span>
            </div>
          </div>

          <OptionGrid
            definition={ABNORMAL_PERINATAL_HISTORY}
            value={
              patient.abnormalPerinatalHistory === undefined
                ? undefined
                : patient.abnormalPerinatalHistory
                  ? 'Abnormal'
                  : 'Normal'
            }
            onChange={saveAbnormalHistory}
          />

          {/* Extremities and infectious sites moved to the round */}
          <div className="p-3 bg-[#f8f9ff] rounded border border-[#E2E8F0]">
            <p className="font-derived-value text-xs text-[#434655]">
              Extremity temperature and infectious sites are charted with the rest of the
              physical exam.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('assess')}
              className="mt-2 text-xs font-label-caps text-[#6D28D9] underline"
            >
              Go to Vitals &amp; Round
            </button>
          </div>

          {/* Laboratory results — entered, not toggled */}
          <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
            <span className="font-label-caps text-xs text-[#434655] block uppercase tracking-wider">
              Laboratory results
            </span>

            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-xs text-[#434655]">Blood glucose (mg/dL)</span>
                <span
                  className={`px-2 py-0.5 rounded font-label-caps text-[10px] ${
                    glucosePending
                      ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30'
                      : glucoseValue! > 40
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'bg-[#B91C1C] text-white'
                  }`}
                >
                  {glucosePending ? 'PENDING' : glucoseValue! > 40 ? '+1 POINT' : 'HYPOGLYCAEMIC'}
                </span>
              </div>
              <input
                type="number"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="e.g. 95"
                className="w-full font-clinical-value text-lg p-3 bg-white border-2 rounded focus:ring-2 focus:ring-[#6D28D9] focus:outline-none no-spinner"
                style={{ borderColor: glucosePending ? '#c4c5d7' : glucoseValue! > 40 ? '#047857' : '#B91C1C' }}
              />
              <span className="font-derived-value text-[11px] text-[#747686]">
                Scores 1 point above 40 mg/dL.
              </span>
            </label>

            <label className="block">
              <div className="flex justify-between items-center mb-1">
                <span className="font-label-caps text-xs text-[#434655]">IgG snapshot (mg/dL)</span>
                <span
                  className={`px-2 py-0.5 rounded font-label-caps text-[10px] ${
                    iggPending
                      ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30'
                      : iggValue! > 800
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : iggValue! < 400
                          ? 'bg-[#B91C1C] text-white'
                          : 'bg-[#FFF7ED] text-[#C2410C]'
                  }`}
                >
                  {iggPending
                    ? 'PENDING'
                    : iggValue! > 800
                      ? '+1 POINT'
                      : iggValue! < 400
                        ? 'COMPLETE FPT'
                        : 'PARTIAL FPT'}
                </span>
              </div>
              <input
                type="number"
                value={igg}
                onChange={(e) => setIgg(e.target.value)}
                placeholder="e.g. 850"
                className="w-full font-clinical-value text-lg p-3 bg-white border-2 rounded focus:ring-2 focus:ring-[#6D28D9] focus:outline-none no-spinner"
                style={{
                  borderColor: iggPending ? '#c4c5d7' : iggValue! > 800 ? '#047857' : iggValue! < 400 ? '#B91C1C' : '#C2410C',
                }}
              />
              <span className="font-derived-value text-[11px] text-[#747686]">
                Complete failure of passive transfer below 400 mg/dL; partial 400–800.
              </span>
            </label>

            <button
              type="button"
              onClick={saveLabs}
              disabled={glucoseValue === undefined && iggValue === undefined}
              className="w-full min-h-[44px] rounded bg-[#6D28D9] text-white font-label-caps text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save to flowsheet
            </button>
          </div>
        </div>

        {/* Right: the computed scores — the same engine Clinical Intelligence uses */}
        <div className="space-y-4">
          <ScorePanelCard
            panel={survivalPanel}
            onChart={() => onNavigate('assess')}
            onViewSource={() => onNavigate('sources')}
          />
          <ScorePanelCard
            panel={sepsisPanel}
            onChart={() => onNavigate('assess')}
            onViewSource={() => onNavigate('sources')}
          />
        </div>
      </div>
    </div>
  );
};
