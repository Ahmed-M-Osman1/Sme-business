import type {PricingProvider, QuoteInput, PricingResult} from '../types';

const INDUSTRY_RISK: Record<string, number> = {
  Technology: 0.8,
  Trading: 1.0,
  Manufacturing: 1.3,
  Construction: 1.5,
  Healthcare: 1.1,
  Hospitality: 1.0,
  Retail: 0.9,
  'Professional Services': 0.85,
  'Transport & Logistics': 1.4,
  Other: 1.0,
};

const COVERAGE_BASE: Record<string, number> = {
  property: 8400,
  liability: 6000,
  'workers-compensation': 4800,
  fleet: 9600,
  comprehensive: 14400,
};

const EMIRATE_FACTOR: Record<string, number> = {
  Dubai: 1.15,
  'Abu Dhabi': 1.1,
  Sharjah: 1.0,
  Ajman: 0.95,
  'Umm Al Quwain': 0.9,
  'Ras Al Khaimah': 0.92,
  Fujairah: 0.9,
};

function getSizeFactor(count: number): number {
  if (count <= 1) return 0.6;
  if (count <= 5) return 0.8;
  if (count <= 20) return 1.0;
  if (count <= 50) return 1.3;
  if (count <= 100) return 1.6;
  return 2.0;
}

function calculatePremium(input: QuoteInput, priceMultiplier: number): number {
  const base = COVERAGE_BASE[input.coverageType] ?? 6000;
  const risk = INDUSTRY_RISK[input.industry] ?? 1.0;
  const emirate = EMIRATE_FACTOR[input.emirate] ?? 1.0;
  const size = getSizeFactor(input.employeesCount);
  return Math.round(base * risk * emirate * size * priceMultiplier);
}

function createMockProvider(
  id: string,
  name: string,
  priceMultiplier: number,
  deductibleRate: number,
  coverageMultiplier: number,
): PricingProvider {
  return {
    id,
    name,
    async getQuote(input: QuoteInput): Promise<PricingResult> {
      const annualPremium = calculatePremium(input, priceMultiplier);
      return {
        providerId: id,
        providerName: name,
        annualPremium,
        monthlyPremium: Math.round(annualPremium / 12),
        coverageAmount: annualPremium * coverageMultiplier,
        deductible: Math.round(annualPremium * deductibleRate),
        benefits: {
          medicalCoverage: true,
          legalExpenses: annualPremium > 8000,
          businessInterruption: annualPremium > 10000,
          cyberLiability: input.industry === 'Technology',
        },
      };
    },
  };
}

export const mockProviders: PricingProvider[] = [
  createMockProvider('salama', 'Salama Insurance', 1.0, 0.05, 10),
  createMockProvider('watania', 'Watania Takaful', 1.023, 0.04, 11),
  createMockProvider('orient', 'Orient Insurance', 1.218, 0.03, 14),
];
