import React from 'react';

interface CheckoutProgressProps {
  activeStep: number;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ activeStep }) => {
  const steps = [
    { id: 0, name: 'Address' },
    { id: 1, name: 'Shipping' },
    { id: 2, name: 'Payment' },
    { id: 3, name: 'Review' },
  ];

  return (
    <div className="mb-10 overflow-hidden">
      {/* Desktop progress bar */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Progress track */}
          <div className="absolute inset-0 flex items-center">
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle */}
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    step.id < activeStep
                      ? 'bg-sky-600' // Completed
                      : step.id === activeStep
                      ? 'bg-sky-600 ring-4 ring-sky-100' // Current
                      : 'bg-gray-200' // Upcoming
                  }`}
                >
                  {step.id < activeStep ? (
                    <i className="fas fa-check text-white text-sm"></i>
                  ) : (
                    <span className={`text-sm font-medium ${step.id === activeStep ? 'text-white' : 'text-gray-500'}`}>
                      {step.id + 1}
                    </span>
                  )}
                </div>
                
                {/* Step label */}
                <div className="text-center mt-2">
                  <span 
                    className={`text-sm font-medium ${
                      step.id === activeStep
                        ? 'text-sky-600'
                        : step.id < activeStep
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile progress indicator */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center px-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-sky-600 rounded-full" 
                style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-4 text-sm text-gray-700">
            Step {activeStep + 1} of {steps.length}
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-sky-600">
            {steps[activeStep].name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProgress;