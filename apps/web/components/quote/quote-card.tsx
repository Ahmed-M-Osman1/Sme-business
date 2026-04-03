'use client';

import {useState, useRef, useEffect} from 'react';
import {Button, Badge} from '@shory/ui';
import {
  formatPriceWithCurrency,
} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

interface QuoteCardProps {
  insurer: {
    id: string;
    name: string;
    logo: string;
    rating: number;
    reviewCount: number;
    shariahCompliant: boolean;
    total: number;
  };
  coverageType: string;
  benefits: {name: string; included: boolean}[];
  productLines?: {name: string; icon: string; limit: string; price: number; mandatory?: boolean}[];
  isBestPrice: boolean;
  isRecommended?: boolean;
  businessCategory?: string;
  isSelected?: boolean;
  monthly?: boolean;
  onSelect: () => void;
  onProceed?: () => void;
}

export function QuoteCard({
  insurer,
  coverageType,
  benefits,
  productLines,
  isBestPrice,
  isRecommended = false,
  businessCategory,
  isSelected = false,
  monthly = false,
  onSelect,
}: QuoteCardProps) {
  const {t, locale} = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const [detailHeight, setDetailHeight] = useState(0);

  useEffect(() => {
    if (detailRef.current) {
      setDetailHeight(detailRef.current.scrollHeight);
    }
  }, [expanded, benefits]);

  const initials = insurer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const INITIALS_COLORS = [
    'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600',
    'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600',
  ];
  const colorIndex =
    insurer.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    INITIALS_COLORS.length;
  const initialsColor = INITIALS_COLORS[colorIndex];

  const includedBenefits = benefits.filter((b) => b.included);

  return (
    <div
      className={`rounded-2xl border bg-white transition-all duration-300 ${
        isSelected
          ? 'border-2 border-primary ring-2 ring-primary/20 shadow-lg'
          : isRecommended
            ? 'border-2 border-emerald-500 shadow-sm'
            : isBestPrice
              ? 'border-2 border-emerald-500 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Badges row */}
      {(isBestPrice || isRecommended || insurer.shariahCompliant) && (
        <div className="flex items-center gap-2 px-5 pt-4 flex-wrap">
          {isRecommended && businessCategory && (
            <Badge className="bg-emerald-600 text-white text-xs font-semibold gap-1 shadow-sm">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L7.545 4.15L11 4.66L8.5 7.1L9.09 10.54L6 8.92L2.91 10.54L3.5 7.1L1 4.66L4.455 4.15L6 1Z"
                  fill="currentColor"
                />
              </svg>
              Best for {businessCategory}
            </Badge>
          )}
          {isBestPrice && !isRecommended && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 1L7.545 4.15L11 4.66L8.5 7.1L9.09 10.54L6 8.92L2.91 10.54L3.5 7.1L1 4.66L4.455 4.15L6 1Z"
                  fill="currentColor"
                />
              </svg>
              {t.results.bestPrice}
            </Badge>
          )}
          {insurer.shariahCompliant && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-medium">
              {t.results.shariahCompliant}
            </Badge>
          )}
        </div>
      )}

      {/* Summary row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-start px-5 py-4 flex items-center gap-3"
      >
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
          {!logoError && insurer.logo ? (
            <img
              src={insurer.logo}
              alt={insurer.name}
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className={`w-full h-full rounded-lg ${initialsColor} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">
            {(t.insurers as Record<string, string>)[insurer.id.toLowerCase()] || insurer.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{coverageType}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-yellow-400 text-xs">
              {'★'.repeat(Math.round(insurer.rating))}
              {'☆'.repeat(5 - Math.round(insurer.rating))}
            </span>
            <span className="text-[11px] text-gray-400">
              {insurer.rating} ({insurer.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="text-end shrink-0">
          <p className="text-xl font-bold text-gray-900">
            {monthly
              ? formatPriceWithCurrency(Math.round(insurer.total * 1.08 / 12), t.common.currency, locale)
              : formatPriceWithCurrency(insurer.total, t.common.currency, locale)}
          </p>
          <p className="text-[11px] text-gray-400">{monthly ? t.common.perMonth : (locale === 'ar' ? '/سنوياً' : '/yr')}</p>
        </div>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable detail section — animated */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{maxHeight: expanded ? `${detailHeight + 40}px` : '0px', opacity: expanded ? 1 : 0}}
      >
        <div ref={detailRef} className="px-5 pb-5">
          <div className="border-t border-gray-100 pt-4">
            {/* Product line items */}
            {productLines && productLines.length > 0 ? (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.results.whatsIncluded}
                </p>
                <div className="space-y-2">
                  {productLines.map((line) => (
                    <div key={line.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{line.icon}</span>
                        <span className="text-gray-700 truncate">{line.name}</span>
                        {line.mandatory && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 uppercase shrink-0">
                            {locale === 'ar' ? 'مطلوب' : 'Required'}
                          </span>
                        )}
                      </div>
                      <div className="text-end shrink-0 ms-3">
                        <span className="text-xs text-gray-400">{line.limit}</span>
                        <span className="ms-2 text-sm font-semibold text-gray-900">
                          {formatPriceWithCurrency(
                            monthly ? Math.round(line.price * 1.08 / 12) : line.price,
                            t.common.currency,
                            locale,
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-900">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                    <span className="text-primary">
                      {formatPriceWithCurrency(
                        monthly ? Math.round(insurer.total * 1.08 / 12) : insurer.total,
                        t.common.currency,
                        locale,
                      )}
                      <span className="text-[11px] font-normal text-gray-400 ms-1">
                        {monthly ? t.common.perMonth : (locale === 'ar' ? '/سنوياً' : '/yr')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t.results.whatsIncluded}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {includedBenefits.map((benefit) => (
                    <div key={benefit.name} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary shrink-0">
                        <path d="M3.333 8L6.667 11.333L12.667 4.667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {benefit.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment note */}
            <p className="text-[11px] text-gray-500 mb-4">
              {t.results.finwallPrefix}{' '}
              <span className="font-semibold">{t.results.finwallBrand}</span>
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className={`rounded-xl text-sm px-6 ${
                  isSelected
                    ? 'bg-primary/10 text-primary border-2 border-primary hover:bg-primary/20'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isSelected ? t.results.selected : t.common.select}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
