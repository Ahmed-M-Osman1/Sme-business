'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, Badge, Button} from '@shory/ui';
import products from '@/config/products.json';

type ProductId = keyof typeof products;

interface BusinessType {
  id: string;
  title: string;
  description: string;
  icon: string;
  riskLevel: string;
  riskFactor: number;
  products: string[];
}

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const EMPLOYEE_OPTIONS = [
  {value: 'solo', label: 'Solo'},
  {value: '2-5', label: '2–5'},
  {value: '6-20', label: '6–20'},
  {value: '21-50', label: '21–50'},
  {value: '51-100', label: '51–100'},
  {value: '100+', label: '100+'},
];

const REVENUE_OPTIONS = [
  {value: 'under-500k', label: 'Under AED 500,000'},
  {value: '500k-1m', label: 'AED 500K – 1 million'},
  {value: '1m-5m', label: 'AED 1M – 5 million'},
  {value: '5m-10m', label: 'AED 5M – 10 million'},
  {value: 'over-10m', label: 'Over AED 10 million'},
];

const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'RAK',
  'Fujairah',
  'UAQ',
];

const COVERAGE_AREAS = ['UAE only', 'GCC', 'Worldwide'];

const ASSET_TYPES = [
  {
    id: 'stock',
    icon: '📦',
    name: 'Stock / inventory',
    description: 'Current retail stock at cost price',
  },
  {
    id: 'fixtures',
    icon: '🪟',
    name: 'Fixtures & fit-out',
    description: 'Display shelving, counters, lighting',
  },
  {
    id: 'pos',
    icon: '💳',
    name: 'POS & payment systems',
    description: 'Terminals, tablets, cash registers',
  },
  {
    id: 'security',
    icon: '📷',
    name: 'Security / CCTV systems',
    description: 'Cameras, access control, alarms',
  },
  {
    id: 'safe',
    icon: '🔒',
    name: 'Safe / cash handling',
    description: 'Safes, cash counters',
  },
];

interface Props {
  businessType: BusinessType;
  onCollapse: () => void;
}

export function BusinessTypeDetail({businessType, onCollapse}: Props) {
  const router = useRouter();
  const [employees, setEmployees] = useState('2-5');
  const [revenue, setRevenue] = useState('500k-1m');
  const [emirate, setEmirate] = useState('Dubai');
  const [coverageArea, setCoverageArea] = useState('UAE only');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [assetValues, setAssetValues] = useState<Record<string, string>>({});
  const [assetErrors, setAssetErrors] = useState<Set<string>>(new Set());

  function toggleAsset(assetId: string) {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
        setAssetErrors((errs) => {
          const nextErrs = new Set(errs);
          nextErrs.delete(assetId);
          return nextErrs;
        });
      } else {
        next.add(assetId);
      }
      return next;
    });
  }

  function handleGetQuotes() {
    // Validate asset values are filled for selected assets
    const missingValues = new Set<string>();
    selectedAssets.forEach((id) => {
      const val = assetValues[id]?.trim();
      if (!val || Number(val) <= 0) {
        missingValues.add(id);
      }
    });

    if (missingValues.size > 0) {
      setAssetErrors(missingValues);
      return;
    }

    const params = new URLSearchParams({
      type: businessType.id,
      source: 'pre-configured',
      employees,
      revenue,
      emirate,
      coverageArea,
    });

    if (selectedAssets.size > 0) {
      const assets: Record<string, number> = {};
      selectedAssets.forEach((id) => {
        assets[id] = Number(assetValues[id] || 0);
      });
      params.set('assets', JSON.stringify(assets));
    }

    router.push(`/quote/results?${params.toString()}`);
  }

  return (
    <Card className="rounded-2xl border-2 border-primary bg-white shadow-md overflow-hidden">
      <CardContent className="flex flex-col gap-5 p-5">
        {/* Card Header — expanded state */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl shrink-0">
            {businessType.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-text text-sm sm:text-base">
                {businessType.title}
              </span>
              <Badge
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                  RISK_BADGE_STYLES[businessType.riskLevel]
                }`}
              >
                {businessType.riskLevel} risk
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              {businessType.description}
            </p>
          </div>
          <button
            onClick={onCollapse}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0 hover:bg-border transition-colors"
            aria-label="Collapse"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="text-text-muted"
            >
              <path
                d="M3.5 8.75L7 5.25L10.5 8.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Recommended Covers */}
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Recommended Covers
          </p>
          <div className="flex flex-wrap gap-1.5">
            {businessType.products.map((productId) => {
              const product = products[productId as ProductId];
              if (!product) return null;
              return (
                <span
                  key={productId}
                  className="inline-flex items-center gap-1 text-xs bg-surface text-text-muted rounded-full px-2.5 py-1"
                >
                  <span>{product.icon}</span>
                  <span>{product.shortName}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Employees */}
        <div>
          <p className="text-sm font-medium text-text mb-2">Employees</p>
          <div className="grid grid-cols-3 gap-2">
            {EMPLOYEE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEmployees(opt.value)}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                  employees === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface text-text border border-border hover:border-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Annual Revenue */}
        <div>
          <p className="text-sm font-medium text-text mb-2">
            Estimated annual revenue
          </p>
          <div className="flex flex-col gap-2">
            {REVENUE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRevenue(opt.value)}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                  revenue === opt.value
                    ? 'border-2 border-primary bg-primary/5 text-text font-medium'
                    : 'border border-border bg-white text-text hover:border-primary'
                }`}
              >
                <span>{opt.label}</span>
                {revenue === opt.value && (
                  <span className="text-primary font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Emirate & Coverage Area */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium text-text mb-1.5">Emirate</p>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {EMIRATES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-sm font-medium text-text mb-1.5">
              Coverage area
            </p>
            <select
              value={coverageArea}
              onChange={(e) => setCoverageArea(e.target.value)}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {COVERAGE_AREAS.map((ca) => (
                <option key={ca} value={ca}>
                  {ca}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High-Value Assets */}
        <div>
          <p className="text-sm font-medium text-text mb-0.5">
            High-value assets{' '}
            <span className="text-text-muted font-normal">
              — tick any over AED 5,000
            </span>
          </p>
          <div className="flex flex-col gap-2 mt-2">
            {ASSET_TYPES.map((asset) => {
              const isSelected = selectedAssets.has(asset.id);
              return (
                <div key={asset.id}>
                  <button
                    onClick={() => toggleAsset(asset.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border border-border bg-white hover:border-primary'
                    }`}
                  >
                    <span className="text-lg shrink-0">{asset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">
                        {asset.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {asset.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-surface text-text-muted'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                  {isSelected && (
                    <div className="mt-1.5 ml-10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">AED</span>
                        <input
                          type="number"
                          value={assetValues[asset.id] ?? ''}
                          onChange={(e) => {
                            setAssetValues((prev) => ({
                              ...prev,
                              [asset.id]: e.target.value,
                            }));
                            setAssetErrors((prev) => {
                              const next = new Set(prev);
                              next.delete(asset.id);
                              return next;
                            });
                          }}
                          placeholder="e.g. 150000"
                          className={`flex-1 rounded-lg border px-3 py-2 text-sm bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
                            assetErrors.has(asset.id)
                              ? 'border-red-500'
                              : 'border-border'
                          }`}
                        />
                      </div>
                      {assetErrors.has(asset.id) && (
                        <p className="mt-1 text-xs text-red-500">
                          Please enter the estimated value
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleGetQuotes}
          className="w-full rounded-xl bg-primary text-white py-3 text-base font-medium hover:bg-primary/90 transition-all duration-200 sticky bottom-0"
        >
          Get my quotes →
        </Button>
      </CardContent>
    </Card>
  );
}
