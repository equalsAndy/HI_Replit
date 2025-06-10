
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight, PenTool, TrendingUp } from 'lucide-react';
import { debounce } from 'lodash';
import { useLocation } from 'wouter';

// import ladderGraphic from '@assets/image_1747800627533.png'; // Commented out missing asset

const FinalReflectionView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [statement, setStatement] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('FinalReflectionView: Loading existing data...');
        const response = await fetch('/api/workshop-data/final-reflection', {
          credentials: 'include'
        });
        const result = await response.json();

        console.log('FinalReflectionView: API response:', result);

        if (result.success && result.data) {
          setStatement(result.data.futureLetterText || '');
          console.log('FinalReflectionView: Setting statement:', result.data.futureLetterText);
        }
      } catch (error) {
        console.log('FinalReflectionView: No existing data found:', error);
      }
    };

    loadExistingData();
  }, []);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        console.log('FinalReflectionView: Auto-saving...', dataToSave);
        const response = await fetch('/api/workshop-data/final-reflection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(dataToSave),
        });

        const result = await response.json();
        if (result.success) {
          console.log('FinalReflectionView: Auto-saved successfully');
        }
      } catch (error) {
        console.error('FinalReflectionView: Auto-save failed:', error);
      }
    }, 1000),
    []
  );

  // Handle text change with auto-save
  const handleStatementChange = (value: string) => {
    setStatement(value);
    debouncedSave({ futureLetterText: value });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/workshop-data/final-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          futureLetterText: statement
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Final reflection saved successfully');
        queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/final-reflection'] });
        markStepCompleted('4-5');
        console.log('Step 4-5 marked as completed');
      } else {
        throw new Error(result.error || 'Save failed');
      }
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
            onChange={(e) => handleStatementChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-3/4 max-w-[250px] mb-6 flex justify-center">
            <TrendingUp 
              className="w-32 h-32 text-indigo-400"
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

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? 'Saving...' : 'Finish Workshop'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FinalReflectionView;
