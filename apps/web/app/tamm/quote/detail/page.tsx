'use client';

import {Suspense} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import {useI18n} from '@/lib/i18n';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';
import {
  calculateProductPrice,
  calculateMonthlyPrice,
  formatPrice,
  getSizeFactor,
  type ProductInfo,
} from '@/lib/pricing';

const COVERAGE_LIMIT_LABEL: Record<string, string> = {
  '1M': '1,000,000',
  '2M': '2,000,000',
  '5M': '5,000,000',
};

function CheckCircle({className}: {className?: string}) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM6.857 11.857 3 8l1.143-1.143 2.714 2.714L11.857 4.5 13 5.643l-6.143 6.214z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TammQuoteDetailInner() {
  const router = useRouter();
  const params = useSearchParams();
  const {t} = useI18n();
  const qd = t.tamm.quoteDetail;

  const typeId = params.get('type') ?? 'general-trading';
  const insurerId = params.get('insurer') ?? 'salama';
  const productIds = (params.get('products') ?? '').split(',').filter(Boolean);
  const limits: Record<string, string> = JSON.parse(params.get('limits') ?? '{}');
  const employeeBand = params.get('employees') ?? '2-5';
  const businessName = params.get('businessName') ?? '';
  const billing: 'annual' | 'monthly' = params.get('billing') === 'monthly' ? 'monthly' : 'annual';

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];
  const productsMap: Record<string, ProductInfo> = {};
  Object.values(productsConfig).forEach((p) => {
    productsMap[p.id] = p as ProductInfo;
  });

  const mandatoryProducts = new Set<string>();
  if (employeeBand !== '1') mandatoryProducts.add('workers-comp');

  const sizeFactor = getSizeFactor(employeeBand);
  const breakdown = productIds
    .map((pid) => {
      const product = productsMap[pid];
      if (!product) return null;
      const limit = limits[pid] ?? '1M';
      const price = Math.round(
        calculateProductPrice(pid, businessType.riskFactor, sizeFactor, limit, productsMap) *
          insurer.priceMultiplier,
      );
      return {
        id: pid,
        name: product.name,
        icon: product.icon,
        limit,
        price,
        mandatory: mandatoryProducts.has(pid),
      };
    })
    .filter(Boolean) as {
    id: string;
    name: string;
    icon: string;
    limit: string;
    price: number;
    mandatory: boolean;
  }[];

  const total = breakdown.reduce((sum, item) => sum + item.price, 0);
  const monthly = calculateMonthlyPrice(total);
  const coverageType = breakdown
    .map((b) => productsMap[b.id]?.shortName ?? b.name)
    .join(' + ');

  function proceed() {
    const next = new URLSearchParams(params.toString());
    next.set('total', String(total));
    next.set('companyVerified', 'true');
    next.set('companySource', 'uaepass');
    router.push(`/tamm/quote/checkout?${next.toString()}`);
  }

  function back() {
    const back = new URLSearchParams(params.toString());
    router.push(`/tamm/quote/results?${back.toString()}`);
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <button
        type="button"
        onClick={back}
        className="text-sm text-[#009688] hover:underline flex items-center gap-1.5 mb-5">
        ← {qd.back}
      </button>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F3F4F6]">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center bg-[#DCFCE7] text-[#16A34A] rounded-full px-3 py-1 text-xs font-bold">
                ★ {qd.bestFor.replace('{type}', businessType.title ?? '')}
              </span>
              {insurer.shariahCompliant && (
                <span className="inline-flex items-center bg-[#E0F5F3] text-[#009688] rounded-full px-3 py-1 text-xs font-bold">
                  {qd.shariahCompliant}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#F5F6F8] border border-border flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={insurer.logo} alt={insurer.name} className="w-full h-full object-contain p-2" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text">{insurer.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">{coverageType}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
                    <StarIcon />
                    <span className="font-semibold text-text">{insurer.rating.toFixed(1)}</span>
                    <span>{qd.reviews.replace('{count}', String(insurer.reviewCount))}</span>
                  </div>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-text">
                AED {formatPrice(billing === 'monthly' ? monthly : total)}
                <span className="text-sm font-normal text-text-muted ms-1">
                  {billing === 'monthly' ? qd.perMo : qd.perYr}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="px-6 py-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">
              {qd.whatsIncluded}
            </div>
            {breakdown.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-[#F9FAFB] last:border-0">
                <div className="flex items-center gap-2 text-sm font-medium text-text">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  {item.mandatory && (
                    <span
                      className="ms-1 inline-flex items-center bg-[#FFF3EF] text-[#EA580C] text-[10px] font-bold rounded px-1.5 py-0.5"
                      title={t.tamm.quoteCard.requiredTooltip}>
                      {qd.legallyRequired}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#9CA3AF]">
                    AED {COVERAGE_LIMIT_LABEL[item.limit] ?? item.limit}
                  </div>
                  <div className="text-sm font-bold text-text mt-0.5">AED {formatPrice(item.price)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#F8F9FA] border-t-2 border-border">
            <div className="text-base font-bold text-text">{t.tamm.quoteDetail.total}</div>
            <div className="text-2xl font-extrabold text-[#009688]">
              AED {formatPrice(billing === 'monthly' ? monthly : total)}
              <span className="text-sm font-normal text-text-muted ms-1">
                {billing === 'monthly' ? t.tamm.quoteDetail.perMo : t.tamm.quoteDetail.perYr}
              </span>
            </div>
          </div>

          <div className="px-6 py-3 text-xs text-text-muted">
            {billing === 'monthly' ? (
              <>
                {t.tamm.quoteDetail.annualEquivalentLabel}{' '}
                <strong className="text-text">AED {formatPrice(monthly * 12)}</strong>
                {' · '}
                {t.tamm.quoteDetail.poweredByFinwall}{' '}
                <strong className="text-text">FINWALL</strong>
              </>
            ) : (
              <>
                {t.tamm.quoteDetail.monthlyAlt}{' '}
                <strong className="text-text">FINWALL</strong> ·{' '}
                {t.tamm.quoteDetail.or}{' '}
                <strong className="text-text">
                  AED {formatPrice(monthly)}{t.tamm.quoteDetail.perMonth}
                </strong>{' '}
                {t.tamm.quoteDetail.zeroInstalmentFee}
              </>
            )}
          </div>

          {/* CTAs */}
          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={proceed}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 bg-[#009688] hover:bg-[#00796B] text-white text-base font-semibold transition-colors">
              {qd.proceed}
            </button>
            <button
              type="button"
              onClick={back}
              className="self-center text-sm text-[#009688] hover:underline">
              {qd.chooseDifferent}
            </button>
          </div>
        </div>

      {businessName && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-text-muted justify-center">
          <CheckCircle className="text-[#009688]" />
          {qd.for} <span className="font-semibold text-text">{businessName}</span> · {qd.pulledFromLicence}
        </p>
      )}
    </div>
  );
}

export default function TammQuoteDetailPage() {
  return (
    <TammPageLayout currentStep={4}>
      <Suspense fallback={<TammLoader />}>
        <TammQuoteDetailInner />
      </Suspense>
    </TammPageLayout>
  );
}

function TammLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#009688] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
