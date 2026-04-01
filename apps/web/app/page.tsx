import {Hero} from '@/components/landing/hero';
import {TrustBadges} from '@/components/landing/trust-badges';
import {StatsSection} from '@/components/landing/stats-section';
import {CtaSection} from '@/components/landing/cta-section';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBadges />
      <StatsSection />
      <CtaSection />
    </main>
  );
}
