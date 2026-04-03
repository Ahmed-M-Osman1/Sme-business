'use client';

import {Button} from '@shory/ui';
import {formatPrice, formatPriceWithCurrency} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

interface BundleChip {
  id: string;
  shortName: string;
  icon: string;
}

interface BundleCardProps {
  title: string;
  description: string;
  annualPrice: number;
  savings: number;
  chips: BundleChip[];
  ctaLabel: string;
  badgeLabel?: string;
  featured?: boolean;
  onSelect: () => void;
}

export function BundleCard({
  title,
  description,
  annualPrice,
  savings,
  chips,
  ctaLabel,
  badgeLabel = 'Most popular',
  featured = false,
  onSelect,
}: BundleCardProps) {
  const {t, locale} = useI18n();

  return (
    <div
      className={`relative rounded-[28px] border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        featured ? 'border-2 border-primary' : 'border-gray-200'
      }`}
    >
      {featured && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          {badgeLabel}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[70%]">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            {t.common.currency}
          </p>
          <p className={`text-3xl font-bold ${featured ? 'text-primary' : 'text-gray-900'}`}>
            {formatPrice(annualPrice)}
            {t.common.perYear}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
          >
            <span>{chip.icon}</span>
            <span>{chip.shortName}</span>
          </span>
        ))}
      </div>

      <Button
        onClick={onSelect}
        className={`mt-5 w-full rounded-2xl py-3 text-sm font-semibold ${
          featured
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
