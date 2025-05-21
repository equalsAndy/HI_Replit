import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StarCard from '@/components/starcard/StarCard';
import { Gauge, ChevronRight } from 'lucide-react';

const FlowStarCardView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Star Card</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Now that you've explored your flow state tendencies, it's time to add this knowledge to your Star Card.
          This gives you a more complete picture of your unique strengths profile.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-center">Your Updated Star Card</h3>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-full">
                <StarCard 
                  thinking={starCard?.thinking || 0}
                  acting={starCard?.acting || 0}
                  feeling={starCard?.feeling || 0}
                  planning={starCard?.planning || 0}
                  imageUrl={starCard?.imageUrl || null}
                />
              </div>
            </div>
            <div className="p-4 bg-indigo-50 border-t border-indigo-100 flex items-center">
              <Gauge className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-indigo-700 font-medium">Flow Score: 72/100</span>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 space-y-6">
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
            <h3 className="text-lg font-medium text-green-800 mb-4">Team Implications</h3>
            <p className="text-green-700 mb-3">
              In a team context, your complete profile helps others understand:
            </p>
            <ul className="space-y-3 text-green-700">
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                <span>What types of challenges you can help them tackle</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                <span>How to set up conditions that help you perform at your best</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 font-bold">•</span>
                <span>Ways to collaborate that leverage everyone's unique profiles</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('3-4');
            setCurrentContent("wellbeing");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Next: Visualize Your Potential <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FlowStarCardView;