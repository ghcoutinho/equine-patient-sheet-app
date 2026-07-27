import { useState } from 'react';
import type { ViewTab, Patient } from './types';
import { INITIAL_PATIENTS } from './data/initialData';
import { usePersistentPatients, useClinician } from './utils/persistence';

import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NewAssessmentModal } from './components/NewAssessmentModal';

import { ClinicalSuiteOverview } from './components/views/ClinicalSuiteOverview';
import { DashboardView } from './components/views/DashboardView';
import { FlowsheetView } from './components/views/FlowsheetView';
import { LiveIntelligenceView } from './components/views/LiveIntelligenceView';
import { RoundEntryView } from './components/views/RoundEntryView';
import { NeonatalAssessmentView } from './components/views/NeonatalAssessmentView';
import { DoseCalculatorView } from './components/views/DoseCalculatorView';
import { ReferenceRangesView } from './components/views/ReferenceRangesView';
import { PatientManagementView } from './components/views/PatientManagementView';

export function App() {
  const [patients, setPatients, saveFailed] = usePersistentPatients(INITIAL_PATIENTS);
  const [clinician, setClinician] = useClinician();
  const [activePatientId, setActivePatientId] = useState<string>('p1');
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const handleDeletePatient = (id: string) => {
    setPatients(prev => {
      const next = prev.filter(p => p.id !== id);
      if (id === activePatientId && next.length) setActivePatientId(next[0].id);
      return next;
    });
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setActivePatientId(newPatient.id);
    setCurrentTab('flowsheet');
  };

  const handleSelectPatient = (patientId: string, targetTab?: ViewTab) => {
    setActivePatientId(patientId);
    if (targetTab) {
      setCurrentTab(targetTab);
    }
  };

  const handleApplyMedicationToFlowsheet = (_medName: string, doseText: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const latest = activePatient.flowsheetHistory[activePatient.flowsheetHistory.length - 1];

    const updatedPatient: Patient = {
      ...activePatient,
      lastObsTime: 'Just now',
      flowsheetHistory: [
        ...activePatient.flowsheetHistory,
        {
          time: timeStr,
          vitals: latest?.vitals || { heartRate: 88, temperatureC: 38.5 },
          gi: latest?.gi || { motility: 'Decreased' },
          labs: latest?.labs || { lactate: 2.1 },
          note: `Medication Administered: ${doseText}`
        }
      ]
    };

    handleUpdatePatient(updatedPatient);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0b1c30] font-sans flex flex-col antialiased">
      {/* Top Header Navbar */}
      <TopNavBar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activePatient={activePatient}
        patients={patients}
        setActivePatientId={setActivePatientId}
        onOpenNewAssessment={() => setIsModalOpen(true)}
      />

      {saveFailed && (
        <div role="alert" className="bg-[#B91C1C] text-white text-xs font-label-caps px-4 py-2 text-center">
          Could not save to this browser's local storage — changes will be lost on refresh.
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 flex pt-[44px] pb-16 lg:pb-0">
        {/* Desktop Left Navigation Rail */}
        <SideNavBar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activePatient={activePatient}
          onOpenNewAssessment={() => setIsModalOpen(true)}
        />

        {/* Main Content View Switcher */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {currentTab === 'overview' && (
            <ClinicalSuiteOverview
              patients={patients}
              onNavigate={setCurrentTab}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'flowsheet' && (
            <FlowsheetView
              patient={activePatient}
              clinician={clinician}
              onUpdatePatient={handleUpdatePatient}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'intelligence' && (
            <LiveIntelligenceView
              patient={activePatient}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'assess' && (
            <RoundEntryView
              patient={activePatient}
              clinician={clinician}
              onUpdatePatient={handleUpdatePatient}
              onDone={() => setCurrentTab('flowsheet')}
            />
          )}

          {currentTab === 'scores' && (
            <NeonatalAssessmentView
              patient={activePatient}
              onUpdatePatient={handleUpdatePatient}
            />
          )}

          {currentTab === 'ranges' && (
            <ReferenceRangesView patient={activePatient} />
          )}

          {currentTab === 'patients' && (
            <PatientManagementView
              patients={patients}
              activePatientId={activePatientId}
              clinician={clinician}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              onSelectPatient={(id) => { setActivePatientId(id); setCurrentTab('flowsheet'); }}
              onSetClinician={setClinician}
            />
          )}

          {currentTab === 'calculator' && (
            <DoseCalculatorView
              patient={activePatient}
              onApplyMedicationToFlowsheet={handleApplyMedicationToFlowsheet}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        hasCriticalAlert={activePatient.status === 'CRITICAL'}
      />

      {/* New Assessment / New Admission Modal */}
      <NewAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        onAddPatient={handleAddPatient}
        onSelectPatientForRound={(id) => {
          setActivePatientId(id);
          setCurrentTab('assess');
        }}
      />
    </div>
  );
}

export default App;
