import React from 'react';
import type { GutSoundGrade, GutSoundsQuadrants } from '../../types';
import {
  GUT_SOUND_GRADES,
  GUT_SOUND_GRADE_LABELS,
  GUT_SOUND_QUADRANTS,
  summariseGutSounds,
} from '../../utils/gutSounds';

const GRADE_COLOUR: Record<GutSoundGrade, string> = {
  '++': '#B45309',
  '+': '#047857',
  '-': '#C2410C',
  '0': '#B91C1C',
};

const SEVERITY_TEXT: Record<string, string> = {
  normal: 'text-[#047857]',
  watch: 'text-[#B45309]',
  warning: 'text-[#C2410C]',
  critical: 'text-[#B91C1C]',
};

/**
 * Compact read-only cross used inside the flowsheet grid.
 * Each arm of the cross shows one quadrant's grade, laid out anatomically:
 * left column = left side of the horse, top row = dorsal.
 */
export const GutSoundsGlyph: React.FC<{ value: GutSoundsQuadrants; size?: number }> = ({
  value,
  size = 40,
}) => {
  const summary = summariseGutSounds(value);
  const cell = (grade: GutSoundGrade) => (
    <span
      className="flex items-center justify-center font-bold leading-none"
      style={{ color: GRADE_COLOUR[grade], fontSize: size * 0.28 }}
    >
      {grade === '0' ? '∅' : grade}
    </span>
  );

  return (
    <span
      className="relative inline-grid grid-cols-2 grid-rows-2 align-middle"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Gut sounds: ${summary.label}`}
      title={summary.label}
    >
      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#c4c5d7]" aria-hidden />
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#c4c5d7]" aria-hidden />
      {cell(value.leftDorsal)}
      {cell(value.rightDorsal)}
      {cell(value.leftVentral)}
      {cell(value.rightVentral)}
    </span>
  );
};

interface GutSoundsQuadrantProps {
  value: GutSoundsQuadrants;
  onChange: (next: GutSoundsQuadrants) => void;
  /** Previous round's value, shown for comparison. */
  previous?: GutSoundsQuadrants;
}

/**
 * Four-quadrant gut sound recorder.
 *
 * The clinician auscultates each quadrant and taps its grade. The live cross in
 * the header mirrors the anatomical layout so the charted picture matches what
 * they just listened to.
 */
export const GutSoundsQuadrant: React.FC<GutSoundsQuadrantProps> = ({
  value,
  onChange,
  previous,
}) => {
  const summary = summariseGutSounds(value);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`font-body-md text-sm font-bold ${SEVERITY_TEXT[summary.severity]}`}>
            {summary.label}
          </p>
          <p className="font-derived-value text-xs text-[#434655] mt-0.5">
            Derived motility: {summary.motility}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {previous && (
            <div className="text-center">
              <GutSoundsGlyph value={previous} size={36} />
              <span className="block text-[9px] text-[#747686] font-sans mt-0.5">PREV</span>
            </div>
          )}
          <div className="text-center">
            <GutSoundsGlyph value={value} size={44} />
            <span className="block text-[9px] text-[#0037b0] font-sans mt-0.5">NOW</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {GUT_SOUND_QUADRANTS.map(({ key, short, label }) => (
          <fieldset
            key={key}
            className="border border-[#E2E8F0] rounded-lg p-2.5 bg-white"
          >
            <legend className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider px-1">
              {short} · {label}
            </legend>
            <div className="flex gap-1 mt-1" role="radiogroup" aria-label={`${label} gut sounds`}>
              {GUT_SOUND_GRADES.map((grade) => {
                const selected = value[key] === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${label}: ${GUT_SOUND_GRADE_LABELS[grade]}`}
                    onClick={() => onChange({ ...value, [key]: grade })}
                    className={`flex-1 min-h-[44px] rounded-md border text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#0037b0] ${
                      selected
                        ? 'text-white border-transparent'
                        : 'bg-[#f8f9ff] text-[#434655] border-[#E2E8F0] hover:bg-[#eff4ff]'
                    }`}
                    style={selected ? { backgroundColor: GRADE_COLOUR[grade] } : undefined}
                  >
                    {grade === '0' ? '∅' : grade}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#434655] font-sans">
        {GUT_SOUND_GRADES.map((g) => (
          <div key={g} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: GRADE_COLOUR[g] }}
              aria-hidden
            />
            <dt className="font-bold">{g === '0' ? '∅' : g}</dt>
            <dd>{GUT_SOUND_GRADE_LABELS[g]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
