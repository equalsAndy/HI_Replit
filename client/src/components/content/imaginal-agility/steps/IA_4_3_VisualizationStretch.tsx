import React from 'react';
import { Button } from '@/components/ui/button';
import VisualizationStretchExercise from '@/components/ia/VisualizationStretchExercise';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { useContinuity } from '@/hooks/useContinuity';

interface IA_4_3_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const STRETCH_HERO_IMAGE = '/assets/stretch_realistic.png';
const AI_FAIL_IMAGE = '/assets/sretchingwithrobot_footbackward.png';

const IA_4_3_Content: React.FC<IA_4_3_ContentProps> = ({ onNext }) => {
  const { state } = useContinuity();
  const isComplete = Boolean(state?.ia_4_3?.completed);
  const [showAiImage, setShowAiImage] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Visualization Stretch
      </h1>

      {/* ═══ TOP SECTION: Rung Graphic + Purpose ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 2 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img
              src="/assets/ADV_Rung2.png"
              alt="Adventure Rung 2: Visualization Stretch"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Purpose Section — stretch philosophy */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your Module 3 image captured one side of your potential. But one picture
            is a snapshot &mdash; it shows where you are, not where you reach.
            In this exercise, you&apos;ll stretch beyond it with an AI partner,
            then find a second image that captures the stretched side.
          </p>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              One image captures a moment. Two images tell a story.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ STRETCHING METAPHOR SECTION ═══ */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

          {/* Photo side */}
          <div className="bg-purple-100 flex items-center justify-center min-h-[280px]">
            <img
              src={STRETCH_HERO_IMAGE}
              alt="Person stretching with a partner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Philosophy side */}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stretching is how you grow
            </h2>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              When you stretch a muscle, you don&apos;t break it &mdash; you extend it past where it
              usually rests. A stretching partner helps: they invite you to reach further, apply
              gentle pressure in the right direction, and let you find your own edge.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              That&apos;s what happens here. The AI acts as your stretching partner for how you see
              yourself. Your first image is where your self-picture rests comfortably. The stretch
              is reaching past it &mdash; not to somewhere false, but to the true territory you
              haven&apos;t stood in yet.
            </p>
            <p className="text-lg font-semibold text-purple-700 mb-4">
              You do the imagining. The AI says &ldquo;further?&rdquo;
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiImage(true)}
                  className="flex-shrink-0 rounded-md overflow-hidden border-2 border-amber-300 hover:border-amber-500 transition-colors cursor-pointer"
                  title="Click to enlarge"
                >
                  <img
                    src={AI_FAIL_IMAGE}
                    alt="AI-generated image with anatomical error"
                    className="w-16 h-16 object-cover"
                  />
                </button>
                <p className="text-sm text-amber-800 leading-relaxed">
                  <span className="font-semibold">Beyond the stretch.</span>{' '}
                  Sometimes it helps to stretch beyond reality with your imagination.{' '}
                  <button
                    type="button"
                    onClick={() => setShowAiImage(true)}
                    className="text-amber-600 underline hover:text-amber-800 font-medium"
                  >
                    View full image.
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI image zoom modal */}
      {showAiImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setShowAiImage(false)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={AI_FAIL_IMAGE}
              alt="AI-generated image with backwards left foot"
              className="w-full rounded-lg shadow-2xl"
            />
            <p className="text-white text-lg text-center mt-4 font-medium">
              Don&apos;t try this at home.
            </p>
            <button
              type="button"
              onClick={() => setShowAiImage(false)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg text-lg font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* ═══ ACTIVITY CARD ═══ */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">ACTIVITY</h4>
            <div className="space-y-6">
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
