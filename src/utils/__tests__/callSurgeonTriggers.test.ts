import { describe, it, expect } from 'vitest';
import type { FlowsheetColumn } from '../../types';
import { evaluateCallSurgeonTriggers } from '../callSurgeonTriggers';

/**
 * Call-surgeon triggers — first direct tests for this module. Scoped to the
 * behaviours added or changed in this pass (the 3-tier pyrexia trigger, the
 * NG-reflux removal suggestion, and the new lactate/temperature trend
 * triggers) rather than exhaustive coverage of every existing trigger.
 */

const column = (over: Partial<FlowsheetColumn> = {}): FlowsheetColumn => ({
  time: '08:00',
  vitals: {},
  gi: {},
  labs: {},
  ...over,
});

describe('pyrexia trigger', () => {
  it('does not fire below the mild tier', () => {
    const t = evaluateCallSurgeonTriggers(column({ vitals: { temperatureC: 38.0 } }));
    expect(t.find((x) => x.id === 'temp')).toBeUndefined();
  });

  it('fires as a watch-severity "Mild pyrexia" at the mild tier', () => {
    const t = evaluateCallSurgeonTriggers(column({ vitals: { temperatureC: 38.8 } }));
    const fired = t.find((x) => x.id === 'temp');
    expect(fired?.label).toBe('Mild pyrexia');
    expect(fired?.severity).toBe('watch');
  });

  it('fires as critical "High pyrexia" above the high tier', () => {
    const t = evaluateCallSurgeonTriggers(column({ vitals: { temperatureC: 39.6 } }));
    const fired = t.find((x) => x.id === 'temp');
    expect(fired?.label).toBe('High pyrexia');
    expect(fired?.severity).toBe('critical');
  });

  it('shifts tier when nsaidGivenRecently is true', () => {
    // 39.0°C: MILD un-adjusted (below the 39.2 significant tier), but the
    // NSAID-adjusted significant tier (39.2 - 0.3 = 38.9) is crossed.
    const withoutNsaid = evaluateCallSurgeonTriggers(
      column({ vitals: { temperatureC: 39.0 } }),
      undefined,
      undefined,
      false,
    );
    const withNsaid = evaluateCallSurgeonTriggers(
      column({ vitals: { temperatureC: 39.0 } }),
      undefined,
      undefined,
      true,
    );
    expect(withoutNsaid.find((x) => x.id === 'temp')?.label).toBe('Mild pyrexia');
    expect(withNsaid.find((x) => x.id === 'temp')?.label).toBe('Significant pyrexia');
  });
});

describe('NG-reflux removal suggestion', () => {
  it('fires only with a tube in place and two consecutive low checks', () => {
    const prev = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 1 } });
    const curr = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 0.5 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'reflux-removal')).toBeDefined();
  });

  it('does not fire if the tube is not charted as in place both times', () => {
    const prev = column({ gi: { nasogastricTube: 'Removed', refluxVolumeL: 1 } });
    const curr = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 0.5 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'reflux-removal')).toBeUndefined();
  });

  it('does not fire from a single low check with no previous round', () => {
    const curr = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 0.5 } });
    const t = evaluateCallSurgeonTriggers(curr);
    expect(t.find((x) => x.id === 'reflux-removal')).toBeUndefined();
  });

  it('does not fire, and the significant-reflux trigger fires instead, when the current check is above threshold', () => {
    const prev = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 0.5 } });
    const curr = column({ gi: { nasogastricTube: 'In place', refluxVolumeL: 3 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'reflux-removal')).toBeUndefined();
    expect(t.find((x) => x.id === 'reflux')).toBeDefined();
  });
});

describe('lactate-rising trigger', () => {
  it('fires when lactate climbs past the dead-band', () => {
    const prev = column({ labs: { lactate: 2.0 } });
    const curr = column({ labs: { lactate: 4.0 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'lactate-rising')).toBeDefined();
  });

  it('does not fire when lactate is falling', () => {
    const prev = column({ labs: { lactate: 4.0 } });
    const curr = column({ labs: { lactate: 2.0 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'lactate-rising')).toBeUndefined();
  });
});

describe('peritoneal cytology triggers', () => {
  it('fires critical when intracellular bacteria are present', () => {
    const t = evaluateCallSurgeonTriggers(column({ gi: { peritonealBacteria: 'Present' } }));
    const fired = t.find((x) => x.id === 'peritoneal-bacteria');
    expect(fired?.severity).toBe('critical');
  });

  it('does not fire when bacteria are absent', () => {
    const t = evaluateCallSurgeonTriggers(column({ gi: { peritonealBacteria: 'Absent' } }));
    expect(t.find((x) => x.id === 'peritoneal-bacteria')).toBeUndefined();
  });

  it('fires critical on fetid peritoneal odor', () => {
    const t = evaluateCallSurgeonTriggers(column({ gi: { peritonealOdor: 'Fetid / foul' } }));
    expect(t.find((x) => x.id === 'peritoneal-odor')?.severity).toBe('critical');
  });

  it('does not fire on normal peritoneal odor', () => {
    const t = evaluateCallSurgeonTriggers(column({ gi: { peritonealOdor: 'Normal / no odor' } }));
    expect(t.find((x) => x.id === 'peritoneal-odor')).toBeUndefined();
  });

  it('fires critical from septic-range peritoneal cytology', () => {
    const t = evaluateCallSurgeonTriggers(
      column({ labs: { peritonealTcc: 60000 } }),
    );
    expect(t.find((x) => x.id === 'peritoneal-cytology')?.severity).toBe('critical');
  });

  it('fires warning from suspect-range total protein alone', () => {
    const t = evaluateCallSurgeonTriggers(
      column({ labs: { peritonealProtein: 3.5 } }),
    );
    expect(t.find((x) => x.id === 'peritoneal-cytology')?.severity).toBe('warning');
  });

  it('does not fire from cytology within normal ranges', () => {
    const t = evaluateCallSurgeonTriggers(
      column({ labs: { peritonealProtein: 2.0, peritonealTcc: 5000 } }),
    );
    expect(t.find((x) => x.id === 'peritoneal-cytology')).toBeUndefined();
  });
});

describe('temperature-rising trigger', () => {
  it('fires when temperature climbs past the dead-band into a tier', () => {
    const prev = column({ vitals: { temperatureC: 38.0 } });
    const curr = column({ vitals: { temperatureC: 38.8 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'temp-rising')).toBeDefined();
  });

  it('does not fire when the rise stays within normal range', () => {
    const prev = column({ vitals: { temperatureC: 37.5 } });
    const curr = column({ vitals: { temperatureC: 37.8 } });
    const t = evaluateCallSurgeonTriggers(curr, undefined, prev);
    expect(t.find((x) => x.id === 'temp-rising')).toBeUndefined();
  });
});
