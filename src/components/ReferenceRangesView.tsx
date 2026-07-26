import React, { useState } from 'react';
import { CORNELL_EQUINE_CHEMISTRY, CORNELL_EQUINE_HEMATOLOGY, CORNELL_EQUINE_BLOOD_GAS } from '../data/cornellReferenceRanges';
import { NEONATAL_REFERENCE_RANGES } from '../data/neonatalReferenceRanges';

export function ReferenceRangesView() {
  const [activeTab, setActiveTab] = useState<'ADULT' | 'NEONATAL'>('ADULT');

  const renderAdultRanges = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h3 style={styles.sectionTitle}>Hematology (Adult)</h3>
        <div style={styles.tableGrid}>
          {CORNELL_EQUINE_HEMATOLOGY.map((range: any) => (
            <div key={range.id || range.name} className="glass-card" style={styles.card}>
              <div style={styles.paramName}>{range.name}</div>
              <div style={styles.paramValue}>{range.referenceMin} - {range.referenceMax} <span style={styles.unit}>{range.units}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={styles.sectionTitle}>Chemistry (Adult)</h3>
        <div style={styles.tableGrid}>
          {CORNELL_EQUINE_CHEMISTRY.map((range: any) => (
            <div key={range.id || range.name} className="glass-card" style={styles.card}>
              <div style={styles.paramName}>{range.name}</div>
              <div style={styles.paramValue}>{range.referenceMin} - {range.referenceMax} <span style={styles.unit}>{range.units}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 style={styles.sectionTitle}>Blood Gas (Adult)</h3>
        <div style={styles.tableGrid}>
          {CORNELL_EQUINE_BLOOD_GAS.map((range: any) => (
            <div key={range.id || range.name} className="glass-card" style={styles.card}>
              <div style={styles.paramName}>{range.name}</div>
              <div style={styles.paramValue}>{range.referenceMin} - {range.referenceMax} <span style={styles.unit}>{range.units}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderNeonatalRanges = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {Object.entries(NEONATAL_REFERENCE_RANGES).map(([category, ranges]) => (
        <section key={category}>
          <h3 style={{ ...styles.sectionTitle, textTransform: 'capitalize' }}>{category} (Neonatal)</h3>
          <div style={styles.tableGrid}>
            {ranges.map(range => (
              <div key={range.parameter} className="glass-card" style={styles.card}>
                <div style={styles.paramName}>{range.parameter}</div>
                <div style={styles.paramValue}>{range.min} - {range.max} <span style={styles.unit}>{range.unit}</span></div>
                {range.notes && (
                  <div style={styles.notes}>{range.notes}</div>
                )}
                {(range.isAbnormalHighSIRS || range.isAbnormalLowSIRS) && (
                  <div style={{ marginTop: '0.5rem' }} className="badge badge-warning">SIRS Criteria Factor</div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Physiological Reference Ranges</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'ADULT' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ADULT')}
          >
            Adult Ranges
          </button>
          <button 
            className={`btn ${activeTab === 'NEONATAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('NEONATAL')}
          >
            Neonatal Ranges
          </button>
        </div>
      </div>

      {activeTab === 'ADULT' ? renderAdultRanges() : renderNeonatalRanges()}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    color: 'var(--status-info)',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem'
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem'
  },
  card: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  paramName: {
    fontWeight: 'bold',
    color: 'var(--text-secondary)'
  },
  paramValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    marginTop: '0.5rem'
  },
  unit: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  notes: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.75rem',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '0.5rem'
  }
};
