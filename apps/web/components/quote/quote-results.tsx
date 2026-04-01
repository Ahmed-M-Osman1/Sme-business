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

  // Resolve business type
  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];

  // Resolve products from business type or from manual toggles
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
  const [takafulOpen, setTakafulOpen] = useState(false);

  const sizeFactor = getSizeFactor(employeeBand);

  // Calculate prices for each insurer
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
        if (next.size <= 1) return prev; // Can't remove last product
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
    });
    // Route to company details step first, then checkout
    router.push(`/quote/company-details?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={4} totalSteps={6} label="Your quotes" />

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Your quotes
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {businessType.title} · Dubai
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-text-muted">From</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              AED {formatPrice(lowestPrice)}
              <span className="text-xs font-normal text-text-muted">/yr</span>
            </p>
          </div>
        </div>
      </div>

      {/* Product Toggle Chips */}
      <div className="max-w-3xl mx-auto px-4 w-full">
        <div className="flex flex-wrap gap-2">
          {initialProducts.map((productId) => {
            const product = productsConfig[productId];
            const isActive = activeProducts.has(productId);
            return (
              <button
                key={productId}
                onClick={() => toggleProduct(productId)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-text text-white'
                    : 'bg-white text-text-muted border border-border'
                }`}
              >
                <span>{product.icon}</span>
                <span>{product.shortName}</span>
                {isActive && <span>✓</span>}
              </button>
            );
          })}
          <span className="text-xs text-text-muted self-center ml-1">
            Tap to toggle
          </span>
        </div>
      </div>

      {/* Insurer Cards */}
      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {insurerQuotes.map((insurer, index) => {
          const isBestPrice = index === 0;
          return (
            <Card
              key={insurer.id}
              className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden"
            >
              {/* Compliance Badges */}
              {(isBestPrice || insurer.shariahCompliant) && (
                <div
                  className={`px-4 py-2 flex items-center justify-between text-xs font-medium ${
                    isBestPrice
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBestPrice && <span>🏷️ Best price</span>}
                    {isBestPrice && insurer.shariahCompliant && (
                      <span>·</span>
                    )}
                    {insurer.shariahCompliant && (
                      <span>☪ Shariah-compliant</span>
                    )}
                  </div>
                  {insurer.shariahCompliant && (
                    <button
                      onClick={() => setTakafulOpen(true)}
                      className="underline opacity-75 hover:opacity-100"
                    >
                      What is Takaful?
                    </button>
                  )}
                </div>
              )}

              <CardContent className="p-5 flex flex-col gap-4">
                {/* Insurer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg font-bold text-text">
                    {insurer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text text-sm">
                      {insurer.name}
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-400">
                        {'★'.repeat(Math.round(insurer.rating))}
                      </span>
                      <span className="text-text-muted">
                        {insurer.rating} · {insurer.reviewCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text">
                      AED {formatPrice(insurer.total)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      /year incl. tax
                    </p>
                  </div>
                </div>

                {/* Product Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(activeProducts).map((productId) => {
                    const product = productsConfig[productId];
                    return (
                      <span
                        key={productId}
                        className="inline-flex items-center gap-1 text-[10px] bg-surface text-text-muted rounded-full px-2 py-0.5"
                      >
                        <span>{product.icon}</span>
                        <span>{product.shortName}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Coverage Limit Selectors */}
                <div className="flex flex-wrap gap-2">
                  {Array.from(activeProducts).map((productId) => {
                    const product = productsConfig[productId];
                    return (
                      <div key={productId} className="flex items-center gap-1.5 text-xs">
                        <span className="text-text-muted">{product.shortName}:</span>
                        <select
                          value={coverageLimits[productId] ?? '1M'}
                          onChange={(e) =>
                            setCoverageLimits((prev) => ({
                              ...prev,
                              [productId]: e.target.value,
                            }))
                          }
                          className="rounded-lg border border-border bg-white px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
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
                  onClick={() => handleSelectInsurer(insurer.id, insurer.total)}
                  className="w-full rounded-xl bg-text text-white py-3 font-medium hover:bg-text/90 transition-all duration-200"
                >
                  Select & Buy →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Takaful Bottom Sheet */}
      {takafulOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setTakafulOpen(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text mb-4">
              What is Takaful?
            </h2>
            <div className="flex flex-col gap-3 text-sm text-text-muted leading-relaxed">
              <p>
                Takaful is an Islamic insurance concept based on mutual
                cooperation. Participants contribute to a shared fund that is
                used to support members in times of need.
              </p>
              <p>
                Unlike conventional insurance, Takaful operates on the
                principles of shared responsibility, mutual assistance, and the
                avoidance of uncertainty (gharar) and interest (riba).
              </p>
              <p>
                The funds are managed in compliance with Shariah law, ensuring
                investments are ethical and socially responsible.
              </p>
            </div>
            <Button
              onClick={() => setTakafulOpen(false)}
              className="w-full mt-6 rounded-xl bg-primary text-white py-3 font-medium"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
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
    // Default: at least public liability
    if (products.length === 1) {
      products.push('public-liability');
    }
    return products;
  }

  // Pre-configured, upload, or AI path
  return businessType.products as unknown as ProductId[];
}
