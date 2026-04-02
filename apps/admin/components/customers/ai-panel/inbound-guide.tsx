'use client';

import {useState} from 'react';
import type {PlaybookResult} from '@shory/shared';
import {Card, CardContent} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

interface InboundGuideProps {
  playbook: PlaybookResult;
}

export function InboundGuide({playbook}: InboundGuideProps) {
  const {t} = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const {inboundGuide} = playbook;

  return (
    <Card className="rounded-xl shadow-sm">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-4 py-3 text-start"
      >
        <span className="text-sm font-semibold text-gray-700">{t.aiPanel.inboundGuide}</span>
        <span className="text-xs text-gray-400">{collapsed ? '+' : '-'}</span>
      </button>
      {!collapsed && (
        <CardContent className="px-4 pb-4 pt-0">
          <ul className="space-y-2">
            {inboundGuide.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {point}
              </li>
            ))}
          </ul>
          {inboundGuide.contextNote && (
            <p className="mt-3 rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700">
              {inboundGuide.contextNote}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
