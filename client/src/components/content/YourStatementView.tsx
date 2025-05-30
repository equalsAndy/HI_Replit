import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight, PenTool } from 'lucide-react';

const YourStatementView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [statement, setStatement] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      await apiRequest('/api/visualization', 'POST', {
        futureLetterText: statement
      });

      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-5');
      setCurrentContent("recap");
    } catch (error) {
      console.error('Error saving statement:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Final Reflection</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Final Reflection: Your Next Step</h2>
          <p className="text-gray-700 mb-3">
            You've just completed a personal discovery journey — from identifying your core strength
            to envisioning your future self.
          </p>
          <p className="text-gray-700 mb-4">
            You've seen how your strengths (especially imagination) operate at their best, and how
            your well-being shapes your potential. Now, take a moment to name one insight or
            intention you want to carry forward — as preparation for deeper team practice ahead.
          </p>

          <Textarea 
            placeholder="One insight I'm taking forward is..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-3/4 max-w-[250px] mb-6">
            <img 
              src={ladderGraphic} 
              alt="Development Ladder" 
              className="w-full h-auto"
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What This Ladder Represents</h3>

            <h4 className="font-medium text-gray-800">A Natural Progression</h4>
            <p className="text-sm text-gray-700 mb-3">
              Each step builds on the one before — not in leaps, but in deepening awareness.
            </p>

            <h4 className="font-medium text-gray-800">Reflective Mirror</h4>
            <p className="text-sm text-gray-700 mb-3">
              This journey wasn't about adding something new. It was about surfacing what's already
              strong within you.
            </p>

            <h4 className="font-medium text-gray-800">Team Flow Starts Here</h4>
            <p className="text-sm text-gray-700">
              Your self-awareness is your starting point. Now you're ready to contribute with clarity and
              imagination.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-lg border border-purple-100 mb-8">
        <div className="flex items-start mb-6">
          <PenTool className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-purple-900 mb-3">Your Vision Statement</h3>
            <p className="text-purple-700 mb-6">
              Look back at your answers across your journey. Now write a short paragraph (3-5 sentences) that brings 
              them together. Your vision statement should describe your future self in a way that inspires you — 
              who you are, what you value, and how you want to live and lead.
            </p>

            <Textarea 
              placeholder="In the future, I see myself... 

My purpose is to...

I am becoming someone who..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[200px] bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? 'Saving...' : 'Complete'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default YourStatementView;