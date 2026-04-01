'use client';

import {Suspense} from 'react';
import {Confirmation} from '@/components/quote/confirmation';

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
      <Confirmation />
    </Suspense>
  );
}
