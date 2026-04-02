export interface ProductInfo {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  basePrice: number;
}

const COVERAGE_MULTIPLIERS: Record<string, number> = {
  '1M': 1.0,
  '2M': 1.4,
  '5M': 2.0,
};

const SIZE_FACTORS: Record<string, number> = {
  '1': 1.0,
  solo: 1.0,
  '2-5': 1.1,
  '6-20': 1.2,
  '21-50': 1.3,
  '51-100': 1.5,
  '100+': 1.6,
};

export interface PricingInput {
  productIds: string[];
  riskFactor: number;
  sizeFactor?: number;
  coverageLimits?: Record<string, string>;
  insurerMultiplier?: number;
}

export function calculateProductPrice(
  productId: string,
  riskFactor: number,
  sizeFactor: number,
  coverageLimit: string,
  productsMap: Record<string, ProductInfo>,
): number {
  const product = productsMap[productId];
  if (!product) return 0;

  const coverageMultiplier = COVERAGE_MULTIPLIERS[coverageLimit] ?? 1.0;
  return Math.round(
    product.basePrice * riskFactor * sizeFactor * coverageMultiplier,
  );
}

export function calculateTotalPremium(
  input: PricingInput,
  productsMap: Record<string, ProductInfo>,
): number {
  const sizeFactor = input.sizeFactor ?? 1.0;
  const insurerMult = input.insurerMultiplier ?? 1.0;

  return input.productIds.reduce((total, productId) => {
    const limit = input.coverageLimits?.[productId] ?? '1M';
    const price = calculateProductPrice(productId, input.riskFactor, sizeFactor, limit, productsMap);
    return total + Math.round(price * insurerMult);
  }, 0);
}

export function getSizeFactor(employeeBand: string): number {
  return SIZE_FACTORS[employeeBand] ?? 1.0;
}

export function calculateQuarterlyPrice(annualPrice: number): number {
  return Math.round(annualPrice / 4);
}

export function calculateMonthlyPrice(annualPrice: number): number {
  return Math.round(annualPrice / 12);
}

const priceFormatter = new Intl.NumberFormat('en-AE', {
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function formatPriceWithCurrency(amount: number, currency: string, locale: 'en' | 'ar'): string {
  const formatted = formatPrice(amount);
  if (locale === 'ar') {
    return `${formatted} ${currency}`;
  }
  return `${currency} ${formatted}`;
}
