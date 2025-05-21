import React from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import StarCard from '@/components/starcard/StarCard';
import { CheckCircle } from 'lucide-react';

const StarCardPreviewView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Profile + Star Card</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          Your Star Profile captures your current strengths and growth edge. It's not a fixed label — it's a reflection of where you are now in
          your development journey.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/x6h7LDtdnJw" 
              title="Star Profile Review" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full rounded border border-gray-200"
            ></iframe>
          </div>
        </div>
        
        <div className="md:w-1/2">
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-center">Your Star Card</h3>
            </div>
            <div className="p-4 flex justify-center">
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
          </div>
        </div>
      </div>
      
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 my-6">
        <h3 className="text-indigo-700 font-medium mb-2">This exercise invites you to:</h3>
        <ul className="space-y-2 text-indigo-700">
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
            <span>Reflect on your apex strength and how it shows up</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
            <span>Consider how your profile shifts over time and in different roles</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
            <span>Use your Star Card as a personal development compass</span>
          </li>
        </ul>
      </div>

      <p className="prose max-w-none">
        Watch the short video, then explore your profile with fresh eyes.
      </p>

      <div className="flex justify-end mt-6">
        <Button 
          onClick={() => {
            markStepCompleted('2-3');
            setCurrentContent("reflection");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
          size="lg"
        >
          Continue to Reflection
        </Button>
      </div>
    </>
  );
};

export default StarCardPreviewView;