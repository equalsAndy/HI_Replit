import React from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';

interface IA12WhatIsImaginationProps {
  onNext?: (stepId: string) => void;
}

const IA_1_2_WhatIsImagination: React.FC<IA12WhatIsImaginationProps> = ({ onNext }) => {
  // Get video data for ia-1-2 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-1-2'
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

  // Extract YouTube ID from video URL (PO-nawVtW0o)
  const youtubeId = videoData?.url ? extractYouTubeId(videoData.url) : 'PO-nawVtW0o';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Unit 1 — What Is Imagination?
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            Imagination is the mind's internal engine for creating meaning and possibilities. It lets you form mental images,
            combine ideas, and picture what doesn't yet exist.
          </p>

          <p className="text-lg leading-relaxed">
            Imagination operates through the brain's <strong>Default Mode Network (DMN)</strong>, which blends memories,
            feelings, and ideas to help you see new options. People imagine in different ways—through images, sound, emotion,
            or abstraction—but everyone can strengthen this capability.
          </p>

          {/* Learning Objectives with DMN Brain Graphic */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-6">
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Left column - Learning objectives */}
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-4">In this unit you'll learn:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>A simple, science-based definition of imagination</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Why it's essential for identity, meaning, and growth</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>How the brain creates mental images and ideas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>Why everyone imagines differently</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">•</span>
                    <span>How imagination functions individually, in teams, and across organizations</span>
                  </li>
                </ul>
              </div>

              {/* Right column - DMN Brain Graphic */}
              <div className="flex justify-center">
                <img
                  src="/assets/ia-1-2-DMN-brain.png"
                  alt="Default Mode Network Brain Diagram"
                  className="w-full max-w-xs rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed font-medium text-purple-700">
            Understanding what imagination is helps clarify why it declines for most people—and why rebuilding it matters for your wellbeing, resilience, and professional growth.
          </p>
        </div>
      </div>

      {/* Video Section - Below Content */}
      <div className="mt-8">
        <VideoTranscriptGlossary
          youtubeId={youtubeId}
          title={videoData?.title || "What Is Imagination?"}
          transcriptMd={null}
          glossary={null}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Unit 2 — Imagination Deficit
        </Button>
      </div>
    </div>
  );
};

export default IA_1_2_WhatIsImagination;
