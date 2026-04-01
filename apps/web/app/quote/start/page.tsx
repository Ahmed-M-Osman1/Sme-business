import Link from 'next/link';
import {Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

export default function QuoteStartPage() {
  return (
    <div className="flex flex-col items-center gap-12">
      <ProgressIndicator currentStep={1} totalSteps={4} />

      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text">
          How would you like to start?
        </h1>
        <p className="mt-4 text-text-muted text-lg">
          Choose how you'd like to provide your business information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto px-4 w-full">
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-2xl p-8 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary-light transition-all duration-200"
        >
          <Link href="/quote/details">
            <span className="text-3xl">📝</span>
            <span className="text-lg font-semibold text-text">Fill in Details</span>
            <span className="text-sm text-text-muted">
              Enter your business information manually
            </span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-auto rounded-2xl p-8 flex flex-col items-center gap-4 border-2 hover:border-primary hover:bg-primary-light transition-all duration-200"
        >
          <Link href="/quote/details">
            <span className="text-3xl">📄</span>
            <span className="text-lg font-semibold text-text">Upload Trade License</span>
            <span className="text-sm text-text-muted">
              We'll extract the details for you
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
