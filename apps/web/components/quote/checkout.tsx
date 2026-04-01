'use client';

import {useState} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {formatPrice} from '@/lib/pricing';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

const UAE_PHONE_REGEX = /^(05\d{8}|\+9715\d{8})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
}

export function Checkout() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const total = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(',') as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
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
      newErrors.phone = 'Please enter a valid UAE phone (05X or +9715X)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handlePay() {
    if (!validate()) return;

    setIsProcessing(true);

    // Mock payment processing (2 seconds)
    setTimeout(() => {
      const params = new URLSearchParams({
        type: typeId,
        insurer: insurerId,
        total: String(total),
        products: productIds.join(','),
        limits: JSON.stringify(limits),
        email: form.email,
        name: form.fullName,
      });
      router.push(`/quote/confirmation?${params.toString()}`);
    }, 2000);
  }

  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-3xl">💳</span>
        </div>
        <p className="text-lg font-medium text-text">
          Processing your payment...
        </p>
        <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProgressIndicator currentStep={5} totalSteps={6} label="Checkout" />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Review & Complete Your Purchase
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-6">
        {/* Order Summary */}
        <Card className="rounded-2xl border border-border bg-white">
          <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg font-bold text-text">
                {insurer.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-text text-sm">
                  {insurer.name}
                </p>
                <p className="text-xs text-text-muted">
                  {businessType.title} · Dubai
                </p>
              </div>
            </div>

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
                      <span className="text-xs text-text-muted">
                        (AED {limit})
                      </span>
                    </div>
                  </div>
                );
              })}

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-bold text-text">Total Premium</span>
              <span className="font-bold text-text text-lg">
                AED {formatPrice(total)}/yr
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="rounded-2xl border border-border bg-white">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
            <h2 className="font-semibold text-text">Your Contact Details</h2>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => {
                  setForm((prev) => ({...prev, fullName: e.target.value}));
                  if (errors.fullName) {
                    setErrors((prev) => {
                      const next = {...prev};
                      delete next.fullName;
                      return next;
                    });
                  }
                }}
                placeholder="Enter your full name"
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.fullName ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => {
                  setForm((prev) => ({...prev, email: e.target.value}));
                  if (errors.email) {
                    setErrors((prev) => {
                      const next = {...prev};
                      delete next.email;
                      return next;
                    });
                  }
                }}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => {
                  setForm((prev) => ({...prev, phone: e.target.value}));
                  if (errors.phone) {
                    setErrors((prev) => {
                      const next = {...prev};
                      delete next.phone;
                      return next;
                    });
                  }
                }}
                placeholder="05X XXXX XXX"
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-white text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                  errors.phone ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          className="w-full rounded-xl bg-primary text-white py-3 text-base font-medium hover:bg-primary-hover transition-all duration-200"
        >
          Pay Now — AED {formatPrice(total)}
        </Button>
      </div>
    </div>
  );
}
