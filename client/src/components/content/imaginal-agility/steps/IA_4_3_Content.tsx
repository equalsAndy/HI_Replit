import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VisualizationStretchExercise from '@/components/ia/VisualizationStretchExercise';
import { useContinuity } from '@/hooks/useContinuity';

interface IA_4_3_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_3_Content: React.FC<IA_4_3_ContentProps> = ({ onNext }) => {
  const { state, set } = useContinuity();

  // One-time migration from any legacy storage (if needed)
  useEffect(() => {
    if (!state.ia_4_3.current_frame) {
      let legacy = '';
      try {
        const keys = ['ia-4-3:frame', 'ia_4_3_frame', 'IA_4_3_frame'];
        for (const k of keys) {
          const v = localStorage.getItem(k) || sessionStorage.getItem(k);
          if (v) { legacy = v; break; }
        }
      } catch {}
      if (legacy) {
        set({ ia_4_3: { ...state.ia_4_3, current_frame: legacy } });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Visualization Stretch
      </h1>
      
      {/* ADV Rung 2 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 2 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/ADV_Rung2.png" 
              alt="Advanced Rung 2: Visualization Stretch"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ ADV Rung 2 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load ADV Rung 2 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This exercise builds on your previous visualization work by helping you stretch it to the next level. 
            You'll work with AI to expand your vision beyond current assumptions and explore new possibilities.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              From Visualization to Expanded Vision: Stretch your imagination.
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
              <VisualizationStretchExercise />
            </div>
          </div>
          
          {/* Example */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-3">💡 EXAMPLE</h4>
            <div className="space-y-2 text-green-700">
              <p><strong>Original:</strong> "I see myself leading our weekly team meeting confidently."</p>
              <p><strong>AI Stretch:</strong> "What if you designed how teams think together rather than just leading meetings?"</p>
              <p><strong>Expansion:</strong> "I expanded from leading meetings to architecting collaborative thinking processes."</p>
              <p><strong>Tag:</strong> "Breakthrough"</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-3 mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Next Step
        </Button>
      </div>
    </div>
  );
};

export default IA_4_3_Content;