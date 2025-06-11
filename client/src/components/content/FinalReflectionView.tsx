import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ladderImage from '@assets/journeyladder_1749683540778.png';

interface FinalReflectionViewProps {
  currentContent: string;
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

interface FinalReflectionData {
  insight: string;
}

export default function FinalReflectionView({ 
  currentContent, 
  navigate, 
  markStepCompleted, 
  setCurrentContent 
}: FinalReflectionViewProps) {
  const queryClient = useQueryClient();
  const [insight, setInsight] = useState('');

  // Fetch existing final reflection data
  const { data: existingData } = useQuery({
    queryKey: ['/api/final-reflection'],
    staleTime: 30000,
  });

  useEffect(() => {
    if (existingData && typeof existingData === 'object' && 'insight' in existingData && existingData.insight) {
      setInsight(String(existingData.insight));
    }
  }, [existingData]);

  // Save final reflection data
  const saveMutation = useMutation({
    mutationFn: (data: FinalReflectionData) => apiRequest('/api/final-reflection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/final-reflection'] });
    },
  });

  const handleInsightChange = (value: string) => {
    setInsight(value);
    
    // Auto-save after user stops typing
    const saveData = { insight: value };
    saveMutation.mutate(saveData);
  };

  const handleNext = () => {
    if (insight.trim().length >= 10) {
      markStepCompleted('4-5');
      setCurrentContent('your-star-card');
    }
  };

  const isNextEnabled = insight.trim().length >= 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Final Reflection</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Content */}
        <div className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Final Reflection: Your Next Step
          </h2>
          
          <div className="text-gray-700 space-y-4 mb-6">
            <p>
              You've just completed a personal discovery journey — from identifying your core strength to 
              envisioning your future self.
            </p>
            
            <p>
              You've seen how your strengths (especially imagination) operate at their best, and how your well-being 
              shapes your potential. Now, take a moment to name one insight or intention you want to carry forward 
              — as preparation for deeper team practice ahead.
            </p>
          </div>
          
          <div className="space-y-2">
            <textarea
              value={insight}
              onChange={(e) => handleInsightChange(e.target.value)}
              placeholder="One insight I'm taking forward is..."
              className="w-full h-48 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500">
              {insight.length}/1000 characters
            </div>
          </div>
        </div>

        {/* Right Column - Ladder Visualization */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <img 
              src={ladderImage} 
              alt="Journey Ladder showing the progression from Star Self-Assessment through Core Strengths, Flow State, Rounding Out, Visualizing Potential, Ladder of Well-Being, to Future Self"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>

          {/* What This Ladder Represents */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">What This Ladder Represents</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">A Natural Progression</h4>
                <p className="text-gray-700 text-sm">
                  Each step builds on the one before — not in leaps, but in deepening awareness.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Reflective Mirror</h4>
                <p className="text-gray-700 text-sm">
                  This journey wasn't about adding something new. It was about surfacing 
                  what's already strong within you.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Team Flow Starts Here</h4>
                <p className="text-gray-700 text-sm">
                  Your self-awareness is your starting point. Now you're ready to contribute with 
                  clarity and imagination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!isNextEnabled}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            isNextEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Star Card
        </button>
      </div>
    </div>
  );
}