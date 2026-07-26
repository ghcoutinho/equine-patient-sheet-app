import type { ManureRecord } from '../types';

/** Compact charting form for the flowsheet grid and exports. */
export function formatManure(m?: ManureRecord): string {
  if (!m) return '';
  if (!m.passed) return 'No';
  const detail = [m.amount, m.consistency].filter(Boolean).join(', ');
  return detail ? `Yes (${detail})` : 'Yes';
}
