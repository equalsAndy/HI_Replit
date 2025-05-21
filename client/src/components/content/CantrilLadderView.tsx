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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Ladder Reflections</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          This self-reflection helps you assess your current life satisfaction and envision realistic personal growth over the next year. 
          Using the Cantril Ladder (0 = worst possible life, 10 = best possible life), you'll identify where you stand now, where you aim 
          to be in one year, and the steps you'll take each quarter to climb toward that vision.
        </p>
        <p className="text-lg text-gray-700 mt-4">
          The Cantril Ladder is simple but offers profound insights across all age groups and life stages. For younger participants, 
          it helps establish positive growth trajectories. For mid-career individuals, it provides clarity during transitions. For 
          experienced participants, it reveals new possibilities for contribution and legacy.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/yidsMx8B678" 
              title="Understanding the Cantril Ladder" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
          
          <div className="mt-6 space-y-6">
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
          </div>
        </div>
        
        <div className="md:w-1/2 space-y-6">
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Your Future Vision</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-indigo-700">What improvements do you envision?</h4>
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