'use client';

import {useState, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {QuoteCard} from '@/components/quote/quote-card';
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
  const [selectedInsurer, setSelectedInsurer] = useState<{
    id: string;
    total: number;
  } | null>(null);

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

  const coverageType = Array.from(activeProducts)
    .map((id) => productsConfig[id].shortName)
    .join(' + ');

  const benefits = Array.from(activeProducts).map((id) => ({
    name: productsConfig[id].name,
    included: true,
  }));

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

  function handleSelect(insurerId: string, total: number) {
    setSelectedInsurer({id: insurerId, total});
  }

  function handleContinue() {
    if (!selectedInsurer) return;
    const params = new URLSearchParams({
      type: typeId,
      insurer: selectedInsurer.id,
      total: String(selectedInsurer.total),
      products: Array.from(activeProducts).join(','),
      limits: JSON.stringify(coverageLimits),
      source,
      employees: employeeBand,
      emirate,
    });
    if (revenue) params.set('revenue', revenue);
    if (coverageArea) params.set('coverageArea', coverageArea);
    router.push(`/quote/company-details?${params.toString()}`);
  }

  function handleBack() {
    router.back();
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      <ProgressIndicator currentStep={3} label="Your quotes" />

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 w-full flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4">
          {/* Business Summary Card */}
          <Card className="rounded-xl border border-gray-200 bg-white">
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-gray-900">
                {businessType.title}
              </h2>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Industry</span>
                  <span className="font-medium text-gray-900">
                    {businessType.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Emirate</span>
                  <span className="font-medium text-gray-900">{emirate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Employees</span>
                  <span className="font-medium text-gray-900">
                    {employeeBand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage</span>
                  <span className="font-medium text-gray-900">
                    {coverageType}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Toggles */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-primary/40'
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

          {/* Coverage Limit Selectors */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Coverage limits
            </p>
            <div className="space-y-2">
              {Array.from(activeProducts).map((productId) => {
                const product = productsConfig[productId];
                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span>{product.icon}</span>
                      <span className="text-gray-700">
                        {product.shortName}
                      </span>
                    </div>
                    <select
                      value={coverageLimits[productId] ?? '1M'}
                      onChange={(e) =>
                        setCoverageLimits((prev) => ({
                          ...prev,
                          [productId]: e.target.value,
                        }))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="1M">AED 1M</option>
                      <option value="2M">AED 2M</option>
                      <option value="5M">AED 5M</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-primary hover:bg-primary/5 text-sm gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M2 4.667h12M4.667 8h6.666M6.667 11.333h2.666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Filter
              </Button>
              <Button
                variant="ghost"
                className="text-primary hover:bg-primary/5 text-sm gap-1.5"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 2.667v10.666M8 2.667v10.666M12 2.667v10.666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Compare
              </Button>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {insurerQuotes.length} Quotes
            </p>
          </div>

          {/* Quote Cards */}
          <div className="flex flex-col gap-4">
            {insurerQuotes.map((insurer, index) => (
              <QuoteCard
                key={insurer.id}
                insurer={insurer}
                coverageType={coverageType}
                benefits={benefits}
                isBestPrice={index === 0}
                isSelected={selectedInsurer?.id === insurer.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-md py-4 px-6 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12.667L5.333 8L10 3.333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedInsurer}
            className="rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-8 gap-2"
          >
            Continue
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3.333L10.667 8L6 12.667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
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
