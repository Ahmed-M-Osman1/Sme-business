'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import bundleDeals from '@/config/bundle-deals.json';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
import {BundleCard} from '@/components/quote/bundle-card';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {QuoteCard} from '@/components/quote/quote-card';
import {TammQuoteCard} from '@/components/quote/tamm-quote-card';
import {TammFilterBar} from '@/components/quote/tamm-filter-bar';
import {TammCompareView, type CompareQuote} from '@/components/quote/tamm-compare-view';
import {TammBundleCard} from '@/components/quote/tamm-bundle-card';
import {TammEditDetailsModal, type EditDetailsValues} from '@/components/quote/tamm-edit-details-modal';
import {api} from '@/lib/api-client';
import {useI18n} from '@/lib/i18n';
import {useBrand, type BrandConfig} from '@/lib/brand';
import {
  calculateProductPrice,
  calculateTotalPremium,
  formatPriceWithCurrency,
  getLocationMultiplier,
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

/** Peer data keyed by business type ID for guaranteed matching. */
function getPeerData(brand: BrandConfig): Record<
  string,
  {
    insight: string;
    riskStat: string;
    extras: {name: string; pct: number; reason: string}[];
  }
> { return {
  'cafe-restaurant': {
    insight:
      'Kitchen fires and slip injuries are the top two claim drivers for UAE F&B businesses.',
    riskStat:
      '1 in 4 UAE restaurants makes a liability claim within 3 years',
    extras: [
      {
        name: 'Business Interruption',
        pct: 81,
        reason:
          'Fire or equipment failure can close a kitchen for weeks',
      },
      {
        name: 'Food Contamination',
        pct: 67,
        reason: `Required by ${brand.legalReferences.healthAuthority}/food safety regulators`,
      },
      {
        name: 'Cyber Liability',
        pct: 23,
        reason: 'POS data breaches are rising in hospitality',
      },
    ],
  },
  'retail-trading': {
    insight:
      'Inventory theft and customer injury claims are the primary risks for UAE retail businesses.',
    riskStat:
      '38% of retail businesses file a property claim within 5 years',
    extras: [
      {
        name: 'Business Interruption',
        pct: 74,
        reason: 'Supply chain disruption can halt operations',
      },
      {
        name: 'Cyber Liability',
        pct: 45,
        reason: 'E-commerce data breaches increasing',
      },
      {
        name: 'Stock Throughput',
        pct: 31,
        reason: 'Covers goods in transit and storage',
      },
    ],
  },
  'it-technology': {
    insight:
      'Data breaches and IP disputes are the fastest-growing claims for UAE tech firms.',
    riskStat:
      '62% of UAE tech companies report at least one cyber incident per year',
    extras: [
      {
        name: 'Directors & Officers',
        pct: 55,
        reason: 'Essential as companies take on investors',
      },
      {
        name: 'Cyber Liability',
        pct: 85,
        reason: 'Mandatory under new CBUAE directives',
      },
      {
        name: 'Business Interruption',
        pct: 42,
        reason: 'Server downtime impacts revenue directly',
      },
    ],
  },
  healthcare: {
    insight:
      'Medical malpractice and workplace needlestick injuries drive 60% of healthcare claims.',
    riskStat:
      '1 in 3 UAE clinics faces a malpractice claim within 5 years',
    extras: [
      {
        name: 'Cyber Liability',
        pct: 61,
        reason: 'Patient data protection is legally required',
      },
      {
        name: 'Business Interruption',
        pct: 38,
        reason: 'Equipment failure can shut down operations',
      },
      {
        name: 'Directors & Officers',
        pct: 28,
        reason: 'Regulatory actions against clinic owners rising',
      },
    ],
  },
  construction: {
    insight:
      'Falls and equipment accidents account for 70% of construction worker injury claims in UAE.',
    riskStat:
      'Construction has the highest claim frequency of any UAE industry',
    extras: [
      {
        name: 'Business Interruption',
        pct: 45,
        reason: 'Project delays from accidents are costly',
      },
      {
        name: 'Fleet Insurance',
        pct: 74,
        reason: 'Required for company vehicles on site',
      },
      {
        name: 'Environmental Liability',
        pct: 22,
        reason: 'Pollution incidents carry heavy fines',
      },
    ],
  },
  'law-firm': {
    insight:
      'Client disputes and data breaches are the top risks for UAE legal practices.',
    riskStat:
      '52% of law firms face a professional indemnity claim within 5 years',
    extras: [
      {
        name: 'Directors & Officers',
        pct: 58,
        reason: 'Partners face personal liability exposure',
      },
      {
        name: 'Cyber Liability',
        pct: 62,
        reason:
          'Client confidentiality breaches carry heavy penalties',
      },
      {
        name: 'Business Interruption',
        pct: 30,
        reason: 'Key person absence can halt casework',
      },
    ],
  },
  consulting: {
    insight:
      'Client disputes over deliverables are the #1 claim trigger for UAE consulting firms.',
    riskStat:
      '45% of consulting firms face a PI claim within 5 years',
    extras: [
      {
        name: 'Directors & Officers',
        pct: 52,
        reason: 'Partners need personal liability protection',
      },
      {
        name: 'Cyber Liability',
        pct: 48,
        reason: 'Client data is a prime target',
      },
      {
        name: 'Business Interruption',
        pct: 35,
        reason: 'Key person loss can halt engagements',
      },
    ],
  },
  'general-trading': {
    insight:
      'Import/export businesses face cargo damage and third-party liability as top claim drivers.',
    riskStat:
      '41% of general trading companies file a property or cargo claim within 4 years',
    extras: [
      {
        name: 'Business Interruption',
        pct: 68,
        reason: 'Supply chain delays can halt revenue',
      },
      {
        name: 'Stock Throughput',
        pct: 55,
        reason: 'Covers goods from warehouse to customer',
      },
      {
        name: 'Cyber Liability',
        pct: 28,
        reason: 'Digital invoicing and payment fraud on the rise',
      },
    ],
  },
  logistics: {
    insight:
      'Vehicle accidents and cargo damage account for 65% of logistics insurance claims in UAE.',
    riskStat:
      'Logistics has the second-highest claim frequency after construction',
    extras: [
      {
        name: 'Fleet Insurance',
        pct: 82,
        reason: 'Required for all commercial delivery vehicles',
      },
      {
        name: 'Business Interruption',
        pct: 56,
        reason: 'Vehicle downtime directly impacts revenue',
      },
      {
        name: 'Cargo Insurance',
        pct: 71,
        reason: 'Protects against goods damage in transit',
      },
    ],
  },
  'real-estate': {
    insight:
      'Property damage and tenant disputes are the primary claim triggers for UAE real estate firms.',
    riskStat:
      '35% of real estate firms face a professional liability claim within 5 years',
    extras: [
      {
        name: 'Directors & Officers',
        pct: 45,
        reason: 'Developer liability exposure is increasing',
      },
      {
        name: 'Cyber Liability',
        pct: 32,
        reason: 'Tenant data and payment processing at risk',
      },
      {
        name: 'Business Interruption',
        pct: 40,
        reason: 'Project delays carry significant cost',
      },
    ],
  },
}; }

/** Fixed annual price per add-on extra (AED). */
const EXTRA_PRICES: Record<string, number> = {
  'Business Interruption': 350,
  'Food Contamination': 280,
  'Cyber Liability': 420,
  'Stock Throughput': 300,
  'Directors & Officers': 480,
  'Environmental Liability': 250,
  'Fleet Insurance': 550,
  'Cargo Insurance': 400,
};

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
  const brand = useBrand();
  const isTamm = brand.id === 'tamm';
  const emirate = searchParams.get('emirate') ?? brand.defaultLocation;
  const locationMultiplier = getLocationMultiplier(emirate, brand.locationMultipliers);
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
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const [showCompareSidebar, setShowCompareSidebar] = useState(false);
  const [showCompareView, setShowCompareView] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [sortOrder, setSortOrder] = useState<'low-high' | 'high-low'>('low-high');
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
  const [monthly, setMonthly] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [addedExtras, setAddedExtras] = useState<Set<string>>(
    new Set(),
  );
  const [perPage, setPerPage] = useState<6 | 9 | 12>(6);
  const [pageIndex, setPageIndex] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshingQuotes, setRefreshingQuotes] = useState(false);
  const extrasTotal = useMemo(
    () =>
      Array.from(addedExtras).reduce(
        (sum, name) => sum + (EXTRA_PRICES[name] ?? 300),
        0,
      ),
    [addedExtras],
  );
  const [detailExpanded, setDetailExpanded] = useState(true);
  const detailContentRef = useRef<HTMLDivElement>(null);
  const [detailHeight, setDetailHeight] = useState(0);

  useEffect(() => {
    if (detailContentRef.current) {
      setDetailHeight(detailContentRef.current.scrollHeight);
    }
  }, [detailExpanded, activeProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setDetailExpanded(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
  const displayPrice = (annualAmount: number) =>
    monthly
      ? `${formatMoney(Math.round((annualAmount * 1.08) / 12))}${t.common.perMonth}`
      : `${formatMoney(annualAmount)}/${locale === 'ar' ? 'سنوياً' : 'yr'}`;
  const allQuotes = useMemo<EnrichedInsurerQuote[]>(() => {
    if (!businessType) return [];

    return insurers.map((insurer) => {
      const basePremium = calculateTotalPremium(
        {
          productIds: Array.from(activeProducts),
          riskFactor: businessType.riskFactor,
          sizeFactor,
          coverageLimits,
          insurerMultiplier: insurer.priceMultiplier,
        },
        productsMap,
      );
      const calculatedTotal = Math.round(basePremium * locationMultiplier);

      return {
        ...insurer,
        calculatedTotal,
        total: calculatedTotal,
      };
    });
  }, [
    activeProducts,
    businessType,
    coverageLimits,
    insurers,
    locationMultiplier,
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

      const direction = isTamm && sortOrder === 'high-low' ? -1 : 1;
      return (left.total - right.total) * direction;
    });

    return filtered;
  }, [eligibleQuotes, isTamm, maxPrice, shariahOnly, sortBy, sortOrder]);

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
      (productId) =>
        (
          t.products as Record<
            string,
            {name: string; shortName: string}
          >
        )[productId]?.shortName ||
        (productsMap[productId]?.shortName ?? productId),
    )
    .join(' + ');

  const benefits = activeProductIds.map((productId) => ({
    name:
      (
        t.products as Record<
          string,
          {name: string; shortName: string}
        >
      )[productId]?.name ||
      (productsMap[productId]?.name ?? productId),
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
    setSelectedBundleId(null);
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
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  function handleBackToBundles() {
    setSelectedBundleId(null);
    setSelectedInsurerId(null);
  }

  function clearBundleSelection() {
    if (!selectedBundle) return;

    setSelectedBundleId(null);
    setSelectedInsurerId(null);
  }

  const mandatoryProducts = useMemo(() => {
    const mandatory = new Set<string>();
    if (employeeBand !== '1') mandatory.add('workers-comp');
    const healthLocs = brand.healthInsuranceMandatoryLocations;
    const healthMandatory =
      healthLocs.includes('*') || healthLocs.includes(emirate);
    if (healthMandatory && availableProductIds.includes('health')) {
      mandatory.add('health');
    }
    return mandatory;
  }, [employeeBand, emirate, availableProductIds, brand]);

  function toggleProduct(productId: string) {
    if (mandatoryProducts.has(productId)) return;
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

  function toggleCompare(insurerId: string) {
    setCompareIds((current) => {
      const next = new Set(current);
      if (next.has(insurerId)) {
        next.delete(insurerId);
      } else if (next.size < 4) {
        next.add(insurerId);
      }
      return next;
    });
  }

  const compareQuotes: CompareQuote[] = useMemo(() => {
    return Array.from(compareIds).map((id) => {
      const insurer = insurerQuotes.find((q) => q.id === id);
      if (!insurer) return null;
      const lines = activeProductIds.map((pid) => {
        const product = productsMap[pid];
        const limit = coverageLimits[pid] ?? '1M';
        return {
          name: (t.products as Record<string, {name: string; shortName: string}>)[pid]?.name || product?.name || pid,
          limit: `AED ${limit === '1M' ? '1,000,000' : limit === '2M' ? '2,000,000' : '5,000,000'}`,
          mandatory: mandatoryProducts.has(pid),
        };
      });
      return {
        id: insurer.id,
        name: insurer.name,
        logo: insurer.logo,
        rating: insurer.rating,
        shariahCompliant: insurer.shariahCompliant,
        total: insurer.total + extrasTotal,
        productLines: lines,
      };
    }).filter(Boolean) as CompareQuote[];
  }, [compareIds, insurerQuotes, activeProductIds, productsMap, coverageLimits, t.products, mandatoryProducts, extrasTotal]);

  function handleProceed() {
    if (!selectedQuote) return;
    handleNavigate(selectedQuote.id, selectedQuote.total);
  }

  function handleNavigate(insurerId: string, total: number) {
    const totalWithExtras = total + extrasTotal;
    const params = new URLSearchParams({
      type: typeId,
      insurer: insurerId,
      total: String(totalWithExtras),
      products: activeProductIds.join(','),
      limits: JSON.stringify(coverageLimits),
      source,
      employees: employeeBand,
      emirate,
      billing: monthly ? 'monthly' : 'annual',
    });

    if (addedExtras.size > 0) {
      params.set('extras', Array.from(addedExtras).join(','));
    }

    if (revenue) params.set('revenue', revenue);
    if (coverageArea) params.set('coverageArea', coverageArea);
    if (selectedBundleId) params.set('bundle', selectedBundleId);

    const businessName = searchParams.get('businessName');
    const licenseNumber = searchParams.get('licenseNumber');

    if (businessName) params.set('businessName', businessName);
    if (licenseNumber) params.set('licenseNumber', licenseNumber);

    const activity = searchParams.get('activity');
    const licenceExpiry = searchParams.get('licenceExpiry');
    if (activity) params.set('activity', activity);
    if (licenceExpiry) params.set('licenceExpiry', licenceExpiry);

    setShowTransition(true);
    const destination = (() => {
      if (isTamm) {
        if (licenseNumber && businessName) {
          params.set('companyVerified', 'true');
          params.set('companySource', searchParams.get('uaepass') === 'true' ? 'uaepass' : 'ocr');
        }
        return `${brand.basePath}/quote/detail?${params.toString()}`;
      }
      if (licenseNumber && businessName) {
        params.set('companyVerified', 'true');
        params.set('companySource', 'ocr');
        return `${brand.basePath}/quote/checkout?${params.toString()}`;
      }
      return `${brand.basePath}/quote/company-details?${params.toString()}`;
    })();

    setTimeout(() => {
      router.push(destination);
    }, NAVIGATION_DELAY_MS);
  }

  function handleBack() {
    router.back();
  }

  function handleEditConfirm(next: EditDetailsValues) {
    setEditOpen(false);
    setRefreshingQuotes(true);
    setCoverageLimits(next.limits);

    const params = new URLSearchParams(searchParams.toString());
    params.set('employees', next.employees);
    params.set('revenue', next.revenue);
    params.set('emirate', next.emirate);
    router.replace(`?${params.toString()}`, {scroll: false});

    setPageIndex(0);
    setSelectedInsurerId(null);

    setTimeout(() => {
      setRefreshingQuotes(false);
    }, 1500);
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

  if (isTamm) {
    if (showCompareView && compareQuotes.length >= 2) {
      return (
        <TammCompareView
          quotes={compareQuotes}
          monthly={monthly}
          coverageType={coverageType}
          onSelect={(insurerId, total) => handleNavigate(insurerId, total)}
          onBack={() => setShowCompareView(false)}
        />
      );
    }

    const lowestPrice = insurerQuotes.length > 0 ? Math.min(...insurerQuotes.map((q) => q.total)) : 0;

    return (
      <div className="pb-12 relative">

        {/* Title + description */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-[#12121B]">{t.tamm.results.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">{t.tamm.results.description}</p>
        </div>

        {/* Business summary card */}
        <div className="mb-5 rounded-xl bg-white p-4 relative" style={{border: '1px solid #E2E8F0'}}>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label={t.tamm.results.editDetails}
            title={t.tamm.results.editDetails}
            className="absolute top-3 inset-e-3 inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#169F9F] hover:bg-[#E8F7F7] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M11.5 2.5l2 2-7 7H4.5v-2l7-7zM10.5 3.5l2 2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-3 pe-12">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{background: '#F1F5F9'}}>
              {businessType?.icon ?? '🏢'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#12121B]">
                {(t.businessType as Record<string, string>)[businessType?.id ?? ''] || businessType?.title || 'Your Business'}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#94A3B8]">
                <span>{(t.options.employeeBands as Record<string, string>)[employeeBand] || employeeBand} {t.tamm.results.employees}</span>
                <span>·</span>
                <span>{(t.options.emirates as Record<string, string>)[emirate] || emirate}</span>
                {coverageType && (
                  <>
                    <span>·</span>
                    <span>{coverageType}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Annual/Monthly toggle + count */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{background: '#F1F5F9'}}>
            <button
              onClick={() => setMonthly(false)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: !monthly ? 'white' : 'transparent',
                color: !monthly ? '#12121B' : '#94A3B8',
                boxShadow: !monthly ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
              }}>
              {t.tamm.results.annual}
            </button>
            <button
              onClick={() => setMonthly(true)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: monthly ? 'white' : 'transparent',
                color: monthly ? '#12121B' : '#94A3B8',
                boxShadow: monthly ? '0 1px 3px rgba(0,0,0,0.08)' : undefined,
              }}>
              {t.tamm.results.monthly}
            </button>
          </div>
          <p className="text-xs text-[#94A3B8]">
            {activeTab === 'individual'
              ? `${insurerQuotes.length} ${t.tamm.results.quotesAvailable}`
              : `${bundles.length} ${t.tamm.results.bundleDeals}`}
          </p>
        </div>

        {/* Filter bar */}
        <TammFilterBar
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          activeTab={activeTab === 'individual' ? t.tamm.filterBar.individualQuotes : t.tamm.filterBar.bundleDeals}
          onTabChange={(tab) => {
            if (tab === t.tamm.filterBar.individualQuotes) setIndividualTab();
            else setBundleTab();
          }}
          onFilterClick={() => setShowFilters(true)}
          shariahOnly={shariahOnly}
          onShariahChange={setShariahOnly}
          compareCount={compareIds.size}
          onCompareClick={() => setShowCompareSidebar(true)}
        />

        {/* Content: 3-col quote grid OR bundle grid */}
        {activeTab === 'individual' ? (
          <>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {insurerQuotes.length === 0 ? (
              <div className="col-span-3 py-12 text-center">
                <p className="text-sm text-[#94A3B8]">{t.results.noQuotes}</p>
                <button
                  onClick={() => { setShariahOnly(false); setMaxPrice(null); }}
                  className="mt-2 text-sm font-medium"
                  style={{color: '#169F9F'}}>
                  {t.results.clearFilters}
                </button>
              </div>
            ) : (
              insurerQuotes.slice(pageIndex * perPage, (pageIndex + 1) * perPage).map((insurer, idx) => {
                const isBest = insurer.total === lowestPrice;
                const lines = activeProductIds
                  .map((pid) => {
                    const product = productsMap[pid];
                    if (!product) return null;
                    const limit = coverageLimits[pid] ?? '1M';
                    const price = Math.round(
                      calculateProductPrice(pid, businessType?.riskFactor ?? 1, sizeFactor, limit, productsMap) * insurer.priceMultiplier,
                    );
                    const productT = (t.products as Record<string, {name: string; shortName: string}>)[pid];
                    return {
                      name: productT?.name || product.name,
                      icon: product.icon,
                      limit: `AED ${limit === '1M' ? '1,000,000' : limit === '2M' ? '2,000,000' : '5,000,000'}`,
                      price,
                      mandatory: mandatoryProducts.has(pid),
                    };
                  })
                  .filter(Boolean) as {name: string; icon: string; limit: string; price: number; mandatory: boolean}[];
                const extraLines = Array.from(addedExtras).map((extraName) => ({
                  name: `+ ${extraName}`,
                  icon: '🛡️',
                  limit: 'Add-on',
                  price: EXTRA_PRICES[extraName] ?? 300,
                  mandatory: false,
                }));
                const cardTotal = insurer.total + extrasTotal;
                return (
                  <TammQuoteCard
                    key={insurer.id}
                    insurer={{
                      id: insurer.id,
                      name: insurer.name,
                      logo: insurer.logo,
                      rating: insurer.rating,
                      shariahCompliant: insurer.shariahCompliant,
                      total: cardTotal,
                    }}
                    coverageType={coverageType}
                    benefits={benefits}
                    productLines={[...lines, ...extraLines]}
                    isBestPrice={isBest}
                    isRecommended={idx === 0}
                    monthly={monthly}
                    onSelect={() => handleNavigate(insurer.id, cardTotal)}
                  />
                );
              })
            )}
          </div>

          {/* Pagination */}
          {insurerQuotes.length > 0 && (() => {
            const totalPages = Math.max(1, Math.ceil(insurerQuotes.length / perPage));
            const safePage = Math.min(pageIndex, totalPages - 1);
            return (
              <div className="mt-6 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[#E8ECF0]">
                <label className="flex items-center gap-2 text-sm text-text">
                  <span>{t.tamm.pagination.showPerPage}</span>
                  <div className="relative">
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value) as 6 | 9 | 12);
                        setPageIndex(0);
                      }}
                      className="appearance-none rounded-md border border-[#E2E8F0] bg-white ps-3 pe-7 py-1.5 text-sm font-semibold cursor-pointer outline-none focus:border-[#169F9F]"
                      aria-label={t.tamm.pagination.showPerPage}>
                      <option value={6}>6</option>
                      <option value={9}>9</option>
                      <option value={12}>12</option>
                    </select>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden
                      className="pointer-events-none absolute inset-e-2 top-1/2 -translate-y-1/2 text-[#475569]">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </label>

                <div className="flex items-center gap-1">
                  {Array.from({length: totalPages}, (_, i) => i).map((p) => {
                    const isActive = p === safePage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPageIndex(p)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`min-w-9 h-9 rounded-md text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#F1F5F9] text-text'
                            : 'text-text-muted hover:bg-[#F8FAFB]'
                        }`}>
                        {p + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          </>
        ) : (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bundles.map((bundle) => {
              const eligibleInsurers = insurers.filter((ins) => bundle.eligibleInsurerIds.includes(ins.id));
              const bundlePrices = eligibleInsurers.map((ins) =>
                Math.round(
                  calculateTotalPremium(
                    {productIds: bundle.productIds, riskFactor: businessType?.riskFactor ?? 1, sizeFactor, coverageLimits, insurerMultiplier: ins.priceMultiplier},
                    productsMap,
                  ) * locationMultiplier,
                ),
              );
              const lowestBundlePrice = bundlePrices.length > 0 ? Math.min(...bundlePrices) : bundle.annualPrice;
              const discountRate = bundle.benchmarkAnnualPrice > 0 ? 1 - bundle.annualPrice / bundle.benchmarkAnnualPrice : 0.1;
              const discountedPrice = Math.round(lowestBundlePrice * (1 - discountRate));
              return (
                <TammBundleCard
                  key={bundle.id}
                  title={bundleCopy[bundle.copyKey].title}
                  description={bundleCopy[bundle.copyKey].description}
                  annualPrice={discountedPrice}
                  savings={lowestBundlePrice - discountedPrice}
                  chips={bundle.productIds.map((pid) => ({
                    id: pid,
                    shortName: productsMap[pid]?.shortName ?? pid,
                    icon: productsMap[pid]?.icon ?? '•',
                  }))}
                  ctaLabel={bundleCopy[bundle.copyKey].cta}
                  badgeLabel={t.results.mostPopular}
                  featured={bundle.featured}
                  monthly={monthly}
                  onSelect={() => {
                    handleBundleSelect(bundle);
                    setActiveTab('individual');
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Filter sidebar */}
        {showFilters && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowFilters(false)} />
            <aside
              className="fixed inset-y-0 inset-s-0 z-50 flex w-72 flex-col bg-white shadow-xl"
              style={{borderRight: '1px solid #E2E8F0'}}>
              <div className="flex items-center justify-between px-5 py-4" style={{borderBottom: '1px solid #E2E8F0'}}>
                <h2 className="text-sm font-semibold text-[#12121B]">{t.results.filters}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#12121B]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{t.tamm.results.compliance}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#12121B]">{t.results.shariahOnly}</p>
                      <p className="mt-0.5 text-xs text-[#94A3B8]">{t.results.shariahDesc}</p>
                    </div>
                    <button
                      onClick={() => setShariahOnly((c) => !c)}
                      className="ms-3 flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200"
                      style={{background: shariahOnly ? '#169F9F' : '#E2E8F0'}}>
                      <span
                        className="block h-4 w-4 self-center rounded-full bg-white shadow transition-transform duration-200"
                        style={{transform: shariahOnly ? 'translateX(20px)' : 'translateX(4px)'}}
                      />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">{t.results.maxPrice}</p>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-[#475569]">{t.tamm.results.upTo}</span>
                    <span className="text-xs font-semibold text-[#12121B]">
                      {maxPrice === null ? t.results.any : formatMoney(maxPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={100}
                    value={maxPrice ?? priceRange.max}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMaxPrice(v >= priceRange.max ? null : v);
                    }}
                    className="w-full cursor-pointer appearance-none rounded-full"
                    style={{accentColor: '#169F9F'}}
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-[#94A3B8]">
                    <span>{formatMoney(priceRange.min)}</span>
                    <span>{formatMoney(priceRange.max)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-5 py-4" style={{borderTop: '1px solid #E2E8F0'}}>
                <button
                  onClick={() => { setShariahOnly(false); setMaxPrice(null); }}
                  className="flex-1 rounded-lg py-2 text-sm font-medium"
                  style={{border: '1px solid #E2E8F0', color: '#475569'}}>
                  {t.common.clearAll}
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 rounded-lg py-2 text-sm font-semibold text-white"
                  style={{background: '#169F9F'}}>
                  {t.tamm.results.apply}
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Compare selection sidebar — shows ALL quotes, user selects from here */}
        {showCompareSidebar && (
          <>
            <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowCompareSidebar(false)} />
            <aside
              className="fixed inset-y-0 inset-e-0 z-50 flex w-80 flex-col bg-white shadow-xl"
              style={{borderLeft: '1px solid #E2E8F0'}}>
              <div className="flex items-center justify-between px-5 py-4" style={{borderBottom: '1px solid #E2E8F0'}}>
                <div>
                  <h2 className="text-sm font-semibold text-[#12121B]">{t.tamm.compare.title}</h2>
                  <p className="mt-0.5 text-xs text-[#94A3B8]">
                    {compareIds.size} {t.tamm.compare.outOf} {t.tamm.compare.max} {t.tamm.compare.quotesSelected}
                  </p>
                </div>
                <button
                  onClick={() => setShowCompareSidebar(false)}
                  className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#12121B]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <p className="px-5 pt-3 pb-1 text-xs text-[#94A3B8]">{t.tamm.compare.selectHint}</p>

              <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
                {insurerQuotes.map((insurer) => {
                  const isSelected = compareIds.has(insurer.id);
                  const isDisabled = !isSelected && compareIds.size >= 4;
                  const cardTotal = insurer.total + extrasTotal;
                  const initials = insurer.name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
                  return (
                    <button
                      key={insurer.id}
                      type="button"
                      onClick={() => !isDisabled && toggleCompare(insurer.id)}
                      disabled={isDisabled}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        border: isSelected ? '1.5px solid #169F9F' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0FAFA' : 'white',
                      }}>
                      {/* Checkbox */}
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                        style={{
                          border: isSelected ? '1.5px solid #169F9F' : '1.5px solid #CBD5E0',
                          background: isSelected ? '#169F9F' : 'white',
                        }}>
                        {isSelected && (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      {/* Logo */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                        style={{border: '1px solid #E2E8F0', background: '#F8FAFB'}}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={insurer.logo} alt={insurer.name} className="h-full w-full object-contain"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            img.style.display = 'none';
                            img.parentElement!.textContent = initials;
                          }} />
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#12121B] truncate">{insurer.name}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {t.common.currency} {(monthly ? Math.round(cardTotal * 1.08 / 12) : cardTotal).toLocaleString()}
                          {monthly ? ` / ${t.tamm.results.monthly.toLowerCase()}` : ` / ${t.tamm.results.annual.toLowerCase()}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 px-5 py-4" style={{borderTop: '1px solid #E2E8F0'}}>
                {compareIds.size === 1 && (
                  <p className="text-center text-[10px] text-[#94A3B8]">{t.tamm.compare.minTwoRequired}</p>
                )}
                <button
                  onClick={() => {
                    if (compareIds.size >= 2) {
                      setShowCompareSidebar(false);
                      setShowCompareView(true);
                    }
                  }}
                  disabled={compareIds.size < 2}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{background: '#169F9F'}}>
                  {t.tamm.compare.compareBtn}{compareIds.size >= 2 ? ` (${compareIds.size})` : ''}
                </button>
                <button
                  onClick={() => { setCompareIds(new Set()); setShowCompareSidebar(false); }}
                  className="w-full rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{color: '#94A3B8'}}>
                  {t.tamm.compare.clearAll}
                </button>
              </div>
            </aside>
          </>
        )}

        <TammEditDetailsModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onConfirm={handleEditConfirm}
          businessTypeLabel={
            (t.businessType as Record<string, string>)[businessType?.id ?? ''] ||
            businessType?.title ||
            ''
          }
          businessName={searchParams.get('businessName') ?? undefined}
          initialEmployees={employeeBand}
          initialRevenue={revenue}
          initialEmirate={emirate}
          activeProducts={activeProductIds.map((pid) => ({
            id: pid,
            name:
              (t.products as Record<string, {name: string; shortName: string}>)[pid]?.name ||
              productsMap[pid]?.name ||
              pid,
            mandatory: mandatoryProducts.has(pid),
          }))}
          initialLimits={coverageLimits}
          emirateOptions={brand.locations.map((l) => ({
            label:
              (t.options.emirates as Record<string, string>)[l.value] ?? l.label,
            value: l.value,
          }))}
        />

        {refreshingQuotes && (
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-40 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent border-[#169F9F]" />
            <p className="text-sm font-semibold text-text">
              {t.tamm.results.refreshingQuotes}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
        {!isTamm && <ProgressIndicator
          currentStep={4}
          totalSteps={6}
          label={t.progress.quotes}
        />}

        {searchParams.get('uaepass') === 'true' && (
          <div className="rounded-xl border border-green-200/20 bg-green-50 px-4 py-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-600 shrink-0">
              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-green-700">
              {locale === 'ar' ? 'تم التعبئة من UAE PASS' : 'Pre-filled from UAE PASS'} &#x2713;
            </span>
          </div>
        )}
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {t.results.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {(t.businessType as Record<string, string>)[
                  businessType?.id ?? ''
                ] || businessType?.title}{' '}
                &middot;{' '}
                {(t.options.emirates as Record<string, string>)[
                  emirate
                ] || emirate}
              </p>
            </div>
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
              <div className="rounded-3xl border border-gray-200 bg-white overflow-hidden">
                {/* Collapsed summary — always visible */}
                <button
                  type="button"
                  onClick={() => setDetailExpanded((p) => !p)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-start">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">
                      {businessType?.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {(t.businessType as Record<string, string>)[
                          businessType?.id ?? ''
                        ] || businessType?.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(
                          t.options.employeeBands as Record<
                            string,
                            string
                          >
                        )[employeeBand] || employeeBand}{' '}
                        {t.results.employees} &middot;{' '}
                        {(
                          t.options.emirates as Record<string, string>
                        )[emirate] || emirate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {displayPrice(resultsHeadingPrice)}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className={`text-gray-400 transition-transform duration-300 ${detailExpanded ? 'rotate-180' : ''}`}>
                      <path
                        d="M3.5 5.25L7 8.75L10.5 5.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expandable detail */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: detailExpanded
                      ? `${detailHeight + 20}px`
                      : '0px',
                    opacity: detailExpanded ? 1 : 0,
                  }}>
                  <div
                    ref={detailContentRef}
                    className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      {(
                        t.businessTypeDescriptions as Record<
                          string,
                          string
                        >
                      )[businessType?.id ?? ''] ||
                        businessType?.description}
                    </p>
                    <div className="space-y-3 text-sm text-gray-600">
                      <SummaryRow
                        label={t.results.industry}
                        value={
                          (t.businessType as Record<string, string>)[
                            businessType?.id ?? ''
                          ] ||
                          (businessType?.title ?? '-')
                        }
                      />
                      <SummaryRow
                        label={brand.locationLabel}
                        value={
                          (
                            t.options.emirates as Record<
                              string,
                              string
                            >
                          )[emirate] || emirate
                        }
                      />
                      <SummaryRow
                        label={t.results.coverage}
                        value={coverageType || '-'}
                      />
                      <SummaryRow
                        label={t.results.summaryFrom}
                        value={displayPrice(resultsHeadingPrice)}
                        valueClassName="text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

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

                    const isMandatory =
                      mandatoryProducts.has(productId);
                    return (
                      <button
                        key={productId}
                        onClick={() => toggleProduct(productId)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                          isMandatory
                            ? 'bg-primary text-white shadow-sm cursor-default'
                            : isActive
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
                        <span>
                          {(
                            t.products as Record<
                              string,
                              {name: string; shortName: string}
                            >
                          )[productId]?.shortName ||
                            product.shortName}
                        </span>
                        {isMandatory && (
                          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                            {locale === 'ar' ? 'مطلوب' : 'Required'}
                          </span>
                        )}
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
                        <span>
                          {(
                            t.products as Record<
                              string,
                              {name: string; shortName: string}
                            >
                          )[productId]?.name || product.name}
                        </span>
                      </div>

                      <div className="flex gap-1">
                        {(['1M', '2M', '5M'] as const).map(
                          (limit) => {
                            const isActive =
                              (coverageLimits[productId] ?? '1M') ===
                              limit;
                            return (
                              <button
                                key={limit}
                                onClick={() =>
                                  updateCoverageLimit(
                                    productId,
                                    limit,
                                  )
                                }
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                  isActive
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {limit}
                              </button>
                            );
                          },
                        )}
                      </div>
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

                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-gray-500 hidden sm:block">
                    {activeTab === 'individual'
                      ? `${insurerQuotes.length} ${t.common.of} ${eligibleQuotes.length} ${t.results.quotes}`
                      : `${bundles.length} ${t.results.bundleCount}`}
                  </p>
                  <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 shrink-0">
                    <button
                      onClick={() => setMonthly(false)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${!monthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                      {locale === 'ar' ? 'سنوي' : 'Annual'}
                    </button>
                    <button
                      onClick={() => setMonthly(true)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${monthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                      {locale === 'ar' ? 'شهري' : 'Monthly'}
                    </button>
                  </div>
                </div>
              </div>

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

              {/* AI Insights panel */}
              {(() => {
                const peer = getPeerData(brand)[typeId] ?? null;
                const teaserExtra = peer?.extras[0];

                if (!peer) return null;

                return (
                  <div className="rounded-2xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setShowInsights((p) => !p)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-start transition-colors ${showInsights ? 'bg-linear-to-r from-primary/10 to-primary/5' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-primary">
                          {locale === 'ar'
                            ? 'رؤى شوري الذكية'
                            : 'Shory AI Insights'}
                        </p>
                        {!showInsights && teaserExtra && (
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {teaserExtra.pct}%{' '}
                            {locale === 'ar'
                              ? 'من الشركات المشابهة تضيف'
                              : 'of similar businesses add'}{' '}
                            {teaserExtra.name}
                          </p>
                        )}
                      </div>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={`shrink-0 text-gray-400 transition-transform duration-300 ${showInsights ? 'rotate-180' : ''}`}>
                        <path
                          d="M3.5 5.25L7 8.75L10.5 5.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: showInsights ? '600px' : '0px',
                        opacity: showInsights ? 1 : 0,
                      }}>
                      <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                        <div className="rounded-xl bg-linear-to-r from-primary/10 to-primary/5 p-3">
                          <p className="text-sm font-medium text-gray-900 italic">
                            {peer.insight}
                          </p>
                          <p className="text-[11px] text-primary mt-1">
                            {peer.riskStat}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {locale === 'ar'
                              ? 'ما تضيفه الشركات المشابهة'
                              : 'What similar businesses add'}
                          </p>
                          <div className="space-y-2.5">
                            {peer.extras.map((extra) => {
                              const isAdded = addedExtras.has(
                                extra.name,
                              );
                              return (
                                <div
                                  key={extra.name}
                                  className={`rounded-xl border p-3 ${isAdded ? 'border-primary bg-primary/5' : extra.pct >= 70 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-gray-50/50'}`}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-gray-900">
                                      {extra.name}
                                    </span>
                                    <span className="text-[10px] font-bold text-primary">
                                      {extra.pct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden mb-1.5">
                                    <div
                                      className="h-full rounded-full bg-primary transition-all"
                                      style={{width: `${extra.pct}%`}}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-[11px] text-gray-500 flex-1">
                                      {extra.reason}
                                    </p>
                                    <button
                                      onClick={() =>
                                        setAddedExtras((prev) => {
                                          const next = new Set(prev);
                                          if (next.has(extra.name))
                                            next.delete(extra.name);
                                          else next.add(extra.name);
                                          return next;
                                        })
                                      }
                                      className={`shrink-0 ms-2 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-all ${
                                        isAdded
                                          ? 'bg-primary text-white'
                                          : 'border border-primary text-primary hover:bg-primary/5'
                                      }`}>
                                      {isAdded
                                        ? locale === 'ar'
                                          ? '✓ مضاف'
                                          : '✓ Added'
                                        : locale === 'ar'
                                          ? '+ إضافة'
                                          : '+ Add'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'individual' || selectedBundle ? (
                <div className="flex flex-col gap-4">
                  {selectedBundle && (
                    <button
                      onClick={handleBackToBundles}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:underline self-start">
                      {t.results.backToBundles}
                    </button>
                  )}

                  {isTamm && (
                    <TammFilterBar
                      sortOrder={sortOrder}
                      onSortChange={setSortOrder}
                    />
                  )}

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
                    insurerQuotes.map((insurer, idx) => {
                      const lowestPrice = Math.min(
                        ...insurerQuotes.map((q) => q.total),
                      );
                      const isBest = insurer.total === lowestPrice;
                      const categoryLabel =
                        (t.businessType as Record<string, string>)[
                          businessType?.id ?? ''
                        ] ||
                        businessType?.title ||
                        '';
                      const lines = activeProductIds
                        .map((pid) => {
                          const product = productsMap[pid];
                          if (!product) return null;
                          const limit = coverageLimits[pid] ?? '1M';
                          const price = Math.round(
                            calculateProductPrice(
                              pid,
                              businessType?.riskFactor ?? 1,
                              sizeFactor,
                              limit,
                              productsMap,
                            ) * insurer.priceMultiplier,
                          );
                          const productT = (
                            t.products as Record<
                              string,
                              {name: string; shortName: string}
                            >
                          )[pid];
                          return {
                            name: productT?.name || product.name,
                            icon: product.icon,
                            limit: `AED ${limit === '1M' ? '1,000,000' : limit === '2M' ? '2,000,000' : '5,000,000'}`,
                            price,
                            mandatory: mandatoryProducts.has(pid),
                          };
                        })
                        .filter(Boolean) as {
                        name: string;
                        icon: string;
                        limit: string;
                        price: number;
                        mandatory: boolean;
                      }[];
                      // Append added extras as line items
                      const extraLines = Array.from(addedExtras).map(
                        (extraName) => ({
                          name: `+ ${extraName}`,
                          icon: '🛡️',
                          limit: 'Add-on',
                          price: EXTRA_PRICES[extraName] ?? 300,
                          mandatory: false,
                        }),
                      );
                      const allLines = [...lines, ...extraLines];
                      const cardTotal = insurer.total + extrasTotal;
                      return isTamm ? (
                        <TammQuoteCard
                          key={insurer.id}
                          insurer={{
                            id: insurer.id,
                            name: insurer.name,
                            logo: insurer.logo,
                            rating: insurer.rating,
                            shariahCompliant: insurer.shariahCompliant,
                            total: cardTotal,
                          }}
                          coverageType={coverageType}
                          benefits={benefits}
                          productLines={allLines}
                          isBestPrice={isBest}
                          isRecommended={idx === 0}
                          monthly={monthly}
                          onSelect={() =>
                            handleNavigate(insurer.id, cardTotal)
                          }
                        />
                      ) : (
                        <QuoteCard
                          key={insurer.id}
                          insurer={{...insurer, total: cardTotal}}
                          coverageType={coverageType}
                          benefits={benefits}
                          productLines={allLines}
                          isBestPrice={isBest}
                          isRecommended={idx === 0}
                          businessCategory={categoryLabel}
                          isSelected={
                            insurer.id === selectedInsurerId
                          }
                          monthly={monthly}
                          onSelect={() =>
                            handleSelectToggle(insurer.id)
                          }
                          onBuy={() =>
                            handleNavigate(insurer.id, cardTotal)
                          }
                        />
                      );
                    })
                  )}

                  <p className="mt-2 text-center text-xs text-gray-400">
                    {t.results.pricingDisclaimer}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {bundles.map((bundle) => {
                    const eligibleInsurers = insurers.filter((ins) =>
                      bundle.eligibleInsurerIds.includes(ins.id),
                    );
                    const bundlePrices = eligibleInsurers.map((ins) =>
                      Math.round(
                        calculateTotalPremium(
                          {
                            productIds: bundle.productIds,
                            riskFactor: businessType?.riskFactor ?? 1,
                            sizeFactor,
                            coverageLimits,
                            insurerMultiplier: ins.priceMultiplier,
                          },
                          productsMap,
                        ) * locationMultiplier,
                      ),
                    );
                    const lowestBundlePrice =
                      bundlePrices.length > 0
                        ? Math.min(...bundlePrices)
                        : bundle.annualPrice;
                    const discountRate =
                      bundle.benchmarkAnnualPrice > 0
                        ? 1 -
                          bundle.annualPrice /
                            bundle.benchmarkAnnualPrice
                        : 0.1;
                    const discountedPrice = Math.round(
                      lowestBundlePrice * (1 - discountRate),
                    );
                    return (
                      <BundleCard
                        key={bundle.id}
                        title={bundleCopy[bundle.copyKey].title}
                        description={
                          bundleCopy[bundle.copyKey].description
                        }
                        annualPrice={discountedPrice}
                        savings={lowestBundlePrice - discountedPrice}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedQuote &&
        (activeTab === 'individual' || selectedBundle) && (
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
                    {t.results.continueWith}{' '}
                    {(t.insurers as Record<string, string>)[
                      selectedQuote.id.toLowerCase()
                    ] || selectedQuote.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {displayPrice(selectedQuote.total)} ·{' '}
                    {t.results.finwallPrefix}{' '}
                    <span className="font-semibold">
                      {t.results.finwallBrand}
                    </span>
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
