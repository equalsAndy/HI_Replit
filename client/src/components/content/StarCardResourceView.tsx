import React from 'react';
import { ContentViewProps } from '../../shared/types';
import StarCard from '@/components/starcard/StarCard';
import { Button } from '@/components/ui/button';
import { Download, Star } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getAttributeColor, CARD_WIDTH, CARD_HEIGHT, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';

const StarCardResourceView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData
}) => {
  // Determine if the Star Card is complete
  const hasStarCard = !!starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning;
  const hasFlowAttributes = flowAttributesData?.attributes && 
                           Array.isArray(flowAttributesData.attributes) && 
                           flowAttributesData.attributes.length > 0;
  
  // Map flow attributes to the format expected by StarCard
  const mappedFlowAttributes = hasFlowAttributes 
    ? flowAttributesData!.attributes!.map((attr: any) => ({
        text: attr.name,
        color: getAttributeColor(attr.name)
      }))
    : [];
  
  // Determine if the Star Card is complete
  const isCardComplete = hasStarCard && hasFlowAttributes;
  
  React.useEffect(() => {
    // Mark this step as completed when viewed
    markStepCompleted('5-3');
  }, [markStepCompleted]);
  
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Card</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Your Star Card represents your unique strengths profile and flow attributes.
          Use it as a visual reminder of your personal strengths constellation.
        </p>
      </div>

      {isCardComplete ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm mb-6">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xl font-bold text-center">Your Complete Star Card</h3>
              </div>
              <div className="p-6 flex justify-center">
                <div className="w-full">
                  <StarCard 
                    thinking={starCard?.thinking || 0}
                    acting={starCard?.acting || 0}
                    feeling={starCard?.feeling || 0}
                    planning={starCard?.planning || 0}
                    imageUrl={starCard?.imageUrl || null}
                    flowAttributes={mappedFlowAttributes}
                    downloadable={true}
                  />
                </div>
              </div>
              <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Download Star Card
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Understanding Your Complete Profile</h3>
              <p className="text-blue-700 mb-3">
                Your Star Card now integrates both your strengths and flow attributes, showing how they work together:
              </p>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <span className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Your strengths profile shows <strong>what</strong> you're naturally good at</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Your flow attributes show <strong>how</strong> you work at your best</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Together, they create a more complete picture of your professional identity</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-medium text-green-800 mb-4">Using Your Star Card</h3>
              <p className="text-green-700 mb-3">
                Here are some ways to get the most value from your Star Card:
              </p>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-start">
                  <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Download and share with team members</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Use it in 1:1 discussions about your strengths and working style</span>
                </li>
                <li className="flex items-start">
                  <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                  <span>Review quarterly as part of your professional development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 text-center">
          <Star className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-amber-800 mb-2">Complete Your Star Card First</h3>
          <p className="text-amber-700 mb-4">
            Your Star Card isn't complete yet. To see your full Star Card:
          </p>
          <ol className="list-decimal list-inside text-left text-amber-700 mx-auto max-w-md mb-6">
            {!hasStarCard && (
              <li className="mb-2">Complete the Strengths Assessment in the "Discover your Strengths" section</li>
            )}
            {!hasFlowAttributes && (
              <li className="mb-2">Add Flow Attributes in the "Find your Flow" section</li>
            )}
          </ol>
          
          <div className="flex flex-col gap-2 mt-4 md:flex-row md:justify-center">
            {!hasStarCard && (
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => setCurrentContent("strengths-assessment")}
              >
                Go to Strengths Assessment
              </Button>
            )}
            
            {hasStarCard && !hasFlowAttributes && (
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => setCurrentContent("flow-star-card")}
              >
                Go to Flow Attributes
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};



export default StarCardResourceView;