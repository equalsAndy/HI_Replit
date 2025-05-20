import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';

// Define the learning journey sections based on the image
const defaultSections = [
  { id: 'F1', title: 'Star Self-Assessment', path: '/assessment' },
  { id: 'F2', title: 'Core Strengths', path: '/core-strengths' },
  { id: 'F3', title: 'Flow State', path: '/find-your-flow' },
  { id: 'F4', title: 'Rounding Out', path: '/rounding-out' },
  { id: 'F5', title: 'Visualizing Potential', path: '/visualize-yourself' },
  { id: 'F6', title: 'Ladder of Well-Being', path: '/well-being' },
  { id: 'F7', title: 'Future Self', path: '/future-self' },
];

interface MobileNavigationProps {
  currentSectionId?: string;
  className?: string;
  customSections?: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

export function MobileNavigation({
  currentSectionId,
  className,
  customSections
}: MobileNavigationProps) {
  const [, navigate] = useLocation();
  const { completedSteps } = useNavigationProgress();
  
  const sections = customSections || defaultSections;
  
  return (
    <div className={cn("w-full space-y-2 py-4", className)}>
      <h3 className="text-sm font-medium text-gray-500 mb-3">LEARNING JOURNEY</h3>
      
      {sections.map((section) => {
        const isActive = section.id === currentSectionId;
        const isCompleted = completedSteps.includes(section.id);
        
        return (
          <div 
            key={section.id}
            className={cn(
              "w-full rounded-md transition-all duration-200 cursor-pointer border",
              isActive 
                ? "bg-yellow-50 border-yellow-300" 
                : isCompleted 
                  ? "bg-green-50 border-green-200" 
                  : "bg-white border-gray-200"
            )}
            onClick={() => navigate(section.path)}
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
              
              <ChevronRight className={cn(
                "h-4 w-4",
                isActive ? "text-yellow-500" : isCompleted ? "text-green-500" : "text-gray-400"
              )} />
            </div>
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