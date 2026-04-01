import {Badge} from '@shory/ui';

export function TrustBadges() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
        <Badge
          variant="outline"
          className="rounded-full px-4 py-2 text-sm border-border text-text-muted"
        >
          Licensed by the Central Bank
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-lg">★</span>
          <span className="text-sm font-medium text-text">4.9</span>
          <span className="text-sm text-text-muted">from 10,000+ reviews</span>
        </div>
      </div>
    </section>
  );
}
