import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight } from 'lucide-react';

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
          This assessment will help you identify your natural strengths across four key dimensions:
          Thinking, Acting, Feeling, and Planning.
        </p>
        
        <div className="aspect-w-16 aspect-h-9 mb-8">
          <iframe 
            src="https://www.youtube.com/embed/vDkb0uG4CGs" 
            title="Strengths Assessment Instructions" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-80 rounded border border-gray-200"
          ></iframe>
        </div>
        
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
          <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
          <p className="text-amber-700">
            For each scenario, drag and drop the options to rank them from most like you (1) to least 
            like you (4). There are no right or wrong answers - just be honest about your preferences.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsAssessmentModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
            size="lg"
          >
            Start Assessment <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default AssessmentView;