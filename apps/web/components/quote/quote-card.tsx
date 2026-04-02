'use client';

import {useState} from 'react';
import {Button, Badge} from '@shory/ui';
import {formatPrice} from '@/lib/pricing';
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
  isBestPrice: boolean;
  onSelect: (insurerId: string, total: number) => void;
}

export function QuoteCard({
  insurer,
  coverageType,
  benefits,
  isBestPrice,
  onSelect,
}: QuoteCardProps) {
  const {t} = useI18n();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-all duration-200 hover:shadow-md ${
        isBestPrice
          ? 'border-green-300 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Badges row */}
      {(isBestPrice || insurer.shariahCompliant) && (
        <div className="flex items-center gap-2 mb-3">
          {isBestPrice && (
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium gap-1">
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

      {/* Top row: logo + info + price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
            <img
              src={insurer.logo}
              alt={insurer.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {insurer.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{coverageType}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">
                {'★'.repeat(Math.round(insurer.rating))}
                {'☆'.repeat(5 - Math.round(insurer.rating))}
              </span>
              <span className="text-[11px] text-gray-400">
                {insurer.rating} ({insurer.reviewCount.toLocaleString()})
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-sm font-semibold text-gray-500">AED</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(insurer.total)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">{t.common.perYearInclTax}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Or AED {formatPrice(Math.ceil(insurer.total / 4))}/quarter
          </p>
        </div>
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t.results.whatsIncluded}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {benefits
              .filter((b) => b.included)
              .map((benefit) => (
                <div
                  key={benefit.name}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-green-500 shrink-0"
                  >
                    <path
                      d="M3.333 8L6.667 11.333L12.667 4.667"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {benefit.name}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails((prev) => !prev)}
          className="rounded-lg text-primary border-primary hover:bg-primary/5 text-sm px-4"
        >
          {showDetails ? t.results.hideDetails : t.results.showDetails}
        </Button>
        <Button
          size="sm"
          onClick={() => onSelect(insurer.id, insurer.total)}
          className="rounded-lg bg-primary text-white hover:bg-primary/90 text-sm px-6"
        >
          {t.common.select}
        </Button>
      </div>
    </div>
  );
}
