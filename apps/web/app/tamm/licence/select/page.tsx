'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {TammDarkHeader} from '@/components/tamm/tamm-dark-header';
import {TammFooter, TammActionRow} from '@/components/tamm/tamm-footer';
import {useI18n} from '@/lib/i18n';
import {
  daysUntil,
  formatExpiryDate,
  isLicenceExpiringSoon,
  readUaePassSession,
  type UaePassAccount,
  type UaePassCompany,
} from '@/lib/tamm/uaepass-account';

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.001 11h2v2h-2v-2zm0-7h2v6h-2V4z" />
      <path
        fillRule="evenodd"
        d="M8 0c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 1.6a6.4 6.4 0 1 0 0 12.8A6.4 6.4 0 0 0 8 1.6z"
      />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  'cafe-restaurant': '☕',
  'it-technology': '💻',
};

export default function TammLicenceSelectPage() {
  const router = useRouter();
  const {t} = useI18n();
  const ls = t.tamm.licenceSelect;
  const [account, setAccount] = useState<UaePassAccount | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const data = readUaePassSession();
    if (!data) {
      router.replace('/tamm/quote/login?intent=licence');
      return;
    }
    if (!data.companies || data.companies.length === 0) {
      router.replace('/tamm');
      return;
    }
    setAccount(data);
    if (data.companies.length === 1) {
      setSelectedId(data.companies[0].id);
    }
  }, [router]);

  if (!account) return null;

  const companies: UaePassCompany[] = account.companies ?? [];
  const selected = companies.find((c) => c.id === selectedId) ?? null;

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem('tamm-selected-company', selected.id);
    router.push(`/tamm/licence/renew?company=${selected.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">
      <TammDarkHeader
        breadcrumbs={[
          {label: 'Home', href: '/tamm'},
          {label: 'Services', href: '/tamm'},
          {label: 'Trade Licence'},
        ]}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text">
          {ls.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-text-muted">
          {ls.subtitle}
        </p>

        {/* UAE PASS verified bar */}
        <div
          className="mt-6 rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between text-white text-sm font-semibold"
          style={{background: 'linear-gradient(90deg, #009688 0%, #00BFA5 100%)'}}>
          <div className="flex items-center gap-2">
            <span>🔐</span>
            <span>
              {ls.linkedBusinessesBar} ·{' '}
              <span className="font-bold">{account.name}</span>
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium opacity-95">
            <CheckIcon />
            {ls.verified}
          </span>
        </div>

        {/* Business cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => {
            const expiringSoon = isLicenceExpiringSoon(company.licenceExpiry);
            const days = daysUntil(company.licenceExpiry);
            const isSelected = selectedId === company.id;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelectedId(company.id)}
                className={`relative text-left bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-[#009688] bg-[#F0FDF9]'
                    : 'border-border hover:border-[#009688]/60'
                }`}>
                {isSelected && (
                  <div className="absolute top-3.5 inset-e-3.5 w-6 h-6 rounded-full bg-[#009688] flex items-center justify-center">
                    <CheckIcon />
                  </div>
                )}

                <div className="w-11 h-11 rounded-xl bg-[#F5F6F8] flex items-center justify-center text-[22px] mb-3">
                  {ICONS[company.businessType] ?? '🏢'}
                </div>
                <h3 className="text-base font-bold text-text">{company.businessName}</h3>
                <p className="text-xs text-text-muted mt-0.5">{company.businessLabel}</p>

                <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <div className="text-[#9CA3AF]">{ls.employees}</div>
                    <div className="font-semibold text-text mt-0.5">{company.employees}</div>
                  </div>
                  <div>
                    <div className="text-[#9CA3AF]">{ls.revenue}</div>
                    <div className="font-semibold text-[#2563EB] mt-0.5">{company.revenueLabel}</div>
                  </div>
                  <div>
                    <div className="text-[#9CA3AF]">{ls.location}</div>
                    <div className="font-semibold text-text mt-0.5">{company.location}</div>
                  </div>
                  <div>
                    <div className="text-[#9CA3AF]">{expiringSoon ? ls.licenceExpLabel : ls.licenceLabel}</div>
                    <div
                      className={`font-semibold mt-0.5 ${
                        expiringSoon ? 'text-[#EA580C]' : 'text-[#009688]'
                      }`}>
                      {expiringSoon ? formatExpiryDate(company.licenceExpiry) : ls.active}
                    </div>
                  </div>
                </div>

                {expiringSoon && days >= 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] rounded-full px-2.5 py-1 text-[11px] font-bold">
                    <WarningIcon />
                    {ls.expiringInDays
                      .replace('{days}', String(days))
                      .replace('{dayWord}', days === 1 ? ls.day : ls.days)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>

      <TammActionRow
        onBack={() => router.push('/tamm')}
        onNext={handleContinue}
        nextDisabled={!selected}
      />
      <TammFooter />
    </div>
  );
}
