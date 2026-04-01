export interface QuoteInput {
  industry: string;
  businessType: string | null;
  employeesCount: number;
  emirate: string;
  coverageType: string;
}

export interface PricingResult {
  providerId: string;
  providerName: string;
  monthlyPremium: number;
  annualPremium: number;
  coverageAmount: number;
  deductible: number;
  benefits: Record<string, unknown>;
}

export interface PricingProvider {
  id: string;
  name: string;
  getQuote(input: QuoteInput): Promise<PricingResult>;
}
