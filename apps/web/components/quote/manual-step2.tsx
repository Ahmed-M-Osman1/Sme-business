'use client';

import {useState, useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import quoteOptions from '@/config/quote-options.json';

interface Step1Data {
  classifiedType: string;
  employees: string;
  revenue: string;
}

interface ManualStep2Props {
  step1Data: Step1Data;
  onBack: () => void;
}

interface AssetSelection {
  id: string;
  value: string;
}

function formatAed(value: string): string {
  const num = Number(value.replace(/[^0-9]/g, ''));
  if (!num && num !== 0) return '';
  return new Intl.NumberFormat('en-AE').format(num);
}

function parseAed(formatted: string): string {
  return formatted.replace(/[^0-9]/g, '');
}

export function ManualStep2({step1Data, onBack}: ManualStep2Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emirate, setEmirate] = useState('');
  const [coverageArea, setCoverageArea] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<AssetSelection[]>([]);
  const [highValueAssets, setHighValueAssets] = useState('');

  // Auto-populate Emirate from URL params or sessionStorage
  useEffect(() => {
    const paramEmirate = searchParams.get('emirate');
    if (paramEmirate && quoteOptions.emirates.includes(paramEmirate)) {
      setEmirate(paramEmirate);
      return;
    }
    try {
      const stored = sessionStorage.getItem('shory-emirate');
      if (stored && quoteOptions.emirates.includes(stored)) {
        setEmirate(stored);
      }
    } catch {
      // sessionStorage not available
    }
  }, [searchParams]);

  function toggleAsset(assetId: string) {
    setSelectedAssets((prev) => {
      const exists = prev.find((a) => a.id === assetId);
      if (exists) {
        return prev.filter((a) => a.id !== assetId);
      }
      return [...prev, {id: assetId, value: ''}];
    });
  }

  function updateAssetValue(assetId: string, value: string) {
    setSelectedAssets((prev) =>
      prev.map((a) => (a.id === assetId ? {...a, value} : a)),
    );
  }

  function isSelected(assetId: string): boolean {
    return selectedAssets.some((a) => a.id === assetId);
  }

  function getAssetValue(assetId: string): string {
    return selectedAssets.find((a) => a.id === assetId)?.value ?? '';
  }

  function handleSubmit() {
    if (!emirate) return;

    // Persist Emirate for future use
    try {
      sessionStorage.setItem('shory-emirate', emirate);
    } catch {
      // sessionStorage not available
    }

    const params = new URLSearchParams({
      type: step1Data.classifiedType,
      source: 'manual',
      employees: step1Data.employees,
      revenue: step1Data.revenue,
      emirate,
      coverageArea: coverageArea || 'uae',
    });

    if (highValueAssets) {
      params.set('highValueAssets', highValueAssets);
    }

    for (const asset of selectedAssets) {
      if (asset.value) {
        params.set(`asset_${asset.id}`, asset.value);
      }
    }

    router.push(`/quote/results?${params.toString()}`);
  }

  const canSubmit = !!emirate;

  return (
    <div className="flex flex-col gap-6">
      {/* Emirate & Coverage Area */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Emirate <span className="text-red-500">*</span>
              </label>
              <select
                value={emirate}
                onChange={(e) => setEmirate(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Emirate</option>
                {quoteOptions.emirates.map((em) => (
                  <option key={em} value={em}>
                    {em}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Coverage area <span className="text-red-500">*</span>
              </label>
              <select
                value={coverageArea}
                onChange={(e) => setCoverageArea(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              >
                <option value="">Select coverage area</option>
                {quoteOptions.coverageAreas.map((ca) => (
                  <option key={ca.value} value={ca.value}>
                    {ca.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High value assets total */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              High value assets
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Total estimated value of high-value assets (equipment, machinery, stock, etc.)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-muted whitespace-nowrap">AED</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={highValueAssets ? formatAed(highValueAssets) : ''}
              onChange={(e) => setHighValueAssets(parseAed(e.target.value))}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Asset Breakdown */}
      <Card className="rounded-2xl border border-border bg-white">
        <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-text">
              Asset breakdown
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Tick any over AED 5,000
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {quoteOptions.highValueAssets.map((asset) => {
              const selected = isSelected(asset.id);
              return (
                <div key={asset.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => toggleAsset(asset.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      selected
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                  >
                    <span className="text-xl">{asset.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">{asset.label}</p>
                      <p className="text-xs text-text-muted">{asset.description}</p>
                    </div>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                        selected
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {selected ? '\u2713' : '+'}
                    </span>
                  </button>
                  {selected && (
                    <div className="mt-2 ml-10 mr-4 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                      <span className="text-xs text-text-muted whitespace-nowrap">AED</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Estimated value"
                        value={getAssetValue(asset.id) ? formatAed(getAssetValue(asset.id)) : ''}
                        onChange={(e) => updateAssetValue(asset.id, parseAed(e.target.value))}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-primary text-white py-3 font-medium disabled:opacity-50 shadow-lg"
        >
          Get my quotes
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full rounded-xl py-2.5 font-medium"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
