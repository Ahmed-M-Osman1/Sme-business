'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {LottieAnimation} from '@/components/ui/lottie-animation';
import {formatPrice} from '@/lib/pricing';
import {PRODUCT_ICONS} from '@/components/icons/insurance-icons';
import businessTypes from '@/config/business-types.json';
import productsConfig from '@/config/products.json';
import insurers from '@/config/insurers.json';

type ProductId = keyof typeof productsConfig;

export function Confirmation() {
  const searchParams = useSearchParams();

  const typeId = searchParams.get('type') ?? 'general-trading';
  const insurerId = searchParams.get('insurer') ?? 'salama';
  const total = Number(searchParams.get('total') ?? '0');
  const productIds = (searchParams.get('products') ?? '').split(',') as ProductId[];
  const limits: Record<string, string> = JSON.parse(searchParams.get('limits') ?? '{}');
  const email = searchParams.get('email') ?? '';
  const name = searchParams.get('name') ?? '';
  const phone = searchParams.get('phone') ?? '';
  const businessName = searchParams.get('businessName') ?? '';
  const licenseNumber = searchParams.get('licenseNumber') ?? '';
  const emirate = searchParams.get('emirate') ?? 'Dubai';
  const employees = searchParams.get('employees') ?? '';

  const businessType = businessTypes.find((bt) => bt.id === typeId) ?? businessTypes[0];
  const insurer = insurers.find((i) => i.id === insurerId) ?? insurers[0];
  const [policyNumber] = useState(() => `SHR-${Date.now().toString(36).toUpperCase()}`);
  const [today] = useState(() => new Date());
  const expiryDate = new Date(today);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-AE', {day: '2-digit', month: 'short', year: 'numeric'});
  }

  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    setDownloading(true);
    const products = productIds
      .filter((id) => productsConfig[id])
      .map((id) => ({name: productsConfig[id].name, limit: limits[id] ?? '1M'}));

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shory Policy Summary - ${policyNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 48px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #1D68FF; }
    .logo { font-size: 28px; font-weight: 900; font-style: italic; color: #1a1a1a; }
    .doc-type { text-align: right; }
    .doc-type h2 { font-size: 20px; color: #1D68FF; }
    .doc-type p { font-size: 12px; color: #888; margin-top: 4px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; font-weight: 600; margin-bottom: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { background: #f9fafb; border-radius: 8px; padding: 12px 16px; }
    .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; }
    .field-value { font-size: 14px; font-weight: 500; margin-top: 4px; }
    .insurer-row { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f0f7ff; border-radius: 12px; margin-bottom: 20px; }
    .insurer-logo { width: 48px; height: 48px; object-fit: contain; }
    .insurer-name { font-size: 16px; font-weight: 600; }
    .insurer-detail { font-size: 12px; color: #666; margin-top: 2px; }
    .products-table { width: 100%; border-collapse: collapse; }
    .products-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .products-table td { padding: 12px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .products-table td:last-child { text-align: right; font-weight: 500; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #1D68FF; color: white; border-radius: 12px; margin-top: 20px; }
    .total-label { font-size: 16px; font-weight: 600; }
    .total-amount { font-size: 24px; font-weight: 700; }
    .total-period { font-size: 12px; opacity: 0.8; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Shory.</div>
    <div class="doc-type">
      <h2>Policy Summary</h2>
      <p>${policyNumber}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Insurer</div>
    <div class="insurer-row">
      <img src="${window.location.origin}${insurer.logo}" class="insurer-logo" alt="${insurer.name}" />
      <div>
        <div class="insurer-name">${insurer.name}</div>
        <div class="insurer-detail">${businessType.title} · ${emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Details</div>
    <div class="grid">
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
    <div class="grid">
      <div class="field">
        <div class="field-label">Full Name</div>
        <div class="field-value">${name || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${email || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${phone ? '+971 ' + phone : '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Emirate</div>
        <div class="field-value">${emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Business Details</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Business Name</div>
        <div class="field-value">${businessName || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Business Type</div>
        <div class="field-value">${businessType.title}</div>
      </div>
      <div class="field">
        <div class="field-label">License Number</div>
        <div class="field-value">${licenseNumber || '—'}</div>
      </div>
      <div class="field">
        <div class="field-label">Employees</div>
        <div class="field-value">${employees || '—'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Coverage</div>
    <table class="products-table">
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:right">Coverage Limit</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((p) => `<tr><td>${p.name}</td><td>AED ${p.limit}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="total-row">
      <div>
        <div class="total-label">Total Annual Premium</div>
        <div class="total-period">Incl. VAT · 12-month policy</div>
      </div>
      <div class="total-amount">AED ${formatPrice(total)}</div>
    </div>
  </div>

  <div class="footer">
    <p>This is a summary document generated by Shory Insurance Platform.</p>
    <p style="margin-top:4px">For questions, contact support@shory.ae · shory.ae</p>
  </div>
</body>
</html>`;

    // Render HTML in a hidden iframe, capture with html2canvas, save as PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '800px';
    iframe.style.height = '1200px';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) { setDownloading(false); return; }
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content + images to load
    await new Promise((r) => setTimeout(r, 800));

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
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Shory-Policy-${policyNumber}.pdf`);
    } finally {
      document.body.removeChild(iframe);
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProgressIndicator currentStep={6} label="Confirmed" />

      {/* Success hero */}
      <div className="max-w-3xl mx-auto px-4 w-full py-4">
        <div className="flex items-center gap-4">
          <div className="shrink-0" style={{background: 'transparent'}}>
            <LottieAnimation path="/lottie/confirm.lottie" className="w-24 h-24" loop={false} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              You&apos;re all set!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your policy is active and a confirmation has been sent to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-5">
        {/* Policy card */}
        <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Insurer header */}
          <div className="flex items-center gap-4 p-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 p-1">
              {insurer.logo ? (
                <img src={insurer.logo} alt={insurer.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-lg font-bold text-gray-500">{insurer.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{insurer.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{businessType.title} · {emirate}</p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-xs font-medium px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </div>

          <CardContent className="p-5 flex flex-col gap-5">
            {/* Policy details */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Policy</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label: 'Policy Number', value: policyNumber},
                  {label: 'Effective Date', value: formatDate(today)},
                  {label: 'Expiry Date', value: formatDate(expiryDate)},
                  {label: 'Risk Level', value: businessType.riskLevel.charAt(0).toUpperCase() + businessType.riskLevel.slice(1)},
                ].map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Policy holder */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Policy Holder</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label: 'Full Name', value: name},
                  {label: 'Email', value: email},
                  {label: 'Phone', value: phone ? `+971 ${phone}` : '—'},
                  {label: 'Emirate', value: emirate},
                ].filter((f) => f.value).map((f) => (
                  <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{f.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Business */}
            {(businessName || licenseNumber) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Business</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label: 'Business Name', value: businessName},
                    {label: 'Business Type', value: businessType.title},
                    {label: 'License Number', value: licenseNumber},
                    {label: 'Employees', value: employees},
                  ].filter((f) => f.value).map((f) => (
                    <div key={f.label} className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-gray-100" />

            {/* Coverage */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Coverage</p>
              <div className="flex flex-col gap-2.5">
                {productIds
                  .filter((id) => productsConfig[id])
                  .map((productId) => {
                    const product = productsConfig[productId];
                    const limit = limits[productId] ?? '1M';
                    const IconComponent = PRODUCT_ICONS[productId];
                    return (
                      <div key={productId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2.5">
                          {IconComponent ? (
                            <IconComponent className="w-5 h-5" />
                          ) : (
                            <span className="text-base">{product.icon}</span>
                          )}
                          <span className="text-sm text-gray-900">{product.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600 bg-gray-50 rounded-full px-3 py-1">
                          AED {limit}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between bg-primary rounded-xl px-5 py-4 -mx-1">
              <div>
                <p className="text-sm font-semibold text-white">Total Annual Premium</p>
                <p className="text-xs text-white/70 mt-0.5">Incl. VAT · 12-month policy</p>
              </div>
              <p className="text-2xl font-bold text-white">
                AED {formatPrice(total)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/40 disabled:opacity-50 disabled:cursor-wait transition-all duration-200"
          >
            {downloading ? (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary animate-spin">
                  <path d="M9 1.5A7.5 7.5 0 1 0 16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                  <path d="M9 2.25v9m0 0L6 8.25m3 3 3-3M3 12.75v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/40 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
              <path d="M4.5 6.75V2.25h9v4.5M4.5 13.5H3a1.5 1.5 0 0 1-1.5-1.5V9A1.5 1.5 0 0 1 3 7.5h12A1.5 1.5 0 0 1 16.5 9v3a1.5 1.5 0 0 1-1.5 1.5h-1.5m-9 0h9v3h-9v-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Print
          </button>
        </div>

        {/* Start over */}
        <Link
          href="/quote/start"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Start a new quote
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
