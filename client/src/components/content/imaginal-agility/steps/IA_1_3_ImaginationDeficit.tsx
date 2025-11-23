import React from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { CheckCircle } from 'lucide-react';

interface IA13ImaginationDeficitProps {
  onNext?: (stepId: string) => void;
}

const IA_1_3_ImaginationDeficit: React.FC<IA13ImaginationDeficitProps> = ({ onNext }) => {
  // Get video data for ia-1-3 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-1-3'
  );

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
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

  // Extract YouTube ID from video URL (2a27_A9rcNA)
  const youtubeId = videoData?.url ? extractYouTubeId(videoData.url) : '2a27_A9rcNA';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Unit 2 — The Imagination Deficit
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            School and workplace routinely reward accuracy and efficiency. Daily overload leaves little room for Self-Awareness,
            Mindfulness, or Curiosity.
          </p>

          <p className="text-lg leading-relaxed">
            This unit explains why imagination declines over time. AI overuse and misuse has made this decline a new mental health
            concern impacting self-efficacy, wellbeing, and innovation.
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">In this unit you'll learn:</h2>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>Plato and Buddha diagnosed the same challenges we have today</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>How school and work often suppress reflection and creative risk-taking</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>How technology and AI increase passive thinking and negativity bias</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>Why the Self-Awareness Gap and Imagination Deficit are now a major human-capability problem</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Video Section - Below Content */}
      <div className="mt-8">
        <VideoTranscriptGlossary
          youtubeId={youtubeId}
          title={videoData?.title || "The Imagination Deficit"}
          transcriptMd={null}
          glossary={null}
        />
      </div>

      {/* Imagination Deficit Graph */}
      <div className="flex justify-center my-8">
        <img
          src="/assets/ia-1-3-graph.png"
          alt="Imagination Deficit Over Time"
          className="w-full max-w-xl rounded-lg shadow-md"
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Unit 3 — The Bigger Picture
        </Button>
      </div>
    </div>
  );
};

export default IA_1_3_ImaginationDeficit;
