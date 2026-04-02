'use client';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}

export function KpiCard({label, value, sub, color = 'text-slate-900', icon}: KpiCardProps) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4">
      {icon && (
        <span className="absolute top-4 end-4 text-lg opacity-60" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
