import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight } from 'lucide-react';

const CantrilLadderView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cantril Ladder</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          The Cantril Self-Anchoring Scale, developed by social researcher Hadley Cantril, 
          is a powerful tool for assessing life satisfaction and tracking your growth over time.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/tvN8FJBeKqQ" 
              title="Understanding the Cantril Ladder" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 h-full">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Key Concepts</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-indigo-700">Self-Anchoring Scale</h4>
                <p className="text-indigo-600 text-sm">
                  You define what the "best possible life" and "worst possible life" mean to you personally,
                  making this assessment deeply relevant to your unique values and aspirations.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-700">Present and Future Evaluation</h4>
                <p className="text-indigo-600 text-sm">
                  The ladder helps you assess both your current satisfaction and your expectations for the future,
                  highlighting the gap between where you are and where you want to be.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-indigo-700">Scientific Validation</h4>
                <p className="text-indigo-600 text-sm">
                  This scale is used worldwide in research on wellbeing, including the Gallup World Poll
                  which measures life satisfaction across 150+ countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="text-amber-800 font-medium mb-3">Interpreting Your Position on the Ladder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 0-4: Struggling</h4>
            <p className="text-sm text-amber-700">
              People in this range typically report high levels of worry, sadness, stress, and pain.
              Daily challenges may feel overwhelming, and hope for the future may be limited.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 5-6: Getting By</h4>
            <p className="text-sm text-amber-700">
              This middle range represents moderate satisfaction with life. You likely have some 
              important needs met but still face significant challenges or unfulfilled aspirations.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 7-10: Thriving</h4>
            <p className="text-sm text-amber-700">
              People in this range report high life satisfaction, with most basic needs met. 
              They typically experience a sense of purpose, strong social connections, and optimism.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('4-2');
            setCurrentContent("visualizing-you");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default CantrilLadderView;