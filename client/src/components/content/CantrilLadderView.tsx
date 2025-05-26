import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { ChevronRight } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';
import { apiRequest } from '@/lib/queryClient';

const CantrilLadderView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWellbeingData = async () => {
      try {
        const response = await apiRequest('/api/visualization');
        if (response && response.wellBeingLevel !== undefined && response.futureWellBeingLevel !== undefined) {
          setWellBeingLevel(response.wellBeingLevel);
          setFutureWellBeingLevel(response.futureWellBeingLevel);
        }
      } catch (error) {
        console.error('Error fetching wellbeing data:', error);
        // Keep default values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchWellbeingData();
  }, []);

  const handleNext = () => {
    markStepCompleted('cantril-ladder');
    setCurrentContent('future-self');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading your wellbeing data...</div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cantril Ladder Well-being Reflections</h1>

      <div className="mb-8">
        <div className="prose max-w-none mb-6">
          <p className="text-lg text-gray-700">
            Here's your position on the Cantril Ladder based on your earlier responses. Take a moment to reflect on where you are now and where you want to be in one year.
          </p>
        </div>

        {/* SVG Ladder - centered and prominent */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-2xl">
            <WellBeingLadderSvg 
              currentValue={wellBeingLevel}
              futureValue={futureWellBeingLevel}
            />
          </div>
        </div>

        {/* Reflection prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-3">Your Current Position: {wellBeingLevel}</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p><strong>Reflect on:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>What factors contribute to this rating?</li>
                <li>What aspects of your life are working well?</li>
                <li>What challenges are you currently facing?</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-800 mb-3">Your Future Goal: {futureWellBeingLevel}</h3>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Consider:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>What would need to change to reach this level?</li>
                <li>What specific steps could you take?</li>
                <li>What support or resources might you need?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional reflection section */}
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
          <h3 className="text-amber-800 font-medium mb-3">The Gap Between Now and Your Goal</h3>
          <div className="text-sm text-amber-700">
            <p className="mb-3">
              You're currently at level <strong>{wellBeingLevel}</strong> and want to reach level <strong>{futureWellBeingLevel}</strong> 
              {futureWellBeingLevel > wellBeingLevel ? 
                ` - that's a positive movement of ${futureWellBeingLevel - wellBeingLevel} level${futureWellBeingLevel - wellBeingLevel > 1 ? 's' : ''}!` :
                futureWellBeingLevel === wellBeingLevel ?
                ` - you're aiming to maintain your current level.` :
                ` - you may want to consider what's realistic and achievable.`
              }
            </p>
            <p>
              Think about this gap as your <em>growth opportunity</em>. Each step up the ladder represents meaningful improvements in your overall life satisfaction and wellbeing.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Continue to Future Self Visualization <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default CantrilLadderView;