export function TrustBadges() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {/* Central Bank Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
            <span className="text-lg">🏛️</span>
          </div>
          <div className="text-left">
            <p className="text-xs text-text-muted leading-tight">
              Licensed by the
            </p>
            <p className="text-xs text-text-muted leading-tight">
              Central Bank with
            </p>
            <p className="text-xs text-text-muted leading-tight">
              License Number 287
            </p>
          </div>
        </div>

        {/* Google Rating */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-text-muted">G</span>
          <div className="text-left">
            <p className="text-xs font-semibold text-text">Google Rating</p>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-text">4.9</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-text-muted">
              More than 10,000 reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
