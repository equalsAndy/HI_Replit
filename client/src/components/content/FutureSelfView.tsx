
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

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [fiveYearVision, setFiveYearVision] = useState<string>('');
  const [tenYearVision, setTenYearVision] = useState<string>('');
  const [twentyYearVision, setTwentyYearVision] = useState<string>('');
  const [optimizedFlow, setOptimizedFlow] = useState<string>('');
  const [coreValues, setCoreValues] = useState<string>('');
  const [impactVision, setImpactVision] = useState<string>('');
  const [growthAreas, setGrowthAreas] = useState<string>('');
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
          fiveYearVision,
          tenYearVision,
          twentyYearVision,
          optimizedFlow,
          coreValues,
          impactVision,
          growthAreas
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

      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700 mb-6">
          Take a few minutes to reflect on the future you're working toward. These questions will
          help you imagine your life over time — and the kind of person, teammate, and leader
          you want to become. There are no right answers. Just be honest and thoughtful.
        </p>
      </div>

      {/* YouTube Video Player */}
      <div className="mb-8">
        <div className="bg-gray-100 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">FUTURE SELF VIDEO V3</h3>
          <VideoPlayer
            workshopType="allstarteams"
            stepId={stepId}
            title="Visualizing Your Future Self"
            aspectRatio="16:9"
            autoplay={true}
            onProgress={handleVideoProgress}
          />
        </div>
      </div>

      {/* Hokusai Images and Quote */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <img 
            src={hokusaiWaveImage} 
            alt="Hokusai Wave" 
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
        <div className="md:col-span-1 flex flex-col justify-center">
          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <blockquote className="text-sm italic text-gray-800 leading-relaxed">
              "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. But all I have done before the age of 70 is not worth bothering with. At 75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, everything I create, a dot, a line, will jump to life as never before."
            </blockquote>
            <cite className="block text-right text-sm font-medium text-gray-600 mt-4">
              — Hokusai Katsushika
            </cite>
          </div>
        </div>
        <div className="md:col-span-1">
          <img 
            src={hokusaiPortraitImage} 
            alt="Hokusai Portrait" 
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Quote Context */}
      <div className="mb-8">
        <p className="text-sm text-gray-600 italic">
          To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call myself Hokusai, but today I sign my self 'The Old Man Mad about Drawing.'
        </p>
      </div>

      {/* Purpose Section */}
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-8">
        <h3 className="text-lg font-semibold text-purple-900 mb-3">Purpose</h3>
        <p className="text-gray-700 mb-4">
          This exercise honors every participant's infinite capacity for growth. Whether someone is 22 
          or 82, the focus remains on continuing evolution, deepening wisdom, and creating one's 
          masterpiece. The most meaningful futures are not constrained by time but expanded by 
          purpose.
        </p>
        <p className="text-gray-700">
          Remember: Hokusai's wisdom - every decade brings new insight, sharper vision, and deeper 
          connection to your life's work. The canvas of your future self has no boundaries.
        </p>
      </div>

      {/* Future Vision Questions */}
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Where do you see yourself in 5, 10, and 20 years?
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                5 Years from now:
              </label>
              <Textarea
                value={fiveYearVision}
                onChange={(e) => setFiveYearVision(e.target.value)}
                placeholder="Your answer"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                10 Years from now:
              </label>
              <Textarea
                value={tenYearVision}
                onChange={(e) => setTenYearVision(e.target.value)}
                placeholder="Your answer"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                20 Years from now:
              </label>
              <Textarea
                value={twentyYearVision}
                onChange={(e) => setTwentyYearVision(e.target.value)}
                placeholder="Your answer"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            What does your life look like when optimized for flow?
          </label>
          <Textarea
            value={optimizedFlow}
            onChange={(e) => setOptimizedFlow(e.target.value)}
            placeholder="Your answer"
            className="min-h-[120px]"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            What core values guide your future vision?
          </label>
          <Textarea
            value={coreValues}
            onChange={(e) => setCoreValues(e.target.value)}
            placeholder="Your answer"
            className="min-h-[120px]"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            What impact do you want to have on others?
          </label>
          <Textarea
            value={impactVision}
            onChange={(e) => setImpactVision(e.target.value)}
            placeholder="Your answer"
            className="min-h-[120px]"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-2">
            What areas of growth are you most excited about?
          </label>
          <Textarea
            value={growthAreas}
            onChange={(e) => setGrowthAreas(e.target.value)}
            placeholder="Your answer"
            className="min-h-[120px]"
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
