import React, { useState, useEffect } from 'react';
import { NavigationSection, StarCard, User, FlowAttributesResponse } from '@/shared/types';
import { navigationSections } from './navigationData';
import { Button } from '@/components/ui/button';
import Logo from '@/components/branding/Logo';
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
  FileText,
  Download,
  Calendar,
  Users,
  Eye,
  Plus,
  BarChart3,
  ImageIcon,
  Zap,
  Presentation,
  Info
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAssessmentWithReset } from '@/hooks/use-assessment-with-reset';
import { useTestUser } from '@/hooks/useTestUser';
import { getSectionProgress, SECTION_STEPS } from '@/utils/progressionLogic';

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
  navigation?: any; // Navigation hook instance from parent - made optional
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
  isImaginalAgility = false,
  navigation: navigationProp
}) => {
  // State to track if we're on mobile or not
  const [isMobile, setIsMobile] = useState(false);
  
  // Test user check for restricted features
  const { shouldShowDemoButtons } = useTestUser();
  
  // Always use the navigation prop passed from parent component
  // This prevents duplicate hook instances that cause React setState warnings
  if (!navigationProp) {
    console.error('WorkshopNavigationSidebar: navigation prop is required but not provided');
    return null;
  }
  const navigation = navigationProp;
  const { progress: navigationProgress } = navigation; // Extract for backward compatibility
  
  // Use section expansion state from navigation progress for IA with manual override capability
  const [manualExpansion, setManualExpansion] = useState<Record<string, boolean>>({});
  
  const baseExpandedSections = isImaginalAgility 
    ? (navigationProgress?.sectionExpansion || {
        '1': true, '2': true, '3': false, '4': false, '5': false, '6': false, '7': false
      })
    : {};
    
  // Combine automatic expansion with manual overrides
  const expandedSections = isImaginalAgility ? {
    ...baseExpandedSections,
    ...manualExpansion  // Manual overrides take precedence
  } : {};
    
  // Debug logging for section expansion
  React.useEffect(() => {
    if (isImaginalAgility && navigationProgress?.sectionExpansion) {
      console.log(`📖 KAN-112 Section Expansion State:`, navigationProgress.sectionExpansion);
      console.log(`📖 Manual Overrides:`, manualExpansion);
      console.log(`📖 Final Expanded Sections:`, expandedSections);
    }
  }, [isImaginalAgility, navigationProgress?.sectionExpansion, manualExpansion]);

  const toggleSection = (sectionId: string) => {
    if (isImaginalAgility) {
      // KAN-112: Allow manual override of automatic expansion state
      setManualExpansion(prev => ({
        ...prev,
        [sectionId]: !expandedSections[sectionId]
      }));
      console.log(`📖 KAN-112: Manual toggle of section ${sectionId}`);
    }
  };
  const { assessmentData: starCardData, isReset: isStarCardReset } = useAssessmentWithReset('starcard', '/api/workshop-data/starcard');
  const { assessmentData: flowData, isReset: isFlowReset } = useAssessmentWithReset('flow-attributes', '/api/workshop-data/flow-attributes');

  // Use the actual completed steps without reset override
  const effectiveCompletedSteps = completedSteps;
  
  // Debug logging for completed steps (disabled to reduce console spam)
  // console.log(`📊 UserHomeNavigation Debug:`, {
  //   completedSteps,
  //   effectiveCompletedSteps,
  //   completedStepsType: typeof completedSteps,
  //   isArray: Array.isArray(completedSteps),
  //   length: completedSteps?.length
  // });

  // Calculate section progress based on completed steps - Updated for dynamic navigation structure
  const getSectionProgressLocal = (sectionId: string, completedSteps: string[]) => {
    // Find the actual section from navigationSections to get its steps
    const section = navigationSections.find(s => s.id === sectionId);
    if (!section) return { completed: 0, total: 0, display: '0/0', isComplete: false };

    const steps = section.steps.map(step => step.id);
    const safeCompletedSteps = Array.isArray(completedSteps) ? completedSteps : [];
    const completedInSection = steps.filter(stepId => safeCompletedSteps.includes(stepId)).length;

    return {
      completed: completedInSection,
      total: steps.length,
      display: `${completedInSection}/${steps.length}`,
      isComplete: completedInSection === steps.length
    };
  };

  // Sequential step accessibility check - strict progression as per original requirements
  // TEMPORARILY DISABLED: All steps accessible for testing
  const isStepAccessibleSequential = (stepId: string, completedSteps: string[]) => {
    return true; // TEMPORARY: Disable step progression
    
    // ORIGINAL LOGIC (commented out temporarily):
    // // Only Introduction Video (1-1) is active initially
    // if (stepId === '1-1') return true;

    // // Sequential step progression
    // const allSteps = [
    //   '1-1', '2-1', '2-2', '2-3', '2-4', 
    //   '3-1', '3-2', '3-3', '3-4',
    //   '4-1', '4-2', '4-3', '4-4', '4-5'
    // ];

    // const stepPosition = allSteps.indexOf(stepId);
    // if (stepPosition === -1) {
    //   // Resource sections unlock after Final Reflection (4-5)
    //   return completedSteps.includes('4-5');
    // }

    // // A step is accessible only if all previous steps are completed
    // for (let i = 0; i < stepPosition; i++) {
    //   if (!completedSteps.includes(allSteps[i])) {
    //     return false;
    //   }
    // }

    // return true;
  };

  // Local state that resets when user progress is reset
  const [localStarCardData, setLocalStarCardData] = useState({
    thinking: 0,
    acting: 0,
    feeling: 0,
    planning: 0
  });

  const [localFlowData, setLocalFlowData] = useState<any>(null);

  // Removed problematic reset detection that was interfering with progression
  const getSectionProgress = (steps: string[]) => {
    const completedInSection = steps.filter(stepId => 
      completedSteps.includes(stepId)
    ).length;

    // Debug logging for false positive detection
    console.log(`📊 Section Progress Debug:`, {
      sectionSteps: steps,
      completedSteps,
      completedInSection,
      total: steps.length,
      display: `${completedInSection}/${steps.length}`,
      stackTrace: new Error().stack?.split('\n').slice(1, 3)
    });

    return {
      completed: completedInSection,
      total: steps.length,
      display: `${completedInSection}/${steps.length}`,
      isComplete: completedInSection === steps.length
    };
  };

  // Helper function to check if individual step is completed
  const isStepCompleted = (stepId: string) => {
    const safeCompletedSteps = Array.isArray(completedSteps) ? completedSteps : [];
    const isCompleted = safeCompletedSteps.includes(stepId);
    // Only log in development and when step state changes to reduce spam
    // console.log(`🔍 Step ${stepId} completion check:`, isCompleted, 'completedSteps:', safeCompletedSteps);
    return isCompleted;
  };

  // Reset local state when user progress is reset - FIXED: Add proper dependency check
  useEffect(() => {
    if (isStarCardReset) {
      console.log('🧹 RESETTING star card local state');
      setLocalStarCardData({
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0
      });
    } else if (starCardData || starCard) {
      const effectiveData = starCardData || starCard;
      setLocalStarCardData({
        thinking: effectiveData?.thinking || 0,
        acting: effectiveData?.acting || 0,
        feeling: effectiveData?.feeling || 0,
        planning: effectiveData?.planning || 0
      });
    }
  }, [isStarCardReset, starCardData, starCard]); // FIXED: Removed navigationProgress dependency

  useEffect(() => {
    if (isFlowReset) {
      console.log('🧹 RESETTING flow attributes local state');
      setLocalFlowData(null);
    } else if (flowData || flowAttributesData) {
      setLocalFlowData(flowData || flowAttributesData);
    }
  }, [isFlowReset, flowData, flowAttributesData]); // FIXED: Removed navigationProgress dependency

  // Use local data for display (will be null/empty if user was reset)
  const effectiveStarCard = navigationProgress === null ? localStarCardData : (starCardData || starCard || localStarCardData);
  const effectiveFlowData = navigationProgress === null ? null : (flowData || flowAttributesData || localFlowData);

  // Determine if the Star Card is complete and flow attributes are available
  const hasStarCard = effectiveStarCard && effectiveStarCard.thinking && effectiveStarCard.acting && effectiveStarCard.feeling && effectiveStarCard.planning;
  const hasFlowAttributes = effectiveFlowData?.attributes && 
                           Array.isArray(effectiveFlowData.attributes) && 
                           effectiveFlowData.attributes.length > 0;
  const isStarCardComplete = hasStarCard && hasFlowAttributes;

  // Helper function to convert step IDs to content keys used in the app
  const getContentKeyFromStepId = (sectionId: string, stepId: string) => {
    // Updated content key mapping for 5-Module Structure - matches AllStarTeamsWorkshop.tsx
    // CRITICAL: These mappings MUST match the navigationSequence in AllStarTeamsWorkshop.tsx
    const contentKeyMap: Record<string, string> = {
      // MODULE 1: GETTING STARTED
      '1-1': 'welcome',
      '1-2': 'self-awareness-opp',
      '1-3': 'about-course',

      // MODULE 2: STRENGTH AND FLOW  
      '2-1': 'star-strengths-assessment',
      '2-2': 'flow-patterns',
      '2-3': 'rounding-out',        // FIXED: Step 2-3 → rounding-out (FlowRoundingOutView)
      '2-4': 'module-2-recap',

      // MODULE 3: VISUALIZE YOUR POTENTIAL
      '3-1': 'wellbeing-ladder',
      '3-2': 'future-self',         // FIXED: Step 3-2 → future-self (ProtectedFutureSelfView)
      '3-3': 'final-reflection',
      '3-4': 'finish-workshop',

      // MODULE 4: TAKEAWAYS & NEXT STEPS
      '4-1': 'download-star-card',
      '4-2': 'holistic-report',
      '4-3': 'growth-plan', 
      '4-4': 'team-workshop-prep',

      // MODULE 5: MORE INFORMATION
      '5-1': 'workshop-resources',
      '5-2': 'extra-stuff',
      '5-3': 'more-imaginal-agility',
    };

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
          drawerOpen ? "w-84" : "hidden" // Hide completely when closed on desktop
        )
      )}>
        {/* Application Logo */}
        <div className="p-4 border-b border-gray-200">
          {/* Logo section */}
          <div className="flex items-center mb-2">
            <Logo 
              type={isImaginalAgility ? "imaginal-agility" : "allstarteams"} 
              size="md"
              className="mx-auto"
            />
          </div>
        </div>
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
        <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {/* Navigation Sections */}
          <nav className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.id} className="space-y-2">
                {/* Section Header - Accordion for IA, regular for AST */}
                {(isImaginalAgility || section.title) && (
                  <div className="flex items-start space-x-2">
                    {drawerOpen && (
                      <>
                        {isImaginalAgility ? (
                          // Accordion header for IA
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center justify-between text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex items-center justify-between w-full">
                              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{section.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {getSectionProgressLocal(section.id, effectiveCompletedSteps).display}
                                </span>
                                {expandedSections[section.id] ? (
                                  <ChevronLeft className="w-4 h-4 text-gray-600 transform rotate-90" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                            </div>
                          </button>
                        ) : (
                          // Regular header for AST
                          <>
                            <h3 className="text-sm font-bold text-gray-800 flex-1">{section.title}</h3>
                            {/* Dynamic progress indicator based on completed steps */}
                            {!section.title?.includes('MORE INFORMATION') && section.title !== 'NEXT STEPS' && section.title !== '' && (
                              <span className="ml-auto text-xs text-gray-500">
                                {getSectionProgressLocal(section.id, effectiveCompletedSteps).display}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Steps List */}
                {drawerOpen && (isImaginalAgility ? (expandedSections[section.id] === true) : true) && (
                  <div className="relative">
                    {/* Module/Week Label spanning entire section - centered in 50px gap */}
                    {(section.moduleNumber || section.weekNumber) && (
                      // For AST: hide badges for modules 4 and 5 (post-workshop resources)
                      // For IA: show badges for all modules
                      isImaginalAgility || (section.moduleNumber !== 4 && section.moduleNumber !== 5)
                    ) && (
                      <div
                        className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 z-10"
                        style={{ marginLeft: '-8px' }}
                      >
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1 py-2 rounded text-center whitespace-nowrap"
                             style={{
                               writingMode: 'vertical-rl',
                               textOrientation: 'mixed',
                               transform: 'rotate(180deg)',
                               letterSpacing: '0.05em',
                               lineHeight: '1.2'
                             }}>
                          {section.moduleNumber ? `MODULE${String.fromCharCode(160)}${section.moduleNumber}` : `WEEK${String.fromCharCode(160)}${section.weekNumber}`}
                        </div>
                      </div>
                    )}

                    <ul className="pl-7 space-y-1 relative">

                    {section.steps.map((step, stepIndex) => {
                      // For Resources section, we handle special logic for Your Star Card
                      const isResourceSection = section.id === '5';
                      const isStarCardResource = step.id === '5-3';

                      // SIMPLIFIED MODE: Green checkmark logic - show checkmarks for all completed steps
                      let isCompleted = isStepCompleted(step.id);

                      // Special accessibility check for Star Card resource
                      const isSpecialAccessRestricted = isResourceSection && isStarCardResource && !isStarCardComplete;

                      // Check step accessibility using the passed function from parent (which includes navigation progress state)
                      const isAccessible = isSpecialAccessRestricted ? false : isStepAccessible(section.id, step.id);
                      
                      // FIXED: Use unified navigation for current step detection
                      const isCurrent = navigation.isStepCurrent(step.id);
                      
                      // Get visual state from unified navigation
                      const visualState = navigation.getStepVisualState(step.id);
                      
                      // Debug logging for visual states (only for first few steps to avoid spam)
                      if (['1-1', '1-2', '1-3'].includes(step.id)) {
                        console.log(`🎨 Visual state for ${step.id}:`, {
                          isCurrent,
                          isCompleted,
                          showRoundedHighlight: visualState.showRoundedHighlight,
                          showDarkDot: visualState.showDarkDot,
                          showPulsatingDot: visualState.showPulsatingDot,
                          navigationCurrentStep: navigation.currentStep,
                          navigationCompletedSteps: navigation.completedSteps
                        });
                      }
                      
                      // Check if this is a resource step (Modules 4 & 5) - these don't get progression dots
                      const isResourceStep = ['4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'].includes(step.id);
                      
                      // Use visual state from unified navigation for dots
                      const showDarkDot = visualState.showDarkDot;
                      const showPulsatingDot = visualState.showPulsatingDot;

                      return (
                        <TooltipProvider key={step.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <li 
                                className={cn(
                                  "rounded-md p-2 flex items-center text-sm transition",
                                  // FIXED: Use visual state for highlight instead of isCurrent
                                  visualState.showRoundedHighlight
                                    ? (isImaginalAgility 
                                        ? "bg-purple-100 text-purple-700 border-l-2 border-purple-600 font-medium" 
                                        : "bg-indigo-100 text-indigo-700 border-l-2 border-indigo-600 font-medium") 
                                    : "",
                                  // Completed steps get green styling
                                  isCompleted 
                                    ? "text-green-700 bg-green-50" 
                                    : isAccessible
                                      ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
                                      : "text-gray-400 cursor-not-allowed"
                                )}
                                onClick={() => {
                                  if (isAccessible) {
                                    console.log(`🧭 UserHomeNav: Clicked step ${step.id} in section ${section.id}`);
                                    const contentKey = getContentKeyFromStepId(section.id, step.id);
                                    console.log(`🧭 UserHomeNav: Content key for ${step.id}: ${contentKey}`);
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
                                    <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full" />
                                  ) : showDarkDot ? (
                                    <div className="w-4 h-4 bg-indigo-600 rounded-full" />
                                  ) : showPulsatingDot ? (
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                  ) : !isAccessible ? (
                                    <Lock className="h-4 w-4 text-gray-400" />
                                  ) : null}
                                </div>

                                <span className="flex-1">
                                  {step.title}
                                </span>

                                {/* Content type icons on the right side - 25% lighter */}
                                <div className="ml-2 flex-shrink-0 opacity-75">
                                  {step.type === 'video' && (
                                    <Presentation className="h-4 w-4 text-indigo-400" />
                                  )}
                                  {step.type === 'assessment' && (
                                    <Activity className="h-4 w-4 text-orange-400" />
                                  )}
                                  {step.type === 'content' && (
                                    <Presentation className="h-4 w-4 text-purple-400" />
                                  )}
                                  {step.type === 'download' && (
                                    <Download className="h-4 w-4 text-cyan-400" />
                                  )}
                                  {step.type === 'planning' && (
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                  )}
                                  {step.type === 'collaboration' && (
                                    <Users className="h-4 w-4 text-amber-400" />
                                  )}
                                  {step.type === 'viewing' && (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                  {step.type === 'adding' && (
                                    <Plus className="h-4 w-4 text-emerald-400" />
                                  )}
                                  {step.type === 'reflection' && (
                                    <PenLine className="h-4 w-4 text-purple-400" />
                                  )}
                                  {step.type === 'resources' && (
                                    <Info className="h-4 w-4 text-slate-400" />
                                  )}
                                  {step.type === 'interactive' && (
                                    <BarChart3 className="h-4 w-4 text-violet-400" />
                                  )}
                                  {step.type === 'visual' && (
                                    <ImageIcon className="h-4 w-4 text-pink-400" />
                                  )}
                                  {step.type === 'activity' && (
                                    <Activity className="h-4 w-4 text-orange-400" />
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
                    </div>
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
