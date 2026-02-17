import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA54ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_4_HaiQ: React.FC<IA54ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-4');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-4 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-4 No video data found for step ia-5-4');
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
        Your HaiQ
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Pronounced "High-Q"
      </p>

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            A measure of Human-Centered AI interaction ability.
          </p>
          <p className="text-lg leading-relaxed">
            Combines Human + AI + intelligence Quotient.
          </p>
          <p className="text-lg leading-relaxed">
            Builds on familiar frameworks like IQ and EQ:
          </p>
        </div>
      </div>

      {/* Practice IA Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/practice_ia.png"
          alt="Practice Imaginal Agility"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ practice_ia.png loaded')}
          onError={(e) => console.error('❌ Failed to load practice_ia.png', e)}
        />
      </div>

      {/* Human Agency Statement */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <p className="text-lg leading-relaxed text-gray-800">
          Each time you work with AI intentionally — questioning, refining, choosing — you strengthen your human agency.
        </p>
      </div>

      {/* IQ EQ HaiQ Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/IQ_EQ_HAIQ.png"
          alt="IQ, EQ, and HaiQ"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ IQ_EQ_HAIQ.png loaded')}
          onError={(e) => console.error('❌ Failed to load IQ_EQ_HAIQ.png', e)}
        />
      </div>

      {/* Video Section */}
      <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
        Learn More About The 8 Dimensions of HaiQ
      </h2>
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'NUnJc82ptd4'}
        title={videoData?.title || "The 8 Dimensions of HaiQ"}
        transcriptMd={null}
        glossary={null}
      />

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-5-5')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Development Arc
        </Button>
      </div>
    </div>
  );
};

export default IA_5_4_HaiQ;
