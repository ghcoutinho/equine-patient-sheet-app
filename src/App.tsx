import { useState } from 'react';
import { PatientBoardView } from './components/PatientBoardView';
import { PatientDashboard } from './components/PatientDashboard';
import { NewPatientModal } from './components/NewPatientModal';
import { ReferenceRangesView } from './components/ReferenceRangesView';
import type { Patient } from './types';
import { LiteratureView } from './components/LiteratureView';
import './App.css';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'BOARD' | 'RANGES' | 'LITERATURE'>('BOARD');

  const handleAddPatient = (patient: Patient) => {
    setPatients([...patients, patient]);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Top Navigation */}
      <header style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--status-info)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🐎 Equine Patient Sheet
          </h1>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className={`btn ${activeTab === 'BOARD' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('BOARD'); setActivePatient(null); }}
            >
              ICU Board
            </button>
            <button 
              className={`btn ${activeTab === 'RANGES' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('RANGES'); setActivePatient(null); }}
            >
              Reference Ranges
            </button>
            <button 
              className={`btn ${activeTab === 'LITERATURE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('LITERATURE'); setActivePatient(null); }}
            >
              Academic Literature
            </button>
          </nav>
        </div>
        
        {activeTab === 'BOARD' && !activePatient && (
          <button className="btn btn-primary" onClick={() => setShowNewPatientModal(true)}>
            + Admit Patient
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {activePatient ? (
          <PatientDashboard 
            patient={activePatient} 
            onBack={() => setActivePatient(null)} 
          />
        ) : (
          <>
            {activeTab === 'BOARD' && (
              <PatientBoardView 
                patients={patients} 
                onSelectPatient={setActivePatient} 
              />
            )}
            {activeTab === 'RANGES' && (
              <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
                <ReferenceRangesView />
              </div>
            )}
            {activeTab === 'LITERATURE' && (
              <LiteratureView />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showNewPatientModal && (
        <NewPatientModal 
          onClose={() => setShowNewPatientModal(false)}
          onSave={handleAddPatient}
        />
      )}
    </div>
  );
}

export default App;
