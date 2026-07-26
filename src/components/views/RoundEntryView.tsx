import React, { useState } from 'react';
import {
  Patient,
  FlowsheetColumn,
  GutSoundsQuadrants,
  ManureRecord,
  PainData,
  LaminitisData,
  SupportData,
  GIData,
} from '../../types';
import { GutSoundsQuadrant } from '../ui/GutSoundsQuadrant';
import { OptionGrid } from '../ui/OptionGrid';
import { ManureRecorder } from '../ui/ManureRecorder';
import { DEFAULT_GUT_SOUNDS, summariseGutSounds } from '../../utils/gutSounds';
import {
  evaluateCallSurgeonTriggers,
  latestColumn,
} from '../../utils/callSurgeonTriggers';
import {
  ANALGESIA,
  CRYOTHERAPY,
  DIGITAL_PULSE,
  FLASH_ULTRASOUND,
  INCISION_STATUS,
  IV_CATHETER_SITE,
  MENTATION,
  MUCOUS_MEMBRANES,
  NASOGASTRIC_TUBE,
  PAIN_BEHAVIOUR,
  PERITONEAL_FLUID,
  RECTAL_EXAM,
  REFLUX_APPEARANCE,
  RESPONSE_TO_THERAPY,
} from '../../data/clinicalAssessments';

interface RoundEntryViewProps {
  patient: Patient;
  onUpdatePatient: (patient: Patient) => void;
  onDone: () => void;
}

type SectionId = 'vitals' | 'pain' | 'gi' | 'labs' | 'laminitis' | 'support';

const SECTIONS: { id: SectionId; label: string; accent: string }[] = [
  { id: 'vitals', label: 'Vitals Assessment', accent: '#1D4ED8' },
  { id: 'pain', label: 'Pain & Mentation', accent: '#6D28D9' },
  { id: 'gi', label: 'GI / Colic Round', accent: '#B45309' },
  { id: 'labs', label: 'Lab Tests', accent: '#0E7490' },
  { id: 'laminitis', label: 'Laminitis Watch', accent: '#A21CAF' },
  { id: 'support', label: 'Catheter & Incision', accent: '#0E7490' },
];

/** Parse a text input into a number, preserving a charted 0. */
const toNumber = (s: string): number | undefined => {
  if (s.trim() === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};

/** Render a stored number back into an input, preserving a charted 0. */
const toInput = (n: number | undefined): string => (n === undefined ? '' : String(n));

export const RoundEntryView: React.FC<RoundEntryViewProps> = ({
  patient,
  onUpdatePatient,
  onDone,
}) => {
  const latest = latestColumn(patient.flowsheetHistory);

  // Vitals
  const [hr, setHr] = useState<string>(toInput(latest?.vitals?.heartRate));
  const [temp, setTemp] = useState<string>(
    toInput(patient.isFoal ? latest?.vitals?.temperatureF : latest?.vitals?.temperatureC),
  );
  const [rr, setRr] = useState<string>(toInput(latest?.vitals?.respiratoryRate));
  const [crt, setCrt] = useState<string>(toInput(latest?.vitals?.crtSeconds));
  const [mucousMembranes, setMucousMembranes] = useState<string | undefined>();
  const [mentation, setMentation] = useState<string | undefined>();

  // Pain
  const [painScore, setPainScore] = useState<string>('');
  const [painBehaviour, setPainBehaviour] = useState<string | undefined>();
  const [analgesia, setAnalgesia] = useState<string | undefined>();

  // GI
  const [reflux, setReflux] = useState<string>('');
  const [gutSounds, setGutSounds] = useState<GutSoundsQuadrants>(
    latest?.gi?.gutSounds ?? DEFAULT_GUT_SOUNDS,
  );
  const [refluxAppearance, setRefluxAppearance] = useState<string | undefined>();
  const [nasogastricTube, setNasogastricTube] = useState<string | undefined>();
  const [manure, setManure] = useState<ManureRecord | undefined>();
  const [rectalExam, setRectalExam] = useState<string | undefined>();
  const [flashUltrasound, setFlashUltrasound] = useState<string | undefined>();
  const [peritonealFluid, setPeritonealFluid] = useState<string | undefined>();
  const [responseToTherapy, setResponseToTherapy] = useState<string | undefined>();

  // Labs
  const [lactate, setLactate] = useState<string>('');
  const [pcv, setPcv] = useState<string>('');

  // Laminitis
  const [digitalPulse, setDigitalPulse] = useState<string | undefined>();
  const [obelGrade, setObelGrade] = useState<string>('');
  const [cryotherapy, setCryotherapy] = useState<string | undefined>();

  // Support
  const [ivCatheterSite, setIvCatheterSite] = useState<string | undefined>();
  const [incisionStatus, setIncisionStatus] = useState<string | undefined>();

  const [open, setOpen] = useState<Set<SectionId>>(new Set<SectionId>(['vitals']));
  const toggle = (id: SectionId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const gutSummary = summariseGutSounds(gutSounds);

  const buildColumn = (): FlowsheetColumn => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const numTemp = toNumber(temp);

    const gi: GIData = {
      refluxVolumeL: toNumber(reflux),
      gutSounds,
      motility: gutSummary.motility,
      refluxAppearance,
      nasogastricTube,
      manure,
      rectalExam,
      flashUltrasound,
      peritonealFluid,
      responseToTherapy,
    };

    const pain: PainData = {
      score: toNumber(painScore),
      behaviour: painBehaviour,
      analgesia,
    };

    const laminitis: LaminitisData = {
      digitalPulse,
      obelGrade: toNumber(obelGrade),
      cryotherapy,
    };

    const support: SupportData = { ivCatheterSite, incisionStatus };

    const hasAny = (o: object) => Object.values(o).some((v) => v !== undefined);

    return {
      time: timeStr,
      vitals: {
        heartRate: toNumber(hr),
        temperatureC: !patient.isFoal ? numTemp : undefined,
        temperatureF: patient.isFoal ? numTemp : undefined,
        respiratoryRate: toNumber(rr),
        crtSeconds: toNumber(crt),
        mucousMembranes,
        mentation,
      },
      gi,
      labs: { lactate: toNumber(lactate), pcv: toNumber(pcv) },
      pain: hasAny(pain) ? pain : undefined,
      laminitis: hasAny(laminitis) ? laminitis : undefined,
      support: hasAny(support) ? support : undefined,
    };
  };

  const draft = buildColumn();
  const liveTriggers = evaluateCallSurgeonTriggers(draft);

  const handleSaveRound = () => {
    const newColumn = buildColumn();

    // SIRS flag from what was actually charted this round.
    const t = newColumn.vitals.temperatureC;
    const h = newColumn.vitals.heartRate;
    const r = newColumn.vitals.respiratoryRate;
    const sirsHits = [
      Number.isFinite(t) && (t! < 37 || t! > 38.5),
      Number.isFinite(h) && h! > 52,
      Number.isFinite(r) && r! > 20,
    ].filter(Boolean).length;

    const updatedPatient: Patient = {
      ...patient,
      sirsCriteriaMet: sirsHits >= 2,
      sirsDescription:
        sirsHits >= 2 ? `${sirsHits} of 4 SIRS criteria met this round` : undefined,
      lastObsTime: 'Just now',
      flowsheetHistory: [...patient.flowsheetHistory, newColumn],
    };

    onUpdatePatient(updatedPatient);
    onDone();
  };

  const numberField = (
    label: string,
    value: string,
    setValue: (s: string) => void,
    opts: { placeholder?: string; step?: string; prev?: number; unit?: string; accent?: string },
  ) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="font-label-caps text-xs text-[#434655]" htmlFor={`f-${label}`}>
          {label}
        </label>
        {opts.prev !== undefined && (
          <span className="font-derived-value text-xs bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0]">
            Prev: {opts.prev}
            {opts.unit ? ` ${opts.unit}` : ''}
          </span>
        )}
      </div>
      <input
        id={`f-${label}`}
        type="number"
        step={opts.step}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={opts.placeholder}
        className="w-full font-clinical-value text-lg p-3 bg-white border border-[#c4c5d7] rounded focus:ring-2 focus:outline-none no-spinner"
        style={{ ['--tw-ring-color' as string]: opts.accent ?? '#0037b0' }}
      />
    </div>
  );

  const section = (id: SectionId, children: React.ReactNode) => {
    const meta = SECTIONS.find((s) => s.id === id)!;
    const isOpen = open.has(id);
    return (
      <div
        key={id}
        className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden"
      >
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={isOpen}
          className="w-full p-4 bg-[#f8f9ff] flex items-center justify-between border-b border-[#E2E8F0] text-left min-h-[56px]"
        >
          <span className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: meta.accent }}
              aria-hidden
            />
            <span className="font-label-caps text-sm text-[#0b1c30] uppercase tracking-wider font-bold">
              {meta.label}
            </span>
          </span>
          <span className="material-symbols-outlined text-[#434655]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
        {isOpen && <div className="p-4 space-y-5">{children}</div>}
      </div>
    );
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 space-y-4 pb-32">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl text-[#0b1c30]">Record Clinical Round</h1>
          <p className="font-body-md text-xs text-[#434655] mt-0.5">
            Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> (
            {patient.caseNumber})
          </p>
        </div>
        <span className="font-clinical-value text-sm text-[#0037b0] bg-[#e5eeff] px-2.5 py-1 rounded font-bold">
          NOW
        </span>
      </div>

      {/* Live escalation preview */}
      {liveTriggers.length > 0 && (
        <div
          className="bg-white border border-[#B91C1C]/30 rounded-lg shadow-sm overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="px-4 py-2 bg-[#B91C1C]/10 border-b border-[#B91C1C]/20 flex items-center justify-between">
            <span className="font-label-caps text-xs text-[#B91C1C] font-bold uppercase tracking-wider">
              Call-surgeon triggers · {liveTriggers.length}
            </span>
            <span className="text-[10px] text-[#747686] font-sans">Decision support only</span>
          </div>
          <ul className="divide-y divide-[#E2E8F0]">
            {liveTriggers.map((t) => (
              <li key={t.id} className="px-4 py-2 flex items-start gap-2 text-sm">
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    t.severity === 'critical' ? 'bg-[#B91C1C]' : 'bg-[#C2410C]'
                  }`}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className="font-bold text-[#0b1c30]">{t.label}</span>
                  <span className="text-[#434655]"> — {t.evidence}</span>
                  <span className="block text-[11px] text-[#747686] font-sans">
                    Rule: {t.rule}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vitals */}
      {section(
        'vitals',
        <>
          {numberField('Heart Rate (bpm)', hr, setHr, {
            placeholder: 'e.g. 88',
            prev: latest?.vitals?.heartRate,
          })}
          {numberField(
            `Temperature (${patient.isFoal ? '°F' : '°C'})`,
            temp,
            setTemp,
            {
              placeholder: patient.isFoal ? 'e.g. 102.8' : 'e.g. 38.9',
              step: '0.1',
              prev: patient.isFoal ? latest?.vitals?.temperatureF : latest?.vitals?.temperatureC,
            },
          )}
          {numberField('Respiratory Rate (brpm)', rr, setRr, {
            placeholder: 'e.g. 24',
            prev: latest?.vitals?.respiratoryRate,
          })}
          {numberField('Capillary Refill Time (s)', crt, setCrt, {
            placeholder: 'e.g. 2',
            step: '0.5',
            prev: latest?.vitals?.crtSeconds,
          })}
          <OptionGrid
            definition={MUCOUS_MEMBRANES}
            value={mucousMembranes}
            onChange={setMucousMembranes}
            previous={latest?.vitals?.mucousMembranes}
          />
          <OptionGrid
            definition={MENTATION}
            value={mentation}
            onChange={setMentation}
            previous={latest?.vitals?.mentation}
          />
        </>,
      )}

      {/* Pain */}
      {section(
        'pain',
        <>
          {numberField('Pain score (0–3)', painScore, setPainScore, {
            placeholder: '0',
            prev: latest?.pain?.score,
            accent: '#6D28D9',
          })}
          <OptionGrid
            definition={PAIN_BEHAVIOUR}
            value={painBehaviour}
            onChange={setPainBehaviour}
            previous={latest?.pain?.behaviour}
          />
          <OptionGrid
            definition={ANALGESIA}
            value={analgesia}
            onChange={setAnalgesia}
            previous={latest?.pain?.analgesia}
          />
        </>,
      )}

      {/* GI */}
      {section(
        'gi',
        <>
          <div>
            <span className="font-label-caps text-xs text-[#434655] block mb-2">
              Gut sounds — four quadrants
            </span>
            <GutSoundsQuadrant
              value={gutSounds}
              onChange={setGutSounds}
              previous={latest?.gi?.gutSounds}
            />
          </div>
          {numberField('Net reflux (L)', reflux, setReflux, {
            placeholder: '0',
            step: '0.5',
            prev: latest?.gi?.refluxVolumeL,
            unit: 'L',
            accent: '#B45309',
          })}
          <OptionGrid
            definition={REFLUX_APPEARANCE}
            value={refluxAppearance}
            onChange={setRefluxAppearance}
            previous={latest?.gi?.refluxAppearance}
          />
          <OptionGrid
            definition={NASOGASTRIC_TUBE}
            value={nasogastricTube}
            onChange={setNasogastricTube}
            previous={latest?.gi?.nasogastricTube}
          />
          <ManureRecorder value={manure} onChange={setManure} />
          <OptionGrid
            definition={RECTAL_EXAM}
            value={rectalExam}
            onChange={setRectalExam}
            previous={latest?.gi?.rectalExam}
          />
          <OptionGrid
            definition={FLASH_ULTRASOUND}
            value={flashUltrasound}
            onChange={setFlashUltrasound}
            previous={latest?.gi?.flashUltrasound}
          />
          <OptionGrid
            definition={PERITONEAL_FLUID}
            value={peritonealFluid}
            onChange={setPeritonealFluid}
            previous={latest?.gi?.peritonealFluid}
          />
          <OptionGrid
            definition={RESPONSE_TO_THERAPY}
            value={responseToTherapy}
            onChange={setResponseToTherapy}
            previous={latest?.gi?.responseToTherapy}
          />
        </>,
      )}

      {/* Labs */}
      {section(
        'labs',
        <>
          {numberField('Lactate (mmol/L)', lactate, setLactate, {
            placeholder: 'e.g. 3.2',
            step: '0.1',
            prev: typeof latest?.labs?.lactate === 'number' ? latest.labs.lactate : undefined,
            accent: '#0E7490',
          })}
          {numberField('PCV (%)', pcv, setPcv, {
            placeholder: 'e.g. 42',
            prev: latest?.labs?.pcv,
            accent: '#0E7490',
          })}
        </>,
      )}

      {/* Laminitis */}
      {section(
        'laminitis',
        <>
          <OptionGrid
            definition={DIGITAL_PULSE}
            value={digitalPulse}
            onChange={setDigitalPulse}
            previous={latest?.laminitis?.digitalPulse}
          />
          {numberField('Obel grade (0–4)', obelGrade, setObelGrade, {
            placeholder: '0',
            prev: latest?.laminitis?.obelGrade,
            accent: '#A21CAF',
          })}
          <OptionGrid
            definition={CRYOTHERAPY}
            value={cryotherapy}
            onChange={setCryotherapy}
            previous={latest?.laminitis?.cryotherapy}
          />
        </>,
      )}

      {/* Support */}
      {section(
        'support',
        <>
          <OptionGrid
            definition={IV_CATHETER_SITE}
            value={ivCatheterSite}
            onChange={setIvCatheterSite}
            previous={latest?.support?.ivCatheterSite}
          />
          <OptionGrid
            definition={INCISION_STATUS}
            value={incisionStatus}
            onChange={setIncisionStatus}
            previous={latest?.support?.incisionStatus}
          />
        </>,
      )}

      {/* Save */}
      <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 max-w-2xl mx-auto px-4 z-30">
        <button
          type="button"
          onClick={handleSaveRound}
          className="w-full bg-[#0037b0] hover:bg-[#1d4ed8] text-white py-3.5 rounded-lg font-label-caps text-sm font-bold shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">save</span>
          <span>SAVE ROUND ASSESSMENT</span>
        </button>
      </div>
    </div>
  );
};
