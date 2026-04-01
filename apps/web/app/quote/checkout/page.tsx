'use client';

import {Suspense} from 'react';
import {Checkout} from '@/components/quote/checkout';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <Checkout />
    </Suspense>
  );
}
