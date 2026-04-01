const STATS = [
  {value: '50B+', label: 'Worth of assets insured'},
  {value: '3B+', label: 'Worth of fleets insured'},
  {value: '#1', label: 'Insurance app in the UAE'},
] as const;

export function StatsSection() {
  return (
    <section className="py-12 border-y border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl sm:text-4xl font-bold text-primary">
              {stat.value}
            </p>
            <p className="text-text-muted text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
