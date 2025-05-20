import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Define the learning journey sections with nested steps
const defaultSections = [
  { 
    id: 'F1', 
    title: 'Star Self-Assessment', 
    path: '/assessment',
    steps: [
      { id: 'F1-1', label: 'About the Assessment', path: '/assessment/about' },
      { id: 'F1-2', label: 'Take the Assessment', path: '/assessment' },
      { id: 'F1-3', label: 'Review Results', path: '/assessment/results' },
    ]
  },
  { 
    id: 'F2', 
    title: 'Core Strengths', 
    path: '/core-strengths',
    steps: [
      { id: 'F2-1', label: 'Understand Your Strengths', path: '/core-strengths' },
      { id: 'F2-2', label: 'Strengths Reflection', path: '/strength-reflection' },
    ]
  },
  { 
    id: 'F3', 
    title: 'Flow State', 
    path: '/find-your-flow',
    steps: [
      { id: 'F3-1', label: 'Find Your Flow', path: '/find-your-flow' },
      { id: 'F3-2', label: 'Flow Attributes', path: '/flow-attributes' },
    ]
  },
  { 
    id: 'F4', 
    title: 'Rounding Out', 
    path: '/rounding-out',
    steps: [
      { id: 'F4-1', label: 'Balance Your Strengths', path: '/rounding-out' },
      { id: 'F4-2', label: 'Team Integration', path: '/team-integration' },
    ]
  },
  { 
    id: 'F5', 
    title: 'Visualizing Potential', 
    path: '/visualize-yourself',
    steps: [
      { id: 'F5-1', label: 'Visualization Exercise', path: '/visualize-yourself' },
      { id: 'F5-2', label: 'Future Possibilities', path: '/future-possibilities' },
    ]
  },
  { 
    id: 'F6', 
    title: 'Ladder of Well-Being', 
    path: '/well-being',
    steps: [
      { id: 'F6-1', label: 'Well-Being Introduction', path: '/well-being' },
      { id: 'F6-2', label: 'Your Well-Being Plan', path: '/well-being-plan' },
    ]
  },
  { 
    id: 'F7', 
    title: 'Future Self', 
    path: '/future-self',
    steps: [
      { id: 'F7-1', label: 'Envisioning Your Future', path: '/future-self' },
      { id: 'F7-2', label: 'Action Planning', path: '/action-planning' },
    ]
  },
];

interface Section {
  id: string;
  title: string;
  path: string;
  steps?: Array<{
    id: string;
    label: string;
    path: string;
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
  const { completedSteps } = useNavigationProgress();
  const [expandedSection, setExpandedSection] = useState<string | null>(currentSectionId?.split('-')[0] || null);
  
  const sections = customSections || defaultSections;

  const toggleSection = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      // Don't navigate if we're just expanding to see steps
    }
  };
  
  // Get the main section ID from the current step ID (e.g., "F1-2" -> "F1")
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
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : section.id.replace('F', '')}
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
            <AnimatePresence>
              {isExpanded && section.steps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pl-8 pr-3 py-2 space-y-2 mt-1 border border-gray-100 rounded-md bg-gray-50">
                    {section.steps.map((step) => {
                      const isStepActive = currentSectionId === step.id;
                      const isStepCompleted = completedSteps.includes(step.id);
                      
                      return (
                        <div 
                          key={step.id}
                          className={cn(
                            "p-2 rounded-md cursor-pointer transition-colors",
                            isStepActive 
                              ? "bg-yellow-100" 
                              : isStepCompleted 
                                ? "bg-green-50" 
                                : "bg-white hover:bg-gray-100"
                          )}
                          onClick={() => navigate(step.path)}
                        >
                          <div className="flex items-center">
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
                            <span className={cn(
                              "text-sm",
                              isStepActive ? "font-medium text-yellow-800" : isStepCompleted ? "text-green-700" : "text-gray-700"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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