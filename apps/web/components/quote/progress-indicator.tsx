import {cn} from '@shory/ui';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  label,
}: ProgressIndicatorProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between text-xs text-text-muted mb-2">
        <span>
          Step {currentStep} of {totalSteps}
          {label ? ` · ${label}` : ''}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-primary rounded-full transition-all duration-300 ease-in-out',
          )}
          style={{width: `${percentage}%`}}
        />
      </div>
    </div>
  );
}
