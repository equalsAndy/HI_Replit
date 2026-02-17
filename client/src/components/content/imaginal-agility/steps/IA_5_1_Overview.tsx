import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA51ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_1_Content: React.FC<IA51ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-1');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-1 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-1 No video data found for step ia-5-1');
    }
  }, [videoData, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-2">
        Imaginal Agility Matrix (IAM)
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your foundational activation profile.
      </p>

      {/* Video Section */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : undefined}
        title={videoData?.title || "Imaginal Agility Matrix"}
        transcriptMd={null}
        glossary={null}
      />

      {/* IAM Activation Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">IAM Activation</h2>

          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              The IAM distills your I4C Prism and your climb up ten Ladder Rungs into one overall developmental pattern.
            </p>
            <p className="text-lg leading-relaxed">
              As you reflected, wrote, refined, and engaged with structured AI collaboration, you generated signals — insights, tensions, intentions, and goals.
            </p>
            <p className="text-lg leading-relaxed">
              The IAM coheres those signals across your five core capabilities.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-2">
            <p className="text-lg italic text-purple-800">It does not rank you.</p>
            <p className="text-lg italic text-purple-800">It does not judge you.</p>
            <p className="text-lg italic text-purple-800 font-semibold">It reveals patterns.</p>
          </div>
        </div>
      </div>

      {/* IAM Matrix Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/IAM_Matrix.png"
          alt="Imaginal Agility Matrix"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ IAM_Matrix.png loaded')}
          onError={(e) => console.error('❌ Failed to load IAM_Matrix.png', e)}
        />
      </div>

      {/* Closing Paragraph */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <p className="text-lg leading-relaxed text-gray-800">
          What you see here is the gestalt of how you engaged the work — and how AI collaboration influenced that engagement. From this pattern, a developmental direction becomes visible. The next step: translate direction into focused action.
        </p>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-5-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Capability Commitment
        </Button>
      </div>
    </div>
  );
};

export default IA_5_1_Content;
