import React, { useState, useMemo } from 'react';
import { EXPANDED_FORMULARY } from '../data/expandedFormulary';
import type { DrugFormularyItem, Patient } from '../types';

interface DoseCalculatorProps {
  patient: Patient;
}

export function DoseCalculator({ patient }: DoseCalculatorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // For the medication addition workflow
  const [selectedDrug, setSelectedDrug] = useState<DrugFormularyItem | null>(null);
  const [confirmRoute, setConfirmRoute] = useState<string>('');
  const [confirmInterval, setConfirmInterval] = useState<string>('');
  const [addedMeds, setAddedMeds] = useState<any[]>([]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    EXPANDED_FORMULARY.forEach(d => {
      if (d.categories) d.categories.forEach(c => cats.add(c));
    });
    return ['ALL', ...Array.from(cats)].sort();
  }, []);

  const filteredDrugs = useMemo(() => {
    return EXPANDED_FORMULARY.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(search.toLowerCase()) || 
                            (drug.brandName && drug.brandName.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || (drug.categories && drug.categories.includes(selectedCategory));
      const matchesPatientType = drug.patientType === 'BOTH' || 
                                 (patient.category === 'NEONATAL_FOAL' ? drug.patientType === 'FOAL' : drug.patientType === 'ADULT');
      return matchesSearch && matchesCategory && matchesPatientType;
    });
  }, [search, selectedCategory, patient]);

  const handleSelectDrug = (drug: DrugFormularyItem) => {
    setSelectedDrug(drug);
    setConfirmRoute(drug.route[0] || ''); // Suggest first route
    setConfirmInterval(drug.frequency || ''); // Suggest interval
  };

  const handleConfirmAdd = () => {
    if (!selectedDrug) return;
    
    // Calculate precise dose
    const doseAmount = selectedDrug.doseDefault * patient.weightKg;
    let volumeAmount = 0;
    if (selectedDrug.concentration > 0) {
      volumeAmount = doseAmount / selectedDrug.concentration;
    }

    setAddedMeds([...addedMeds, {
      drugName: selectedDrug.name,
      doseTotal: doseAmount.toFixed(2) + ' ' + selectedDrug.doseUnit.split('/')[0], // e.g. mg
      volumeTotal: volumeAmount > 0 ? volumeAmount.toFixed(2) + ' mL' : 'N/A',
      route: confirmRoute,
      interval: confirmInterval,
      timestamp: new Date().toISOString()
    }]);

    setSelectedDrug(null);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dose Calculator & Formulary</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Patient Weight:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--status-info)' }}>{patient.weightKg} kg</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search 193+ drugs by name or brand..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select 
          className="input-field" 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: '300px' }}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: '400px' }}>
        
        {/* Formulary List */}
        <div style={{ flex: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
          {filteredDrugs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No drugs match your filters.</div>
          ) : (
            filteredDrugs.map(drug => {
              // Calculate preview dose
              const doseAmount = drug.doseDefault * patient.weightKg;
              const volAmount = drug.concentration > 0 ? (doseAmount / drug.concentration).toFixed(2) : '-';

              return (
                <div key={drug.id} className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--status-info)' }}>{drug.name} {drug.brandName && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({drug.brandName})</span>}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                      Dose: {drug.doseDefault} {drug.doseUnit} | Conc: {drug.concentration} {drug.concentrationUnit}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drug.categories?.join(', ')}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {volAmount !== '-' ? `${volAmount} mL` : `${doseAmount.toFixed(1)} ${drug.doseUnit.split('/')[0]}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {drug.route.join('/')} • {drug.frequency}
                      </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleSelectDrug(drug)}>
                      Add Med
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Meds List */}
        <div style={{ flex: 1, backgroundColor: 'var(--bg-app)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Active Medications</h3>
          {addedMeds.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No medications added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addedMeds.map((med, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--bg-panel)', padding: '0.75rem', borderRadius: '6px', borderLeft: '4px solid var(--status-normal)' }}>
                  <div style={{ fontWeight: 'bold' }}>{med.drugName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {med.doseTotal} ({med.volumeTotal})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Route: {med.route} | Interval: {med.interval}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggestion & Confirmation Modal */}
      {selectedDrug && (
        <div style={styles.overlay}>
          <div className="glass-panel" style={styles.modal}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--status-info)' }}>Confirm Medication Order</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Adding <strong>{selectedDrug.name}</strong> for patient {patient.name} ({patient.weightKg} kg).
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <label style={styles.label}>
                Suggested Route (Clinician Confirmation Required)
                <select className="input-field" value={confirmRoute} onChange={e => setConfirmRoute(e.target.value)}>
                  {selectedDrug.route.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <label style={styles.label}>
                Suggested Interval (Clinician Confirmation Required)
                <input 
                  type="text" 
                  className="input-field" 
                  value={confirmInterval} 
                  onChange={e => setConfirmInterval(e.target.value)} 
                />
                <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Formulary standard: {selectedDrug.frequency}</small>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedDrug(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmAdd}>Confirm & Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    width: '400px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: 'var(--text-primary)'
  }
};
