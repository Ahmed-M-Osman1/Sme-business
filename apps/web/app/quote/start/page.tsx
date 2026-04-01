import Link from 'next/link';
import {Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

const FEATURED = {
  id: 'pre-configured',
  icon: '⚡',
  title: 'Select a pre-configured business',
  description: 'Choose from 8 UAE business types — instant quote, no forms',
  badge: {label: 'Fastest', className: 'bg-green-100 text-green-700'},
  href: '/quote/business-type',
} as const;

const OTHER_METHODS = [
  {
    id: 'ai-advisor',
    icon: '🤖',
    title: 'AI Advisor',
    description:
      'Describe your business in plain English — AI handles the rest',
    badge: {label: 'Recommended', className: 'bg-blue-100 text-blue-700'},
    href: '/quote/ai-advisor',
  },
  {
    id: 'upload',
    icon: '📄',
    title: 'Upload trade licence',
    description:
      'Claude Vision reads your document and pre-fills everything',
    badge: null,
    href: '/quote/upload',
  },
  {
    id: 'manual',
    icon: '✏️',
    title: 'Fill in manually',
    description: 'Step-by-step form with smart auto-fill',
    badge: null,
    href: '/quote/manual',
  },
] as const;

export default function QuoteStartPage() {
  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator currentStep={1} label="Choose method" />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          How would you like to start?
        </h1>
        <p className="mt-2 text-text-muted">
          Get insured in under 3 minutes
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-4">
        {/* Featured card — full width, prominent */}
        <Link href={FEATURED.href}>
          <Card className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-white hover:shadow-lg transition-all duration-200 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-5 sm:p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {FEATURED.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-text text-base sm:text-lg">
                    {FEATURED.title}
                  </span>
                  <Badge
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${FEATURED.badge.className}`}
                  >
                    {FEATURED.badge.label}
                  </Badge>
                </div>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  {FEATURED.description}
                </p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-primary shrink-0"
              >
                <path
                  d="M7.5 4.167L13.333 10L7.5 15.833"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </CardContent>
          </Card>
        </Link>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-muted">or choose another way</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Other methods — 3-column grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {OTHER_METHODS.map((method) => (
            <Link key={method.id} href={method.href}>
              <Card className="rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer h-full">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0">
                      {method.icon}
                    </div>
                    {method.badge && (
                      <Badge
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${method.badge.className}`}
                      >
                        {method.badge.label}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-text text-sm leading-tight">
                      {method.title}
                    </span>
                    <p className="text-[11px] sm:text-xs text-text-muted mt-1 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
