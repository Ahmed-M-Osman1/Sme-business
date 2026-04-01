import Link from 'next/link';
import {Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import businessTypes from '@/config/business-types.json';
import products from '@/config/products.json';

const RISK_BADGE_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

type ProductId = keyof typeof products;

export default function BusinessTypePage() {
  return (
    <div className="flex flex-col gap-8">
      <ProgressIndicator
        currentStep={2}
        totalSteps={6}
        label="Business type"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          What type of business?
        </h1>
        <p className="mt-2 text-text-muted">
          Select your type — we'll pre-configure your cover instantly.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-3">
        {businessTypes.map((bt) => (
          <Link
            key={bt.id}
            href={`/quote/results?type=${bt.id}`}
          >
            <Card className="rounded-2xl border border-border bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-2xl shrink-0">
                  {bt.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text text-sm sm:text-base">
                      {bt.title}
                    </span>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        RISK_BADGE_STYLES[bt.riskLevel]
                      }`}
                    >
                      {bt.riskLevel} risk
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                    {bt.description}
                  </p>
                  {/* Product chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {bt.products.map((productId) => {
                      const product = products[productId as ProductId];
                      if (!product) return null;
                      return (
                        <span
                          key={productId}
                          className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-surface text-text-muted rounded-full px-2 py-0.5"
                        >
                          <span>{product.icon}</span>
                          <span>{product.shortName}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Chevron */}
                <span className="text-text-muted text-lg shrink-0">›</span>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Fallback: not listed */}
        <Link href="/quote/manual">
          <Card className="rounded-2xl border-2 border-dashed border-border bg-white hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="flex items-center justify-center gap-2 p-4 sm:p-5">
              <span className="text-sm font-medium text-text">
                My business type isn't listed
              </span>
              <span className="text-sm text-text-muted">
                — fill in manually
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
