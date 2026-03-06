import React, { useState, useRef } from 'react';
import { ContentViewProps } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import ContactModal from '@/components/modals/ContactModal';

/**
 * AST-specific introduction to Imaginal Agility module (AST Step 5-3).
 * Uses the same video component pattern as other AST steps.
 */
const IntroIAView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const stepId = "5-3"; // AST step 5-3
  const { data: user } = useCurrentUser();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Fetch video from database using tRPC
  const { data: videoData, isLoading: videoLoading, error } = trpc.lesson.byStep.useQuery({
    workshop: 'allstarteams', // This is an AST step
    stepId: stepId,
  }, {
    staleTime: 0,
    cacheTime: 0,
  });

  console.log('🎬 IntroIAView (AST 5-3) tRPC query:', {
    workshop: 'allstarteams',
    stepId: stepId,
    videoLoading,
    error: error?.message,
    videoData: videoData ? {
      youtubeId: videoData.youtubeId,
      title: videoData.title,
      hasTranscript: !!videoData.transcriptMd,
      hasGlossary: !!videoData.glossary
    } : 'NO_VIDEO_DATA'
  });

  // Get navigation progress using the unified hook
  const navigation = useUnifiedWorkshopNavigation('ast');
  const { updateVideoProgress } = navigation;

  // Track last logged progress to prevent spam
  const lastLoggedProgressRef = useRef(0);

  // Calculate start time for video resume
  const calculateStartTime = (): number => {
    const videoProgress = navigation.getVideoProgress(stepId) || 0;
    const progressNumber = typeof videoProgress === 'number' ? videoProgress : 0;
    if (progressNumber >= 5 && progressNumber < 95) {
      const startTimeSeconds = (progressNumber / 100) * 150;
      console.log(`🎬 IntroIAView: Resuming from ${progressNumber}% = ${startTimeSeconds} seconds`);
      return startTimeSeconds;
    }
    return 0;
  };

  // Handle video progress updates
  const handleVideoProgress = (progressPercentage: number) => {
    const roundedProgress = Math.floor(progressPercentage);
    if (Math.abs(roundedProgress - lastLoggedProgressRef.current) >= 5) {
      console.log(`🎬 IntroIAView: Video progress ${roundedProgress}%`);
      lastLoggedProgressRef.current = roundedProgress;
      updateVideoProgress(stepId, roundedProgress);
    }
  };

  // Handle IA exploration button click
  const handleExploreIA = () => {
    if (user?.iaAccess) {
      // User has IA access - navigate to IA workshop using window.location
      window.location.href = '/workshop/ia';
    } else {
      // User doesn't have IA access - open contact modal
      setIsContactModalOpen(true);
    }
  };

  const fallbackUrl = "https://youtu.be/mvgKNI6poYQ";
  const videoTitle = "Introduction to Imaginal Agility";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="blue"
      />
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img
            src="http://localhost:8080/assets/imaginal_agility_logo_sq.png"
            alt="Imaginal Agility"
            className="h-32 w-32"
          />
        </div>
        <h1 id="content-title" className="text-3xl font-bold text-gray-900 mb-4">
          Introduction to Imaginal Agility
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the principles behind Imaginal Agility and how it can enhance your creative
          flexibility and problem-solving skills.
        </p>
      </div>

      {/* YouTube Video Player - Same format as AST 1-1 */}
      <div className="mb-8 max-w-4xl mx-auto">
        {videoLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading video...</span>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
            <strong>Error loading video from database:</strong> {error.message}
            <br />
            <small>Workshop: allstarteams, Step: {stepId}</small>
          </div>
        ) : videoData ? (
          <VideoTranscriptGlossary
            youtubeId={videoData.youtubeId}
            title={videoData.title}
            transcriptMd={videoData.transcriptMd}
            glossary={videoData.glossary ?? []}
            startTime={calculateStartTime()}
            onProgress={handleVideoProgress}
          />
        ) : (
          <>
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900 mb-4">
              No video data found in database for workshop 'allstarteams' step '{stepId}'
              <br />
              <small>Falling back to default video: {fallbackUrl}</small>
            </div>
            <VideoTranscriptGlossary
              youtubeId={fallbackUrl}
              title={videoTitle}
              transcriptMd=""
              glossary={[]}
              startTime={calculateStartTime()}
              onProgress={handleVideoProgress}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About Imaginal Agility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Imaginal Agility is a framework for enhancing creative problem-solving and adaptive thinking.
              It builds on your strengths profile to develop new patterns of creative engagement.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Key Concepts</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Creative flexibility and adaptation</li>
                  <li>• Imaginative problem-solving techniques</li>
                  <li>• Building on your natural strengths</li>
                  <li>• Practical applications for growth</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Benefits</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Enhanced creative thinking</li>
                  <li>• Better problem-solving skills</li>
                  <li>• Increased adaptability</li>
                  <li>• Stronger innovative capacity</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IA Workshop Access Section */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-2 text-center">
          {user?.iaAccess ? 'Explore the Full Workshop' : 'Interested in the Full Workshop?'}
        </h3>
        <p className="text-purple-800 mb-6 text-center">
          {user?.iaAccess
            ? 'You have access to the complete Imaginal Agility workshop with hands-on exercises and practical applications.'
            : 'Learn more about bringing the complete Imaginal Agility workshop to your team or organization.'}
        </p>
        <div className="flex justify-center">
          <Button
            onClick={handleExploreIA}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
          >
            {user?.iaAccess ? 'Go to Imaginal Agility Workshop' : 'Contact Us About IA Workshop'}
          </Button>
        </div>
      </div>

      {/* Contact Modal for users without IA access */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
};

export default IntroIAView;
