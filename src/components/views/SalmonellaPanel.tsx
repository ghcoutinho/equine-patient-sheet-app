import React, { useMemo, useState } from 'react';
import type { Patient, SalmonellaTest } from '../../types';
import { SALMONELLA_SURVEILLANCE, evaluateSalmonellaIsolation } from '../../data/salmonella';
import { setSalmonellaIsolation, computeDue, DUE_STYLES } from '../../utils/schedule';
import { latestColumn } from '../../utils/admission';
import { stampRecorded } from '../../utils/recorded';
import { clockTime, dayLabel, newId } from '../../utils/treatments';
import { ClinicianRequiredNotice } from '../ui/ClinicianRequiredNotice';

interface SalmonellaPanelProps {
  patient: Patient;
  clinician: string;
  onUpdatePatient: (patient: Patient) => void;
}

/**
 * Salmonella surveillance (Bauck 2023) — collected on every colic admission,
 * resampled every 72h routinely and every 12h once a clinician confirms
 * isolation. The automated isolation-criteria read (fever + diarrhoea +
 * leukopenia together) only ever suggests isolation; it never sets it.
 */
export const SalmonellaPanel: React.FC<SalmonellaPanelProps> = ({
  patient,
  clinician,
  onUpdatePatient,
}) => {
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState<SalmonellaTest['method']>('PCR');
  const [result, setResult] = useState<SalmonellaTest['result']>('Pending');

  const hasClinician = !!clinician?.trim();
  const now = new Date();
  const latest = latestColumn(patient);
  const tests = useMemo(
    () => [...(patient.salmonellaTests ?? [])].sort((a, b) => b.at.localeCompare(a.at)),
    [patient.salmonellaTests],
  );
  const due = computeDue(patient.schedule, now).find((d) => d.task.kind === 'SALMONELLA');

  const hasDiarrhea = latest?.gi?.manure?.consistency === 'Watery diarrhoea';
  const isolationReading = evaluateSalmonellaIsolation(
    latest?.vitals?.temperatureC,
    latest?.gi?.manure ? hasDiarrhea : undefined,
    latest?.labs?.wbc,
  );

  const isolated = !!patient.salmonellaIsolation;

  const toggleIsolation = () => {
    onUpdatePatient({
      ...patient,
      salmonellaIsolation: !isolated,
      schedule: setSalmonellaIsolation(patient.schedule, !isolated),
    });
  };

  const startAdd = () => {
    setMethod('PCR');
    setResult('Pending');
    setAdding(true);
  };

  const save = () => {
    if (!hasClinician) return;
    const test: SalmonellaTest = { id: newId('salmonella'), method, result, ...stampRecorded(clinician) };
    onUpdatePatient({
      ...patient,
      salmonellaTests: [...(patient.salmonellaTests ?? []), test],
      schedule: patient.schedule?.map((t) =>
        t.id === 'salmonella' ? { ...t, lastDoneAt: now.toISOString() } : t,
      ),
    });
    setAdding(false);
  };

  return (
    <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm p-4 mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="font-headline text-base font-bold text-[#0b1c30]">
            Salmonella surveillance
          </h2>
          <p className="font-derived-value text-xs text-[#747686] mt-0.5">
            Collected on admission, resampled every {SALMONELLA_SURVEILLANCE.routineIntervalHours}h
            routinely — every {SALMONELLA_SURVEILLANCE.isolationIntervalHours}h once isolated.
          </p>
        </div>
        {!adding && (
          <button
            onClick={startAdd}
            className="px-3 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Log sample
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {due && (
          <span
            className={`text-[10px] font-label-caps px-1.5 py-0.5 rounded ${DUE_STYLES[due.state].chip}`}
          >
            Next sample {due.label}
          </span>
        )}
        <label className="flex items-center gap-1.5 font-label-caps text-[10px] text-[#434655]">
          <input
            type="checkbox"
            checked={isolated}
            onChange={toggleIsolation}
            className="accent-[#0037b0]"
          />
          Patient isolated
        </label>
      </div>

      {isolationReading && (
        <p
          className={`font-derived-value text-xs rounded border p-2.5 mb-3 ${
            isolationReading.meetsCriteria
              ? 'bg-[#FFF7ED] border-[#C2410C]/40 text-[#C2410C]'
              : 'bg-[#f8f9ff] border-[#E2E8F0] text-[#434655]'
          }`}
        >
          {isolationReading.reading} {SALMONELLA_SURVEILLANCE.source}
        </p>
      )}

      {adding && (
        <div className="border border-[#E2E8F0] rounded p-3 mb-3 bg-[#f8f9ff]">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as SalmonellaTest['method'])}
                className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white"
              >
                <option value="PCR">PCR</option>
                <option value="Culture">Culture</option>
              </select>
            </div>
            <div>
              <label className="font-label-caps text-[10px] tracking-widest text-[#747686] uppercase block mb-1">
                Result
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as SalmonellaTest['result'])}
                className="w-full border border-[#c4c5d7] rounded px-2 py-1.5 text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Negative">Negative</option>
                <option value="Positive">Positive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs font-label-caps text-[#434655] rounded hover:bg-[#eff4ff]"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!hasClinician}
              className="px-4 py-1.5 text-xs font-label-caps bg-[#0037b0] text-white rounded hover:bg-[#1d4ed8] disabled:opacity-40"
            >
              Save
            </button>
            {!hasClinician && <ClinicianRequiredNotice className="self-center" />}
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <p className="font-derived-value text-sm text-[#747686] italic">No sample logged yet.</p>
      ) : (
        <ul className="divide-y divide-[#E2E8F0]">
          {tests.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-1.5">
              <span className="font-body-md text-sm text-[#0b1c30]">
                {t.method} —{' '}
                <span
                  className={
                    t.result === 'Positive'
                      ? 'text-[#B91C1C] font-bold'
                      : t.result === 'Negative'
                        ? 'text-[#047857]'
                        : 'text-[#747686]'
                  }
                >
                  {t.result}
                </span>
              </span>
              <span className="font-derived-value text-[11px] text-[#747686]">
                {clockTime(t.at)} {dayLabel(t.at, now)} · {t.by}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
