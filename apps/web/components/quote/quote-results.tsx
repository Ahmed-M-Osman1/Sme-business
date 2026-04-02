'use client';

import {useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import bundleDeals from '@/config/bundle-deals.json';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
import {BundleCard} from '@/components/quote/bundle-card';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {QuoteCard} from '@/components/quote/quote-card';
import {api} from '@/lib/api-client';
import {useI18n} from '@/lib/i18n';
import {
  calculateMonthlyPrice,
  calculateQuarterlyPrice,
  calculateTotalPremium,
  formatPriceWithCurrency,
  getSizeFactor,
} from '@/lib/pricing';
import {evaluateRecommendations} from '@/lib/recommendation-engine';
import type {ProductInfo} from '@/lib/pricing';
import type {
  BundleDeal,
  BusinessType,
  Insurer,
  InsurerQuote,
} from '@/types/quote';

const NAVIGATION_DELAY_MS = 800;

type ResultsTab = 'individual' | 'bundles';

interface EnrichedInsurerQuote extends InsurerQuote {
  calculatedTotal: number;
}

export function QuoteResults() {
  const {t, locale} = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const source = searchParams.get('source') ?? 'pre-configured';
  const employeeBand = searchParams.get('employees') ?? '2-5';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const revenue = searchParams.get('revenue') ?? '';
  const coverageArea = searchParams.get('coverageArea') ?? '';

  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>(
    [],
  );
  const [productsMap, setProductsMap] = useState<
    Record<string, ProductInfo>
  >({});
  const [insurers, setInsurers] = useState<Insurer[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeProducts, setActiveProducts] = useState<Set<string>>(
    new Set(),
  );
  const [coverageLimits, setCoverageLimits] = useState<
    Record<string, string>
  >({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [shariahOnly, setShariahOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [selectedInsurerId, setSelectedInsurerId] = useState<
    string | null
  >(null);
  const [showTransition, setShowTransition] = useState(false);
  const [activeTab, setActiveTab] =
    useState<ResultsTab>('individual');
  const [selectedBundleId, setSelectedBundleId] = useState<
    string | null
  >(null);
  const [paymentDisplay] = useState<'quarterly' | 'annual'>(
    'quarterly',
  );

  useEffect(() => {
    Promise.all([
      api.catalog.businessTypes(),
      api.catalog.products(),
      api.catalog.insurers(),
    ])
      .then(([businessTypeData, productData, insurerData]) => {
        setBusinessTypes(businessTypeData);

        const nextProductsMap: Record<string, ProductInfo> = {};
        productData.forEach((product) => {
          nextProductsMap[product.id] = product;
        });
        setProductsMap(nextProductsMap);
        setInsurers(insurerData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const businessType =
    businessTypes.find((item) => item.id === typeId) ??
    businessTypes[0];

  const recommendedProducts = useMemo(() => {
    if (!businessType) return [];

    return evaluateRecommendations({
      businessType,
      params: new URLSearchParams(searchParams.toString()),
    }).products;
  }, [businessType, searchParams]);

  useEffect(() => {
    if (!loading && businessType && !initialized) {
      setActiveProducts(new Set(recommendedProducts));
      setCoverageLimits(buildCoverageLimitState(recommendedProducts));
      setInitialized(true);
    }
  }, [businessType, initialized, loading, recommendedProducts]);

  const availableProductIds = useMemo(() => {
    if (!businessType) return Array.from(activeProducts);

    return Array.from(
      new Set([
        ...businessType.products,
        ...recommendedProducts,
        ...Array.from(activeProducts),
        ...(bundleDeals as BundleDeal[]).flatMap(
          (bundle) => bundle.productIds,
        ),
      ]),
    );
  }, [activeProducts, businessType, recommendedProducts]);

  const bundles = useMemo(
    () =>
      (bundleDeals as BundleDeal[]).map((bundle) => ({
        ...bundle,
        savings: Math.max(
          bundle.benchmarkAnnualPrice - bundle.annualPrice,
          0,
        ),
      })),
    [],
  );

  const selectedBundle =
    bundles.find((bundle) => bundle.id === selectedBundleId) ?? null;
  const bundleCopy = t.results.bundleContent;
  const sizeFactor = getSizeFactor(employeeBand);
  const formatMoney = (amount: number) =>
    formatPriceWithCurrency(amount, t.common.currency, locale);
  const formatMonthlyTotal = (amount: number) =>
    `${formatMoney(calculateMonthlyPrice(amount))}${t.common.perMonth}`;

  const allQuotes = useMemo<EnrichedInsurerQuote[]>(() => {
    if (!businessType) return [];

    return insurers.map((insurer) => {
      const calculatedTotal = calculateTotalPremium(
        {
          productIds: Array.from(activeProducts),
          riskFactor: businessType.riskFactor,
          sizeFactor,
          coverageLimits,
          insurerMultiplier: insurer.priceMultiplier,
        },
        productsMap,
      );

      return {
        ...insurer,
        calculatedTotal,
        total: selectedBundle?.annualPrice ?? calculatedTotal,
      };
    });
  }, [
    activeProducts,
    businessType,
    coverageLimits,
    insurers,
    productsMap,
    selectedBundle,
    sizeFactor,
  ]);

  const eligibleQuotes = useMemo(() => {
    if (!selectedBundle) return allQuotes;

    return allQuotes.filter((quote) =>
      selectedBundle.eligibleInsurerIds.includes(quote.id),
    );
  }, [allQuotes, selectedBundle]);

  const insurerQuotes = useMemo(() => {
    let filtered = eligibleQuotes.filter((quote) => {
      if (shariahOnly && !quote.shariahCompliant) return false;
      if (maxPrice !== null && quote.total > maxPrice) return false;
      return true;
    });

    filtered = [...filtered].sort((left, right) => {
      if (sortBy === 'rating') {
        return right.rating - left.rating;
      }

      if (left.total === right.total) {
        return right.rating - left.rating;
      }

      return left.total - right.total;
    });

    return filtered;
  }, [eligibleQuotes, maxPrice, shariahOnly, sortBy]);

  useEffect(() => {
    if (
      selectedInsurerId &&
      !insurerQuotes.some((quote) => quote.id === selectedInsurerId)
    ) {
      setSelectedInsurerId(null);
    }
  }, [insurerQuotes, selectedInsurerId]);

  const priceRange = useMemo(() => {
    if (eligibleQuotes.length === 0) return {min: 0, max: 10000};

    const totals = eligibleQuotes.map((quote) => quote.total);
    return {
      min: Math.floor(Math.min(...totals) / 100) * 100,
      max: Math.ceil(Math.max(...totals) / 100) * 100,
    };
  }, [eligibleQuotes]);

  const activeFilterCount = [shariahOnly, maxPrice !== null].filter(
    Boolean,
  ).length;
  const activeProductIds = Array.from(activeProducts);
  const coverageType = activeProductIds
    .map(
      (productId) => ((t.products as Record<string, {name: string; shortName: string}>)[productId]?.shortName) || (productsMap[productId]?.shortName ?? productId),
    )
    .join(' + ');

  const benefits = activeProductIds.map((productId) => ({
    name: ((t.products as Record<string, {name: string; shortName: string}>)[productId]?.name) || (productsMap[productId]?.name ?? productId),
    included: true,
  }));

  const selectedQuote =
    insurerQuotes.find((quote) => quote.id === selectedInsurerId) ??
    null;
  const resultsHeadingPrice = useMemo(() => {
    if (activeTab === 'bundles') {
      return bundles.reduce(
        (min, bundle) => Math.min(min, bundle.annualPrice),
        bundles[0]?.annualPrice ?? 0,
      );
    }

    if (insurerQuotes.length > 0) {
      return insurerQuotes[0].total;
    }

    return eligibleQuotes[0]?.total ?? 0;
  }, [activeTab, bundles, eligibleQuotes, insurerQuotes]);

  function setIndividualTab() {
    setActiveTab('individual');
  }

  function setBundleTab() {
    setActiveTab('bundles');
    setShowFilters(false);
    setSelectedInsurerId(null);
  }

  function handleBundleSelect(bundle: (typeof bundles)[number]) {
    setSelectedBundleId(bundle.id);
    setActiveProducts(new Set(bundle.productIds));
    setCoverageLimits((current) =>
      buildCoverageLimitState(bundle.productIds, current),
    );
    setSelectedInsurerId(null);
    setShowFilters(false);
    setSortBy('price');
    setActiveTab('individual');
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function handleBackToBundles() {
    setActiveTab('bundles');
    setSelectedInsurerId(null);
  }

  function clearBundleSelection() {
    if (!selectedBundle) return;

    setSelectedBundleId(null);
    setSelectedInsurerId(null);
  }

  function toggleProduct(productId: string) {
    clearBundleSelection();

    setActiveProducts((current) => {
      const next = new Set(current);

      if (next.has(productId)) {
        if (next.size <= 1) return current;
        next.delete(productId);
      } else {
        next.add(productId);
      }

      return next;
    });
  }

  function updateCoverageLimit(productId: string, value: string) {
    clearBundleSelection();

    setCoverageLimits((current) => ({
      ...current,
      [productId]: value,
    }));
  }

  function handleSelectToggle(insurerId: string) {
    setSelectedInsurerId((current) =>
      current === insurerId ? null : insurerId,
    );
  }

  function handleProceed() {
    if (!selectedQuote) return;
    handleNavigate(selectedQuote.id, selectedQuote.total);
  }

  function handleNavigate(insurerId: string, total: number) {
    const params = new URLSearchParams({
      type: typeId,
      insurer: insurerId,
      total: String(total),
      products: activeProductIds.join(','),
      limits: JSON.stringify(coverageLimits),
      source,
      employees: employeeBand,
      emirate,
    });

    if (revenue) params.set('revenue', revenue);
    if (coverageArea) params.set('coverageArea', coverageArea);
    if (selectedBundleId) params.set('bundle', selectedBundleId);

    const businessName = searchParams.get('businessName');
    const licenseNumber = searchParams.get('licenseNumber');

    if (businessName) params.set('businessName', businessName);
    if (licenseNumber) params.set('licenseNumber', licenseNumber);

    setShowTransition(true);
    const destination =
      licenseNumber && businessName
        ? (() => {
            params.set('companyVerified', 'true');
            params.set('companySource', 'ocr');
            return `/quote/checkout?${params.toString()}`;
          })()
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (showTransition) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 animate-in fade-in duration-300">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <p className="text-base font-semibold text-gray-900">
          {t.results.preparingQuote}
        </p>
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-primary animate-[loading_0.8s_ease-in-out]" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
        <ProgressIndicator
          currentStep={4}
          totalSteps={6}
          label={t.progress.quotes}
        />
      </div>

      <div className="sticky top-0 z-30 border-y border-gray-200 bg-[#F7F8FC]/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div>
            <button
              onClick={handleBack}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="rtl:rotate-180">
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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t.results.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {(t.businessType as Record<string, string>)[businessType?.id ?? ''] || businessType?.title} &middot; {(t.options.emirates as Record<string, string>)[emirate] || emirate}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-6 px-4">
        <div className="flex flex-col gap-4 rounded-[28px] border border-gray-200 bg-white p-3 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
              <button
                onClick={setIndividualTab}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'individual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.results.individualTab}
              </button>
              <button
                onClick={setBundleTab}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'bundles'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {t.results.bundleTab} {'💰'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
            <div className="flex flex-col gap-4">
              <Card className="rounded-[24px] border border-gray-200 bg-white">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {(t.businessType as Record<string, string>)[businessType?.id ?? ''] || businessType?.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {(t.businessTypeDescriptions as Record<string, string>)[businessType?.id ?? ''] || businessType?.description}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                      {(t.options.employeeBands as Record<string, string>)[employeeBand] || employeeBand} {t.results.employees}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-gray-600">
                    <SummaryRow
                      label={t.results.industry}
                      value={((t.businessType as Record<string, string>)[businessType?.id ?? '']) || (businessType?.title ?? '-')}
                    />
                    <SummaryRow
                      label={t.results.emirate}
                      value={(t.options.emirates as Record<string, string>)[emirate] || emirate}
                    />
                    <SummaryRow
                      label={t.results.coverage}
                      value={coverageType || '-'}
                    />
                    <SummaryRow
                      label={t.results.summaryFrom}
                      value={formatMonthlyTotal(resultsHeadingPrice)}
                      valueClassName="text-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                  {t.results.includedCovers}
                </p>
                {selectedBundle && (
                  <p className="mb-3 text-xs text-primary">
                    {t.results.showingBundleQuotes.replace(
                      '{bundle}',
                      bundleCopy[selectedBundle.copyKey].title,
                    )}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {availableProductIds.map((productId) => {
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
                            : 'border border-gray-200 bg-white text-gray-500 hover:border-primary/40'
                        }`}>
                        {PRODUCT_ICONS[productId] ? (
                          PRODUCT_ICONS[productId]({
                            className: 'h-4 w-4',
                          })
                        ) : (
                          <span>{product.icon}</span>
                        )}
                        <span>{(t.products as Record<string, {name: string; shortName: string}>)[productId]?.shortName || product.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
                  {t.results.coverageLimits}
                </p>
                {activeProductIds.map((productId) => {
                  const product = productsMap[productId];
                  if (!product) return null;

                  return (
                    <div
                      key={productId}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {PRODUCT_ICONS[productId] ? (
                          PRODUCT_ICONS[productId]({
                            className: 'h-4 w-4',
                          })
                        ) : (
                          <span>{product.icon}</span>
                        )}
                        <span>{product.shortName}</span>
                      </div>

                      <select
                        value={coverageLimits[productId] ?? '1M'}
                        onChange={(event) =>
                          updateCoverageLimit(
                            productId,
                            event.target.value,
                          )
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="1M">
                          {t.results.coverageLimit1m}
                        </option>
                        <option value="2M">
                          {t.results.coverageLimit2m}
                        </option>
                        <option value="5M">
                          {t.results.coverageLimit5m}
                        </option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  {activeTab === 'individual' ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setShowFilters((current) => !current)
                        }
                        className="gap-1.5 text-sm text-primary hover:bg-primary/5">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          className="rtl:rotate-180">
                          <path
                            d="M2 4.667h12M4.667 8h6.666M6.667 11.333h2.666"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        {t.results.filterLabel}
                        {activeFilterCount > 0 && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>

                      <select
                        value={sortBy}
                        onChange={(event) =>
                          setSortBy(
                            event.target.value as 'price' | 'rating',
                          )
                        }
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option value="price">
                          {t.results.sortLowest}
                        </option>
                        <option value="rating">
                          {t.results.sortRating}
                        </option>
                      </select>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-gray-700">
                      {bundles.length} {t.results.bundleCount}
                    </p>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-500">
                  {activeTab === 'individual'
                    ? `${insurerQuotes.length} ${t.common.of} ${eligibleQuotes.length} ${t.results.quotes}`
                    : `${bundles.length} ${t.results.bundleCount}`}
                </p>
              </div>

              <p className="text-center text-xs text-gray-500">
                {t.results.finwallPrefix}{' '}
                <span className="font-semibold text-gray-700">
                  {t.results.finwallBrand}
                </span>
              </p>

              {activeTab === 'individual' && showFilters && (
                <Card className="animate-in slide-in-from-top-2 rounded-[24px] border border-gray-200 bg-white duration-200">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {t.results.filters}
                      </p>
                      <button
                        onClick={() => {
                          setShariahOnly(false);
                          setMaxPrice(null);
                        }}
                        className="text-xs text-primary hover:underline">
                        {t.common.clearAll}
                      </button>
                    </div>

                    <label className="flex cursor-pointer items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          {t.results.shariahOnly}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t.results.shariahDesc}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setShariahOnly((current) => !current)
                        }
                        className={`flex h-6 w-10 rounded-full transition-colors duration-200 ${
                          shariahOnly ? 'bg-primary' : 'bg-gray-200'
                        }`}>
                        <span
                          className={`block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            shariahOnly
                              ? 'translate-x-5'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                          {t.results.maxPrice}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {maxPrice === null
                            ? t.results.any
                            : formatMoney(maxPrice)}
                        </p>
                      </div>

                      <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        step={100}
                        value={maxPrice ?? priceRange.max}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setMaxPrice(
                            value >= priceRange.max ? null : value,
                          );
                        }}
                        className="w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-primary"
                      />

                      <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                        <span>{formatMoney(priceRange.min)}</span>
                        <span>{formatMoney(priceRange.max)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'individual' && selectedBundle && (
                <Card className="rounded-[24px] border border-primary/20 bg-primary/[0.04]">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {t.results.showingBundleQuotes.replace(
                            '{bundle}',
                            bundleCopy[selectedBundle.copyKey].title,
                          )}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {t.results.matchingBundleInsurers}
                        </p>
                      </div>

                      <button
                        onClick={handleBackToBundles}
                        className="text-sm font-medium text-primary hover:underline">
                        ← {t.results.backToBundles}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedBundle.productIds.map((productId) => {
                        const product = productsMap[productId];
                        if (!product) return null;

                        return (
                          <span
                            key={productId}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                            <span>{product.icon}</span>
                            <span>{product.shortName}</span>
                          </span>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'individual' ? (
                <div className="flex flex-col gap-4">
                  {insurerQuotes.length === 0 ? (
                    <Card className="rounded-[24px] border border-gray-200 bg-white">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-gray-500">
                          {t.results.noQuotes}
                        </p>
                        <button
                          onClick={() => {
                            setShariahOnly(false);
                            setMaxPrice(null);
                          }}
                          className="mt-2 text-sm text-primary hover:underline">
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
                        isBestPrice={
                          insurer.total ===
                          Math.min(
                            ...insurerQuotes.map(
                              (quote) => quote.total,
                            ),
                          )
                        }
                        isSelected={insurer.id === selectedInsurerId}
                        onSelect={() =>
                          handleSelectToggle(insurer.id)
                        }
                      />
                    ))
                  )}

                  <p className="mt-2 text-center text-xs text-gray-400">
                    {t.results.pricingDisclaimer}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bundles.map((bundle) => (
                    <BundleCard
                      key={bundle.id}
                      title={bundleCopy[bundle.copyKey].title}
                      description={
                        bundleCopy[bundle.copyKey].description
                      }
                      annualPrice={bundle.annualPrice}
                      savings={bundle.savings}
                      chips={bundle.productIds.map((productId) => ({
                        id: productId,
                        shortName:
                          productsMap[productId]?.shortName ??
                          productId,
                        icon: productsMap[productId]?.icon ?? '•',
                      }))}
                      ctaLabel={bundleCopy[bundle.copyKey].cta}
                      badgeLabel={t.results.mostPopular}
                      featured={bundle.featured}
                      onSelect={() => handleBundleSelect(bundle)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedQuote && activeTab === 'individual' && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-0.5">
                <img
                  src={selectedQuote.logo}
                  alt={selectedQuote.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {t.results.continueWith} {selectedQuote.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatMonthlyTotal(selectedQuote.total)} · {t.results.finwallPrefix} <span className="font-semibold">{t.results.finwallBrand}</span>
                </p>
              </div>
            </div>

            <Button
              onClick={handleProceed}
              className="shrink-0 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary/90">
              {t.common.continue}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="ms-1.5 inline rtl:rotate-180">
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
      )}
    </div>
  );
}

function buildCoverageLimitState(
  productIds: string[],
  existing: Record<string, string> = {},
): Record<string, string> {
  return productIds.reduce<Record<string, string>>(
    (limits, productId) => {
      limits[productId] = existing[productId] ?? '1M';
      return limits;
    },
    {},
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span
        className={`text-right font-medium text-gray-900 ${valueClassName ?? ''}`}>
        {value}
      </span>
    </div>
  );
}
