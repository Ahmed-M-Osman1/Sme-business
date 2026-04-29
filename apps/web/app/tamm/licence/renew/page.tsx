'use client';

import {Suspense, useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
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

function CheckCircle({className}: {className?: string}) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM6.857 11.857 3 8l1.143-1.143 2.714 2.714L11.857 4.5 13 5.643l-6.143 6.214z" />
    </svg>
  );
}

function ShieldIcon({className}: {className?: string}) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.776 11.776 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
    </svg>
  );
}

function addYears(isoDate: string, years: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return formatExpiryDate(d.toISOString().slice(0, 10));
}

function TammLicenceRenewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {t} = useI18n();
  const lr = t.tamm.licenceRenew;
  const companyId = searchParams.get('company');
  const [account, setAccount] = useState<UaePassAccount | null>(null);
  const [company, setCompany] = useState<UaePassCompany | null>(null);

  useEffect(() => {
    const data = readUaePassSession();
    if (!data) {
      router.replace('/tamm/quote/login?intent=licence');
      return;
    }
    const cid = companyId ?? sessionStorage.getItem('tamm-selected-company');
    const found = data.companies?.find((c) => c.id === cid) ?? null;
    if (!found) {
      router.replace('/tamm/licence/select');
      return;
    }
    setAccount(data);
    setCompany(found);
  }, [companyId, router]);

  if (!account || !company) return null;

  const expiringSoon = isLicenceExpiringSoon(company.licenceExpiry);
  const days = daysUntil(company.licenceExpiry);

  function goToInsurance() {
    if (!company) return;
    sessionStorage.setItem('tamm-licence-flow', 'true');
    const params = new URLSearchParams({
      type: company.businessType,
      uaepass: 'true',
      employees: company.employees,
      revenue: company.revenue,
      emirate: company.location,
      businessName: company.businessName,
      licenseNumber: company.licenceNumber,
      activity: company.activity,
      licenceExpiry: company.licenceExpiry,
      source: 'licence',
    });
    router.push(`/tamm/quote/results?${params.toString()}`);
  }

  function skipInsurance() {
    router.push('/tamm');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">
      <TammDarkHeader
        breadcrumbs={[
          {label: 'Home', href: '/tamm'},
          {label: 'Services', href: '/tamm/licence/select'},
          {label: 'Trade Licence Renewal'},
        ]}
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16">
        <div className="inline-flex items-center gap-1.5 bg-[#E0F5F3] text-[#009688] rounded-full px-3 py-1 text-xs font-bold">
          📄 {lr.tag}
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-text">
          {company.businessName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {lr.subtitle}
        </p>

        {/* Business details card */}
        <div className="mt-7 bg-white rounded-xl border border-border p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text">{lr.businessDetails}</h2>
            <span className="inline-flex items-center gap-1 text-xs text-[#009688] font-medium">
              <CheckCircle /> {lr.fromTradeLicence}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field label={lr.companyName} value={company.businessName} />
            <Field label={lr.licenceNumber} value={company.licenceNumber} />
            <Field label={lr.businessActivity} value={company.activity} />
            <Field label={lr.location} value={company.location} />
            <Field
              label={lr.currentExpiry}
              value={
                <span className={expiringSoon ? 'text-[#EA580C]' : 'text-text'}>
                  {formatExpiryDate(company.licenceExpiry)}
                  {expiringSoon && days >= 0 && (
                    <span className="ms-2 inline-flex items-center bg-[#FFF7ED] border border-[#FED7AA] text-[#EA580C] rounded-full px-2 py-0.5 text-[10px] font-bold">
                      {lr.daysBadge.replace('{days}', String(days))}
                    </span>
                  )}
                </span>
              }
            />
            <Field
              label={lr.renewalPeriod}
              value={lr.renewalYearLabel.replace('{date}', addYears(company.licenceExpiry, 1))}
            />
          </div>
        </div>

        {/* Fee card */}
        <div
          className="mt-3.5 rounded-xl px-5 sm:px-6 py-5 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #E0F5F3 0%, #F0FDF9 100%)',
            border: '1px solid #99E6D8',
          }}>
          <div>
            <div className="text-sm text-[#374151]">{lr.feeLabel}</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">
              {lr.feeNote}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#009688]">AED 1,500</div>
            <div className="text-xs text-[#009688]">{lr.vatLabel}</div>
          </div>
        </div>

        {/* Insurance nudge */}
        <div className="mt-5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3.5 text-sm text-[#1E3A5F] leading-relaxed">
          <span className="me-1.5">💡</span>
          <strong>{lr.nudgeTitle}</strong> — {lr.nudgeBody}
        </div>

        {/* Skip Insurance — secondary action stays inline since main CTA moves to action row */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={skipInsurance}
            className="text-sm font-medium text-text-muted hover:text-text transition-colors underline-offset-2 hover:underline">
            {lr.skipInsurance}
          </button>
        </div>
      </div>

      <TammActionRow
        onBack={() => router.push('/tamm/licence/select')}
        onNext={goToInsurance}
        nextLabel={lr.continueToInsurance}
      />
      <TammFooter />
    </div>
  );
}

function Field({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">{label}</div>
      <div className="mt-1 pb-2 text-[15px] font-medium text-text border-b border-[#F3F4F6]">
        {value}
      </div>
    </div>
  );
}

export default function TammLicenceRenewPage() {
  return (
    <Suspense fallback={null}>
      <TammLicenceRenewInner />
    </Suspense>
  );
}
