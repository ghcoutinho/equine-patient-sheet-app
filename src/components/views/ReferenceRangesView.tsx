import React, { useMemo, useState } from 'react';
import { Patient } from '../../types';
import {
  AGE_CLASSES,
  ALL_FOAL_PARAMETERS,
  FOAL_BLOOD_GAS,
  RANGE_SOURCES,
  VALUE_KIND_LABEL,
  ageClassFor,
  formatAgeValue,
  type AgeClass,
  type AgeStratifiedParameter,
} from '../../data/ageStratifiedReferenceRanges';
import {
  CORNELL_EQUINE_CHEMISTRY,
  CORNELL_EQUINE_HEMATOLOGY,
  CORNELL_EQUINE_IMMUNOLOGY,
  CORNELL_EQUINE_BLOOD_GAS,
  QUICK_LABS,
  type LabParameterRange,
} from '../../data/cornellReferenceRanges';
import {
  BREED_ERYTHRON,
  TYPE_ERYTHRON,
  HAEMOSTASIS_PANEL,
  EQUINE_INTERNAL_MEDICINE_SOURCE,
  breedErythronFor,
  breedInterval,
} from '../../data/breedReferenceRanges';

interface ReferenceRangesViewProps {
  patient: Patient;
}

const PANEL_ACCENT: Record<string, string> = {
  'Quick labs': '#0037b0',
  Haematology: '#0E7490',
  Chemistry: '#0E7490',
  Hepatobiliary: '#B45309',
  'Blood gas': '#6D28D9',
  Immunology: '#A21CAF',
};

const ADULT_PANELS: { title: string; rows: LabParameterRange[] }[] = [
  { title: 'Quick labs', rows: QUICK_LABS },
  { title: 'Haematology', rows: CORNELL_EQUINE_HEMATOLOGY },
  { title: 'Chemistry', rows: CORNELL_EQUINE_CHEMISTRY },
  { title: 'Blood gas', rows: CORNELL_EQUINE_BLOOD_GAS },
  { title: 'Immunology', rows: CORNELL_EQUINE_IMMUNOLOGY },
];

const Panel: React.FC<{ title: string; children: React.ReactNode; count: number }> = ({
  title,
  children,
  count,
}) => (
  <section className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden">
    <header
      className="px-4 py-2 bg-[#f8f9ff] border-b border-[#E2E8F0] flex items-center gap-2"
      style={{ borderLeft: `3px solid ${PANEL_ACCENT[title] ?? '#334155'}` }}
    >
      <h2 className="font-label-caps text-xs uppercase tracking-wider font-bold text-[#0b1c30]">
        {title}
      </h2>
      <span className="font-derived-value text-[11px] text-[#747686]">{count}</span>
    </header>
    <div className="overflow-x-auto">{children}</div>
  </section>
);

export const ReferenceRangesView: React.FC<ReferenceRangesViewProps> = ({ patient }) => {
  const [ageClass, setAgeClass] = useState<AgeClass>(() =>
    ageClassFor(patient.age, patient.isFoal || patient.category === 'NEONATAL_FOAL'),
  );

  const suggested = ageClassFor(
    patient.age,
    patient.isFoal || patient.category === 'NEONATAL_FOAL',
  );

  const patientBreed = useMemo(() => breedErythronFor(patient.breed), [patient.breed]);

  const foalRows = useMemo(
    () => ALL_FOAL_PARAMETERS.filter((p) => p.byAge[ageClass] !== undefined),
    [ageClass],
  );

  const foalPanels = useMemo(() => {
    const groups: Record<string, AgeStratifiedParameter[]> = {};
    foalRows.forEach((p) => {
      (groups[p.panel] ||= []).push(p);
    });
    return groups;
  }, [foalRows]);

  const usedSourceIds = useMemo(() => {
    const ids = new Set<string>();
    if (ageClass === 'ADULT') ids.add('cornell');
    else {
      foalRows.forEach((p) => ids.add(String(p.byAge[ageClass]!.sourceId)));
      ids.add('wilkins2018');
    }
    return Array.from(ids);
  }, [foalRows, ageClass]);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-5 bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#0037b0] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            LABORATORY
          </span>
          <span className="text-xs font-derived-value text-[#434655]">
            Age-stratified equine reference intervals
          </span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">Reference Ranges</h1>
        <p className="font-body-md text-sm text-[#434655] mt-1">
          Active patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> ·
          suggested band{' '}
          <span className="font-bold">
            {AGE_CLASSES.find((a) => a.id === suggested)?.label}{' '}
            {AGE_CLASSES.find((a) => a.id === suggested)?.detail}
          </span>
        </p>

        {/* Age class tabs */}
        <div
          className="flex flex-wrap gap-2 mt-4"
          role="tablist"
          aria-label="Patient age class"
        >
          {AGE_CLASSES.map((a) => {
            const active = ageClass === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setAgeClass(a.id)}
                className={`min-h-[44px] px-4 rounded-lg border text-left transition focus:outline-none focus:ring-2 focus:ring-[#0037b0] ${
                  active
                    ? 'bg-[#0037b0] border-[#0037b0] text-white'
                    : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
                }`}
              >
                <span className="block font-label-caps text-xs font-bold">{a.label}</span>
                <span
                  className={`block font-derived-value text-[11px] ${
                    active ? 'text-white/80' : 'text-[#747686]'
                  }`}
                >
                  {a.detail}
                </span>
                {a.id === suggested && (
                  <span
                    className={`block text-[9px] font-sans uppercase tracking-wider ${
                      active ? 'text-white/70' : 'text-[#0037b0]'
                    }`}
                  >
                    this patient
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Adult: Cornell */}
      {ageClass === 'ADULT' &&
        ADULT_PANELS.map(({ title, rows }) => (
          <Panel key={title} title={title} count={rows.length}>
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="font-label-caps text-[11px] text-[#434655]">
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Parameter</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Units</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Reference</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Critical</th>
                </tr>
              </thead>
              <tbody className="font-clinical-value text-sm tabular-nums">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8f9ff]">
                    <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                      {r.name}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-xs">
                      {r.units || '—'}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">
                      {r.referenceMin}–{r.referenceMax}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#B91C1C]">
                      {r.criticalMin !== undefined || r.criticalMax !== undefined
                        ? `${r.criticalMin !== undefined ? `< ${r.criticalMin}` : ''}${
                            r.criticalMin !== undefined && r.criticalMax !== undefined ? '  ·  ' : ''
                          }${r.criticalMax !== undefined ? `> ${r.criticalMax}` : ''}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        ))}

      {/* Foal bands */}
      {ageClass !== 'ADULT' && (
        <>
          {Object.entries(foalPanels).map(([panel, rows]) => (
            <Panel key={panel} title={panel} count={rows.length}>
              <table className="w-full text-left border-collapse min-w-[560px]">
                <thead>
                  <tr className="font-label-caps text-[11px] text-[#434655]">
                    <th className="px-4 py-2 border-b border-[#E2E8F0]">Parameter</th>
                    <th className="px-4 py-2 border-b border-[#E2E8F0]">Units</th>
                    <th className="px-4 py-2 border-b border-[#E2E8F0]">Value</th>
                    <th className="px-4 py-2 border-b border-[#E2E8F0]">Type</th>
                    <th className="px-4 py-2 border-b border-[#E2E8F0]">n</th>
                  </tr>
                </thead>
                <tbody className="font-clinical-value text-sm tabular-nums">
                  {rows.map((p) => {
                    const v = p.byAge[ageClass]!;
                    return (
                      <tr key={p.id} className="hover:bg-[#f8f9ff]">
                        <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                          {p.name}
                          {v.note && (
                            <span className="block font-derived-value text-[10px] text-[#B45309]">
                              {v.note}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-xs">
                          {p.units}
                        </td>
                        <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">
                          {formatAgeValue(v)}
                        </td>
                        <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-[11px] font-sans">
                          {VALUE_KIND_LABEL[v.kind]}
                        </td>
                        <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-xs">
                          {v.n ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          ))}

          {/* Blood gas time series */}
          <Panel title="Blood gas" count={FOAL_BLOOD_GAS.length}>
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="font-label-caps text-[11px] text-[#434655]">
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Postnatal age</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">PaO₂ (mmHg)</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">PaCO₂ (mmHg)</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">pH</th>
                </tr>
              </thead>
              <tbody className="font-clinical-value text-sm tabular-nums">
                {FOAL_BLOOD_GAS.map((g) => (
                  <tr
                    key={g.postnatalAge}
                    className={`hover:bg-[#f8f9ff] ${g.premature ? 'bg-[#FFFBEB]' : ''}`}
                  >
                    <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                      {g.postnatalAge}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0]">
                      {g.pao2.mean} ± {g.pao2.sd}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0]">
                      {g.paco2.mean} ± {g.paco2.sd}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0]">
                      {g.ph.mean} ± {g.ph.sd}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      {/* Breed-stratified erythron — adults only */}
      {ageClass === 'ADULT' && (
        <>
          <Panel title="Erythron by breed" count={BREED_ERYTHRON.length}>
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="font-label-caps text-[11px] text-[#434655]">
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Breed</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">RBC ×10⁶/µL</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Hgb g/dL</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">PCV %</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">MCV fL</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">MCHC %</th>
                </tr>
              </thead>
              <tbody className="font-clinical-value text-sm tabular-nums">
                {BREED_ERYTHRON.map((b) => {
                  const isPatient =
                    patientBreed?.breed === b.breed;
                  const cell = (v?: { mean: number; sd?: number }) =>
                    v ? `${v.mean}${v.sd !== undefined ? ` ± ${v.sd}` : ''}` : '—';
                  return (
                    <tr
                      key={b.breed}
                      className={isPatient ? 'bg-[#e5eeff]' : 'hover:bg-[#f8f9ff]'}
                    >
                      <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                        {b.breed}
                        {isPatient && (
                          <span className="block text-[9px] font-sans uppercase tracking-wider text-[#0037b0]">
                            this patient
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0]">{cell(b.rbc)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0]">{cell(b.hgb)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0]">
                        {cell(b.pcv)}
                        {breedInterval(b.pcv) && (
                          <span className="block text-[10px] text-[#747686] font-sans">
                            ±2 SD: {breedInterval(b.pcv)!.min}–{breedInterval(b.pcv)!.max}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0]">{cell(b.mcv)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0]">{cell(b.mchc)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-4 py-2 font-derived-value text-[11px] text-[#747686]">
              Mean ± SD, not reference intervals. ±2 SD is shown for PCV as the conventional
              stand-in.
            </p>
          </Panel>

          <Panel title="Erythron by type" count={TYPE_ERYTHRON.length}>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="font-label-caps text-[11px] text-[#434655]">
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Type</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">RBC ×10⁶/µL</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Hgb g/dL</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">PCV %</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">MCV fL</th>
                </tr>
              </thead>
              <tbody className="font-clinical-value text-sm tabular-nums">
                {TYPE_ERYTHRON.map((t) => {
                  const r = (v?: { min: number; max: number }) =>
                    v ? `${v.min}–${v.max}` : '—';
                  return (
                    <tr key={t.type} className="hover:bg-[#f8f9ff]">
                      <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                        {t.type}
                        <span className="block font-derived-value text-[10px] text-[#747686]">
                          {t.sourceNote}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">{r(t.rbc)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">{r(t.hgb)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">{r(t.pcv)}</td>
                      <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">{r(t.mcv)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <Panel title="Haemostasis" count={HAEMOSTASIS_PANEL.length}>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="font-label-caps text-[11px] text-[#434655]">
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Parameter</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Units</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Value</th>
                  <th className="px-4 py-2 border-b border-[#E2E8F0]">Reference</th>
                </tr>
              </thead>
              <tbody className="font-clinical-value text-sm tabular-nums">
                {HAEMOSTASIS_PANEL.map((h, i) => (
                  <tr key={`${h.parameter}-${i}`} className="hover:bg-[#f8f9ff]">
                    <td className="px-4 py-2 border-b border-[#E2E8F0] font-body-md text-[#0b1c30]">
                      {h.parameter}
                      {h.unitWarning && (
                        <span className="block font-derived-value text-[10px] text-[#B45309]">
                          ⚠ {h.unitWarning}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-xs">
                      {h.units}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#047857]">
                      {h.display}
                    </td>
                    <td className="px-4 py-2 border-b border-[#E2E8F0] text-[#747686] text-[11px] font-sans">
                      {h.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}

      {/* Sources */}
      <section className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-5">
        <h2 className="font-label-caps text-xs uppercase tracking-wider font-bold text-[#0b1c30] mb-3">
          Sources for this view
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {usedSourceIds.map((id) => {
            const s = RANGE_SOURCES[id];
            if (!s) return null;
            return (
              <li key={id} className="font-body-md text-xs text-[#0b1c30]">
                {s.citation}
                {s.doi && (
                  <>
                    {' '}
                    <a
                      href={`https://doi.org/${s.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0037b0] underline"
                    >
                      doi:{s.doi}
                    </a>
                  </>
                )}
                {s.caveat && (
                  <span className="block font-derived-value text-[11px] text-[#B45309] mt-1">
                    {s.caveat}
                  </span>
                )}
              </li>
            );
          })}
          {ageClass === 'ADULT' && (
            <li className="font-body-md text-xs text-[#0b1c30]">
              {EQUINE_INTERNAL_MEDICINE_SOURCE}
              <span className="block font-derived-value text-[11px] text-[#B45309] mt-1">
                Breed and type values are mean ± SD or ranges compiled from several primary
                studies, listed per row. The source states these numbers are for reference only
                and that each laboratory should establish its own equine values.
              </span>
            </li>
          )}
        </ol>
        <p className="font-derived-value text-[11px] text-[#747686] mt-4">
          Reference intervals are population- and analyser-specific. Confirm against your own
          laboratory's intervals before acting on a result.
        </p>
      </section>
    </div>
  );
};
