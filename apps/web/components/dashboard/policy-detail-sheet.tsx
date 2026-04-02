'use client';

import {Button, Card, CardContent} from '@shory/ui';
import {usePolicyPdf} from '@/hooks/use-policy-pdf';
import {useI18n} from '@/lib/i18n';
import {calculateMonthlyPrice, formatPrice, formatPriceWithCurrency} from '@/lib/pricing';
import type {EnrichedPolicy} from '@/types/dashboard';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

interface PolicyDetailSheetProps {
  policy: EnrichedPolicy | null;
  onClose: () => void;
}

export function PolicyDetailSheet({policy, onClose}: PolicyDetailSheetProps) {
  const {t, locale} = useI18n();

  if (!policy) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const businessType = businessTypes.find((bt) => bt.id === policy.businessName) || businessTypes[0];
  const insurer = insurers.find((i) => i.id === policy.providerId) || insurers[0];

  // Map product IDs to names and use default limit
  const products = policy.products
    .map((productId) => {
      const config = (productsConfig as Record<string, any>)?.[productId];
      const product = (t.products as Record<string, {name: string}>)?.[productId];
      return {
        name: product?.name || config?.name || productId,
        limit: '1M', // Default limit
      };
    })
    .filter(Boolean);

  const pdfData = {
    policyNumber: policy.policyNumber,
    insurerId: policy.providerId,
    insurerName: policy.providerName,
    insurerLogo: insurer.logo,
    typeId: '',
    businessTypeName: businessType.title,
    businessName: policy.businessName,
    licenseNumber: '',
    emirate: '',
    name: '',
    email: '',
    phone: '',
    employees: '',
    products,
    total: parseInt(policy.annualPremium),
    startDate: new Date(policy.startDate),
    endDate: new Date(policy.endDate),
  };

  const {downloadCert, downloadInvoice, downloadingCert, downloadingInvoice} = usePolicyPdf(pdfData);

  const monthlyPrice = calculateMonthlyPrice(parseInt(policy.annualPremium));
  const daysToExpiry = Math.ceil((new Date(policy.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold">{t.dashboard?.policyDetails || 'Policy Details'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Policy Number & Status */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{t.dashboard?.policyNumber || 'Policy Number'}</p>
              <p className="text-lg font-semibold text-gray-900">{policy.policyNumber}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
              {policy.status}
            </span>
          </div>

          {/* Insurer */}
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-2">{t.dashboard?.insurer || 'Insurer'}</p>
            <div className="flex items-center gap-3">
              {insurer.logo && (
                <img src={insurer.logo} alt={insurer.name} className="w-10 h-10 object-contain" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{policy.providerName}</p>
                <p className="text-sm text-gray-500">{businessType.title}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t.dashboard?.startDate || 'Effective Date'}</p>
              <p className="font-semibold text-gray-900">
                {new Date(policy.startDate).toLocaleDateString('en-AE')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.dashboard?.endDate || 'Expiry Date'}</p>
              <p className="font-semibold text-gray-900">
                {new Date(policy.endDate).toLocaleDateString('en-AE')}
              </p>
              {daysToExpiry > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {daysToExpiry} {t.dashboard?.days || 'days'} remaining
                </p>
              )}
            </div>
          </div>

          {/* Coverage */}
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-3">{t.dashboard?.coverage || 'Coverage'}</p>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{product.name}</span>
                  <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">
                    AED {product.limit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t.dashboard?.monthlyPremium || 'Monthly Premium'}</span>
              <span className="font-semibold text-gray-900">
                {formatPriceWithCurrency(monthlyPrice, t.common.currency, locale)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t.dashboard?.annualPremium || 'Annual Premium'}</span>
              <span className="text-lg font-bold text-primary">
                {formatPriceWithCurrency(parseInt(policy.annualPremium), t.common.currency, locale)}
              </span>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={downloadCert}
              disabled={downloadingCert || downloadingInvoice}
              className="flex-1 bg-primary text-white rounded-xl py-2.5 font-semibold hover:bg-primary/90 disabled:opacity-50">
              {downloadingCert ? '...' : t.dashboard?.downloadCert || 'Download Certificate'}
            </Button>
            <Button
              onClick={downloadInvoice}
              disabled={downloadingInvoice || downloadingCert}
              variant="outline"
              className="flex-1 border-border rounded-xl py-2.5 font-semibold">
              {downloadingInvoice ? '...' : t.dashboard?.downloadInvoice || 'Download Invoice'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
