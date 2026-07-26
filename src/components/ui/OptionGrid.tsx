import React from 'react';
import type { AssessmentDefinition } from '../../data/clinicalAssessments';
import { SEVERITY_STYLES } from '../../data/clinicalAssessments';

interface OptionGridProps {
  definition: AssessmentDefinition;
  value?: string;
  onChange: (value: string | undefined) => void;
  /** Previous round's value, shown as a reference chip. */
  previous?: string;
}

/**
 * One-tap picker for a structured clinical finding.
 *
 * Selecting the option that is already selected clears it, so "not assessed"
 * stays distinguishable from a recorded normal — the two are clinically
 * different and the flowsheet renders them differently.
 */
export const OptionGrid: React.FC<OptionGridProps> = ({
  definition,
  value,
  onChange,
  previous,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-label-caps text-xs text-[#434655]">{definition.prompt}</span>
        {previous && (
          <span className="font-derived-value text-[11px] bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0] whitespace-nowrap">
            Prev: {previous}
          </span>
        )}
      </div>

      <div
        role="radiogroup"
        aria-label={definition.label}
        className={`grid gap-2 ${definition.columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {definition.options.map((opt) => {
          const selected = value === opt.value;
          const styles = SEVERITY_STYLES[opt.severity];
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(selected ? undefined : opt.value)}
              className={`min-h-[44px] w-full text-left px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-[#0037b0] ${
                selected
                  ? `${styles.selected} font-bold`
                  : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="flex items-center gap-2">
                {!selected && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`}
                    aria-hidden
                  />
                )}
                <span className="flex-1">
                  {opt.value}
                  {opt.hint && (
                    <span
                      className={`block text-[11px] font-normal ${
                        selected && opt.severity === 'critical'
                          ? 'text-white/80'
                          : 'text-[#747686]'
                      }`}
                    >
                      {opt.hint}
                    </span>
                  )}
                </span>
                {selected && opt.severity !== 'normal' && (
                  <span className="text-[10px] font-sans uppercase tracking-wider flex-shrink-0">
                    {styles.label}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
