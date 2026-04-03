# USER STORIES

**Shory SME Insurance Platform**  
**Complete Feature Specification**

Version: 2.0 — April 2026  
Product Owner: Head of Retail Products

---

## EPIC 1: LANDING & ENTRY

### US-001: Start Quote Journey

**As an** SME owner  
**I want to** start an insurance quote quickly  
**So that** I can get coverage without friction

**Acceptance Criteria:**
- Landing page displays clear value proposition: "Get SME Insurance in Minutes"
- Primary CTA "Start Quote" is visible above the fold
- Language switcher (English ⇄ Arabic) available on landing page
- Clicking CTA takes user to entry path selection
- Page loads in < 2 seconds
- Mobile-optimized: Full functionality on all screen sizes

**Priority:** Must Have

---

### US-002: Select Entry Path

**As an** SME owner  
**I want to** choose how I provide my business information  
**So that** I can use the method that's fastest for me

**Acceptance Criteria:**
- Four entry paths presented: Quick Select, OCR Upload, AI Advisor, Manual Form
- Each path shows estimated completion time (30s, 45s, 90s, 3min)
- Visual cards with clear descriptions
- User can switch between paths without losing progress

**Priority:** Must Have

---

## EPIC 2: QUICK SELECT PATH

### US-003: Select Preconfigured Business Type

**As an** SME owner  
**I want to** select my business type from common categories  
**So that** I get instant coverage recommendations without filling forms

**Acceptance Criteria:**
- 8 business types displayed: Retail/Trading, F&B, Professional Services, Construction, Logistics, Real Estate, Healthcare, Business Consultancy
- Visual cards with industry icons
- Hover shows coverage preview (products included)
- "Not listed" option redirects to manual form
- Selection triggers auto-fill of coverage recommendations

**Priority:** Must Have

---

### US-004: Enter Basic Business Info (Quick Select)

**As an** SME owner  
**I want to** provide minimal information  
**So that** I can get quotes in under 30 seconds

**Acceptance Criteria:**
- Only 2 inputs required: Number of employees, Emirate
- Employee count: Numeric input with validation (1-250)
- Emirate: Dropdown with 7 emirates
- Coverage triggers auto-filled based on business type
- User proceeds to confirmation screen

**Priority:** Must Have

---

## EPIC 3: OCR TRADE LICENSE PATH

### US-005: Upload Trade License Document

**As an** SME owner  
**I want to** upload my trade license  
**So that** my business details are extracted automatically

**Acceptance Criteria:**
- Drag-and-drop file upload area
- Supported formats: PDF, JPG, PNG (max 10MB)
- Visual feedback during upload (progress bar)
- Upload button as alternative to drag-and-drop
- Error message if unsupported file type or size exceeded

**Priority:** Must Have

---

### US-006: Extract Data from Trade License (OCR)

**As a** system  
**I want to** extract structured data from trade licenses  
**So that** users don't have to manually enter their business information

**Acceptance Criteria:**
- 12 fields extracted: Business name, License number, Owner name, Trade activities, Issue/expiry dates, Issuing authority, Emirate, Legal form, Capital, Address, PO Box, License type
- Processing completes in < 5 seconds
- Confidence scoring per field (High/Medium/Low badges)
- UAE authenticity verification (cross-reference issuing authorities)
- Validity status calculation (expiry date check with visual alerts)
- Intelligent product mapping (trade activities → insurance recommendations)
- Fallback: Manual entry if OCR confidence < 70%

**Priority:** Must Have

---

### US-007: Review and Edit Extracted Data

**As an** SME owner  
**I want to** review and edit OCR-extracted data  
**So that** I can correct any errors before proceeding

**Acceptance Criteria:**
- Extracted data displayed in editable form
- Confidence badges visible per field (High/Medium/Low)
- Red badge "Trade license read with vision AI" + expiry date
- All fields are editable
- Field-level validation (license number format, date ranges)
- "Looks good" button proceeds to confirmation screen

**Priority:** Must Have

---

## EPIC 4: AI ADVISOR CHAT PATH

### US-008: Start AI Conversation

**As an** SME owner  
**I want to** describe my business in natural language  
**So that** I can get personalized insurance advice without knowing insurance terminology

**Acceptance Criteria:**
- Opening message: "Hi! I'm Shory's smart insurance advisor. Tell me about your business..."
- Text input field with placeholder: "e.g., I run a coffee shop in Dubai with 8 staff"
- Send button enabled when text entered
- Bilingual support: Detects Arabic vs. English automatically
- Khaleeji dialect for Arabic responses (warm, relatable tone)

**Priority:** Must Have

---

### US-009: Conversational Profile Building

**As an** AI advisor  
**I want to** ask ONE clarifying question at a time  
**So that** I don't overwhelm the user

**Acceptance Criteria:**
- AI infers business type, size, coverage needs from user's description
- If information incomplete, AI asks ONE follow-up question
- Streaming responses (word-by-word display)
- Typing indicator shown while AI processes
- Context retained across conversation (user can reference earlier messages)
- Forced fallback after 3 exchanges if profile still incomplete

**Priority:** Must Have

---

### US-010: Extract Structured Profile from Chat

**As a** system  
**I want to** extract structured business profile from chat conversation  
**So that** I can generate accurate insurance quotes

**Acceptance Criteria:**
- AI outputs JSON prefixed with PROFILE: signal
- Parser extracts valid JSON using brace-depth tracking
- Required fields: Business type, Employees, Emirate, Customer interaction, Advisory services
- Validation: Ensure all mandatory fields present
- If incomplete after 3 exchanges, redirect to manual form with partial data pre-filled

**Priority:** Must Have

---

### US-011: Handoff to Human Agent

**As an** SME owner  
**I want to** speak to a human specialist if needed  
**So that** I can get personalized advice beyond AI capability

**Acceptance Criteria:**
- "Want to speak to a specialist?" prompt shown during chat
- WhatsApp link with pre-populated message
- Opens WhatsApp Web or app
- Chat progress preserved if user returns

**Priority:** Should Have

---

## EPIC 5: MANUAL FORM PATH

### US-012: Progressive Form Entry

**As an** SME owner  
**I want to** fill a guided form step-by-step  
**So that** I'm not overwhelmed by too many fields at once

**Acceptance Criteria:**
- Questions split across screens (max 2 per screen)
- Total steps ≤ 5
- Progress indicator visible (current step / total steps)
- Back button (edit previous answers without data loss)
- Auto-save to session storage (recover if browser closes)

**Priority:** Must Have

---

### US-013: AI-Assisted Classification

**As an** SME owner  
**I want** AI to classify my business activity from free text  
**So that** I don't have to search through dropdown options

**Acceptance Criteria:**
- "✨ Classify with AI" button next to business activity field
- User enters free text description (e.g., "We sell shoes online")
- AI classifies to structured activity code (e.g., "Retail Trade - Footwear")
- Uses Haiku model for speed (< 3 seconds)
- User can edit AI classification if incorrect

**Priority:** Should Have

---

### US-014: Smart Field Validation

**As a** system  
**I want to** validate user inputs  
**So that** recommendations are accurate

**Acceptance Criteria:**
- Mandatory fields cannot be skipped (Next button disabled)
- Dropdowns used instead of free text where possible
- Error messages shown clearly inline (red text below field)
- Employee count: 1-250 numeric range
- Emirate: Dropdown validation

**Priority:** Must Have

---

## EPIC 6: CONFIRMATION & COVERAGE PROFILE

### US-015: Review Coverage Triggers

**As an** SME owner  
**I want to** confirm coverage triggers before getting quotes  
**So that** I'm confident my coverage matches my business needs

**Acceptance Criteria:**
- Coverage triggers displayed with Yes/No visual status
- Triggers: Customer visits, Professional advice, Physical assets, Commercial vehicles
- Each trigger shows linked insurance product (e.g., Customer visits → Public Liability)
- Workers Compensation mandatory callout with legal reference
- OCR badge shown if user entered via OCR path
- User can toggle any trigger (updates recommendations in real-time)

**Priority:** Must Have

---

### US-016: Declare Information Accuracy

**As a** system  
**I want** users to confirm their information is accurate  
**So that** policy validity is protected

**Acceptance Criteria:**
- Declaration checkbox: "I confirm information is accurate. False information may void my policy."
- Checkbox must be ticked to proceed (CTA disabled until checked)
- CTA: "Confirm & Get Quotes →" (prominent, blue)

**Priority:** Must Have

---

## EPIC 7: QUOTE RESULTS & COMPARISON

### US-017: Generate Real-Time Multi-Insurer Quotes

**As an** SME owner  
**I want to** see quotes from multiple insurers  
**So that** I can compare prices and choose the best value

**Acceptance Criteria:**
- Loading animation: "Finding best prices..." + "Comparing 6 UAE insurers"
- Quotes generated for 6 insurers: GIG Gulf, Orient, Liva, Sukoon, Salama, Watania Takaful
- Based on confirmed coverage profile + employee count + business type
- Quotes displayed in < 3 seconds
- Pricing formula: Base Price × Industry Risk × Size Factor

**Priority:** Must Have

---

### US-018: Display Quote Cards

**As an** SME owner  
**I want to** see quote details clearly  
**So that** I can make an informed decision

**Acceptance Criteria:**
- Each quote card shows: Insurer logo, Products included, Annual premium, Monthly premium, Badges (Lowest Price, Shariah Compliant)
- Toggle: Annual ⇄ Monthly payment (updates price instantly)
- "Save 8%" badge on annual premium
- Expandable sections: Coverage (limits), Excess (deductibles), Claims (process)
- CTAs: "Select & Buy →" or "✓ Selected" state
- "✏️" Customize button (adjust coverage limits)

**Priority:** Must Have

---

### US-019: Customize Coverage Limits

**As an** SME owner  
**I want to** adjust coverage limits  
**So that** I can tailor my protection level

**Acceptance Criteria:**
- "✏️" button opens customization modal
- Dropdowns per product: Public Liability (500K/1M/2M/5M), Professional Indemnity (250K/500K/1M/2M)
- Price updates in real-time as limits change
- "Apply Changes" button refreshes quote card with new premium

**Priority:** Should Have

---

### US-020: Compare Bundle Deals

**As an** SME owner  
**I want to** see multi-product bundles  
**So that** I can save money by bundling coverage

**Acceptance Criteria:**
- "Bundle Deals" tab next to "Individual Quotes"
- Bundle cards show: Combined products, Total price, Savings vs. individual (💰 indicator)
- Example: "Workers Comp + Public Liability + Property — Save AED 450"

**Priority:** Should Have

---

## EPIC 8: VERIFICATION & LOCATION

### US-021: Verify Emirates ID

**As an** SME owner  
**I want to** verify my identity via Emirates ID  
**So that** my policy is issued to the correct person

**Acceptance Criteria:**
- Emirates ID field: 15 digits, must start with 784
- Visual hint: "784-XXXX-XXXXXXX-X"
- Date of birth field: Auto-filled from Emirates ID (checkmark badge)
- Age validation: Error if under 16, Warning if over 100
- "Verify via Government Sources →" button
- Loading state: "Verifying…" (2-3 seconds)
- Success: "Identity Verified" + Display Name, Nationality, ID Expiry, DOB
- Trust indicators: "Secure verification via UAE government sources"

**Priority:** Must Have

---

### US-022: Capture Business Location

**As an** SME owner  
**I want to** specify my business location on a map  
**So that** my policy reflects the correct address

**Acceptance Criteria:**
- Interactive map (OpenStreetMap + Leaflet.js)
- Search bar: "Search for your area..." with autocomplete
- Draggable pin (red marker)
- Auto-zoom to emirate if extracted from trade license
- Current location button (if geolocation available)
- Confirmation badge: "✓ Location Confirmed"
- Cannot proceed without location selection

**Priority:** Must Have

---

## EPIC 9: CHECKOUT & PAYMENT

### US-023: Prefilled Checkout Details

**As an** SME owner  
**I want** my details pre-filled at checkout  
**So that** I don't have to re-enter information

**Acceptance Criteria:**
- Business name: Pre-filled (read-only)
- Full name: From Emirates ID verification (editable)
- Email: Required, format validation
- UAE phone: Required, +971 prefix, auto-format as user types

**Priority:** Must Have

---

### US-024: Modern Payment Options

**As an** SME owner  
**I want** multiple payment methods  
**So that** I can pay using my preferred method

**Acceptance Criteria:**
- Apple Pay button (styled per Apple guidelines, shows only if device supports)
- Google Pay button (styled per Google guidelines, shows only if device supports)
- Card payment option (expands form)
- Card form: Card number, Expiry, CVV, Name on card
- Card type auto-detected (Visa, Mastercard, Amex icons)
- Security badge: "🔒 Secure payment processing"

**Priority:** Must Have

---

### US-025: Complete Payment & Issue Policy

**As an** SME owner  
**I want** instant policy issuance after payment  
**So that** I'm covered immediately

**Acceptance Criteria:**
- "Pay AED [amount] →" button (amount updates if annual/monthly toggled)
- Loading state: "Securing your policy..." with spinner
- Payment completes in < 5 seconds
- Policy reference generated: SHR-2026-XXXXX
- Transition to confirmation screen

**Priority:** Must Have

---

## EPIC 10: CONFIRMATION & POST-PURCHASE

### US-026: Display Policy Confirmation

**As an** SME owner  
**I want to** see confirmation that I'm insured  
**So that** I feel confident my coverage is active

**Acceptance Criteria:**
- Large green checkmark icon (animated entrance)
- Headline: "You're Insured! 🎉"
- Policy reference number displayed
- Sub-text: "Policy documents sent to your email"
- Policy summary card: Insurer, Products, Limits, Premium, Effective/Expiry dates

**Priority:** Must Have

---

### US-027: Share Policy via WhatsApp

**As an** SME owner  
**I want to** share my policy details  
**So that** I can inform my partners/employees

**Acceptance Criteria:**
- "💬 Share via WhatsApp" button
- Pre-populated message: "I just got insured with Shory in under 3 minutes! Try it: [link]"
- Opens WhatsApp Web or mobile app
- Referral tracking (unique code generated)

**Priority:** Should Have

---

### US-028: Provide Feedback

**As an** SME owner  
**I want to** rate my experience  
**So that** Shory can improve their service

**Acceptance Criteria:**
- Prompt: "How was your experience?"
- Star rating (1-5, tap to select)
- Optional comment field (textarea)
- "Submit →" button
- Thank you message after submission
- Feedback stored for NPS calculation

**Priority:** Should Have

---

### US-029: Referral Program

**As an** SME owner  
**I want to** refer other business owners  
**So that** we both get a discount

**Acceptance Criteria:**
- Referral card: "🎁 Refer a Business Owner"
- "You both get AED 200 off renewal"
- Share link button → generates unique referral code
- Referral tracking in database (for future discount application)

**Priority:** Should Have

---

## EPIC 11: CUSTOMER DASHBOARD - POLICIES

### US-030: View Active Policies

**As an** SME owner  
**I want to** see all my active policies  
**So that** I can manage my coverage

**Acceptance Criteria:**
- Grid layout of policy cards (responsive)
- Each card shows: Insurer logo, Policy ref, Products covered, Premium, Status badge ("Active"), Renewal date
- Countdown if renewal < 60 days
- "View Details" button → Full policy breakdown modal
- "Download PDF" button → Policy document
- Empty state: "No active policies" + "Get New Quote" CTA

**Priority:** Must Have

---

### US-031: View Policy Details

**As an** SME owner  
**I want to** see comprehensive policy information  
**So that** I understand my coverage fully

**Acceptance Criteria:**
- Modal triggered by "View Details" button
- Coverage details: Limits, Terms, Conditions per product
- Claim process instructions
- Insurer contact details
- Policy schedule (list of covered items/employees)
- "Download PDF" and "File a Claim" buttons

**Priority:** Must Have

---

### US-032: Quick Actions from Dashboard

**As an** SME owner  
**I want** quick access to common actions  
**So that** I can manage my insurance efficiently

**Acceptance Criteria:**
- "File a Claim" button (prominent, orange)
- "Get New Quote →" button (blue)
- "Manage Auto-Renewal" toggle

**Priority:** Must Have

---

## EPIC 12: CUSTOMER DASHBOARD - RENEWALS

### US-033: View Upcoming Renewals

**As an** SME owner  
**I want to** see policies renewing soon  
**So that** I can renew before they lapse

**Acceptance Criteria:**
- Policies renewing within 90 days displayed
- Countdown indicator: "Renews in 45 days"
- Renewal quote card: Current premium vs. renewal quote, Price change (+/- %), Explanation if increased
- Actions: "Renew Now", "Get New Quotes", "Adjust Coverage"

**Priority:** Must Have

---

### US-034: Enable Auto-Renewal

**As an** SME owner  
**I want to** set up auto-renewal  
**So that** my policy renews automatically

**Acceptance Criteria:**
- Toggle: Enable/Disable auto-renewal
- If enabled: Payment method on file required, Notification settings (email/SMS before auto-charge)
- If disabled: Manual renewal reminders sent at -60, -30, -14, -7 days

**Priority:** Should Have

---

### US-035: View Renewal History

**As an** SME owner  
**I want to** see past renewals  
**So that** I can track my insurance history

**Acceptance Criteria:**
- Collapsible list of past renewals
- Shows: Date, Premium, Insurer, Status (Renewed/Lapsed)

**Priority:** Could Have

---

## EPIC 13: CUSTOMER DASHBOARD - CLAIMS

### US-036: File New Claim

**As an** SME owner  
**I want to** file a claim directly  
**So that** I can get compensation quickly

**Acceptance Criteria:**
- Policy selection dropdown (active policies only)
- Incident date (date picker, cannot be future)
- Incident type (dropdown based on policy products)
- Description (textarea, min 50 characters)
- Supporting documents upload: Photos, Invoices, Police reports, Medical reports (multi-file, drag-and-drop)
- Estimated claim amount (optional, numeric)
- "Submit Claim" button → Sends to insurer API

**Priority:** Must Have

---

### US-037: Track Claim Status

**As an** SME owner  
**I want to** see my claim's progress  
**So that** I know when to expect settlement

**Acceptance Criteria:**
- Claims list (most recent first)
- Each claim shows: Claim ref (CLM-2026-XXXXX), Policy ref, Incident date, Status badge
- Status stages: Submitted (blue), In Review (amber), Approved (green), Paid (green), Declined (red)
- Estimated settlement amount (if approved)
- Adjuster contact info (name, email, phone)
- Last update timestamp
- "View Details" button → Claim detail page

**Priority:** Must Have

---

### US-038: View Claim Details

**As an** SME owner  
**I want to** see full claim information  
**So that** I can follow up if needed

**Acceptance Criteria:**
- Incident details
- Uploaded documents (viewable/downloadable)
- Status timeline (visual progress bar with timestamps)
- Adjuster notes (if any)
- Settlement breakdown (if approved)
- "Contact Adjuster" button → Email/phone options
- "Add Documents" button → Upload additional supporting docs

**Priority:** Must Have

---

## EPIC 14: ADMIN PORTAL - PLATFORM HEALTH

### US-039: Monitor Service Uptime

**As an** operations team member  
**I want to** see real-time service status  
**So that** I can detect issues quickly

**Acceptance Criteria:**
- 13 services monitored: 5 Core, 1 AI, 1 Infra, 6 Insurer APIs
- Per service: Uptime (24h %), Latency (P50, P99), Error Rate (%), Request Volume (24h), Status badge (🟢 Operational / 🟡 Degraded / 🔴 Outage)
- Color-coded status dots with pulse animation for degraded/outage
- Grid layout (responsive)

**Priority:** Must Have

---

### US-040: View Active Incidents

**As an** operations team member  
**I want to** see active platform incidents  
**So that** I can coordinate response

**Acceptance Criteria:**
- Red banner at top for critical incidents
- Each incident shows: Severity (Critical/High/Medium/Low), Service affected, Description, Impact (business metrics), Started timestamp, Status (Active/Investigating/Resolved)
- "Declare Incident" button → Opens incident creation form
- Resolved incidents: Collapsible history

**Priority:** Must Have

---

## EPIC 15: ADMIN PORTAL - USER BEHAVIOR

### US-041: View Conversion Funnel

**As an** operations team member  
**I want to** see conversion funnel metrics  
**So that** I can identify drop-off points

**Acceptance Criteria:**
- 8 stages: Landing, Start Quote, Business Details, Product Selection, Insurer Comparison, Checkout, Payment, Policy Issued
- Horizontal bar chart (bar width = session count)
- Drop-off % displayed between stages
- Trend indicator: +/- % vs. previous 7-day average
- Anomaly flag: Red icon if drop-off exceeds 2 standard deviations

**Priority:** Must Have

---

### US-042: View Behavior Metrics

**As an** operations team member  
**I want to** see key behavior metrics  
**So that** I can assess platform performance

**Acceptance Criteria:**
- 8 metric cards: Active Sessions, Quotes Started (24h), Policies Issued (24h), Checkout Drop-off, Payment Failures, Avg Session Duration, OCR Upload Success, AI Advisor Used
- Each card shows: Value, Trend (+/- %), Trend direction indicator (↑ ↓)
- Color-coded: Green for positive trends, Red for negative

**Priority:** Must Have

---

## EPIC 16: ADMIN PORTAL - AI CORRELATION ENGINE

### US-043: Detect Platform-Behavior Correlations

**As a** system  
**I want to** automatically correlate API issues with behavior changes  
**So that** operations team can respond proactively

**Acceptance Criteria:**
- Monitor API error rates (60-minute rolling window)
- Monitor behavior metrics (drop-offs, failures, session duration)
- Calculate Pearson correlation coefficient
- Trigger alert if correlation > 0.7 and confidence > 80%
- Alert shows: Platform issue, Behavior change, Correlation confidence %, Insight, Recommended action

**Priority:** Must Have

---

### US-044: Apply Correlation Recommendations

**As an** operations team member  
**I want to** execute recommended mitigations  
**So that** I can minimize impact quickly

**Acceptance Criteria:**
- Alert displays actionable recommendation (e.g., "Suppress card payment option — route to Apple/Google Pay")
- Action buttons: "Apply Recommendation", "Dismiss", "Escalate"
- "Apply" executes suggested mitigation automatically
- "Escalate" notifies platform engineering team

**Priority:** Should Have

---

## EPIC 17: ADMIN PORTAL - CUSTOMER LIFECYCLE

### US-045: View Customer Health Scores

**As an** operations team member  
**I want to** see customer health metrics  
**So that** I can prioritize outreach

**Acceptance Criteria:**
- Grid of customer cards
- Each card shows: Company, Owner, Emirate, Category, Employees, NPS, Stage (Active/Renewal/Lapsed), Churn score (0-100 with risk bar), Health score (0-100 color-coded), LTV, Policy ref, Last contact, Payment status, Open claims, Products held, Missing products, Days to renewal, Insurer, Premium, AI signal badge, Revenue opportunity, Tags, Auto-comms status

**Priority:** Must Have

---

### US-046: View AI Playbooks

**As an** operations team member  
**I want to** see AI-generated action playbooks  
**So that** I can handle each customer appropriately

**Acceptance Criteria:**
- 4 playbook types: Renewal (high confidence), Churn Risk (HIGH), Upsell Opportunity, Compliance Critical
- Each playbook shows: Badge, Headline, Body, Recommended Actions (buttons), Inbound Handling Guide (title + points + context note)
- Playbook displayed when clicking customer card with AI signal

**Priority:** Must Have

---

## EPIC 18: ADMIN PORTAL - PROACTIVE INTELLIGENCE

### US-047: Monitor Weather Events

**As a** system  
**I want to** monitor UAE weather events  
**So that** I can alert affected customers proactively

**Acceptance Criteria:**
- Integration: UAE National Center of Meteorology (NCM) API
- Monitored events: Flooding/heavy rain, Sandstorms, Cyclone warnings
- Trigger: Weather alert issued for emirate → Filter customers with Property Insurance in that emirate
- Automated email: "Weather Alert — Protect Your Business" with safety tips and claim filing link
- Dashboard alert: "23 customers in Dubai at risk — flooding alert issued"

**Priority:** Should Have

---

### US-048: Detect Peer Analysis Trends

**As a** system  
**I want to** detect behavioral shifts in customer cohorts  
**So that** I can recommend coverage adjustments

**Acceptance Criteria:**
- Cohort definition: Group by business category + size
- Trigger: ≥ 20% of cohort performs action (increase coverage, add product)
- Insight: "Similar F&B businesses increased coverage by 23% — consider reaching out"
- Recommended action: Email with comparison chart
- Dashboard alert: Flag customers in same cohort who haven't upgraded

**Priority:** Should Have

---

### US-049: Detect Material Business Changes

**As a** system  
**I want to** monitor government data for business changes  
**So that** I can trigger mid-term coverage reviews

**Acceptance Criteria:**
- Government API integration: TAMM/DED APIs for trade license updates
- Detected changes: New employees (WPS), Business expansion (new location), Trade activity change (license amendment), Capital increase
- Alert: "[Company] added 3 employees — WC coverage needs update"
- Automated email: "We Noticed Your Business Changed — Let's Update Your Coverage"

**Priority:** Should Have

---

## EPIC 19: LOCALIZATION & BILINGUAL SUPPORT

### US-050: Switch Language Dynamically

**As an** SME owner  
**I want to** switch between English and Arabic  
**So that** I can use the platform in my preferred language

**Acceptance Criteria:**
- Language switcher available on all screens (English ⇄ Arabic)
- Selection persists across entire journey (saved to local storage)
- UI updates instantly (no page reload)
- dir="rtl" attribute applied when Arabic selected

**Priority:** Must Have

---

### US-051: RTL Layout Support

**As an** Arabic user  
**I want** the UI to display correctly right-to-left  
**So that** it feels natural

**Acceptance Criteria:**
- Text alignment: Right-aligned
- UI elements: Icons and buttons flip horizontally
- Forms: Input fields right-aligned, labels right-aligned
- Font: IBM Plex Arabic (Google Fonts)

**Priority:** Must Have

---

### US-052: Khaleeji Dialect AI Responses

**As an** Arabic user  
**I want** the AI to speak in my dialect  
**So that** it feels relatable

**Acceptance Criteria:**
- AI detects Arabic input → Responds in Khaleeji dialect
- Common phrases: واللا, زين, يلا, خلاص, شنو, وياك
- Avoid overly formal Modern Standard Arabic
- Maintain warmth and relatability

**Priority:** Must Have

---

## EPIC 20: ANALYTICS & REPORTING

### US-053: Track User Journey Metrics

**As a** product manager  
**I want to** see user journey analytics  
**So that** I can optimize conversion

**Acceptance Criteria:**
- Entry path distribution: % of users per path
- Time to quote: Median, P90, P99
- Completion rate: % reaching Policy Issued
- Drop-off rate per stage: %
- OCR success rate: % successful extractions
- AI Advisor completion: % of chats resulting in profile

**Priority:** Must Have

---

### US-054: Track Business Metrics

**As a** business owner  
**I want to** see business performance  
**So that** I can measure growth

**Acceptance Criteria:**
- Quotes started (daily/weekly/monthly)
- Policies issued (daily/weekly/monthly)
- Gross Written Premium (GWP): Total AED
- Average premium per policy: AED
- Customer Acquisition Cost (CAC): AED per policy
- Lifetime Value (LTV): AED per customer

**Priority:** Must Have

---

## SUMMARY

**Total: 54 User Stories across 20 Epics**

### Epic Breakdown:
1. Landing & Entry (2 stories)
2. Quick Select Path (2 stories)
3. OCR Trade License Path (3 stories)
4. AI Advisor Chat Path (4 stories)
5. Manual Form Path (3 stories)
6. Confirmation & Coverage Profile (2 stories)
7. Quote Results & Comparison (4 stories)
8. Verification & Location (2 stories)
9. Checkout & Payment (3 stories)
10. Confirmation & Post-Purchase (4 stories)
11. Customer Dashboard - Policies (3 stories)
12. Customer Dashboard - Renewals (3 stories)
13. Customer Dashboard - Claims (3 stories)
14. Admin Portal - Platform Health (2 stories)
15. Admin Portal - User Behavior (2 stories)
16. Admin Portal - AI Correlation Engine (2 stories)
17. Admin Portal - Customer Lifecycle (2 stories)
18. Admin Portal - Proactive Intelligence (3 stories)
19. Localization & Bilingual Support (3 stories)
20. Analytics & Reporting (2 stories)

---

**END OF USER STORIES**
