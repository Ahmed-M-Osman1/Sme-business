'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import Link from 'next/link';
import {Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeDetail} from '@/components/quote/business-type-detail';
import {useI18n} from '@/lib/i18n';
import {api} from '@/lib/api-client';
import {BUSINESS_TYPE_HELP} from '@/config/business-type-help';

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-primary/10 text-primary',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

// Top 3 most common — shown as featured row
const FEATURED_IDS = [
  'cafe-restaurant',
  'retail-trading',
  'it-technology',
];

export default function BusinessTypePage() {
  const {t} = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [businessTypes, setBusinessTypes] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      riskLevel: string;
      riskFactor: number;
      products: string[];
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog
      .businessTypes()
      .then(setBusinessTypes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = businessTypes.filter((bt) =>
    FEATURED_IDS.includes(bt.id),
  );
  const others = businessTypes.filter(
    (bt) => !FEATURED_IDS.includes(bt.id),
  );

  useEffect(() => {
    if (expandedId && detailRef.current) {
      detailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [expandedId]);

  function handleCollapse() {
    setExpandedId(null);
    topRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  const [focusedIndex, setFocusedIndex] = useState(-1);
  const allTypes = [...featured, ...others];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const total = allTypes.length;
      if (total === 0) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % total);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < total) {
          handleSelect(allTypes[focusedIndex].id);
        }
      }
    },
    [allTypes, focusedIndex],
  );

  useEffect(() => {
    if (focusedIndex >= 0) {
      const btn = document.querySelector(
        `[data-bt-index="${focusedIndex}"]`,
      ) as HTMLElement;
      btn?.focus();
    }
  }, [focusedIndex]);

  function handleSelect(btId: string) {
    setExpandedId((prev) => (prev === btId ? null : btId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={topRef} />
      <ProgressIndicator
        currentStep={2}
        totalSteps={6}
        label={t.businessType.title}
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          {t.businessType.title}
        </h1>
        <p className="mt-2 text-text-muted">
          {t.businessType.subtitle}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-5">
        <div>
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5 text-center">
            {t.businessType.popularInUae}
          </p>
          <div
            className="grid grid-cols-3 gap-2.5"
            role="listbox"
            aria-label="Popular business types"
            onKeyDown={handleKeyDown}>
            {featured.map((bt, idx) => {
              const isExpanded = expandedId === bt.id;
              return (
                <button
                  key={bt.id}
                  onClick={() => handleSelect(bt.id)}
                  onFocus={() => setFocusedIndex(idx)}
                  data-bt-index={idx}
                  role="option"
                  aria-selected={isExpanded}
                  tabIndex={focusedIndex === idx ? 0 : -1}
                  className="text-start w-full">
                  <Card
                    className={`rounded-2xl border-2 bg-white transition-all duration-200 cursor-pointer h-full ${
                      isExpanded
                        ? 'border-primary shadow-md bg-linear-to-br from-primary/5 to-white'
                        : 'border-transparent shadow-sm hover:shadow-md hover:border-primary/30'
                    }`}>
                    <CardContent className="flex flex-col items-center gap-2 p-3 sm:p-4 text-center">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          isExpanded ? 'bg-primary/10' : 'bg-surface'
                        }`}>
                        {bt.icon}
                      </div>
                      <span className="font-semibold text-text text-xs sm:text-sm leading-tight">
                        {(t.businessType as Record<string, string>)[
                          bt.id
                        ] ?? bt.title}
                      </span>
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                          RISK_BADGE_STYLES[bt.riskLevel]
                        }`}>
                        {bt.riskLevel === 'low'
                          ? t.businessType.lowRisk
                          : bt.riskLevel === 'medium'
                            ? t.businessType.mediumRisk
                            : t.businessType.highRisk}
                      </Badge>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-text-muted">
            {t.businessType.allTypes}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* All other types — 2-col grid */}
        <div
          className="grid grid-cols-2 gap-2.5"
          role="listbox"
          aria-label="All business types"
          onKeyDown={handleKeyDown}>
          {others.map((bt, idx) => {
            const isExpanded = expandedId === bt.id;
            const globalIdx = featured.length + idx;
            return (
              <button
                key={bt.id}
                onClick={() => handleSelect(bt.id)}
                onFocus={() => setFocusedIndex(globalIdx)}
                data-bt-index={globalIdx}
                role="option"
                aria-selected={isExpanded}
                tabIndex={focusedIndex === globalIdx ? 0 : -1}
                className="text-start w-full">
                <Card
                  className={`rounded-2xl border bg-white transition-all duration-200 cursor-pointer h-full ${
                    isExpanded
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-border shadow-sm hover:shadow-md hover:border-primary/40'
                  }`}>
                  <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isExpanded ? 'bg-primary/10' : 'bg-surface'
                      }`}>
                      {bt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-text text-xs sm:text-sm leading-tight line-clamp-1 block">
                        {(t.businessType as Record<string, string>)[
                          bt.id
                        ] ?? bt.title}
                      </span>
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                          RISK_BADGE_STYLES[bt.riskLevel]
                        }`}>
                        {bt.riskLevel === 'low'
                          ? t.businessType.lowRisk
                          : bt.riskLevel === 'medium'
                            ? t.businessType.mediumRisk
                            : t.businessType.highRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Not listed fallback */}
        <Link
          href="/quote/manual"
          className="block w-full text-center py-3 px-4 rounded-lg border border-border hover:border-primary/40 transition-colors bg-white shadow-sm flex items-center justify-center gap-2">
          <div className="text-2xl shrink-0">➕</div>
          <p className="text-sm font-medium text-text">
            {t.businessType.notListed}
          </p>
        </Link>

        {/* Contextual help info */}
        {expandedId && BUSINESS_TYPE_HELP[expandedId] && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex flex-col gap-2 text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wider">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="shrink-0">
                <path
                  d="M7 1.167A5.833 5.833 0 1 0 12.833 7 5.84 5.84 0 0 0 7 1.167Zm0 9.333a.583.583 0 1 1 0-1.167.583.583 0 0 1 0 1.167Zm.583-2.917a.583.583 0 0 1-1.166 0V4.667a.583.583 0 0 1 1.166 0v2.916Z"
                  fill="currentColor"
                />
              </svg>
              {t.businessType.quickOverview}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-text-muted">
              <div>
                <p className="font-medium text-text mb-0.5">
                  {t.businessType.recommendedCovers}
                </p>
                <p>
                  {BUSINESS_TYPE_HELP[
                    expandedId
                  ].recommendedCovers.join(', ')}
                </p>
              </div>
              <div>
                <p className="font-medium text-text mb-0.5">
                  {t.businessType.typicalEmployees}
                </p>
                <p>
                  {BUSINESS_TYPE_HELP[expandedId].typicalEmployees}
                </p>
              </div>
              <div>
                <p className="font-medium text-text mb-0.5">
                  {t.businessType.annualRevenue}
                </p>
                <p>{BUSINESS_TYPE_HELP[expandedId].annualRevenue}</p>
              </div>
              <div>
                <p className="font-medium text-text mb-0.5">
                  {t.businessType.highValueAssets}
                </p>
                <p>
                  {BUSINESS_TYPE_HELP[expandedId].highValueAssets
                    ? t.businessType.likelyApplies
                    : t.businessType.usuallyNotNeeded}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Expanded detail form */}
        {expandedId &&
          (() => {
            const bt = businessTypes.find((b) => b.id === expandedId);
            if (!bt) return null;
            const helpData = BUSINESS_TYPE_HELP[expandedId];
            return (
              <div ref={detailRef}>
                <BusinessTypeDetail
                  key={bt.id}
                  businessType={bt}
                  onCollapse={handleCollapse}
                  helpData={helpData}
                />
              </div>
            );
          })()}
      </div>
    </div>
  );
}
