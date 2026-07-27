import React from 'react';

/**
 * A trend line drawn from actual charted values.
 *
 * The bars this replaces were fixed-height divs — 40%, 45%, 60%, 75%, 100% —
 * that drew the same rising curve for every patient regardless of what had been
 * charted, next to a value with an invented fallback. A trend that does not
 * come from the chart is worse than no trend, so this renders nothing at all
 * when there is nothing to plot and says how many points it is drawing.
 */

export interface SparkPoint {
  /** Charted value. Points with no value break the line rather than interpolate. */
  value?: number;
  /** Column time, for the tooltip. */
  label?: string;
}

interface SparklineProps {
  points: SparkPoint[];
  /** Published interval; shaded as the normal band behind the line. */
  referenceMin?: number;
  referenceMax?: number;
  color?: string;
  height?: number;
  className?: string;
  /** Accessible description, e.g. "Heart rate over 6 rounds". */
  label: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  points,
  referenceMin,
  referenceMax,
  color = '#1D4ED8',
  height = 48,
  className = '',
  label,
}) => {
  const charted = points.filter((p) => Number.isFinite(p.value)) as Required<SparkPoint>[];

  if (charted.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-[#c4c5d7] bg-[#f8f9ff] ${className}`}
        style={{ height }}
      >
        <span className="font-derived-value text-[11px] text-[#747686]">
          Not charted yet
        </span>
      </div>
    );
  }

  const values = charted.map((p) => p.value);
  // Include the reference band in the scale so "inside normal" is visible.
  const scaleCandidates = [
    ...values,
    ...(Number.isFinite(referenceMin) ? [referenceMin as number] : []),
    ...(Number.isFinite(referenceMax) ? [referenceMax as number] : []),
  ];
  const rawMin = Math.min(...scaleCandidates);
  const rawMax = Math.max(...scaleCandidates);
  // A flat series would divide by zero; give it a band to sit in the middle of.
  const pad = rawMax === rawMin ? Math.max(1, Math.abs(rawMax) * 0.1) : (rawMax - rawMin) * 0.12;
  const min = rawMin - pad;
  const max = rawMax + pad;
  const span = max - min;

  const W = 100;
  const H = 100;
  const x = (i: number) =>
    charted.length === 1 ? W / 2 : (i / (charted.length - 1)) * W;
  const y = (v: number) => H - ((v - min) / span) * H;

  const path = charted.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');
  const area = `${path} L${x(charted.length - 1)},${H} L${x(0)},${H} Z`;

  const bandTop = Number.isFinite(referenceMax) ? y(referenceMax as number) : undefined;
  const bandBottom = Number.isFinite(referenceMin) ? y(referenceMin as number) : undefined;

  const last = charted[charted.length - 1];
  const first = charted[0];
  const direction =
    charted.length < 2 ? '' : last.value > first.value ? '↗' : last.value < first.value ? '↘' : '→';

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ height, width: '100%' }}
        className="rounded border border-[#E2E8F0] bg-[#f8f9ff] overflow-visible"
        role="img"
        aria-label={`${label}: ${values.join(', ')} ${direction}`}
      >
        {/* Reference band */}
        {bandTop !== undefined && bandBottom !== undefined && (
          <rect
            x="0"
            y={Math.min(bandTop, bandBottom)}
            width={W}
            height={Math.abs(bandBottom - bandTop)}
            fill="#047857"
            opacity="0.10"
          />
        )}

        <path d={area} fill={color} opacity="0.10" />
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {charted.map((p, i) => {
          const out =
            (Number.isFinite(referenceMax) && p.value > (referenceMax as number)) ||
            (Number.isFinite(referenceMin) && p.value < (referenceMin as number));
          return (
            <circle
              key={i}
              cx={x(i)}
              cy={y(p.value)}
              r={i === charted.length - 1 ? 3.5 : 2.5}
              fill={out ? '#B91C1C' : color}
              stroke="#fff"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            >
              <title>
                {p.label ? `${p.label}: ` : ''}
                {p.value}
              </title>
            </circle>
          );
        })}
      </svg>

      <div className="flex justify-between font-derived-value text-[10px] text-[#747686] mt-0.5">
        <span>
          {charted.length} point{charted.length === 1 ? '' : 's'}
          {points.length > charted.length ? ` of ${points.length} rounds` : ''}
        </span>
        <span>
          {first.label ? `${first.label} → ${last.label}` : ''} {direction}
        </span>
      </div>
    </div>
  );
};
