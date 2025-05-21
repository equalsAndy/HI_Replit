import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ArrowRight } from 'lucide-react';

const WelcomeView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams</h1>
        
        <div className="prose max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            Begin your journey to discover your natural strengths, enhance your flow state, 
            and visualize your unlimited potential.
          </p>
        </div>
        
        <div className="aspect-w-16 aspect-h-9 mb-10">
          <iframe 
            src="https://www.youtube.com/embed/pwJ2LNJZY3g" 
            title="Welcome to AllStarTeams" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-96 rounded-lg shadow-md"
          ></iframe>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
          <h3 className="text-xl font-semibold text-green-800 mb-3">Discover Your Strengths</h3>
          <p className="text-green-700 mb-4">
            Uncover your unique combination of thinking, acting, feeling, and planning strengths 
            that drive your success.
          </p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Find Your Flow</h3>
          <p className="text-blue-700 mb-4">
            Identify what brings you into a state of energized focus and full engagement, 
            so you can create more peak experiences.
          </p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 shadow-sm">
          <h3 className="text-xl font-semibold text-purple-800 mb-3">Visualize Your Potential</h3>
          <p className="text-purple-700 mb-4">
            Create a clear vision of your future self and the impact you can make
            when operating at your highest potential.
          </p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => {
            markStepCompleted('1-1');
            setCurrentContent("intro-strengths");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
          size="lg"
        >
          Begin Your Journey <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export default WelcomeView;