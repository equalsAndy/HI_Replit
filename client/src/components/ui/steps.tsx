import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepsProps {
  activeStep: number;
  className?: string;
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  description?: string;
}

export const Steps = ({ activeStep, className, children }: StepsProps) => {
  // Convert React children to array
  const steps = React.Children.toArray(children);
  
  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex items-center justify-between">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isCompleted = i < activeStep;
          
          return (
            <React.Fragment key={i}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCompleted ? 'border-primary bg-primary text-white' :
                    isActive ? 'border-primary text-primary' :
                    'border-muted-foreground/30 text-muted-foreground/50'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                
                {/* Step title */}
                <span
                  className={cn(
                    'mt-2 text-sm font-medium',
                    isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  {(step as React.ReactElement<StepProps>).props.title}
                </span>
                
                {/* Step description if provided */}
                {(step as React.ReactElement<StepProps>).props.description && (
                  <span className="text-xs text-muted-foreground mt-1 hidden md:block">
                    {(step as React.ReactElement<StepProps>).props.description}
                  </span>
                )}
              </div>
              
              {/* Connector line between steps */}
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-px mx-2',
                    i < activeStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const Step: React.FC<StepProps> = ({ title, description }) => {
  // This is just a placeholder component for the Steps component to use
  return null;
};