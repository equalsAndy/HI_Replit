import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { ChevronRight } from 'lucide-react';

interface FlowQuestion {
  id: number;
  text: string;
}

// Flow assessment questions
const flowQuestions: FlowQuestion[] = [
  { id: 1, text: "I often feel deeply focused and energized by my work." },
  { id: 2, text: "The challenges I face are well matched to my skills." },
  { id: 3, text: "I lose track of time when I'm fully engaged." },
  { id: 4, text: "I feel in control of what I'm doing, even under pressure." },
  { id: 5, text: "I receive clear feedback that helps me stay on track." },
  { id: 6, text: "I know exactly what needs to be done in my work." },
  { id: 7, text: "I feel less self-conscious and more spontaneous when I'm in flow." },
  { id: 8, text: "I do things automatically, almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

const FlowAssessmentView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  // Sample rating - in a real implementation, this would be connected to state and database
  const handleAssessmentStart = () => {
    navigate('/find-your-flow/assessment');
    markStepCompleted('3-2');
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Flow Assessment</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          This assessment will help you identify how often you experience flow state and what conditions help you enter flow.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/srLM8lHPj40" 
              title="Understanding Flow Assessment" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-52 rounded border border-gray-200"
            ></iframe>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">About the Assessment</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>12 questions about your flow experiences</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Rate each statement from 1 (Never) to 5 (Always)</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Takes approximately 3-5 minutes to complete</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                <span>Results show your flow profile and recommendations</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 mb-8">
          <h3 className="font-medium text-indigo-800 mb-3 text-lg">Sample Question</h3>
          <p className="text-indigo-700 mb-3">I lose track of time when I'm fully engaged.</p>
          <div className="mb-2">
            <Slider
              defaultValue={[3]}
              max={5}
              step={1}
              disabled={true}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-indigo-600">
            <span>Never</span>
            <span>Rarely</span>
            <span>Sometimes</span>
            <span>Often</span>
            <span>Always</span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={handleAssessmentStart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
            size="lg"
          >
            Start Flow Assessment <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default FlowAssessmentView;