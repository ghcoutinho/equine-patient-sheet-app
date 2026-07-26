import { useState, useEffect } from 'react';
import type { Patient, FlowsheetEntry } from '../types';
import { FlowsheetView } from './FlowsheetView';
import { PrognosisEngine } from './PrognosisEngine';
import { DoseCalculator } from './DoseCalculator';

interface PatientDashboardProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientDashboard({ patient, onBack }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'FLOWSHEET' | 'PROGNOSIS' | 'MEDICATIONS'>('FLOWSHEET');
  const [entries, setEntries] = useState<FlowsheetEntry[]>(() => {
    const saved = localStorage.getItem(`flowsheet_${patient.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`flowsheet_${patient.id}`, JSON.stringify(entries));
  }, [entries, patient.id]);

  const handleAddEntry = (entry: FlowsheetEntry) => {
    setEntries([...entries, entry]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onBack}>← Back to Board</button>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {patient.name}
              <span className={`badge ${patient.category === 'NEONATAL_FOAL' ? 'badge-warning' : 'badge-info'}`}>
                {patient.category.replace('_', ' ')}
              </span>
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {patient.breed} • {patient.age} • {patient.weightKg} kg • Owner: {patient.owner.name}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${activeTab === 'FLOWSHEET' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('FLOWSHEET')}>Flowsheet</button>
          <button className={`btn ${activeTab === 'PROGNOSIS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('PROGNOSIS')}>Prognosis Engine</button>
          <button className={`btn ${activeTab === 'MEDICATIONS' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('MEDICATIONS')}>Meds & Dosing</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        {activeTab === 'FLOWSHEET' && (
          <FlowsheetView 
            patient={patient} 
            entries={entries} 
            onAddEntry={handleAddEntry} 
          />
        )}
        
        {activeTab === 'PROGNOSIS' && (
          <PrognosisEngine 
            patient={patient} 
            latestEntry={entries[entries.length - 1]} 
          />
        )}
        
        {activeTab === 'MEDICATIONS' && (
          <DoseCalculator patient={patient} />
        )}
      </div>
    </div>
  );
}
