'use client';

import {createContext, useContext} from 'react';
import type {BrandConfig} from './types';
import {shoryBrand} from './shory';

const BrandContext = createContext<BrandConfig>(shoryBrand);

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandConfig;
  children: React.ReactNode;
}) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandConfig {
  return useContext(BrandContext);
}
