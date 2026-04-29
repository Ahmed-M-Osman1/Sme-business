TAMM — Trade Licence → Insurance Flow
Spec date: 29 April 2026
Prototype: tamm-prototype.html
Scope: New user journey triggered from the Apply for Trade Licence service card

Overview
When a user applies for or renews a trade licence through TAMM, we surface business insurance as a natural next step — reducing drop-off, leveraging verified licence data, and completing the coverage loop in a single session.

Services Page Change
Apply for a Trade Licence should be repositioned as the first and most prominent card in the Services grid.

- Add a "START HERE" label pill above the card
- Apply a teal border and tinted background to distinguish it from other service cards
- Other services (Trade Name Check, Business Insurance, Investor Compass) follow in natural order

Flow: Step by Step
Step 1 — UAE PASS Login (skip service detail page)
When the user clicks Apply for a Trade Licence, go directly to the UAE PASS login screen. Do not show the service detail page (the page with Required Documents / Cost / Steps) — that friction is unnecessary when entry is via the licence journey.

UAE PASS login screen:

- Emirates ID / email / phone input
- Remember me checkbox (default checked)
- Login CTA
- "Don't have a UAEPASS account?" and "Recover your account" links

Step 2 — Business Selection
After login, show the user's UAE PASS-linked businesses. Pull from the authenticated session.

Key requirement — Licence Expiring Soon tag:
If a business has a licence expiring within 60 days, display a warning tag:
⚠️ Licence Expiring in X Days (amber/orange, pill style)

Behaviour:

- Both businesses shown as selectable cards
- Cards display: business name, type, employees, revenue, location, licence status/expiry
- Button disabled until a business is selected
- On selection, button label updates to: Continue with [Business Name] →

Step 3 — Licence Application (single page)
A single-page pre-filled form. All fields sourced from the UAE PASS trade licence record — no manual entry required.

Fields (read-only, pre-filled):

- Company Name
- Licence Number
- Business Activity
- Location
- Current Expiry (shown in orange if expiring soon)
- Renewal Period (default: 1 Year, with new expiry calculated)

Fee summary block:

- Government Renewal Fee: AED 1,500 + VAT AED 75
- Label: "Paid via TAMM · No additional service charge"

Insurance nudge (informational, not blocking):

"Protect your renewed licence — Insurers require an active trade licence to issue a policy. Add business insurance now in under 3 minutes and your coverage will begin the same day your licence is renewed."

CTAs (two, side by side):

1. 🛡️ Continue to Insurance — primary teal, proceeds to quote flow
2. Skip Insurance → — ghost/secondary, completes licence renewal only

Step 4 — Quote List (Shory Flow)
Goes straight to the quote results — no additional business type selection needed (already known from UAE PASS record).

Two-panel layout:

Left panel — Customisation:

- Business context bar (name, type, employee count, location, current price)
- Included Covers — toggleable pill buttons:
- Workers Compensation REQ (orange, always on — cannot be deselected)
- Public Liability (amber, toggleable)
- Property Insurance (blue, toggleable)
- Professional Indemnity (purple, off by default)
- Coverage Limits — per active cover, 1M / 2M / 5M selector buttons (default: 1M)

Right panel — Quotes:

- Filter bar: All Filters, Shariah Compliant toggle, Sort (Price low→high / Rating), Compare Quotes
- Annual / Monthly toggle
- Quote count (e.g. "12 of 12 Quotes")

Shory AI Insights panel (collapsible, starts expanded):

- Insight callout (business-type specific, e.g. for F&B: "Kitchen fires and slip injuries are the top two claim drivers…")
- Stat line (e.g. "1 in 4 UAE restaurants makes a liability claim within 3 years")
- What Similar Businesses Add — 3 recommended add-ons with:
- Cover name + adoption % (e.g. Business Interruption 81%)
- Horizontal progress bar
- One-line reason
- - Add button

Quote cards (vertical list):

- Insurer logo, name, cover tags, badges (BEST, Shariah Compliant)
- Annual price + monthly equivalent
- Cover line items (with REQUIRED label on Workers Comp)
- Select Quote CTA per card

Step 5 — Quote Detail
Expanded view for the selected quote. Full-width, centred layout.

Content:

- "Best for [Business Type]" badge + Shariah-compliant badge (where applicable)
- Insurer name, logo, cover summary, star rating + review count
- Annual price (large)
- What's Included breakdown table:
- Cover name + REQUIRED label (where applicable)
- Coverage limit (AED 1,000,000)
- Individual price per cover
- Total line
- Monthly payments note: "Monthly payments powered by FINWALL · or AED X/month (0% instalment fee)"
- Proceed with this Quote → primary CTA
- ← Choose a different quote back link

Step 6 — Review & Pay (combined)
Single page combining company details, order summary, contact details, and payment. No separate "Company Details" screen.

Section 1 — Company Details (read-only, pre-filled, labelled "From trade licence ✓")

- Company Name, Licence Number, Business Activity, Location, Expiry Date
- All fields shown with a blue dot indicator (confirming data source)

Section 2 — Order Summary

- Insurer name + business type + location
- "✓ [Business Name] verified" confirmation row
- Cover lines with limit values
- Total Premium (large, teal)
- Monthly alternative + Finwall note

Section 3 — Contact Details (pre-filled from UAE PASS, fully editable)

- Full Name
- Email Address
- Phone Number (country prefix pre-set to 🇦🇪 +971)

Section 4 — Declaration

- Checkbox: "I confirm the information provided is accurate and complete. False or misleading information may void my policy."
- Pay button must remain disabled until this checkbox is ticked

Section 5 — Payment Methods

- Apple Pay (default selected)
- Monthly Instalments (AED X/month × 12, powered by Finwall)
- Card Payment (Visa · Mastercard · Amex · 3D Secure)
- Bank Transfer

Sticky bottom bar:

- Selected payment method + billing period label
- Total price
- Pay with [Method] — AED X/yr CTA (disabled until declaration checked)
- Trust badges: 🔒 SSL · 🛡️ PCI DSS · 🔐 3D Secure

Step 7 — Success
Full-page confirmation with teal background gradient.

Content:

- Large ✓ tick icon (teal circle)
- "Insurance Confirmed! 🎉"
- "Policy documents will be sent to [email]"
- Policy Summary card:
- Insurer, Policy Number, Policy Holder, Covers, Premium, Policy Start, Policy End
- Two CTAs:

1. 📋 Return to Complete Business Registration → (primary, teal) — redirects user back into the licence renewal completion flow
2. 📄 View Policy Documents (secondary outline)

Data & Integration Notes
Data point Source
Business name, licence no., activity, location, expiry UAE PASS authenticated session
Employee count, revenue band UAE PASS / ADDED business record
Contact name, email, phone UAE PASS profile
Quote pricing Shory API
Instalment payments Finwall integration
Policy issuance Insurer API via Shory

Key principle: If the user is authenticated via UAE PASS, no field on the Company Details section or Contact Details section should require manual entry. All fields should be pre-populated, with the user able to override contact details only.

What to Skip vs Keep from the Existing Flow
Element Decision
Service detail page (Required Docs / Cost / Steps) ❌ Skip for Trade Licence entry point
UAE PASS login ✅ Required, shown immediately
Business type selection screen ❌ Skip — type known from licence record
Quote flow (Shory two-panel) ✅ Keep
Separate Company Details screen ❌ Merge into Review & Pay
Anonymous quote path ⚠️ Keep for direct insurance entry, but gate with login before checkout
