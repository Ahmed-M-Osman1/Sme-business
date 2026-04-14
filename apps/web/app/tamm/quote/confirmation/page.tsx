'use client';

import {Suspense} from 'react';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import ShoryPage from '@/app/quote/confirmation/page';

export default function TammConfirmationPage() {
  return (
    <TammPageLayout currentStep={6}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ShoryPage />
      </Suspense>
    </TammPageLayout>
  );
}
