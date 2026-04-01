import {Button} from '@shory/ui';

export function CtaSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* Image placeholder */}
        <div className="flex-1 w-full max-w-lg">
          <div className="w-full aspect-[4/3] rounded-2xl bg-surface flex items-center justify-center">
            <span className="text-6xl">🏠🚗👨‍👩‍👧</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
            Buy Insurance Online
          </h2>
          <p className="mt-4 text-sm text-text-muted leading-relaxed max-w-md">
            We&apos;re here for you every step of the way to help you find your
            ideal insurance plan. Whether you&apos;re getting insurance or
            filing claims, Shory is with you to meet your personal and business
            insurance requirements. You can use our website and app to explore
            personal insurance options or drop us an email at{' '}
            <a
              href="mailto:corporate@shory.com"
              className="text-primary hover:underline"
            >
              corporate@shory.com
            </a>{' '}
            for corporate insurance and we&apos;ll get in touch with you.
          </p>
          <Button
            size="lg"
            className="mt-6 rounded-full bg-primary text-white px-8 text-sm font-medium hover:bg-primary-hover transition-all duration-200"
          >
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
}
