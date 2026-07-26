import type { ScoreBounds } from '../types';

export function calculateScoreBounds(
  items: Array<{ value: number | undefined; min: number; max: number }>
): ScoreBounds {
  let minScore = 0;
  let maxScore = 0;
  let isExact = true;

  for (const item of items) {
    if (item.value !== undefined) {
      minScore += item.value;
      maxScore += item.value;
    } else {
      minScore += item.min;
      maxScore += item.max;
      isExact = false;
    }
  }

  return {
    min: minScore,
    max: maxScore,
    isExact,
  };
}
