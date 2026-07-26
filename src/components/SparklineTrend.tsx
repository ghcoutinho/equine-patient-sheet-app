

interface SparklineTrendProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function SparklineTrend({ 
  data, 
  color = 'var(--status-info)', 
  width = 60, 
  height = 20 
}: SparklineTrendProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  
  // Normalize data to fit in width/height
  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((val - min) / range) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
