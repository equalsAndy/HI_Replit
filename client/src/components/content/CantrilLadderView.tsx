import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';

const CantrilLadderView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  // Values will be retrieved from stored data in a real implementation
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cantril Ladder Well-being Reflections</h1>
      
      {/* Content below title - same layout as WellBeingView */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* SVG Ladder - same sizing as WellBeingView */}
        <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-7 flex justify-center">
          <div className="w-full xl:w-11/12 2xl:w-full">
            <WellBeingLadderSvg 
              currentValue={wellBeingLevel}
              futureValue={futureWellBeingLevel}
            />
          </div>
        </div>
        
        {/* Reflections section - positioned like sliders section in WellBeingView */}
        <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-5 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-md font-medium text-blue-800 mb-2">What factors shape your current rating?</h3>
            <p className="text-gray-700 text-sm mb-2">
              What are the main elements contributing to your current well-being?
            </p>
            <textarea 
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Consider your work, relationships, health, finances, and personal growth..."
            />
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-md font-medium text-indigo-800 mb-2">What improvements do you envision?</h3>
            <p className="text-indigo-600 text-sm mb-2">
              What achievements or changes would make your life better in one year?
            </p>
            <textarea 
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe specific improvements you hope to see in your life..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2 space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Specific Changes</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700">What will be different?</h4>
                <p className="text-green-600 text-sm mb-2">
                  How will your experience be noticeably different in tangible ways?
                </p>
                <textarea 
                  className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe concrete changes you'll experience..."
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2">
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">QUARTERLY MILESTONES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-900 mb-2">What progress would you expect in 3 months?</h4>
            <p className="text-sm text-purple-600 mb-2">
              Name one specific indicator that you're moving up the ladder.
            </p>
            <textarea 
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe a measurable sign of progress..."
            />
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-2">What actions will you commit to this quarter?</h4>
            <p className="text-sm text-purple-600 mb-2">
              Name 1-2 concrete steps you'll take before your first quarterly check-in.
            </p>
            <textarea 
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe specific actions you'll take..."
            />
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