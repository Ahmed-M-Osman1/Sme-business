import type { BrandConfig } from './types';

export const shoryBrand: BrandConfig = {
  id: 'shory',
  displayName: 'Shory',
  tagline: 'Compare and Buy Insurance in the UAE',
  logoPath: '/images/shory-logo.svg',
  logoAlt: 'Shory',

  locations: [
    { label: 'Abu Dhabi', value: 'Abu Dhabi' },
    { label: 'Dubai', value: 'Dubai' },
    { label: 'Sharjah', value: 'Sharjah' },
    { label: 'Ajman', value: 'Ajman' },
    { label: 'Umm Al Quwain', value: 'Umm Al Quwain' },
    { label: 'Ras Al Khaimah', value: 'Ras Al Khaimah' },
    { label: 'Fujairah', value: 'Fujairah' },
  ],
  locationLabel: 'Emirate',
  locationMultipliers: {
    'Abu Dhabi': 1.0,
    Dubai: 1.0,
    Sharjah: 1.0,
    Ajman: 1.0,
    'Umm Al Quwain': 1.0,
    'Ras Al Khaimah': 1.0,
    Fujairah: 1.0,
  },
  defaultLocation: 'Dubai',

  legalReferences: {
    healthInsuranceLaw: 'Health Insurance Law No. 11 of 2013',
    healthAuthority: 'Dubai Health Authority (DHA)',
    economicDept: 'Dubai Department of Economy and Tourism (DET)',
    workersCompLaw: 'Fed. Decree-Law No. 33 / 2021',
    freeZone: 'DIFC',
    freeZoneRequirement: 'Professional Indemnity — Required by DFSA for regulated activities',
    motorLaw: 'UAE Traffic Law',
  },
  compliancePanel: [
    {
      category: 'Legally required — UAE',
      items: [
        { name: 'Workers Compensation', law: 'Fed. Decree-Law No. 33 / 2021' },
        { name: 'Motor Insurance', law: 'UAE Traffic Law' },
      ],
    },
    {
      category: 'Required — Dubai',
      items: [
        { name: 'Employee Health Insurance', law: 'DHA — Health Insurance Law No. 11 of 2013' },
      ],
    },
    {
      category: 'Free zone licence condition — DIFC',
      items: [
        { name: 'Professional Indemnity', law: 'Required by DFSA for regulated activities' },
      ],
    },
  ],

  trustBadges: [
    { label: 'Licensed by the Central Bank of the UAE', icon: 'central-bank' },
  ],
  footerText: 'Shory Insurance Broker LLC. Licensed and regulated by the Central Bank of the UAE.',
  footerCopyright: '© 2026 Shory. All rights reserved.',

  uaePassEnabled: false,
  uaePassMockData: null,

  aiPromptVariant: 'shory',

  metadata: {
    title: 'Shory — Compare and Buy Insurance in the UAE',
    description: 'Top insurers. Best prices. One app. Get instant insurance quotes from leading insurers.',
  },

  navStyle: 'light',
  issuingAuthorities: ['DET', 'DHA', 'DIFC', 'ADGM', 'ADDED', 'ADAFZA', 'RAKEZ', 'SAIF Zone', 'JAFZA'],
};
