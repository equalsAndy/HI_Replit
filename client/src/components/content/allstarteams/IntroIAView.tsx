import React, { useState, useRef, useEffect } from 'react';
import { ContentViewProps } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { trpc } from "@/utils/trpc";
import { useUnifiedWorkshopNavigation } from '@/hooks/useUnifiedWorkshopNavigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import imaginalAgilityLogo from '@assets/imaginal_agility_logo_nobkgrd.png';

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

  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const { data: user } = useCurrentUser();

  // Email form state
  const [email, setEmail] = useState('');
  const [emailType, setEmailType] = useState<'organization' | 'personal'>('organization');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [availableEmails, setAvailableEmails] = useState<Array<{ email: string; label: string; isPrimary: boolean }>>([]);
  const [useExistingEmail, setUseExistingEmail] = useState(true);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number>(0);

  // Get navigation progress using the unified hook
  const navigation = useUnifiedWorkshopNavigation('ast');
  const {
    updateVideoProgress,
    markStepCompleted: navMarkStepCompleted
  } = navigation;

  // Load available emails
  useEffect(() => {
    const loadEmails = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/beyond-ast/emails/${user.id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.emails && data.emails.length > 0) {
            setAvailableEmails(data.emails);
            setEmail(data.emails[0].email); // Set first email as default
          }
        }
      } catch (error) {
        console.error('Error loading emails:', error);
      }
    };

    loadEmails();
  }, [user?.id]);

  // Simplified mode: Next button always active for video steps
  useEffect(() => {
    setHasReachedMinimum(true);
    console.log(`🎬 SIMPLIFIED MODE: Next button always active for video step ${stepId}`);
  }, [stepId]);

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
    if (roundedProgress >= 90 && !hasReachedMinimum) {
      setHasReachedMinimum(true);
      console.log(`✅ IntroIAView: 90% minimum reached`);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/ia-interest/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          emailType
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        console.log('✅ IA interest email submitted successfully');
      } else {
        throw new Error(data.error || 'Failed to submit email');
      }
    } catch (error: any) {
      console.error('❌ Error submitting IA interest email:', error);
      setSubmitError(error.message || 'Failed to submit email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle next button click
  const handleNext = async () => {
    try {
      console.log(`🎯 IntroIAView: Completing step ${stepId}`);
      await navMarkStepCompleted(stepId);
      console.log(`✅ Step ${stepId} marked complete`);

      // This is the last step in the workshop, so just mark as complete
      // No navigation needed
    } catch (error) {
      console.error(`❌ Error completing step ${stepId}:`, error);
    }
  };

  const fallbackUrl = "https://youtu.be/mvgKNI6poYQ";
  const videoTitle = "Introduction to Imaginal Agility";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img
            src={imaginalAgilityLogo}
            alt="Imaginal Agility"
            className="h-24 w-auto"
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

      {/* Email Interest Form */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Interested in Imaginal Agility?</CardTitle>
        </CardHeader>
        <CardContent>
          {submitSuccess ? (
            <div className="text-center p-6">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ✓ Thank you for your interest!
              </div>
              <p className="text-gray-700 mb-6">
                We've received your email and will be in touch with more information about the Imaginal Agility workshop.
              </p>
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Complete Step
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <p className="text-gray-700">
                Share your email address to learn more about the full Imaginal Agility workshop experience.
              </p>

              {availableEmails.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-700">Select Email</Label>
                  <RadioGroup
                    value={useExistingEmail ? `existing-${selectedEmailIndex}` : 'new'}
                    onValueChange={(value) => {
                      if (value.startsWith('existing-')) {
                        const index = parseInt(value.replace('existing-', ''));
                        setSelectedEmailIndex(index);
                        setEmail(availableEmails[index].email);
                        setUseExistingEmail(true);
                      } else {
                        setUseExistingEmail(false);
                        setEmail('');
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex flex-col space-y-2"
                  >
                    {availableEmails.map((emailOption, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={`existing-${index}`} id={`email-${index}`} />
                        <Label htmlFor={`email-${index}`} className="text-sm text-gray-700 cursor-pointer font-normal">
                          {emailOption.email} {emailOption.isPrimary && <span className="text-xs text-gray-500">(Primary)</span>}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="email-new" />
                      <Label htmlFor="email-new" className="text-sm text-gray-700 cursor-pointer font-normal">
                        Use a different email
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {(!useExistingEmail || availableEmails.length === 0) && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-gray-700">Email Type</Label>
                <RadioGroup
                  value={emailType}
                  onValueChange={(value) => setEmailType(value as 'organization' | 'personal')}
                  disabled={isSubmitting}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organization" id="org-email" />
                    <Label htmlFor="org-email" className="text-sm text-gray-700 cursor-pointer font-normal">
                      Work/Organization email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal-email" />
                    <Label htmlFor="personal-email" className="text-sm text-gray-700 cursor-pointer font-normal">
                      Personal email
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {submitError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !email}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Interest'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroIAView;
