'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, Badge, Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeDetail} from '@/components/quote/business-type-detail';
import businessTypes from '@/config/business-types.json';
import products from '@/config/products.json';

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

type ProductId = keyof typeof products;

export default function BusinessTypePage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleCardTap(btId: string) {
    setExpandedId((prev) => (prev === btId ? null : btId));
  }

  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator
        currentStep={2}
        label="Business type"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          {expandedId ? 'Select your business type' : 'What type of business?'}
        </h1>
        <p className="mt-2 text-text-muted">
          {expandedId
            ? "Tap your type — defaults are pre-filled, adjust anything before getting quotes."
            : "Select your type — we'll pre-configure your cover instantly."}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-3">
        {/* Expanded detail — full width above grid */}
        {expandedId && (() => {
          const bt = businessTypes.find((b) => b.id === expandedId);
          if (!bt) return null;
          return (
            <BusinessTypeDetail
              key={bt.id}
              businessType={bt}
              onCollapse={() => setExpandedId(null)}
            />
          );
        })()}

        {/* 2-column card grid */}
        {!expandedId && (
          <div className="grid grid-cols-2 gap-3">
            {businessTypes.map((bt) => (
              <button
                key={bt.id}
                onClick={() => handleCardTap(bt.id)}
                className="text-left w-full"
              >
                <Card className="rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="flex flex-col gap-2.5 p-3 sm:p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
                        {bt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-text text-sm leading-tight line-clamp-1">
                          {bt.title}
                        </span>
                        <Badge
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize mt-0.5 inline-block ${
                            RISK_BADGE_STYLES[bt.riskLevel]
                          }`}
                        >
                          {bt.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed line-clamp-2">
                      {bt.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {bt.products.map((productId) => {
                        const product = products[productId as ProductId];
                        if (!product) return null;
                        return (
                          <span
                            key={productId}
                            className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] bg-surface text-text-muted rounded-full px-1.5 py-0.5"
                          >
                            <span>{product.icon}</span>
                            <span>{product.shortName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}

            {/* Fallback: not listed */}
            <button
              onClick={() => router.push('/quote/manual')}
              className="w-full col-span-2"
            >
              <Card className="rounded-2xl border-2 border-dashed border-border bg-white hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="flex items-center justify-center gap-2 p-4">
                  <span className="text-sm font-medium text-text">
                    My business type isn&apos;t listed
                  </span>
                  <span className="text-sm text-text-muted">
                    — fill in manually
                  </span>
                </CardContent>
              </Card>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
