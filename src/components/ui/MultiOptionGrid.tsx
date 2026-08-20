import React from 'react';
import type { AssessmentDefinition } from '../../data/clinicalAssessments';
import { SEVERITY_STYLES } from '../../data/clinicalAssessments';

interface MultiOptionGridProps {
  definition: AssessmentDefinition;
  value: string[];
  onChange: (value: string[]) => void;
  /** Previous round's values, shown as reference chips. */
  previous?: string[];
}

/**
 * Multi-tap picker for a structured finding where more than one thing can
 * genuinely be true at once — a rectal exam or a FLASH scan can turn up two
 * findings in the same pass, and forcing a single pick meant the second one
 * was either dropped or wedged into a free-text note. Same visual language
 * as `OptionGrid`; the difference is `aria-checked`/toggling multiple
 * options rather than one clearing the others.
 */
export const MultiOptionGrid: React.FC<MultiOptionGridProps> = ({
  definition,
  value,
  onChange,
  previous,
}) => {
  /**
   * The "normal" option (if one exists) is mutually exclusive with every
   * other option — "Normal" and "Small intestinal distension" both selected
   * would be a contradiction, not two findings from the same exam.
   */
  const toggle = (optValue: string) => {
    const opt = definition.options.find((o) => o.value === optValue);
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
      return;
    }
    if (opt?.severity === 'normal') {
      onChange([optValue]);
      return;
    }
    const normalValues = definition.options.filter((o) => o.severity === 'normal').map((o) => o.value);
    onChange([...value.filter((v) => !normalValues.includes(v)), optValue]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-label-caps text-xs text-[#434655]">
          {definition.prompt} <span className="text-[#747686]">(select all that apply)</span>
        </span>
        {previous && previous.length > 0 && (
          <span className="font-derived-value text-[11px] bg-[#eff4ff] text-[#434655] px-2 py-0.5 rounded border border-[#E2E8F0] whitespace-nowrap">
            Prev: {previous.join(', ')}
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label={definition.label}
        className={`grid gap-2 ${definition.columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {definition.options.map((opt) => {
          const selected = value.includes(opt.value);
          const styles = SEVERITY_STYLES[opt.severity];
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(opt.value)}
              className={`min-h-[44px] w-full text-left px-3 py-2 rounded-lg border text-sm transition focus:outline-none focus:ring-2 focus:ring-[#0037b0] ${
                selected
                  ? `${styles.selected} font-bold`
                  : 'bg-white border-[#E2E8F0] text-[#0b1c30] hover:bg-[#f8f9ff]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center ${
                    selected ? 'bg-current border-current' : 'border-[#c4c5d7]'
                  }`}
                  aria-hidden
                >
                  {selected && (
                    <span className="material-symbols-outlined text-[12px] text-white leading-none">
                      check
                    </span>
                  )}
                </span>
                <span className="flex-1">
                  {opt.value}
                  {opt.hint && (
                    <span
                      className={`block text-[11px] font-normal ${
                        selected && opt.severity === 'critical' ? 'text-white/80' : 'text-[#747686]'
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
