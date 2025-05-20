import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, ChevronDown, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Define the learning journey sections based on the provided table
const defaultSections = [
  { 
    id: 'M1', 
    title: 'All Star Teams Introduction', 
    path: '/intro',
    steps: [
      { id: 'M1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning' },
    ]
  },
  { 
    id: 'M2', 
    title: 'Discover your Strengths', 
    path: '/discover-strengths',
    steps: [
      { id: 'M2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning' },
      { id: 'M2-2', label: 'Strengths Assessment', path: '/assessment', type: 'Activity' },
      { id: 'M2-3', label: 'Star Card Preview', path: '/starcard-preview', type: 'Learning' },
      { id: 'M2-4', label: 'Reflect', path: '/discover-strengths/reflect', type: 'Writing' },
    ]
  },
  { 
    id: 'M3', 
    title: 'Find your Flow', 
    path: '/find-your-flow',
    steps: [
      { id: 'M3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning' },
      { id: 'M3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
      { id: 'M3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing' },
      { id: 'M3-4', label: 'Add Flow to your Star Card', path: '/add-flow-starcard', type: 'Activity' },
    ]
  },
  { 
    id: 'M4', 
    title: 'Visualize your Potential', 
    path: '/visualize-potential',
    steps: [
      { id: 'M4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning' },
      { id: 'M4-2', label: 'Cantril Ladder', path: '/cantril-ladder', type: 'Activity' },
      { id: 'M4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity' },
      { id: 'M4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning' },
      { id: 'M4-5', label: 'Your Statement', path: '/your-statement', type: 'Writing' },
    ]
  }
];

interface Section {
  id: string;
  title: string;
  path: string;
  steps?: Array<{
    id: string;
    label: string;
    path: string;
    type?: string;
  }>;
}

interface MobileNavigationProps {
  currentSectionId?: string;
  className?: string;
  customSections?: Section[];
}

export function MobileNavigation({
  currentSectionId,
  className,
  customSections
}: MobileNavigationProps) {
  const [, navigate] = useLocation();
  const { completedSteps, isStepAccessible } = useNavigationProgress();
  const [expandedSection, setExpandedSection] = useState<string | null>(currentSectionId?.split('-')[0] || null);
  
  const sections = customSections || defaultSections;

  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };
  
  // Get the main section ID from the current step ID (e.g., "M2-1" -> "M2")
  const currentMainSection = currentSectionId?.split('-')[0] || null;
  
  return (
    <div className={cn("w-full space-y-3 py-4", className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-3">LEARNING JOURNEY</h3>
      
      {sections.map((section) => {
        const isActive = section.id === currentMainSection;
        const isExpanded = expandedSection === section.id;
        const isCompleted = section.steps?.every(step => completedSteps.includes(step.id)) || false;
        
        return (
          <div key={section.id} className="mb-2">
            <div 
              className={cn(
                "w-full rounded-md transition-all duration-200 cursor-pointer border",
                isActive 
                  ? "bg-yellow-50 border-yellow-300" 
                  : isCompleted 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-gray-200"
              )}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium",
                    isActive 
                      ? "bg-yellow-400 text-white" 
                      : isCompleted 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-200 text-gray-600"
                  )}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : section.id.replace('M', '')}
                  </div>
                  <span className={cn(
                    "font-medium text-sm",
                    isActive ? "text-yellow-800" : isCompleted ? "text-green-700" : "text-gray-700"
                  )}>
                    {section.title}
                  </span>
                </div>
                
                {isExpanded ? (
                  <ChevronDown className={cn(
                    "h-4 w-4",
                    isActive ? "text-yellow-500" : isCompleted ? "text-green-500" : "text-gray-400"
                  )} />
                ) : (
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    isActive ? "text-yellow-500" : isCompleted ? "text-green-500" : "text-gray-400"
                  )} />
                )}
              </div>
            </div>
            
            {/* Steps within the section */}
            {isExpanded && section.steps && (
              <div className="pl-8 pr-3 py-2 space-y-2 mt-1 border border-gray-100 rounded-md bg-gray-50">
                {section.steps.map((step) => {
                  const isStepActive = currentSectionId === step.id;
                  const isStepCompleted = completedSteps.includes(step.id);
                  const isAccessible = isStepAccessible(step.id);
                  
                  return (
                    <div 
                      key={step.id}
                      className={cn(
                        "p-2 rounded-md transition-colors",
                        isStepActive 
                          ? "bg-yellow-100 cursor-pointer" 
                          : isStepCompleted 
                            ? "bg-green-50 cursor-pointer" 
                            : isAccessible
                              ? "bg-white hover:bg-gray-100 cursor-pointer"
                              : "bg-gray-50 opacity-75 cursor-not-allowed"
                      )}
                      onClick={() => isAccessible ? navigate(step.path) : null}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {!isAccessible && !isStepCompleted ? (
                            <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs bg-gray-300 text-gray-500">
                              <Lock className="h-3 w-3" />
                            </div>
                          ) : (
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs",
                              isStepActive 
                                ? "bg-yellow-400 text-white" 
                                : isStepCompleted 
                                  ? "bg-green-500 text-white" 
                                  : "bg-gray-200 text-gray-600"
                            )}>
                              {isStepCompleted ? <Check className="h-3 w-3" /> : step.id.split('-')[1]}
                            </div>
                          )}
                          <span className={cn(
                            "text-sm",
                            isStepActive 
                              ? "font-medium text-yellow-800" 
                              : isStepCompleted 
                                ? "text-green-700" 
                                : !isAccessible
                                  ? "text-gray-500"
                                  : "text-gray-700"
                          )}>
                            {step.label}
                          </span>
                        </div>
                        
                        {step.type && (
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            step.type === 'Learning' 
                              ? "bg-blue-50 text-blue-700" 
                              : step.type === 'Activity' 
                                ? "bg-purple-50 text-purple-700"
                                : "bg-teal-50 text-teal-700"
                          )}>
                            {step.type}
                          </span>
                        )}
                      </div>
                      
                      {!isAccessible && !isStepCompleted && (
                        <div className="text-xs text-gray-500 mt-1 pl-7">
                          Complete previous steps first
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="mt-6 flex justify-center">
        <Button
          variant="outline"
          className="text-sm border-gray-300"
          onClick={() => navigate('/user-home')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}