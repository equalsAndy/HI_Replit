import React from 'react';
import { Video, BookOpen, Zap, Glasses, PenLine, Download, ChevronRight, CheckCircle, Circle, Clock, Activity, Lock } from 'lucide-react';
import { useStepProgression } from '@/hooks/use-step-progression';
import { navigationSections, imaginalAgilityNavigationSections } from './navigationData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProgressiveNavigationSidebarProps {
  appType?: 'ast' | 'ia';
  customSections?: any[];
  onStepClick?: (sectionId: string, stepId: string) => void;
}

export function ProgressiveNavigationSidebar({ 
  appType = 'ast', 
  customSections,
  onStepClick
}: ProgressiveNavigationSidebarProps) {
  const { 
    currentStepId, 
    completedSteps, 
    getStepVisualState, 
    isStepUnlocked, 
    navigateToStep 
  } = useStepProgression(appType);
  
  // Use custom sections if provided, otherwise use the default sections based on app type
  const sections = customSections || (appType === 'ia' ? imaginalAgilityNavigationSections : navigationSections);

  // Get section icon based on section ID
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case '1':
        return BookOpen;
      case '2':
        return Zap;
      case '3':
        return Glasses;
      case '4':
        return Download;
      case '5':
        return PenLine;
      default:
        return BookOpen;
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Video': return Video;
      case 'BookOpen': return BookOpen;
      case 'Zap': return Zap;
      case 'Glasses': return Glasses;
      case 'PenLine': return PenLine;
      case 'Download': return Download;
      case 'Clock': return Clock;
      case 'Activity': return Activity;
      default: return BookOpen;
    }
  };

  const handleStepClick = async (sectionId: string, stepId: string) => {
    const result = await navigateToStep(stepId);
    if (result.success && onStepClick) {
      onStepClick(sectionId, stepId);
    } else if (!result.success) {
      // You might want to show a toast or modal here with result.error
      console.warn('Navigation blocked:', result.error);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const SectionIcon = getSectionIcon(section.id);
        
        // Calculate section progress
        const sectionStepIds = section.steps.map((step: any) => step.id);
        const completedInSection = sectionStepIds.filter((stepId: string) => completedSteps.includes(stepId));
        const progressPercentage = sectionStepIds.length > 0 ? (completedInSection.length / sectionStepIds.length) * 100 : 0;
        
        // Check if any step in this section is current or next available
        const hasCurrentStep = sectionStepIds.some((stepId: string) => stepId === currentStepId);
        const hasNextAvailableStep = sectionStepIds.some((stepId: string) => {
          const state = getStepVisualState(stepId);
          return state.nextAvailable;
        });

        return (
          <div key={section.id} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Section Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    hasCurrentStep 
                      ? "bg-blue-100 text-blue-600" 
                      : progressPercentage === 100
                        ? "bg-green-100 text-green-600"
                        : hasNextAvailableStep
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-400"
                  )}>
                    <SectionIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-500">
                      {completedInSection.length} of {sectionStepIds.length} completed
                    </p>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center space-x-2">
                  {progressPercentage === 100 && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {hasNextAvailableStep && progressPercentage < 100 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      progressPercentage === 100 
                        ? "bg-green-500"
                        : progressPercentage > 0
                          ? "bg-blue-500"
                          : "bg-gray-300"
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Section Steps */}
            <div className="p-2 space-y-1">
              {section.steps.map((step: any) => {
                const visualState = getStepVisualState(step.id);
                const unlocked = isStepUnlocked(step.id);

                return (
                  <Button
                    key={step.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-3 py-2 h-auto text-left transition-all duration-200",
                      visualState.current 
                        ? "bg-blue-50 text-blue-900 border border-blue-200" 
                        : visualState.completed
                          ? "hover:bg-green-50 text-gray-700"
                          : visualState.nextAvailable
                            ? "hover:bg-amber-50 text-gray-700 border border-amber-200"
                            : visualState.locked
                              ? "text-gray-400 cursor-not-allowed opacity-60"
                              : "hover:bg-gray-50 text-gray-700"
                    )}
                    disabled={visualState.locked}
                    onClick={() => !visualState.locked && handleStepClick(section.id, step.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        {/* Step status icon */}
                        <div className="flex-shrink-0">
                          {visualState.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : visualState.current ? (
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                          ) : visualState.nextAvailable ? (
                            <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
                          ) : visualState.locked ? (
                            <Lock className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                        
                        {/* Step info */}
                        <div>
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-gray-500 capitalize">{step.type}</div>
                        </div>
                      </div>

                      {/* Step indicators */}
                      <div className="flex items-center space-x-1">
                        {visualState.nextAvailable && (
                          <span className="text-xs font-medium text-amber-600">Next</span>
                        )}
                        {!visualState.locked && !visualState.current && (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}