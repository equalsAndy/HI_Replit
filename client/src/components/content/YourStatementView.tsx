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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Statement</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Creating a written statement of your future vision is a powerful way to solidify your intentions 
          and create a reference point to guide your actions. This process transforms vague aspirations 
          into concrete declarations that can shape your decision-making.
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 rounded-lg border border-purple-100 mb-8">
        <div className="flex items-start mb-6">
          <PenTool className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold text-purple-900 mb-3">A Letter to Your Future Self</h3>
            <p className="text-purple-700 mb-6">
              Write a letter to yourself one year from now, as if you're speaking to your future self 
              who has achieved the vision you've been developing. Be specific about what you've accomplished, 
              how you feel, and what's changed in your life and work.
            </p>
            
            <Textarea 
              placeholder="Dear Future Me, 
              
As I write to you a year from now, I imagine you've accomplished... I know the journey wasn't always easy, especially when... I'm proud that you were able to... The skills and strengths that helped you most were... Looking back, the pivotal moment was when... Now that you've reached this point, I hope you're feeling... Looking ahead, I wonder what your next steps will be..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[300px] bg-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="text-amber-800 font-medium mb-3">Tips for a Powerful Statement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Write in Present Tense</h4>
            <p className="text-sm text-amber-700">
              Use present tense as if the future is happening now. This helps your brain experience 
              the future state more vividly and makes it feel more achievable.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Include Emotions</h4>
            <p className="text-sm text-amber-700">
              Describe how achieving your vision makes you feel. Emotional connections strengthen 
              your commitment and make the visualization more impactful.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Be Specific and Measurable</h4>
            <p className="text-sm text-amber-700">
              Include concrete details and measurable achievements rather than vague aspirations. 
              This creates clarity and makes progress easier to track.
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
          {saving ? 'Saving...' : 'Finalize & Continue'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default YourStatementView;