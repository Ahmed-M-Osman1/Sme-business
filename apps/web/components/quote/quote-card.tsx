'use client';

import {useState} from 'react';
import {Button, Badge} from '@shory/ui';
import {formatPrice} from '@/lib/pricing';

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
  isSelected: boolean;
  onSelect: (insurerId: string, total: number) => void;
}

export function QuoteCard({
  insurer,
  coverageType,
  benefits,
  isBestPrice,
  isSelected,
  onSelect,
}: QuoteCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`rounded-xl border bg-gray-50 p-4 transition-all duration-200 ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-gray-200'
      }`}
    >
      {/* Best Price badge */}
      {isBestPrice && (
        <div className="mb-3">
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
            Best Price
          </Badge>
        </div>
      )}

      {/* Top row: logo + info + price */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={insurer.logo}
              alt={insurer.name}
              className="w-14 h-14 object-contain"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {insurer.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{coverageType}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-gray-900">
            AED {formatPrice(insurer.total)}
          </p>
          <p className="text-[11px] text-gray-400">/year incl. tax</p>
        </div>
      </div>

      {/* Split payment note */}
      <p className="text-xs text-gray-400 mt-2 ml-17">
        Or split in 4 payments of AED {formatPrice(Math.ceil(insurer.total / 4))}
      </p>

      {/* Expandable details */}
      {showDetails && (
        <div className="mt-4 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          onClick={() => setShowDetails((prev) => !prev)}
          className="rounded-xl text-primary border-primary hover:bg-primary/5 text-sm px-4"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
        <Button
          onClick={() => onSelect(insurer.id, insurer.total)}
          className={`rounded-xl text-sm px-6 ${
            isSelected
              ? 'bg-primary text-white'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </div>
  );
}
