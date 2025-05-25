import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface Step {
  title: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;

        return (
          <div key={index} className="relative">
            {index !== 0 && (
              <div
                className={cn(
                  "absolute left-3.5 top-0 h-full w-px -translate-x-1/2 bg-border",
                  {
                    "bg-primary": isCompleted,
                  }
                )}
              />
            )}
            <div className="relative flex gap-2 pb-8">
              <div
                className={cn(
                  "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background text-sm font-medium",
                  {
                    "border-primary bg-primary text-primary-foreground":
                      isActive || isCompleted,
                  }
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <div>{index + 1}</div>
                )}
              </div>
              <div className="flex flex-col">
                <div
                  className={cn("text-base font-medium", {
                    "text-primary": isActive || isCompleted,
                  })}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-sm text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}