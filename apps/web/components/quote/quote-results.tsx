'use client';

import {useState, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {calculateTotalPremium, getSizeFactor, formatPrice} from '@/lib/pricing';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

export function QuoteResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const source = searchParams.get('source') ?? 'pre-configured';
  const employeeBand = searchParams.get('employees') ?? '2-5';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const revenue = searchParams.get('revenue') ?? '';
  const coverageArea = searchParams.get('coverageArea') ?? '';

  const businessType =
    businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const initialProducts = resolveProducts(searchParams, businessType);

  const [activeProducts, setActiveProducts] = useState<Set<ProductId>>(
    new Set(initialProducts),
  );
  const [coverageLimits, setCoverageLimits] = useState<Record<string, string>>(
    () => {
      const limits: Record<string, string> = {};
      initialProducts.forEach((p) => {
        limits[p] = '1M';
      });
      return limits;
    },
  );

  const sizeFactor = getSizeFactor(employeeBand);

  const insurerQuotes = useMemo(() => {
    return insurers
      .map((insurer) => {
        const total = calculateTotalPremium({
          productIds: Array.from(activeProducts),
          riskFactor: businessType.riskFactor,
          sizeFactor,
          coverageLimits,
          insurerMultiplier: insurer.priceMultiplier,
        });
        return {...insurer, total};
      })
      .sort((a, b) => a.total - b.total);
  }, [activeProducts, coverageLimits, businessType.riskFactor, sizeFactor]);

  const lowestPrice = insurerQuotes[0]?.total ?? 0;

  function toggleProduct(productId: ProductId) {
    setActiveProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        if (next.size <= 1) return prev;
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  function handleSelectInsurer(insurerId: string, total: number) {
    const params = new URLSearchParams({
      type: typeId,
      insurer: insurerId,
      total: String(total),
      products: Array.from(activeProducts).join(','),
      limits: JSON.stringify(coverageLimits),
      source: source,
      employees: employeeBand,
      emirate,
    });
    if (revenue) params.set('revenue', revenue);
    if (coverageArea) params.set('coverageArea', coverageArea);
    router.push(`/quote/company-details?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={3} label="Your quotes" />

      {/* Header with price highlight */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <Card className="rounded-2xl border-2 border-primary bg-linear-to-r from-primary/5 to-white overflow-hidden">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text">
                Your quotes
              </h1>
              <p className="mt-0.5 text-sm text-text-muted">
                {businessType.title} · {emirate}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-text-muted uppercase tracking-wider">
                From
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight">
                AED {formatPrice(lowestPrice)}
              </p>
              <p className="text-[11px] text-text-muted">/year incl. tax</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Toggle Chips */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
          Included covers
        </p>
        <div className="flex flex-wrap gap-2">
          {initialProducts.map((productId) => {
            const product = productsConfig[productId];
            const isActive = activeProducts.has(productId);
            return (
              <button
                key={productId}
                onClick={() => toggleProduct(productId)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-text-muted border border-border hover:border-primary/40'
                }`}
              >
                <span>{product.icon}</span>
                <span>{product.shortName}</span>
                {isActive && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="ml-0.5"
                  >
                    <path
                      d="M2.5 6.5L5 9L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Insurer Cards */}
      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {insurerQuotes.map((insurer, index) => {
          const isBestPrice = index === 0;
          return (
            <Card
              key={insurer.id}
              className={`rounded-2xl bg-white overflow-hidden transition-all duration-200 ${
                isBestPrice
                  ? 'border-2 border-green-500 shadow-md'
                  : 'border border-border shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badge bar */}
              {(isBestPrice || insurer.shariahCompliant) && (
                <div
                  className={`px-5 py-2 flex items-center gap-2 text-xs font-medium ${
                    isBestPrice
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {isBestPrice && (
                    <span className="inline-flex items-center gap-1">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M7 1.75L8.64 5.09L12.25 5.61L9.625 8.16L10.28 11.75L7 10.01L3.72 11.75L4.375 8.16L1.75 5.61L5.36 5.09L7 1.75Z"
                          fill="currentColor"
                        />
                      </svg>
                      Best price
                    </span>
                  )}
                  {isBestPrice && insurer.shariahCompliant && <span>·</span>}
                  {insurer.shariahCompliant && (
                    <span>☪ Shariah-compliant</span>
                  )}
                </div>
              )}

              <CardContent className="p-5 flex flex-col gap-4">
                {/* Insurer Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white ${
                      isBestPrice ? 'bg-green-500' : 'bg-primary/80'
                    }`}
                  >
                    {insurer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text text-sm">
                      {insurer.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                      <span className="text-yellow-400">
                        {'★'.repeat(Math.round(insurer.rating))}
                      </span>
                      <span className="text-text-muted">
                        {insurer.rating} ·{' '}
                        {insurer.reviewCount.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-text">
                      AED {formatPrice(insurer.total)}
                    </p>
                    <p className="text-[10px] text-text-muted">/year incl. tax</p>
                  </div>
                </div>

                {/* Coverage Limit Selectors */}
                <div className="flex flex-wrap gap-2 bg-surface rounded-xl p-3">
                  {Array.from(activeProducts).map((productId) => {
                    const product = productsConfig[productId];
                    return (
                      <div
                        key={productId}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <span>{product.icon}</span>
                        <span className="text-text-muted">
                          {product.shortName}:
                        </span>
                        <select
                          value={coverageLimits[productId] ?? '1M'}
                          onChange={(e) =>
                            setCoverageLimits((prev) => ({
                              ...prev,
                              [productId]: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                        >
                          <option value="1M">AED 1M</option>
                          <option value="2M">AED 2M</option>
                          <option value="5M">AED 5M</option>
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <Button
                  onClick={() =>
                    handleSelectInsurer(insurer.id, insurer.total)
                  }
                  className={`w-full rounded-xl py-3 font-semibold transition-all duration-200 ${
                    isBestPrice
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-text text-white hover:bg-text/90'
                  }`}
                >
                  Select & Continue
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
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function resolveProducts(
  params: URLSearchParams,
  businessType: (typeof businessTypes)[number],
): ProductId[] {
  const source = params.get('source');

  if (source === 'manual') {
    const products: ProductId[] = ['workers-comp'];
    if (params.get('customerInteraction') === 'true') {
      products.push('public-liability');
    }
    if (params.get('advisoryServices') === 'true') {
      products.push('professional-indemnity');
    }
    if (params.get('physicalAssets') === 'true') {
      products.push('property');
    }
    if (params.get('businessVehicles') === 'true') {
      products.push('fleet');
    }
    if (products.length === 1) {
      products.push('public-liability');
    }
    return products;
  }

  return businessType.products as unknown as ProductId[];
}
