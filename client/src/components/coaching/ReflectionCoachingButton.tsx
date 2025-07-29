import React from 'react';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { useCoachingModal } from '@/hooks/useCoachingModal';
import { isFeatureEnabled, clientFeatureFlags } from '@/utils/featureFlags';

interface ReflectionCoachingButtonProps {
  reflectionContext: {
    question: string;
    type: string; // 'strength', 'team-values', 'unique-contribution', etc.
    currentStep?: number;
    strengthLabel?: string;
    strengthScore?: number;
    strengthColor?: string;
    allStrengths?: Array<{
      label: string;
      score: number;
      color: string;
    }>;
  };
  onSaveReflection?: (reflectionText: string) => void;
}

const ReflectionCoachingButton: React.FC<ReflectionCoachingButtonProps> = ({ 
  reflectionContext,
  onSaveReflection
}) => {
  const { openModal } = useCoachingModal();

  const handleCoachingClick = () => {
    // Check if reflection modal is enabled
    const modalEnabled = clientFeatureFlags.reflectionModal?.enabled || false;
    
    if (!modalEnabled) {
      console.log('Reflection modal disabled - chat popup will be implemented soon');
      return;
    }

    // Create StrengthData object that matches the expected interface
    const strengthData = {
      name: reflectionContext.strengthLabel || 'Reflection Coaching',
      description: `Coaching for: ${reflectionContext.question}`,
      score: reflectionContext.strengthScore,
      color: reflectionContext.strengthColor,
      allStrengths: reflectionContext.allStrengths
    };

    // Create optional reflection object with context
    const reflectionData = {
      id: `reflection-${Date.now()}`,
      question: reflectionContext.question,
      response: '',
      wordCount: 0
    };

    openModal(strengthData, reflectionData);
  };

  return (
    <div className="mb-2">
      <button
        onClick={handleCoachingClick}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-md transition-colors duration-200 text-purple-700 hover:text-purple-800"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="font-medium">I don't know what to write</span>
        <MessageCircle className="w-4 h-4" />
      </button>
      <p className="text-xs text-purple-600 mt-1">
        Get coaching questions to help you reflect
      </p>
    </div>
  );
};

export default ReflectionCoachingButton;