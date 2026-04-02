import {db} from './client';
import {adminUsers} from './schema/admin-users';
import {businessTypes} from './schema/business-types';
import {products} from './schema/products';
import {insurers} from './schema/insurers';
import {quoteOptions} from './schema/quote-options';
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

  console.log('\nSeed complete!');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
