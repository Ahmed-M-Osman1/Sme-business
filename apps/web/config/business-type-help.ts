/**
 * Contextual help info for each business type.
 * Shown as a subtle info section when a business type card is selected.
 */

interface BusinessTypeHelp {
  recommendedCovers: string[];
  typicalEmployees: string;
  annualRevenue: string;
  coverageArea: string;
  highValueAssets: boolean;
}

export const BUSINESS_TYPE_HELP: Record<string, BusinessTypeHelp> = {
  'cafe-restaurant': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Property'],
    typicalEmployees: '6-20',
    annualRevenue: 'AED 500,000 - 5,000,000',
    coverageArea: 'UAE only',
    highValueAssets: true,
  },
  'law-firm': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Professional Indemnity'],
    typicalEmployees: '2-20',
    annualRevenue: 'AED 1,000,000 - 10,000,000',
    coverageArea: 'GCC',
    highValueAssets: false,
  },
  'retail-trading': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Property'],
    typicalEmployees: '2-50',
    annualRevenue: 'AED 500,000 - 5,000,000',
    coverageArea: 'UAE only',
    highValueAssets: true,
  },
  'it-technology': {
    recommendedCovers: ["Workers' Comp", 'Professional Indemnity'],
    typicalEmployees: '2-20',
    annualRevenue: 'AED 500,000 - 10,000,000',
    coverageArea: 'Worldwide',
    highValueAssets: false,
  },
  'construction': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Property', 'Professional Indemnity'],
    typicalEmployees: '21-100+',
    annualRevenue: 'AED 5,000,000 - 10,000,000+',
    coverageArea: 'UAE only',
    highValueAssets: true,
  },
  'healthcare': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Professional Indemnity', 'Property'],
    typicalEmployees: '6-50',
    annualRevenue: 'AED 1,000,000 - 10,000,000',
    coverageArea: 'UAE only',
    highValueAssets: true,
  },
  'consulting': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Professional Indemnity'],
    typicalEmployees: '2-20',
    annualRevenue: 'AED 500,000 - 5,000,000',
    coverageArea: 'GCC',
    highValueAssets: false,
  },
  'general-trading': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Property'],
    typicalEmployees: '2-50',
    annualRevenue: 'AED 1,000,000 - 10,000,000',
    coverageArea: 'GCC',
    highValueAssets: true,
  },
  'logistics': {
    recommendedCovers: ["Workers' Comp", 'Property', 'Fleet'],
    typicalEmployees: '6-100+',
    annualRevenue: 'AED 1,000,000 - 10,000,000+',
    coverageArea: 'UAE only',
    highValueAssets: true,
  },
  'real-estate': {
    recommendedCovers: ["Workers' Comp", 'Public Liability', 'Professional Indemnity'],
    typicalEmployees: '2-20',
    annualRevenue: 'AED 1,000,000 - 10,000,000',
    coverageArea: 'UAE only',
    highValueAssets: false,
  },
};
