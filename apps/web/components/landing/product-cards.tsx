import {Card, CardContent} from '@shory/ui';

const PRODUCTS = [
  {
    title: 'Property Insurance',
    description: 'Protect your office, warehouse, and business assets.',
    icon: '🏢',
  },
  {
    title: 'Liability Insurance',
    description: 'Cover third-party claims and legal costs.',
    icon: '🛡️',
  },
  {
    title: "Workers' Compensation",
    description: 'Mandatory coverage for your employees.',
    icon: '👷',
  },
  {
    title: 'Fleet Insurance',
    description: 'Insure your business vehicles under one policy.',
    icon: '🚛',
  },
  {
    title: 'Comprehensive',
    description: 'All-in-one coverage for complete protection.',
    icon: '✅',
  },
] as const;

export function ProductCards() {
  return (
    <section id="products" className="py-16 sm:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text text-center mb-12">
          Insurance for Every Business Need
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {PRODUCTS.map((product) => (
            <Card
              key={product.title}
              className="rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 text-center cursor-pointer group bg-white"
            >
              <CardContent className="flex flex-col items-center gap-4 p-6">
                <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                  {product.icon}
                </div>
                <h3 className="font-semibold text-text text-sm sm:text-base">
                  {product.title}
                </h3>
                <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
