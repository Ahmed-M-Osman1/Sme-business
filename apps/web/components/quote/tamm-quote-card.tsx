'use client';

import {useState} from 'react';
import {Button} from '@shory/ui';
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

const DEFAULT_VISIBLE_BENEFITS = 4;

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
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const includedBenefits = benefits.filter((b) => b.included);
  const visibleBenefits = showAllBenefits
    ? includedBenefits
    : includedBenefits.slice(0, DEFAULT_VISIBLE_BENEFITS);
  const hasMoreBenefits = includedBenefits.length > DEFAULT_VISIBLE_BENEFITS;

  const initials = insurer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const displayPrice = monthly
    ? Math.round((insurer.total * 1.08) / 12)
    : insurer.total;

  return (
    <div className="bg-white border border-[#DEE2E6] rounded-lg p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {!logoError && insurer.logo ? (
            <img
              src={insurer.logo}
              alt={insurer.name}
              className="w-full h-full object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-xs font-bold text-gray-500">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-gray-900">{insurer.name}</p>
          <p className="text-sm text-muted-foreground">{coverageType}</p>
        </div>
      </div>

      {/* Badges */}
      {(isBestPrice || isRecommended || insurer.shariahCompliant) && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {isBestPrice && (
            <span className="bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs font-medium">
              Best Price
            </span>
          )}
          {isRecommended && (
            <span className="bg-[#E8F1F8] text-[#005C9E] rounded px-2 py-0.5 text-xs font-medium">
              Recommended
            </span>
          )}
          {insurer.shariahCompliant && (
            <span className="bg-[#E8F7F0] text-[#1D7A4E] rounded px-2 py-0.5 text-xs font-medium">
              Shariah Compliant
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-sm text-muted-foreground">
          {t.common.currency}
        </span>
        <span className="text-2xl font-bold text-gray-900">
          {formatPriceWithCurrency(displayPrice, '', locale).trim()}
        </span>
      </div>

      {/* Product lines */}
      {productLines && productLines.length > 0 && (
        <div className="mt-4 space-y-2">
          {productLines.map((line) => (
            <div key={line.name} className="flex items-center gap-2 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0">
                <circle cx="8" cy="8" r="8" fill="#1D7A4E" />
                <path
                  d="M4.5 8L7 10.5L11.5 5.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-gray-700">{line.name}</span>
              <span className="text-muted-foreground ms-auto">{line.limit}</span>
            </div>
          ))}
        </div>
      )}

      {/* Benefits */}
      {visibleBenefits.length > 0 && (
        <div className="mt-4 space-y-2">
          {visibleBenefits.map((benefit) => (
            <div
              key={benefit.name}
              className="flex items-center gap-2 text-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="shrink-0 text-[#1D7A4E]">
                <path
                  d="M3 7L6 10L11 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-gray-700">{benefit.name}</span>
            </div>
          ))}
          {hasMoreBenefits && (
            <button
              type="button"
              onClick={() => setShowAllBenefits((prev) => !prev)}
              className="text-sm text-[#1D68FF] font-medium hover:underline">
              {showAllBenefits ? 'Show less' : 'View all benefits'}
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onSelect}
        className="w-full rounded-md py-2.5 mt-5">
        Select a Quote
      </Button>
    </div>
  );
}
