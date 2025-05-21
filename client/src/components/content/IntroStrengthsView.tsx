import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { CheckCircle } from 'lucide-react';

const IntroStrengthsView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Everyone has unique strengths that they bring to work and life. This assessment will help you
          identify your natural strengths across four key dimensions.
        </p>
      </div>

      <div className="aspect-w-16 aspect-h-9 mb-8">
        <iframe 
          src="https://www.youtube.com/embed/Hh8S3Y8-_3o" 
          title="Introduction to Strengths" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-80 rounded border border-gray-200"
        ></iframe>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800 mb-3 text-lg">Thinking</h3>
          <p className="text-green-700">
            Strategic, analytical, and logical. These strengths help you 
            process information, solve problems, and make decisions.
          </p>
        </div>
        
        <div className="bg-red-50 p-5 rounded-lg border border-red-100">
          <h3 className="font-medium text-red-800 mb-3 text-lg">Acting</h3>
          <p className="text-red-700">
            Dynamic, energetic, and practical. These strengths help you 
            take action, initiate change, and make things happen.
          </p>
        </div>
        
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-3 text-lg">Feeling</h3>
          <p className="text-blue-700">
            Empathetic, intuitive, and relationship-oriented. These strengths help you
            connect with others, build rapport, and understand emotions.
          </p>
        </div>
        
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-yellow-800 mb-3 text-lg">Planning</h3>
          <p className="text-yellow-700">
            Organized, detailed, and methodical. These strengths help you
            create structure, maintain order, and ensure reliability.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
        <p className="text-amber-700">
          For each scenario, drag and drop the options to rank them from most like you (1) to least 
          like you (4). There are no right or wrong answers - just be honest about your preferences.
        </p>
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
          onClick={() => {
            markStepCompleted('2-1');
            setCurrentContent("strengths-assessment");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
          size="lg"
        >
          Start Assessment
        </Button>
      </div>
    </>
  );
};

export default IntroStrengthsView;