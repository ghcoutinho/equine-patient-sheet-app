
import type { Patient } from '../types';

interface PatientBoardViewProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export function PatientBoardView({ patients, onSelectPatient }: PatientBoardViewProps) {
  const activePatients = patients.filter(p => p.status === 'ACTIVE');
  const dischargedPatients = patients.filter(p => p.status === 'DISCHARGED');

  const grouped = {
    CRITICAL: activePatients.filter(p => p.admissionExam?.classification === 'CRITICAL'),
    STABLE: activePatients.filter(p => p.admissionExam?.classification === 'STABLE'),
    NEEDS_TRIAGE: activePatients.filter(p => p.admissionExam?.classification === 'NEEDS_TRIAGE'),
    ROUTINE: activePatients.filter(p => p.admissionExam?.classification === 'ROUTINE')
  };

  const renderColumn = (title: string, list: Patient[], colorClass: string) => (
    <div style={{ flex: 1, minWidth: '250px', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)' }}>
      <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid', borderBottomColor: colorClass }}>
        {title} ({list.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {list.map(p => (
          <div 
            key={p.id} 
            className="glass-card" 
            style={{ padding: '1rem', cursor: 'pointer', borderLeft: `4px solid ${colorClass}` }}
            onClick={() => onSelectPatient(p)}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.breed} • {p.weightKg} kg</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${p.category === 'NEONATAL_FOAL' ? 'badge-warning' : 'badge-info'}`}>
                {p.category.replace('_', ' ')}
              </span>
            </div>
            {p.admissionExam?.notes && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                "{p.admissionExam.notes.substring(0, 50)}..."
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>ICU Patient Board</h2>
      
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {renderColumn('Critical / ICU', grouped.CRITICAL, 'var(--status-critical)')}
        {renderColumn('Needs Triage', grouped.NEEDS_TRIAGE, 'var(--status-warning)')}
        {renderColumn('Stable', grouped.STABLE, 'var(--status-info)')}
        {renderColumn('Routine / Observ.', grouped.ROUTINE, 'var(--status-normal)')}
      </div>

      {dischargedPatients.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3>Recently Discharged</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {dischargedPatients.map(p => (
              <div key={p.id} className="glass-card" style={{ padding: '1rem', width: '250px', opacity: 0.7 }} onClick={() => onSelectPatient(p)}>
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Discharged</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
