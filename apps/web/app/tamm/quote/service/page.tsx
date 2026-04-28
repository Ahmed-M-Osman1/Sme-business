'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useI18n} from '@/lib/i18n';

function ChevronRight({className}: {className?: string}) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#64748B" strokeWidth="1.2" />
      <path d="M7 4.5V7L8.5 8.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CostIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="#64748B" strokeWidth="1.2" />
      <path d="M1.5 6h11" stroke="#64748B" strokeWidth="1.2" />
      <circle cx="4.5" cy="8.5" r="0.75" fill="#64748B" />
    </svg>
  );
}

const STEPS = [
  'Compare quotations',
  'Review application summary',
  'Submit application',
];

export default function TammServicePage() {
  const {t} = useI18n();
  const lang = t.tamm;

  return (
    <div className="min-h-screen flex flex-col" style={{background: '#FAFBFC'}}>

      {/* ── Header ── */}
      <header className="bg-white border-b border-[#E8ECF0] sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/tamm" className="flex items-center">
              <Image src="/images/tamm-logo.svg" alt="TAMM" width={90} height={24} className="h-6 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[lang.nav.myTamm, lang.nav.services, lang.nav.governmentEntities, lang.nav.support].map((label) => (
                <span key={label} className="text-sm text-[#4A5568] hover:text-[#12121B] transition-colors cursor-default font-medium">
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-semibold text-[#169F9F] px-4 py-1.5 rounded-full border border-[#169F9F] hover:bg-[#E8F7F7] transition-colors">
              {lang.nav.langToggle}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#E8ECF0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Link href="/tamm" className="text-[#169F9F] hover:underline font-medium">{lang.breadcrumb.home}</Link>
            <ChevronRight className="text-[#94A3B8]" />
            <span className="text-[#169F9F] font-medium">{lang.breadcrumb.services}</span>
            <ChevronRight className="text-[#94A3B8]" />
            <span className="text-[#12121B] font-medium">{lang.breadcrumb.businessInsurance}</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 pb-28">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#12121B] leading-tight">
          {t.tamm.service.title}
        </h1>
        <p className="mt-3 text-sm text-[#475569] leading-relaxed max-w-2xl">
          {t.tamm.service.description}
        </p>

        {/* Provider badge */}
        <div className="mt-5 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden" style={{border: '1px solid #E2E8F0'}}>
            <Image src="/images/tamm-logo.svg" alt="Shory" width={24} height={24} className="h-5 w-auto" />
          </div>
          <span className="text-sm font-semibold text-[#12121B]">Shory</span>
        </div>

        <div className="mt-8 h-px bg-[#E2E8F0]" />

        {/* Required Documents */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-[#12121B]">{t.tamm.service.requiredDocs}</h2>
          <p className="mt-2 text-sm text-[#475569]">{t.tamm.service.noDocs}</p>
        </div>

        <div className="mt-8 h-px bg-[#E2E8F0]" />

        {/* Cost */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-[#12121B]">{t.tamm.service.cost}</h2>
          <div className="mt-3 flex items-center justify-between py-3 border-b border-[#F1F5F9]">
            <span className="text-sm text-[#475569]">{t.tamm.service.costLabel}</span>
            <span className="text-sm font-semibold text-[#12121B]">AED 0</span>
          </div>
        </div>

        <div className="mt-8 h-px bg-[#E2E8F0]" />

        {/* Steps */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-[#12121B]">{t.tamm.service.stepsTitle}</h2>

          {/* Step 1 — highlighted */}
          <div className="mt-4 rounded-xl p-4" style={{border: '1px solid #E2E8F0', background: '#F8FAFB'}}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{background: '#169F9F'}}>
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#12121B]">{t.tamm.service.step1Title}</p>
                  <div className="mt-1.5 flex items-center gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1"><ClockIcon />{t.tamm.service.duration}</span>
                    <span className="flex items-center gap-1"><CostIcon />{t.tamm.service.noAdditionalCost}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/tamm/quote/login"
                className="shrink-0 rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{background: '#169F9F'}}>
                {t.tamm.service.signInToStart}
              </Link>
            </div>
          </div>

          {/* Steps 2–4 */}
          <div className="mt-3 space-y-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{border: '1px solid #F1F5F9'}}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium text-[#94A3B8]" style={{border: '1.5px solid #E2E8F0'}}>
                  {i + 2}
                </div>
                <span className="text-sm text-[#475569]">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-[#E2E8F0] shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#12121B]">{t.tamm.service.step1Title}</p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><ClockIcon />{t.tamm.service.duration}</span>
              <span className="flex items-center gap-1"><CostIcon />{t.tamm.service.noAdditionalCost}</span>
            </div>
          </div>
          <Link
            href="/tamm/quote/login"
            className="shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background: '#169F9F'}}>
            {t.tamm.service.signInToStart}
          </Link>
        </div>
      </div>
    </div>
  );
}
