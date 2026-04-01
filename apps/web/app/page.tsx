import {Hero} from '@/components/landing/hero';
import {ProductCards} from '@/components/landing/product-cards';
import {TrustBadges} from '@/components/landing/trust-badges';
import {StatsSection} from '@/components/landing/stats-section';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustBadges />
      <ProductCards />
      <StatsSection />
    </main>
  );
}
