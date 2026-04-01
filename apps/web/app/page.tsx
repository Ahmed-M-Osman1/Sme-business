import {Hero} from '@/components/landing/hero';
import {ProductCards} from '@/components/landing/product-cards';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <ProductCards />
    </main>
  );
}
