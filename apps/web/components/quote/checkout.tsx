'use client';

import {useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {AuthModal} from '@/components/auth/auth-modal';
import {
  calculateMonthlyPrice,
  calculateTotalPremium,
  formatPrice,
  formatPriceWithCurrency,
  getSizeFactor,
} from '@/lib/pricing';
import type {ProductInfo} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';
import type {ContactForm} from '@/types/quote';

type ProductId = keyof typeof productsConfig;

// Validates 9 digits after +971 prefix (5XXXXXXXX) — stored without prefix
const UAE_PHONE_REGEX = /^5\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Delay for scrolling to validation errors after form submit. */
const SCROLL_TO_ERROR_DELAY_MS = 50;
/** Simulated payment processing time before redirect. */
const PAYMENT_PROCESSING_MS = 2000;

export function Checkout() {
  const {t, locale} = useI18n();
  const {data: session} = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const urlTotal = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(
    ',',
  ) as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );

  const businessName = searchParams.get('businessName') ?? '';
  const companyVerified =
    searchParams.get('companyVerified') === 'true';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const employeeBand = searchParams.get('employees') ?? '2-5';

  const businessType =
    businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer =
    insurers.find((i) => i.id === insurerId) ?? insurers[0];

  // Server-side price verification: recalculate from actual pricing engine
  // instead of trusting URL params (BUG-001 fix)
  const productsMap: Record<string, ProductInfo> = {};
  Object.values(productsConfig).forEach((p) => { productsMap[p.id] = p; });
  const extras = (searchParams.get('extras') ?? '').split(',').filter(Boolean);
  const EXTRA_PRICES: Record<string, number> = {
    'Business Interruption': 350, 'Food Contamination': 280, 'Cyber Liability': 420,
    'Stock Throughput': 300, 'Directors & Officers': 480, 'Environmental Liability': 250,
    'Fleet Insurance': 550, 'Cargo Insurance': 400,
  };
  const extrasTotal = extras.reduce((sum, name) => sum + (EXTRA_PRICES[name] ?? 300), 0);
  const verifiedTotal = calculateTotalPremium(
    {
      productIds,
      riskFactor: businessType.riskFactor,
      sizeFactor: getSizeFactor(employeeBand),
      coverageLimits: limits,
      insurerMultiplier: insurer.priceMultiplier,
    },
    productsMap,
  ) + extrasTotal;
  const total = verifiedTotal;

  const eidName = searchParams.get('eidName') ?? '';
  const [form, setForm] = useState<ContactForm>({
    fullName: session?.user?.name || eidName,
    email: session?.user?.email || '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [declared, setDeclared] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'apple_pay' | 'bank_transfer' | 'finwall'>('card');
  const [finwallAgreed, setFinwallAgreed] = useState(false);
  const [cardForm, setCardForm] = useState({num: '', exp: '', cvv: '', name: ''});
  const monthlyAmount = Math.round(total * 1.08 / 12);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) {
      newErrors.fullName = t.checkout.fullNameRequired;
    }
    if (!form.email || !EMAIL_REGEX.test(form.email)) {
      newErrors.email = t.checkout.invalidEmail;
    }
    if (
      !form.phone ||
      !UAE_PHONE_REGEX.test(form.phone.replace(/\s/g, ''))
    ) {
      newErrors.phone = t.checkout.invalidPhone;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        document
          .querySelector('[data-error]')
          ?.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, SCROLL_TO_ERROR_DELAY_MS);
    }
    return Object.keys(newErrors).length === 0;
  }

  function proceedWithPayment() {
    setIsProcessing(true);
    setTimeout(() => {
      const params = new URLSearchParams({
        type: typeId,
        insurer: insurerId,
        total: String(total),
        products: productIds.join(','),
        limits: JSON.stringify(limits),
        email: form.email,
        name: form.fullName,
        phone: form.phone,
        businessName,
        emirate,
      });
      const licenseNumber = searchParams.get('licenseNumber');
      const employees = searchParams.get('employees');
      if (licenseNumber) params.set('licenseNumber', licenseNumber);
      if (employees) params.set('employees', employees);
      if (extras.length > 0) params.set('extras', extras.join(','));
      params.set('payMethod', payMethod);
      if (payMethod === 'finwall') params.set('payRef', `FW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
      if (payMethod === 'bank_transfer') params.set('payRef', `SHRY-${Date.now().toString(36).toUpperCase()}`);
      window.scrollTo({top: 0, behavior: 'smooth'});
      router.push(`/quote/confirmation?${params.toString()}`);
    }, PAYMENT_PROCESSING_MS);
  }

  function handlePay() {
    if (!validate()) return;
    if (!session?.user) {
      console.log('📱 Opening auth modal - user not authenticated');
      setShowAuthModal(true);
      return;
    }
    console.log('✓ User authenticated, proceeding with payment');
    proceedWithPayment();
  }

  function clearError(field: string) {
    if (errors[field]) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  }

  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 py-20">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-3xl">💳</span>
        </div>
        <p className="text-lg font-semibold text-text">
          {t.checkout.processing}
        </p>
        <div className="w-56 h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out]" />
        </div>
        <p className="text-xs text-text-muted">
          {t.checkout.processingDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator
        currentStep={6}
        totalSteps={6}
        label={t.progress.checkout}
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          {t.checkout.title}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {t.checkout.subtitle}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-5">
        {/* Order Summary */}
        <Card className="rounded-2xl border-2 border-border bg-white shadow-sm overflow-hidden">
          <div className="bg-surface px-5 py-2.5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              {t.checkout.orderSummary}
            </p>
          </div>
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Insurer */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl border border-border bg-white flex items-center justify-center overflow-hidden">
                {insurer.logo ? (
                  <img
                    src={insurer.logo}
                    alt={insurer.name}
                    className="w-9 h-9 object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-white bg-primary/80 w-full h-full flex items-center justify-center">
                    {insurer.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text text-sm">
                  {(t.insurers as Record<string, string>)[
                    insurer.id.toLowerCase()
                  ] || insurer.name}
                </p>
                <p className="text-xs text-text-muted">
                  {(t.businessType as Record<string, string>)[
                    businessType.id
                  ] || businessType.title} · {(t.options.emirates as Record<string, string>)[emirate] || emirate}
                </p>
              </div>
            </div>

            {/* Company */}
            {companyVerified && businessName && (
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2 text-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-primary">
                  <path
                    d="M3.5 7.5L6 10L10.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-text font-medium">
                  {businessName}
                </span>
                <span className="text-xs text-primary">
                  {t.companyDetails.verified}
                </span>
              </div>
            )}

            <div className="h-px bg-border" />

            {/* Product lines */}
            {productIds
              .filter((id) => productsConfig[id])
              .map((productId) => {
                const product = productsConfig[productId];
                const limit = limits[productId] ?? '1M';
                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{product.icon}</span>
                      <span className="text-text">
                        {(t.products as Record<string, {name: string; shortName: string}>)[productId]?.name || product.name}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
                      {limit === '1M'
                        ? t.results.coverageLimit1m
                        : limit === '2M'
                          ? t.results.coverageLimit2m
                          : limit === '5M'
                            ? t.results.coverageLimit5m
                            : `AED ${limit}`}
                    </span>
                  </div>
                );
              })}

            {/* Add-on extras */}
            {extras.length > 0 && extras.map((extraName) => (
              <div key={extraName} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span className="text-text">+ {extraName}</span>
                </div>
                <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
                  {locale === 'ar' ? 'مشمول' : 'Covered'}
                </span>
              </div>
            ))}

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text">
                  {t.checkout.totalPremium}
                </span>
                <span className="font-bold text-primary text-xl">
                  {formatPriceWithCurrency(total, t.common.currency, locale)}
                  <span className="text-xs font-normal text-text-muted">
                    {locale === 'ar' ? '/سنوياً' : '/yr'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {locale === 'ar' ? 'أو' : 'or'}{' '}
                <span className="font-semibold text-text">
                  {formatPriceWithCurrency(Math.round(total * 1.08 / 12), t.common.currency, locale)}
                </span>
                {t.common.perMonth}
                <span className="text-[10px] text-text-muted ms-1">({locale === 'ar' ? 'رسوم أقساط 8%' : '8% instalment fee'})</span>
              </p>
              <p className="text-xs text-text-muted">
                {t.results.finwallPrefix}{' '}
                <span className="font-semibold text-text">
                  {t.results.finwallBrand}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="rounded-2xl border-2 border-border bg-white shadow-sm overflow-hidden">
          <div className="bg-surface px-5 py-2.5">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              {t.checkout.contactDetails}
            </p>
          </div>
          <CardContent className="flex flex-col gap-4 p-5">
            {[
              {
                key: 'fullName',
                label: t.checkout.fullName,
                type: 'text',
                placeholder: t.checkout.namePlaceholder,
              },
              {
                key: 'email',
                label: t.checkout.email,
                type: 'email',
                placeholder: t.checkout.emailPlaceholder,
              },
            ].map((field) => (
              <div
                key={field.key}
                {...(errors[field.key] ? {'data-error': true} : {})}>
                <label className="block text-sm font-medium text-text mb-1.5">
                  {field.label}{' '}
                  <span className="text-red-500 text-xs">*</span>
                </label>
                <input
                  type={field.type}
                  value={form[field.key as keyof ContactForm]}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }));
                    clearError(field.key);
                  }}
                  placeholder={field.placeholder}
                  className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                    errors[field.key]
                      ? 'border-red-500'
                      : 'border-border'
                  }`}
                />
                {errors[field.key] && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            ))}

            {/* Phone with UAE flag + auto-formatting */}
            <div {...(errors.phone ? {'data-error': true} : {})}>
              <label className="block text-sm font-medium text-text mb-1.5">
                {t.checkout.phone}{' '}
                <span className="text-red-500 text-xs">*</span>
              </label>
              <div
                className={`flex items-center rounded-xl border bg-white overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-border'
                }`}>
                <div className="flex items-center gap-1.5 ps-4 pe-2 py-3 border-e border-gray-100 shrink-0 bg-gray-50">
                  <span className="text-base">🇦🇪</span>
                  <span className="text-sm text-gray-500 font-medium">
                    +971
                  </span>
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    let formatted = digits;
                    if (digits.length > 2) {
                      formatted = `${digits.slice(0, 2)} ${digits.slice(2)}`;
                    }
                    if (digits.length > 5) {
                      formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
                    }
                    setForm((prev) => ({...prev, phone: formatted}));
                    clearError('phone');
                  }}
                  placeholder={t.checkout.phonePlaceholder}
                  maxLength={12}
                  className="flex-1 px-3 py-3 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none tracking-wide"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Declaration checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            {locale === 'ar'
              ? 'أؤكد أن المعلومات المقدمة صحيحة ودقيقة. قد تؤدي المعلومات الخاطئة إلى إبطال وثيقة التأمين.'
              : 'I confirm the information provided is accurate and complete. False or misleading information may void my policy.'}
          </span>
        </label>

        {/* Payment Methods */}
        <Card className="rounded-2xl border-2 border-border bg-white shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col gap-3">
            <p className="text-sm font-bold text-text">{locale === 'ar' ? 'اختر طريقة الدفع' : 'Choose Payment Method'}</p>

            {/* Card Payment */}
            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`w-full text-start rounded-xl border-2 p-4 transition-all ${payMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{locale === 'ar' ? 'بطاقة ائتمان' : 'Card Payment'}</p>
                  <p className="text-[11px] text-text-muted">Visa · Mastercard · Amex · 3D Secure</p>
                </div>
              </div>
              {payMethod === 'card' && (
                <div className="mt-3 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text" inputMode="numeric" placeholder="Card number"
                    value={cardForm.num}
                    onChange={(e) => setCardForm((p) => ({...p, num: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()}))}
                    className="col-span-2 rounded-lg border border-border px-3 py-2.5 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary tracking-widest"
                  />
                  <input
                    type="text" inputMode="numeric" placeholder="MM/YY"
                    value={cardForm.exp}
                    onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); setCardForm((p) => ({...p, exp: d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d})); }}
                    className="rounded-lg border border-border px-3 py-2.5 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text" inputMode="numeric" placeholder="CVV"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm((p) => ({...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)}))}
                    className="rounded-lg border border-border px-3 py-2.5 text-sm bg-white text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </button>

            {/* Apple Pay */}
            <button
              type="button"
              onClick={() => setPayMethod('apple_pay')}
              className={`w-full text-start rounded-xl border-2 p-4 transition-all ${payMethod === 'apple_pay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍎</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">Apple Pay</p>
                  <p className="text-[11px] text-text-muted">{locale === 'ar' ? 'ادفع بلمسة واحدة' : 'One-tap payment via Apple Wallet'}</p>
                </div>
              </div>
            </button>

            {/* Monthly Instalments (Finwall) */}
            <button
              type="button"
              onClick={() => setPayMethod('finwall')}
              className={`w-full text-start rounded-xl border-2 p-4 transition-all ${payMethod === 'finwall' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{locale === 'ar' ? 'أقساط شهرية' : 'Monthly Instalments'}</p>
                  <p className="text-[11px] text-text-muted">
                    {formatPriceWithCurrency(monthlyAmount, t.common.currency, locale)}{t.common.perMonth} × 12 · {locale === 'ar' ? 'مقدم من' : 'Powered by'} Finwall
                  </p>
                </div>
              </div>
              {payMethod === 'finwall' && (
                <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[11px] text-text-muted">0% {locale === 'ar' ? 'فائدة · بدون رسوم خفية' : 'interest · No hidden fees'}</p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={finwallAgreed} onChange={(e) => setFinwallAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary shrink-0" />
                    <span className="text-[10px] text-text-muted leading-relaxed">
                      {locale === 'ar' ? 'أوافق على شروط وأحكام Finwall وأفهم أنه سيتم تحصيل المدفوعات شهرياً' : 'I agree to the Finwall Terms & Conditions and understand payments will be collected monthly'}
                    </span>
                  </label>
                </div>
              )}
            </button>

            {/* Bank Transfer */}
            <button
              type="button"
              onClick={() => setPayMethod('bank_transfer')}
              className={`w-full text-start rounded-xl border-2 p-4 transition-all ${payMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🏦</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{locale === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</p>
                  <p className="text-[11px] text-text-muted">{locale === 'ar' ? 'تحويل عبر البنك الإماراتي' : 'UAE bank transfer'}</p>
                </div>
              </div>
              {payMethod === 'bank_transfer' && (
                <div className="mt-3 space-y-1.5 text-[11px] text-text-muted bg-surface rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                  <p><span className="font-semibold text-text">Bank:</span> Emirates NBD</p>
                  <p><span className="font-semibold text-text">Account:</span> Shory Technology LLC</p>
                  <p><span className="font-semibold text-text">IBAN:</span> AE07 0260 0015 0318 6700 201</p>
                  <p className="text-[10px]">{locale === 'ar' ? 'سيتم تفعيل وثيقتك خلال يوم عمل واحد' : 'Policy activated within 1 business day of receipt'}</p>
                </div>
              )}
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted pt-1">
              <span>🔒 SSL</span>
              <span>🏦 PCI DSS</span>
              <span>🛡️ 3D Secure</span>
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          disabled={!declared || (payMethod === 'finwall' && !finwallAgreed)}
          onClick={handlePay}
          className="w-full rounded-xl bg-primary text-white py-3.5 text-base font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm disabled:opacity-50">
          {payMethod === 'apple_pay' ? 'Pay with Apple Pay' : payMethod === 'bank_transfer' ? (locale === 'ar' ? 'تأكيد التحويل' : 'Confirm Transfer') : t.checkout.payNow}
          {' — '}
          {formatPriceWithCurrency(payMethod === 'finwall' ? monthlyAmount : total, t.common.currency, locale)}
          {payMethod === 'finwall' ? t.common.perMonth : (locale === 'ar' ? '/سنوياً' : '/yr')}
        </Button>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => proceedWithPayment()}
        />
      </div>
    </div>
  );
}
