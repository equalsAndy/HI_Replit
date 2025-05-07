import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type StepInfo = {
  id: string;
  label: string;
  path: string;
};

interface StepNavigationProps {
  steps: StepInfo[];
  currentStepId: string;
}

export default function StepNavigation({ steps, currentStepId }: StepNavigationProps) {
  const [location, navigate] = useLocation();
  
  // Find the index of the current step
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  
  return (
    <div className="w-full py-4">
      <div className="flex items-center space-x-1 text-sm">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isPast = index < currentStepIndex;
          const isFuture = index > currentStepIndex;
          
          return (
            <div key={step.id} className="flex items-center">
              {index > 0 && (
                <div className={cn(
                  "h-px w-8",
                  isPast ? "bg-indigo-600" : "bg-gray-300"
                )} />
              )}
              
              <div 
                className={cn(
                  "flex items-center justify-center rounded-full text-white h-8 w-8 font-semibold",
                  isActive ? "bg-indigo-600" : 
                  isPast ? "bg-indigo-500 cursor-pointer" : 
                  "bg-gray-300"
                )}
                onClick={() => isPast && navigate(step.path)}
              >
                {step.id}
              </div>
              
              <div className={cn(
                "ml-2 font-medium",
                isActive ? "text-gray-900" : 
                isPast ? "text-indigo-600 cursor-pointer" : 
                "text-gray-400"
              )}
              onClick={() => isPast && navigate(step.path)}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}