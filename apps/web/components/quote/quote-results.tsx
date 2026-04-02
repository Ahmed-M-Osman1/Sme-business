'use client';

import {useState, useMemo, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {QuoteCard} from '@/components/quote/quote-card';
import {calculateTotalPremium, getSizeFactor, formatPrice} from '@/lib/pricing';
import type {ProductInfo} from '@/lib/pricing';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
import {useI18n} from '@/lib/i18n';
import {api} from '@/lib/api-client';
import type {BusinessType, Insurer} from '@/types/quote';

/** Delay before navigating to the next page after selecting a quote. */
const NAVIGATION_DELAY_MS = 800;

export function QuoteResults() {
  const {t} = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const source = searchParams.get('source') ?? 'pre-configured';
  const employeeBand = searchParams.get('employees') ?? '2-5';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const revenue = searchParams.get('revenue') ?? '';
  const coverageArea = searchParams.get('coverageArea') ?? '';

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, ProductInfo>>({});
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.catalog.businessTypes(),
      api.catalog.products(),
      api.catalog.insurers(),
    ])
      .then(([btData, prodData, insData]) => {
        setBusinessTypes(btData);
        const map: Record<string, ProductInfo> = {};
        prodData.forEach((p) => { map[p.id] = p; });
        setProductsMap(map);
        setInsurers(insData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const initialProducts = businessType ? resolveProducts(searchParams, businessType) : [];

  const [activeProducts, setActiveProducts] = useState<Set<string>>(new Set());
  const [coverageLimits, setCoverageLimits] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [selectedInsurerId, setSelectedInsurerId] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  // Initialize activeProducts and coverageLimits once data is loaded
  useEffect(() => {
    if (!loading && businessType && !initialized) {
      const products = resolveProducts(searchParams, businessType);
      setActiveProducts(new Set(products));
      const limits: Record<string, string> = {};
      products.forEach((p) => { limits[p] = '1M'; });
      setCoverageLimits(limits);
      setInitialized(true);
    }
  }, [loading, businessType, initialized, searchParams]);

  const sizeFactor = getSizeFactor(employeeBand);

  const allQuotes = useMemo(() => {
    if (!businessType) return [];
    return insurers
      .map((insurer) => {
        const total = calculateTotalPremium(
          {
            productIds: Array.from(activeProducts),
            riskFactor: businessType.riskFactor,
            sizeFactor,
            coverageLimits,
            insurerMultiplier: insurer.priceMultiplier,
          },
          productsMap,
        );
        return {...insurer, total};
      })
      .sort((a, b) => a.total - b.total);
  }, [activeProducts, coverageLimits, businessType, sizeFactor, insurers, productsMap]);

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
    .map((id) => productsMap[id]?.shortName ?? id)
    .join(' + ');

  const benefits = Array.from(activeProducts).map((id) => ({
    name: productsMap[id]?.name ?? id,
    included: true,
  }));

  function toggleProduct(productId: string) {
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

  function handleSelectToggle(insurerId: string) {
    setSelectedInsurerId((prev) => (prev === insurerId ? null : insurerId));
  }

  const selectedQuote = insurerQuotes.find((q) => q.id === selectedInsurerId);

  function handleProceed() {
    if (!selectedQuote) return;
    handleNavigate(selectedQuote.id, selectedQuote.total);
  }

  function handleNavigate(insurerId: string, total: number) {
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
    const businessName = searchParams.get('businessName');
    const licenseNumber = searchParams.get('licenseNumber');
    if (businessName) params.set('businessName', businessName);
    if (licenseNumber) params.set('licenseNumber', licenseNumber);

    setShowTransition(true);
    const destination = licenseNumber && businessName
      ? (() => { params.set('companyVerified', 'true'); params.set('companySource', 'ocr'); return `/quote/checkout?${params.toString()}`; })()
      : `/quote/company-details?${params.toString()}`;

    setTimeout(() => {
      router.push(destination);
    }, NAVIGATION_DELAY_MS);
  }

  function handleBack() {
    router.back();
  }

  if (loading || !initialized) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showTransition) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 animate-in fade-in duration-300">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
        </div>
        <p className="text-base font-semibold text-gray-900">{t.results.preparingQuote}</p>
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_0.8s_ease-in-out]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProgressIndicator currentStep={4} label={t.progress.quotes} />

      {/* Back + Title */}
      <div className="max-w-6xl mx-auto px-4 w-full">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-3"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
            <path
              d="M10 12.667L5.333 8L10 3.333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.common.back}
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.results.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {businessType?.title} &middot; {emirate} &middot; {employeeBand} {t.results.employees}
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
                {businessType?.title}
              </h2>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{t.results.industry}</span>
                  <span className="font-medium text-gray-900">
                    {businessType?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.results.emirate}</span>
                  <span className="font-medium text-gray-900">{emirate}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.results.employees}</span>
                  <span className="font-medium text-gray-900">
                    {employeeBand}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.results.coverage}</span>
                  <span className="font-medium text-gray-900">
                    {coverageType}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Toggles */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {t.results.includedCovers}
            </p>
            {selectedQuote && (
              <p className="text-xs text-gray-400 mb-2">
                {t.results.coverageAvailableFor} {selectedQuote.name}. {t.results.adjustToUpdate}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {initialProducts.map((productId) => {
                const product = productsMap[productId];
                if (!product) return null;
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
                        className="ms-0.5"
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
              {t.results.coverageLimits}
            </p>
            <div className="space-y-2">
              {Array.from(activeProducts).map((productId) => {
                const product = productsMap[productId];
                if (!product) return null;
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
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                  <path
                    d="M2 4.667h12M4.667 8h6.666M6.667 11.333h2.666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t.results.filterLabel}
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
                <option value="price">{t.results.sortLowest}</option>
                <option value="rating">{t.results.sortRating}</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {insurerQuotes.length} {t.common.of} {allQuotes.length} {t.results.quotes}
            </p>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="rounded-xl border border-gray-200 bg-white animate-in slide-in-from-top-2 duration-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{t.results.filters}</p>
                  <button
                    onClick={() => {
                      setShariahOnly(false);
                      setMaxPrice(null);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {t.common.clearAll}
                  </button>
                </div>

                {/* Shariah Compliant */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-700">{t.results.shariahOnly}</p>
                    <p className="text-xs text-gray-400">{t.results.shariahDesc}</p>
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
                    <p className="text-sm text-gray-700">{t.results.maxPrice}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {maxPrice === null
                        ? t.results.any
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
                  <p className="text-gray-500 text-sm">{t.results.noQuotes}</p>
                  <button
                    onClick={() => {
                      setShariahOnly(false);
                      setMaxPrice(null);
                    }}
                    className="text-primary text-sm mt-2 hover:underline"
                  >
                    {t.results.clearFilters}
                  </button>
                </CardContent>
              </Card>
            ) : (
              insurerQuotes.map((insurer) => (
                <QuoteCard
                  key={insurer.id}
                  insurer={insurer}
                  coverageType={coverageType}
                  benefits={benefits}
                  isBestPrice={insurer.total === Math.min(...insurerQuotes.map((q) => q.total))}
                  isSelected={insurer.id === selectedInsurerId}
                  onSelect={() => handleSelectToggle(insurer.id)}
                  onProceed={() => handleNavigate(insurer.id, insurer.total)}
                />
              ))
            )}
          {/* Indicative pricing disclaimer */}
          <p className="text-xs text-gray-400 text-center mt-2">
            {t.results.pricingDisclaimer}
          </p>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar when a quote is selected */}
      {selectedQuote && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                <img src={selectedQuote.logo} alt={selectedQuote.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {t.results.continueWith} {selectedQuote.name}
                </p>
                <p className="text-xs text-gray-500">
                  AED {formatPrice(selectedQuote.total)}{t.common.perYear}
                </p>
              </div>
            </div>
            <Button
              onClick={handleProceed}
              className="rounded-xl bg-primary text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm shrink-0"
            >
              {t.common.continue}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ms-1.5 inline rtl:rotate-180">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function resolveProducts(
  params: URLSearchParams,
  businessType: BusinessType,
): string[] {
  const source = params.get('source');

  if (source === 'manual') {
    const products: string[] = ['workers-comp'];
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

  return businessType.products;
}
