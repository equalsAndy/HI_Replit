import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { Button } from '@/components/ui/button';
import { StretchModal } from './StretchModal';

// IA-3-3 data structure for proper typing
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
}

export default function VisualizationStretchExercise() {
  const { state, setState, loading, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);
  const newPerspectiveRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Access IA-3-3 data using the workshop step data hook
  const { data: ia33Data } = useWorkshopStepData<IA33StepData>('ia', 'ia-3-3', {
    selectedImage: null,
    uploadedImage: null,
    reflection: '',
    imageTitle: ''
  });

  // Normalize ia_4_3 with a fallback (safe access even if state is null)
  const ia = state?.ia_4_3 ?? {};
  
  // Extract IA-3-3 data with proper field names (from workshop step data)
  const ia33Image = ia33Data?.uploadedImage || ia33Data?.selectedImage;
  const ia33ImageTitle = ia33Data?.imageTitle || '';
  const ia33Reflection = ia33Data?.reflection || '';

  // Ensure ai_stretch is always an array
  React.useEffect(() => {
    if (state && !Array.isArray(ia.ai_stretch)) {
      setState((prev) => ({
        ...prev,
        ia_4_3: {
          ...(prev.ia_4_3 || {}),
          ai_stretch: typeof ia.ai_stretch === 'string' ? [ia.ai_stretch] : [],
        },
      }));
    }
  }, [ia.ai_stretch, state]);

  // Pre-populate current_frame from IA-3-3 if available and not already set
  React.useEffect(() => {
    if (state && ia33Reflection && ia33ImageTitle && !ia.current_frame) {
      // Create a visualization frame from IA-3-3 data
      const visualizationFrame = `I see myself embodying "${ia33ImageTitle}" - ${ia33Reflection}`;
      setState((prev) => ({
        ...prev,
        ia_4_3: {
          ...(prev.ia_4_3 || {}),
          current_frame: visualizationFrame,
        },
      }));
    }
  }, [ia33Reflection, ia33ImageTitle, ia.current_frame, state]);

  React.useEffect(() => {
    if (!modalOpen && newPerspectiveRef.current) {
      newPerspectiveRef.current.focus();
    }
  }, [modalOpen]);

  // Early return AFTER all hooks are called
  if (loading || !state) return null;

  const currentFrame = (ia.current_frame ?? '').toString();
  const isFrameValid = currentFrame.trim().length >= 10;
  
  // Check if we have IA-3-3 data to display
  const hasIA33Data = ia33Image && ia33ImageTitle && ia33Reflection;

  function openModal() {
    if (isFrameValid) setModalOpen(true);
  }

  function onModalOpenChange(open: boolean) {
    setModalOpen(open);
  }

  function onModalApply(result: { transcript: string[]; stretch: string; tag: string; stretch_visualization: string; resistance_type: string; resistance_custom?: string }) {
    setState((prev) => {
      const prevIA = prev.ia_4_3 || {};
      return {
        ...prev,
        ia_4_3: {
          ...prevIA,
          ai_stretch: [
            ...(Array.isArray(prevIA.ai_stretch)
              ? prevIA.ai_stretch
              : prevIA.ai_stretch
              ? [String(prevIA.ai_stretch)]
              : []),
            ...result.transcript.map(String),
          ],
          user_stretch: result.stretch,
          tag: result.tag,
          stretch_visualization: result.stretch_visualization,
          resistance_type: result.resistance_type,
          resistance_custom: result.resistance_custom,
          original_frame: currentFrame,
        },
      };
    });
    // Save immediately so modal results survive refresh/navigation
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onModalStartOver() {
    if (window.confirm('Are you sure you want to start over? This will clear your visualization and AI chat.')) {
      setState((prev) => ({
        ...prev,
        ia_4_3: {
          current_frame: hasIA33Data ? `I see myself embodying "${ia33ImageTitle}" - ${ia33Reflection}` : '',
          ai_stretch: [],
          user_stretch: '',
          tag: '',
          stretch_visualization: '',
          resistance_type: '',
          resistance_custom: '',
          stretch_name: '',
          completed: false,
        },
      }));
      setModalOpen(false);
    }
  }

  function onModalKeepContext() {
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
                  alt={ia33ImageTitle}
                  className="w-24 h-24 object-cover rounded-lg border border-purple-300"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div>
                <span className="font-medium text-purple-700">Image Word:</span>
                <span className="ml-2 text-gray-800 font-semibold">"{ia33ImageTitle}"</span>
              </div>
              <div>
                <span className="font-medium text-purple-700">Your Reflection:</span>
                <p className="mt-1 text-gray-800 italic">"{ia33Reflection}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Name the Frame */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Name the Frame</h3>
        <p className="text-sm text-gray-600 mb-3">
          Recall the visualization you formed earlier. Summarize it in a single sentence.
        </p>
        <textarea
          id="frame-textarea"
          className="w-full border border-gray-300 rounded p-2 resize-y"
          rows={4}
          value={currentFrame}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              ia_4_3: {
                ...(prev.ia_4_3 || {}),
                current_frame: e.target.value,
              },
            }))
          }
          placeholder="I see myself..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {hasIA33Data 
            ? "Pre-populated from your previous work. Edit as needed."
            : "Summarize your visualization in a single sentence."
          }
        </p>
      </div>

      {/* Ask AI to Stretch It */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ask AI to Stretch It</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ask: "What's one possibility I haven't considered that would expand this pattern or move it to the next level?"
        </p>
        <Button onClick={openModal} disabled={!isFrameValid} className="bg-purple-600 hover:bg-purple-700 text-white">
          Work with AI to Stretch This Visualization
        </Button>
      </div>

      <StretchModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        currentFrame={currentFrame}
        onApply={onModalApply}
        onStartOver={onModalStartOver}
        onKeepContext={onModalKeepContext}
      />


      {/* Summary after modal completion */}
      {(ia.user_stretch && ia.stretch_visualization && ia.resistance_type) && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Visualization Stretch Complete</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Expanded Vision:</h4>
                <p className="text-sm text-gray-800 italic bg-white p-3 rounded border">"{ia.user_stretch}"</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Resistance Identified:</h4>
                <p className="text-sm text-gray-800 bg-white p-3 rounded border">
                  {ia.resistance_type === 'Other' ? ia.resistance_custom : ia.resistance_type}
                </p>
              </div>
            </div>
          </div>

          {/* Name the Stretch - appears after all steps complete */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Name the Stretch</h3>
            <p className="text-sm text-gray-600 mb-4">
              Give your new posture or mindset a name you'll remember.
            </p>
            <input
              id="stretch-name"
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium"
              value={ia.stretch_name ?? ''}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  ia_4_3: {
                    ...(prev.ia_4_3 || {}),
                    stretch_name: e.target.value,
                  },
                }))
              }
              placeholder="e.g., 'Shape the Stage', 'Possibility Pioneer'"
            />
          </div>
        </div>
      )}
    </>
  );
}
