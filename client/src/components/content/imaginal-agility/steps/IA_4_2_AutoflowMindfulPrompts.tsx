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

  const ia = state?.ia_4_2 ?? {};
  const hasReframeResult = !!(ia.user_shift || ia.tag);
  const capsApplied = Array.isArray(ia.capabilities_applied) && ia.capabilities_applied.length >= 2;
  const imagineWordCount = (ia.capabilities_imagine ?? '').trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  const capsComplete = capsApplied && imagineWordCount >= 15;
  const canContinue = !hasReframeResult || capsComplete;

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
            This exercise builds on Autoflow by bringing your noticing skill to a real challenge — something at work or school
            that feels stuck or unresolved. You'll use AI as a thinking partner to help you reframe it.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            AI can be genuinely useful here — it can help you articulate what you're feeling, suggest a different angle,
            or offer a perspective you hadn't considered. But it's still just a tool. The insight, the recognition,
            the shift that actually lands — that comes from you. The magic is yours.
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
          
          {/* Action Buttons removed; continuity autosaves */}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 mt-8">
        {hasReframeResult && !capsComplete && (
          <p className="text-sm text-amber-600 font-medium">
            Complete the Capabilities in Action section above before continuing.
          </p>
        )}
        <div className="flex items-center gap-3">
          {hasReframeResult && (
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm('Are you sure you want to start over? This will clear your challenge and AI chat.')) {
                  set({
                    ia_4_2: {
                      original_thought: '',
                      ai_reframe: '',
                      user_shift: '',
                      tag: '',
                      new_perspective: '',
                      shift: '',
                      capability_stretched: undefined,
                      capabilities_applied: [],
                      capabilities_imagine: '',
                      tested_capability: '',
                      capability_insight: '',
                    },
                  });
                }
              }}
              className="text-gray-600 border-gray-300"
            >
              Start over with this exercise
            </Button>
          )}
          <Button
            onClick={() => onNext && onNext('ia-4-3')}
            disabled={!canContinue}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Visualization Stretch
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IA_4_2_Content;
