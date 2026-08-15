import React, { useState, useEffect } from 'react';
import type { Patient } from '../../types';
import { fluidBalance } from '../../utils/fluidBalance';
import { INSENSIBLE_LOSS } from '../../data/colicThresholds';

interface FluidBalanceViewProps {
  patient: Patient;
}

const fmt = (ml: number) => `${Math.round(ml).toLocaleString()} mL`;

/**
 * Fluid balance — intake from running lines' structured rates (Track 2),
 * output from charted reflux plus insensible loss.
 *
 * Insensible loss is a ward convention, not a published figure, and it
 * cannot be measured at the bedside — it only ever exists as an estimate.
 * Output and balance render as ranges for that reason (rule 1): a single
 * confident number here would misrepresent how much of it is charted versus
 * assumed.
 */
export const FluidBalanceView: React.FC<FluidBalanceViewProps> = ({ patient }) => {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const balance = fluidBalance(patient, now);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 space-y-6 bg-[#F8FAFC]">
      <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-[#0E7490] text-white px-2.5 py-0.5 rounded font-label-caps text-xs">
            FLUID BALANCE
          </span>
          <span className="text-xs font-derived-value text-[#434655]">
            Current admission only
          </span>
        </div>
        <h1 className="font-display text-2xl text-[#0b1c30] mt-1">
          Intake, reflux and insensible loss
        </h1>
        <p className="font-body-md text-sm text-[#434655] mt-1">
          Patient: <span className="font-bold text-[#0037b0]">{patient.name}</span> ·{' '}
          {patient.weightKg} kg
        </p>
      </div>

      {!balance ? (
        <div className="bg-white p-6 rounded-lg border border-[#E2E8F0] shadow-sm">
          <p className="font-body-md text-sm text-[#434655]">
            {patient.weightKg > 0
              ? 'No admission start recorded for this patient — fluid balance needs a start time to measure elapsed hours against.'
              : 'No weight recorded for this patient — fluid balance needs a weight to scale insensible loss.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider">
                Intake
              </span>
              <p className="font-display text-2xl text-[#047857] mt-1">{fmt(balance.intakeMl)}</p>
              <p className="font-derived-value text-[11px] text-[#747686] mt-1">
                Over {balance.elapsedHours < 24
                  ? `${Math.round(balance.elapsedHours)} h`
                  : `${(balance.elapsedHours / 24).toFixed(1)} d`}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider">
                Output
              </span>
              <p className="font-display text-2xl text-[#C2410C] mt-1">
                {fmt(balance.outputMinMl)}–{fmt(balance.outputMaxMl)}
              </p>
              <p className="font-derived-value text-[11px] text-[#747686] mt-1">
                Reflux + insensible loss estimate
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm">
              <span className="font-label-caps text-[10px] text-[#434655] uppercase tracking-wider">
                Balance
              </span>
              <p
                className={`font-display text-2xl mt-1 ${
                  balance.balanceMaxMl < 0
                    ? 'text-[#B91C1C]'
                    : balance.balanceMinMl < 0
                      ? 'text-[#B45309]'
                      : 'text-[#0037b0]'
                }`}
              >
                {balance.balanceMinMl >= 0 ? '+' : ''}
                {fmt(balance.balanceMinMl)} to {balance.balanceMaxMl >= 0 ? '+' : ''}
                {fmt(balance.balanceMaxMl)}
              </p>
              <p className="font-derived-value text-[11px] text-[#747686] mt-1">
                Intake minus output range
              </p>
            </div>
          </div>

          {/* Intake breakdown */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
            <h2 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-2">
              Intake — {balance.intakeItems.length} item{balance.intakeItems.length === 1 ? '' : 's'}
            </h2>
            {balance.intakeItems.length === 0 ? (
              <p className="font-derived-value text-sm text-[#747686]">
                Nothing counted yet — no running line with a volume-based rate, and no plain-mL
                bolus recorded.
              </p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {balance.intakeItems.map((item, i) => (
                  <li key={i} className="py-1.5 flex justify-between items-center text-sm">
                    <span className="text-[#0b1c30]">
                      {item.label}
                      {item.detail && (
                        <span className="text-[#747686] font-derived-value text-xs ml-2">
                          {item.detail}
                        </span>
                      )}
                    </span>
                    <span className="font-clinical-value text-[#0b1c30]">{fmt(item.ml)}</span>
                  </li>
                ))}
              </ul>
            )}
            {balance.excludedIntake.length > 0 && (
              <div className="mt-3 p-3 bg-[#FFFBEB] border border-[#B45309]/30 rounded">
                <p className="font-label-caps text-[10px] text-[#B45309] uppercase tracking-wider mb-1">
                  Not counted — {balance.excludedIntake.length} line
                  {balance.excludedIntake.length === 1 ? '' : 's'}
                </p>
                <ul className="space-y-0.5">
                  {balance.excludedIntake.map((e, i) => (
                    <li key={i} className="font-derived-value text-xs text-[#434655]">
                      <span className="font-bold">{e.drug}</span> — {e.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Output breakdown */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-4">
            <h2 className="font-label-caps text-xs text-[#434655] uppercase tracking-wider mb-2">
              Output
            </h2>
            <ul className="divide-y divide-[#E2E8F0]">
              <li className="py-1.5 flex justify-between items-center text-sm">
                <span className="text-[#0b1c30]">Nasogastric reflux, charted</span>
                <span className="font-clinical-value text-[#0b1c30]">
                  {fmt(balance.refluxOutputMl)}
                </span>
              </li>
              <li className="py-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#0b1c30]">Insensible loss, estimated</span>
                  <span className="font-clinical-value text-[#0b1c30]">
                    {fmt(balance.insensibleLossMinMl)}–{fmt(balance.insensibleLossMaxMl)}
                  </span>
                </div>
                <p className="font-derived-value text-[11px] text-[#B45309] mt-1">
                  {INSENSIBLE_LOSS.minMlPerKgPerDay}–{INSENSIBLE_LOSS.maxMlPerKgPerDay} mL/kg/day —{' '}
                  {INSENSIBLE_LOSS.source} Cannot be measured at the bedside; this range is the
                  entire reason output and balance render as ranges rather than one number.
                </p>
              </li>
            </ul>
          </div>

          <p className="font-derived-value text-[11px] text-[#747686] text-center">
            Decision support only. Reflux is summed from every round charted in this admission;
            intake is derived from running lines' rate × elapsed time and plain-volume boluses —
            never from a value nobody charted.
          </p>
        </>
      )}
    </div>
  );
};
