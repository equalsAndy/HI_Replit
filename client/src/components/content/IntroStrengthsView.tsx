import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>
      
      <div className="prose max-w-none">
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <iframe 
            src="https://www.youtube.com/embed/ao04eaeDIFQ" 
            title="Introduction to AllStarTeams" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-80 rounded border border-gray-200"
          ></iframe>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">The Four Quadrants of Strengths</h2>
        <p>
          The AllStarTeams framework identifies four key quadrants of strengths that every person possesses in different proportions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-green-700 font-medium mb-2">Thinking</h3>
            <p className="text-sm">The ability to analyze, strategize, and process information logically. People strong in this quadrant excel at problem-solving and critical thinking.</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="text-red-700 font-medium mb-2">Acting</h3>
            <p className="text-sm">The ability to take decisive action, implement plans, and get things done. People strong in this quadrant are proactive and results-oriented.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-blue-700 font-medium mb-2">Feeling</h3>
            <p className="text-sm">The ability to connect with others, empathize, and build relationships. People strong in this quadrant excel in team environments and social settings.</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h3 className="text-yellow-700 font-medium mb-2">Planning</h3>
            <p className="text-sm">The ability to organize, structure, and create systems. People strong in this quadrant excel at creating order and maintaining processes.</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4">Your Assessment Journey</h3>
        <p>
          In the upcoming assessment, you'll answer a series of questions designed to identify your natural strengths across these four quadrants. For each scenario, you'll rank options from "most like me" to "least like me."
        </p>
        <p>
          Remember: There are no right or wrong answers. The goal is to identify your authentic strengths so you can leverage them more effectively.
        </p>
        
        <div className="flex justify-end mt-6">
          <Button 
            onClick={() => {
              markStepCompleted('2-1');
              setCurrentContent("strengths-assessment");
            }}
            className="bg-indigo-700 hover:bg-indigo-800"
          >
            Take Assessment
          </Button>
        </div>
      </div>
    </>
  );
};

export default IntroStrengthsView;