import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ReframeExercise from '@/components/ia/ReframeExercise';
import { useContinuity } from '@/hooks/useContinuity';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA_4_2_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
// Legacy interface removed (using continuity + InlineChat)

const IA_4_2_Content: React.FC<IA_4_2_ContentProps> = ({ onNext }) => {
  const { state, set } = useContinuity();

  // One-time migration from any legacy storage to continuity
  useEffect(() => {
    if (!state.ia_4_2.original_thought) {
      let legacy = '';
      try {
        const keys = ['ia-4-2:challenge', 'ia_4_2_challenge', 'IA_4_2_challenge'];
        for (const k of keys) {
          const v = localStorage.getItem(k) || sessionStorage.getItem(k);
          if (v) { legacy = v; break; }
        }
      } catch {}
      if (legacy) {
        set({ ia_4_2: { ...state.ia_4_2, original_thought: legacy } });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Autoflow Mindful Prompts
      </h1>
      
      {/* ADV Rung 1 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 1 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/ADV_Rung1.png" 
              alt="Advanced Rung 1: Meta-Awareness"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ ADV Rung 1 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load ADV Rung 1 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This exercise strengthens your capacity for meta-awareness. It builds directly on Autoflow by asking you to notice and 
            disrupt habitual thought loops—especially in work-related situations—using a simple, interactive prompt.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              From Autoflow to Meta-Awareness: Reveal and reframe your thinking.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Unified IA block (Steps 1–5 handled within) */}
              <ReframeExercise />
            </div>
          </div>
          
          {/* Example */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-3">💡 EXAMPLE</h4>
            <div className="space-y-2 text-green-700">
              <p><strong>Challenge:</strong> "My team never listens to me."</p>
              <p><strong>AI Response:</strong> "What if their silence means reflection, not dismissal?"</p>
              <p><strong>Shift:</strong> "Curiosity"</p>
              <p><strong>New Perspective:</strong> "I'll ask one question in tomorrow's meeting, then pause."</p>
            </div>
          </div>
          
          {/* Action Buttons removed; continuity autosaves */}
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-3 mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Visualization Stretch
        </Button>
      </div>
    </div>
  );
};

export default IA_4_2_Content;
