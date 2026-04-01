const STATS = [
  {
    icon: '🏢',
    value: '50B+',
    label: 'worth of assets insured',
    sublabel: 'for residential, commercial\nand industrial properties',
  },
  {
    icon: '🚢',
    value: '3B+',
    label: 'worth of marine fleets',
    sublabel: 'insured, some of them being\nthe largest',
  },
  {
    icon: '📱',
    value: '#1',
    label: 'insurance app',
    sublabel: 'on the UAE App Store and\nPlay Store',
  },
] as const;

export function StatsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text">
          Trusted by over 1 million customers.
        </h2>
        <p className="mt-4 text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
          Get instant insurance quotes from leading insurers, compare great
          prices, and enjoy instant coverage, all in one seamless app.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-4xl sm:text-5xl font-bold text-text">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-text">{stat.label}</p>
              <p className="text-xs text-text-muted whitespace-pre-line leading-relaxed">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
