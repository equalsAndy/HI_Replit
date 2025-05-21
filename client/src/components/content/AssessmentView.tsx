import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight, ClipboardCheck, CheckCircle } from 'lucide-react';

interface AssessmentViewProps extends ContentViewProps {
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across four key dimensions: Thinking, Acting, Feeling, and Planning.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-5 shadow-sm">
            <h3 className="font-medium text-blue-800 mb-3 text-lg">About this assessment</h3>
            <ul className="text-blue-700 space-y-3">
              <li className="flex items-start">
                <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>22 questions about how you approach work and collaboration</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Takes approximately 10-15 minutes to complete</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Rank options based on how well they describe you</span>
              </li>
              <li className="flex items-start">
                <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Creates your personal Star Card showing your strengths distribution</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-5 shadow-sm">
            <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
            <p className="text-amber-700">
              For each scenario, drag and drop the options to rank them from most like you (1) to least 
              like you (4). There are no right or wrong answers - just be honest about your preferences.
            </p>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-5 shadow-sm mb-8">
          <h3 className="font-medium text-green-800 mb-3 text-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" /> What you'll get
          </h3>
          <p className="text-green-700">
            Your personal Star Card showing your unique distribution of strengths across the four 
            dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
            through the rest of the AllStarTeams program.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsAssessmentModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
            size="lg"
          >
            {starCard?.state === 'partial' ? 'Continue Assessment' : 'Start Assessment'} <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default AssessmentView;