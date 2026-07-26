import React from 'react';
import type { ManureRecord } from '../../types';
import { MANURE_AMOUNTS, MANURE_CONSISTENCIES } from '../../data/clinicalAssessments';

interface ManureRecorderProps {
  value?: ManureRecord;
  onChange: (value: ManureRecord | undefined) => void;
}

const pill = (selected: boolean) =>
  `min-h-[44px] px-3 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-[#0037b0] ${
    selected
      ? 'bg-[#e5eeff] border-[#0037b0] text-[#0037b0] font-bold'
      : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
  }`;

/**
 * Manure passage: a yes/no with two qualifiers that only apply when the answer
 * is yes. Absence of manure over successive rounds is itself a finding, so the
 * "No" branch is recorded explicitly rather than left blank.
 */
export const ManureRecorder: React.FC<ManureRecorderProps> = ({ value, onChange }) => {
  const passed = value?.passed;

  return (
    <div className="space-y-3">
      <span className="font-label-caps text-xs text-[#434655] block">Manure passed?</span>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Manure passed">
        <button
          type="button"
          role="radio"
          aria-checked={passed === true}
          onClick={() =>
            onChange(passed === true ? undefined : { ...value, passed: true })
          }
          className={pill(passed === true)}
        >
          Yes
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={passed === false}
          onClick={() => onChange(passed === false ? undefined : { passed: false })}
          className={pill(passed === false)}
        >
          No
        </button>
      </div>

      {passed === true && (
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <label className="block">
            <span className="font-label-caps text-xs text-[#434655] block mb-1">Amount</span>
            <select
              value={value?.amount ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  passed: true,
                  amount: (e.target.value || undefined) as ManureRecord['amount'],
                })
              }
              className="w-full min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded-lg text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
            >
              <option value="">Not recorded</option>
              {MANURE_AMOUNTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="font-label-caps text-xs text-[#434655] block mb-1">Consistency</span>
            <select
              value={value?.consistency ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  passed: true,
                  consistency: (e.target.value || undefined) as ManureRecord['consistency'],
                })
              }
              className="w-full min-h-[44px] px-3 bg-white border border-[#c4c5d7] rounded-lg text-sm focus:ring-2 focus:ring-[#0037b0] focus:outline-none"
            >
              <option value="">Not recorded</option>
              {MANURE_CONSISTENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};
