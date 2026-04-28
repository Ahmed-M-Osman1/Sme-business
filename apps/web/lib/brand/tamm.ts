import type { BrandConfig } from './types';

export const tammBrand: BrandConfig = {
  id: 'tamm',
  displayName: 'TAMM Business Insurance',
  tagline: 'Abu Dhabi SME Insurance',
  logoPath: '/images/tamm-logo.svg',
  logoAlt: 'TAMM — Abu Dhabi Government',

  locations: [
    { label: 'Abu Dhabi City', value: 'Abu Dhabi City' },
    { label: 'Al Ain', value: 'Al Ain' },
    { label: 'Al Dhafra', value: 'Al Dhafra' },
    { label: 'ADGM', value: 'ADGM' },
    { label: 'Musaffah', value: 'Musaffah' },
    { label: 'Abu Dhabi Airport Free Zone', value: 'Abu Dhabi Airport Free Zone' },
  ],
  locationLabel: 'Location',
  locationMultipliers: {
    'Abu Dhabi City': 1.0,
    'Al Ain': 0.97,
    'Al Dhafra': 0.95,
    ADGM: 1.12,
    Musaffah: 0.98,
    'Abu Dhabi Airport Free Zone': 1.05,
  },
  defaultLocation: 'Abu Dhabi City',

  legalReferences: {
    healthInsuranceLaw: 'Health Finance Law No. 23 of 2005',
    healthAuthority: 'Department of Health — Abu Dhabi (DOH)',
    economicDept: 'Abu Dhabi Department of Economic Development (ADDED)',
    workersCompLaw: 'Fed. Decree-Law No. 33 / 2021',
    freeZone: 'ADGM',
    freeZoneRequirement: 'Professional Indemnity — Required by FSRA for regulated activities',
    motorLaw: 'UAE Traffic Law',
  },
  healthInsuranceMandatoryLocations: ['*'],
  compliancePanel: [
    {
      category: 'Legally required — Abu Dhabi',
      items: [
        { name: 'Workers Compensation', law: 'Fed. Decree-Law No. 33 / 2021' },
        { name: 'Motor Insurance', law: 'UAE Traffic Law' },
      ],
    },
    {
      category: 'Required — Abu Dhabi',
      items: [
        { name: 'Employee Health Insurance', law: 'DOH — Health Finance Law No. 23 of 2005' },
      ],
    },
    {
      category: 'Free zone licence condition — ADGM',
      items: [
        { name: 'Professional Indemnity', law: 'Required by FSRA for regulated activities' },
      ],
    },
  ],

  trustBadges: [
    { label: 'Abu Dhabi Department of Economic Development', icon: 'added' },
    { label: 'UAE Insurance Authority', icon: 'uae-ia' },
  ],
  footerText: 'Powered by TAMM — Abu Dhabi Government',
  footerCopyright: '© 2026 TAMM. Abu Dhabi Government. All rights reserved.',

  uaePassEnabled: true,
  uaePassMockData: {
    businessName: 'Al Mansoori Legal Consultancy',
    licenceNumber: 'CN-1234567',
    activity: 'Legal consultancy',
    location: 'ADGM',
    legalForm: 'Free Zone Establishment',
    ownerName: 'Fatima Al Mansoori',
    emiratesId: '784-1990-1234567-1',
    employees: '6-20',
    revenue: '1m-5m',
    businessType: 'law-firm',
    businessLabel: 'Law Firm / Legal',
  },

  aiPromptVariant: 'tamm',

  metadata: {
    title: 'TAMM — Abu Dhabi SME Business Insurance',
    description: 'Get your Abu Dhabi SME covered in minutes. Workers Compensation, Liability, Property and more.',
  },

  navStyle: 'dark',
  issuingAuthorities: ['ADDED', 'ADGM', 'ADAFZA', 'ADAFZ'],
  basePath: '/tamm',
};
