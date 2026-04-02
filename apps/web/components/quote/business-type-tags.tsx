'use client';

import {cn} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import businessTypes from '@/config/business-types.json';

interface BusinessType {
  id: string;
  title: string;
  icon: string;
}

interface BusinessTypeTagsProps {
  selectedId: string | null;
  onSelect: (bt: BusinessType | null) => void;
  disabled?: boolean;
}

export function BusinessTypeTags({
  selectedId,
  onSelect,
  disabled = false,
}: BusinessTypeTagsProps) {
  const {t} = useI18n();
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(businessTypes as BusinessType[]).map((bt) => {
          const isSelected = selectedId === bt.id;
          const label = (t.businessType as Record<string, string>)[bt.id] ?? bt.title;
          return (
            <button
              key={bt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(isSelected ? null : {...bt, title: label})}
              aria-label={label}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 whitespace-nowrap',
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text border-border hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {bt.icon} {label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-text-muted mt-2">
        {t.ai.orDescribeBelow}
      </p>
    </div>
  );
}
