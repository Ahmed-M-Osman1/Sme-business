TAMM Business Insurance — UX Dev Notes
Reviewed: 29 April 2026
URL: https://sme-business-web.vercel.app/tamm
Flow tested: Business Insurance service card → UAE PASS login → Quote → Checkout

Bugs
BUG-01 · Ghost button on homepage CTA banner [P0]
Location: /tamm — "Protect Your Business Today" section
Description: A second button renders next to "Start your Journey" with no label or text. It has outline button styling but is completely empty.
Expected: Either remove the button or add a label (e.g. "Learn More" or "View Plans").

BUG-02 · Business type mismatch after UAE PASS selection [P0]
Location: /tamm/quote/results (authenticated flow)
Description: When a user selects a UAE PASS-linked business (Al Rashidi Tech Hub, type: IT/Technology), the results page header and URL param switch to general-trading. The wrong covers are then recommended and priced (Workers + Public Liability + Property instead of Workers + Professional Indemnity).
Steps to reproduce:

1. Login via UAE PASS
2. Select a business with type IT/Technology
3. Click "Get quotes for [business]"
4. Observe results page header and URL — type=general-trading

Expected: Business type should carry through from the UAE PASS business record.
Impact: User is quoted and potentially sold the wrong insurance product.

BUG-03 · Duplicate cover line items on quote cards [P1]
Location: /tamm/quote/results
Description: Each quote card renders the cover list twice. e.g. a card shows:

- Workers Compensation Required
- Professional Indemnity
- Workers Compensation
- Professional Indemnity

Expected: Each cover should appear once.
Likely cause: Rendering loop iterating over covers array twice.

BUG-04 · Contact details not populated from UAE PASS session [P1]
Location: /tamm/quote/checkout — "Your Contact Details" section
Description: Full Name, Email Address, and Phone Number fields show placeholder data ("James Hill", "james.hill@gmail.com") instead of the authenticated user's profile from UAE PASS.
Expected: Fields should pre-fill from the UAE PASS session token at point of login.

UX Issues
UX-01 · Insurance CTA buried below the fold [P1]
Location: /tamm homepage
Description: The "Protect Your Business Today" insurance CTA sits below three generic Abu Dhabi business setup info cards. A user arriving to get insurance has to scroll past irrelevant content to find the entry point.
Recommendation: Either surface a dedicated insurance entry point at the top of the page, or create a focused route (e.g. /tamm/insurance) with an insurance-specific landing page.

UX-02 · Two entry points, inconsistent auth behaviour [P1]
Location: /tamm
Description: "Start your Journey" CTA drops users into the quote flow with no authentication. The Business Insurance service card requires UAE PASS login first. This creates two divergent experiences — anonymous users miss the business pre-selection and trade license auto-fill entirely.
Recommendation: Gate the quote flow with UAE PASS login from both entry points so all users get the pre-filled experience.

UX-03 · Confirmation checkbox not enforced before payment CTA [P1]
Location: /tamm/quote/checkout
Description: The declaration checkbox ("I confirm the information provided is accurate and complete. False or misleading information may void my policy.") is not enforced — the "Pay with Apple Pay" CTA is active regardless of whether it's ticked.
Recommendation: Disable the payment CTA until the checkbox is checked. Relevant for compliance.

UX-04 · "Required" label on quote cards is ambiguous [P2]
Location: /tamm/quote/results
Description: The label "Required" appears next to "Workers Compensation" on each quote card. It's unclear whether this means legally required, required to proceed, or required by the insurer.
Recommendation: Add a tooltip or replace with clearer language e.g. "Legally required in UAE".

UX-05 · Hero headline doesn't signal insurance [P2]
Location: /tamm homepage
Description: The page headline reads "Embark on a Successful Business Journey / A step-by-step guide on how to start a business in Abu Dhabi." This is generic TAMM content — a user arriving specifically for insurance won't immediately know they're in the right place.
Recommendation: Add insurance-specific signposting above the fold, or adjust the headline when the user navigates from an insurance context.

UX-06 · Monthly instalment total not confirmed at checkout [P2]
Location: /tamm/quote/checkout — payment method selector
Description: Monthly Instalments shows "AED 222/month × 12" but there's no line confirming this equals the annual total (AED 2,464). Small gap for trust/clarity.
Recommendation: Add a subtotal line: "Total AED 2,464 — same as annual price, 0% fee."

What's Working Well (for reference)

- UAE PASS business pre-selection is the standout feature — businesses load with employees, revenue, and location pre-populated
- Company details page auto-fills all fields from trade license (name, license no., business activity, location, expiry date) with a clear "From trade license ✓" label
- Abu Dhabi pre-selected as Emirate by default — smart TAMM-aware default
- Risk labels (Low / Medium / High) on business type cards are a useful trust signal
- Quick Overview panel after selecting a business type provides good contextual guidance
- Payment options are comprehensive: Apple Pay, Monthly Instalments (Finwall), Card, Bank Transfer
- SSL + PCI DSS + 3D Secure trust badges visible at checkout
- Step tracker (6 steps) is clean and non-intrusive
