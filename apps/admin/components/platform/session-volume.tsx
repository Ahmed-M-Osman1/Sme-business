'use client';

import {useI18n} from '@/lib/i18n';

interface SessionVolumeProps {
  incidentWindowStart?: number;
  incidentWindowEnd?: number;
}

// Simulated hourly session data (7am to 6pm)
const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const BASE_SESSIONS = [120, 85, 60, 180, 220, 310, 280, 340, 290, 260, 200, 150];

function formatHour(h: number): string {
  if (h === 0 || h === 12) return `12${h === 0 ? 'am' : 'pm'}`;
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function SessionVolume({
  incidentWindowStart = 6,
  incidentWindowEnd = 9,
}: SessionVolumeProps) {
  const {t} = useI18n();

  const maxSessions = Math.max(...BASE_SESSIONS);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-800">
        {t.platform.sessionVolume}
      </h3>

      {/* Bar chart */}
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {HOURS.map((hour, idx) => {
          const sessions = BASE_SESSIONS[idx] ?? 0;
          const barHeight = Math.max(4, (sessions / maxSessions) * 100);
          const isIncidentWindow =
            hour >= incidentWindowStart && hour <= incidentWindowEnd;

          return (
            <div
              key={hour}
              className="flex flex-1 flex-col items-center justify-end"
              style={{height: '100%'}}
            >
              {/* Value label */}
              <span className="mb-1 text-[10px] font-mono text-slate-400">
                {sessions}
              </span>
              {/* Bar */}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${
                  isIncidentWindow
                    ? 'bg-red-400'
                    : 'bg-primary'
                }`}
                style={{height: `${barHeight}%`}}
              />
              {/* Hour label */}
              <span className="mt-1.5 text-[10px] text-slate-400">
                {formatHour(hour)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
          <span>{t.platform.normal}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />
          <span>
            {t.platform.activeIncidents} ({formatHour(incidentWindowStart)}&ndash;{formatHour(incidentWindowEnd)})
          </span>
        </div>
      </div>
    </div>
  );
}
