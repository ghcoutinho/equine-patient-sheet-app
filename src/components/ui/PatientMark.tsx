import React from 'react';
import type { Patient } from '../../types';
import { patientMark } from '../../data/patientIdentity';

/**
 * The patient's mark: a horseshoe for an adult, a horse's head for a foal,
 * with the sex symbol set into the corner.
 *
 * Material Symbols ships no equine glyph, which is why the app was using a paw
 * print — a mark for a small-animal practice. These are drawn as inline SVG so
 * they need no font and scale cleanly.
 */

const Horseshoe: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    {/* Open-heeled shoe: a U with thickened branches and nail holes. */}
    <path
      d="M7.4 21.2c-.9 0-1.6-.7-1.6-1.6 0-.6.1-1.3.1-2C4.4 15.8 3.6 13.6 3.6 11 3.6 6 7.4 2.4 12 2.4S20.4 6 20.4 11c0 2.6-.8 4.8-2.3 6.6 0 .7.1 1.4.1 2 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6 0-.7 0-1.4-.1-2 .9-1.2 1.4-2.7 1.4-4.6 0-3.4-2-5.9-4.3-5.9S7.7 9.6 7.7 13c0 1.9.5 3.4 1.4 4.6-.1.6-.1 1.3-.1 2 0 .9-.7 1.6-1.6 1.6Z"
      fill="currentColor"
    />
    <circle cx="6.2" cy="9.4" r=".85" fill="#fff" />
    <circle cx="7.2" cy="13.4" r=".85" fill="#fff" />
    <circle cx="17.8" cy="9.4" r=".85" fill="#fff" />
    <circle cx="16.8" cy="13.4" r=".85" fill="#fff" />
  </svg>
);

const HorseHead: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    {/* Head in profile: ears, crest, cheek and muzzle. */}
    <path
      d="M7.6 2.5c.35-.35.95-.2 1.1.27l.75 2.3 1.5-1.35c.3-.27.78-.2.99.14l1.55 2.5c2.9.95 5 3.6 5 6.75v3.6c0 1.6-1.3 2.9-2.9 2.9h-.9c-.6 0-1.1-.5-1.1-1.1 0-1.7-1-2.6-2.4-3.3l-2.5-1.2c-1.9-.9-3.1-2.8-3.1-4.9V6.6c0-.5.1-1 .3-1.45L6.3 3.6c-.2-.5.3-1 .8-.85l.5.15Z"
      fill="currentColor"
    />
    <circle cx="13.6" cy="9.6" r=".95" fill="#fff" />
  </svg>
);

interface PatientMarkProps {
  patient: Patient;
  /** Overall diameter in pixels. */
  size?: number;
  /** Draw the sex symbol badge. */
  showSex?: boolean;
  /** Red pulse for a critical patient. */
  showStatus?: boolean;
  className?: string;
  now?: Date;
}

export const PatientMarkIcon: React.FC<PatientMarkProps> = ({
  patient,
  size = 40,
  showSex = true,
  showStatus = false,
  className = '',
  now,
}) => {
  const mark = patientMark(patient, now ?? new Date());
  const Shape = mark.shape === 'horseshoe' ? Horseshoe : HorseHead;
  const hasSex = patient.sex !== undefined && patient.sex !== 'UNKNOWN';

  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full bg-[#e5eeff] border border-[#c4c5d7] text-[#0037b0] flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={mark.description}
      role="img"
      aria-label={mark.description}
    >
      <Shape className="w-[62%] h-[62%]" />

      {showSex && hasSex && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white border border-[#c4c5d7] text-[#434655] font-bold leading-none"
          style={{
            width: Math.max(14, size * 0.42),
            height: Math.max(14, size * 0.42),
            fontSize: Math.max(9, size * 0.28),
          }}
          title={mark.sexLabel}
        >
          {mark.symbol}
        </span>
      )}

      {showStatus && patient.status === 'CRITICAL' && (
        <span
          className="absolute -top-0.5 -right-0.5 bg-[#B91C1C] border-2 border-white rounded-full animate-pulse-critical"
          style={{ width: Math.max(10, size * 0.28), height: Math.max(10, size * 0.28) }}
        />
      )}
    </span>
  );
};

/** Compact inline form for dropdowns and dense lists. */
export const PatientMarkGlyph: React.FC<{ patient: Patient; className?: string }> = ({
  patient,
  className = 'w-4 h-4',
}) => {
  const mark = patientMark(patient, new Date());
  const Shape = mark.shape === 'horseshoe' ? Horseshoe : HorseHead;
  return <Shape className={className} />;
};
