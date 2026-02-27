import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { Button } from '@/components/ui/button';
import { StretchModal, TAG_OPTIONS } from './StretchModal';
import type { StretchResult } from './StretchModal';
import { CapabilityType, CAPABILITY_LABELS } from '@/lib/types';

// IA-3-3 data structure for proper typing
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
}

function wordCount(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export default function VisualizationStretchExercise() {
  const { state, setState, loading, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Access IA-3-3 data using the workshop step data hook
  const { data: ia33Data } = useWorkshopStepData<IA33StepData>('ia', 'ia-3-3', {
    selectedImage: null,
    uploadedImage: null,
    reflection: '',
    imageTitle: '',
  });

  // Normalize ia_4_3 with a fallback
  const ia = state?.ia_4_3 ?? {};

  // Extract IA-3-3 data
  const ia33Image = ia33Data?.uploadedImage || ia33Data?.selectedImage;
  const ia33Title = ia33Data?.imageTitle || '';
  const ia33Reflection = ia33Data?.reflection || '';

  // Early return AFTER all hooks are called
  if (loading || !state) return null;

  const hasIA33Data = Boolean(ia33Image && ia33Title);
  const hasResults = Boolean(ia.completed);

  // Resolve tag and capability labels
  const tagLabel = TAG_OPTIONS.find(t => t.value === ia.tag)?.label ?? ia.tag;
  const tagHelper = TAG_OPTIONS.find(t => t.value === ia.tag)?.helper ?? '';
  const capabilityLabel = ia.capability ? CAPABILITY_LABELS[ia.capability as CapabilityType] : '';

  function onModalApply(result: StretchResult) {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        original_image: result.original_image,
        original_title: result.original_title,
        original_reflection: ia33Reflection,
        new_image: result.new_image,
        new_title: result.new_title,
        story: result.story,
        capability: result.capability,
        tag: result.tag,
        transcript: result.transcript,
        completed: true,
      },
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onModalStartOver() {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        original_image: null,
        original_title: '',
        original_reflection: '',
        new_image: null,
        new_title: '',
        story: '',
        capability: null,
        tag: '',
        transcript: [],
        completed: false,
      },
    }));
    setModalOpen(false);
  }

  return (
    <>
      {/* Display IA-3-3 data if available */}
      {hasIA33Data && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">From Your Previous Visualization</h3>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            {ia33Image && (
              <div className="flex-shrink-0">
                <img
                  src={ia33Image}
                  alt={ia33Title}
                  className="w-24 h-24 object-cover rounded-lg border border-purple-300"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div>
                <span className="font-medium text-purple-700">Image Word:</span>
                <span className="ml-2 text-gray-800 font-semibold">&ldquo;{ia33Title}&rdquo;</span>
              </div>
              {ia33Reflection && (
                <div>
                  <span className="font-medium text-purple-700">Your Reflection:</span>
                  <p className="mt-1 text-gray-800 italic">&ldquo;{ia33Reflection}&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Open modal button */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Find Your Image Pair</h3>
        <p className="text-sm text-gray-600 mb-4">
          The AI will help you discover what your image represents &mdash; and what facet of your potential it doesn't capture. Then you'll find a second image to hold what's missing.
        </p>
        <Button
          onClick={() => setModalOpen(true)}
          disabled={!hasIA33Data}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {hasResults ? 'Redo Visualization Stretch' : 'Find Your Image Pair'}
        </Button>
        {!hasIA33Data && (
          <p className="mt-2 text-xs text-amber-600">
            Complete the visualization exercise in Module 3 (ia-3-3) first.
          </p>
        )}
      </div>

      <StretchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ia33Image={ia33Image || null}
        ia33Title={ia33Title}
        ia33Reflection={ia33Reflection}
        onApply={onModalApply}
        onStartOver={onModalStartOver}
      />

      {/* Post-modal results */}
      {hasResults && (
        <div className="space-y-6">

          {/* What You Just Did */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You looked at one image of your potential and found what it was missing.
              Then you searched for a second image to hold the other side.
              Together they reveal more than either shows alone.
              That's visualization as a skill &mdash; the ability to see your potential as multifaceted, not one-dimensional.
            </p>
          </div>

          {/* Image Pair */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-4">Your Image Pair</h3>

            <div className="flex justify-center items-start gap-6 mb-4">
              <div className="flex flex-col items-center">
                <img
                  src={ia.original_image || ''}
                  alt={ia.original_title}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 shadow"
                />
                <p className="mt-2 text-sm font-semibold text-gray-700">&ldquo;{ia.original_title}&rdquo;</p>
              </div>
              <div className="flex items-center pt-16 text-3xl font-light text-purple-400">+</div>
              <div className="flex flex-col items-center">
                <img
                  src={ia.new_image || ''}
                  alt={ia.new_title}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-purple-400 shadow"
                />
                <p className="mt-2 text-sm font-semibold text-purple-800">&ldquo;{ia.new_title}&rdquo;</p>
              </div>
            </div>

            {/* Editable story textarea */}
            <div className="mt-4">
              <label className="block text-sm font-semibold uppercase text-purple-700 mb-2">What These Reveal Together</label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg text-sm resize-y bg-white"
                value={ia.story ?? ''}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    ia_4_3: { ...(prev.ia_4_3 || {}), story: e.target.value },
                  }))
                }
                onBlur={() => saveNow()}
              />
              <p className="mt-1 text-xs text-gray-500">Edit if you'd like to refine.</p>
            </div>
          </div>

          {/* Capability + Tag badges */}
          <div className="flex flex-wrap gap-4 items-center">
            {capabilityLabel && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                <span className="text-xs font-semibold uppercase text-gray-500">Capability:</span>
                <span className="text-sm font-medium text-purple-800">{capabilityLabel}</span>
              </div>
            )}
            {tagLabel && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                <span className="text-xs font-semibold uppercase text-gray-500">Tag:</span>
                <span className="text-sm font-medium text-purple-800">{tagLabel}</span>
              </div>
            )}
            {tagHelper && (
              <p className="text-xs text-gray-500 italic">{tagHelper}</p>
            )}
          </div>

          {/* Completion gate warning */}
          {(!ia.story || wordCount(ia.story) < 10 || !ia.capability || !ia.tag) && (
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              Required to continue:
              {(!ia.story || wordCount(ia.story) < 10) && <span className="ml-1">Story (10+ words)</span>}
              {!ia.capability && <span className="ml-1">Capability</span>}
              {!ia.tag && <span className="ml-1">Tag</span>}
            </p>
          )}

        </div>
      )}
    </>
  );
}
