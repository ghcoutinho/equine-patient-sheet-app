import React, { useState } from 'react';
import type { Patient, ViewTab } from '../../types';
import { latestColumn } from '../../utils/admission';
import { OptionGrid } from '../ui/OptionGrid';
import { ABNORMAL_PERINATAL_HISTORY } from '../../data/clinicalAssessments';

interface NeonatalAssessmentViewProps {
  patient: Patient;
  clinician?: string;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onNavigate: (tab: ViewTab) => void;
}

/**
 * Gestational age and perinatal history — the two Foal Survival Score inputs
 * that are admission-time facts, not a per-round observation, so they live
 * here rather than in the round.
 *
 * Everything else the score needs (glucose, IgG, extremity temperature,
 * infectious sites) is charted with the rest of the round in Vitals &
 * Round, and the computed scores themselves are read on Clinical
 * Intelligence — this view used to duplicate both (its own glucose/IgG
 * entry writing a second, narrower flowsheet column, and its own copy of
 * the same ScorePanelCards Clinical Intelligence already renders). One
 * form writes a round; one screen reads the computed score.
 */
export const NeonatalAssessmentView: React.FC<NeonatalAssessmentViewProps> = ({
  patient,
  onUpdatePatient,
  onNavigate,
}) => {
  const [gestationDays, setGestationDays] = useState<number>(
    patient.gestationalAgeDays ?? patient.fssPrematurityDays ?? 338,
  );

  const latest = latestColumn(patient);
  const latestGlucose = typeof latest?.labs?.glucose === 'number' ? latest.labs.glucose : undefined;
  const latestIgg = typeof latest?.labs?.igg === 'number' ? latest.labs.igg : undefined;

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

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#6D28D9] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            NEONATAL SUITE
          </span>
          <span className="text-xs font-derived-value text-[#434655]">Brewer &amp; Koterba</span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">Admission &amp; History</h1>
        <p className="font-body-md text-sm text-[#434655] mt-1">
          Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> (
          {patient.age || 'age not recorded'}) • Case {patient.caseNumber}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm space-y-6">
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
      </div>

      {/* Everything else is charted with the round */}
      <div className="p-4 bg-white rounded-lg border border-[#E2E8F0] shadow-sm space-y-3">
        <p className="font-derived-value text-xs text-[#434655]">
          Extremity temperature, infectious sites, blood glucose and IgG are charted with the
          rest of the physical exam and lab results, in Vitals &amp; Round.
        </p>
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Latest glucose</dt>
            <dd className="font-clinical-value text-sm text-[#0b1c30]">
              {latestGlucose !== undefined ? `${latestGlucose} mg/dL` : 'Not charted'}
            </dd>
          </div>
          <div>
            <dt className="font-label-caps text-[10px] text-[#747686] uppercase">Latest IgG</dt>
            <dd className="font-clinical-value text-sm text-[#0b1c30]">
              {latestIgg !== undefined ? `${latestIgg} mg/dL` : 'Not charted'}
            </dd>
          </div>
        </dl>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onNavigate('assess')}
            className="text-xs font-label-caps text-[#6D28D9] underline"
          >
            Go to Vitals &amp; Round
          </button>
          <button
            type="button"
            onClick={() => onNavigate('intelligence')}
            className="text-xs font-label-caps text-[#6D28D9] underline"
          >
            View computed Foal Survival &amp; sepsis scores
          </button>
        </div>
      </div>
    </div>
  );
};
