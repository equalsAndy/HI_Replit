import React from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { CheckCircle, Lightbulb, Briefcase } from 'lucide-react';

interface IA14TheBiggerPictureProps {
  onNext?: (stepId: string) => void;
}

const IA_1_4_TheBiggerPicture: React.FC<IA14TheBiggerPictureProps> = ({ onNext }) => {
  // Get video data for ia-1-4 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-1-4'
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

  // Extract YouTube ID from video URL (lvEkTT_8S_Q)
  const youtubeId = videoData?.url ? extractYouTubeId(videoData.url) : 'lvEkTT_8S_Q';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Unit 3 — The Bigger Picture
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            Imagination is not just personal—it shapes culture, ethics, teamwork, leadership, and the choices we make as a society.
            This unit shows why imagination has always been a defining human force, and why it matters even more in the AI era.
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">In this unit you'll learn:</h2>
            <ul className="space-y-3 text-gray-800">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>Why imagination has been central in every civilization</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>How imagination can uplift—or mislead</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>Why failures of imagination create major real-world consequences</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-1" />
                <span>How AI raises the stakes for discernment and agency</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 my-8">
            <div className="flex items-start mb-4">
              <Lightbulb className="w-8 h-8 text-green-600 mr-3 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-green-800">Practical Good News</h2>
            </div>
            <p className="text-gray-800 leading-relaxed">
              Imagination isn't fixed. Neuroscience shows it can be strengthened at any age through deliberate, DMN-focused practice.
              Even small habits—reflection, visualization, mindful attention—create measurable changes in 8–12 weeks.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 my-8">
            <div className="flex items-start mb-4">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-blue-800">WEF & LinkedIn Future Skills</h2>
            </div>
            <p className="text-gray-800 leading-relaxed">
              The World Economic Forum and LinkedIn identify imagination, creativity, adaptability, empathy, and self-awareness
              as core <strong>Enduring Capabilities</strong> for the 2030 workforce. Imagination is the hidden driver behind all
              of them—it powers future thinking, collaboration, and innovation.
            </p>
          </div>
        </div>
      </div>

      {/* Video Section - Below Content */}
      <div className="mt-8">
        <VideoTranscriptGlossary
          youtubeId={youtubeId}
          title={videoData?.title || "The Bigger Picture"}
          transcriptMd={null}
          glossary={null}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-5')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Reality and Words
        </Button>
      </div>
    </div>
  );
};

export default IA_1_4_TheBiggerPicture;
