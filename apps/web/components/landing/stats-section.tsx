const STATS = [
  {
    value: '50B+',
    label: 'worth of assets insured',
    sublabel: 'for residential, commercial and industrial properties',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M9 8h1" />
        <path d="M9 12h1" />
        <path d="M9 16h1" />
        <path d="M14 8h1" />
        <path d="M14 12h1" />
        <path d="M14 16h1" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      </svg>
    ),
  },
  {
    value: '3B+',
    label: 'worth of marine fleets',
    sublabel: 'insured, some of them being the largest',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
        <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
        <path d="M12 1v4" />
      </svg>
    ),
  },
  {
    value: '#1',
    label: 'insurance app',
    sublabel: 'on the UAE App Store and Play Store',
    icon: (
      <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
] as const;

export function StatsSection() {
  return (
    <section className="bg-gray-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          Trusted by over 1 million customers.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-500">
          We bring you leading insurers, great prices, and instant cover, all in
          one seamless app.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.value}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                {stat.icon}
              </div>
              <p className="text-4xl font-bold text-gray-900 sm:text-5xl">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {stat.label}
              </p>
              <p className="text-xs leading-relaxed text-gray-500">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
