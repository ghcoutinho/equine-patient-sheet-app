import React from 'react';

/**
 * Every write path — a round, a dose given, a lab panel — used to fall back
 * to `clinician || 'Unattributed'`, which is what made "Unattributed" a
 * default instead of a bug (see CLAUDE.md rule 2 and Architecture principle
 * A). This is the shared message shown next to a save action that is
 * disabled because no clinician name is set — the block has no override; the
 * only way past it is to set a name in the top bar.
 */
export const ClinicianRequiredNotice: React.FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`text-xs font-derived-value text-[#B45309] ${className}`}>
    Set your name in the top bar before saving.
  </p>
);
