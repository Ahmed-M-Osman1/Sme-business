'use client';

import {useState} from 'react';
import {formatPriceWithCurrency} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';

interface TammQuoteCardProps {
  insurer: {
    id: string;
    name: string;
    logo: string;
    rating: number;
    shariahCompliant: boolean;
    total: number;
  };
  coverageType: string;
  benefits: {name: string; included: boolean}[];
  productLines?: {
    name: string;
    icon: string;
    limit: string;
    price: number;
    mandatory?: boolean;
  }[];
  isBestPrice: boolean;
  isRecommended?: boolean;
  monthly?: boolean;
  onSelect: () => void;
}

const DEFAULT_VISIBLE_BENEFITS = 3;

function TealDot() {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
      style={{background: '#169F9F'}}
    />
  );
}

export function TammQuoteCard({
  insurer,
  coverageType,
  benefits,
  productLines,
  isBestPrice,
  isRecommended = false,
  monthly = false,
  onSelect,
}: TammQuoteCardProps) {
  const {t, locale} = useI18n();
  const qc = t.tamm.quoteCard;
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const hasProductLines = !!productLines && productLines.length > 0;
  const productLineNames = new Set(productLines?.map((line) => line.name) ?? []);
  const includedBenefits = benefits
    .filter((b) => b.included)
    .filter((b) => !productLineNames.has(b.name));
  const visibleBenefits = hasProductLines
    ? []
    : showAllBenefits
      ? includedBenefits
      : includedBenefits.slice(0, DEFAULT_VISIBLE_BENEFITS);

  const initials = insurer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const displayPrice = monthly
    ? Math.round((insurer.total * 1.08) / 12)
    : insurer.total;

  const isHighlighted = isBestPrice || isRecommended;

  return (
    <div
      className="bg-white rounded-xl transition-all relative overflow-hidden"
      style={{
        border: isHighlighted ? '1.5px solid #169F9F' : '1px solid #E2E8F0',
        boxShadow: isHighlighted
          ? '0 2px 12px rgba(22, 159, 159, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.06)',
      }}>

      {/* BEST badge */}
      {isBestPrice && (
        <div
          className="absolute top-3 inset-e-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{background: '#169F9F', color: 'white', letterSpacing: '0.03em'}}>
          {qc.best}
        </div>
      )}
      {!isBestPrice && isRecommended && (
        <div
          className="absolute top-3 inset-e-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{background: '#E8F7F7', color: '#169F9F', border: '1px solid #169F9F'}}>
          {qc.recommended}
        </div>
      )}

      <div className="p-5">
        {/* Insurer header */}
        <div className="flex items-start gap-3 pe-12">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
            style={{border: '1px solid #E2E8F0', background: '#F8FAFB'}}>
            {!logoError && insurer.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={insurer.logo}
                alt={insurer.name}
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xs font-bold text-[#64748B]">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#12121B] leading-snug">{insurer.name}</p>
            <p className="text-xs text-[#94A3B8] mt-0.5">{coverageType}</p>
            {insurer.shariahCompliant && (
              <span
                className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{background: '#E8F7F7', color: '#169F9F'}}>
                {qc.shariahCompliant}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-0.5">
          <span className="text-xs text-[#64748B] self-end mb-0.5">{t.common.currency}</span>
          <span className="text-2xl font-bold text-[#12121B] tracking-tight">
            {formatPriceWithCurrency(displayPrice, '', locale).trim()}
          </span>
          {monthly && (
            <span className="text-xs text-[#94A3B8] ms-1 self-end mb-0.5">{t.common.perMonth}</span>
          )}
        </div>

        {/* Product lines */}
        {productLines && productLines.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {productLines.map((line) => (
              <div key={line.name} className="flex items-start gap-2 text-xs">
                <TealDot />
                <span className="text-[#475569] flex-1 leading-tight">{line.name}</span>
                {line.mandatory && (
                  <span
                    className="text-[#169F9F] font-medium shrink-0"
                    title={qc.requiredTooltip}>
                    {qc.required}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Benefits */}
        {visibleBenefits.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {visibleBenefits.map((benefit) => (
              <div key={benefit.name} className="flex items-start gap-2 text-xs">
                <TealDot />
                <span className="text-[#475569] leading-tight">{benefit.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* View all benefits */}
        {!hasProductLines && includedBenefits.length > DEFAULT_VISIBLE_BENEFITS && (
          <button
            type="button"
            onClick={() => setShowAllBenefits((p) => !p)}
            className="mt-2.5 text-xs font-medium transition-opacity hover:opacity-70"
            style={{color: '#169F9F'}}>
            {showAllBenefits
              ? qc.hideBenefits
              : `${qc.viewAllBenefits} (${includedBenefits.length})`}
          </button>
        )}

        {/* CTA */}
        <div className="mt-4 pt-4" style={{borderTop: '1px solid #F1F5F9'}}>
          <button
            onClick={onSelect}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: '#169F9F',
              color: 'white',
            }}>
            {qc.selectQuote}
          </button>
        </div>
      </div>
    </div>
  );
}
