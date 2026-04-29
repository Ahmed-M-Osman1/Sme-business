'use client';

import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useI18n} from '@/lib/i18n';
import {usePolicyPdf} from '@/hooks/use-policy-pdf';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';
import {formatPrice, type ProductInfo} from '@/lib/pricing';

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

function CheckBig() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden>
      <circle cx="28" cy="28" r="26" stroke="#169F9F" strokeWidth="2.5" />
      <path
        d="M16 29l8 8 16-18"
        stroke="#169F9F"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown({className}: {className?: string}) {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TammConfirmationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const {t} = useI18n();
  const cf = t.tamm.confirmation;

  const insurerId = params.get('insurer') ?? 'salama';
  const productIds = (params.get('products') ?? '').split(',').filter(Boolean);
  const limits: Record<string, string> = JSON.parse(params.get('limits') ?? '{}');
  const total = Number(params.get('total') ?? '0');
  const billing = params.get('billing') ?? 'annual';
  const businessName = params.get('businessName') ?? '';
  const licenceNumber = params.get('licenseNumber') ?? '';
  const email = params.get('email') ?? '';
  const phone = params.get('phone') ?? '';
  const fullName = params.get('name') ?? '';
  const typeId = params.get('type') ?? 'general-trading';
  const employees = params.get('employees') ?? '2-5';
  const emirate = params.get('emirate') ?? 'Abu Dhabi City';

  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];
  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];

  const productsMap = useMemo(() => {
    const map: Record<string, ProductInfo> = {};
    Object.values(productsConfig).forEach((p) => {
      map[p.id] = p as ProductInfo;
    });
    return map;
  }, []);

  // Stable identifiers (only on client)
  const [policyNumber, setPolicyNumber] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [dates, setDates] = useState<{start: string; end: string; submitted: string; startObj: Date; endObj: Date}>({
    start: '',
    end: '',
    submitted: '',
    startObj: new Date(),
    endObj: new Date(),
  });

  useEffect(() => {
    const today = new Date();
    const end = new Date(today);
    end.setUTCFullYear(end.getUTCFullYear() + 1);
    end.setUTCDate(end.getUTCDate() - 1);
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
    const fmtDateTime = (d: Date) =>
      `${fmtDate(d)} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`;
    setDates({
      start: fmtDateTime(today),
      end: fmtDate(end),
      submitted: fmtDate(today),
      startObj: today,
      endObj: end,
    });
    setPolicyNumber(`${pad(Math.floor(Math.random() * 9999999999), 10)}`);
    setApplicationNumber(
      `P-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    );
    setPaymentReference(`${pad(Math.floor(Math.random() * 999999999999), 12)}`);
  }, []);

  const productsForPdf = productIds
    .map((pid) => {
      const product = productsMap[pid];
      if (!product) return null;
      const limit = limits[pid] ?? '1M';
      return {
        name: product.name,
        limit:
          limit === '1M' ? 'AED 1,000,000' : limit === '2M' ? 'AED 2,000,000' : limit === '5M' ? 'AED 5,000,000' : limit,
      };
    })
    .filter(Boolean) as Array<{name: string; limit: string}>;

  const pdf = usePolicyPdf({
    policyNumber: policyNumber || 'PENDING',
    insurerId: insurer.id,
    insurerName: insurer.name,
    insurerLogo: insurer.logo,
    typeId: businessType.id,
    businessTypeName: businessType.title,
    businessName,
    licenseNumber: licenceNumber,
    emirate,
    name: fullName,
    email,
    phone,
    employees,
    products: productsForPdf,
    total,
    startDate: dates.startObj,
    endDate: dates.endObj,
  });

  // Download dropdown
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!downloadOpen) return;
    const handler = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [downloadOpen]);

  function returnToTamm() {
    router.push('/tamm');
  }

  const downloading = pdf.downloadingCert || pdf.downloadingInvoice;

  return (
    <div className="pb-4">
      <div className="mb-6">
        <CheckBig />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-text leading-tight">
        {cf.completedHeader}
      </h1>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm">
        <div className="text-text-muted">
          {cf.applicationNumber}{' '}
          <span className="font-semibold text-text font-mono">{applicationNumber || '—'}</span>
        </div>
        <div className="text-text-muted">
          {cf.submittedOn}{' '}
          <span className="font-semibold text-text">{dates.submitted || '—'}</span>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm sm:text-base text-text-muted leading-relaxed">
        {cf.completedDescription}
      </p>

      {/* Action buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* Download Documents dropdown */}
        <div ref={downloadRef} className="relative">
          <button
            type="button"
            onClick={() => setDownloadOpen((p) => !p)}
            disabled={downloading || !policyNumber}
            aria-haspopup="menu"
            aria-expanded={downloadOpen}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-[#0E5F5F] bg-[#7EE7DE] hover:bg-[#6FDED4] transition-colors disabled:opacity-60 disabled:cursor-wait">
            {downloading ? cf.downloading : cf.downloadDocuments}
            <ChevronDown className={`transition-transform ${downloadOpen ? 'rotate-180' : ''}`} />
          </button>

          {downloadOpen && !downloading && (
            <div
              role="menu"
              className="absolute inset-s-0 top-full mt-2 w-64 bg-white rounded-xl border border-border shadow-lg overflow-hidden z-30">
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen(false);
                  void pdf.downloadInvoice();
                }}
                role="menuitem"
                className="w-full px-4 py-3 text-start text-sm font-medium text-text hover:bg-[#F5F6F8] transition-colors border-b border-border">
                {cf.downloadInvoice}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDownloadOpen(false);
                  void pdf.downloadCert();
                }}
                role="menuitem"
                className="w-full px-4 py-3 text-start text-sm font-medium text-text hover:bg-[#F5F6F8] transition-colors">
                {cf.downloadCertificate}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={returnToTamm}
          className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#169F9F] bg-white border-2 border-[#169F9F] hover:bg-[#F0FAFA] transition-colors">
          {cf.goToMyTamm}
        </button>

        <button
          type="button"
          className="text-sm font-semibold text-[#169F9F] hover:underline">
          {cf.needSupport}
        </button>
      </div>

      {/* Policy details table */}
      <div className="mt-7 bg-white rounded-2xl border border-border overflow-hidden">
        <DetailRow label={cf.paymentReference} value={paymentReference || '—'} />
        <DetailRow label={cf.amountPaid} value={`AED ${formatPrice(total)}`} />
        <DetailRow label={cf.policyStartDate} value={dates.start || '—'} />
        <DetailRow label={cf.policyholderName} value={fullName || '—'} />
        <DetailRow label={cf.insuranceCompany} value={insurer.name} />
        <DetailRow label={cf.policyNumber} value={policyNumber || '—'} />
        <DetailRow label={cf.businessName} value={businessName || '—'} />
        <DetailRow label={cf.businessType} value={businessType.title} />
        <DetailRow label={cf.policyEnd} value={dates.end || '—'} />
        {phone && <DetailRow label={cf.mobileNumber} value={`971-${phone.replace(/\s/g, '')}`} last />}
      </div>

      {billing === 'monthly' && (
        <p className="mt-3 text-xs text-text-muted">
          {cf.perYearPaidMonthly}
        </p>
      )}
    </div>
  );
}

function DetailRow({label, value, last}: {label: string; value: string; last?: boolean}) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-1 sm:gap-4 px-5 sm:px-6 py-4 text-sm ${
        last ? '' : 'border-b border-[#F3F4F6]'
      }`}>
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text break-all">{value}</span>
    </div>
  );
}

export function TammConfirmation() {
  return (
    <Suspense fallback={null}>
      <TammConfirmationInner />
    </Suspense>
  );
}
