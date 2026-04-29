'use client';

import {Suspense} from 'react';
import {TammPageLayout} from '@/components/quote/tamm-page-layout';
import {TammConfirmation} from '@/components/quote/tamm-confirmation';

export default function TammConfirmationPage() {
  return (
    <TammPageLayout currentStep={6}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#009688] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TammConfirmation />
      </Suspense>
    </TammPageLayout>
  );
}
