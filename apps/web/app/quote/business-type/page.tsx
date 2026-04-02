'use client';

import {useState, useRef, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeDetail} from '@/components/quote/business-type-detail';
import {useI18n} from '@/lib/i18n';
import {api} from '@/lib/api-client';

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

// Top 3 most common — shown as featured row
const FEATURED_IDS = ['cafe-restaurant', 'retail-trading', 'it-technology'];

export default function BusinessTypePage() {
  const {t} = useI18n();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [businessTypes, setBusinessTypes] = useState<Array<{
    id: string; title: string; description: string; icon: string;
    riskLevel: string; riskFactor: number; products: string[];
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.businessTypes()
      .then(setBusinessTypes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = businessTypes.filter((bt) => FEATURED_IDS.includes(bt.id));
  const others = businessTypes.filter((bt) => !FEATURED_IDS.includes(bt.id));

  useEffect(() => {
    if (expandedId && detailRef.current) {
      detailRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  }, [expandedId]);

  function handleCollapse() {
    setExpandedId(null);
    topRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

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
      <ProgressIndicator currentStep={2} label={t.businessType.title} />

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
          <div className="grid grid-cols-3 gap-2.5">
            {featured.map((bt) => {
              const isExpanded = expandedId === bt.id;
              return (
                <button
                  key={bt.id}
                  onClick={() => handleSelect(bt.id)}
                  className="text-left w-full"
                >
                  <Card
                    className={`rounded-2xl border-2 bg-white transition-all duration-200 cursor-pointer h-full ${
                      isExpanded
                        ? 'border-primary shadow-md bg-linear-to-br from-primary/5 to-white'
                        : 'border-transparent shadow-sm hover:shadow-md hover:border-primary/30'
                    }`}
                  >
                    <CardContent className="flex flex-col items-center gap-2 p-3 sm:p-4 text-center">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          isExpanded ? 'bg-primary/10' : 'bg-surface'
                        }`}
                      >
                        {bt.icon}
                      </div>
                      <span className="font-semibold text-text text-xs sm:text-sm leading-tight">
                        {(t.businessType as Record<string, string>)[bt.id] ?? bt.title}
                      </span>
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                          RISK_BADGE_STYLES[bt.riskLevel]
                        }`}
                      >
                        {bt.riskLevel === 'low' ? t.businessType.lowRisk : bt.riskLevel === 'medium' ? t.businessType.mediumRisk : t.businessType.highRisk}
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
          <span className="text-[11px] text-text-muted">all business types</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* All other types — 2-col grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {others.map((bt) => {
            const isExpanded = expandedId === bt.id;
            return (
              <button
                key={bt.id}
                onClick={() => handleSelect(bt.id)}
                className="text-left w-full"
              >
                <Card
                  className={`rounded-2xl border bg-white transition-all duration-200 cursor-pointer h-full ${
                    isExpanded
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-border shadow-sm hover:shadow-md hover:border-primary/40'
                  }`}
                >
                  <CardContent className="flex items-center gap-3 p-3 sm:p-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isExpanded ? 'bg-primary/10' : 'bg-surface'
                      }`}
                    >
                      {bt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-text text-xs sm:text-sm leading-tight line-clamp-1 block">
                        {(t.businessType as Record<string, string>)[bt.id] ?? bt.title}
                      </span>
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                          RISK_BADGE_STYLES[bt.riskLevel]
                        }`}
                      >
                        {bt.riskLevel === 'low' ? t.businessType.lowRisk : bt.riskLevel === 'medium' ? t.businessType.mediumRisk : t.businessType.highRisk}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Not listed fallback */}
        <button
          onClick={() => router.push('/quote/manual')}
          className="w-full"
        >
          <div className="rounded-2xl border-2 border-dashed border-border bg-white hover:border-primary hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 p-4">
            <span className="text-sm font-medium text-text">
              My business type isn&apos;t listed
            </span>
            <span className="text-sm text-text-muted">— fill in manually</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-text-muted ml-1"
            >
              <path
                d="M6 3.333L10.667 8L6 12.667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>

        {/* Expanded detail form */}
        {expandedId &&
          (() => {
            const bt = businessTypes.find((b) => b.id === expandedId);
            if (!bt) return null;
            return (
              <div ref={detailRef}>
                <BusinessTypeDetail
                  key={bt.id}
                  businessType={bt}
                  onCollapse={handleCollapse}
                />
              </div>
            );
          })()}
      </div>
    </div>
  );
}
