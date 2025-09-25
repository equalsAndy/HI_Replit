import React from 'react';
import { CheckCircle, Circle, Lock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';

interface NavigationSection {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    title: string;
    type: string;
  }>;
}

interface UnifiedNavigationSidebarProps {
  workshop: 'ast' | 'ia';
  sections: NavigationSection[];
  onStepClick?: (stepId: string) => void;
}

export function UnifiedNavigationSidebar({ 
  workshop, 
  sections, 
  onStepClick 
}: UnifiedNavigationSidebarProps) {
  const {
    currentStep,
    completedSteps,
    nextStep,
    getStepVisualState,
    navigateToStep,
    isStepAccessible,
    progressPercentage
  } = useUnifiedWorkshopNavigation(workshop);

  const handleStepClick = (stepId: string) => {
    if (isStepAccessible(stepId)) {
      navigateToStep(stepId);
      onStepClick?.(stepId);
    }
  };

  const renderStepIndicator = (stepId: string) => {
    const visualState = getStepVisualState(stepId);

    if (visualState.isLocked) {
      return <Lock className="h-4 w-4 text-gray-400" />;
    }

    if (visualState.showGreenCheckmark) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }

    if (visualState.showDarkDot) {
      return (
        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      );
    }

    if (visualState.showPulsatingDot) {
      return (
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      );
    }

    return <Circle className="h-4 w-4 text-gray-300" />;
  };

  const getStepStyling = (stepId: string) => {
    const visualState = getStepVisualState(stepId);

    let baseClasses = "w-full justify-start px-4 py-3 text-left transition-all duration-200 ";

    if (visualState.isLocked) {
      baseClasses += "text-gray-400 cursor-not-allowed opacity-60 ";
    } else if (visualState.showRoundedHighlight) {
      if (visualState.showLightBlueShading) {
        // Current step that's also next unfinished (light blue + rounded highlight + dark dot)
        baseClasses += "bg-blue-50 text-blue-900 border-l-4 border-blue-500 ";
      } else if (visualState.showGreenCheckmark) {
        // Viewing a completed step (green + rounded highlight, pulsating dot elsewhere)
        baseClasses += "bg-green-50 text-green-900 border-l-4 border-green-500 ";
      } else {
        // Default current step styling
        baseClasses += "bg-gray-50 text-gray-900 border-l-4 border-gray-500 ";
      }
    } else if (visualState.showGreenCheckmark) {
      // Completed but not current
      baseClasses += "hover:bg-green-50 text-gray-700 ";
    } else {
      // Regular step
      baseClasses += "hover:bg-gray-50 text-gray-700 ";
    }

    return baseClasses;
  };

  const getSectionProgress = (sectionSteps: string[]) => {
    const completedInSection = sectionSteps.filter(stepId => completedSteps.includes(stepId));
    return {
      completed: completedInSection.length,
      total: sectionSteps.length,
      percentage: sectionSteps.length > 0 ? (completedInSection.length / sectionSteps.length) * 100 : 0
    };
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">
            {workshop === 'ast' ? 'AllStar Teams' : 'Imaginal Agility'} Progress
          </h2>
          <span className="text-sm text-gray-500">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Navigation Sections */}
      {sections.map((section) => {
        const sectionStepIds = section.steps.map(step => step.id);
        const sectionProgress = getSectionProgress(sectionStepIds);
        const hasCurrentStep = sectionStepIds.includes(currentStep);
        const hasNextStep = sectionStepIds.includes(nextStep);

        return (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Section Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                  <p className="text-xs text-gray-500">
                    {sectionProgress.completed} of {sectionProgress.total} completed
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {sectionProgress.percentage === 100 && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {hasNextStep && sectionProgress.percentage < 100 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              
              {/* Section Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      sectionProgress.percentage === 100 
                        ? "bg-green-500"
                        : "bg-blue-500"
                    )}
                    style={{ width: `${sectionProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Section Steps */}
            <div className="p-2 space-y-1">
              {section.steps.map((step) => {
                const visualState = getStepVisualState(step.id);

                return (
                  <Button
                    key={step.id}
                    variant="ghost"
                    className={getStepStyling(step.id)}
                    disabled={visualState.isLocked}
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        {/* Step Status Indicator */}
                        <div className="flex-shrink-0">
                          {renderStepIndicator(step.id)}
                        </div>
                        
                        {/* Step Info */}
                        <div className="text-left">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-gray-500 capitalize">{step.type}</div>
                        </div>
                      </div>

                      {/* Navigation Arrow */}
                      <div className="flex items-center space-x-1">
                        {visualState.showPulsatingDot && (
                          <span className="text-xs font-medium text-blue-600 animate-pulse">
                            Continue
                          </span>
                        )}
                        {visualState.showDarkDot && (
                          <span className="text-xs font-medium text-blue-600">
                            Current
                          </span>
                        )}
                        {!visualState.isLocked && !visualState.showRoundedHighlight && (
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

      {/* Navigation Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs">
          <div className="font-medium mb-1">Debug Info:</div>
          <div>Current: {currentStep}</div>
          <div>Next: {nextStep}</div>
          <div>Completed: {completedSteps.length}</div>
        </div>
      )}
    </div>
  );
}
