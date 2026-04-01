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
  const productIds = (searchParams.get('products') ?? '').split(',') as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={6} totalSteps={6} label="Confirmed" />

      <div className="max-w-3xl mx-auto px-4 w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto">
          ✓
        </div>
        <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-text">
          Your policy is confirmed!
        </h1>
        <p className="mt-2 text-text-muted">
          A confirmation has been sent to {email}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-6">
        {/* Policy Summary */}
        <Card className="rounded-2xl border border-border bg-white">
          <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg font-bold text-text">
                {insurer.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-text text-sm">
                  {insurer.name}
                </p>
                <p className="text-xs text-text-muted">
                  {businessType.title} · Dubai
                </p>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Policy holder</span>
              <span className="text-text font-medium">{name}</span>
            </div>

            <div className="border-t border-border" />

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
                    <span className="text-xs text-text-muted">
                      AED {limit}
                    </span>
                  </div>
                );
              })}

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-bold text-text">Total Premium</span>
              <span className="font-bold text-primary text-lg">
                AED {formatPrice(total)}/yr
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full rounded-xl bg-primary text-white py-3 font-medium"
          >
            <Link href="/">Back to Home</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl border-border py-3 font-medium text-text"
            onClick={() =>
              alert('Download feature coming soon')
            }
          >
            Download Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
