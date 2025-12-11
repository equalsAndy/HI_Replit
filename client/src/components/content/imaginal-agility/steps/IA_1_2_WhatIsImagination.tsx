import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideosByStepId } from '@/hooks/use-videos';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { FileText } from 'lucide-react';
import { PDFViewer } from '@/components/ui/pdf-viewer';

interface IA12WhatIsImaginationProps {
  onNext?: (stepId: string) => void;
}

const IA_1_2_WhatIsImagination: React.FC<IA12WhatIsImaginationProps> = ({ onNext }) => {
  // State for PDF viewer modal
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // Get video data for ia-1-2 using the new plural hook
  const { data: videos, isLoading: videoLoading } = useVideosByStepId(
    'imaginalagility',
    'ia-1-2'
  );

  // Event handlers for PDF viewer
  const handleOpenPdfViewer = () => {
    setIsPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };

  // Video content configuration
  const videoContent = [
    {
      youtubeId: 'EAen8KoGAZk',
      heading: '1 — What Is Imagination?',
      summary: 'This video introduces imagination as a universal human capacity that emerges from how the brain encodes, recalls, and recombines experience. It shows how imagination links self-awareness, meaning, and possibility, and why every person—regardless of background—can strengthen it. You also learn the three-layer model: Primal → Hippocampal → DMN.',
      keyTakeaways: [
        'Imagination is the brain\'s natural "What if?" engine.',
        'It bridges Self-Awareness → Meaning → Fulfillment.',
        'People imagine differently, but everyone can develop this capability.',
        'The course follows a simple path: Primal (embodied) → Hippocampus (memory scenes) → DMN (integration & meaning).'
      ]
    },
    {
      youtubeId: 'Hovs_aTIwpw',
      heading: '2 — Primal Imagination',
      summary: 'This video explains the earliest layer of human imagination—the embodied, emotional, action-oriented systems that evolved for survival. You learn how early humans lived in continuous prediction loops ("What\'s next?"), and how mimicry, rehearsal, resonance, play, and emotion created the first building blocks of imagination.',
      keyTakeaways: [
        'Imagination began as survival technology → predicting threats, opportunities, actions.',
        'Primal imagination is embodied, driven by emotion, and emerges through action.',
        'Three primal modes: Mimicry, Rehearsal, Resonance.',
        'Motor imagination + mirror neurons = nature\'s training system.',
        'Play is imagination practice.',
        'To imagine beyond the moment, the brain needed memory → the Hippocampus.'
      ]
    },
    {
      youtubeId: 'HkOPs39jUA8',
      heading: '3 — Hippocampal Imagination',
      summary: 'This video shows how the hippocampus turns life experience into the raw materials of imagination. Through pattern separation, pattern completion, replay, and scene construction, the brain builds mental worlds, predictions, and possibilities. This is where imagination becomes future-oriented rather than moment-bound.',
      keyTakeaways: [
        'Memory is the foundation of imagination — it lets us imagine what isn\'t present.',
        'Hippocampus: separates experiences, completes missing details, reconstructs scenes.',
        'Scene Construction = the mechanical engine linking memory to imagination.',
        'Replay refines meaning and updates internal maps (spatial + social).',
        'Enables prediction, simulation, and the formation of a personal sense of self.',
        'This memory-to-scene pathway is the gateway to the DMN.'
      ]
    },
    {
      youtubeId: 'IR8SPcLo4dw',
      heading: '4 — The DMN: Meaning & Emergent Imagination',
      summary: 'This video shows how the Default Mode Network (DMN) integrates memory, emotion, and experience into meaning, insight, and imagination. Here, the mind performs mental synthesis—combining separate memory elements into new ideas, insights, and "Eureka" moments. The DMN is also the engine of self-awareness, team imagination, and organizational vision.',
      keyTakeaways: [
        'DMN = the brain\'s integration system → Self-awareness + insight + imagination.',
        'Imagination = Replay (hippocampus) + Integration (DMN).',
        'Mental synthesis creates new ideas (Einstein\'s "combinatory play").',
        'Eureka moments arise from simple elements reorganized into a new pattern.',
        'Imagination supports transformative learning across the lifespan.',
        'Teams develop shared imagination → coordinated action, anticipation, team flow.',
        'Same principles scale from individual → team → organization → society.'
      ]
    }
  ];

  if (videoLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading videos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Brain Work: What is Imagination?
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            Imagination is the mind's internal system for forming meaning, possibilities, and new options. It allows you to generate mental images, combine ideas, and envision what doesn't yet exist. Modern neuroscience shows that imagination is not a single function, but a layered process shaped by the interaction of body, memory, and higher-order mind.
          </p>

          <p className="text-lg leading-relaxed">
            Imagination emerges through three interconnected systems:
          </p>

          <ul className="space-y-2 text-lg leading-relaxed pl-6">
            <li>Primal embodied simulation and affective prediction</li>
            <li>Hippocampal construction of scenes and mental images</li>
            <li>Default Mode Network (DMN) integration of meaning, identity, and future possibilities</li>
          </ul>

          <p className="text-lg leading-relaxed">
            Together, these systems allow you to imagine, interpret, and mentally explore the world.
          </p>

          {/* Learning Objectives with DMN Brain Graphic */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-6">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Left column - Learning objectives */}
              <div>
                <h3 className="text-lg font-semibold text-purple-800 mb-4">In this unit you'll learn:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>A clear, science-based definition of imagination</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>Why imagination begins in embodied, primal systems</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>How the hippocampus transforms memory into mental imagery</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>How the DMN weaves images, meaning, and self-understanding</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>How imagination operates differently across individuals and contexts</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span>Why imagination is essential for clarity, creativity, foresight, and resilience</span>
                  </li>
                </ul>
              </div>

              {/* Right column - DMN Brain Graphic */}
              <div className="flex justify-center">
                <img
                  src="/assets/HI BRAIN ICON.png"
                  alt="Default Mode Network Brain Diagram"
                  className="w-full max-w-xs rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed font-medium text-purple-700">
            Understanding what imagination is helps clarify why it declines for most people—and why rebuilding it matters for your wellbeing, resilience, and professional growth.
          </p>

          {/* Quick Start Guide Button - Moved from IA-1-1 */}
          <div className="bg-white rounded-lg p-6 my-6 border border-purple-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  Imagination Quick Start Guide
                </h3>
                <p className="text-gray-700 mb-4">
                  Download or view our comprehensive Quick Start Guide for an overview of the Imaginal Agility framework,
                  key concepts, and practical exercises to enhance your imagination.
                </p>
                <Button
                  onClick={handleOpenPdfViewer}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Quick Start Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Sections - Stacked Vertically */}
      <div className="mt-8 space-y-8">
        {videoContent.map((video, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            {/* Section Heading */}
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              {video.heading}
            </h2>

            {/* Video Summary */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {video.summary}
              </p>
            </div>

            {/* Video Player */}
            <VideoTranscriptGlossary
              youtubeId={video.youtubeId}
              title={video.heading}
              transcriptMd={null}
              glossary={null}
            />

            {/* Key Takeaways - Below Video */}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mt-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Key Takeaways</h3>
              <ul className="space-y-2">
                {video.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-purple-600 mr-3 text-4xl leading-none">•</span>
                    <span className="text-gray-700">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Unit 2 — Imagination Deficit
        </Button>
      </div>

      {/* PDF Viewer Modal */}
      {isPdfViewerOpen && (
        <PDFViewer
          pdfUrl="/assets/Imagination_QuickStart_Guide.pdf"
          title="Imagination Quick Start Guide"
          downloadUrl="/assets/Imagination_QuickStart_Guide.pdf"
          onClose={handleClosePdfViewer}
        />
      )}
    </div>
  );
};

export default IA_1_2_WhatIsImagination;
