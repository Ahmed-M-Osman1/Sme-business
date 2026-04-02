import {db} from './client';
import {adminUsers} from './schema/admin-users';
import {businessTypes} from './schema/business-types';
import {products} from './schema/products';
import {insurers} from './schema/insurers';
import {quoteOptions} from './schema/quote-options';
import {customers} from './schema/customers';
import {apiServices} from './schema/api-services';
import {incidents} from './schema/incidents';
import {funnelEvents} from './schema/funnel-events';
import {behaviourMetrics} from './schema/behaviour-metrics';
import {externalSignals} from './schema/external-signals';
import {midtermTriggers} from './schema/midterm-triggers';
import {peerBenchmarks} from './schema/peer-benchmarks';
import {platformCorrelations} from './schema/platform-correlations';
import {commsSequences} from './schema/comms-sequences';
import {portfolioAlerts} from './schema/portfolio-alerts';
import {createHash} from 'node:crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('Seeding database...');

  // --- Admin user ---
  await db
    .insert(adminUsers)
    .values({
      email: 'admin@shory.ae',
      name: 'Shory Admin',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    })
    .onConflictDoNothing();
  console.log('Admin user seeded');

  // --- Business Types ---
  await db
    .insert(businessTypes)
    .values([
      {id: 'cafe-restaurant', title: 'Café / Restaurant', description: 'Coffee shops, restaurants, takeaways, catering', icon: '☕', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'law-firm', title: 'Law Firm / Legal', description: 'Legal advice, litigation, contract review', icon: '⚖️', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
      {id: 'retail-trading', title: 'Retail / Trading', description: 'Shops, trading companies, wholesale, e-commerce', icon: '🛒', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'it-technology', title: 'IT / Technology', description: 'Software, SaaS, IT consulting, digital agencies', icon: '💻', riskLevel: 'low', riskFactor: 1.0, products: ['workers-comp', 'professional-indemnity']},
      {id: 'construction', title: 'Construction / Contracting', description: 'Building, fit-out, MEP, civil works, maintenance', icon: '🏗️', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'public-liability', 'property', 'professional-indemnity']},
      {id: 'healthcare', title: 'Healthcare / Clinic', description: 'Medical clinics, pharmacies, wellness centres', icon: '🏥', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'public-liability', 'professional-indemnity', 'property']},
      {id: 'consulting', title: 'Consulting / Advisory', description: 'Management consulting, financial advisory', icon: '💼', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
      {id: 'general-trading', title: 'General Trading', description: 'Import/export, general merchandise', icon: '📦', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'property']},
      {id: 'logistics', title: 'Logistics / Transport', description: 'Freight, last-mile delivery, warehousing, couriers', icon: '🚛', riskLevel: 'high', riskFactor: 1.8, products: ['workers-comp', 'property', 'fleet']},
      {id: 'real-estate', title: 'Real Estate', description: 'Property brokerage, development, property management', icon: '🏢', riskLevel: 'medium', riskFactor: 1.4, products: ['workers-comp', 'public-liability', 'professional-indemnity']},
    ])
    .onConflictDoNothing();
  console.log('Business types seeded');

  // --- Products ---
  await db
    .insert(products)
    .values([
      {id: 'workers-comp', name: 'Workers Compensation', shortName: 'Workers', icon: '👷', basePrice: 400},
      {id: 'public-liability', name: 'Public Liability', shortName: 'Public', icon: '🤝', basePrice: 500},
      {id: 'professional-indemnity', name: 'Professional Indemnity', shortName: 'Professional', icon: '📋', basePrice: 600},
      {id: 'property', name: 'Property Insurance', shortName: 'Property', icon: '🏢', basePrice: 700},
      {id: 'fleet', name: 'Fleet Insurance', shortName: 'Fleet', icon: '🚛', basePrice: 800},
    ])
    .onConflictDoNothing();
  console.log('Products seeded');

  // --- Insurers ---
  await db
    .insert(insurers)
    .values([
      {id: 'salama', name: 'Salama Insurance', logo: '/insurers/Salama.png', rating: 4.3, reviewCount: 512, shariahCompliant: true, priceMultiplier: 1.0},
      {id: 'watania', name: 'Watania Takaful', logo: '/insurers/Watania.png', rating: 4.4, reviewCount: 634, shariahCompliant: true, priceMultiplier: 1.023},
      {id: 'yas-takaful', name: 'YAS Takaful', logo: '/insurers/YASTakaful.png', rating: 4.1, reviewCount: 530, shariahCompliant: true, priceMultiplier: 1.045},
      {id: 'sukoon', name: 'Sukoon Insurance', logo: '/insurers/SukoonInsurance.png', rating: 4.5, reviewCount: 781, shariahCompliant: false, priceMultiplier: 1.057},
      {id: 'afnic', name: 'AFNIC', logo: '/insurers/AFNIC.png', rating: 3.8, reviewCount: 440, shariahCompliant: false, priceMultiplier: 1.09},
      {id: 'dubai-insurance', name: 'Dubai Insurance', logo: '/insurers/DubaiInsurance.png', rating: 4.0, reviewCount: 750, shariahCompliant: false, priceMultiplier: 1.12},
      {id: 'qic', name: 'QIC', logo: '/insurers/QIC.png', rating: 4.1, reviewCount: 920, shariahCompliant: false, priceMultiplier: 1.15},
      {id: 'adnic', name: 'ADNIC', logo: '/insurers/ADNIC.png', rating: 4.4, reviewCount: 1870, shariahCompliant: false, priceMultiplier: 1.18},
      {id: 'orient', name: 'Orient Insurance', logo: '/insurers/ORIENT.png', rating: 4.7, reviewCount: 1105, shariahCompliant: false, priceMultiplier: 1.218},
      {id: 'orient-takaful', name: 'Orient Takaful', logo: '/insurers/OrientTakaful.png', rating: 4.2, reviewCount: 780, shariahCompliant: true, priceMultiplier: 1.25},
      {id: 'al-ain-ahlia', name: 'Al Ain Ahlia', logo: '/insurers/AlAinAhlia.png', rating: 4.0, reviewCount: 680, shariahCompliant: false, priceMultiplier: 1.28},
      {id: 'insurance-house', name: 'Insurance House', logo: '/insurers/InsuranceHouse.png', rating: 3.9, reviewCount: 620, shariahCompliant: false, priceMultiplier: 1.32},
    ])
    .onConflictDoNothing();
  console.log('Insurers seeded');

  // --- Quote Options ---
  await db
    .insert(quoteOptions)
    .values([
      {
        id: 'employee-bands',
        category: 'quote-form',
        items: [
          {label: 'Just me', value: '1'},
          {label: '2–5', value: '2-5'},
          {label: '6–20', value: '6-20'},
          {label: '21–50', value: '21-50'},
          {label: '51–100', value: '51-100'},
          {label: '100+', value: '100+'},
        ],
      },
      {
        id: 'revenue-bands',
        category: 'quote-form',
        items: [
          {label: 'Under AED 500,000', value: 'under-500k'},
          {label: 'AED 500K – 1 million', value: '500k-1m'},
          {label: 'AED 1M – 5 million', value: '1m-5m'},
          {label: 'AED 5M – 10 million', value: '5m-10m'},
          {label: 'Over AED 10 million', value: 'over-10m'},
        ],
      },
      {
        id: 'emirates',
        category: 'location',
        items: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
      },
      {
        id: 'coverage-areas',
        category: 'quote-form',
        items: [
          {label: 'UAE only', value: 'uae'},
          {label: 'GCC', value: 'gcc'},
          {label: 'Worldwide', value: 'worldwide'},
        ],
      },
      {
        id: 'high-value-assets',
        category: 'quote-form',
        items: [
          {id: 'stock', label: 'Stock / inventory', icon: '📦', description: 'Current retail stock at cost price'},
          {id: 'fixtures', label: 'Fixtures & fit-out', icon: '🪟', description: 'Display shelving, counters, lighting'},
          {id: 'pos', label: 'POS & payment systems', icon: '💳', description: 'Terminals, tablets, cash registers'},
          {id: 'security', label: 'Security / CCTV systems', icon: '📷', description: 'Cameras, access control, alarms'},
          {id: 'safe', label: 'Safe / cash handling', icon: '🔒', description: 'Safes, cash counters'},
        ],
      },
      {
        id: 'coverage-limits',
        category: 'pricing',
        items: [
          {label: 'AED 1M', value: '1M', multiplier: 1.0},
          {label: 'AED 2M', value: '2M', multiplier: 1.4},
          {label: 'AED 5M', value: '5M', multiplier: 2.0},
        ],
      },
      {
        id: 'size-factors',
        category: 'pricing',
        items: [
          {band: '1', factor: 1.0},
          {band: '2-5', factor: 1.1},
          {band: '6-20', factor: 1.2},
          {band: '21-50', factor: 1.3},
          {band: '51-100', factor: 1.5},
          {band: '100+', factor: 1.6},
        ],
      },
      {
        id: 'activities',
        category: 'company-details',
        items: [
          'Technology', 'Trading', 'Manufacturing', 'Construction', 'Healthcare',
          'Hospitality', 'Retail', 'Professional Services', 'Transport & Logistics',
          'Food & Beverage', 'Beauty Services', 'Education', 'Real Estate',
          'Financial Services', 'Media & Advertising', 'Other',
        ],
      },
    ])
    .onConflictDoNothing();
  console.log('Quote options seeded');

  // --- Customers ---
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [customer1] = await db
    .insert(customers)
    .values({
      name: 'Mohammed Al-Rashidi',
      company: 'Al Baraka Cafe & Restaurant',
      email: 'm.rashidi@albaraka.ae',
      emirate: 'Dubai',
      category: 'Food & Beverage',
      employees: 12,
      nps: 9,
      stage: 'active',
      churnScore: 12,
      healthScore: 88,
      ltv: '9000',
      policyRef: 'SHR-2024-00142',
      paymentStatus: 'on_time',
      claimsOpen: 0,
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance'],
      missingProducts: ['Cyber Liability', 'Food Contamination'],
      renewalDays: 14,
      insurerId: 'orient',
      premium: '3000',
      aiSignal: 'renewal_high_confidence',
      revenueOpp: '840',
      tags: ['Promoter', 'Renewal Due', 'Upsell Ready'],
      autoCommsStatus: 'Day -14 email opened - payment link not yet clicked',
    })
    .onConflictDoNothing()
    .returning();

  const [customer2] = await db
    .insert(customers)
    .values({
      name: 'Dr. Ahmed Khalil',
      company: 'Sunrise Medical Centre',
      email: 'a.khalil@sunrisemedical.ae',
      emirate: 'Dubai',
      category: 'Healthcare',
      employees: 45,
      nps: 6,
      stage: 'renewal_negotiation',
      churnScore: 68,
      healthScore: 51,
      ltv: '49410',
      policyRef: 'SHR-2024-00129',
      paymentStatus: 'on_time',
      claimsOpen: 1,
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity', 'Property Insurance'],
      missingProducts: ['Cyber Liability', 'Business Interruption'],
      renewalDays: 2,
      insurerId: 'qic',
      premium: '16470',
      aiSignal: 'churn_high_risk',
      revenueOpp: '2400',
      tags: ['At Risk', 'Open Claim', 'Large Account'],
      autoCommsStatus: 'Day -2 WhatsApp sent - no response',
    })
    .onConflictDoNothing()
    .returning();

  const [customer3] = await db
    .insert(customers)
    .values({
      name: 'Sarah Al-Mansouri',
      company: 'TechFlow Solutions LLC',
      email: 'sarah@techflow.ae',
      emirate: 'Abu Dhabi',
      category: 'Technology',
      employees: 28,
      nps: 8,
      stage: 'active',
      churnScore: 21,
      healthScore: 82,
      ltv: '24240',
      policyRef: 'SHR-2024-00138',
      paymentStatus: 'on_time',
      claimsOpen: 0,
      products: ['Workers Compensation', 'Professional Indemnity', 'Cyber Liability'],
      missingProducts: ['Directors & Officers', 'Office Insurance'],
      renewalDays: 59,
      insurerId: 'sukoon',
      premium: '8080',
      aiSignal: 'upsell_opportunity',
      revenueOpp: '3600',
      tags: ['Premium Account', 'Cross-Sell', 'Tech'],
      autoCommsStatus: 'Mid-term email opened - product link not clicked',
    })
    .onConflictDoNothing()
    .returning();

  const [customer4] = await db
    .insert(customers)
    .values({
      name: 'Yusuf Al-Mansoori',
      company: 'Horizon Construction LLC',
      email: 'yusuf@horizonconst.ae',
      emirate: 'Abu Dhabi',
      category: 'Construction & Trades',
      employees: 62,
      nps: null,
      stage: 'lapsed',
      churnScore: 91,
      healthScore: 28,
      ltv: '50430',
      policyRef: 'SHR-2024-00173',
      paymentStatus: 'overdue',
      claimsOpen: 0,
      products: [],
      missingProducts: ['Workers Compensation', 'Public Liability', 'Fleet Insurance'],
      renewalDays: -61,
      insurerId: 'orient',
      premium: '16810',
      aiSignal: 'compliance_critical',
      revenueOpp: '16810',
      tags: ['Lapsed', 'Legal Exposure', 'Overdue'],
      autoCommsStatus: 'Automated sequence exhausted - no response',
    })
    .onConflictDoNothing()
    .returning();

  const [customer5] = await db
    .insert(customers)
    .values({
      name: 'Layla Hassan',
      company: 'Desert Bloom Events LLC',
      email: 'layla@desertbloom.ae',
      emirate: 'Dubai',
      category: 'Professional Services',
      employees: 8,
      nps: 10,
      stage: 'active',
      churnScore: 5,
      healthScore: 97,
      ltv: '6600',
      policyRef: 'SHR-2024-00161',
      paymentStatus: 'on_time',
      claimsOpen: 0,
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
      missingProducts: ['Event Cancellation', 'Business Interruption'],
      renewalDays: 151,
      insurerId: 'salama',
      premium: '2200',
      aiSignal: 'upsell_opportunity',
      revenueOpp: '1200',
      tags: ['Promoter', 'Happy', 'Takaful'],
      autoCommsStatus: 'No active sequence - renewal 151 days away',
    })
    .onConflictDoNothing()
    .returning();
  console.log('Customers seeded');

  // --- API Services ---
  await db
    .insert(apiServices)
    .values([
      {id: 'quote', name: 'Quote Engine', category: 'core', status: 'operational', uptime: '99.97', latency: 142, p99: 380, errorRate: '0.06', requests24h: 4821},
      {id: 'policy', name: 'Policy Issuance', category: 'core', status: 'operational', uptime: '99.91', latency: 218, p99: 650, errorRate: '0.32', requests24h: 312},
      {id: 'auth', name: 'Auth Service', category: 'core', status: 'operational', uptime: '100', latency: 28, p99: 90, errorRate: '0', requests24h: 18204},
      {id: 'payment', name: 'Payment Gateway', category: 'core', status: 'degraded', uptime: '99.85', latency: 495, p99: 1200, errorRate: '3.98', requests24h: 201},
      {id: 'ocr', name: 'OCR / Trade Licence', category: 'core', status: 'operational', uptime: '99.72', latency: 1840, p99: 4500, errorRate: '2.25', requests24h: 89},
      {id: 'claude', name: 'AI Advisor', category: 'ai', status: 'operational', uptime: '99.94', latency: 2100, p99: 5800, errorRate: '0.58', requests24h: 1203},
      {id: 'db', name: 'Database Primary', category: 'infra', status: 'operational', uptime: '100', latency: 4, p99: 15, errorRate: '0', requests24h: 94210},
      {id: 'orient-api', name: 'Orient Insurance API', category: 'insurer', status: 'degraded', uptime: '98.80', latency: 1120, p99: 3200, errorRate: '7.99', requests24h: 388},
      {id: 'gig-api', name: 'GIG Gulf API', category: 'insurer', status: 'operational', uptime: '99.40', latency: 890, p99: 2800, errorRate: '2.93', requests24h: 410},
      {id: 'rsa-api', name: 'RSA Insurance API', category: 'insurer', status: 'operational', uptime: '99.60', latency: 780, p99: 2100, errorRate: '2.07', requests24h: 290},
      {id: 'sukoon-api', name: 'Sukoon API', category: 'insurer', status: 'operational', uptime: '99.90', latency: 560, p99: 1800, errorRate: '0.93', requests24h: 215},
      {id: 'noor-api', name: 'Noor Takaful API', category: 'insurer', status: 'operational', uptime: '99.10', latency: 940, p99: 2900, errorRate: '5.06', requests24h: 178},
    ])
    .onConflictDoNothing();
  console.log('API services seeded');

  // --- Incidents ---
  const todayAt0612 = new Date(now);
  todayAt0612.setHours(6, 12, 0, 0);
  const yesterdayAt1430 = new Date(yesterday);
  yesterdayAt1430.setHours(14, 30, 0, 0);
  const yesterdayAt1845 = new Date(yesterday);
  yesterdayAt1845.setHours(18, 45, 0, 0);

  await db
    .insert(incidents)
    .values([
      {
        serviceName: 'Payment Gateway',
        severity: 'high',
        status: 'active',
        startedAt: todayAt0612,
        description: 'Card tokenisation error rate at 4.0% - Apple/Google Pay unaffected',
        impact: '~8 failed payment attempts in last hour. Renewal completion rate down 18%',
      },
      {
        serviceName: 'Orient Insurance API',
        severity: 'medium',
        status: 'resolved',
        startedAt: yesterdayAt1430,
        resolvedAt: yesterdayAt1845,
        description: 'Orient API returning 504 timeouts during scheduled maintenance',
        impact: '31 quotes served from cache for 4h 15m',
      },
    ])
    .onConflictDoNothing();
  console.log('Incidents seeded');

  // --- Funnel Events ---
  await db
    .insert(funnelEvents)
    .values([
      {step: 'Landing / Home', sessions: 1840, dropPct: '0', trend: '4.2', isAnomaly: false, recordedAt: now},
      {step: 'Start Quote', sessions: 921, dropPct: '49.9', trend: '2.1', isAnomaly: false, recordedAt: now},
      {step: 'Business Details', sessions: 742, dropPct: '19.4', trend: '-1.8', isAnomaly: false, recordedAt: now},
      {step: 'Product Selection', sessions: 601, dropPct: '19.0', trend: '-3.2', isAnomaly: false, recordedAt: now},
      {step: 'Insurer Comparison', sessions: 512, dropPct: '14.8', trend: '-2.9', isAnomaly: false, recordedAt: now},
      {step: 'Checkout', sessions: 298, dropPct: '41.8', trend: '-34.2', isAnomaly: true, recordedAt: now},
      {step: 'Payment', sessions: 171, dropPct: '42.6', trend: '-41.7', isAnomaly: true, recordedAt: now},
      {step: 'Policy Issued', sessions: 162, dropPct: '5.3', trend: '0.8', isAnomaly: false, recordedAt: now},
    ])
    .onConflictDoNothing();
  console.log('Funnel events seeded');

  // --- Behaviour Metrics ---
  await db
    .insert(behaviourMetrics)
    .values([
      {label: 'Active Sessions', value: '47', trend: '8.2', isGood: true, icon: '👥', subLabel: 'right now', recordedAt: now},
      {label: 'Quotes Started', value: '921', trend: '2.1', isGood: true, icon: '📝', subLabel: 'today', recordedAt: now},
      {label: 'Policies Issued', value: '162', trend: '-12.4', isGood: false, icon: '📋', subLabel: 'today', recordedAt: now},
      {label: 'Checkout Drop-off', value: '41.8%', trend: '34.2', isGood: false, icon: '🛒', subLabel: 'vs yesterday', recordedAt: now},
      {label: 'Payment Failures', value: '8', trend: '400', isGood: false, icon: '💳', subLabel: 'last hour', recordedAt: now},
      {label: 'Avg Session', value: '4m 12s', trend: '-8.1', isGood: false, icon: '⏱️', subLabel: 'vs yesterday', recordedAt: now},
      {label: 'OCR Upload Success', value: '94.4%', trend: '-3.1', isGood: false, icon: '📸', subLabel: 'today', recordedAt: now},
      {label: 'AI Advisor Used', value: '38.2%', trend: '5.9', isGood: true, icon: '🤖', subLabel: 'of sessions', recordedAt: now},
    ])
    .onConflictDoNothing();
  console.log('Behaviour metrics seeded');

  // --- External Signals ---
  // Use customer IDs from the inserted customers for affected customers
  const customerIds = [customer1, customer2, customer3, customer4, customer5]
    .filter(Boolean)
    .map((c) => c.id);

  await db
    .insert(externalSignals)
    .values([
      {
        id: 'sig-weather-rain',
        category: 'weather',
        severity: 'high',
        icon: '🌧️',
        title: 'Heavy Rain Warning — Dubai & Sharjah',
        source: 'NCM Weather Alert',
        detail: 'Heavy rainfall expected across Dubai and Northern Emirates over the next 48 hours. Historical data shows 340% increase in property damage claims during similar events.',
        affectedCategories: ['Food & Beverage', 'Retail', 'Construction & Trades'],
        recommendedProduct: 'Property Insurance',
        recommendedEnhancement: 'Flood & water damage rider',
        customerCommsAngle: 'Proactive weather advisory with coverage check — position Shory as caring partner who alerts before events happen.',
        affectedCustomers: customerIds.length >= 2 ? [customerIds[0], customerIds[3]] : [],
        commsReadiness: 'Draft ready — send to 2 affected customers',
        revenueImpact: '4200',
        urgency: 'high',
      },
      {
        id: 'sig-cyber-cbuae',
        category: 'cyber',
        severity: 'high',
        icon: '🛡️',
        title: 'CBUAE Cyber Security Advisory',
        source: 'Central Bank of UAE',
        detail: 'New CBUAE directive requires all financial service providers to maintain cyber liability insurance by Q3 2026. Non-compliance penalties up to AED 500,000.',
        affectedCategories: ['Technology', 'Professional Services', 'Healthcare'],
        recommendedProduct: 'Cyber Liability',
        recommendedEnhancement: null,
        customerCommsAngle: 'Regulatory compliance urgency — position as must-have before deadline.',
        affectedCustomers: customerIds.length >= 3 ? [customerIds[2]] : [],
        commsReadiness: 'Draft ready — 1 tech customer without cyber coverage',
        revenueImpact: '3600',
        urgency: 'high',
      },
      {
        id: 'sig-regulatory-mohre',
        category: 'regulatory',
        severity: 'medium',
        icon: '📋',
        title: 'MOHRE Workers Comp Update',
        source: 'Ministry of Human Resources',
        detail: 'Updated workers compensation requirements effective June 2026 — minimum coverage increased to AED 50,000 per employee for companies with 50+ staff.',
        affectedCategories: ['Construction & Trades', 'Healthcare', 'Technology'],
        recommendedProduct: 'Workers Compensation',
        recommendedEnhancement: 'Enhanced coverage limit',
        customerCommsAngle: 'Compliance update — review current limits vs new requirements.',
        affectedCustomers: customerIds.length >= 4 ? [customerIds[1], customerIds[3]] : [],
        commsReadiness: 'Needs review — 2 customers with 45+ employees',
        revenueImpact: '2800',
        urgency: 'medium',
      },
      {
        id: 'sig-market-events',
        category: 'market',
        severity: 'low',
        icon: '🎪',
        title: 'Dubai Events Season Peak',
        source: 'DTCM Market Intelligence',
        detail: 'Dubai events season entering peak period — 40% increase in event permits issued vs last quarter. Event cancellation and public liability demand historically rises 25%.',
        affectedCategories: ['Professional Services', 'Food & Beverage'],
        recommendedProduct: 'Event Cancellation',
        recommendedEnhancement: null,
        customerCommsAngle: 'Seasonal opportunity — event cancellation coverage for busy season.',
        affectedCustomers: customerIds.length >= 5 ? [customerIds[4]] : [],
        commsReadiness: 'Draft ready — 1 events company',
        revenueImpact: '1200',
        urgency: 'low',
      },
      {
        id: 'sig-weather-heatwave',
        category: 'weather',
        severity: 'medium',
        icon: '🌡️',
        title: 'Extreme Heat Advisory — Abu Dhabi',
        source: 'NCM Weather Alert',
        detail: 'Temperatures expected to exceed 48°C in Abu Dhabi region next week. Construction site accidents increase 180% during extreme heat events.',
        affectedCategories: ['Construction & Trades'],
        recommendedProduct: 'Workers Compensation',
        recommendedEnhancement: 'Heat-related illness rider',
        customerCommsAngle: 'Worker safety advisory — review WC coverage adequacy for heat-related incidents.',
        affectedCustomers: customerIds.length >= 4 ? [customerIds[3]] : [],
        commsReadiness: 'Needs review — 1 construction company (lapsed)',
        revenueImpact: '16810',
        urgency: 'medium',
      },
    ])
    .onConflictDoNothing();
  console.log('External signals seeded');

  // --- Midterm Triggers ---
  if (customer1 && customer2 && customer3 && customer5) {
    await db
      .insert(midtermTriggers)
      .values([
        {
          id: 'mt-growth-baraka',
          customerId: customer1.id,
          type: 'business_growth',
          icon: '📈',
          title: 'Business Expansion Detected',
          triggerDescription: 'Al Baraka Cafe added 3 new employees in the last quarter',
          detail: 'Employee count grew from 9 to 12 — current Workers Comp policy covers up to 10 employees. Policy adjustment needed.',
          recommendedAction: 'Send coverage review advisory with updated quote',
          customerComms: 'Your business is growing! Let us make sure your team is fully covered with an updated Workers Comp policy.',
          revenueImpact: '400',
          timing: 'Send within 7 days',
          status: 'pending_send',
        },
        {
          id: 'mt-digital-techflow',
          customerId: customer3.id,
          type: 'digital_engagement',
          icon: '💻',
          title: 'Repeated D&O Page Views',
          triggerDescription: 'Sarah viewed Directors & Officers product page 4 times this month',
          detail: 'High intent signal — customer is researching D&O coverage which is in their missing products list. Conversion probability: 72%.',
          recommendedAction: 'Send personalised D&O quote with peer benchmark data',
          customerComms: 'We noticed you have been exploring Directors & Officers coverage — here is a tailored quote based on your company profile.',
          revenueImpact: '2400',
          timing: 'Send immediately — high intent',
          status: 'awaiting',
        },
        {
          id: 'mt-claims-sunrise',
          customerId: customer2.id,
          type: 'claims_event',
          icon: '⚠️',
          title: 'Open Claim — Churn Risk Elevated',
          triggerDescription: 'Dr. Khalil has an open WC claim filed 3 weeks ago',
          detail: 'Open claims during renewal window increase churn probability by 35%. Current churn score: 68%. Proactive retention outreach recommended.',
          recommendedAction: 'Schedule personal call — discuss claim status and renewal terms',
          customerComms: 'We are following up on your recent claim and want to ensure your renewal experience is smooth.',
          revenueImpact: '16470',
          timing: 'Urgent — renewal in 2 days',
          status: 'pending_send',
        },
        {
          id: 'mt-industry-events',
          customerId: customer5.id,
          type: 'industry_event',
          icon: '🎪',
          title: 'Dubai Events Season — Coverage Gap',
          triggerDescription: 'Peak events season starting — Desert Bloom has no Event Cancellation coverage',
          detail: 'Events companies without cancellation coverage face average losses of AED 45,000 per cancelled event. Desert Bloom runs 8-12 events per season.',
          recommendedAction: 'Send event cancellation product advisory with seasonal pricing',
          customerComms: 'Events season is here! Protect your business from cancellation losses with our tailored coverage.',
          revenueImpact: '1200',
          timing: 'Send within 14 days',
          status: 'scheduled',
        },
      ])
      .onConflictDoNothing();
  }
  console.log('Midterm triggers seeded');

  // --- Peer Benchmarks ---
  await db
    .insert(peerBenchmarks)
    .values([
      {
        id: 'bench-food-small',
        category: 'Food & Beverage',
        employeeBand: '6-20',
        headline: '78% of similar F&B businesses carry Property Insurance',
        data: [
          {product: 'Workers Compensation', pct: 95, mandatory: true},
          {product: 'Public Liability', pct: 88, mandatory: false},
          {product: 'Property Insurance', pct: 78, mandatory: false},
          {product: 'Food Contamination', pct: 42, mandatory: false},
          {product: 'Cyber Liability', pct: 15, mandatory: false},
        ],
        trendingProduct: 'Food Contamination',
        trendDetail: '+18% adoption in last 6 months among F&B businesses',
        relevantCustomers: customer1 ? [customer1.id] : [],
      },
      {
        id: 'bench-healthcare-mid',
        category: 'Healthcare',
        employeeBand: '21-50',
        headline: '92% of healthcare providers carry Professional Indemnity',
        data: [
          {product: 'Workers Compensation', pct: 98, mandatory: true},
          {product: 'Professional Indemnity', pct: 92, mandatory: true},
          {product: 'Public Liability', pct: 85, mandatory: false},
          {product: 'Property Insurance', pct: 72, mandatory: false},
          {product: 'Cyber Liability', pct: 61, mandatory: false},
          {product: 'Business Interruption', pct: 38, mandatory: false},
        ],
        trendingProduct: 'Cyber Liability',
        trendDetail: '+24% adoption driven by CBUAE advisory',
        relevantCustomers: customer2 ? [customer2.id] : [],
      },
      {
        id: 'bench-tech-mid',
        category: 'Technology',
        employeeBand: '21-50',
        headline: '85% of tech companies carry Cyber Liability',
        data: [
          {product: 'Workers Compensation', pct: 90, mandatory: true},
          {product: 'Cyber Liability', pct: 85, mandatory: false},
          {product: 'Professional Indemnity', pct: 80, mandatory: false},
          {product: 'Directors & Officers', pct: 55, mandatory: false},
          {product: 'Office Insurance', pct: 35, mandatory: false},
        ],
        trendingProduct: 'Directors & Officers',
        trendDetail: '+12% adoption as tech companies scale and take on investors',
        relevantCustomers: customer3 ? [customer3.id] : [],
      },
      {
        id: 'bench-construction-large',
        category: 'Construction & Trades',
        employeeBand: '51-100',
        headline: '100% of construction firms are required to carry Workers Comp',
        data: [
          {product: 'Workers Compensation', pct: 100, mandatory: true},
          {product: 'Public Liability', pct: 95, mandatory: true},
          {product: 'Property Insurance', pct: 82, mandatory: false},
          {product: 'Fleet Insurance', pct: 74, mandatory: false},
          {product: 'Business Interruption', pct: 45, mandatory: false},
        ],
        trendingProduct: 'Fleet Insurance',
        trendDetail: '+8% adoption as fleet compliance enforcement increases',
        relevantCustomers: customer4 ? [customer4.id] : [],
      },
    ])
    .onConflictDoNothing();
  console.log('Peer benchmarks seeded');

  // --- Platform Correlations ---
  await db
    .insert(platformCorrelations)
    .values([
      {
        id: 'corr-payment-checkout',
        severity: 'high',
        headline: 'Payment Gateway errors correlating with Checkout & Payment drop-off',
        detail: 'Payment service error rate at 3.98% coincides with 34.2% increase in Checkout drop-off and 41.7% increase in Payment step drop-off. Card tokenisation failures are the primary cause.',
        action: 'View Payment Gateway incident',
        actionLabel: 'View Incident',
        services: ['payment'],
        metrics: ['Checkout Drop-off', 'Payment Failures'],
        isActive: true,
      },
      {
        id: 'corr-orient-quotes',
        severity: 'medium',
        headline: 'Orient API degradation may affect Insurer Comparison load times',
        detail: 'Orient Insurance API error rate at 7.99% with P99 latency of 3.2s. Users comparing Orient quotes may experience slower load times or fallback to cached results.',
        action: 'View Orient API status',
        actionLabel: 'View Service',
        services: ['orient-api'],
        metrics: ['Insurer Comparison'],
        isActive: true,
      },
      {
        id: 'corr-ocr-business',
        severity: 'low',
        headline: 'OCR service latency may contribute to Business Details friction',
        detail: 'OCR service P99 at 4.5s with 2.25% error rate. Trade licence upload step showing slight increase in abandonment.',
        action: 'View OCR metrics',
        actionLabel: 'View Service',
        services: ['ocr'],
        metrics: ['Business Details'],
        isActive: true,
      },
    ])
    .onConflictDoNothing();
  console.log('Platform correlations seeded');

  // --- Comms Sequences ---
  // Customer 1 (Mohammed) — renewal sequence
  if (customer1) {
    await db
      .insert(commsSequences)
      .values([
        {customerId: customer1.id, type: 'renewal', dayOffset: -60, channel: 'email', label: 'Renewal reminder — 60 days', isSent: false},
        {customerId: customer1.id, type: 'renewal', dayOffset: -30, channel: 'email', label: 'Renewal reminder — 30 days', isSent: true, sentAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)},
        {customerId: customer1.id, type: 'renewal', dayOffset: -14, channel: 'email', label: 'Renewal reminder — 14 days', isSent: true, sentAt: new Date(now.getTime() - 0 * 24 * 60 * 60 * 1000)},
        {customerId: customer1.id, type: 'renewal', dayOffset: -7, channel: 'whatsapp', label: 'WhatsApp renewal nudge — 7 days', isSent: false},
        {customerId: customer1.id, type: 'renewal', dayOffset: -3, channel: 'whatsapp', label: 'WhatsApp urgent reminder — 3 days', isSent: false},
        {customerId: customer1.id, type: 'renewal', dayOffset: -1, channel: 'email', label: 'Final renewal reminder — 1 day', isSent: false},
        {customerId: customer1.id, type: 'renewal', dayOffset: 0, channel: 'email', label: 'Renewal day — expiry notice', isSent: false},
      ])
      .onConflictDoNothing();
  }

  // Customer 4 (Yusuf) — lapse sequence
  if (customer4) {
    await db
      .insert(commsSequences)
      .values([
        {customerId: customer4.id, type: 'lapse', dayOffset: 1, channel: 'email', label: 'Policy lapsed — reinstatement offer', isSent: true, sentAt: new Date(now.getTime() - 62 * 24 * 60 * 60 * 1000)},
        {customerId: customer4.id, type: 'lapse', dayOffset: 3, channel: 'whatsapp', label: 'WhatsApp lapse follow-up', isSent: true, sentAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)},
        {customerId: customer4.id, type: 'lapse', dayOffset: 14, channel: 'email', label: 'Compliance warning — uninsured', isSent: true, sentAt: new Date(now.getTime() - 49 * 24 * 60 * 60 * 1000)},
        {customerId: customer4.id, type: 'lapse', dayOffset: 30, channel: 'email', label: 'Final outreach — lapsed 30 days', isSent: true, sentAt: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000)},
      ])
      .onConflictDoNothing();
  }
  console.log('Comms sequences seeded');

  // --- Portfolio Alerts ---
  await db
    .insert(portfolioAlerts)
    .values([
      {
        severity: 'critical',
        icon: '🚨',
        title: 'Payment Gateway — Card Tokenisation Errors',
        body: 'Error rate at 4.0%. 8 failed payments in last hour. Checkout conversion down 18%.',
        timeLabel: 'Now',
        customerId: null,
        isPlatform: true,
        isProactive: false,
        signalId: null,
        isRead: false,
      },
      {
        severity: 'high',
        icon: '⚠️',
        title: 'Churn Risk — Dr. Ahmed Khalil (Sunrise Medical)',
        body: 'Renewal in 2 days, churn score 68%, open claim, no response to WhatsApp.',
        timeLabel: '15m ago',
        customerId: customer2?.id ?? null,
        isPlatform: false,
        isProactive: false,
        signalId: null,
        isRead: false,
      },
      {
        severity: 'high',
        icon: '🌧️',
        title: 'Heavy Rain Warning — Proactive Advisory Ready',
        body: '2 customers in affected area. Draft property coverage advisory prepared.',
        timeLabel: '1h ago',
        customerId: null,
        isPlatform: false,
        isProactive: true,
        signalId: 'sig-weather-rain',
        isRead: false,
      },
      {
        severity: 'high',
        icon: '🛡️',
        title: 'CBUAE Cyber Directive — Compliance Deadline',
        body: 'New cyber liability requirement affects 1 tech customer without coverage.',
        timeLabel: '2h ago',
        customerId: null,
        isPlatform: false,
        isProactive: true,
        signalId: 'sig-cyber-cbuae',
        isRead: false,
      },
      {
        severity: 'medium',
        icon: '📋',
        title: 'MOHRE Workers Comp Update',
        body: '2 customers with 45+ employees may need coverage limit increases.',
        timeLabel: '3h ago',
        customerId: null,
        isPlatform: false,
        isProactive: true,
        signalId: 'sig-regulatory-mohre',
        isRead: false,
      },
      {
        severity: 'medium',
        icon: '🔴',
        title: 'Lapsed Policy — Horizon Construction LLC',
        body: 'Policy lapsed 61 days ago. All automated comms exhausted. No response.',
        timeLabel: '4h ago',
        customerId: customer4?.id ?? null,
        isPlatform: false,
        isProactive: false,
        signalId: null,
        isRead: false,
      },
      {
        severity: 'medium',
        icon: '📈',
        title: 'Mid-Term Trigger — Al Baraka Business Growth',
        body: 'Employee count grew past policy limit. Coverage adjustment recommended.',
        timeLabel: '5h ago',
        customerId: customer1?.id ?? null,
        isPlatform: false,
        isProactive: true,
        signalId: 'mt-growth-baraka',
        isRead: false,
      },
      {
        severity: 'low',
        icon: '✅',
        title: 'Orient API Incident Resolved',
        body: '504 timeouts resolved after 4h 15m. 31 quotes were served from cache.',
        timeLabel: '6h ago',
        customerId: null,
        isPlatform: true,
        isProactive: false,
        signalId: null,
        isRead: true,
      },
    ])
    .onConflictDoNothing();
  console.log('Portfolio alerts seeded');

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
