import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';

import hokusaiWaveImage from '@assets/image_1747799995641.png';
import hokusaiPortraitImage from '@assets/image_1747800012190.png';

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

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-3/5 bg-gray-50 p-6 rounded-lg border">
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
          
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium text-gray-900">Katsushika Hokusai</span> is a renowned Japanese ukiyo-e artist who lived during the 18th Century.
            </p>
            <p className="text-sm text-gray-800 italic">
              "From the age of 6 I had a mania for drawing the shapes of things.
              When I was 50 I had published a universe of designs. But all I have done before the the age of 70 is not worth bothering with. At
              75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will 
              see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, 
              everything I create; a dot, a line, will jump to life as never before.
              <br /><br />
              To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call 
              myself Hokusai, but today I sign my self 'The Old Man Mad About Drawing.'"
              <span className="block mt-1 font-medium text-right">— Hokusai Katsushika</span>
            </p>
          </div>
        </div>
        
        <div className="md:w-2/5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <img 
              src={hokusaiWaveImage} 
              alt="The Great Wave off Kanagawa by Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
            <img 
              src={hokusaiPortraitImage} 
              alt="Portrait of Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">Purpose</h3>
        <p className="text-sm text-indigo-800">
          This exercise honors every participant's infinite capacity for growth. 
          Whether someone is 22 or 82, the focus remains on continuing evolution, 
          deepening wisdom, and creating one's masterpiece. The most meaningful 
          futures are not constrained by time but expanded by purpose.
        </p>
        <p className="text-sm text-indigo-800 mt-2">
          Remember Hokusai's wisdom - every decade brings new insight, sharper vision, 
          and deeper connection to your life's work. The canvas of your future self 
          has no boundaries.
        </p>
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