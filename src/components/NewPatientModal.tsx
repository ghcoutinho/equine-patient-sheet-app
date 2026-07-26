import React, { useState } from 'react';
import type { Patient, PatientCategory } from '../types';

interface NewPatientModalProps {
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

export function NewPatientModal({ onClose, onSave }: NewPatientModalProps) {
  const [category, setCategory] = useState<PatientCategory>('ADULT_COLIC');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Mare');
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().slice(0, 16));

  // Owner Profile
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [ownerInsurance, setOwnerInsurance] = useState('');

  // Admission Physical Exam
  const [examClassification, setExamClassification] = useState<'CRITICAL' | 'STABLE' | 'NEEDS_TRIAGE' | 'ROUTINE'>('STABLE');
  const [examNotes, setExamNotes] = useState('');

  // Neonatal Specific
  const [gestationalAge, setGestationalAge] = useState<number | ''>('');
  const [colostrumIntake, setColostrumIntake] = useState<'ADEQUATE' | 'POOR' | 'NONE' | 'UNKNOWN'>('UNKNOWN');
  const [damHistory, setDamHistory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name,
      category,
      age,
      weightKg: Number(weightKg),
      breed,
      gender,
      status: 'ACTIVE',
      admissionDate,
      owner: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
        address: ownerAddress,
        insuranceInfo: ownerInsurance
      },
      admissionExam: {
        classification: examClassification,
        notes: examNotes
      },
      ...(category === 'NEONATAL_FOAL' && {
        gestationalAgeDays: gestationalAge ? Number(gestationalAge) : undefined,
        colostrumIntake,
        damHistory
      })
    };

    onSave(newPatient);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-panel" style={styles.modal}>
        <div style={styles.header}>
          <h2>Register New Patient</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Column 1: Patient Basic Info */}
            <div style={styles.column}>
              <h3 style={styles.sectionTitle}>Patient Information</h3>
              <label style={styles.label}>
                Patient Name *
                <input required className="input-field" value={name} onChange={e => setName(e.target.value)} />
              </label>

              <label style={styles.label}>
                Category *
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value as PatientCategory)}>
                  <option value="ADULT_COLIC">Adult Colic</option>
                  <option value="ADULT_GI">Adult GI (Non-Colic)</option>
                  <option value="NEONATAL_FOAL">Neonatal Foal</option>
                </select>
              </label>

              <label style={styles.label}>
                Age
                <input placeholder="e.g. 5 years, 12 hours" className="input-field" value={age} onChange={e => setAge(e.target.value)} />
              </label>

              <label style={styles.label}>
                Weight (kg) *
                <input required type="number" className="input-field" value={weightKg} onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : '')} />
              </label>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Breed
                  <input className="input-field" value={breed} onChange={e => setBreed(e.target.value)} />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Gender
                  <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                    <option>Mare</option>
                    <option>Stallion</option>
                    <option>Gelding</option>
                    <option>Filly</option>
                    <option>Colt</option>
                  </select>
                </label>
              </div>

              <label style={styles.label}>
                Admission Date
                <input type="datetime-local" className="input-field" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} />
              </label>
            </div>

            {/* Column 2: Owner & Exam Info */}
            <div style={styles.column}>
              <h3 style={styles.sectionTitle}>Owner Profile</h3>
              <label style={styles.label}>
                Owner Name *
                <input required className="input-field" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ ...styles.label, flex: 1 }}>
                  Phone
                  <input type="tel" className="input-field" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} />
                </label>
                <label style={{ ...styles.label, flex: 1 }}>
                  Email
                  <input type="email" className="input-field" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                </label>
              </div>
              <label style={styles.label}>
                Address
                <input className="input-field" value={ownerAddress} onChange={e => setOwnerAddress(e.target.value)} />
              </label>
              <label style={styles.label}>
                Insurance Info
                <input className="input-field" value={ownerInsurance} onChange={e => setOwnerInsurance(e.target.value)} />
              </label>

              <h3 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Admission Physical Exam</h3>
              <label style={styles.label}>
                Triage Classification *
                <select className="input-field" value={examClassification} onChange={e => setExamClassification(e.target.value as any)}>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="STABLE">STABLE</option>
                  <option value="NEEDS_TRIAGE">NEEDS TRIAGE</option>
                  <option value="ROUTINE">ROUTINE</option>
                </select>
              </label>
              <label style={styles.label}>
                Exam Notes
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={examNotes} 
                  onChange={e => setExamNotes(e.target.value)} 
                />
              </label>
            </div>
          </div>

          {/* Conditional Neonatal Section */}
          {category === 'NEONATAL_FOAL' && (
            <div style={{ ...styles.column, marginTop: '1.5rem', backgroundColor: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={styles.sectionTitle}>Neonatal Specific Information</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ ...styles.label, flex: 1, minWidth: '200px' }}>
                  Gestational Age (Days)
                  <input type="number" className="input-field" value={gestationalAge} onChange={e => setGestationalAge(e.target.value ? Number(e.target.value) : '')} />
                </label>
                <label style={{ ...styles.label, flex: 1, minWidth: '200px' }}>
                  Colostrum Intake
                  <select className="input-field" value={colostrumIntake} onChange={e => setColostrumIntake(e.target.value as any)}>
                    <option value="UNKNOWN">Unknown</option>
                    <option value="ADEQUATE">Adequate</option>
                    <option value="POOR">Poor</option>
                    <option value="NONE">None</option>
                  </select>
                </label>
              </div>
              <label style={styles.label}>
                Dam History (Placentitis, illness, etc.)
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '60px' }}
                  value={damHistory} 
                  onChange={e => setDamHistory(e.target.value)} 
                />
              </label>
            </div>
          )}

          <div style={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register Patient</button>
          </div>
        </form>
      </div>
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
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '1.5rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionTitle: {
    color: 'var(--status-info)',
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem'
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)'
  }
};
