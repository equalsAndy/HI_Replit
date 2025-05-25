import React from 'react';

export interface StepItem {
  label: string;
  status: 'upcoming' | 'current' | 'complete';
}

export interface StepsProps {
  steps: StepItem[];
}

export function Steps({ steps }: StepsProps) {
  return (
    <div className="relative">
      {/* Steps with connecting line */}
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
        
        {/* Steps */}
        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center">
            {/* Step circle */}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.status === 'complete' 
                  ? 'bg-primary text-white' 
                  : step.status === 'current'
                  ? 'bg-primary text-white ring-4 ring-primary/20' 
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.status === 'complete' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            
            {/* Step label */}
            <div className="mt-2 text-xs font-medium text-center">
              <div className={`${
                step.status === 'complete' || step.status === 'current' 
                  ? 'text-gray-900 font-semibold' 
                  : 'text-gray-500'
              }`}>
                {step.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}