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
    <Card className="rounded-2xl border-2 border-primary bg-white shadow-lg overflow-hidden">
      {/* Header bar */}
      <div className="bg-linear-to-r from-primary/5 to-transparent px-5 py-4 flex items-center gap-3 border-b border-primary/10">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
          {businessType.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-text text-base sm:text-lg">
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
          className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0 hover:bg-surface transition-colors"
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
              d="M10.5 8.75L7 5.25L3.5 8.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <CardContent className="flex flex-col gap-5 p-5">
        {/* Recommended Covers */}
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Recommended Covers
          </p>
          <div className="flex flex-wrap gap-2">
            {businessType.products.map((productId) => {
              const product = products[productId as ProductId];
              if (!product) return null;
              return (
                <span
                  key={productId}
                  className="inline-flex items-center gap-1.5 text-xs bg-primary/5 text-primary border border-primary/15 rounded-full px-3 py-1.5 font-medium"
                >
                  <span>{product.icon}</span>
                  <span>{product.shortName}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Employees */}
        <div>
          <p className="text-sm font-medium text-text mb-2.5">Employees</p>
          <div className="grid grid-cols-3 gap-2">
            {EMPLOYEE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEmployees(opt.value)}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                  employees === opt.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-text border border-border hover:border-primary/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Annual Revenue */}
        <div>
          <p className="text-sm font-medium text-text mb-2.5">
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
                    : 'border border-border bg-white text-text hover:border-primary/40'
                }`}
              >
                <span>{opt.label}</span>
                {revenue === opt.value && (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 5.5L4 7.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
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
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
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
            <span className="text-text-muted font-normal text-xs">
              — tick any over AED 5,000
            </span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
            {ASSET_TYPES.map((asset) => {
              const isSelected = selectedAssets.has(asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => toggleAsset(asset.id)}
                  className={`rounded-2xl p-3.5 cursor-pointer transition-all duration-200 flex flex-col gap-2.5 ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/5 shadow-sm'
                      : 'border border-border bg-white hover:border-primary/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl shrink-0">{asset.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text leading-tight">
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {asset.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'bg-surface text-text-muted'
                      }`}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </div>
                  {/* AED input — typing auto-selects */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 ${
                      isSelected
                        ? 'bg-white border border-primary/20'
                        : 'bg-surface border border-transparent'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-text-muted shrink-0">
                      AED
                    </span>
                    <input
                      type="number"
                      value={assetValues[asset.id] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAssetValues((prev) => ({...prev, [asset.id]: val}));
                        if (val.trim() && !selectedAssets.has(asset.id)) {
                          setSelectedAssets((prev) => new Set(prev).add(asset.id));
                        }
                        setAssetErrors((prev) => {
                          const next = new Set(prev);
                          next.delete(asset.id);
                          return next;
                        });
                      }}
                      placeholder="0"
                      className={`flex-1 bg-transparent text-xs text-text placeholder:text-text-muted/40 focus:outline-none min-w-0 ${
                        assetErrors.has(asset.id) ? 'text-red-500' : ''
                      }`}
                    />
                  </div>
                  {assetErrors.has(asset.id) && (
                    <p className="text-[10px] text-red-500 -mt-1">
                      Enter a value
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleGetQuotes}
          className="w-full rounded-xl bg-primary text-white py-3.5 text-base font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
        >
          Get my quotes
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            className="ml-2 inline"
          >
            <path
              d="M6.75 3.75L12 9L6.75 14.25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </CardContent>
    </Card>
  );
}
