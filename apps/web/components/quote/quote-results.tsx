'use client';

import {useState, useMemo} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {QuoteCard} from '@/components/quote/quote-card';
import {calculateTotalPremium, getSizeFactor, formatPrice} from '@/lib/pricing';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
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
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const sizeFactor = getSizeFactor(employeeBand);

  const allQuotes = useMemo(() => {
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

  const insurerQuotes = useMemo(() => {
    let filtered = allQuotes.filter((q) => {
      if (shariahOnly && !q.shariahCompliant) return false;
      if (maxPrice && q.total > maxPrice) return false;
      return true;
    });
    if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  }, [allQuotes, shariahOnly, maxPrice, sortBy]);

  const priceRange = useMemo(() => {
    if (allQuotes.length === 0) return {min: 0, max: 10000};
    return {
      min: Math.floor(allQuotes[0].total / 100) * 100,
      max: Math.ceil(allQuotes[allQuotes.length - 1].total / 100) * 100,
    };
  }, [allQuotes]);

  const activeFilterCount = [shariahOnly, maxPrice !== null].filter(Boolean).length;

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
    const params = new URLSearchParams({
      type: typeId,
      insurer: insurerId,
      total: String(total),
      products: Array.from(activeProducts).join(','),
      limits: JSON.stringify(coverageLimits),
      source,
      employees: employeeBand,
      emirate,
    });
    if (revenue) params.set('revenue', revenue);
    if (coverageArea) params.set('coverageArea', coverageArea);
    // If company details already collected (upload path), skip to checkout
    const businessName = searchParams.get('businessName');
    const licenseNumber = searchParams.get('licenseNumber');
    if (businessName) params.set('businessName', businessName);
    if (licenseNumber) params.set('licenseNumber', licenseNumber);

    if (licenseNumber && businessName) {
      params.set('companyVerified', 'true');
      params.set('companySource', 'ocr');
      router.push(`/quote/checkout?${params.toString()}`);
    } else {
      router.push(`/quote/company-details?${params.toString()}`);
    }
  }

  function handleBack() {
    router.back();
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProgressIndicator currentStep={3} label="Your quotes" />

      {/* Back + Title */}
      <div className="max-w-6xl mx-auto px-4 w-full">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
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
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Quotes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {businessType.title} &middot; {emirate} &middot; {employeeBand} employees
        </p>
      </div>

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
                    {PRODUCT_ICONS[productId] ? PRODUCT_ICONS[productId]({className: 'w-4 h-4'}) : <span>{product.icon}</span>}
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
                      {PRODUCT_ICONS[productId] ? PRODUCT_ICONS[productId]({className: 'w-4 h-4'}) : <span>{product.icon}</span>}
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
                onClick={() => setShowFilters((prev) => !prev)}
                className="text-primary hover:bg-primary/5 text-sm gap-1.5"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 4.667h12M4.667 8h6.666M6.667 11.333h2.666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'rating')}
                className="text-sm text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="price">Sort: Lowest price</option>
                <option value="rating">Sort: Highest rating</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {insurerQuotes.length} of {allQuotes.length} Quotes
            </p>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="rounded-xl border border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Filters</p>
                  <button
                    onClick={() => {
                      setShariahOnly(false);
                      setMaxPrice(null);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Shariah Compliant */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-700">Shariah-compliant only</p>
                    <p className="text-xs text-gray-400">Show Takaful providers</p>
                  </div>
                  <button
                    onClick={() => setShariahOnly((prev) => !prev)}
                    className={`w-10 h-6 rounded-full flex items-center transition-colors duration-200 ${
                      shariahOnly ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                        shariahOnly ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>

                {/* Max Price Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-700">Max annual price</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {maxPrice === null
                        ? 'Any'
                        : `AED ${formatPrice(maxPrice)}`}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={100}
                    value={maxPrice ?? priceRange.max}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMaxPrice(val >= priceRange.max ? null : val);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>AED {formatPrice(priceRange.min)}</span>
                    <span>AED {formatPrice(priceRange.max)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quote Cards */}
          <div className="flex flex-col gap-4">
            {insurerQuotes.length === 0 ? (
              <Card className="rounded-xl border border-gray-200 bg-white">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No quotes match your filters.</p>
                  <button
                    onClick={() => {
                      setShariahOnly(false);
                      setMaxPrice(null);
                    }}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    Clear filters
                  </button>
                </CardContent>
              </Card>
            ) : (
              insurerQuotes.map((insurer, index) => (
                <QuoteCard
                  key={insurer.id}
                  insurer={insurer}
                  coverageType={coverageType}
                  benefits={benefits}
                  isBestPrice={insurer.total === Math.min(...insurerQuotes.map((q) => q.total))}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
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
