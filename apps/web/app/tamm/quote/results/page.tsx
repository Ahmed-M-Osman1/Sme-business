'use client';

import {Suspense} from 'react';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import {QuoteResults} from '@/components/quote/quote-results';

export default function TammQuoteResultsPage() {
  return (
    <TammPageLayout currentStep={3}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <QuoteResults />
      </Suspense>
    </TammPageLayout>
  );
}
