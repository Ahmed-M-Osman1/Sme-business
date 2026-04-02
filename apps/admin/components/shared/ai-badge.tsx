'use client';

interface AiBadgeProps {
  label: string;
}

export function AiBadge({label}: AiBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600">
      <span aria-hidden="true">✦</span>
      {label}
    </span>
  );
}
