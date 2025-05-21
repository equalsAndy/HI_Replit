import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Check, ChevronRight } from 'lucide-react';

const FlowRoundingOutView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Rounding Out Your Skills</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Once you understand your flow state tendencies, you can strategically develop skills that help you
          access flow more frequently and sustain it longer.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/NeYef0uJh8Y" 
              title="Rounding Out Your Skills" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 h-full">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Key Principles for Skill Development</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-700">
                  <strong>Build on strengths first</strong> - Develop skills that align with your natural tendencies
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-700">
                  <strong>Target complementary skills</strong> - Add skills that balance your profile
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-700">
                  <strong>Create psychological safety</strong> - Establish an environment that supports risk-taking
                </span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-indigo-700">
                  <strong>Design for flow</strong> - Structure activities to match your challenge-skill balance
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h3 className="font-medium text-green-800 mb-3">Skill Development Strategies</h3>
          <ul className="space-y-2 text-green-700 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Deliberate practice with immediate feedback</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Pair with mentors who excel in your target areas</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Break complex skills into manageable components</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-3">Environmental Design</h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Minimize distractions during focused work</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Create visual cues for important tasks</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Establish rituals that signal "flow time"</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
          <h3 className="font-medium text-purple-800 mb-3">Mindset Development</h3>
          <ul className="space-y-2 text-purple-700 text-sm">
            <li className="flex items-start">
              <Check className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Cultivate curiosity and intrinsic motivation</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Practice growth mindset in challenging situations</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Develop resilience through reflection practices</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('3-3');
            setCurrentContent("flow-star-card");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FlowRoundingOutView;