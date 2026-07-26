
import { ACADEMIC_REFERENCES, exportToRIS } from '../data/academicReferences';

export function LiteratureView() {
  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Read me presentation */}
      <section className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--status-info)' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--status-info)' }}>About This Application</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-primary)', fontStyle: 'italic' }}>
          "As an equine surgeon, I built this application to mirror my own clinical thought process when evaluating a horse in pain. It bridges the gap between bedside clinical intuition and the most advanced prognostic algorithms available today, translating standard clinical and laboratory data into real-time, actionable insights."
        </p>
        <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>— Dr. Gustavo Henrique Coutinho</p>
      </section>

      {/* Bibliography Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0 }}>Academic References & Bibliography</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Formatted in Vancouver style. All underlying thresholds, algorithms, and formulary data are derived from these sources.
          </p>
        </div>
        <button className="btn btn-primary" onClick={exportToRIS} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export to .RIS
        </button>
      </div>

      {/* References List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ACADEMIC_REFERENCES.map((ref, index) => (
          <div key={ref.id} className="glass-card" style={{ padding: '1.5rem' }}>
            {/* Vancouver Format */}
            <div style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{index + 1}.</span>
              {ref.authors} {ref.title}. <span style={{ fontStyle: 'italic' }}>{ref.journal}</span>. {ref.year}{ref.volumeInfo ? `;${ref.volumeInfo}` : ''}.
              {ref.doi && (
                <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noreferrer" style={{ color: 'var(--status-info)', marginLeft: '0.5rem', textDecoration: 'none' }}>
                  doi:{ref.doi}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
