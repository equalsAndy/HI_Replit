import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, ChevronRight } from 'lucide-react';

const RecapView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  // Fetch visualization data
  const { data: visualizationData = {} } = useQuery<{
    oneYearVision?: string;
    actionSteps?: string;
  }>({
    queryKey: ['/api/visualization'],
    refetchOnWindowFocus: false
  });

  // Get the main quadrant from the star card (highest score)
  const getMainQuadrant = () => {
    if (!starCard) return 'your strengths';
    
    const scores = {
      thinking: starCard.thinking || 0,
      acting: starCard.acting || 0,
      feeling: starCard.feeling || 0,
      planning: starCard.planning || 0
    };
    
    const highestScore = Math.max(...Object.values(scores));
    const mainQuadrant = Object.keys(scores).find(key => scores[key as keyof typeof scores] === highestScore);
    
    switch (mainQuadrant) {
      case 'thinking': return 'analytical thinking';
      case 'acting': return 'taking action';
      case 'feeling': return 'connecting with others';
      case 'planning': return 'organization and structure';
      default: return 'your strengths';
    }
  };

  const handleComplete = () => {
    markStepCompleted('4-3');
    // Navigate to your star card
    setCurrentContent("your-star-card");
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recap Your Insights</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Congratulations on completing the AllStarTeams individual journey! 
          Let's recap what you've discovered about yourself.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
          <h3 className="text-lg font-medium text-green-800 mb-4">Your Strengths</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p className="text-green-700">
                You excel in <span className="font-semibold">{getMainQuadrant()}</span>.
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p className="text-green-700">
                Your Star Profile shows a balanced distribution of strengths that you can 
                leverage in different situations.
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <p className="text-green-700">
                You've reflected on how these strengths show up in your work and life.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-4">Your Flow State</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <p className="text-blue-700">
                You've identified the activities and environments that help you get into flow.
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <p className="text-blue-700">
                You understand how flow contributes to both your performance and wellbeing.
              </p>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <p className="text-blue-700">
                You now have strategies to create more flow experiences in your work.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100 mb-8">
        <h3 className="text-lg font-medium text-purple-800 mb-4">Your Future Vision</h3>
        <div className="space-y-4">
          <p className="text-purple-700">
            You've created a vision for your future that includes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-60 p-4 rounded-md border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">Your One-Year Vision</h4>
              <p className="text-sm text-purple-700">
                {visualizationData?.oneYearVision || 
                  "Creating a meaningful and fulfilling life aligned with your strengths and values."}
              </p>
            </div>
            <div className="bg-white bg-opacity-60 p-4 rounded-md border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">Action Steps</h4>
              <p className="text-sm text-purple-700">
                {visualizationData?.actionSteps || 
                  "Specific actions to move toward your vision, leveraging your strengths."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="text-amber-800 font-medium mb-3">What's Next?</h3>
        <p className="text-amber-700">
          Bring your insights to the next team workshop, where you'll share your Star Profile 
          and collaborate with colleagues to understand how your strengths complement each other.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleComplete}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Next: Your Star Card <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default RecapView;