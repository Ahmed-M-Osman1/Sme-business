'use client';

import {Suspense, useEffect, useMemo, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useI18n} from '@/lib/i18n';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';
import {
  calculateMonthlyPrice,
  calculateProductPrice,
  calculateTotalPremium,
  formatPrice,
  getSizeFactor,
  type ProductInfo,
} from '@/lib/pricing';
import {readUaePassSession, formatExpiryDate} from '@/lib/tamm/uaepass-account';

const COVERAGE_LIMIT_LABEL_EN: Record<string, string> = {
  '1M': '1 million',
  '2M': '2 million',
  '5M': '5 million',
};

const COVERAGE_LIMIT_LABEL_AR: Record<string, string> = {
  '1M': 'مليون',
  '2M': '2 مليون',
  '5M': '5 مليون',
};

const PAYMENT_PROCESSING_MS = 1500;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UAE_PHONE_REGEX = /^5\d ?\d{3} ?\d{4}$/;

type PayMethod = 'apple_pay' | 'finwall' | 'card' | 'bank_transfer';

function CheckCircle({className}: {className?: string}) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM6.857 11.857 3 8l1.143-1.143 2.714 2.714L11.857 4.5 13 5.643l-6.143 6.214z" />
    </svg>
  );
}

function TammReviewPayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const {t, locale} = useI18n();
  const rp = t.tamm.reviewPay;
  const COVERAGE_LIMIT_LABEL = locale === 'ar' ? COVERAGE_LIMIT_LABEL_AR : COVERAGE_LIMIT_LABEL_EN;
  const PAY_METHODS: {id: PayMethod; icon: string; label: string; desc: string}[] = [
    {id: 'apple_pay', icon: '', label: rp.applePay, desc: rp.applePayDesc},
    {id: 'finwall', icon: '📅', label: rp.monthlyInstalments, desc: rp.monthlyInstalmentsDesc},
    {id: 'card', icon: '💳', label: rp.cardPayment, desc: rp.cardPaymentDesc},
    {id: 'bank_transfer', icon: '🏦', label: rp.bankTransfer, desc: rp.bankTransferDesc},
  ];

  const typeId = params.get('type') ?? 'general-trading';
  const insurerId = params.get('insurer') ?? 'salama';
  const productIds = (params.get('products') ?? '').split(',').filter(Boolean);
  const limits: Record<string, string> = JSON.parse(params.get('limits') ?? '{}');
  const employeeBand = params.get('employees') ?? '2-5';
  const businessName = params.get('businessName') ?? '';
  const licenceNumber = params.get('licenseNumber') ?? '';
  const activity = params.get('activity') ?? '';
  const emirate = params.get('emirate') ?? 'Abu Dhabi City';
  const licenceExpiry = params.get('licenceExpiry') ?? '';

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];
  const productsMap = useMemo(() => {
    const map: Record<string, ProductInfo> = {};
    Object.values(productsConfig).forEach((p) => {
      map[p.id] = p as ProductInfo;
    });
    return map;
  }, []);

  const sizeFactor = getSizeFactor(employeeBand);
  const total = useMemo(
    () =>
      calculateTotalPremium(
        {
          productIds,
          riskFactor: businessType.riskFactor,
          sizeFactor,
          coverageLimits: limits,
          insurerMultiplier: insurer.priceMultiplier,
        },
        productsMap,
      ),
    [productIds, businessType.riskFactor, sizeFactor, limits, insurer.priceMultiplier, productsMap],
  );

  const monthly = calculateMonthlyPrice(total);
  const monthlyAnnualEquivalent = monthly * 12;

  // Pre-fill from UAE PASS (BUG-04 fix)
  const [form, setForm] = useState({fullName: '', email: '', phone: ''});
  const initialBilling: 'annual' | 'monthly' =
    params.get('billing') === 'monthly' ? 'monthly' : 'annual';
  const [billing, setBilling] = useState<'annual' | 'monthly'>(initialBilling);
  const [payMethod, setPayMethod] = useState<PayMethod>(
    initialBilling === 'monthly' ? 'finwall' : 'apple_pay',
  );
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const session = readUaePassSession();
    if (!session) return;
    setForm({
      fullName: session.name ?? '',
      email: session.email ?? '',
      phone: session.phone ?? '',
    });
  }, []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.fullName || form.fullName.trim().length < 2) newErrors.fullName = rp.fullNameRequired;
    if (!form.email || !EMAIL_REGEX.test(form.email)) newErrors.email = rp.emailRequired;
    if (!form.phone || !UAE_PHONE_REGEX.test(form.phone.trim())) newErrors.phone = rp.phoneRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handlePay() {
    if (!declared) return;
    if (!validate()) return;
    setIsProcessing(true);
    const next = new URLSearchParams(params.toString());
    next.set('total', String(billing === 'monthly' ? monthlyAnnualEquivalent : total));
    next.set('email', form.email);
    next.set('name', form.fullName);
    next.set('phone', form.phone);
    next.set('payMethod', payMethod);
    next.set('billing', billing);
    setTimeout(() => {
      router.push(`/tamm/quote/confirmation?${next.toString()}`);
    }, PAYMENT_PROCESSING_MS);
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20">
        <div className="w-16 h-16 rounded-2xl bg-[#009688]/10 flex items-center justify-center animate-pulse text-3xl">
          💳
        </div>
        <p className="text-lg font-semibold">{rp.processing}</p>
      </div>
    );
  }

  const selectedMethod = PAY_METHODS.find((m) => m.id === payMethod) ?? PAY_METHODS[0];
  const billingLabel = billing === 'monthly' ? rp.monthly : rp.annual;
  const displayPrice = billing === 'monthly' ? monthly : total;
  const displayUnit = billing === 'monthly' ? rp.perMonth : rp.perYr;

  return (
    <div className="bg-[#F5F6F8] -mx-4 sm:-mx-6 lg:-mx-8 -mt-8 px-4 sm:px-6 lg:px-8 pt-7 pb-32">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text">{rp.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{rp.subtitle}</p>

        {/* Section 1 — Company Details */}
        <Card>
          <CardHeader
            title={<><span className="me-1.5">🏢</span> {rp.companyDetails}</>}
            right={<span className="inline-flex items-center gap-1 text-xs text-[#009688] font-medium"><CheckCircle /> {rp.fromTradeLicence}</span>}
          />
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
            <CompanyField label={rp.companyName} value={businessName || '—'} />
            <CompanyField label={rp.licenceNumber} value={licenceNumber || '—'} />
            <CompanyField label={rp.businessActivity} value={activity || businessType.title} />
            <CompanyField label={rp.location} value={emirate} />
            {licenceExpiry && (
              <CompanyField label={rp.expiryDate} value={formatExpiryDate(licenceExpiry)} />
            )}
          </div>
        </Card>

        {/* Section 2 — Order Summary */}
        <Card>
          <CardHeader title={<><span className="me-1.5">🛡️</span> {rp.orderSummary}</>} />
          <div className="px-5 py-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F3F4F6]">
              <div className="w-11 h-11 rounded-lg bg-[#F5F6F8] border border-border flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={insurer.logo} alt={insurer.name} className="w-full h-full object-contain p-1.5" />
              </div>
              <div>
                <div className="text-[15px] font-bold text-text">{insurer.name}</div>
                <div className="text-xs text-text-muted">
                  {businessType.title} · {emirate}
                </div>
              </div>
            </div>

            {businessName && (
              <div className="mt-3.5 flex items-center gap-1.5 bg-[#E0F5F3] rounded-lg px-3 py-2 text-sm font-semibold text-[#009688]">
                <CheckCircle /> {businessName}
                <span className="font-normal text-[#009688]/80 ms-1">{rp.verified}</span>
              </div>
            )}

            <div className="mt-3">
              {productIds
                .filter((id) => productsMap[id])
                .map((pid) => {
                  const product = productsMap[pid];
                  const limit = limits[pid] ?? '1M';
                  return (
                    <div
                      key={pid}
                      className="flex items-center justify-between py-2.5 border-b border-[#F9FAFB] last:border-0 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{product.icon}</span>
                        <span className="text-text">{product.name}</span>
                      </div>
                      <div className="text-text-muted">AED {COVERAGE_LIMIT_LABEL[limit] ?? limit}</div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-3 pt-3 border-t-2 border-border flex items-center justify-between">
              <div className="text-base font-bold">{rp.totalPremium}</div>
              <div className="text-2xl font-extrabold text-[#009688]">
                AED {formatPrice(total)}
                <span className="text-sm font-normal text-text-muted ms-1">{rp.perYr}</span>
              </div>
            </div>

            {/* UX-06 — confirm monthly subtotal equals annual */}
            <div className="mt-2 text-xs text-text-muted">
              {rp.or} <strong className="text-text">AED {formatPrice(monthly)}{rp.perMonth}</strong> × 12 ={' '}
              <strong className="text-text">AED {formatPrice(monthlyAnnualEquivalent)}</strong>
              {monthlyAnnualEquivalent === total ? (
                <> {rp.monthlySubtotalSame}</>
              ) : (
                <> {rp.monthlyPoweredBy}</>
              )}
            </div>
          </div>
        </Card>

        {/* Section 3 — Contact Details */}
        <Card>
          <CardHeader
            title={<><span className="me-1.5">👤</span> {rp.contactDetails}</>}
            right={<span className="text-xs text-[#9CA3AF]">{rp.preFilledFromUaePass}</span>}
          />
          <div className="px-5 py-4 flex flex-col gap-3.5">
            <ContactInput
              label={rp.fullName}
              value={form.fullName}
              error={errors.fullName}
              onChange={(v) => {
                setForm((f) => ({...f, fullName: v}));
                if (errors.fullName) setErrors((e) => {
                  const {fullName, ...rest} = e;
                  void fullName;
                  return rest;
                });
              }}
            />
            <ContactInput
              label={rp.emailAddress}
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(v) => {
                setForm((f) => ({...f, email: v}));
                if (errors.email) setErrors(({email: _, ...rest}) => rest);
              }}
            />
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                {rp.phoneNumber}
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2.5 bg-[#F5F6F8] border-[1.5px] border-[#D1D5DB] rounded-lg text-sm font-semibold text-[#374151] whitespace-nowrap">
                  🇦🇪 +971
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((f) => ({...f, phone: e.target.value}));
                    if (errors.phone) setErrors(({phone: _, ...rest}) => rest);
                  }}
                  className={`flex-1 px-3.5 py-2.5 border-[1.5px] rounded-lg text-sm outline-none transition-colors ${
                    errors.phone
                      ? 'border-red-400 bg-red-50/30'
                      : 'border-[#D1D5DB] focus:border-[#009688]'
                  }`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>
        </Card>

        {/* Section 4 — Payment Methods */}
        <Card>
          <div className="px-5 pt-4 pb-3 text-base font-bold">{rp.choosePaymentMethod}</div>
          <div className="px-5 pb-4 flex flex-col gap-2.5">
            {PAY_METHODS.map((m) => {
              const selected = m.id === payMethod;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPayMethod(m.id);
                    setBilling(m.id === 'finwall' ? 'monthly' : 'annual');
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selected
                      ? 'border-[#009688] bg-[#F0FDF9]'
                      : 'border-border hover:border-[#009688]/40'
                  }`}>
                  <span className="text-[22px] w-7 text-center">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text">{m.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">
                      {m.id === 'finwall'
                        ? rp.monthlyInstalmentsPriceDesc
                            .replace('{amount}', formatPrice(monthly))
                            .replace('{desc}', m.desc)
                        : m.desc}
                    </div>
                  </div>
                  <div
                    className={`w-4.5 h-4.5 rounded-full border-2 shrink-0 ${
                      selected
                        ? 'border-[#009688] bg-[#009688]'
                        : 'border-[#D1D5DB]'
                    }`}
                    style={selected ? {boxShadow: 'inset 0 0 0 3px white'} : undefined}
                  />
                </button>
              );
            })}
            <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-[#9CA3AF]">
              <span>🔒 SSL</span>
              <span>🛡️ PCI DSS</span>
              <span>🔐 3D Secure</span>
            </div>
          </div>
        </Card>

        {/* Section 5 — Declaration (last, just above the pay bar) */}
        <Card>
          <label className="px-5 py-4 flex items-start gap-2.5 text-sm text-text-muted leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#009688] cursor-pointer shrink-0"
            />
            <span>{rp.declaration}</span>
          </label>
        </Card>
      </div>

      {/* Sticky pay bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-text-muted">{selectedMethod.label} · {billingLabel}</div>
            <div className="text-base font-bold text-text">AED {formatPrice(displayPrice)}{displayUnit}</div>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={!declared}
            className={`rounded-xl py-3.5 px-5 sm:px-7 text-white text-sm sm:text-base font-bold transition-all min-w-45 sm:min-w-65 ${
              declared
                ? 'bg-[#009688] hover:bg-[#00796B] cursor-pointer'
                : 'bg-[#009688] opacity-35 cursor-not-allowed'
            }`}>
            {rp.payCta
              .replace('{method}', selectedMethod.label)
              .replace('{amount}', formatPrice(displayPrice))
              .replace('{unit}', displayUnit)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({children}: {children: React.ReactNode}) {
  return (
    <div className="mt-3.5 bg-white rounded-xl border border-border overflow-hidden">
      {children}
    </div>
  );
}

function CardHeader({
  title,
  right,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="px-5 py-3.5 border-b border-[#F3F4F6] flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-bold text-text flex items-center">{title}</h3>
      {right}
    </div>
  );
}

function CompanyField({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">{label}</div>
      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-text">
        <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
        {value}
      </div>
    </div>
  );
}

function ContactInput({
  label,
  value,
  type = 'text',
  error,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3.5 py-2.5 border-[1.5px] rounded-lg text-sm outline-none transition-colors ${
          error
            ? 'border-red-400 bg-red-50/30'
            : 'border-[#D1D5DB] focus:border-[#009688]'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function TammReviewPay() {
  return (
    <Suspense fallback={null}>
      <TammReviewPayInner />
    </Suspense>
  );
}
