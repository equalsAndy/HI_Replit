import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight, Lightbulb, Sparkles } from 'lucide-react';

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [oneYearVision, setOneYearVision] = useState<string>('');
  const [challenges, setChallenges] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [resourcesNeeded, setResourcesNeeded] = useState<string>('');
  const [actionSteps, setActionSteps] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await apiRequest('/api/visualization', 'POST', {
        oneYearVision,
        challenges,
        strengths,
        resourcesNeeded,
        actionSteps
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-2');
      setCurrentContent('recap');
    } catch (error) {
      console.error('Error saving future self data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Future Self: Longer Term</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Time exposes limits every participant's infinite capacity for growth. Whether someone is 22 or 82, the focus remains on continuous evolution, deepening wisdom, and creating one's masterwork. In this context, life is not measured in chronological time but expanded by purpose.
        </p>
        <p className="text-lg text-gray-700 mt-3">
          Remember Hokusai's wisdom: every decade brings new insight, broader vision, and deeper connection to your life's work. The stories of your future self have no boundaries.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/_VsH5NO9jyg" 
              title="Your Future Self" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
          
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-2">Katsushika Hokusai's Journey</h3>
            <p className="text-sm text-indigo-700">
              "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. But all I have done before the age of 70 is not worth bothering with. At 73 I have learned something of the pattern of nature... At 80 I shall have made still more progress. At 90 I shall penetrate the mystery of things. At 100 I shall be a marvelous artist. At 110, everything I create will be alive."
            </p>
          </div>
        </div>
        
        <div className="md:w-1/2 space-y-5">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-5 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Where do you see yourself in 15 and 20 years?</h3>
            <Textarea 
              placeholder="In the future, I see myself..."
              value={oneYearVision}
              onChange={(e) => setOneYearVision(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What does your life look like when optimized for flow?</h3>
            <Textarea 
              placeholder="When optimized for flow, my life looks like..."
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="min-h-[100px] bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
          <h3 className="text-amber-800 font-medium mb-3">
            When picturing a happy final stage of life, what will you have achieved and still want to achieve?
          </h3>
          <Textarea 
            placeholder="In the final stages of my life, I will have..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
          <h3 className="text-purple-800 font-medium mb-3">
            Look back at your answers. Now write a short paragraph (3-5 sentences) that brings these together. Your vision statement should describe your future self in a way that inspires you – who you are, what you value, and how you want to live and lead.
          </h3>
          <p className="text-sm text-purple-600 mb-3">
            You can start with: "In the future, I see myself..."
          </p>
          <Textarea 
            placeholder="In the future, I see myself..."
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="bg-green-50 p-5 rounded-lg border border-green-100 mb-8">
        <h3 className="text-green-800 font-medium mb-3">
          My purpose is to...
        </h3>
        <Textarea 
          placeholder="My purpose is to..."
          value={actionSteps}
          onChange={(e) => setActionSteps(e.target.value)}
          className="min-h-[100px]"
        />
        
        <div className="mt-4">
          <h3 className="text-green-800 font-medium mb-3">
            I am becoming someone who...
          </h3>
          <Textarea 
            placeholder="I am becoming someone who..."
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? 'Saving...' : 'Continue'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FutureSelfView;