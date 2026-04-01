import products from '@/config/products.json';

type ProductId = keyof typeof products;

const COVERAGE_MULTIPLIERS: Record<string, number> = {
  '1M': 1.0,
  '2M': 1.4,
  '5M': 2.0,
};

const SIZE_FACTORS: Record<string, number> = {
  '1': 1.0,
  '2-5': 1.1,
  '6-10': 1.2,
  '11-25': 1.3,
  '26-50': 1.4,
  '51-100': 1.5,
  '100+': 1.6,
};

export interface PricingInput {
  productIds: ProductId[];
  riskFactor: number;
  sizeFactor?: number;
  coverageLimits?: Record<string, string>;
  insurerMultiplier?: number;
}

export function calculateProductPrice(
  productId: ProductId,
  riskFactor: number,
  sizeFactor: number,
  coverageLimit: string,
): number {
  const product = products[productId];
  if (!product) return 0;

  const coverageMultiplier = COVERAGE_MULTIPLIERS[coverageLimit] ?? 1.0;
  return Math.round(
    product.basePrice * riskFactor * sizeFactor * coverageMultiplier,
  );
}

export function calculateTotalPremium(input: PricingInput): number {
  const sizeFactor = input.sizeFactor ?? 1.0;
  const insurerMult = input.insurerMultiplier ?? 1.0;

  return input.productIds.reduce((total, productId) => {
    const limit = input.coverageLimits?.[productId] ?? '1M';
    const price = calculateProductPrice(productId, input.riskFactor, sizeFactor, limit);
    return total + Math.round(price * insurerMult);
  }, 0);
}

export function getSizeFactor(employeeBand: string): number {
  return SIZE_FACTORS[employeeBand] ?? 1.0;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('en-AE');
}
