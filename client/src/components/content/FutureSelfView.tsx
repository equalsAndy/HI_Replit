import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '@/shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

import hokusaiWaveImage from '@assets/image_1747799995641.png';
import hokusaiPortraitImage from '@assets/image_1747800012190.png';
import ladderGraphic from '@assets/image_1747800627533.png';

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [oneYearVision, setOneYearVision] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [resourcesNeeded, setResourcesNeeded] = useState<string>('');
  const [actionSteps, setActionSteps] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const stepId = "4-4";

  // Handle video progress updates
  const handleVideoProgress = (percentage: number) => {
    // Check if minimum watch requirement is met (1%)
    if (percentage >= 1 && !hasReachedMinimum) {
      setHasReachedMinimum(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/future-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oneYearVision,
          challenges,
          strengths,
          resourcesNeeded,
          actionSteps
        })
      });
      
      markStepCompleted(stepId);
      setCurrentContent("recap");
    } catch (error) {
      console.error('Error saving future self data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Future Self</h1>

      {/* YouTube Video Player */}
      <div className="mb-8">
        <VideoPlayer
          workshopType="allstarteams"
          stepId={stepId}
          title="Visualizing Your Future Self"
          aspectRatio="16:9"
          autoplay={true}
        />
      </div>

      <div className="prose max-w-none mb-8">
        <p className="text-lg">
          Take a moment to envision yourself one year from today. What does success look like? 
          How have you grown? What new capabilities have you developed?
        </p>
      </div>

      {/* Future Vision Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            One Year Vision: Where do you see yourself in 12 months?
          </label>
          <Textarea
            value={oneYearVision}
            onChange={(e) => setOneYearVision(e.target.value)}
            placeholder="Describe your vision for where you'll be in one year..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anticipated Challenges: What obstacles might you face?
          </label>
          <Textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="What challenges or obstacles do you anticipate..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strengths to Leverage: What strengths will help you succeed?
          </label>
          <Textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="What strengths and capabilities will support your journey..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resources Needed: What support or resources will you need?
          </label>
          <Textarea
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            placeholder="What resources, support, or learning will you need..."
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Steps: What immediate actions will you take?
          </label>
          <Textarea
            value={actionSteps}
            onChange={(e) => setActionSteps(e.target.value)}
            placeholder="What are the first concrete steps you'll take..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSave}
          disabled={!hasReachedMinimum || saving}
          className={`${
            hasReachedMinimum && !saving
              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          } px-8`}
          size="lg"
        >
          {saving ? "Saving..." : "Save & Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FutureSelfView;