import React from 'react';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA61ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_6_1_TeamLadder: React.FC<IA61ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-6-1');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-6-1 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-6-1 No video data found for step ia-6-1');
    }
  }, [videoData, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Team Ladder
      </h1>

      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'ryvW4KppCu0'}
        title={videoData?.title || "Team Ladder"}
        transcriptMd={null}
        glossary={null}
      />

      {/* Key Takeaways Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaways</h3>
        <ul className="list-disc pl-6 space-y-2 text-base text-gray-800">
          <li>Teaming is a primal human operating system—intelligence lives in the system, not just individuals.</li>
          <li>Human success came from coordinated imagination: teams learned to think, plan, and act together through shared practices.</li>
          <li>Effective teams share neural architecture—joint attention, emotion, rhythm, and aligned imagination.</li>
          <li>Industrialization disrupted teaming development, creating gaps now amplified by AI.</li>
          <li>AI shapes team systems; without stewardship, human alignment lags behind machine efficiency.</li>
          <li>Imaginal Agility restores teaming with shared language, capability maps, and practices.</li>
        </ul>
      </div>

      {/* Team Ladder Illustration */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-6 flex justify-center">
        <img
          src="/assets/TeamLADDER.jpeg"
          alt="Team Ladder illustration"
          className="w-full max-w-2xl rounded-lg shadow-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-8">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed font-semibold">
            Teaming is primal — but no longer automatic.
          </p>

          <p className="text-lg leading-relaxed">
            Across deep time, humans learned, survived, and advanced through teams. Shared attention, shared vision, and coordinated action once developed naturally through lived experience. Modern work has disrupted that continuity.
          </p>

          <p className="text-lg leading-relaxed">
            This module restores the <strong>Human Team Operating System</strong> — the foundational conditions that allow teams to see, imagine, and act together again.
          </p>

          <ul className="list-disc pl-6 space-y-2 text-base">
            <li><strong>Shared Attention</strong> – Focusing together on the same reality</li>
            <li><strong>Shared Vision</strong> – Holding a common image of what lies ahead</li>
            <li><strong>Coordinated Action</strong> – Timing movement and decisions together</li>
          </ul>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 my-6">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">The Team Operating System Effect</h3>
            <p className="text-purple-900 mb-3">
              When these conditions are present, teams become <em>coherent</em> rather than merely coordinated. Patterns become visible. Anticipation replaces reaction. Action compounds over time.
            </p>
            <p className="text-purple-900">
              When they are absent, speed amplifies fragmentation. This module prepares teams for complexity, change, and continuity in the AI era.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-6-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Team Whiteboard
        </Button>
      </div>
    </div>
  );
};

export default IA_6_1_TeamLadder;
