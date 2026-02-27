import React from 'react';
import { Button } from '@/components/ui/button';
import VisualizationStretchExercise from '@/components/ia/VisualizationStretchExercise';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { useContinuity } from '@/hooks/useContinuity';

interface IA_4_3_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_3_Content: React.FC<IA_4_3_ContentProps> = ({ onNext }) => {
  const { state } = useContinuity();
  const isComplete = Boolean(state?.ia_4_3?.completed);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
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
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Module 3 image captures one facet of your potential. But potential is multifaceted &mdash; one image can't hold all of it.
            In this exercise, AI helps you discover what your image represents and what it leaves out. Then you find a second image for the missing piece. Together, the pair reveals more than either shows alone.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              One image captures one facet. Find the other.
            </p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">ACTIVITY</h4>

            <div className="space-y-6">
              {/* Unified IA block (Steps 1-5 handled within) */}
              <VisualizationStretchExercise />
            </div>
          </div>

        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-8">
        <Button
          onClick={() => onNext && onNext('ia-4-4')}
          disabled={!isComplete}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Higher Purpose Uplift
        </Button>
        {!isComplete && (
          <p className="text-xs text-gray-500">Complete the exercise above to continue</p>
        )}
      </div>
    </div>
  );
};

export default IA_4_3_Content;
