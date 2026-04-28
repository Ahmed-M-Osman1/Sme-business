'use client';

import Link from 'next/link';
import Image from 'next/image';
import {TammStepper, TammStepperCompact} from './tamm-stepper';
import {useI18n} from '@/lib/i18n';

interface TammPageLayoutProps {
  currentStep: number;
  children: React.ReactNode;
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="#12121B" strokeWidth="1.4" />
      <path d="M11.5 11.5L15 15" stroke="#12121B" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight({className}: {className?: string}) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TammPageLayout({
  currentStep,
  children,
}: TammPageLayoutProps) {
  const {t, toggleLocale} = useI18n();
  const tamm = t.tamm;

  return (
    <div className="min-h-screen flex flex-col" style={{background: '#FAFBFC'}}>

      {/* ── White nav header ── */}
      <header className="bg-white border-b border-[#E8ECF0] sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/tamm" className="flex items-center">
              <Image
                src="/images/tamm-logo.svg"
                alt="TAMM"
                width={90}
                height={24}
                className="h-6 w-auto"
              />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {([
                tamm.nav.myTamm,
                tamm.nav.services,
                tamm.nav.governmentEntities,
                tamm.nav.support,
              ] as string[]).map((label) => (
                <span
                  key={label}
                  className="text-sm text-[#4A5568] hover:text-[#12121B] transition-colors cursor-default font-medium">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#4A5568] hover:text-[#12121B] transition-colors" aria-label={tamm.nav.support}>
              <SearchIcon />
            </button>
            <button className="p-2 text-sm font-medium text-[#4A5568] hover:text-[#12121B] transition-colors">
              AA
            </button>
            <button
              onClick={toggleLocale}
              className="p-2 text-sm font-medium text-[#169F9F] hover:text-[#12121B] transition-colors">
              {tamm.nav.langToggle}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#E8ECF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <Link href="/tamm" className="text-[#169F9F] hover:underline font-medium">{tamm.breadcrumb.home}</Link>
            <ChevronRight className="text-[#94A3B8]" />
            <span className="text-[#169F9F] font-medium cursor-default">{tamm.breadcrumb.services}</span>
            <ChevronRight className="text-[#94A3B8]" />
            <span className="text-[#169F9F] font-medium cursor-default">{tamm.breadcrumb.businessInsurance}</span>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile stepper */}
        <div className="lg:hidden mb-6">
          <TammStepperCompact currentStep={currentStep} />
        </div>

        <div className="flex gap-12" dir="ltr">
          {/* Main content — restore inherited text direction */}
          <main className="flex-1 min-w-0" dir="auto">{children}</main>

          {/* Sidebar stepper — always on physical right */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <TammStepper currentStep={currentStep} />
            </div>
          </aside>
        </div>
      </div>

    </div>
  );
}
