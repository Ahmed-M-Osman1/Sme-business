'use client';

import {useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {formatPrice} from '@/lib/pricing';
import {useI18n} from '@/lib/i18n';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

// Validates 9 digits after +971 prefix (5XXXXXXXX) — stored without prefix
const UAE_PHONE_REGEX = /^5\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
}

export function Checkout() {
  const {t} = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const total = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(
    ',',
  ) as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );

  const businessName = searchParams.get('businessName') ?? '';
  const companyVerified = searchParams.get('companyVerified') === 'true';
  const emirate = searchParams.get('emirate') ?? 'Dubai';

  const businessType =
    businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];

  const [form, setForm] = useState<ContactForm>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.fullName || form.fullName.length < 2) {
      newErrors.fullName = 'Full name is required (min 2 characters)';
    }
    if (!form.email || !EMAIL_REGEX.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.phone || !UAE_PHONE_REGEX.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.checkout.invalidPhone;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handlePay() {
    if (!validate()) return;
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
      router.push(`/quote/confirmation?${params.toString()}`);
    }, 2000);
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
      <ProgressIndicator currentStep={5} label={t.progress.checkout} />

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
                  <img src={insurer.logo} alt={insurer.name} className="w-9 h-9 object-contain" />
                ) : (
                  <span className="text-lg font-bold text-white bg-primary/80 w-full h-full flex items-center justify-center">{insurer.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text text-sm">
                  {insurer.name}
                </p>
                <p className="text-xs text-text-muted">
                  {businessType.title} · {emirate}
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
                  className="text-primary"
                >
                  <path
                    d="M3.5 7.5L6 10L10.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-text font-medium">{businessName}</span>
                <span className="text-xs text-primary">verified</span>
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
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{product.icon}</span>
                      <span className="text-text">{product.name}</span>
                    </div>
                    <span className="text-xs text-text-muted bg-surface rounded-full px-2 py-0.5">
                      AED {limit}
                    </span>
                  </div>
                );
              })}

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <span className="font-bold text-text">Total Premium</span>
              <span className="font-bold text-primary text-xl">
                AED {formatPrice(total)}
                <span className="text-xs font-normal text-text-muted">
                  /yr
                </span>
              </span>
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
              <div key={field.key}>
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
                    errors[field.key] ? 'border-red-500' : 'border-border'
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
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                {t.checkout.phone} <span className="text-red-500 text-xs">*</span>
              </label>
              <div className={`flex items-center rounded-xl border bg-white overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-border'
              }`}>
                <div className="flex items-center gap-1.5 pl-4 pr-2 py-3 border-r border-gray-100 shrink-0 bg-gray-50">
                  <span className="text-base">🇦🇪</span>
                  <span className="text-sm text-gray-500 font-medium">+971</span>
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
                <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          className="w-full rounded-xl bg-primary text-white py-3.5 text-base font-semibold hover:bg-primary/90 transition-all duration-200 shadow-sm"
        >
          {t.checkout.payNow} — AED {formatPrice(total)}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-2 inline"
          >
            <path
              d="M6 3.333L10.667 8L6 12.667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
