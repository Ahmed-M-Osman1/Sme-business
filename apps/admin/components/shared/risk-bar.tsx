'use client';

interface RiskBarProps {
  score: number;
  size?: 'sm' | 'md';
}

function getRiskLevel(score: number) {
  if (score < 40) {
    return {label: 'LOW', color: 'bg-green-500', textColor: 'text-green-700'};
  }
  if (score < 70) {
    return {label: 'MED', color: 'bg-amber-500', textColor: 'text-amber-700'};
  }
  return {label: 'HIGH', color: 'bg-red-500', textColor: 'text-red-700'};
}

export function RiskBar({score, size = 'md'}: RiskBarProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const {label, color, textColor} = getRiskLevel(clamped);
  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${barHeight} rounded-full bg-gray-100 overflow-hidden`}>
        <div
          className={`${barHeight} rounded-full ${color} transition-all duration-300`}
          style={{width: `${clamped}%`}}
        />
      </div>
      <span className={`text-xs font-semibold ${textColor} whitespace-nowrap`}>
        {label} {clamped}
      </span>
    </div>
  );
}
