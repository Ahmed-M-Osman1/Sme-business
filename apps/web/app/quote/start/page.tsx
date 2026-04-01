import Link from 'next/link';
import {Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

const INPUT_METHODS = [
  {
    id: 'pre-configured',
    icon: '⚡',
    iconBg: 'bg-primary text-white',
    title: 'Select a pre-configured business',
    description:
      'Choose from common UAE business types — instant quote, no forms',
    badge: {label: 'Fastest', className: 'bg-green-100 text-green-700'},
    href: '/quote/business-type',
    highlighted: true,
  },
  {
    id: 'upload',
    icon: '📄',
    iconBg: 'bg-surface text-text',
    title: 'Upload trade licence',
    description:
      'We read your document and pre-fill everything automatically',
    badge: null,
    href: '/quote/upload',
    highlighted: false,
  },
  {
    id: 'ai-advisor',
    icon: '🤖',
    iconBg: 'bg-surface text-text',
    title: 'AI Advisor',
    description:
      'Describe your business in plain English — AI handles the rest',
    badge: {label: 'Recommended', className: 'bg-blue-100 text-blue-700'},
    href: '/quote/ai-advisor',
    highlighted: false,
  },
  {
    id: 'manual',
    icon: '✏️',
    iconBg: 'bg-surface text-text',
    title: 'Fill in manually',
    description: 'Step-by-step form with smart auto-fill',
    badge: null,
    href: '/quote/manual',
    highlighted: false,
  },
] as const;

export default function QuoteStartPage() {
  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator currentStep={1} totalSteps={6} label="Choose method" />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          How would you like to start?
        </h1>
        <p className="mt-2 text-text-muted">
          Get insured in under 3 minutes
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-3">
        {INPUT_METHODS.map((method) => (
          <Link key={method.id} href={method.href}>
            <Card
              className={`rounded-2xl border bg-white hover:shadow-md transition-all duration-200 cursor-pointer ${
                method.highlighted
                  ? 'border-primary shadow-sm'
                  : 'border-border shadow-sm'
              }`}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${method.iconBg}`}
                >
                  {method.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text text-sm sm:text-base">
                      {method.title}
                    </span>
                    {method.badge && (
                      <Badge
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${method.badge.className}`}
                      >
                        {method.badge.label}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted mt-0.5 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                {/* Chevron */}
                <span className="text-text-muted text-lg shrink-0">›</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
