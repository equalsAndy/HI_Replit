import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA53ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_3_MonthlySignal: React.FC<IA53ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-3');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-3 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-3 No video data found for step ia-5-3');
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
        Monthly Capability Signal
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Supporting your developmental direction.
      </p>

      {/* Video Section */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'NUnJc82ptd4'}
        title={videoData?.title || "Monthly Capability Signal"}
        transcriptMd={null}
        glossary={null}
      />

      {/* How This Works */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">How This Works</h2>

          <p className="text-lg leading-relaxed">
            Your commitment does not end after today.
          </p>
          <p className="text-lg leading-relaxed">
            In 30 days, you will return to reflect briefly on how it showed up in your real work.
          </p>
          <p className="text-lg leading-relaxed">
            That reflection generates an updated capability signal — a structured continuation of your developmental direction.
          </p>
        </div>
      </div>

      {/* Monthly Capability Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/monthly_capability.png"
          alt="Monthly Capability Signal"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ monthly_capability.png loaded')}
          onError={(e) => console.error('❌ Failed to load monthly_capability.png', e)}
        />
      </div>

      {/* What This Enables */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">What This Enables</h2>

          <p className="text-lg leading-relaxed">
            Over time, your Monthly Capability Signals will:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-lg leading-relaxed">
            <li>Reveal how consistently your commitment is showing up</li>
            <li>Clarify shifts in how you are thinking and operating</li>
            <li>Strengthen your developmental direction</li>
            <li>Build a visible arc of continuity across cycles</li>
          </ul>

          <p className="text-lg leading-relaxed">
            This is how insight becomes sustained growth.
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-5-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to HaiQ
        </Button>
      </div>
    </div>
  );
};

export default IA_5_3_MonthlySignal;
