import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Card } from '@/components/ui/card';
import { CheckCircleIcon, ChevronRightIcon, TimerIcon } from 'lucide-react';

interface ContentSectionProps {
  children: ReactNode;
  title: string;
  description?: string;
  stepId: string;
  estimatedTime?: number; // In minutes
  required?: boolean;
  onNextClick?: () => void;
  onBackClick?: () => void;
  showNextButton?: boolean;
  showBackButton?: boolean;
  nextButtonText?: string;
  backButtonText?: string;
}

export default function ContentSection({
  children,
  title,
  description,
  stepId,
  estimatedTime,
  required = true,
  onNextClick,
  onBackClick,
  showNextButton = true,
  showBackButton = false,
  nextButtonText = 'Continue',
  backButtonText = 'Back'
}: ContentSectionProps) {
  const { markStepCompleted } = useNavigationProgress();
  
  const handleNextClick = () => {
    // Mark current step as completed when moving forward
    markStepCompleted(stepId);
    
    // Call provided onNextClick handler if any
    if (onNextClick) {
      onNextClick();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
      <div className="border-b border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          
          {estimatedTime && (
            <div className="flex items-center text-sm text-gray-500">
              <TimerIcon className="w-4 h-4 mr-1" />
              <span>~{estimatedTime} min</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {children}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
        {showBackButton && (
          <Button 
            variant="outline" 
            onClick={onBackClick} 
            className="flex items-center"
          >
            <span className="mr-2">←</span>
            {backButtonText}
          </Button>
        )}
        
        <div className="flex-1"></div>
        
        {showNextButton && (
          <Button 
            onClick={handleNextClick}
            className="flex items-center gap-1"
          >
            {nextButtonText}
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}