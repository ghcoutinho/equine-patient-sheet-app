import type { FlowsheetEntry, ScoreBounds } from '../types';
import { calculateScoreBounds } from './missingDataHandler';

export interface AdultSirsResult {
  score: ScoreBounds;
  isPositive: boolean;
  mortalityRate: number; // 11.7% or 50%
}

export function calculateAdultSirs(entry: Partial<FlowsheetEntry>): AdultSirsResult {
  
  const tempItem = {
    value: entry.temperature !== undefined ? ((entry.temperature < 37.0 || entry.temperature > 38.5) ? 1 : 0) : undefined,
    min: 0,
    max: 1
  };
  
  const hrItem = {
    value: entry.heartRate !== undefined ? (entry.heartRate > 52 ? 1 : 0) : undefined,
    min: 0,
    max: 1
  };
  
  const rrItem = {
    value: entry.respiratoryRate !== undefined ? (entry.respiratoryRate > 20 ? 1 : 0) : undefined,
    min: 0,
    max: 1
  };
  
  const wbcItem = {
    value: entry.wbc !== undefined ? ((entry.wbc < 5000 || entry.wbc > 12500) ? 1 : 0) : undefined,
    min: 0,
    max: 1
  };

  const scoreBounds = calculateScoreBounds([tempItem, hrItem, rrItem, wbcItem]);
  
  const isPositive = scoreBounds.min >= 2;
  
  return {
    score: scoreBounds,
    isPositive,
    mortalityRate: isPositive ? 50.0 : 11.7
  };
}
