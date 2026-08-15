import React from 'react';
import { Patient, ViewTab } from '../../types';
import { Sparkline } from '../ui/Sparkline';
import { wardAlerts, wardAlert, topTrigger } from '../../utils/wardAlerts';
import { activeInfusions } from '../../utils/treatments';
import { columnsInCurrentAdmission, latestColumn } from '../../utils/admission';

interface DashboardViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string, targetTab?: ViewTab) => void;
  onOpenNewAssessment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  patients,
  onSelectPatient,
  onOpenNewAssessment,
}) => {
  // Computed from the same call-surgeon triggers a patient's own Flowsheet
  // reads — not the static status/statusLabel fields sample data set once,
  // which never changed no matter what was actually charted afterward.
  const alerts = wardAlerts(patients);
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const watchCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-[#0b1c30]">Active Patients</h1>
          <p className="font-body-md text-sm text-[#434655] mt-1">
            High Acuity Ward • {patients.length} Active Cases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-[#B91C1C] text-white px-3 py-1 rounded-full font-label-caps text-xs flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            {criticalCount} CRITICAL
          </span>
          <span className="bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30 px-3 py-1 rounded-full font-label-caps text-xs">
            {watchCount} WATCH
          </span>
          <button
            onClick={onOpenNewAssessment}
            className="ml-2 bg-[#0037b0] hover:bg-[#1d4ed8] text-white text-xs font-label-caps px-3 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => {
          const alert = wardAlert(patient);
          const isCritical = alert.severity === 'critical';
          const isWatch = alert.severity === 'warning';
          const reason = topTrigger(alert.triggers)?.label;
          const cardLabel = patient.sirsCriteriaMet
            ? 'SIRS ALERT'
            : reason ?? patient.statusLabel ?? 'STABLE';
          const latestObs = latestColumn(patient);
          const infusion = activeInfusions(patient.treatments)[0];

          return (
            <div
              key={patient.id}
              className="bg-white border border-[#E2E8F0] rounded-lg flex flex-col relative overflow-hidden transition-all hover:shadow-md group"
            >
              {/* Family / Severity Rail */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-[4px] ${
                  isCritical ? 'bg-[#B91C1C] animate-pulse-critical' :
                  isWatch ? 'bg-[#B45309]' : 'bg-[#1D4ED8]'
                }`}
              />

              {/* Patient Card Top Header */}
              <div className="p-4 pl-6 border-b border-[#E2E8F0] flex justify-between items-start">
                <div>
                  <h2 className="font-headline text-lg text-[#0b1c30] group-hover:text-[#0037b0] transition-colors">
                    {patient.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-derived-value text-[#434655]">
                    <span>{patient.weightKg} kg</span>
                    <span>•</span>
                    <span>{patient.breed}</span>
                    {patient.age && (
                      <>
                        <span>•</span>
                        <span>{patient.age}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded font-label-caps text-xs font-bold ${
                  isCritical ? 'bg-[#B91C1C] text-white animate-pulse-critical' :
                  isWatch ? 'bg-[#FFFBEB] text-[#B45309] border border-[#B45309]/30' :
                  'bg-[#ECFDF5] text-[#047857]'
                }`}>
                  {cardLabel}
                </div>
              </div>

              {/* Patient Card Body: Primary Vitals & Sparkline */}
              <div className="p-4 pl-6 flex-grow space-y-4">
                {/* Main Metric Spotlight */}
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-label-caps text-xs text-[#1D4ED8] uppercase tracking-wider">
                      {patient.isFoal ? 'Heart Rate (Foal)' : isWatch ? 'Reflux Volume' : 'Heart Rate'}
                    </span>
                    <span className={`font-clinical-value text-base font-bold flex items-center gap-1 ${
                      isCritical ? 'text-[#B91C1C]' : isWatch ? 'text-[#C2410C]' : 'text-[#047857]'
                    }`}>
                      {Number.isFinite(latestObs?.vitals?.heartRate)
                        ? latestObs?.vitals?.heartRate
                        : Number.isFinite(latestObs?.gi?.refluxVolumeL)
                          ? latestObs?.gi?.refluxVolumeL
                          : '—'}
                      <span className="font-derived-value text-xs text-[#434655]">
                        {Number.isFinite(latestObs?.vitals?.heartRate) ? 'bpm' : 'L'}
                      </span>
                    </span>
                  </div>

                  {/* Trend from the charted rounds, not a fixed decoration */}
                  <Sparkline
                    className="mt-2"
                    height={34}
                    label={`${patient.name} heart rate`}
                    referenceMin={28}
                    referenceMax={44}
                    color={isCritical ? '#B91C1C' : '#1D4ED8'}
                    points={columnsInCurrentAdmission(patient).map((c) => ({
                      value: c.vitals?.heartRate,
                      label: c.time,
                    }))}
                  />
                </div>

                {/* Sub-Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]/60 text-xs">
                  <div>
                    <span className="font-label-caps text-[11px] text-[#B45309] block mb-0.5">
                      {patient.isFoal ? 'Sepsis Risk' : 'Motility'}
                    </span>
                    <span className="font-clinical-value text-sm text-[#0b1c30]">
                      {/* An unrecorded motility is not "Normal", and an
                          unrecorded foal is not "High Risk". */}
                      {latestObs?.gi?.motility || 'Not charted'}
                    </span>
                  </div>

                  <div>
                    <span className="font-label-caps text-[11px] text-[#0E7490] block mb-0.5">
                      {infusion ? 'CRI Status' : 'Lactate'}
                    </span>
                    {infusion ? (
                      <span className="font-clinical-value text-xs text-[#8B5CF6] border border-[#8B5CF6] px-1.5 py-0.5 rounded inline-block bg-[#8B5CF6]/5">
                        {infusion.drug} Active
                      </span>
                    ) : (
                      <span className={`font-clinical-value text-sm ${
                        (latestObs?.labs?.lactate || 0) > 2 ? 'text-[#B91C1C] font-bold' : 'text-[#0b1c30]'
                      }`}>
                        {latestObs?.labs?.lactate || '--'} <span className="font-derived-value text-[11px] text-[#434655]">mmol/L</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 pl-6 py-2.5 bg-[#f8f9ff] border-t border-[#E2E8F0] flex justify-between items-center text-xs">
                <span className="font-derived-value text-[12px] text-[#434655] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  Last obs {patient.lastObsTime}
                </span>

                <button
                  onClick={() => onSelectPatient(patient.id, 'flowsheet')}
                  className="text-[#0037b0] hover:text-[#1d4ed8] font-label-caps text-xs flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform"
                >
                  <span>FLOWSHEET</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
