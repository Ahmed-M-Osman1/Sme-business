'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';

export interface PolicyPdfData {
  policyNumber: string;
  insurerId: string;
  insurerName: string;
  insurerLogo?: string;
  typeId: string;
  businessTypeName: string;
  businessName: string;
  licenseNumber: string;
  emirate: string;
  name: string;
  email: string;
  phone: string;
  employees: string;
  products: Array<{name: string; limit: string}>;
  total: number;
  startDate: Date;
  endDate: Date;
}

/** Wait for iframe content to render before capturing to canvas. */
const IFRAME_RENDER_DELAY_MS = 800;

export function usePolicyPdf(data: PolicyPdfData) {
  const {t} = useI18n();
  const [downloadingCert, setDowningCert] = useState(false);
  const [downloadingInvoice, setDowningInvoice] = useState(false);

  function formatDate(d: Date) {
    return d.toLocaleDateString('en-AE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function formatPrice(num: number) {
    return num.toLocaleString('en-AE', {maximumFractionDigits: 0});
  }

  async function generatePdf(docType: 'certificate' | 'invoice') {
    const isInvoice = docType === 'invoice';
    const setter = isInvoice ? setDowningInvoice : setDowningCert;
    setter(true);

    const monthlyPrice = Math.round(data.total / 12);
    const monthlyTaxAmount = Math.round(monthlyPrice * 0.05);
    const monthlySubtotal = monthlyPrice - monthlyTaxAmount;

    const html = isInvoice
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shory Invoice - ${data.policyNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; padding: 48px; max-width: 900px; margin: 0 auto; background: white; }
    .header { display: flex; justify-content: space-between; margin-bottom: 48px; }
    .logo { font-size: 28px; font-weight: 900; font-style: italic; color: #1D68FF; }
    .invoice-info { text-align: right; }
    .invoice-info h1 { font-size: 32px; color: #1a1a1a; margin-bottom: 8px; }
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
    .payment-section { background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 40px; }
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
      <p><strong>Invoice #:</strong> ${data.policyNumber}</p>
      <p><strong>Date:</strong> ${formatDate(data.startDate)}</p>
      <p><strong>Due Date:</strong> ${formatDate(new Date(data.startDate.getTime() + 30 * 24 * 60 * 60 * 1000))}</p>
    </div>
  </div>

  <div class="addresses">
    <div class="address-block">
      <h3>Bill To</h3>
      <p><strong>${data.businessName || data.name}</strong></p>
      <p>${data.businessTypeName}</p>
      <p>License: ${data.licenseNumber || 'N/A'}</p>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phone ? '+971 ' + data.phone : 'N/A'}</p>
      <p>Emirate: ${data.emirate}</p>
    </div>
    <div class="address-block">
      <h3>From</h3>
      <p><strong>Shory Insurance Platform</strong></p>
      ${data.insurerLogo ? `<p><img src="${window.location.origin}${data.insurerLogo}" style="height: 32px; margin: 8px 0;" alt="${data.insurerName}" /></p>` : ''}
      <p><strong>${data.insurerName}</strong></p>
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
      ${data.products.map((p) => `<tr><td class="product">${p.name}</td><td class="limit">AED ${p.limit}</td><td class="price">AED ${formatPrice(Math.round(monthlyPrice / data.products.length))}</td></tr>`).join('')}
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
    <p><strong>Annual Total:</strong> AED ${formatPrice(data.total)}</p>
    <p><strong>Policy Period:</strong> 12 months</p>
    <p><strong>Payment Method:</strong> Monthly installments available through our payment partner</p>
    <p style="margin-top: 12px; font-style: italic; color: #999;">Thank you for choosing Shory for your insurance needs!</p>
  </div>

  <div class="footer">
    <p>This invoice was generated by Shory Insurance Platform on ${formatDate(data.startDate)}</p>
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
  <title>Shory Policy Certificate - ${data.policyNumber}</title>
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
      <p>Policy #: ${data.policyNumber}</p>
      <p>Issued: ${formatDate(data.startDate)}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Insurer Information</div>
    <div class="insurer-block">
      ${data.insurerLogo ? `<img src="${window.location.origin}${data.insurerLogo}" class="insurer-logo" alt="${data.insurerName}" />` : ''}
      <div class="insurer-info">
        <div class="insurer-name">${data.insurerName}</div>
        <div class="insurer-detail">${data.businessTypeName} · ${data.emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Details</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Policy Number</div>
        <div class="field-value">${data.policyNumber}</div>
      </div>
      <div class="field">
        <div class="field-label">Status</div>
        <div class="field-value">Active</div>
      </div>
      <div class="field">
        <div class="field-label">Effective Date</div>
        <div class="field-value">${formatDate(data.startDate)}</div>
      </div>
      <div class="field">
        <div class="field-label">Expiry Date</div>
        <div class="field-value">${formatDate(data.endDate)}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Policy Holder</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Full Name</div>
        <div class="field-value">${data.name}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${data.email}</div>
      </div>
      <div class="field">
        <div class="field-label">Phone</div>
        <div class="field-value">${data.phone ? '+971 ' + data.phone : 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Emirate</div>
        <div class="field-value">${data.emirate}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Business Details</div>
    <div class="section-content">
      <div class="field">
        <div class="field-label">Business Name</div>
        <div class="field-value">${data.businessName}</div>
      </div>
      <div class="field">
        <div class="field-label">Business Type</div>
        <div class="field-value">${data.businessTypeName}</div>
      </div>
      <div class="field">
        <div class="field-label">License Number</div>
        <div class="field-value">${data.licenseNumber}</div>
      </div>
      <div class="field">
        <div class="field-label">Employees</div>
        <div class="field-value">${data.employees}</div>
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
        ${data.products.map((p) => `<tr><td>${p.name}</td><td>AED ${p.limit}</td></tr>`).join('')}
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
    <p><strong>Total Annual Premium: AED ${formatPrice(data.total)} (incl. 5% VAT)</strong></p>
    <p>Monthly Payment Option: AED ${formatPrice(Math.round(data.total / 12))} per month via FINWALL</p>
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
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const prefix = isInvoice ? 'Shory-Invoice' : 'Shory-Policy';
      pdf.save(`${prefix}-${data.policyNumber}.pdf`);
    } finally {
      document.body.removeChild(iframe);
      setter(false);
    }
  }

  return {
    downloadCert: () => generatePdf('certificate'),
    downloadInvoice: () => generatePdf('invoice'),
    downloadingCert,
    downloadingInvoice,
  };
}
