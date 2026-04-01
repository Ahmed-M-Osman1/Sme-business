'use client';

import {cn} from '@shory/ui';
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
  return (
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(businessTypes as BusinessType[]).map((bt) => {
          const isSelected = selectedId === bt.id;
          return (
            <button
              key={bt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(isSelected ? null : bt)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 whitespace-nowrap',
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text border-border hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {bt.icon} {bt.title}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-text-muted mt-2">
        Or describe your business below
      </p>
    </div>
  );
}
