module.exports = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',

  ROUTES: {
    HOME: '/',
    QUOTE_START: '/quote/start',
    AI_ADVISOR: '/quote/ai-advisor',
    BUSINESS_TYPE: '/quote/business-type',
    MANUAL: '/quote/manual',
    UPLOAD: '/quote/upload',
    RESULTS: '/quote/results',
    COMPANY_DETAILS: '/quote/company-details',
    CHECKOUT: '/quote/checkout',
    CONFIRMATION: '/quote/confirmation',
  },

  EMPLOYEES: {
    JUST_ME: 'Just me',
    TWO_TO_FIVE: '2-5',
    SIX_TO_TWENTY: '6-20',
    TWENTY_ONE_TO_FIFTY: '21-50',
    FIFTY_ONE_TO_HUNDRED: '51-100',
    HUNDRED_PLUS: '100+',
  },

  REVENUE: {
    UNDER_500K: 'Under AED 500,000',
    FIVE_HUNDRED_K_TO_1M: 'AED 500K – 1 million',
    ONE_M_TO_5M: 'AED 1M – 5 million',
    FIVE_M_TO_10M: 'AED 5M – 10 million',
    OVER_10M: 'Over AED 10 million',
  },

  EMIRATES: [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Ras Al Khaimah',
    'Fujairah',
    'Umm Al Quwain',
    'DIFC',
    'ADGM',
  ],

  BUSINESS_TYPES: [
    { id: 'cafe-restaurant', title: 'Café / Restaurant', risk: 'medium' },
    { id: 'law-firm', title: 'Law Firm / Legal', risk: 'medium' },
    { id: 'retail-trading', title: 'Retail / Trading', risk: 'medium' },
    { id: 'it-technology', title: 'IT / Technology', risk: 'low' },
    { id: 'construction', title: 'Construction / Contracting', risk: 'high' },
    { id: 'healthcare', title: 'Healthcare / Clinic', risk: 'high' },
    { id: 'consulting', title: 'Consulting / Advisory', risk: 'medium' },
    { id: 'general-trading', title: 'General Trading', risk: 'medium' },
    { id: 'logistics', title: 'Logistics / Transport', risk: 'high' },
    { id: 'real-estate', title: 'Real Estate', risk: 'medium' },
  ],

  FEATURED_TYPES: ['cafe-restaurant', 'retail-trading', 'it-technology'],

  STEP_LABELS: {
    CHOOSE_METHOD: 'Step 1 of 6',
    BUSINESS_DETAILS: 'Step 2 of 6',
    RESULTS: 'Step 4 of 6',
    COMPANY: 'Step 5 of 6',
    CHECKOUT: 'Step 6 of 6',
  },
};
