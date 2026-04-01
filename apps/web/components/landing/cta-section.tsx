import Link from 'next/link';
import {Button} from '@shory/ui';

export function CtaSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:px-8">
        {/* Illustration placeholder */}
        <div className="w-full max-w-lg flex-1">
          <div className="flex aspect-4/3 w-full items-center justify-center rounded-3xl bg-linear-to-br from-blue-50 to-blue-100">
            <svg
              className="h-32 w-32 text-primary opacity-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Buy Insurance Online
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
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
            asChild
            size="lg"
            className="mt-6 rounded-full bg-primary px-8 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-hover"
          >
            <Link href="/quote/start">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
