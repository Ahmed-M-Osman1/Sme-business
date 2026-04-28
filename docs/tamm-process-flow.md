# TAMM Process Flow Companion Document

This document describes the end-to-end TAMM journey for the Shory SME insurance platform. It covers how customers enter the quote flow, which data fields are collected at each step, required documents, representative customer personas, and available payment methods. Use this as the single reference when building, testing, or onboarding stakeholders to the TAMM integration.

---

## 1. Journey Entry Points

| Entry point | User state | Journey start | Auth method |
|---|---|---|---|
| TAMM Business Space tile | UAE PASS authenticated | `/quote/results` (pre-filled) | UAE PASS session |
| TAMM Business Space tile | Not authenticated | `/quote/start` with UAE PASS prompt | Manual or UAE PASS |
| Direct URL / QR code | Not authenticated | `/quote/start` | Manual or UAE PASS |
| WhatsApp chatbot | Not authenticated | Chatbot -> handoff to web | Phone number |
| ADGM portal | ADGM authenticated | `/quote/results` | ADGM ID |

---

## 2. Data Fields

Data collection spans six steps. Each field notes whether it is required and its expected source.

### Step 1 -- Business Profile (QEntry / QAssumptions)

| Field | Required | Source |
|---|---|---|
| Business name | Yes | UAE PASS / manual |
| Trade licence number | Yes | UAE PASS / manual / OCR |
| Business activity / category | Yes | UAE PASS / manual |
| Legal form | Yes | UAE PASS / manual |
| Licence expiry date | Yes | UAE PASS / OCR |
| Issuing authority | Yes | UAE PASS / manual |
| Number of employees | Yes | Manual |
| Annual revenue band | Yes | Manual |
| Business location / locality | Yes | UAE PASS / manual |
| Territorial coverage | Yes | Manual |
| High-value assets | No | Manual |

### Step 2 -- Coverage Confirmation

| Field | Required |
|---|---|
| Customer interaction toggle | Yes |
| Professional advice toggle | Yes |
| Physical assets toggle | Yes |
| Commercial vehicles toggle | Yes |

### Step 3 -- Company Details

| Field | Required | Notes |
|---|---|---|
| Company name (confirmed) | Yes | Pre-filled from Step 1 |
| Trade licence number (confirmed) | Yes | Pre-filled from Step 1 |
| Business activity | Yes | Pre-filled from Step 1 |
| Licence expiry | Yes | Pre-filled from Step 1 |
| Issuing authority | Yes | Pre-filled from Step 1 |

### Step 4 -- Policyholder Identity

| Field | Required | Notes |
|---|---|---|
| Emirates ID number | Yes | Format: `784-YYYY-XXXXXXX-X` |
| Date of birth | Yes | |
| Full name | Yes | |
| Email address | Yes | |
| UAE mobile number | Yes | |
| Business location | Yes | |

### Step 5 -- Review & Pay

| Field | Required | Notes |
|---|---|---|
| Payment frequency | Yes | Annual or monthly |

### Step 6 -- Payment

| Field | Required | Notes |
|---|---|---|
| Payment method | Yes | See Payment Capabilities section |
| Card details | Conditional | Required if paying by card |
| Finwall T&C acceptance | Conditional | Required if monthly instalments selected |

---

## 3. Customer Documents

| Document | When required | Format | Notes |
|---|---|---|---|
| UAE Trade Licence | Always | PDF / JPG / PNG | Current, Abu Dhabi-issued. OCR extracts key fields. |
| Emirates ID | Always | Physical (number entered) | Number used for identity verification. |
| Financial statements | High-revenue (>AED 10M) | PDF | May be required by specific insurers. |
| Previous policy schedule | If renewing | PDF | Match cover levels, avoid gaps. |
| Claims history | Optional | Any | From previous insurer if switching. |
| Valuation certificate | High-value assets (>AED 500K) | PDF | Required for Property Insurance at high limits. |
| Vehicle registration cards | Fleet Insurance | PDF / JPG | One per vehicle. |

---

## 4. Personas

### Persona 1 -- Fatima Al Mansoori

- **Business:** Legal consultancy, ADGM
- **Size:** 6 employees, AED 2-5M revenue
- **Profile:** Compliance-first owner
- **Journey:** UAE PASS entry -> pre-filled data -> quotes -> Professional pack
- **Insurance knowledge:** Low
- **Payment preference:** Annual

### Persona 2 -- Khalid Al Nuaimi

- **Business:** Tech startup, Masdar City
- **Size:** 18 employees, AED 1-2M revenue
- **Profile:** Growth-stage founder
- **Journey:** Direct URL -> manual entry -> Customise -> Cyber + D&O add-ons
- **Insurance knowledge:** Medium
- **Payment preference:** Monthly

### Persona 3 -- Ahmed Al Balushi

- **Business:** Retail electrical goods, Musaffah
- **Size:** 3 employees, AED 500K-1M revenue
- **Profile:** Established trader
- **Journey:** TAMM Business Space -> OCR trade licence -> Starter bundle -> Apple Pay
- **Insurance knowledge:** Very low
- **Payment preference:** Annual

### Persona 4 -- Sara Mohammed

- **Business:** Marketing consultancy, ADGM
- **Size:** 2 employees, under AED 500K revenue
- **Profile:** Free zone professional
- **Journey:** TAMM Business Space -> UAE PASS pre-fill -> compliance panel -> cheapest insurer
- **Insurance knowledge:** Low
- **Payment preference:** Monthly

---

## 5. Payment Capabilities

| Method | Frequency | Provider | Available | Notes |
|---|---|---|---|---|
| Apple Pay | Annual / monthly | Apple / Checkout.com | Yes | Native iOS |
| Google Pay | Annual / monthly | Google / Checkout.com | Yes | Android |
| Card (Visa / MC / Amex) | Annual / monthly | Checkout.com | Yes | 3D Secure mandatory |
| Bank Transfer | Annual only | Emirates NBD / NBAD | Yes | 1 business day activation |
| Monthly Instalments | Monthly only | Finwall | Yes | 0% interest, 12 months |
| UAE PASS Wallet | Annual / monthly | UAE PASS / NDFS | Roadmap | Abu Dhabi government wallet |
| TAMM Pay / ADGOV wallet | Annual / monthly | ADGOV | Roadmap | If TAMM implements native payment rail |
