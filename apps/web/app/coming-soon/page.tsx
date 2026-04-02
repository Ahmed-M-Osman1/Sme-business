'use client';

import Link from 'next/link';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

export default function ComingSoonPage() {
  const {t} = useI18n();

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-4xl">🚀</span>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          {t.common.comingSoon}
        </h1>
        <p className="mt-2 text-text-muted max-w-md mx-auto">
          {t.common.comingSoonDesc}
        </p>
      </div>
      <Button
        asChild
        className="rounded-full bg-primary text-white px-8 py-3 font-semibold hover:bg-primary/90 transition-all duration-200"
      >
        <Link href="/">{t.common.backToHome}</Link>
      </Button>
    </div>
  );
}
