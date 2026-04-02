'use client';

type TagVariant = 'success' | 'danger' | 'warning' | 'info' | 'purple';

interface TagProps {
  label: string;
  variant: TagVariant;
}

const VARIANT_CLASSES: Record<TagVariant, string> = {
  success: 'bg-green-50 text-green-700 border-green-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function Tag({label, variant}: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
