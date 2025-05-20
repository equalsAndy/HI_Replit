import React, { useState } from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection } from '@/components/navigation';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRightIcon, CheckCircleIcon } from 'lucide-react';

export default function WorkshopVideo() {
  const { markStepCompleted } = useNavigationProgress();
  const [videoWatched, setVideoWatched] = useState(false);
  
  const handleCompleteStep = () => {
    markStepCompleted('intro-video');
  };
  
  // Simulate video watched state
  const handleVideoEnd = () => {
    setVideoWatched(true);
  };
  
  return (
    <MainContainer 
      stepId="intro-video" 
      useModernNavigation={true}
      showStepNavigation={true}
    >
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Workshop Introduction Video"
          description="Learn what to expect from this workshop"
          stepId="intro-video"
          estimatedTime={7}
          onNextClick={handleCompleteStep}
          showNextButton={videoWatched}
        >
          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
              {/* Placeholder for video - in production this would be a real embedded video */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-gray-500 mb-4">Workshop Introduction Video</p>
                <p className="text-sm text-gray-400 mb-8">
                  This is where the actual workshop introduction video would be embedded.
                  The video explains the workshop structure and what participants will learn.
                </p>
                
                {/* Simulate video player controls */}
                <div className="mt-auto w-full flex items-center justify-between pb-4">
                  <div className="bg-gray-200 h-1 flex-1 rounded-full overflow-hidden">
                    <div className={`bg-blue-500 h-full rounded-full ${videoWatched ? 'w-full' : 'w-0'}`}></div>
                  </div>
                  <Button
                    onClick={handleVideoEnd}
                    size="sm"
                    variant={videoWatched ? "outline" : "default"}
                    className="ml-4"
                  >
                    {videoWatched ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                        Watched
                      </>
                    ) : (
                      "Watch Video"
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-8">Key Points from the Video</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>This workshop will help you understand your unique pattern of strengths</li>
              <li>You'll discover how you enter flow states for optimal performance</li>
              <li>Create a vision of your future potential and impact</li>
              <li>All insights will be captured in your personalized Star Card</li>
              <li>The tools and concepts can be applied to both personal growth and team development</li>
            </ul>
            
            {videoWatched ? (
              <div className="bg-green-50 p-5 rounded-lg border border-green-100 mt-6">
                <h4 className="font-medium text-green-800 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Video Completed
                </h4>
                <p className="text-green-700 mt-2 mb-4">
                  Great job watching the introduction video! You're now ready to move on to 
                  discovering your strengths.
                </p>
                <Button 
                  onClick={handleCompleteStep}
                  asChild
                >
                  <Link to="/discover-strengths/intro">
                    Continue to Discover Your Strengths <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-6">
                <h4 className="font-medium text-blue-800">Before You Continue</h4>
                <p className="text-blue-700">
                  Please watch the video above for an overview of the workshop. Once you've 
                  watched the video, you'll be able to continue to the next module.
                </p>
              </div>
            )}
          </div>
        </ContentSection>
      </div>
    </MainContainer>
  );
}