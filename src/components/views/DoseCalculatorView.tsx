import React from 'react';
import type { Patient, Treatment } from '../../types';
import { DoseEntryPanel } from './DoseEntryPanel';

interface DoseCalculatorViewProps {
  patient: Patient;
  clinician?: string;
  onAddTreatment?: (treatment: Treatment) => void;
}

/**
 * Dose Calculator tab — the same DoseEntryPanel Medications & Support embeds
 * for "Add treatment", framed as its own page. Kept as a separate tab for
 * reference use (comparing drugs, checking a dose before a patient is even
 * settled), while an order actually placed here still lands on the sheet
 * exactly the way one placed from Medications & Support does — one engine.
 */
export const DoseCalculatorView: React.FC<DoseCalculatorViewProps> = ({
  patient,
  clinician,
  onAddTreatment,
}) => {
  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8 bg-[#F8FAFC]">
      <DoseEntryPanel
        patient={patient}
        clinician={clinician}
        onAddTreatment={onAddTreatment ?? (() => {})}
      />
    </div>
  );
};
