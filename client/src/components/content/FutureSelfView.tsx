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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Visualizing Your Future Self</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Imagine yourself one year from now, having moved higher on your ladder of wellbeing.
          What does that future look like? How will you get there?
        </p>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-lg border border-indigo-100 mb-8">
        <div className="flex items-start">
          <Sparkles className="h-6 w-6 text-indigo-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">Your Vision</h3>
            <p className="text-indigo-700 mb-4">
              Describe your ideal life one year from now. Be specific about what you're doing, 
              how you're feeling, and what's different from today.
            </p>
            <Textarea 
              placeholder="In one year from now, I..."
              value={oneYearVision}
              onChange={(e) => setOneYearVision(e.target.value)}
              className="min-h-[120px] bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <h3 className="text-blue-800 font-medium flex items-center mb-3">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            Potential Challenges
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            What obstacles might you face on the way to achieving this vision?
          </p>
          <Textarea 
            placeholder="Challenges I might face include..."
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-green-50 p-5 rounded-lg border border-green-100">
          <h3 className="text-green-800 font-medium flex items-center mb-3">
            <Lightbulb className="h-5 w-5 mr-2 text-green-500" />
            Strengths to Leverage
          </h3>
          <p className="text-sm text-green-700 mb-3">
            What strengths can you draw on to overcome these challenges?
          </p>
          <Textarea 
            placeholder="My key strengths that will help include..."
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
          <h3 className="text-purple-800 font-medium flex items-center mb-3">
            <Lightbulb className="h-5 w-5 mr-2 text-purple-500" />
            Resources Needed
          </h3>
          <p className="text-sm text-purple-700 mb-3">
            What support, skills, or resources will you need to make this vision a reality?
          </p>
          <Textarea 
            placeholder="Resources I'll need include..."
            value={resourcesNeeded}
            onChange={(e) => setResourcesNeeded(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
          <h3 className="text-amber-800 font-medium flex items-center mb-3">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            Action Steps
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            What specific actions will you take in the next month to move toward this vision?
          </p>
          <Textarea 
            placeholder="My first steps will be..."
            value={actionSteps}
            onChange={(e) => setActionSteps(e.target.value)}
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