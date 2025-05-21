import React from 'react';
import { 
  ChevronLeft, ChevronRight, Lock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NavigationSection } from '../../shared/types';

interface UserHomeNavigationProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  navigationSections: NavigationSection[];
  completedSteps: string[];
  isStepAccessible: (sectionId: string, stepId: string) => boolean;
  handleStepClick: (sectionId: string, stepId: string) => void;
}

const UserHomeNavigation: React.FC<UserHomeNavigationProps> = ({
  drawerOpen,
  toggleDrawer,
  navigationSections,
  completedSteps,
  isStepAccessible,
  handleStepClick
}) => {
  return (
    <div className={cn(
      "h-full bg-white shadow-sm transition-all duration-300 ease-in-out border-r border-gray-200 relative",
      drawerOpen ? "w-80" : "w-16"
    )}>
      {/* Toggle Button */}
      <button
        onClick={toggleDrawer}
        className="absolute -right-3 top-12 z-10 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow border border-gray-200"
      >
        {drawerOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      
      {/* Navigation Content */}
      <div className="p-4 h-full overflow-y-auto">
        {/* Title */}
        <h2 className={cn(
          "font-bold text-xl mb-4 text-gray-800",
          !drawerOpen && "text-center text-sm"
        )}>
          {drawerOpen ? "Your Learning Journey" : "Menu"}
        </h2>
        
        {/* Navigation Sections */}
        <nav className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Section Header */}
              <div className="flex items-center space-x-2">
                <section.icon className={cn("h-5 w-5 text-indigo-600")} />
                
                {drawerOpen && (
                  <>
                    <h3 className="font-medium text-gray-800">{section.title}</h3>
                    <div className="ml-auto text-xs text-gray-500">
                      {section.completedSteps}/{section.steps.length}
                    </div>
                  </>
                )}
              </div>
              
              {/* Section Steps */}
              {drawerOpen && (
                <ul className="pl-7 space-y-2 border-l border-gray-200">
                  {section.steps.map((step) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isAccessible = isStepAccessible(section.id, step.id);
                    
                    return (
                      <TooltipProvider key={step.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li 
                              className={cn(
                                "rounded-md p-2 flex items-center text-sm transition",
                                isCompleted 
                                  ? "text-green-700 bg-green-50" 
                                  : isAccessible
                                    ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    : "text-gray-400 cursor-not-allowed"
                              )}
                              onClick={() => {
                                if (isAccessible) {
                                  handleStepClick(section.id, step.id);
                                }
                              }}
                            >
                              <div className="mr-2 flex-shrink-0">
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : !isAccessible ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : null}
                              </div>
                              <span>{step.label}</span>
                            </li>
                          </TooltipTrigger>
                          {!isAccessible && (
                            <TooltipContent side="right">
                              <p className="text-xs">Complete previous steps first</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default UserHomeNavigation;