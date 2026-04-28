'use client';

import {formatPriceWithCurrency} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

interface BundleChip {
  id: string;
  shortName: string;
  icon: string;
}

interface TammBundleCardProps {
  title: string;
  description: string;
  annualPrice: number;
  savings: number;
  chips: BundleChip[];
  ctaLabel: string;
  badgeLabel?: string;
  featured?: boolean;
  monthly?: boolean;
  onSelect: () => void;
}

export function TammBundleCard({
  title,
  description,
  annualPrice,
  savings,
  chips,
  ctaLabel,
  badgeLabel,
  featured = false,
  monthly = false,
  onSelect,
}: TammBundleCardProps) {
  const {t, locale} = useI18n();
  const bc = t.tamm.bundleCard;

  const badge = badgeLabel ?? t.results.mostPopular;

  const displayPrice = monthly
    ? Math.round((annualPrice * 1.08) / 12)
    : annualPrice;

  const savingsLabel = bc.saveVsIndividual.replace('{amount}', savings.toLocaleString());

  return (
    <div
      className="relative bg-white rounded-xl overflow-hidden transition-all"
      style={{
        border: featured ? '1.5px solid #169F9F' : '1px solid #E2E8F0',
        boxShadow: featured
          ? '0 2px 12px rgba(22, 159, 159, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}>

      {featured && (
        <div
          className="absolute top-3 inset-e-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{background: '#169F9F', color: 'white', letterSpacing: '0.03em'}}>
          {badge}
        </div>
      )}

      <div className="p-5">
        <div className="pe-14">
          <h3 className="text-sm font-bold text-[#12121B] leading-snug">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{description}</p>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-0.5">
          <span className="text-xs text-[#64748B] self-end mb-0.5">{t.common.currency}</span>
          <span className="text-2xl font-bold text-[#12121B] tracking-tight">
            {formatPriceWithCurrency(displayPrice, '', locale).trim()}
          </span>
          <span className="text-xs text-[#94A3B8] ms-1 self-end mb-0.5">
            {monthly ? t.common.perMonth : t.common.perYear}
          </span>
        </div>

        {savings > 0 && (
          <p className="mt-1 text-[10px] font-medium" style={{color: '#169F9F'}}>
            {savingsLabel}
          </p>
        )}

        {/* Product chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{
                background: featured ? '#E8F7F7' : '#F8FAFB',
                color: featured ? '#169F9F' : '#475569',
                border: featured ? '1px solid #B2E4E4' : '1px solid #E2E8F0',
              }}>
              <span>{chip.icon}</span>
              <span>{chip.shortName}</span>
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4" style={{borderTop: '1px solid #F1F5F9'}}>
          <button
            onClick={onSelect}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: featured ? '#169F9F' : '#F1F5F9',
              color: featured ? 'white' : '#12121B',
            }}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
