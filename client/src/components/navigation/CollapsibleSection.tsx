import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronRight, Check, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavigationSection, NavigationStep, useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  section: NavigationSection;
  icon?: LucideIcon;
  children?: ReactNode;
}

export function CollapsibleSection({ section, icon: Icon, children }: CollapsibleSectionProps) {
  const [location, navigate] = useLocation();
  const { toggleSectionExpanded, expandedSections, completedSteps, currentStepId, setCurrentStep } = useNavigationProgress();
  
  // Check if this section is expanded
  const isExpanded = expandedSections.includes(section.id);
  
  // Calculate section progress
  const totalSteps = section.steps.length;
  const completedStepsCount = section.steps.filter(step => completedSteps.includes(step.id)).length;
  const sectionProgress = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
  const isCompleted = totalSteps > 0 && completedStepsCount === totalSteps;
  
  // Handle toggling section expansion
  const handleToggle = () => {
    toggleSectionExpanded(section.id);
  };
  
  // Handle clicking on a step
  const handleStepClick = (step: NavigationStep) => {
    setCurrentStep(step.id);
    navigate(step.path);
  };
  
  return (
    <div className="border border-gray-200 rounded-md mb-3 bg-white overflow-hidden">
      {/* Section Header */}
      <div 
        className={cn(
          "flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors",
          isCompleted ? "bg-green-50" : ""
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center">
          {Icon && <Icon className="h-5 w-5 text-indigo-600 mr-2" />}
          <span className="font-medium text-gray-900">
            {section.title}
            {isCompleted && (
              <span className="ml-2 text-green-600 text-sm">
                (Complete)
              </span>
            )}
          </span>
        </div>
        
        <div className="flex items-center">
          {/* Progress information */}
          {!isCompleted && totalSteps > 0 && (
            <div className="mr-3 text-sm text-gray-500 flex items-center">
              <span className="hidden sm:inline">{completedStepsCount} of {totalSteps} complete</span>
              <span className="sm:hidden">{completedStepsCount}/{totalSteps}</span>
            </div>
          )}
          
          {/* Expansion indicator */}
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-indigo-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-indigo-600" />
          )}
        </div>
      </div>
      
      {/* Section Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200"
        >
          {children ? (
            <div className="p-4">
              {children}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {section.steps.map((step) => {
                const isStepCompleted = completedSteps.includes(step.id);
                const isStepCurrent = step.id === currentStepId;
                
                return (
                  <li key={step.id}>
                    <div 
                      className={cn(
                        "flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                        isStepCurrent ? "bg-indigo-50" : "",
                        isStepCompleted ? "bg-green-50" : ""
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
                            : "bg-gray-100 text-gray-400 border border-gray-200"
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
                          isStepCurrent ? "text-indigo-700" : "text-gray-700"
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