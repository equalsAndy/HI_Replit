import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Card, CardContent } from '@/components/ui/card';

const IntroToFlowView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Introduction to Flow</h1>
      
      <Card className="mb-8">
        <CardContent className="p-0 overflow-hidden">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/JxdhWd8agmE"
              title="Flow Video"
              className="w-full h-[400px]" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Understanding Flow State</h2>
        
        <p className="text-gray-700 mb-4">
          Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, and enjoyment in
          the process. It's often described as being "in the zone" - when time seems to disappear and you're completely absorbed
          in what you're doing.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Clear Goals</h3>
            <p className="text-gray-700">
              You know exactly what you need to accomplish and can measure your progress.
            </p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">Balance of Challenge & Skill</h3>
            <p className="text-gray-700">
              The task is challenging enough to engage you but not so difficult that it causes anxiety.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Immediate Feedback</h3>
            <p className="text-gray-700">
              You can quickly tell how well you're doing, allowing for adjustment in real-time.
            </p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Deep Concentration</h3>
            <p className="text-gray-700">
              Your attention is completely focused on the task at hand, with no distractions.
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Benefits of Flow State</h2>
        
        <p className="text-gray-700 mb-4">
          Regularly experiencing flow is associated with:
        </p>
        
        <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
          <li>Higher productivity and performance</li>
          <li>Increased creativity and innovation</li>
          <li>Greater enjoyment and satisfaction</li>
          <li>Reduced stress and anxiety</li>
          <li>Enhanced learning and skill development</li>
        </ul>
        
        <p className="text-gray-700 mb-4">
          Your strongest strengths naturally create opportunities for flow experiences.
          When you understand your flow patterns, you can design your work and life to
          create more of these deeply satisfying moments.
        </p>
        
        <p className="text-gray-700">
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