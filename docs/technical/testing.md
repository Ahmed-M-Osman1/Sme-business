# Testing

## E2E Tests (Playwright)

Location: `apps/web/e2e/`

### Setup

```bash
cd apps/web/e2e
npm install
npx playwright install chromium
```

### Running Tests

```bash
# All tests (headless)
npx playwright test

# With browser visible
npx playwright test --headed

# Specific test file
npx playwright test tests/homepage.spec.js

# With Playwright UI
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Against production
BASE_URL=https://sme-business-web.vercel.app npx playwright test
```

### Test Coverage

65 tests across 11 scenarios:

| Scenario | File | Tests | Coverage |
|----------|------|-------|----------|
| SC-01: Homepage | `homepage.spec.js` | 5 | Hero, SME card, navigation, trust indicators |
| SC-02: Quote Start | `quoteStart.spec.js` | 6 | Step indicator, 4 method options |
| SC-03: AI Advisor | `aiAdvisorJourney.spec.js` | 4 | Chat, business type chips, conversation |
| SC-04: Business Type | `businessTypeJourney.spec.js` | 5 | Grid, featured types, detail panel |
| SC-05: Manual Form | `manualFormJourney.spec.js` | 10 | Classification, employee/revenue bands |
| SC-06: Upload License | `uploadLicenceJourney.spec.js` | 6 | Drop zone, file formats, alt paths |
| SC-07: Quote Results | `resultsPage.spec.js` | 7 | Loading, tabs, cards, filters, sorting |
| SC-08: Company Details | `companyDetails.spec.js` | 5 | Upload, manual entry, step indicator |
| SC-09: Checkout | `checkout.spec.js` | 7 | Order summary, contact form, payment |
| SC-10: Confirmation | `confirmation.spec.js` | 6 | Policy number, badge, downloads |
| SC-11: Full E2E | `e2eJourney.spec.js` | 4 | Cross-journey: all 4 entry paths |

### Page Object Model

Tests use POM pattern with page objects in `apps/web/e2e/pages/`:
- `BasePage.js` — shared navigation, header elements
- `HomePage.js`, `QuoteStartPage.js`, `AiAdvisorPage.js`, etc.

### Configuration

`apps/web/e2e/playwright.config.js`:
- Base URL: `process.env.BASE_URL` or `http://localhost:3000`
- Browser: Chromium (Desktop Chrome)
- Timeout: 60s per test
- Retries: 1 in CI, 0 locally
- Reports: HTML

## Type Checking

```bash
# All apps
cd apps/web && npx tsc --noEmit
cd apps/admin && npx tsc --noEmit
cd apps/backend && npx tsc --noEmit
```
