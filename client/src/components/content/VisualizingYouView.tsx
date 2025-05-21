import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight, Brain, Eye, Heart } from 'lucide-react';

const VisualizingYouView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Visualizing You</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Visualization is a powerful technique used by elite performers across domains to 
          accelerate growth and progress toward goals. When you vividly imagine your future self, 
          you're actually programming your brain for success.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/WFkEqY8zBJk" 
              title="The Science of Visualization" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 h-full">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">The Science Behind Visualization</h3>
            <div className="space-y-4">
              <div className="flex">
                <Brain className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-indigo-700">Neural Pathways</h4>
                  <p className="text-indigo-600 text-sm">
                    Visualization activates many of the same neural pathways as physical practice, 
                    essentially giving your brain a "rehearsal" of success.
                  </p>
                </div>
              </div>
              <div className="flex">
                <Eye className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-indigo-700">Reticular Activating System</h4>
                  <p className="text-indigo-600 text-sm">
                    Regular visualization trains your brain's RAS to notice opportunities and 
                    resources that align with your visualized future that you might otherwise miss.
                  </p>
                </div>
              </div>
              <div className="flex">
                <Heart className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-indigo-700">Emotional State</h4>
                  <p className="text-indigo-600 text-sm">
                    Visualization that includes emotional elements activates the limbic system,
                    creating positive associations with your goals that enhance motivation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="text-amber-800 font-medium mb-3">Effective Visualization Techniques</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Multi-Sensory Approach</h4>
            <p className="text-sm text-amber-700">
              The most effective visualization engages all your senses. As you imagine your future self,
              incorporate what you see, hear, feel, smell, and even taste in that future scenario.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Process Visualization</h4>
            <p className="text-sm text-amber-700">
              Don't just visualize end goals - research shows visualizing the process and steps to get there
              is more effective. Imagine yourself overcoming specific obstacles along the way.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Third-Person Perspective</h4>
            <p className="text-sm text-amber-700">
              Try visualizing yourself from a third-person perspective occasionally. This can help you see
              yourself more objectively and build confidence by "watching" yourself succeed.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Regular Practice</h4>
            <p className="text-sm text-amber-700">
              Consistency is key. Even 5 minutes of daily visualization can yield significant results.
              Many successful people practice visualization before important events or as part of their morning routine.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('4-3');
            setCurrentContent("future-self");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default VisualizingYouView;