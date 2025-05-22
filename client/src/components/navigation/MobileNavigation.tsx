import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronRight, 
  Check, 
  Lock,
  BookOpen,
  Star,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Define navigation structure based on the exact spreadsheet content and paths
const defaultSections = [
  { 
    id: '1', 
    title: 'All star teams Introduction', 
    path: '/intro',
    totalSteps: 1,
    completedSteps: 0,
    icon: 'BookOpen',
    steps: [
      { id: '1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning' },
    ]
  },
  { 
    id: '2', 
    title: 'Discover your Strengths', 
    path: '/discover-strengths',
    totalSteps: 4,
    completedSteps: 0,
    icon: 'Star',
    steps: [
      { id: '2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning' },
      { id: '2-2', label: 'Strengths Assessment', path: '/assessment', type: 'Activity' },
      { id: '2-3', label: 'Star Card Preview', path: '/starcard-preview', type: 'Learning' },
      { id: '2-4', label: 'Reflect', path: '/discover-strengths/reflect', type: 'Writing' },
    ]
  },
  { 
    id: '3', 
    title: 'Find your Flow', 
    path: '/find-your-flow',
    totalSteps: 4,
    completedSteps: 0,
    icon: 'Clock',
    steps: [
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning' },
      { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
      { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing' },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity' },
    ]
  },
  { 
    id: '4', 
    title: 'Visualize your Potential', 
    path: '/visualize-potential',
    totalSteps: 5,
    completedSteps: 0,
    icon: 'Target',
    steps: [
      { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning' },
      { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing' },
      { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity' },
      { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning' },
      { id: '4-5', label: 'Your Statement', path: '/your-statement', type: 'Writing' },
    ]
  }
];

interface Section {
  id: string;
  title: string;
  path: string;
  icon?: string;
  totalSteps?: number;
  completedSteps?: number;
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
  
  // Get the main section ID from the current step ID (e.g., "F2-1" -> "F2")
  const currentMainSection = currentSectionId?.split('-')[0] || null;
  
  return (
    <div className={cn("w-full space-y-4 py-4 pb-8", className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">YOUR MODULES</h3>
      
      {sections.map((section) => {
        const isActive = section.id === currentMainSection;
        const isExpanded = expandedSection === section.id;
        const isCompleted = section.steps?.every(step => completedSteps.includes(step.id)) || false;
        
        return (
          <div key={section.id} className="mb-2">
            <div 
              className={cn(
                "w-full rounded-md py-4 px-5 transition-all duration-200 cursor-pointer shadow-sm",
                isActive 
                  ? "bg-violet-50 border-l-4 border-l-violet-500" 
                  : isCompleted 
                    ? "bg-white border-l-4 border-l-green-500" 
                    : "bg-white border-0"
              )}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon === 'BookOpen' && <BookOpen className="h-6 w-6 text-violet-500" />}
                  {section.icon === 'Star' && <Star className="h-6 w-6 text-violet-500" />}
                  {section.icon === 'Clock' && <Clock className="h-6 w-6 text-violet-500" />}
                  {section.icon === 'Target' && <Target className="h-6 w-6 text-violet-500" />}
                  {section.icon === 'CheckCircle' && <CheckCircle className="h-6 w-6 text-violet-500" />}
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-medium text-lg",
                      isActive ? "text-violet-900" : "text-gray-800"
                    )}>
                      {section.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {section.completedSteps} of {section.totalSteps} complete
                    </span>
                  </div>
                </div>
                
                <ChevronRight className={cn(
                  "h-5 w-5",
                  isActive ? "text-violet-500" : "text-gray-400"
                )} />
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
                                : step.type === 'Writing'
                                  ? "bg-teal-50 text-teal-700"
                                  : "bg-gray-50 text-gray-700"
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