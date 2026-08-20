import { describe, it, expect } from 'vitest';
import { severityOf, severityOfAny } from '../clinicalAssessments';

/**
 * `severityOfAny` — the worst-of-selected read for multi-select findings
 * (rectal exam, FLASH ultrasound). A rectal exam that turns up two findings
 * at once should colour and trigger on the worse one, not whichever was
 * picked first or last.
 */

describe('severityOf', () => {
  it('is normal for an unrecorded value', () => {
    expect(severityOf('rectalExam', undefined)).toBe('normal');
  });

  it('reads the tagged severity for a known value', () => {
    expect(severityOf('rectalExam', 'Tight tensional bands')).toBe('critical');
  });
});

describe('severityOfAny', () => {
  it('is normal for an empty or absent selection', () => {
    expect(severityOfAny('rectalExam', undefined)).toBe('normal');
    expect(severityOfAny('rectalExam', [])).toBe('normal');
  });

  it('is the single value\'s severity for one selection', () => {
    expect(severityOfAny('rectalExam', ['Pelvic flexure impaction'])).toBe('warning');
  });

  it('is the worst of several selections, regardless of order', () => {
    const worseFirst = severityOfAny('rectalExam', [
      'Tight tensional bands',
      'Pelvic flexure impaction',
    ]);
    const worseLast = severityOfAny('rectalExam', [
      'Pelvic flexure impaction',
      'Tight tensional bands',
    ]);
    expect(worseFirst).toBe('critical');
    expect(worseLast).toBe('critical');
  });

  it('stays normal only when every selection is normal', () => {
    expect(severityOfAny('rectalExam', ['Normal / empty pelvic flexure'])).toBe('normal');
  });

  it('ignores an unrecognised value rather than crashing', () => {
    expect(severityOfAny('rectalExam', ['not a real option'])).toBe('normal');
  });
});
