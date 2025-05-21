
import React from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navigationSections } from './navigationData';

interface UserHomeNavigationProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  completedSteps: string[];
  isStepAccessible: (sectionId: string, stepId: string) => boolean;
  onStepClick: (step: any) => void;
}

export default function UserHomeNavigation({
  drawerOpen,
  toggleDrawer,
  completedSteps,
  isStepAccessible,
  onStepClick
}: UserHomeNavigationProps) {
  return (
    <div 
      className={cn(
        "h-full transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm",
        drawerOpen ? "w-80" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {drawerOpen && <h2 className="font-semibold text-gray-800">Your Learning Journey</h2>}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleDrawer}
          className="rounded-full ml-auto"
        >
          {drawerOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-64px)]">
        {navigationSections.map((section) => (
          <div key={section.id} className="border-b border-gray-100">
            <div 
              className={cn(
                "flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer",
                drawerOpen ? "" : "justify-center"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-indigo-100 text-indigo-700",
              )}>
                {section.id}
              </div>
              
              {drawerOpen && (
                <>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-800">{section.title}</div>
                    <div className="text-xs text-gray-500">
                      {section.completedSteps} of {section.totalSteps} complete
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </>
              )}
            </div>

            {drawerOpen && (
              <div className="pl-6 pr-2 pb-2">
                {section.steps.map((step) => {
                  const accessible = isStepAccessible(section.id, step.id);
                  const completed = completedSteps.includes(step.id);
                  
                  return (
                    <TooltipProvider key={step.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            onClick={() => accessible && onStepClick(step)}
                            className={cn(
                              "flex items-center px-4 py-2 my-1 rounded-md text-sm",
                              accessible 
                                ? "cursor-pointer hover:bg-gray-100" 
                                : "opacity-60 cursor-not-allowed",
                              completed && "bg-green-50 text-green-800"
                            )}
                          >
                            <div className="text-xs w-6 text-gray-400">{step.id}</div>
                            <div className="ml-2">{step.label}</div>
                            {!accessible && (
                              <Lock className="ml-2 h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        </TooltipTrigger>
                        {!accessible && (
                          <TooltipContent>
                            <p>Complete previous steps first</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
