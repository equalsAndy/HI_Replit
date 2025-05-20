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

// Define the learning journey sections based on the provided image and table content
const defaultSections = [
  { 
    id: '1', 
    title: 'Foundations', 
    path: '/foundations',
    totalSteps: 3,
    completedSteps: 0,
    icon: 'BookOpen',
    steps: [
      { id: '1-1', label: 'Welcome', path: '/foundations', type: 'Learning' },
      { id: '1-2', label: 'Your Learning Journey', path: '/learning-overview', type: 'Learning' },
      { id: '1-3', label: 'Understanding Strengths', path: '/strength-model', type: 'Learning' },
    ]
  },
  { 
    id: '2', 
    title: 'Reflect On Your Strengths', 
    path: '/core-strengths',
    totalSteps: 3,
    completedSteps: 0,
    icon: 'Star',
    steps: [
      { id: '2-1', label: 'Core Strengths Overview', path: '/core-strengths', type: 'Learning' },
      { id: '2-2', label: 'Strength Reflection', path: '/strength-reflection', type: 'Writing' },
      { id: '2-3', label: 'Knowledge Check', path: '/strength-check', type: 'Activity' },
    ]
  },
  { 
    id: '3', 
    title: 'Identify Your Flow', 
    path: '/flow-assessment',
    totalSteps: 3,
    completedSteps: 0,
    icon: 'Clock',
    steps: [
      { id: '3-1', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
      { id: '3-2', label: 'Find Your Flow', path: '/find-your-flow', type: 'Learning' },
      { id: '3-3', label: 'Flow Attributes', path: '/flow-attributes', type: 'Activity' },
    ]
  },
  { 
    id: '4', 
    title: 'Rounding Out', 
    path: '/rounding-out',
    totalSteps: 3,
    completedSteps: 0,
    icon: 'Target',
    steps: [
      { id: '4-1', label: 'Balance Your Strengths', path: '/rounding-out', type: 'Learning' },
      { id: '4-2', label: 'Team Integration', path: '/team-integration', type: 'Learning' },
      { id: '4-3', label: 'Practice Scenarios', path: '/practice-scenarios', type: 'Activity' },
    ]
  },
  { 
    id: '5', 
    title: 'Complete Your Star Card', 
    path: '/star-card-overview',
    totalSteps: 2,
    completedSteps: 0,
    icon: 'CheckCircle',
    steps: [
      { id: '5-1', label: 'Star Card Overview', path: '/star-card-overview', type: 'Learning' },
      { id: '5-2', label: 'Your Star Card', path: '/report', type: 'Summary' },
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
            
            {/* We'll remove the dropdown steps as per the screenshot style */}
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