import React from 'react';
import type { Patient, FlowsheetColumn, AssessmentSeverity } from '../../types';
import {
  plasmaLactateBand,
  LACTATE_BAND_TEXT,
  PLASMA_LACTATE_BANDS,
  comparePeritonealLactate,
  PERITONEAL_LACTATE,
  readPeritonealCytology,
  PERITONEAL_CYTOLOGY,
  readPcvTp,
  PCV_TP,
  readReflux,
  REFLUX,
  readHeartRate,
  HEART_RATE,
  ENDOTOXEMIA,
  TOXIC_MEMBRANE_VALUES,
  BLAND_TAP_CAVEAT,
  EAAPS_CUTOFFS,
} from '../../data/colicThresholds';
import { EAAPS_SCORE } from '../../data/clinicalAssessments';

/**
 * Colic readouts: the published thresholds applied to the charted round.
 *
 * These are deliberately separate from the scoring panels. A score aggregates;
 * these do not — each is a single reported finding stated with its threshold
 * and its source, because that is how the underlying references present them.
 * Nothing here fires from absent data.
 */

const TINT: Record<AssessmentSeverity, string> = {
  normal: 'bg-[#ECFDF5] border-[#047857]/30',
  watch: 'bg-[#FFFBEB] border-[#B45309]/30',
  warning: 'bg-[#FFF7ED] border-[#C2410C]/40',
  critical: 'bg-[#FEF2F2] border-[#B91C1C]/40',
};

const ACCENT: Record<AssessmentSeverity, string> = {
  normal: '#047857',
  watch: '#B45309',
  warning: '#C2410C',
  critical: '#B91C1C',
};

const Readout: React.FC<{
  title: string;
  value?: string;
  severity: AssessmentSeverity;
  source: string;
  children: React.ReactNode;
}> = ({ title, value, severity, source, children }) => (
  <div className={`rounded border p-3 ${TINT[severity]}`}>
    <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
      <span className="font-headline text-sm font-bold text-[#0b1c30]">{title}</span>
      {value && (
        <span
          className="font-clinical-value text-lg font-bold"
          style={{ color: ACCENT[severity] }}
        >
          {value}
        </span>
      )}
    </div>
    <p className="font-derived-value text-xs text-[#0b1c30] leading-snug">{children}</p>
    <p className="font-derived-value text-[10px] text-[#747686] mt-1.5">{source}</p>
  </div>
);

interface ColicReadoutsProps {
  patient: Patient;
  latest: FlowsheetColumn | undefined;
  previous: FlowsheetColumn | undefined;
}

const num = (v: number | 'Pending' | undefined): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

export const ColicReadouts: React.FC<ColicReadoutsProps> = ({
  patient,
  latest,
  previous,
}) => {
  if (!latest) return null;

  const plasma = num(latest.labs?.lactate);
  const peritoneal = num(latest.labs?.peritonealLactate);
  const pcv = num(latest.labs?.pcv);
  const tp = num(latest.labs?.tp);
  const wbc = num(latest.labs?.wbc);
  const hr = latest.vitals?.heartRate;
  const reflux = latest.gi?.refluxVolumeL;
  const eaapsValue = latest.pain?.eaapsBehaviour;
  const eaapsScore = eaapsValue ? EAAPS_SCORE[eaapsValue] : undefined;

  const band = plasmaLactateBand(plasma);
  const peritonealCmp = comparePeritonealLactate(peritoneal, plasma);
  const peritonealCytology = readPeritonealCytology(
    num(latest.labs?.peritonealProtein),
    num(latest.labs?.peritonealTcc),
    num(latest.labs?.peritonealDegenerateNeutrophilsPct),
  );
  const pcvTp = readPcvTp(pcv, tp, num(previous?.labs?.pcv), num(previous?.labs?.tp));
  const refluxReading = readReflux(reflux);
  const hrReading = readHeartRate(hr, previous?.vitals?.heartRate);

  // Endotoxaemia is a clinical read, so it is assembled from the cage-side
  // signs the round already carries rather than from a laboratory assay.
  const mm = latest.vitals?.mucousMembranes;
  const crt = latest.vitals?.crtSeconds;
  const endotoxSigns = [
    hr !== undefined && { label: 'Tachycardia', hit: hr > 60, evidence: `HR ${hr} bpm` },
    mm && {
      label: 'Toxic mucous membranes',
      hit: TOXIC_MEMBRANE_VALUES.includes(mm),
      evidence: mm,
    },
    crt !== undefined && {
      label: 'Prolonged CRT',
      hit: crt > ENDOTOXEMIA.crtProlongedAbove,
      evidence: `${crt} s`,
    },
    wbc !== undefined && {
      label: 'Leukopenia',
      hit: wbc < ENDOTOXEMIA.leukopeniaBelow,
      evidence: `WBC ${wbc} K/µL`,
    },
  ].filter(Boolean) as { label: string; hit: boolean; evidence: string }[];
  const endotoxHits = endotoxSigns.filter((s) => s.hit);

  const nothingCharted =
    !band &&
    !peritonealCmp &&
    !peritonealCytology &&
    !pcvTp &&
    !refluxReading &&
    !hrReading &&
    eaapsScore === undefined &&
    endotoxSigns.length === 0;

  if (nothingCharted) return null;

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4">
      <h2 className="font-headline text-base font-bold text-[#0b1c30] mb-1">
        Colic readouts
      </h2>
      <p className="font-derived-value text-xs text-[#747686] mb-3">
        Published thresholds applied individually to the round at {latest.time}. Each is a
        single reported finding, not part of a score.
      </p>

      <div className="grid lg:grid-cols-2 gap-2.5">
        {/* Heart rate, read on the derivative */}
        {hrReading && (
          <Readout
            title="Heart rate trajectory"
            value={
              hrReading.trajectory
                ? `${hrReading.previous} → ${hrReading.current} bpm`
                : `${hrReading.current} bpm`
            }
            severity={hrReading.severity}
            source={HEART_RATE.source}
          >
            {hrReading.reading}
          </Readout>
        )}

        {/* EAAPS — three published cut-offs, each its own construct */}
        {eaapsScore !== undefined && (
          <Readout
            title="EAAPS"
            value={`${eaapsScore}/5`}
            severity={
              eaapsScore > EAAPS_CUTOFFS.mortalityAbove
                ? 'critical'
                : eaapsScore > EAAPS_CUTOFFS.surgicalTreatmentAbove
                  ? 'warning'
                  : eaapsScore > EAAPS_CUTOFFS.severePainAbove
                    ? 'watch'
                    : 'normal'
            }
            source={EAAPS_CUTOFFS.source}
          >
            {eaapsValue}.{' '}
            {eaapsScore > EAAPS_CUTOFFS.mortalityAbove
              ? `Above ${EAAPS_CUTOFFS.mortalityAbove}, the cut-off associated with mortality (likelihood ratio 5.5) — though the VAS was reported as the stronger predictor for this specific outcome.`
              : eaapsScore > EAAPS_CUTOFFS.surgicalTreatmentAbove
                ? `Above ${EAAPS_CUTOFFS.surgicalTreatmentAbove}, the cut-off associated with surgical treatment (likelihood ratio 3.3).`
                : eaapsScore > EAAPS_CUTOFFS.severePainAbove
                  ? `Above ${EAAPS_CUTOFFS.severePainAbove}, the cut-off discriminating severe from mild pain (likelihood ratio 6.4).`
                  : `At or below ${EAAPS_CUTOFFS.severePainAbove} — does not cross any of the three published cut-offs.`}
          </Readout>
        )}

        {/* Plasma lactate as a band */}
        {band && (
          <Readout
            title={`Plasma lactate — ${LACTATE_BAND_TEXT[band].label.toLowerCase()}`}
            value={`${plasma} mmol/L`}
            severity={LACTATE_BAND_TEXT[band].severity}
            source={PLASMA_LACTATE_BANDS.source}
          >
            {LACTATE_BAND_TEXT[band].reading}
          </Readout>
        )}

        {/* Peritoneal vs plasma */}
        {peritonealCmp ? (
          <Readout
            title="Peritoneal : plasma lactate"
            value={`${peritonealCmp.peritoneal} vs ${peritonealCmp.plasma} mmol/L`}
            severity={peritonealCmp.severity}
            source={PERITONEAL_LACTATE.source}
          >
            {peritonealCmp.reading}
          </Readout>
        ) : peritoneal !== undefined ? (
          <Readout
            title="Peritoneal lactate"
            value={`${peritoneal} mmol/L`}
            severity={peritoneal > PERITONEAL_LACTATE.noSurvivorAbove ? 'critical' : 'watch'}
            source={PERITONEAL_LACTATE.source}
          >
            {peritoneal > PERITONEAL_LACTATE.noSurvivorAbove
              ? `Above ${PERITONEAL_LACTATE.noSurvivorAbove} mmol/L, the value above which no survivor was reported.`
              : 'Chart plasma lactate from the same time point — the peritoneal-over-plasma comparison is more specific for strangulated small intestine than either value alone.'}
          </Readout>
        ) : null}

        {/* Peritoneal fluid cytology */}
        {peritonealCytology && (
          <Readout
            title="Peritoneal fluid cytology"
            severity={peritonealCytology.severity}
            source={PERITONEAL_CYTOLOGY.source}
          >
            {peritonealCytology.reading}
          </Readout>
        )}

        {/* PCV / TP splitting */}
        {pcvTp && (
          <Readout
            title={pcvTp.splitting ? 'PCV / TP splitting' : 'PCV and total protein'}
            value={`${pcvTp.pcv}% · ${pcvTp.tp} g/dL`}
            severity={pcvTp.severity}
            source={PCV_TP.source}
          >
            {pcvTp.reading}
            {pcvTp.tp < PCV_TP.colloidBelowTp &&
              ` Total protein below ${PCV_TP.colloidBelowTp} g/dL is the point at which colloid support is discussed.`}
          </Readout>
        )}

        {/* Reflux — volume changes the interpretation */}
        {refluxReading && (
          <Readout
            title={
              refluxReading.suggestsDpj
                ? 'Reflux volume — enteritis band'
                : 'Net gastric reflux'
            }
            value={`${refluxReading.litres} L`}
            severity={refluxReading.severity}
            source={REFLUX.source}
          >
            {refluxReading.reading}
          </Readout>
        )}

        {/* Endotoxaemia, read at the cage side */}
        {endotoxSigns.length > 0 && (
          <Readout
            title="Endotoxaemia signs"
            value={`${endotoxHits.length} of ${endotoxSigns.length}`}
            severity={
              endotoxHits.length >= 3 ? 'critical' : endotoxHits.length >= 1 ? 'warning' : 'normal'
            }
            source={ENDOTOXEMIA.source}
          >
            <span className="flex flex-wrap gap-1 mb-1.5">
              {endotoxSigns.map((s) => (
                <span
                  key={s.label}
                  className={`inline-block px-1.5 py-0.5 rounded text-[11px] border ${
                    s.hit
                      ? 'bg-white border-[#B91C1C]/40 text-[#B91C1C] font-bold'
                      : 'bg-white/60 border-[#E2E8F0] text-[#747686]'
                  }`}
                >
                  {s.label}: {s.evidence}
                </span>
              ))}
            </span>
            Endotoxaemia is a clinical diagnosis — the laboratory assay is unreliable.
            {wbc !== undefined && wbc < ENDOTOXEMIA.leukopeniaBelow
              ? ' A falling white cell count here is neutrophil extravasation, an adverse sign rather than the patient improving.'
              : ''}
          </Readout>
        )}
      </div>

      {/* The caveat that has to sit next to a normal tap */}
      {(peritoneal !== undefined || latest.gi?.peritonealFluid || peritonealCytology) && (
        <p className="font-derived-value text-[11px] text-[#434655] bg-[#eff4ff] border border-[#E2E8F0] rounded p-2.5 mt-2.5 leading-snug">
          {BLAND_TAP_CAVEAT}
        </p>
      )}

      {patient.isFoal && (
        <p className="font-derived-value text-[11px] text-[#B45309] bg-[#FFFBEB] border border-[#B45309]/30 rounded p-2.5 mt-2 leading-snug">
          These thresholds are drawn from adult colic series. Applied to a foal they are
          indicative at best — read them against the foal reference intervals, not the
          adult cut-offs.
        </p>
      )}
    </section>
  );
};
