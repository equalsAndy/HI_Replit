import React, { useState, useEffect } from 'react';
import { NavigationSection, StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { navigationSections } from './navigationData';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ChevronLeft, 
  Menu, 
  X, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  PenLine, 
  Activity,
  FileText
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserHomeNavigationProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  navigationSections: NavigationSection[];
  completedSteps: string[];
  isStepAccessible: (sectionId: string, stepId: string) => boolean;
  handleStepClick: (sectionId: string, stepId: string) => void;
  starCard?: StarCard | null;
  flowAttributesData?: FlowAttributesResponse | null;
  currentContent?: string;
  isImaginalAgility?: boolean;
}

const UserHomeNavigation: React.FC<UserHomeNavigationProps> = ({
  drawerOpen,
  toggleDrawer,
  navigationSections,
  completedSteps,
  isStepAccessible,
  handleStepClick,
  starCard,
  flowAttributesData,
  currentContent,
  isImaginalAgility = false
}) => {
  // State to track if we're on mobile or not
  const [isMobile, setIsMobile] = useState(false);

  // Determine if the Star Card is complete and flow attributes are available
  const hasStarCard = starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning;
  const hasFlowAttributes = flowAttributesData?.attributes && 
                           Array.isArray(flowAttributesData.attributes) && 
                           flowAttributesData.attributes.length > 0;
  const isStarCardComplete = hasStarCard && hasFlowAttributes;
  
  // Helper function to convert step IDs to content keys used in the app
  const getContentKeyFromStepId = (sectionId: string, stepId: string) => {
    // Map section-step to content keys
    const contentKeyMap: Record<string, string> = {
      // Section 1: AllStarTeams Introduction
      '1-1': 'welcome',
      
      // Section 2: Discover your Strengths
      '2-1': 'intro-strengths',
      '2-2': 'strengths-assessment',
      '2-3': 'star-card-preview',
      '2-4': 'reflection',
      
      // Section 3: Find your Flow
      '3-1': 'intro-flow',  // Also handled as 'intro-to-flow'
      '3-2': 'flow-assessment',
      '3-3': 'flow-rounding-out',
      '3-4': 'flow-star-card',
      
      // Section 4: Visualize your Potential
      '4-1': 'wellbeing',
      '4-2': 'cantril-ladder',
      '4-3': 'visualizing-you',
      '4-4': 'future-self',
      '4-5': 'your-statement',
      
      // Section 5: Resources
      '5-1': 'your-star-card',
      '5-2': 'pdf-summary',
    };
    
    // Special case for intro-to-flow which has two possible content keys
    if (currentContent === 'intro-to-flow' && stepId === '3-1') {
      return 'intro-to-flow';
    }
    
    return contentKeyMap[stepId] || `placeholder-${stepId}`;
  };

  // Function to handle window resize and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Menu button - visible when drawer is closed (on mobile or desktop) */}
      {!drawerOpen && (
        <button
          onClick={toggleDrawer}
          className={cn(
            "fixed top-1/2 -translate-y-1/2 z-30 bg-white rounded-full shadow-md w-10 h-10 flex items-center justify-center border border-gray-200",
            isMobile ? "left-2" : "left-5"
          )}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
      )}
      
      {/* Overlay for mobile when drawer is open */}
      {isMobile && drawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
      
      {/* Navigation Drawer */}
      <div className={cn(
        "bg-white shadow-sm transition-all duration-300 ease-in-out border-r border-gray-200",
        // Mobile styles - use fixed position when open, hide when closed
        // Add padding at the bottom for mobile to account for the footer bar
        isMobile ? cn(
          "fixed top-[calc(var(--header-height,44px))] left-0 bottom-14 z-30 pb-4",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        ) : cn(
          "h-full relative",
          drawerOpen ? "w-80" : "hidden" // Hide completely when closed on desktop
        )
      )}>
        {/* Toggle Button - position depends on mobile/desktop */}
        <button
          onClick={toggleDrawer}
          className={cn(
            "z-10 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow border border-gray-200",
            isMobile 
              ? "absolute top-4 right-4" 
              : "absolute -right-3 top-12"
          )}
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
        >
          {drawerOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        
        {/* Navigation Content */}
        <div className="p-4 h-full overflow-y-auto">
          {/* Title */}
          <h2 className="font-bold text-xl mb-4 text-gray-800">
            Your Learning Journey
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
                      
                      {/* Progress indicator for sections other than Resources */}
                      {section.id !== '5' && (
                        <span className="ml-auto text-xs text-gray-500">
                          {section.completedSteps}/{section.totalSteps}
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Steps List */}
                {drawerOpen && (
                  <ul className="pl-7 space-y-1">
                    {section.steps.map((step) => {
                      // For Resources section, we handle special logic for Your Star Card
                      const isResourceSection = section.id === '5';
                      const isStarCardResource = step.id === '5-3';
                      
                      // Resources section items never show checkmarks
                      const isCompleted = isResourceSection ? false : completedSteps.includes(step.id);
                      
                      // Special accessibility check for Star Card resource
                      const isSpecialAccessRestricted = isResourceSection && isStarCardResource && !isStarCardComplete;
                      const isAccessible = isSpecialAccessRestricted ? false : isStepAccessible(section.id, step.id);
                      
                      return (
                        <TooltipProvider key={step.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <li 
                                className={cn(
                                  "rounded-md p-2 flex items-center text-sm transition",
                                  // Check if this item corresponds to current content
                                  getContentKeyFromStepId(section.id, step.id) === currentContent 
                                    ? "bg-indigo-100 text-indigo-700 border-l-2 border-indigo-600 font-medium" : "",
                                  isCompleted 
                                    ? "text-green-700 bg-green-50" 
                                    : isAccessible
                                      ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
                                      : "text-gray-400 cursor-not-allowed"
                                )}
                                onClick={() => {
                                  if (isAccessible) {
                                    handleStepClick(section.id, step.id);
                                    // Close drawer on mobile after selection
                                    if (isMobile) {
                                      toggleDrawer();
                                    }
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
                                
                                <span className="flex-1">{step.label}</span>
                                
                                {/* Content type icons on the right side - 25% lighter */}
                                <div className="ml-2 flex-shrink-0 opacity-75">
                                  {step.type === 'Learning' && (
                                    <BookOpen className="h-4 w-4 text-indigo-400" />
                                  )}
                                  {step.type === 'Assessment' && (
                                    <Activity className="h-4 w-4 text-orange-400" />
                                  )}
                                  {step.type === 'Reflection' && (
                                    <PenLine className="h-4 w-4 text-purple-400" />
                                  )}
                                  {(!step.type) && (
                                    <FileText className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </li>
                            </TooltipTrigger>
                            {!isAccessible && (
                              <TooltipContent side="right">
                                {isSpecialAccessRestricted ? (
                                  <p className="text-xs">Complete Strengths Assessment and Flow Attributes first</p>
                                ) : (
                                  <p className="text-xs">Complete previous steps first</p>
                                )}
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
    </>
  );
};

export default UserHomeNavigation;