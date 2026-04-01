'use client';

import {Suspense} from 'react';
import {QuoteResults} from '@/components/quote/quote-results';

export default function QuoteResultsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading quotes...</div>}>
      <QuoteResults />
    </Suspense>
  );
}
