import React from 'react';

// Step type definition
interface Step {
  id: string;
  label: string;
}

// Props interface
interface CheckoutStepperProps {
  steps: Step[];
  activeStep: string;
  onStepClick: (stepId: string) => void;
  completedSteps: Record<string, boolean>;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  completedSteps
}) => {
  const activeStepIndex = steps.findIndex(step => step.id === activeStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Determine if this step is active
          const isActive = step.id === activeStep;
          
          // Determine if this step is completed
          const isCompleted = completedSteps[step.id];
          
          // Determine if this step is clickable (completed or the next available step)
          const isClickable = isCompleted || index <= activeStepIndex + 1;
          
          return (
            <React.Fragment key={step.id}>
              {/* Step circle with number or check */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  } ${
                    isClickable && !isActive
                      ? 'hover:bg-gray-300 cursor-pointer'
                      : !isClickable
                      ? 'cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <span
                  className={`mt-2 text-sm ${
                    isActive ? 'text-sky-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    index < activeStepIndex || isCompleted
                      ? 'bg-sky-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper;