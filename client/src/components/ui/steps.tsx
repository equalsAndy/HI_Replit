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
  active?: boolean;
  completed?: boolean;
}

export function Steps({ currentStep, className, children }: StepsProps) {
  // Clone children to add index prop
  const stepsWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        active: index === currentStep,
        completed: index < currentStep,
      });
    }
    return child;
  });

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {stepsWithProps}
    </div>
  );
}

export function Step({ title, description, active, completed }: StepProps) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-3">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2",
            {
              "border-primary bg-primary text-white": completed || active,
              "border-gray-300 bg-white text-gray-500": !completed && !active,
            }
          )}
        >
          {completed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <span>{active ? "•" : ""}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <span
          className={cn("text-sm font-medium", {
            "text-primary": active || completed,
            "text-gray-900": !active && !completed,
          })}
        >
          {title}
        </span>
        {description && (
          <span
            className={cn("text-xs", {
              "text-gray-500": !active,
              "text-primary/80": active,
            })}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}