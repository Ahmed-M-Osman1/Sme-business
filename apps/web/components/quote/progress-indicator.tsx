import {cn} from '@shory/ui';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = ['Start', 'Details', 'Coverage', 'Review'] as const;

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="flex items-center justify-between">
        {STEPS.slice(0, totalSteps).map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    isCompleted && 'bg-primary text-white',
                    isActive && 'bg-primary text-white ring-4 ring-primary-light',
                    !isActive && !isCompleted && 'bg-surface text-text-muted border border-border',
                  )}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isActive ? 'text-primary' : 'text-text-muted',
                  )}
                >
                  {step}
                </span>
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mb-5',
                    isCompleted ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
