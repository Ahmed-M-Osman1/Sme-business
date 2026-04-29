'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {useI18n} from '@/lib/i18n';

interface Company {
  businessName: string;
  licenceNumber: string;
  businessType: string;
  activity: string;
  employees: string;
  revenue: string;
  location: string;
  licenceExpiry?: string;
}

interface UaePassData {
  name: string;
  emiratesId: string;
  // Single company
  businessName?: string;
  licenceNumber?: string;
  businessType?: string;
  activity?: string;
  employees?: string;
  revenue?: string;
  location?: string;
  // Multi company
  companies?: Company[];
}

const BUSINESS_LABELS: Record<string, string> = {
  'consulting': 'Consulting / Advisory',
  'cafe-restaurant': 'Café / Restaurant',
  'law-firm': 'Law Firm / Legal',
  'retail-trading': 'Retail / Trading',
  'it-technology': 'IT / Technology',
  'construction': 'Construction / Contracting',
  'healthcare': 'Healthcare / Clinic',
  'general-trading': 'General Trading',
  'logistics': 'Logistics / Transport',
  'real-estate': 'Real Estate',
  'travel-tourism': 'Travel / Tourism',
};

const REVENUE_LABELS: Record<string, string> = {
  'under-500k': 'Under AED 500K',
  '500k-1m': 'AED 500K – 1M',
  '1m-5m': 'AED 1M – 5M',
  '5m-10m': 'AED 5M – 10M',
  'over-10m': 'Over AED 10M',
};

const BUSINESS_ICONS: Record<string, string> = {
  'cafe-restaurant': '☕',
  'it-technology': '💻',
  'consulting': '💼',
  'law-firm': '⚖️',
  'retail-trading': '🛍️',
  'construction': '🏗️',
  'healthcare': '🏥',
  'general-trading': '📦',
  'logistics': '🚛',
  'real-estate': '🏢',
  'travel-tourism': '✈️',
};

function VerifiedBadge() {
  const {t} = useI18n();
  return (
    <span className="text-xs text-white/80 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5.5" fill="white" fillOpacity="0.25" stroke="white" />
        <path d="M3.5 6L5.5 8L8.5 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t.tamm.uaePassCard.verified}
    </span>
  );
}

function SingleCompanyCard({data}: {data: UaePassData}) {
  const router = useRouter();
  const {t} = useI18n();
  const c = t.tamm.uaePassCard;

  function handleGetQuotes() {
    const params = new URLSearchParams({
      uaepass: 'true',
      businessType: data.businessType ?? '',
      employees: data.employees ?? '',
      revenue: data.revenue ?? '',
      emirate: data.location ?? '',
    });
    if (data.businessName) params.set('businessName', data.businessName);
    if (data.licenceNumber) params.set('licenseNumber', data.licenceNumber);
    if (data.activity) params.set('activity', data.activity);
    router.push(`/tamm/quote/results?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{border: '1.5px solid #169F9F', background: 'white'}}>
      <div className="flex items-center gap-3 px-5 py-3" style={{background: '#169F9F'}}>
        <Image src="/images/uaepass-logo.png" alt="UAE PASS" width={20} height={20} className="h-5 w-auto brightness-0 invert" />
        <span className="text-sm font-semibold text-white">{c.detailsReady}</span>
        <span className="ms-auto"><VerifiedBadge /></span>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">{c.businessProfile}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mb-4">
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium mb-0.5">{c.accountHolder}</p>
            <p className="text-sm font-semibold text-[#12121B] leading-tight">{data.name}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium mb-0.5">{c.businessName}</p>
            <p className="text-sm font-semibold text-[#12121B] leading-tight">{data.businessName}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium mb-0.5">{c.employees}</p>
            <p className="text-sm font-semibold text-[#12121B] leading-tight">{data.employees}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium mb-0.5">{c.location}</p>
            <p className="text-sm font-semibold text-[#12121B] leading-tight">{data.location}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl px-4 py-2.5 flex items-center justify-between" style={{background: '#F0FAFA'}}>
          <span className="text-xs text-[#475569]">{c.estimatedRevenue}</span>
          <span className="text-sm font-semibold text-[#169F9F]">{REVENUE_LABELS[data.revenue ?? ''] ?? data.revenue}</span>
        </div>

        <button
          onClick={handleGetQuotes}
          className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{background: '#169F9F'}}>
          <Image src="/images/uaepass-logo.png" alt="" width={16} height={16} className="h-4 w-auto brightness-0 invert" />
          {c.getQuotes}
        </button>
      </div>
    </div>
  );
}

function MultiCompanyCard({data}: {data: UaePassData & {companies: Company[]}}) {
  const router = useRouter();
  const {t} = useI18n();
  const c = t.tamm.uaePassCard;
  const ls = t.tamm.licenceSelect;
  const [selected, setSelected] = useState<number | null>(null);

  function handleGetQuotes(company: Company) {
    // Store selected company separately — keep uaepass-data intact so back navigation still shows both companies
    sessionStorage.setItem('uaepass-selected-company', JSON.stringify(company));
    const params = new URLSearchParams({
      uaepass: 'true',
      businessType: company.businessType,
      employees: company.employees,
      revenue: company.revenue,
      emirate: company.location,
      businessName: company.businessName,
      licenseNumber: company.licenceNumber,
      activity: company.activity,
    });
    if (company.licenceExpiry) params.set('licenceExpiry', company.licenceExpiry);
    router.push(`/tamm/quote/results?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{border: '1.5px solid #169F9F', background: 'white'}}>
      <div className="flex items-center gap-3 px-5 py-3" style={{background: '#169F9F'}}>
        <Image src="/images/uaepass-logo.png" alt="UAE PASS" width={20} height={20} className="h-5 w-auto brightness-0 invert" />
        <div>
          <span className="text-sm font-semibold text-white">{c.linkedBusinesses}</span>
          <span className="ms-2 text-xs text-white/70">{data.name}</span>
        </div>
        <span className="ms-auto"><VerifiedBadge /></span>
      </div>

      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-3">
          {c.selectBusinessHint}
        </p>

        <div className="grid grid-cols-2 gap-3">
          {data.companies.map((company, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={company.licenceNumber}
                onClick={() => setSelected(i)}
                className="text-start rounded-xl p-4 transition-all"
                style={{
                  border: isSelected ? '2px solid #169F9F' : '1.5px solid #E2E8F0',
                  background: isSelected ? '#F0FAFA' : '#FAFBFC',
                }}>
                {/* Icon + name */}
                <div className="flex items-start gap-2.5 mb-3">
                  <span className="text-xl leading-none mt-0.5">
                    {BUSINESS_ICONS[company.businessType] ?? '🏢'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#12121B] leading-snug">{company.businessName}</p>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5">{BUSINESS_LABELS[company.businessType] ?? company.businessType}</p>
                  </div>
                  {isSelected && (
                    <div className="ms-auto shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{background: '#169F9F'}}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#94A3B8]">{c.employees}</span>
                    <span className="text-[10px] font-semibold text-[#12121B]">{company.employees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#94A3B8]">{c.revenue}</span>
                    <span className="text-[10px] font-semibold text-[#169F9F]">{REVENUE_LABELS[company.revenue] ?? company.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#94A3B8]">{c.location}</span>
                    <span className="text-[10px] font-semibold text-[#12121B]">{company.location}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={() => selected !== null && handleGetQuotes(data.companies[selected])}
          disabled={selected === null}
          className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{background: '#169F9F'}}>
          <Image src="/images/uaepass-logo.png" alt="" width={16} height={16} className="h-4 w-auto brightness-0 invert" />
          {selected === null
            ? ls.selectAbove
            : c.getQuotesFor.replace('{name}', data.companies[selected].businessName)}
        </button>
      </div>
    </div>
  );
}

export function TammUaePassCard() {
  const [data, setData] = useState<UaePassData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('uaepass-data');
    const auth = sessionStorage.getItem('tamm-authenticated');
    if (raw && auth === 'true') {
      try {
        setData(JSON.parse(raw) as UaePassData);
      } catch {
        // invalid JSON — ignore
      }
    }
  }, []);

  if (!data) return null;

  if (data.companies && data.companies.length > 0) {
    return <MultiCompanyCard data={data as UaePassData & {companies: Company[]}} />;
  }

  return <SingleCompanyCard data={data} />;
}
