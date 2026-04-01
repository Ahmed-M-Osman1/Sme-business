import Link from 'next/link';
import {Button} from '@shory/ui';

export function Hero() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text tracking-tight">
          Get SME Insurance in Minutes
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Compare quotes from top UAE insurers. Protect your business with
          property, liability, and workforce coverage — all in one place.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-primary text-white rounded-xl px-8 py-3 text-base font-medium hover:opacity-80 transition-all duration-200"
          >
            <Link href="/quote/start">Start Quote</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl px-8 py-3 text-base border-primary text-primary hover:bg-primary-light transition-all duration-200"
          >
            <Link href="#products">Explore Coverage</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
