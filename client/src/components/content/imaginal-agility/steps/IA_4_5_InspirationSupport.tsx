import React from 'react';
import { Button } from '@/components/ui/button';
import InvitingTheMuseExercise from '@/components/ia/AdvancedInspirationExercise';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA_4_5_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_5_Content: React.FC<IA_4_5_ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Inviting the Muse
      </h1>

      {/* ADV Rung 4 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 4 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img
              src="/assets/ADV_Rung4.png"
              alt="Advanced Rung 4: Inviting the Muse"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onError={(e) => {
                console.error('Failed to load ADV Rung 4 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            There are many activities that free your mind and create space for inspiration.
            In this exercise, you'll map your personal set, learn the review-hook-activity-capture
            process, and prepare to try one — with coaching on how to get the most from it.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              Map your sources of inspiration. Learn a process for using them.
            </p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <InvitingTheMuseExercise />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mt-8">
        <Button
          onClick={() => onNext && onNext('ia-4-6')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Nothing is Unimaginable
        </Button>
      </div>
    </div>
  );
};

export default IA_4_5_Content;
