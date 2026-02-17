import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA52ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_2_CapabilityCommitment: React.FC<IA52ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-2');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-2 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-2 No video data found for step ia-5-2');
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
        Capability Commitment
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Turning insight into sustained practice.
      </p>

      {/* Video Section */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'NUnJc82ptd4'}
        title={videoData?.title || "Capability Commitment"}
        transcriptMd={null}
        glossary={null}
      />

      {/* Make a Commitment */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Make a Commitment</h2>

          <p className="text-lg leading-relaxed">
            You have seen the pattern that emerged from your work. Now choose one clear action you will practice consistently over the next 30 days.
          </p>
        </div>
      </div>

      {/* Capability Commitment Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/capability_committment.png"
          alt="Capability Commitment"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ capability_committment.png loaded')}
          onError={(e) => console.error('❌ Failed to load capability_committment.png', e)}
        />
      </div>

      {/* What Happens Next */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">What Happens Next</h2>

          <p className="text-lg leading-relaxed">
            Your commitment becomes active immediately.
          </p>
          <p className="text-lg leading-relaxed">
            In 30 days, you will return to generate your first Monthly Capability Signal. That signal will help you:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-lg leading-relaxed">
            <li>See whether your commitment showed up in practice</li>
            <li>Adjust your focus if needed</li>
            <li>Track developmental continuity over time</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-5-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Monthly Signal
        </Button>
      </div>
    </div>
  );
};

export default IA_5_2_CapabilityCommitment;
