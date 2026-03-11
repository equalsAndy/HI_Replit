import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { useContinuity } from '@/hooks/useContinuity';
import CapabilityPulse from '@/components/ia/CapabilityPulse';

interface IA21ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_2_1_Content: React.FC<IA21ContentProps> = ({ onNext }) => {
  const { state, set } = useContinuity();

  const handlePulseComplete = (data: any) => {
    set(prev => ({ ...prev, ia_2_1_pulse: data }));
  };

  const handlePulseContinue = () => {
    onNext?.('ia-2-2');
  };

  // Get video data for ia-2-1 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-2-1'
  );

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (videoLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading video...</span>
        </div>
      </div>
    );
  }

  // Use editableId first (direct YouTube ID from DB), fall back to URL extraction
  const youtubeId = videoData?.editableId || (videoData?.url ? extractYouTubeId(videoData.url) : null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        The i4C Prism Model
      </h1>
      
      {/* Video Section using VideoTranscriptGlossary component like AST */}
      <VideoTranscriptGlossary
        youtubeId={youtubeId}
        title={videoData?.title || "The i4C Prism Model"}
        transcriptMd={null} // No transcript data available yet
        glossary={null} // No glossary data available yet
      />
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-xl font-medium text-purple-700 mb-6">Imagination is not abstract — it's your amplifier.</p>
          
          <p className="text-lg leading-relaxed mb-8">
            Like white light through a prism, imagination refracts into four core human capabilities:
          </p>
          
          {/* I4C Capabilities Graphics */}
          <div className="flex justify-center items-center gap-12 mt-8 flex-wrap">
            <img 
              src="/assets/Curiosity_new.png" 
              alt="Curiosity - the drive to explore"
              className="w-32 h-auto object-contain"
            />
            
            <img 
              src="/assets/Caring_new.png" 
              alt="Caring - the capacity to nurture and connect"
              className="w-32 h-auto object-contain"
            />
            
            <img 
              src="/assets/Creativity_new.png" 
              alt="Creativity - the power to generate"
              className="w-32 h-auto object-contain"
            />
            
            <img 
              src="/assets/Courage_new.png" 
              alt="Courage - the strength to act"
              className="w-32 h-auto object-contain"
            />
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
            <p className="text-lg text-purple-800 font-medium text-center mb-4">
              These capabilities shape how you think, connect, and grow.
            </p>
            <p className="text-lg text-purple-800 text-center">
              Together, they define your <strong>i4C</strong> — "i Foresee" — a practical way to reflect, engage, and lead in the AI era.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              The Prism Effect
            </h3>
            <p className="text-base text-gray-700 text-center">
              Just as light reveals its hidden spectrum through a prism, your imagination reveals its power through these four capabilities. Each one amplifies the others, creating your unique creative signature.
            </p>
          </div>
        </div>
      </div>

      {/* Capability Dynamics — how capabilities work together */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-8">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-5">
          <h3 className="text-xl font-semibold text-purple-700">How Capabilities Work Together</h3>
          
          <p className="text-base leading-relaxed">
            These five capabilities don't work alone. They amplify each other. Imagination combined 
            with courage becomes bold vision — you can picture something ambitious <em>and</em> step 
            toward it. Curiosity combined with caring becomes deep listening — you genuinely want to 
            understand, and you care about what you hear. Creativity combined with courage means ideas 
            that actually ship.
          </p>

          <p className="text-base leading-relaxed">
            But when a capability is active without its partner, it produces a recognizable signal. 
            Imagination locked onto one scenario without curiosity to open alternatives? That's anxiety — 
            not a character flaw, but a signal that curiosity is needed. Caring that absorbs everything 
            without courage to set boundaries? That's burnout — a signal to activate courage. Curiosity 
            that keeps asking questions without ever committing to a direction? That's paralysis — a 
            signal that courage is needed to move forward with incomplete information.
          </p>

          <p className="text-base leading-relaxed">
            The signal isn't a problem to fix. It's information. It tells you which partner capability 
            to activate next. You already have it — it just needs to be switched on.
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mt-4">
            <p className="text-base text-purple-800">
              <strong>Notice the words around you.</strong> Language activates or suppresses capabilities 
              before you consciously decide. "Be realistic" shuts down imagination. "What might be 
              possible?" opens it. "I can't imagine" declares the capability off-limits. Once you hear 
              these switches, you'll notice them everywhere — and you can choose different ones.
            </p>
          </div>
        </div>
      </div>

      {/* Capability Pulse — forced-choice pairs before assessment */}
      <CapabilityPulse
        onComplete={handlePulseComplete}
        onContinue={handlePulseContinue}
        savedData={state?.ia_2_1_pulse || null}
      />
    </div>
  );
};

export default IA_2_1_Content;
