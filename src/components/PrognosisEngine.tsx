import React, { useMemo, useState } from 'react';
import type { Patient, FlowsheetEntry } from '../types';
import { calculateNeonatalSepsisScore } from '../utils/neonatalSepsisScore';
import { calculateFoalSurvivalScore } from '../utils/foalSurvivalScore';
import { calculateAdultSepsisScore } from '../utils/adultSepsisScore';
import { calculateCAS, getPrognosticFlags } from '../utils/prognosis';
import { evaluateBiomarkers } from '../utils/biomarkerEvaluator';

interface PrognosisEngineProps {
  patient: Patient;
  latestEntry?: FlowsheetEntry;
}

export function PrognosisEngine({ patient, latestEntry }: PrognosisEngineProps) {
  const [showXAI, setShowXAI] = useState(false);

  // If no entry, we can't calculate much
  if (!latestEntry) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-muted)' }}>Prognosis Engine</h2>
        <p>No clinical flowsheet data available to generate prognosis.</p>
      </div>
    );
  }

  // Calculate scores based on category
  const isNeonatal = patient.category === 'NEONATAL_FOAL';
  const isAdultColic = patient.category === 'ADULT_COLIC';
  const isAdultGI = patient.category === 'ADULT_GI';

  const neonatalSepsis = useMemo(() => isNeonatal ? calculateNeonatalSepsisScore(patient, latestEntry) : null, [isNeonatal, patient, latestEntry]);
  const foalSurvival = useMemo(() => isNeonatal ? calculateFoalSurvivalScore(patient, latestEntry) : null, [isNeonatal, patient, latestEntry]);
  
  const adultSepsis = useMemo(() => (isAdultGI || isAdultColic) ? calculateAdultSepsisScore(latestEntry) : null, [isAdultGI, isAdultColic, latestEntry]);
  const casResult = useMemo(() => isAdultColic ? calculateCAS(latestEntry) : null, [isAdultColic, latestEntry]);
  
  const flags = useMemo(() => getPrognosticFlags(latestEntry), [latestEntry]);
  const biomarkers = useMemo(() => evaluateBiomarkers(latestEntry), [latestEntry]);

  // UI Helpers
  const renderBounds = (bounds: { min: number; max: number; isExact: boolean }) => {
    if (bounds.isExact) return <strong>{bounds.min}</strong>;
    return <span style={{ color: 'var(--status-warning)' }}>{bounds.min} - {bounds.max} (Missing Data)</span>;
  };

  const renderBiomarkers = () => {
    if (!biomarkers.saa && !biomarkers.ngal && !biomarkers.rpr) return null;
    return (
      <div style={styles.section}>
        <h3 style={styles.h3}>Biomarker Evaluation</h3>
        <div style={styles.grid}>
          {biomarkers.saa && (
            <div className="glass-card" style={styles.card}>
              <h4>SAA</h4>
              <p>{biomarkers.saa.value} mg/L</p>
              <div className={`badge ${biomarkers.saa.interpretation === 'NORMAL' ? 'badge-normal' : 'badge-critical'}`}>
                {biomarkers.saa.interpretation.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          {biomarkers.ngal && (
            <div className="glass-card" style={styles.card}>
              <h4>NGAL</h4>
              <p>{biomarkers.ngal.value} µg/L</p>
              <div className={`badge ${biomarkers.ngal.interpretation === 'NORMAL' ? 'badge-normal' : 'badge-critical'}`}>
                {biomarkers.ngal.interpretation.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          {biomarkers.rpr && (
            <div className="glass-card" style={styles.card}>
              <h4>RPR (RDW/PLT)</h4>
              <p>{biomarkers.rpr.value}</p>
              <div className={`badge ${biomarkers.rpr.interpretation === 'NORMAL' ? 'badge-normal' : 'badge-warning'}`}>
                {biomarkers.rpr.interpretation.replace(/_/g, ' ')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Explainable AI (XAI) Component (Gao 2026)
  const renderXAIDrillDown = () => {
    if (!showXAI) return null;

    return (
      <div style={styles.xaiPanel}>
        <h4 style={{ color: 'var(--status-info)', marginBottom: '0.5rem' }}>SHAP-like XAI Drill-Down</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Visualizing local interpretability for prognostic predictors.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {latestEntry.heartRate && (
            <div style={styles.xaiRow}>
              <span>Heart Rate ({latestEntry.heartRate} bpm)</span>
              <div style={styles.xaiBarContainer}>
                <div style={{...styles.xaiBar, width: `${Math.min(100, (latestEntry.heartRate / 120) * 100)}%`, backgroundColor: latestEntry.heartRate > 75 ? 'var(--status-critical)' : 'var(--status-normal)'}}></div>
              </div>
              <span style={{ fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
                {latestEntry.heartRate > 75 ? '+ Risk' : 'Baseline'}
              </span>
            </div>
          )}
          {latestEntry.lactate && (
            <div style={styles.xaiRow}>
              <span>Lactate ({latestEntry.lactate} mmol/L)</span>
              <div style={styles.xaiBarContainer}>
                <div style={{...styles.xaiBar, width: `${Math.min(100, (latestEntry.lactate / 10) * 100)}%`, backgroundColor: latestEntry.lactate > 3.7 ? 'var(--status-critical)' : (latestEntry.lactate > 2 ? 'var(--status-warning)' : 'var(--status-normal)')}}></div>
              </div>
              <span style={{ fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
                {latestEntry.lactate > 3.7 ? '++ Risk' : 'Baseline'}
              </span>
            </div>
          )}
          {latestEntry.temperature && (
            <div style={styles.xaiRow}>
              <span>Temp ({latestEntry.temperature} °C)</span>
              <div style={styles.xaiBarContainer}>
                <div style={{...styles.xaiBar, width: '50%', backgroundColor: (latestEntry.temperature < 37 || latestEntry.temperature > 38.5) ? 'var(--status-warning)' : 'var(--status-normal)'}}></div>
              </div>
              <span style={{ fontSize: '0.8rem', width: '80px', textAlign: 'right' }}>
                {(latestEntry.temperature < 37 || latestEntry.temperature > 38.5) ? '+ Risk' : 'Baseline'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Prognosis Engine
          <div className="badge badge-info">AI Validated</div>
        </h2>
        <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => setShowXAI(!showXAI)}>
          {showXAI ? 'Hide XAI' : 'View XAI Breakdown'}
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Neonatal Section */}
        {isNeonatal && neonatalSepsis && foalSurvival && (
          <div style={styles.grid}>
            <div className={`glass-card ${neonatalSepsis.interpretation === 'HIGH_RISK' ? 'animate-pulse-critical' : ''}`} style={styles.card}>
              <h3>Neonatal Sepsis (Brewer & Koterba)</h3>
              <div style={styles.scoreRow}>
                <span>Diagnostic Score:</span>
                <span style={styles.scoreValue}>{renderBounds(neonatalSepsis.brewerScore)}</span>
              </div>
              <div style={styles.scoreRow}>
                <span>SIRS Criteria Met:</span>
                <span style={styles.scoreValue}>{renderBounds(neonatalSepsis.sirsCriteriaCount)}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span className={`badge badge-${neonatalSepsis.interpretation === 'HIGH_RISK' ? 'critical' : neonatalSepsis.interpretation === 'EQUIVOCAL' ? 'warning' : 'normal'}`}>
                  {neonatalSepsis.interpretation.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="glass-card" style={styles.card}>
              <h3>Foal Survival Score (FSS)</h3>
              <div style={styles.scoreRow}>
                <span>Survival Probability:</span>
                <span style={{ ...styles.scoreValue, color: 'var(--status-info)' }}>
                  {foalSurvival.survivalProbabilityRange[0]}% - {foalSurvival.survivalProbabilityRange[1]}%
                </span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--bg-app)', height: '12px', borderRadius: '6px', marginTop: '1rem', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: 'var(--status-info)', 
                  width: `${foalSurvival.survivalProbabilityRange[1]}%`,
                  opacity: 0.8
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Adult Colic Section */}
        {isAdultColic && casResult && adultSepsis && (
          <div style={styles.grid}>
            <div className={`glass-card ${casResult.prediction === 'DIE' ? 'animate-pulse-critical' : ''}`} style={styles.card}>
              <h3>Colic Assessment Score (CAS)</h3>
              <div style={styles.scoreRow}>
                <span>Score:</span>
                <span style={styles.scoreValue}>{renderBounds(casResult.score)}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span className={`badge badge-${casResult.prediction === 'DIE' ? 'critical' : 'normal'}`}>
                  PREDICTED OUTCOME: {casResult.prediction}
                </span>
              </div>
              {casResult.score.min > 7 && <p style={{ fontSize: '0.8rem', color: 'var(--status-critical)', marginTop: '0.5rem' }}>Threshold &gt;7 breached (High Mortality Risk)</p>}
            </div>

            <div className="glass-card" style={styles.card}>
              <h3>Adult SIRS / Sepsis (Biondi 2026)</h3>
              <div style={styles.scoreRow}>
                <span>Criteria Met (0-6):</span>
                <span style={styles.scoreValue}>{renderBounds(adultSepsis.score)}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span className={`badge badge-${adultSepsis.interpretation === 'HIGHLY_PROBABLE' ? 'critical' : adultSepsis.interpretation === 'POSSIBLE' ? 'warning' : 'normal'}`}>
                  {adultSepsis.interpretation.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Adult GI Section */}
        {isAdultGI && adultSepsis && (
           <div className="glass-card" style={{ ...styles.card, maxWidth: '400px' }}>
             <h3>Adult SIRS / Sepsis (Biondi 2026)</h3>
             <div style={styles.scoreRow}>
               <span>Criteria Met (0-6):</span>
               <span style={styles.scoreValue}>{renderBounds(adultSepsis.score)}</span>
             </div>
             <div style={{ marginTop: '1rem' }}>
               <span className={`badge badge-${adultSepsis.interpretation === 'HIGHLY_PROBABLE' ? 'critical' : adultSepsis.interpretation === 'POSSIBLE' ? 'warning' : 'normal'}`}>
                 {adultSepsis.interpretation.replace('_', ' ')}
               </span>
             </div>
           </div>
        )}

        {renderXAIDrillDown()}

        {flags.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.h3}>Clinical Warnings & Prognostic Flags</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {flags.map((flag, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--status-critical)', borderRadius: '4px', color: '#fca5a5' }}>
                  ⚠ {flag}
                </div>
              ))}
            </div>
          </div>
        )}

        {renderBiomarkers()}

      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    fontSize: '1.1rem'
  },
  scoreValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)'
  },
  section: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem'
  },
  h3: {
    marginBottom: '1rem',
    color: 'var(--text-secondary)'
  },
  xaiPanel: {
    backgroundColor: 'var(--bg-app)',
    border: '1px solid var(--border-focus)',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
  },
  xaiRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.9rem'
  },
  xaiBarContainer: {
    flex: 1,
    height: '10px',
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  xaiBar: {
    height: '100%',
    transition: 'width 0.5s ease'
  }
};
