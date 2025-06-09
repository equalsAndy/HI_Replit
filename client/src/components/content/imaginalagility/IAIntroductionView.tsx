import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import VideoPlayer from '../../VideoPlayer';
import { useIANavigationProgress } from '../../../hooks/use-navigation-progress-ia';

interface IAIntroductionViewProps {
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
  currentContent: string;
}

const IAIntroductionView: React.FC<IAIntroductionViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  currentContent
}) => {
  const { isNextButtonEnabled } = useIANavigationProgress();
  const stepId = 'ia-1-1';
  
  const handleNext = () => {
    console.log('🎯 IA Introduction - Next button clicked');
    
    if (markStepCompleted) {
      markStepCompleted(stepId);
    }
    
    // Navigate to next IA step
    if (setCurrentContent) {
      setCurrentContent('ia-triple-challenge');
    }
  };

  const nextButtonEnabled = isNextButtonEnabled(stepId);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="text-sm font-medium text-blue-600 mb-2">
          Imaginal Agility Workshop Course › Orientation
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Introduction to Imaginal Agility
        </h1>
      </div>

      {/* Video Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <VideoPlayer
          stepId={stepId}
          workshopType="imaginalagility"
          autoplay={true}
        />
      </div>

      {/* Welcome Content */}
      <div className="bg-gray-50 p-6 sm:p-8 rounded-lg space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
          Welcome.
        </h2>
        
        <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
          <p>
            Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.
          </p>
          
          <p>
            As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.
          </p>
          
          <p>
            This Micro Course is your starting point.
          </p>
          
          <p>
            You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.
          </p>
          
          <p>
            It's the first step in building <strong>Imaginal Agility</strong> — a skillset for navigating change, solving problems, and creating value.
          </p>
          
          <p>
            Next, you'll meet with your team to turn fresh insight into shared breakthroughs.
          </p>
          
          <p className="font-medium">
            You're not just learning about imagination. You're harnessing it — together.
          </p>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!nextButtonEnabled}
          className="px-6 py-3 text-base font-medium"
        >
          Next: Triple Challenge
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IAIntroductionView;