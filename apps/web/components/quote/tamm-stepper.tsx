'use client';

import {useI18n} from '@/lib/i18n';

interface TammStepperProps {
  currentStep: number;
}

function TriangleWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 2L14.5 13.5H1.5L8 2Z"
        stroke="#169F9F"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 6.5V9.5" stroke="#169F9F" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.7" fill="#169F9F" />
    </svg>
  );
}

export function TammStepper({currentStep}: TammStepperProps) {
  const {t} = useI18n();
  const stepper = t.tamm.stepper;
  const steps = stepper.steps as string[];

  return (
    <nav aria-label="Progress">
      <ol className="flex flex-col gap-0">
        {steps.map((label, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li key={label} className="flex items-start gap-3">
              {/* Number circle + connector line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={
                    isCompleted
                      ? {background: '#169F9F', color: 'white'}
                      : isActive
                        ? {background: '#12121B', color: 'white'}
                        : {
                            background: 'white',
                            border: '1.5px solid #CBD5E0',
                            color: '#94A3B8',
                          }
                  }>
                  {isCompleted ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5L4.5 7.5L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>

                {/* Connector line */}
                {step < steps.length && (
                  <div
                    className="w-px mt-0.5"
                    style={{
                      height: '26px',
                      background: isCompleted ? '#169F9F' : '#E2E8F0',
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className="text-sm pt-0.5 leading-tight transition-colors"
                style={
                  isActive
                    ? {color: '#12121B', fontWeight: 600}
                    : isCompleted
                      ? {color: '#169F9F', fontWeight: 500}
                      : {color: '#94A3B8', fontWeight: 400}
                }>
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Need support? */}
      <div className="mt-6 flex items-center gap-2 text-[#169F9F] hover:opacity-80 transition-opacity cursor-pointer">
        <TriangleWarning />
        <span className="text-sm font-medium">{stepper.needSupport}</span>
      </div>
    </nav>
  );
}

export function TammStepperCompact({currentStep}: TammStepperProps) {
  const {t} = useI18n();
  const stepper = t.tamm.stepper;
  const steps = stepper.steps as string[];
  const activeLabel = steps[currentStep - 1] ?? steps[0];
  const stepOfLabel = stepper.stepOf
    .replace('{current}', String(currentStep))
    .replace('{total}', String(steps.length));

  return (
    <div className="bg-white rounded-xl border border-[#E8ECF0] px-4 py-3">
      {/* Progress bar */}
      <div className="flex items-center gap-1 mb-3">
        {steps.map((_, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div
              key={index}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: isCompleted || isActive ? '#169F9F' : '#E2E8F0',
                opacity: isActive ? 0.6 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#12121B]">{activeLabel}</span>
        <span className="text-xs text-[#94A3B8]">{stepOfLabel}</span>
      </div>
    </div>
  );
}
