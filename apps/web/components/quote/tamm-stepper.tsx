'use client';

const STEPS = [
  'Choose Method',
  'Business Details',
  'Quote Results',
  'Company Details',
  'Payment',
  'Confirmation',
] as const;

interface TammStepperProps {
  currentStep: number;
}

export function TammStepper({currentStep}: TammStepperProps) {
  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        const isLast = step === STEPS.length;

        return (
          <div key={label} className="flex items-start gap-3">
            {/* Circle + line column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-[#1D7A4E]'
                    : isActive
                      ? 'bg-[#1D7A4E]'
                      : 'border-2 border-[#DEE2E6] bg-white'
                }`}>
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none">
                    <path
                      d="M3 7L6 10L11 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white" />
                ) : null}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 h-8 ${
                    isCompleted ? 'bg-[#1D7A4E]' : 'bg-[#DEE2E6]'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-sm pt-0.5 ${
                isActive
                  ? 'font-semibold text-gray-900'
                  : isCompleted
                    ? 'text-gray-700'
                    : 'text-muted-foreground'
              }`}>
              {label}
            </span>
          </div>
        );
      })}

      {/* Need Support link */}
      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M6.5 6.5a1.5 1.5 0 1 1 2.12 1.37c-.41.22-.62.5-.62.88V9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
        <span>Need Support?</span>
      </div>
    </div>
  );
}

export function TammStepperCompact({currentStep}: TammStepperProps) {
  const activeLabel = STEPS[currentStep - 1] ?? STEPS[0];

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isFilled = step <= currentStep;
          return (
            <div
              key={label}
              className={`flex-1 h-1.5 rounded-full ${
                isFilled ? 'bg-[#1D7A4E]' : 'bg-[#DEE2E6]'
              }`}
            />
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Step {currentStep} of 6 &middot; {activeLabel}
      </p>
    </div>
  );
}
