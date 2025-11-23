import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ActionPlanningExercise from '@/components/ia/ActionPlanningExercise';
import { useContinuity } from '@/hooks/useContinuity';

interface IA_4_5_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_5_Content: React.FC<IA_4_5_ContentProps> = ({ onNext }) => {
  const { state, setState } = useContinuity();

  // One-time migration from any legacy storage (if needed)
  useEffect(() => {
    if (!state.ia_4_5.action_steps) {
      let legacy = [];
      try {
        const keys = ['ia-4-5:actions', 'ia_4_5_actions', 'IA_4_5_actions'];
        for (const k of keys) {
          const v = localStorage.getItem(k) || sessionStorage.getItem(k);
          if (v) { 
            try {
              legacy = JSON.parse(v);
              break;
            } catch {}
          }
        }
      } catch {}
      if (legacy.length > 0) {
        setState((prev) => ({
          ...prev,
          ia_4_5: { ...prev.ia_4_5, action_steps: legacy }
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Action Planning
      </h1>
      
      {/* ADV Rung 4 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 4 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/ADV_Rung4.png" 
              alt="Advanced Rung 4: Action Planning"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ ADV Rung 4 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load ADV Rung 4 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This exercise transforms your inspiration moments from the Inspiration step into concrete, actionable steps.
            You'll work with AI to bridge the gap between inspiration and implementation.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              From Inspiration to Co-Creation: Transform moments into action.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">🎯 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Action Planning Exercise */}
              <ActionPlanningExercise />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-3 mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-6')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Next Step
        </Button>
      </div>
    </div>
  );
};

export default IA_4_5_Content;
