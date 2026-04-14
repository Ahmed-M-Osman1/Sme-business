import type { BrandConfig, BrandId } from './types';
import { shoryBrand } from './shory';
import { tammBrand } from './tamm';

const BRANDS: Record<BrandId, BrandConfig> = {
  shory: shoryBrand,
  tamm: tammBrand,
};

function resolveBrandId(): BrandId {
  const env = process.env.NEXT_PUBLIC_BRAND;
  if (env === 'tamm') return 'tamm';
  return 'shory';
}

let cached: BrandConfig | null = null;

export function getBrand(): BrandConfig {
  if (!cached) {
    cached = BRANDS[resolveBrandId()];
  }
  return cached;
}

export function isTamm(): boolean {
  return resolveBrandId() === 'tamm';
}

export type {
  BrandConfig,
  BrandId,
  LocationOption,
  TrustBadge,
  LegalReferences,
  UaePassMockData,
  ComplianceItem,
} from './types';
