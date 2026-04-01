import {Button} from '@shory/ui';

export function PromoBanner() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-text leading-tight">
              Every pet
              <br />
              has a{' '}
              <span className="bg-text text-white px-2 py-0.5 rounded">
                story
              </span>{' '}
              <span className="font-black italic">Shory.</span>
            </h2>
            <p className="mt-3 text-sm text-text-muted">
              What&apos;s your pet&apos;s story?
              <br />
              Share it for a chance to win a 2026 Mercedes.
            </p>
            <Button
              size="sm"
              className="mt-4 rounded-full bg-primary text-white px-6 text-sm font-medium hover:bg-primary-hover transition-all duration-200"
            >
              Learn more
            </Button>
          </div>
          {/* Image placeholder */}
          <div className="w-64 h-40 rounded-lg bg-white flex items-center justify-center shrink-0">
            <span className="text-5xl">🎁🐾📸</span>
          </div>
        </div>
        <div className="text-right mt-2">
          <span className="text-[10px] text-text-muted underline cursor-pointer">
            T&amp;Cs apply
          </span>
        </div>
      </div>
    </section>
  );
}
