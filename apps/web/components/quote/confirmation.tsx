'use client';

import {useState, useRef, useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import {useSession} from 'next-auth/react';
import Link from 'next/link';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {LottieAnimation} from '@/components/ui/lottie-animation';
import {
  calculateMonthlyPrice,
  formatPrice,
  formatPriceWithCurrency,
} from '@/lib/pricing';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
import {useI18n} from '@/lib/i18n';
import {api} from '@/lib/api-client';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

/** Wait for iframe content to render before capturing to canvas. */
const IFRAME_RENDER_DELAY_MS = 800;

export function Confirmation() {
  const {t, locale} = useI18n();
  const {data: session} = useSession();
  const searchParams = useSearchParams();
  const hasSaved = useRef(false);

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const total = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(
    ',',
  ) as ProductId[];
  const limits: Record<string, string> = JSON.parse(
    searchParams.get('limits') ?? '{}',
  );
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const businessName = searchParams.get('businessName') ?? '';
  const licenseNumber = searchParams.get('licenseNumber') ?? '';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const employees = searchParams.get('employees') ?? '';
  const extras = (searchParams.get('extras') ?? '').split(',').filter(Boolean);
  const payMethod = searchParams.get('payMethod') ?? 'card';
  const payRef = searchParams.get('payRef') ?? '';

  const businessType =
    businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer =
    insurers.find((i) => i.id === insurerId) ?? insurers[0];
  const [policyNumber] = useState(
    () => `SHR-${Date.now().toString(36).toUpperCase()}`,
  );
  const [today] = useState(() => new Date());
  const expiryDate = new Date(today);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-AE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Persist policy to database on mount — retry if session not ready yet
  useEffect(() => {
    if (hasSaved.current) return;

    function attemptSave() {
      if (hasSaved.current) return;
      if (!session?.user?.id || !session?.user?.email) return false;

      hasSaved.current = true;
      api.user.policies
        .create(
          {
            userId: session.user.id!,
            businessName,
            emirate,
            typeId,
            insurerId,
            products: productIds,
            limits,
            total,
            name,
            email,
            phone,
            licenseNumber,
            employees,
          },
          session.user.email!,
        )
        .then(() => console.log('✅ Policy saved successfully'))
        .catch((err) => console.error('❌ Policy save failed:', err));
      return true;
    }

    // Try immediately
    if (attemptSave()) return;

    // Retry every 1s for up to 10s while session loads
    const interval = setInterval(() => {
      if (attemptSave()) clearInterval(interval);
    }, 1000);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [session]); // Re-run when session changes

  const [downloadingCert, setDownloadingCert] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  async function generatePdf(docType: 'certificate' | 'invoice') {
    const isInvoice = docType === 'invoice';
    const setter = isInvoice
      ? setDownloadingInvoice
      : setDownloadingCert;
    setter(true);
    const products = [
      ...productIds
        .filter((id) => productsConfig[id])
        .map((id) => ({
          name: productsConfig[id].name,
          limit: limits[id] ?? '1M',
        })),
      ...extras.map((extraName) => ({
        name: `+ ${extraName}`,
        limit: 'Add-on',
      })),
    ];

    const translatedInsurerName =
      (t.insurers as Record<string, string>)[
        insurer.id.toLowerCase()
      ] || insurer.name;

    const monthlyPrice = Math.round(total / 12);
    const monthlyTaxAmount = Math.round(monthlyPrice * 0.05);
    const monthlySubtotal = monthlyPrice - monthlyTaxAmount;

    const html = isInvoice
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shory Invoice - ${policyNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 32px; max-width: 900px; margin: 0 auto; background: white; font-size: 12px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .logo { font-size: 24px; font-weight: 900; font-style: italic; color: #1D68FF; }
    .invoice-info { text-align: right; }
    .invoice-info h1 { font-size: 26px; color: #1a1a1a; margin-bottom: 6px; }
    .invoice-info p { font-size: 13px; color: #666; margin: 4px 0; }
    .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .address-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; font-weight: 600; margin-bottom: 8px; }
    .address-block p { font-size: 14px; line-height: 1.6; }
    .divider { height: 1px; background: #e5e7eb; margin: 40px 0; }
    .line-items { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .line-items thead { background: #f9fafb; }
    .line-items th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; font-weight: 600; padding: 12px 0; border-bottom: 2px solid #e5e7eb; }
    .line-items td { padding: 16px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .line-items .product { font-weight: 500; }
    .line-items .limit { text-align: center; color: #666; }
    .line-items .price { text-align: right; font-weight: 500; }
    .totals { width: 100%; margin-bottom: 40px; }
    .total-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row.subtotal { font-size: 14px; }
    .total-row.tax { font-size: 14px; }
    .total-row.final { border-top: 2px solid #1D68FF; border-bottom: none; padding-top: 16px; padding-bottom: 16px; background: #f0f7ff; margin: 0 -16px; padding: 16px; }
    .total-row.final { font-size: 18px; font-weight: 700; color: #1D68FF; }
    .total-label { font-size: 14px; }
    .total-amount { text-align: right; font-weight: 600; }
    .payment-section { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .payment-section h4 { font-size: 13px; font-weight: 600; text-transform: uppercase; color: #1a1a1a; margin-bottom: 12px; }
    .payment-section p { font-size: 13px; line-height: 1.6; color: #666; margin: 8px 0; }
    .footer { border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 11px; color: #999; text-align: center; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Shory</div>
    <div class="invoice-info">
      <h1>INVOICE</h1>
      <p><strong>Invoice #:</strong> ${policyNumber}</p>
      <p><strong>Date:</strong> ${formatDate(today)}</p>
      <p><strong>Due Date:</strong> ${formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))}</p>
    </div>
  </div>

  <div class="addresses">
    <div class="address-block">
      <h3>Bill To</h3>
      <p><strong>${businessName || name}</strong></p>
      <p>${businessType.title}</p>
      <p>License: ${licenseNumber || 'N/A'}</p>
      <p>Email: ${email}</p>
      <p>Phone: ${phone ? '+971 ' + phone : 'N/A'}</p>
      <p>Emirate: ${emirate}</p>
    </div>
    <div class="address-block">
      <h3>From</h3>
      <p><strong>Shory Insurance Platform</strong></p>
      <p><img src="${window.location.origin}${insurer.logo}" style="height: 32px; margin: 8px 0;" alt="${translatedInsurerName}" /></p>
      <p><strong>${translatedInsurerName}</strong></p>
      <p>Email: support@shory.ae</p>
      <p>Website: shory.ae</p>
    </div>
  </div>

  <div class="divider"></div>

  <table class="line-items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="limit">Coverage Limit</th>
        <th class="price">Price (Monthly)</th>
      </tr>
    </thead>
    <tbody>
      ${products.map((p) => `<tr><td class="product">${p.name}</td><td class="limit">${p.limit === 'Add-on' ? 'Covered' : `AED ${p.limit}`}</td><td class="price">AED ${formatPrice(Math.round(monthlyPrice / products.length))}</td></tr>`).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row subtotal">
      <div class="total-label">Monthly Subtotal</div>
      <div></div>
      <div class="total-amount">AED ${formatPrice(monthlySubtotal)}</div>
    </div>
    <div class="total-row tax">
      <div class="total-label">Tax (5%)</div>
      <div></div>
      <div class="total-amount">AED ${formatPrice(monthlyTaxAmount)}</div>
    </div>
    <div class="total-row final">
      <div class="total-label">MONTHLY DUE</div>
      <div></div>
      <div class="total-amount">AED ${formatPrice(monthlyPrice)}</div>
    </div>
  </div>

  <div class="payment-section">
    <h4>Payment Information</h4>
    <p><strong>Monthly Payment:</strong> AED ${formatPrice(monthlyPrice)} per month via FINWALL</p>
    <p><strong>Annual Total:</strong> AED ${formatPrice(total)}</p>
    <p><strong>Policy Period:</strong> 12 months</p>
    <p><strong>Payment Method:</strong> Monthly installments available through our payment partner</p>
    <p style="margin-top: 12px; font-style: italic; color: #999;">Thank you for choosing Shory for your insurance needs!</p>
  </div>

  <div class="footer">
    <p>This invoice was generated by Shory Insurance Platform on ${formatDate(today)}</p>
    <p>For support, contact: support@shory.ae | +971 4 XXX XXXX</p>
    <p style="margin-top: 12px;">© 2024 Shory Insurance. All rights reserved.</p>
  </div>
</body>
</html>`
      : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shory Policy Certificate - ${policyNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 3px solid #1D68FF; }
    .logo { font-size: 28px; font-weight: 900; font-style: italic; color: #1a1a1a; }
    .doc-type { text-align: right; }
    .doc-type h2 { font-size: 22px; color: #1D68FF; margin-bottom: 2px; }
    .doc-type p { font-size: 12px; color: #888; margin: 2px 0; }
    .certificate-badge { text-align: center; margin: 20px 0; padding: 16px; background: linear-gradient(135deg, #1D68FF 0%, #0052cc 100%); border-radius: 8px; color: white; }
    .certificate-badge h3 { font-size: 24px; font-weight: 700; margin-bottom: 2px; }
    .certificate-badge p { font-size: 13px; opacity: 0.9; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #1D68FF; font-weight: 700; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 2px solid #e5e7eb; }
    .section-content { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .field { background: #f9fafb; border-left: 4px solid #1D68FF; border-radius: 4px; padding: 8px 12px; }
    .field-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; margin-bottom: 2px; font-weight: 600; }
    .field-value { font-size: 13px; font-weight: 500; color: #1a1a1a; }
    .insurer-block { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f0f7ff; border-radius: 6px; margin-bottom: 12px; }
    .insurer-logo { height: 36px; width: auto; object-fit: contain; }
    .insurer-info { flex: 1; }
    .insurer-name { font-size: 14px; font-weight: 600; color: #1a1a1a; }
    .insurer-detail { font-size: 11px; color: #666; margin-top: 2px; }
    .coverage-table { width: 100%; border-collapse: collapse; }
    .coverage-table th { background: #f9fafb; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #999; font-weight: 600; padding: 8px 0; border-bottom: 2px solid #1D68FF; }
    .coverage-table td { padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    .coverage-table td:last-child { text-align: right; color: #1D68FF; font-weight: 600; }
    .important-notice { background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 10px; margin: 16px 0; }
    .important-notice h4 { font-size: 10px; font-weight: 700; color: #856404; margin-bottom: 4px; text-transform: uppercase; }
    .important-notice p { font-size: 10px; color: #856404; line-height: 1.4; margin: 2px 0; }
    .footer { margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #999; text-align: center; }
    .footer p { margin: 2px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Shory</div>
    <div class="doc-type">
      <h2>POLICY CERTIFICATE</h2>
      <p>Policy #: ${policyNumber}</p>
      <p>Issued: ${formatDate(today)}</p>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Insurer Information</div>
    <div class="insurer-block">
      <img src="${window.location.origin}${insurer.logo}" class="insurer-logo" alt="${translatedInsurerName}" />
      <div class="insurer-info">
        <div class="insurer-name">${translatedInsurerName}</div>
        <div class="insurer-detail">${businessType.title} · ${emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Details</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Policy Number</div>
        <div class="field-value">${policyNumber}</div>
      </div>
      <div class="field">
        <div class="field-label">Status</div>
        <div class="field-value">Active</div>
      </div>
      <div class="field">
        <div class="field-label">Effective Date</div>
        <div class="field-value">${formatDate(today)}</div>
      </div>
      <div class="field">
        <div class="field-label">Expiry Date</div>
        <div class="field-value">${formatDate(expiryDate)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Holder</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Full Name</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${email}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${phone ? '+971 ' + phone : 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Emirate</div>
        <div class="field-value">${emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Business Details</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Business Name</div>
        <div class="field-value">${businessName}</div>
      </div>
      <div class="field">
        <div class="field-label">Business Type</div>
        <div class="field-value">${businessType.title}</div>
      </div>
      <div class="field">
        <div class="field-label">License Number</div>
        <div class="field-value">${licenseNumber}</div>
      </div>
      <div class="field">
        <div class="field-label">Employees</div>
        <div class="field-value">${employees}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Coverage Details</div>
    <table class="coverage-table">
      <thead>
        <tr>
          <th>Coverage Type</th>
          <th style="text-align:right">Limit</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((p) => `<tr><td>${p.name}</td><td>${p.limit === 'Add-on' ? 'Covered' : `AED ${p.limit}`}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="important-notice">
    <h4>⚠ Important Notice</h4>
    <p>• This policy is active and effective immediately upon receipt of the full premium</p>
    <p>• Please retain this certificate for your records</p>
    <p>• For claims or policy-related inquiries, contact the insurer immediately</p>
    <p>• Coverage is subject to the terms and conditions of the policy document</p>
  </div>

  <div class="footer">
    <p><strong>Total Annual Premium: AED ${formatPrice(total)} (incl. 5% VAT)</strong></p>
    <p>Monthly Payment Option: AED ${formatPrice(monthlyPrice)} per month via FINWALL</p>
    <p style="margin-top: 16px;">Generated by Shory Insurance Platform | support@shory.ae</p>
    <p>© 2024 Shory Insurance. All rights reserved.</p>
  </div>
</body>
</html>`;

    // Render HTML in a hidden iframe, capture with html2canvas, save as PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '800px';
    iframe.style.height = '2000px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) {
      setter(false);
      document.body.removeChild(iframe);
      return;
    }
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content + images to load
    await new Promise((r) => setTimeout(r, IFRAME_RENDER_DELAY_MS));

    try {
      const {default: html2canvas} = await import('html2canvas');
      const {jsPDF} = await import('jspdf');

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        windowWidth: 800,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // If content fits one page, render it. Otherwise paginate.
      if (imgHeight <= pdfPageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      } else {
        let yOffset = 0;
        while (yOffset < imgHeight) {
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfWidth, imgHeight);
          yOffset += pdfPageHeight;
        }
      }
      const prefix = isInvoice ? 'Shory-Invoice' : 'Shory-Policy';
      pdf.save(`${prefix}-${policyNumber}.pdf`);
    } finally {
      document.body.removeChild(iframe);
      setter(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProgressIndicator
        currentStep={6}
        totalSteps={6}
        label={t.progress.confirmed}
      />

      {/* Success hero */}
      <div className="max-w-3xl mx-auto px-4 w-full py-4">
        <div className="flex items-center gap-4">
          <div
            className="shrink-0"
            style={{background: 'transparent'}}>
            <LottieAnimation
              path="/lottie/confirm.lottie"
              className="w-24 h-24"
              loop={false}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t.confirmation.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t.confirmation.subtitle}{' '}
              <span className="font-medium text-gray-900">
                {email}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-5">
        {/* Payment method confirmation */}
        <div className={`rounded-xl px-4 py-3 text-sm ${payMethod === 'bank_transfer' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {payMethod === 'finwall' && (
            <p>{locale === 'ar' ? `أول قسط شهري بقيمة ${formatPriceWithCurrency(Math.round(total * 1.08 / 12), t.common.currency, locale)} سيتم تحصيله قريباً. المرجع: ${payRef}` : `Your first monthly payment of ${formatPriceWithCurrency(Math.round(total * 1.08 / 12), t.common.currency, locale)} will be collected soon. Reference: ${payRef}`}</p>
          )}
          {payMethod === 'apple_pay' && (
            <p>{locale === 'ar' ? `تم اعتماد الدفع بقيمة ${formatPriceWithCurrency(total, t.common.currency, locale)} عبر Apple Pay.` : `Payment of ${formatPriceWithCurrency(total, t.common.currency, locale)} authorised via Apple Pay.`}</p>
          )}
          {payMethod === 'bank_transfer' && (
            <p>{locale === 'ar' ? `سيتم تفعيل وثيقتك خلال يوم عمل واحد من استلام التحويل. المرجع: ${payRef}` : `Your policy will be activated within 1 business day of payment receipt. Reference: ${payRef}`}</p>
          )}
          {payMethod === 'card' && (
            <p>{locale === 'ar' ? `تم اعتماد الدفع بقيمة ${formatPriceWithCurrency(total, t.common.currency, locale)}. وثيقتك فعالة الآن.` : `Payment of ${formatPriceWithCurrency(total, t.common.currency, locale)} authorised. Your policy is now active.`}</p>
          )}
        </div>

        {/* Policy card */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Insurer header */}
          <div className="flex items-center gap-4 p-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
              {insurer.logo ? (
                <img
                  src={insurer.logo}
                  alt={insurer.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-lg font-bold text-gray-500">
                  {insurer.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {(t.insurers as Record<string, string>)[
                  insurer.id.toLowerCase()
                ] || insurer.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {businessType.title} · {emirate}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {t.confirmation.active}
              </span>
            </div>
          </div>

          <CardContent className="p-5 flex flex-col gap-5">
            {/* Policy details */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t.confirmation.policy}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: t.confirmation.policyNumber,
                    value: policyNumber,
                  },
                  {
                    label: t.confirmation.effectiveDate,
                    value: formatDate(today),
                  },
                  {
                    label: t.confirmation.expiryDate,
                    value: formatDate(expiryDate),
                  },
                  {
                    label: t.confirmation.riskLevel,
                    value:
                      (t.businessType as Record<string, string>)[
                        `${businessType.riskLevel}Risk`
                      ] ||
                      businessType.riskLevel.charAt(0).toUpperCase() +
                        businessType.riskLevel.slice(1),
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {f.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value delivered */}
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center mb-3">
                {locale === 'ar' ? 'القيمة المقدمة' : 'Value delivered'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary">14</p>
                  <p className="text-xs text-gray-500">{locale === 'ar' ? 'أيام وفرتها' : 'Days saved vs brokers'}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-primary">8-12</p>
                  <p className="text-xs text-gray-500">{locale === 'ar' ? 'مكالمات تم تجنبها' : 'Calls avoided'}</p>
                </div>
              </div>
            </div>

            {/* Policy holder */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t.confirmation.policyHolder}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label: t.confirmation.fullName, value: name},
                  {label: t.confirmation.email, value: email},
                  {
                    label: t.confirmation.phone,
                    value: phone ? `+971 ${phone}` : '—',
                  },
                  {
                    label: t.confirmation.emirate,
                    value:
                      (t.options.emirates as Record<string, string>)[
                        emirate
                      ] || emirate,
                  },
                ]
                  .filter((f) => f.value)
                  .map((f) => (
                    <div
                      key={f.label}
                      className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {f.label}
                      </p>
                      <p
                        className="text-sm font-medium text-gray-900 mt-0.5 "
                        dir={
                          f.label === t.confirmation.phone
                            ? 'ltr'
                            : undefined
                        }>
                        {f.value}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Business */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t.confirmation.business}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: t.confirmation.businessType,
                    value:
                      (t.businessType as Record<string, string>)[
                        businessType.id
                      ] || businessType.title,
                  },
                  {
                    label: t.confirmation.businessName,
                    value: businessName || '—',
                  },
                  {
                    label: t.confirmation.licenseNumber,
                    value: licenseNumber || '—',
                  },
                  {
                    label: t.confirmation.employees,
                    value: employees
                      ? (
                          t.options.employeeBands as Record<
                            string,
                            string
                          >
                        )[employees] || employees
                      : '—',
                  },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {f.label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {f.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Coverage */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {t.confirmation.coverage}
              </p>
              <div className="flex flex-col gap-2.5">
                {productIds
                  .filter((id) => productsConfig[id])
                  .map((productId) => {
                    const product = productsConfig[productId];
                    const limit = limits[productId] ?? '1M';
                    const IconComponent = PRODUCT_ICONS[productId];
                    return (
                      <div
                        key={productId}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          {IconComponent ? (
                            <IconComponent className="w-5 h-5" />
                          ) : (
                            <span className="text-base">
                              {product.icon}
                            </span>
                          )}
                          <span className="text-sm text-gray-900">
                            {(
                              t.products as Record<
                                string,
                                {name: string; shortName: string}
                              >
                            )[productId]?.name || product.name}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-600 bg-gray-50 rounded-full px-3 py-1">
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
              </div>
              {/* Add-on extras */}
              {extras.length > 0 && extras.map((extraName) => (
                <div key={extraName} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🛡️</span>
                    <span className="text-sm text-gray-900">+ {extraName}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                    Add-on
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex flex-col gap-3 bg-primary rounded-xl px-5 py-4 -mx-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {t.confirmation.totalPremium}
                  </p>
                  <p className="text-xs text-white/85 mt-0.5">
                    {t.confirmation.inclVat}
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatPriceWithCurrency(
                    calculateMonthlyPrice(total),
                    t.common.currency,
                    locale,
                  )}
                </p>
              </div>
              <p className="text-xs text-white/85">
                {t.results.finwallPrefix}{' '}
                <span className="font-semibold text-white">
                  {t.results.finwallBrand}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Download actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => generatePdf('certificate')}
            disabled={downloadingCert}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/40 disabled:opacity-50 disabled:cursor-wait transition-all duration-200">
            {downloadingCert ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary animate-spin">
                  <path
                    d="M9 1.5A7.5 7.5 0 1 0 16.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t.confirmation.generating}
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary">
                  <path
                    d="M9 2.25v9m0 0L6 8.25m3 3 3-3M3 12.75v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.confirmation.downloadPdf}
              </>
            )}
          </button>
          <button
            onClick={() => generatePdf('invoice')}
            disabled={downloadingInvoice}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/40 disabled:opacity-50 disabled:cursor-wait transition-all duration-200">
            {downloadingInvoice ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary animate-spin">
                  <path
                    d="M9 1.5A7.5 7.5 0 1 0 16.5 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {t.confirmation.generating}
              </>
            ) : (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary">
                  <path
                    d="M9 2.25v9m0 0L6 8.25m3 3 3-3M3 12.75v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t.confirmation.downloadInvoice}
              </>
            )}
          </button>
        </div>

        {/* WhatsApp share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(locale === 'ar' ? `تأمنت مع شوري في أقل من 3 دقائق! جربها: https://shory.ae` : `I just got insured with Shory in under 3 minutes! Try it: https://shory.ae`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20BD5A] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.458-1.495A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.37 0-4.567-.82-6.29-2.19l-.44-.36-3.05 1.023 1.022-3.05-.36-.44A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
          {locale === 'ar' ? 'شارك عبر واتساب' : 'Share via WhatsApp'}
        </a>

        {/* Feedback rating */}
        <FeedbackRating locale={locale} />

        {/* Referral card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-lg font-bold text-primary">{locale === 'ar' ? 'أحِل صاحب عمل' : 'Refer a Business Owner'}</p>
          <p className="text-xs text-gray-600 mt-1">{locale === 'ar' ? 'كلاكما يحصل على خصم 200 درهم على التجديد' : 'You both get AED 200 off renewal'}</p>
          <button
            onClick={() => {
              const code = `REF-${policyNumber.slice(-6)}`;
              navigator.clipboard?.writeText(`https://shory.ae?ref=${code}`);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-4 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {locale === 'ar' ? 'نسخ رابط الإحالة' : 'Copy Referral Link'}
          </button>
        </div>

        {/* Go to Dashboard button */}
        {session?.user && (
          <Link href="/dashboard" className="w-full">
            <Button className="w-full rounded-xl border-2 border-primary text-primary bg-white hover:bg-primary/5 py-3.5 text-sm font-semibold">
              {t.confirmation.goToDashboard}
            </Button>
          </Link>
        )}

        {/* Support contact */}
        <Card className="rounded-xl border border-gray-200 bg-gray-50">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-1">
            <div className="flex h-5 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none">
                <path
                  d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 13.75v.01M10 11.25a1.875 1.875 0 1 0-1.875-1.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {t.confirmation.supportTitle}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t.confirmation.supportDescription}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <a
                  href={`mailto:${t.confirmation.supportEmail}`}
                  className="text-xs font-medium text-primary hover:underline">
                  {t.confirmation.supportEmail}
                </a>
                <a
                  href={`tel:${t.confirmation.supportPhone.replace(/\s/g, '')}`}
                  className="text-xs font-medium text-primary hover:underline">
                  {t.confirmation.supportPhone}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start over */}
        <Link
          href="/quote/start"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          {t.confirmation.startNewQuote}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="rtl:rotate-180">
            <path
              d="M6 3.333L10.667 8L6 12.667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function FeedbackRating({locale}: {locale: 'en' | 'ar'}) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-semibold text-emerald-700">
          {locale === 'ar' ? 'شكراً على تقييمك!' : 'Thank you for your feedback!'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
      <p className="text-sm font-semibold text-gray-900 mb-3">
        {locale === 'ar' ? 'كيف كانت تجربتك؟' : 'How was your experience?'}
      </p>
      <div className="flex items-center justify-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      {rating > 0 && (
        <button
          onClick={() => setSubmitted(true)}
          className="rounded-lg bg-primary text-white px-4 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          {locale === 'ar' ? 'إرسال' : 'Submit'}
        </button>
      )}
    </div>
  );
}
