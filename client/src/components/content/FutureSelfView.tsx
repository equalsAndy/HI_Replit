import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';

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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Future Self</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-gray-700">
          Take a few minutes to reflect on the future you're working toward. 
          These questions will help you imagine your life over time — and the 
          kind of person, teammate, and leader you want to become. There are 
          no right answers. Just be honest and thoughtful.
        </p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border mb-8">
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
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Where do you see yourself in 5, 10, and 20 years?</h3>
          <Textarea 
            placeholder="Your answer"
            value={oneYearVision}
            onChange={(e) => setOneYearVision(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">What does your life look like when optimized for flow?</h3>
          <Textarea 
            placeholder="Your answer"
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            When picturing a happy third stage of life, what will you have achieved and still want to achieve?
          </h3>
          <Textarea 
            placeholder="Your answer"
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Look back at your answers. Now write a short paragraph (3-5 sentences) that brings them together. Your vision statement should describe your future self in a way that inspires you — who you are, what you value, and how you want to live and lead.
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            You can start with:
          </p>
          <p className="text-sm text-gray-600 mb-1">"In the future, I see myself..."</p>
          <p className="text-sm text-gray-600 mb-1">"My purpose is to..."</p>
          <p className="text-sm text-gray-600 mb-3">"I am becoming someone who..."</p>
          <Textarea 
            placeholder="Your answer"
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            className="min-h-[150px]"
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