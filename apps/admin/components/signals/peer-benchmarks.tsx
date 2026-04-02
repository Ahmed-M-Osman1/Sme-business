'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {AiBadge} from '@/components/shared/ai-badge';
import {Tag} from '@/components/shared/tag';
import type {PeerBenchmark} from '@shory/db';

interface PeerBenchmarksProps {
  benchmarks: PeerBenchmark[];
}

export function PeerBenchmarks({benchmarks}: PeerBenchmarksProps) {
  const {t} = useI18n();
  const [sentBenchmarks, setSentBenchmarks] = useState<Set<string>>(new Set());

  function handleSendInsight(benchmarkId: string) {
    setSentBenchmarks((prev) => new Set(prev).add(benchmarkId));
  }

  if (benchmarks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-400">
        {t.signals.noBenchmarks}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI explanation box */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <AiBadge label={t.signals.howThisWorks} />
        </div>
        <p className="text-sm text-indigo-700 leading-relaxed">
          {t.signals.howPeerBenchmarksWork}
        </p>
      </div>

      {/* Benchmark cards */}
      <div className="space-y-4">
        {benchmarks.map((benchmark) => {
          const isSent = sentBenchmarks.has(benchmark.id);

          return (
            <div
              key={benchmark.id}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Header: headline + badges */}
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-900 flex-1 min-w-0">
                  {benchmark.headline}
                </h3>
                {benchmark.trendingProduct && (
                  <Tag label={benchmark.trendingProduct} variant="purple" />
                )}
              </div>

              {/* Segment + employee band + customer count */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                <span>
                  {t.signals.benchmarkCategory}: {benchmark.category}
                </span>
                <span>
                  {t.signals.benchmarkEmployeeBand}: {benchmark.employeeBand}
                </span>
                <span>
                  {t.signals.relevantCustomers}: {benchmark.relevantCustomers.length}
                </span>
              </div>

              {/* Product adoption bars */}
              <div className="space-y-2.5 mb-4">
                {benchmark.data.map((item) => {
                  const isTrending = benchmark.trendingProduct === item.product;
                  const barColor = isTrending
                    ? 'bg-violet-500'
                    : item.pct > 0
                      ? 'bg-green-500'
                      : 'bg-gray-300';

                  return (
                    <div key={item.product}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-slate-700">{item.product}</span>
                        <span className="text-xs font-mono text-slate-500">{item.pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                          style={{width: `${Math.max(item.pct, 2)}%`}}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Why trending box */}
              {benchmark.trendDetail && (
                <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1">
                    {t.signals.trendDetail}
                  </p>
                  <p className="text-sm text-violet-700 leading-relaxed">
                    {benchmark.trendDetail}
                  </p>
                </div>
              )}

              {/* Affected customers + send button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {benchmark.relevantCustomers.map((customerId) => (
                    <button
                      key={customerId}
                      type="button"
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:border-slate-300"
                    >
                      {customerId}
                    </button>
                  ))}
                </div>

                {isSent ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                    <span aria-hidden="true">&#10003;</span>
                    {t.signals.commsSent}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendInsight(benchmark.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
                  >
                    {t.signals.sendPeerInsight}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
