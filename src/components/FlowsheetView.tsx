import React, { useState, useMemo } from 'react';
import type { Patient, FlowsheetEntry, } from '../types';
import { NEONATAL_FLOWSHEET_ROWS, ADULT_COLIC_FLOWSHEET_ROWS } from '../data/flowsheetRows';
import type { FlowsheetRowDef } from '../data/flowsheetRows';
import { SparklineTrend } from './SparklineTrend';
import { validatePhysiologicalParameters, type ClinicalAlert } from '../utils/physiologicalValidator';
import { calculateNeonatalSepsisScore } from '../utils/neonatalSepsisScore';
import { calculateAdultSirs } from '../utils/adultSirsScore';

interface FlowsheetViewProps {
  patient: Patient;
  entries: FlowsheetEntry[];
  onAddEntry: (entry: FlowsheetEntry) => void;
}

export function FlowsheetView({ patient, entries, onAddEntry }: FlowsheetViewProps) {
  const [newEntry, setNewEntry] = useState<Partial<FlowsheetEntry>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);

  const rows: FlowsheetRowDef[] = useMemo(() => {
    return patient.category === 'NEONATAL_FOAL' 
      ? NEONATAL_FLOWSHEET_ROWS 
      : ADULT_COLIC_FLOWSHEET_ROWS;
  }, [patient.category]);

  const handleInputChange = (id: string, value: any, type: string) => {
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value === '' ? undefined : Number(value);
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    }
    
    const updated = { ...newEntry, [id]: parsedValue };
    
    // Auto-calculate RPR if both RDW and platelets are present
    if (updated.rdw !== undefined && updated.platelets !== undefined) {
      updated.rpr = Number((updated.rdw / updated.platelets).toFixed(4));
    }

    setNewEntry(updated);
    
    // Real-time validation
    const { errors, alerts } = validatePhysiologicalParameters(patient.category, updated);
    setValidationErrors(errors);
    setClinicalAlerts(alerts);
  };

  const handleSave = () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before saving.');
      return;
    }

    const entryToSave: FlowsheetEntry = {
      id: crypto.randomUUID(),
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      recordedBy: 'Current User', // Mocked user
      ...newEntry
    } as FlowsheetEntry;

    onAddEntry(entryToSave);
    setNewEntry({});
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const container = e.currentTarget;
      const focusableElements = Array.from(
        container.querySelectorAll('input, select')
      ) as HTMLElement[];
      
      const index = focusableElements.indexOf(document.activeElement as HTMLElement);
      if (index > -1 && index < focusableElements.length - 1) {
        focusableElements[index + 1].focus();
      }
    }
  };

  // Compute real-time SIRS for preview
  const liveSirsPreview = useMemo(() => {
    if (patient.category === 'NEONATAL_FOAL') {
      const result = calculateNeonatalSepsisScore(patient, newEntry as FlowsheetEntry);
      return `Neonatal SIRS: ${result.sirsCriteriaCount.min}`;
    } else {
      const sirs = calculateAdultSirs(newEntry as FlowsheetEntry);
      return `Adult SIRS: ${sirs.score.min} (${sirs.mortalityRate}% Mort.)`;
    }
  }, [patient, newEntry]);

  // Group rows by category for rendering
  const categories = ['VITALS', 'CLINICAL', 'GI', 'LABS', 'BIOMARKERS'];

  return (
    <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Clinical Flowsheet</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {Object.keys(newEntry).length > 0 && (
            <div className="badge badge-info">{liveSirsPreview}</div>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={validationErrors.length > 0}>
            Save New Column
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div style={{ padding: '0.5rem', backgroundColor: 'var(--status-critical)', color: 'white', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>Validation Errors:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {clinicalAlerts.length > 0 && (
        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-critical)', color: 'var(--status-critical)', borderRadius: '4px', marginBottom: '1rem' }}>
          <strong>High Risk Alerts:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            {clinicalAlerts.map((a, i) => (
              <li key={i}>
                {a.severity === 'critical' ? '⚠️ ' : ''}{a.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex' }}>
        {/* Row Headers */}
        <div style={{ width: '220px', flexShrink: 0, borderRight: '2px solid var(--border-color)', paddingRight: '0.5rem' }}>
          <div style={{ height: '40px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
            Parameter
          </div>
          {categories.map(cat => (
            <React.Fragment key={cat}>
              {rows.filter(r => r.category === cat).length > 0 && (
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--status-info)', marginTop: '0.5rem' }}>
                  {cat}
                </div>
              )}
              {rows.filter(r => r.category === cat).map(row => {
                const rowData = entries.map(e => e[row.id as keyof FlowsheetEntry] as number).filter(v => v !== undefined && !isNaN(v));
                return (
                  <div key={row.id} style={{ height: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{row.label} <small style={{ color: 'var(--text-muted)' }}>{row.unit}</small></span>
                    {row.type === 'number' && rowData.length > 1 && (
                      <SparklineTrend data={rowData} />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Entry Columns */}
        <div style={{ display: 'flex', overflowX: 'auto', flex: 1 }}>
          
          {/* Historical Columns */}
          {entries.map(entry => (
            <div key={entry.id} style={{ width: '120px', flexShrink: 0, borderRight: '1px solid var(--border-color)' }}>
              <div style={{ height: '40px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                <span>{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
              {categories.map(cat => (
                <React.Fragment key={cat}>
                  {rows.filter(r => r.category === cat).length > 0 && <div style={{ height: '24.5px', marginTop: '0.5rem' }} />}
                  {rows.filter(r => r.category === cat).map(row => (
                    <div key={row.id} style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-mono)' }}>
                      {entry[row.id as keyof FlowsheetEntry] !== undefined ? String(entry[row.id as keyof FlowsheetEntry]) : '-'}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ))}

          {/* New Input Column */}
          <div 
            style={{ width: '140px', flexShrink: 0, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
            onKeyDown={handleContainerKeyDown}
          >
            <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--status-info)' }}>
              New Entry
            </div>
            {categories.map(cat => (
              <React.Fragment key={cat}>
                {rows.filter(r => r.category === cat).length > 0 && <div style={{ height: '24.5px', marginTop: '0.5rem' }} />}
                {rows.filter(r => r.category === cat).map(row => (
                  <div key={row.id} style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', padding: '0 4px' }}>
                    
                    {row.type === 'number' && (
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ height: '36px', padding: '0 4px', textAlign: 'center' }}
                        value={newEntry[row.id as keyof FlowsheetEntry] as string || ''}
                        onChange={e => handleInputChange(row.id, e.target.value, 'number')}
                      />
                    )}

                    {row.type === 'boolean' && (
                      <select 
                        className="input-field" 
                        style={{ height: '36px', padding: '0 4px' }}
                        value={newEntry[row.id as keyof FlowsheetEntry] !== undefined ? String(newEntry[row.id as keyof FlowsheetEntry]) : ''}
                        onChange={e => handleInputChange(row.id, e.target.value, 'boolean')}
                      >
                        <option value=""></option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    )}

                    {row.type === 'select' && (
                      <select 
                        className="input-field" 
                        style={{ height: '36px', padding: '0 4px', fontSize: '0.8rem' }}
                        value={newEntry[row.id as keyof FlowsheetEntry] as string || ''}
                        onChange={e => handleInputChange(row.id, e.target.value, 'select')}
                      >
                        <option value=""></option>
                        {row.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
