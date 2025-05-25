import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface StepProps {
  title: string;
  description?: string;
  active?: boolean;
  completed?: boolean;
}

const Step = ({ title, description, active, completed }: StepProps) => {
  return (
    <div className={cn('flex items-center', active ? 'text-primary' : 'text-muted-foreground')}>
      <div className="relative">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            active ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground',
            completed ? 'border-primary bg-primary text-primary-foreground' : ''
          )}
          aria-hidden="true"
        >
          {completed ? <CheckIcon className="h-4 w-4" /> : <span>{active ? '•' : ''}</span>}
        </div>
      </div>
      <div className="ml-4">
        <p
          className={cn(
            'text-sm font-medium',
            active || completed ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

interface StepsProps {
  steps: {
    title: string;
    description?: string;
  }[];
  currentStep: number;
  className?: string;
}

export const Steps = ({ steps, currentStep, className }: StepsProps) => {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol role="list" className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Step
              title={step.title}
              description={step.description}
              active={currentStep === index}
              completed={currentStep > index}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};