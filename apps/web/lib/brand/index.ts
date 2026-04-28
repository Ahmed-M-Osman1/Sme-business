import type {BrandConfig, BrandId} from './types';
import {shoryBrand} from './shory';
import {tammBrand} from './tamm';

export const BRANDS: Record<BrandId, BrandConfig> = {
  shory: shoryBrand,
  tamm: tammBrand,
};

/** Server-side brand resolution — reads from a passed brand ID */
export function getBrandById(id: BrandId): BrandConfig {
  return BRANDS[id] ?? shoryBrand;
}

/** Legacy: resolves brand from env var. Prefer useBrand() in client components. */
export function getBrand(): BrandConfig {
  const env = process.env.NEXT_PUBLIC_BRAND;
  if (env === 'tamm') return tammBrand;
  return shoryBrand;
}

export function isTamm(): boolean {
  return process.env.NEXT_PUBLIC_BRAND === 'tamm';
}

export {BrandProvider, useBrand} from './context';
export type {
  BrandConfig,
  BrandId,
  LocationOption,
  TrustBadge,
  LegalReferences,
  UaePassMockData,
  ComplianceItem,
} from './types';
