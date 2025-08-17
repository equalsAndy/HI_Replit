import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronRight, Check, Lock, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';

interface NavigationStep {
  id: string;
  title: string;
  type: string;
  path?: string;
  label?: string;
  estimatedTime?: number;
  required?: boolean;
}

interface NavigationSection {
  id: string;
  title: string;
  steps: NavigationStep[];
  totalSteps?: number;
  completedSteps?: number;
  locked?: boolean;
}

interface CollapsibleSectionProps {
  section: NavigationSection & {
    progressDisplay?: string;
    isComplete?: boolean;
    locked?: boolean;
  };
  icon?: LucideIcon;
  children?: ReactNode;
}

export function CollapsibleSection({ section, icon: Icon, children }: CollapsibleSectionProps) {
  const [location, navigate] = useLocation();
  const { progress, isStepAccessibleByProgression } = useNavigationProgress();
  
  // Check if this section is expanded based on progress state
  const isExpanded = progress.sectionExpansion?.[section.id] ?? true;
  
  // Get section progress from props (calculated in NavigationSidebar)
  const progressDisplay = section.progressDisplay || `0/${section.totalSteps}`;
  const isCompleted = section.isComplete || false;
  const isLocked = section.locked || false;
  
  // Handle clicking on a step
  const handleStepClick = (step: any) => {
    if (isLocked) {
      return; // Don't allow navigation to locked sections
    }
    
    // Check if step is accessible
    if (!isStepAccessibleByProgression(step.id)) {
      return; // Don't allow navigation to inaccessible steps
    }
    
    navigate(step.path);
  };
  
  return (
    <div className={cn(
      "mb-3 bg-white overflow-hidden",
      section.title ? "border border-gray-200 rounded-md" : ""
    )}>
      {/* Section Header - Only show if there's a title */}
      {section.title && (
        <div 
          className={cn(
            "flex justify-between items-center p-4 transition-colors",
            isCompleted ? "bg-green-50" : "",
            isLocked ? "bg-gray-50 opacity-75" : "cursor-pointer hover:bg-gray-50"
          )}
        >
          <div className="flex items-center">
            {isLocked ? (
              <Lock className="h-5 w-5 text-gray-400 mr-2" />
            ) : (
              Icon && <Icon className="h-5 w-5 text-indigo-600 mr-2" />
            )}
            <span className={cn(
              "font-medium",
              isLocked ? "text-gray-400" : "text-gray-900"
            )}>
              {section.title}
              {isCompleted && !isLocked && (
                <span className="ml-2 text-green-600 text-sm">
                  (Complete)
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center">
            {/* Progress indicator - X/Y format */}
            <div className={cn(
              "mr-3 text-sm flex items-center",
              isLocked ? "text-gray-400" : "text-gray-500"
            )}>
              <span className="hidden sm:inline">
                {isCompleted ? 'Complete' : `${progressDisplay} complete`}
              </span>
              <span className="sm:hidden">{progressDisplay}</span>
            </div>
            
            {/* Completion check or lock icon */}
            {isCompleted && !isLocked ? (
              <Check className="h-4 w-4 text-green-600 mr-2" />
            ) : isLocked ? (
              <Lock className="h-4 w-4 text-gray-400 mr-2" />
            ) : null}
            
            {/* Expansion indicator (only for unlocked sections) */}
            {!isLocked && (
              isExpanded ? (
                <ChevronDown className="h-5 w-5 text-indigo-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-indigo-600" />
              )
            )}
          </div>
        </div>
      )}
      
      {/* Section Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            section.title ? "border-t border-gray-200" : ""
          )}
        >
          {children ? (
            <div className="p-4">
              {children}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {section.steps.map((step) => {
                const isStepCompleted = progress.completedSteps.includes(step.id);
                const isStepCurrent = step.id === progress.currentStepId;
                const isStepAccessible = isStepAccessibleByProgression(step.id);
                
                return (
                  <li key={step.id}>
                    <div 
                      className={cn(
                        "flex items-center p-4 transition-colors",
                        isStepCurrent ? "bg-purple-50" : "",
                        isStepCompleted ? "bg-green-50" : "",
                        isStepAccessible && !isLocked ? "hover:bg-gray-50 cursor-pointer" : "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => handleStepClick(step)}
                    >
                      {/* Completion status */}
                      <div className={cn(
                        "flex-shrink-0 h-6 w-6 rounded-full mr-3 flex items-center justify-center",
                        isStepCompleted 
                          ? "bg-green-100 text-green-600 border border-green-200" 
                          : isStepCurrent
                            ? "bg-indigo-100 text-indigo-600 border border-indigo-200"
                            : isStepAccessible 
                              ? "bg-gray-100 text-gray-400 border border-gray-200"
                              : "bg-gray-50 text-gray-300 border border-gray-100"
                      )}>
                        {isStepCompleted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-xs font-medium">{step.id}</span>
                        )}
                      </div>
                      
                      {/* Step information */}
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm font-medium",
                          isStepCompleted ? "text-green-700" : 
                          isStepCurrent ? "text-purple-700" : "text-gray-700"
                        )}>
                          {step.label}
                        </p>
                        
                        {/* Show estimated time if available */}
                        {step.estimatedTime && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Estimated time: {step.estimatedTime} min
                          </p>
                        )}
                      </div>
                      
                      {/* Required indicator */}
                      {step.required !== false && !isStepCompleted && (
                        <span className="text-xs font-medium text-indigo-600 flex-shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}