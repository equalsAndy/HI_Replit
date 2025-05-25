import React from 'react';
import { cn } from '@/lib/utils';

interface StepsProps {
  currentStep: number;
  className?: string;
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  description?: string;
}

export function Steps({ currentStep, className, children }: StepsProps) {
  // Convert children to array to work with them
  const stepsArray = React.Children.toArray(children);
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {stepsArray.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === stepsArray.length - 1;
          
          return (
            <React.Fragment key={index}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-200",
                    {
                      "bg-primary text-white border-primary": isCompleted || isActive,
                      "border-gray-300": !isCompleted && !isActive,
                      "bg-white text-primary": isActive && !isCompleted,
                      "bg-primary text-white": isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span className={cn(isActive ? "text-primary" : "text-gray-500")}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={cn("text-sm font-medium", {
                      "text-gray-900": isActive || isCompleted,
                      "text-gray-500": !isActive && !isCompleted,
                    })}
                  >
                    {(step as React.ReactElement<StepProps>).props.title}
                  </p>
                  {(step as React.ReactElement<StepProps>).props.description && (
                    <p
                      className={cn("text-xs", {
                        "text-gray-700": isActive || isCompleted,
                        "text-gray-400": !isActive && !isCompleted,
                      })}
                    >
                      {(step as React.ReactElement<StepProps>).props.description}
                    </p>
                  )}
                </div>
              </div>
              {!isLast && (
                <div
                  className={cn("flex-1 h-0.5 mx-4", {
                    "bg-primary": isCompleted,
                    "bg-gray-200": !isCompleted,
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function Step({ title, description }: StepProps) {
  // This component doesn't render anything on its own
  // It's used for type safety and to pass props to the Steps component
  return null;
}