
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight, PenTool, TrendingUp } from 'lucide-react';
import { debounce } from 'lodash';
import { useLocation } from 'wouter';
import journeyLadderImage from '@/assets/journey-ladder.png';

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
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Statement</h2>
          <p className="text-gray-700 mb-4">
            You've completed your personal discovery journey. Now it's time to synthesize everything 
            you've learned into a personal manifesto that captures your unique profile.
          </p>
          
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Write a personal statement that captures:</h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Your core strengths and how they work together</li>
              <li>• The values that guide your decisions and actions</li>
              <li>• Your vision for your future self and potential</li>
              <li>• Your commitment to your path forward</li>
            </ul>
          </div>

          <Textarea 
            placeholder="My personal statement: I am someone who brings..."
            value={statement}
            onChange={(e) => handleStatementChange(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <div className="flex flex-col space-y-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-3/4 max-w-[250px] mb-6">
              <img 
                src={journeyLadderImage} 
                alt="Journey Ladder" 
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <PenTool className="w-5 h-5 mr-2 text-yellow-600" />
              Synthesizing Your Journey
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              You've explored your Star Strengths, identified your Flow State, and visualized your 
              potential through the Well-being Ladder.
            </p>
            <p className="text-sm text-gray-700">
              This statement is your opportunity to weave these insights together into a coherent 
              vision of who you are and who you're becoming.
            </p>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Your Path Forward
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              This personal statement will serve as your north star—a reminder of your unique 
              strengths and values when making decisions.
            </p>
            <p className="text-sm text-gray-700">
              Use it to guide your professional development, team contributions, and life choices 
              moving forward.
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
          {saving ? 'Saving...' : 'Complete Workshop'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default FinalReflectionView;
