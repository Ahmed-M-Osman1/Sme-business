'use client';

import {useRouter} from 'next/navigation';
import {cn} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  label?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: ProgressIndicatorProps) {
  const {t} = useI18n();
  const router = useRouter();

  const STEPS = [
    {label: t.progress.chooseMethod, path: '/quote/start'},
    {label: t.progress.business, path: '/quote/business-type'},
    {label: t.progress.quotes, path: '/quote/results'},
    {label: t.progress.company, path: '/quote/company-details'},
    {label: t.progress.checkout, path: '/quote/checkout'},
    {label: t.progress.confirmed, path: null},
  ];

  const total = totalSteps ?? STEPS.length;
  const steps = STEPS.slice(0, total);

  function handleStepClick(stepIndex: number) {
    if (stepIndex >= currentStep) return;
    const step = steps[stepIndex];
    if (step?.path) {
      router.push(step.path);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-muted">
          {t.progress.step} {currentStep} {t.common.of} {total}
          {label ? ` · ${label}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isClickable = isCompleted && !!step.path;

          return (
            <button
              key={i}
              onClick={() => handleStepClick(i)}
              disabled={!isClickable}
              aria-label={`Step ${stepNum}: ${step.label}`}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all duration-300',
                isCompleted && 'bg-primary',
                isCurrent && 'bg-primary',
                !isCompleted && !isCurrent && 'bg-border',
                isClickable && 'cursor-pointer hover:opacity-70',
                !isClickable && 'cursor-default',
              )}
            />
          );
        })}
      </div>
      {/* Step labels on larger screens */}
      <div className="hidden sm:flex items-center gap-1.5 mt-1">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isClickable = isCompleted && !!step.path;

          return (
            <span
              key={i}
              onClick={() => isClickable && handleStepClick(i)}
              className={cn(
                'flex-1 text-[10px] text-center transition-colors',
                isCurrent && 'text-primary font-medium',
                isCompleted && 'text-text-muted',
                !isCompleted && !isCurrent && 'text-border',
                isClickable && 'cursor-pointer hover:text-primary',
              )}
            >
              {step.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
