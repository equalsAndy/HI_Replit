import React from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA11OverviewProps {
  onNext?: (stepId: string) => void;
}

const IA_1_1_Overview: React.FC<IA11OverviewProps> = ({ onNext }) => {
  // Get video data for ia-1-1 using the existing video hook
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    'ia-1-1'
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

  // Extract YouTube ID from video URL (UGiRxT90NuE)
  const youtubeId = videoData?.url ? extractYouTubeId(videoData.url) : 'UGiRxT90NuE';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Module 1: Overview
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            Imagination is the human brain's most powerful, adaptable engine—fueling identity, insight, and creative action.
            In an AI-shaped world, understanding how imagination works is now a core professional necessity. This Microcourse
            is a science-based, self-guided learning experience, part theory, part practice. Designed for busy professionals
            who want to rediscover the true power of their imagination, which Einstein called "More important than knowledge."
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">What This Module Covers</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-purple-700">Overview</h3>
                <p className="text-gray-700">Why imagination matters more now than at any time in modern worklife.</p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-700">Unit 1 — What Is Imagination?</h3>
                <p className="text-gray-700">
                  A clear definition grounded in neuroscience, mental imagery, the DMN, and the lifelong link between imagination
                  and self-awareness.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-700">Unit 2 — The Imagination Deficit</h3>
                <p className="text-gray-700">
                  A simple explanation of why adults lose imaginative capacity, why it matters, and how modern living + AI
                  accelerates the decline.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-purple-700">Unit 3 — The Bigger Picture</h3>
                <p className="text-gray-700">
                  The cultural, ethical, and societal stakes—how imagination shapes identity, decision-making, creativity,
                  and moral discernment.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 my-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">What You'll Learn:</h2>

            {/* Two-column layout: Image on left, numbered list on right */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Yellow Disc Image */}
              <div className="flex justify-center">
                <img
                  src="/assets/IA-1-1_yellowdisc.png"
                  alt="Imaginal Agility Visual Overview"
                  className="w-full max-w-sm rounded-lg shadow-md"
                />
              </div>

              {/* Numbered List */}
              <ol className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-semibold">1</span>
                  <span className="pt-1"><strong>Learn:</strong> Imaginal Agility</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-semibold">2</span>
                  <span className="pt-1"><strong>Enhance:</strong> Mental Health & Brain Plasticity</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-semibold">3</span>
                  <span className="pt-1"><strong>Develop:</strong> Collaborative Intelligence — Human to Human & Human to AI</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-semibold">4</span>
                  <span className="pt-1"><strong>Deepen Self-Awareness</strong> – Curiosity, Caring, Creativity, & Courage</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-semibold">5</span>
                  <span className="pt-1"><strong>Restore</strong> Meaning, Purpose, & Fulfillment</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Video Section - Below Content */}
      <div className="mt-8">
        <VideoTranscriptGlossary
          youtubeId={youtubeId}
          title={videoData?.title || "Module 1 Overview"}
          transcriptMd={null}
          glossary={null}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Unit 1 — What Is Imagination?
        </Button>
      </div>
    </div>
  );
};

export default IA_1_1_Overview;
