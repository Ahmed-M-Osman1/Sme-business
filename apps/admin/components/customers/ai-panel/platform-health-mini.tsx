'use client';

import {useState} from 'react';
import type {CustomerPlatformContext} from '@shory/shared';
import {Card, CardContent} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {StatusDot} from '@/components/shared/status-dot';
import {Tag} from '@/components/shared/tag';

interface PlatformHealthMiniProps {
  context: CustomerPlatformContext;
}

const SEVERITY_STATUS: Record<string, 'operational' | 'degraded' | 'down'> = {
  low: 'operational',
  medium: 'degraded',
  high: 'down',
};

export function PlatformHealthMini({context}: PlatformHealthMiniProps) {
  const {t} = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-start"
      >
        <span className="text-sm font-semibold text-gray-700">{t.aiPanel.platformHealth}</span>
        <span className="text-xs text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>
      {!collapsed && (
        <CardContent className="px-4 pb-4 pt-0">
          {!context.flag ? (
            <p className="text-xs text-gray-500">{t.customers.noPlatformIssues}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusDot status={SEVERITY_STATUS[context.severity ?? 'low'] ?? 'degraded'} pulse />
                <span className="text-xs font-medium text-gray-900">{context.issue}</span>
              </div>
              {context.detail && (
                <p className="text-xs text-gray-500">{context.detail}</p>
              )}
              {context.severity && (
                <Tag
                  label={context.severity}
                  variant={context.severity === 'high' ? 'danger' : context.severity === 'medium' ? 'warning' : 'info'}
                />
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
