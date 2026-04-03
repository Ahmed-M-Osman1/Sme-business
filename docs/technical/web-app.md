# Web App (`apps/web`)

Customer-facing SME insurance quote journey.

## Quote Flow

```
Homepage (/)
  ↓
Quote Start (/quote/start) — choose entry method
  ├── AI Advisor (/quote/ai-advisor) — conversational chatbot
  ├── Business Type (/quote/business-type) — pre-configured selection
  ├── Upload License (/quote/upload) — trade license OCR
  └── Manual Entry (/quote/manual) — step-by-step form
      ↓
Quote Results (/quote/results) — compare insurers
  ↓
Company Details (/quote/company-details) — trade license verification (mandatory)
  ↓
Checkout (/quote/checkout) — contact details + payment
  ↓
Confirmation (/quote/confirmation) — policy issued + PDF downloads
```

## Key Features

### Pricing Engine (`lib/pricing.ts`)
Client-side pricing with server-side verification at checkout.
- `price = basePrice × riskFactor × sizeFactor × coverageMultiplier × insurerMultiplier`
- Coverage limits: 1M (×1.0), 2M (×1.4), 5M (×2.0)
- Size factors: 1 employee (×1.0) to 100+ (×1.6)
- Add-on extras: fixed annual prices (AED 250-550)

### Quote Results Page
- Annual/Monthly toggle (monthly = annual × 1.08 ÷ 12)
- Mandatory covers: Workers Comp locked for >1 employees, Health Insurance in Dubai/Abu Dhabi
- Coverage limit pill buttons (1M/2M/5M) update all quotes live
- AI Insights panel with peer benchmarking and "+ Add" extras
- "Best for {category}" recommendation badge on first card
- Coverage gap warning when Workers Comp deselected
- Per-card "Select & Buy" for direct checkout
- Bundle deals with dynamic per-insurer pricing

### Confirmation Page
- PDF generation (jsPDF + html2canvas) for certificate and invoice
- WhatsApp sharing with pre-populated message
- 5-star feedback rating
- Referral program card
- "Value delivered" metrics (14 days saved, 8-12 calls avoided)

### Security
- Server-side price verification at checkout (recalculates from pricing engine, ignores URL total)
- Trade license verification is mandatory (skip button removed)
- Expired licenses block checkout progression
- Declaration checkbox required before payment

## i18n

Full English/Arabic bilingual support with RTL.
- Translation files: `lib/i18n/en.json`, `lib/i18n/ar.json`
- Context-based: `useI18n()` hook provides `{t, locale, toggleLocale}`
- Fonts: Bliss Pro (English), Ping ARLT (Arabic)

## Configuration Files

| File | Purpose |
|------|---------|
| `config/business-types.json` | 10 business types with risk levels |
| `config/products.json` | 5 insurance products with base prices |
| `config/insurers.json` | 12 insurers with multipliers and ratings |
| `config/bundle-deals.json` | 3 bundle packages |
| `config/quote-options.json` | Employee bands, revenue bands, emirates, assets |
| `config/recommendation-rules.json` | Product recommendation logic |
| `config/business-type-help.ts` | Contextual help per business type |
