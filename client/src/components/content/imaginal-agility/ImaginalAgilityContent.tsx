import React from 'react';
import { ContentViewProps } from '@/shared/types';
import IAIntroductionView from './IAIntroductionView';

interface ImaginalAgilityContentProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen,
}) => {
  console.log('🧭 IA Content Router - Current content:', currentContent);

  switch (currentContent) {
    case 'ia-introduction':
      return (
        <IAIntroductionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          currentContent={currentContent}
        />
      );

    // Placeholder for future IA content
    default:
      return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Imaginal Agility Workshop
            </h1>
            <p className="text-lg text-gray-600">
              Content for "{currentContent}" coming soon...
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Imaginal Agility Development
            </h2>
            <p className="text-blue-800">
              This section is being developed to provide comprehensive training in imagination-based problem solving and creative thinking.
            </p>
          </div>
        </div>
      );
  }
};

export default ImaginalAgilityContent;