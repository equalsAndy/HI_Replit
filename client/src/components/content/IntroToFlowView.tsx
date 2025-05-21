import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';

const IntroToFlowView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Introduction to Flow</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Understanding Your Flow State</h2>
        
        <p className="text-gray-700 mb-4">
          Flow is the mental state where you are fully immersed in an activity, experiencing
          energized focus, full involvement, and enjoyment in the process. It's when you're
          "in the zone" — time seems to disappear and you produce your best work effortlessly.
        </p>
        
        <p className="text-gray-700 mb-6">
          Your strongest strengths naturally create opportunities for flow experiences.
          When you understand your flow patterns, you can design your work and life to
          create more of these deeply satisfying moments.
        </p>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-indigo-800 mb-2">Key Flow Characteristics:</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Complete concentration on the task</li>
            <li>Clarity of goals and immediate feedback</li>
            <li>Balance between challenge and skills</li>
            <li>Sense of control and reduced self-consciousness</li>
            <li>Transformed perception of time</li>
            <li>Activity becomes intrinsically rewarding</li>
          </ul>
        </div>
        
        <p className="text-gray-700 mb-4">
          In the next step, you'll identify your personal flow triggers and patterns
          through a self-assessment. This will help you recognize and create more flow
          experiences in your daily life and work.
        </p>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button
          onClick={() => {
            if (setCurrentContent) {
              setCurrentContent('reflection');
            }
          }}
          variant="outline"
        >
          Previous: Reflection
        </Button>
        
        <Button
          onClick={() => {
            if (markStepCompleted) {
              markStepCompleted('3-1');
            }
            if (setCurrentContent) {
              setCurrentContent('flow-assessment');
            }
          }}
          variant="default"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Continue to Flow Assessment
        </Button>
      </div>
    </div>
  );
};

export default IntroToFlowView;