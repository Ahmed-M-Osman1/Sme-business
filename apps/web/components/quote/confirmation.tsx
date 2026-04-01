'use client';

import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {formatPrice} from '@/lib/pricing';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

export function Confirmation() {
  const searchParams = useSearchParams();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const total = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(
    ',',
  ) as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';
  const businessName = searchParams.get('businessName') ?? '';
  const emirate = searchParams.get('emirate') ?? 'Dubai';

  const businessType =
    businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={6} label="Confirmed" />

      {/* Success hero */}
      <div className="max-w-3xl mx-auto px-4 w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M9 19.5L15 25.5L27 12"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-text">
          Your policy is confirmed!
        </h1>
        <p className="mt-2 text-text-muted">
          A confirmation has been sent to{' '}
          <span className="font-medium text-text">{email}</span>
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-5">
        {/* Policy Summary */}
        <Card className="rounded-2xl border-2 border-border bg-white shadow-sm overflow-hidden">
          <div className="bg-surface px-5 py-2.5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Policy summary
            </p>
          </div>
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Insurer */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl border border-border bg-white flex items-center justify-center overflow-hidden">
                {insurer.logo ? (
                  <img src={insurer.logo} alt={insurer.name} className="w-9 h-9 object-contain" />
                ) : (
                  <span className="text-lg font-bold text-white bg-primary/80 w-full h-full flex items-center justify-center">{insurer.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-text text-sm">
                  {insurer.name}
                </p>
                <p className="text-xs text-text-muted">
                  {businessType.title} · {emirate}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface rounded-lg px-3 py-2">
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  Policy holder
                </p>
                <p className="text-sm font-medium text-text mt-0.5">{name}</p>
              </div>
              {businessName && (
                <div className="bg-surface rounded-lg px-3 py-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">
                    Business
                  </p>
                  <p className="text-sm font-medium text-text mt-0.5">
                    {businessName}
                  </p>
                </div>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Product lines */}
            {productIds
              .filter((id) => productsConfig[id])
              .map((productId) => {
                const product = productsConfig[productId];
                const limit = limits[productId] ?? '1M';
                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{product.icon}</span>
                      <span className="text-text">{product.name}</span>
                    </div>
                    <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
                      AED {limit}
                    </span>
                  </div>
                );
              })}

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-text">Total Premium</span>
              <span className="font-bold text-primary text-xl">
                AED {formatPrice(total)}
                <span className="text-xs font-normal text-text-muted">
                  /yr
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="flex-1 rounded-xl bg-primary text-white py-3.5 font-semibold shadow-sm"
          >
            <Link href="/">
              Back to Home
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="ml-2 inline"
              >
                <path
                  d="M6 3.333L10.667 8L6 12.667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-2 border-border py-3.5 font-semibold text-text hover:bg-surface transition-colors"
            onClick={() => alert('Download feature coming soon')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="mr-2 inline"
            >
              <path
                d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
