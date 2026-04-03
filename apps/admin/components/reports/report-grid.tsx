'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {adminApi} from '@/lib/api-client';

interface ReportGridProps {
  token: string;
}

interface ReportDef {
  titleKey: keyof typeof import('@/lib/i18n/en.json')['reports'];
  descKey: keyof typeof import('@/lib/i18n/en.json')['reports'];
}

const REPORTS: ReportDef[] = [
  {titleKey: 'renewalRetention', descKey: 'renewalRetentionDesc'},
  {titleKey: 'sequencePerformance', descKey: 'sequencePerformanceDesc'},
  {titleKey: 'upsellConversion', descKey: 'upsellConversionDesc'},
  {titleKey: 'signalConversion', descKey: 'signalConversionDesc'},
  {titleKey: 'benchmarkEngagement', descKey: 'benchmarkEngagementDesc'},
  {titleKey: 'midTermRevenue', descKey: 'midTermRevenueDesc'},
];

export function ReportGrid({token}: ReportGridProps) {
  const {t} = useI18n();
  const [generating, setGenerating] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());

  async function handleGenerate(reportKey: string) {
    setGenerating(reportKey);
    setFailed((prev) => { const s = new Set(prev); s.delete(reportKey); return s; });
    try {
      await adminApi.actions.dispatch(token, {
        type: 'generate_report',
        payload: {report: reportKey},
      });
      setCompleted((prev) => new Set(prev).add(reportKey));
    } catch {
      setFailed((prev) => new Set(prev).add(reportKey));
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {REPORTS.map((report) => {
        const title = t.reports[report.titleKey] as string;
        const desc = t.reports[report.descKey] as string;
        const isGenerating = generating === report.titleKey;
        const isDone = completed.has(report.titleKey);
        const isFailed = failed.has(report.titleKey);

        return (
          <div
            key={report.titleKey}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center gap-2">
              {isDone ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-semibold text-green-700 border border-green-200">
                  &#10003; Report generated
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleGenerate(report.titleKey)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  <span aria-hidden="true">&#10022;</span>
                  {isGenerating ? t.reports.generating : `${t.reports.generate} \u2192`}
                </button>
              )}
              {isFailed && (
                <span className="text-xs text-red-600">Failed — try again</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
