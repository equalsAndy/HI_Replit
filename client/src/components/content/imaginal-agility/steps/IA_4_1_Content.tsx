import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { useVideoByStepId } from '@/hooks/use-videos';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';

interface IA_4_1_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Helper function to get step title from navigation data
const getStepTitle = (stepId: string): string => {
  for (const section of imaginalAgilityNavigationSections) {
    const step = section.steps.find(s => s.id === stepId);
    if (step) {
      return step.title;
    }
  }
  return stepId; // Fallback to step ID if title not found
};

const IA_4_1_Content: React.FC<IA_4_1_ContentProps> = ({ onNext }) => {
  // Get video data for debugging
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-4-1');
  
  // Simple debug logging for video data
  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-4-1 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-4-1 No video data found for step ia-4-1');
    }
  }, [videoData, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Advanced Ladder Overview
      </h1>
      
      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-4-1"
          title="Advanced Ladder Overview"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Advanced Ladder Graphic */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-purple-800 mb-6">🔝 Advanced Ladder of Imagination</h3>
          <img 
            src="/assets/Ladder2_solo.png" 
            alt="Advanced Ladder of Imagination - Five advanced modes of imaginative practice"
            className="w-full h-auto max-w-2xl mx-auto mb-6"
            style={{ maxHeight: '500px', objectFit: 'contain' }}
            onLoad={() => console.log('✅ Advanced Ladder graphic loaded successfully')}
            onError={(e) => {
              console.error('❌ Failed to load Advanced Ladder graphic');
              console.log('Image src:', e.currentTarget.src);
              console.log('Full URL attempted:', window.location.origin + e.currentTarget.src);
            }}
          />
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          
          <p className="text-lg leading-relaxed">
            Welcome to the Advanced Ladder of Imagination. Having completed the foundational ladder, you're now ready to explore 
            more sophisticated practices that will deepen your imaginative capacity and expand your creative potential.
          </p>
          
          <p className="text-lg leading-relaxed">
            This advanced section builds upon your existing skills with:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li><strong>Meta-Awareness Practices</strong> - Moving beyond basic autoflow to conscious pattern disruption</li>
            <li><strong>Perceptual Expansion</strong> - Stretching visualization beyond current assumptions and roles</li>
            <li><strong>Global Moral Imagination</strong> - Connecting personal purpose to worldwide challenges</li>
            <li><strong>Muse Collaboration</strong> - Deepening relationship with inspirational sources</li>
            <li><strong>Unlimited Vision</strong> - Transcending all constraints to imagine radical possibilities</li>
          </ul>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">What to Expect</h4>
            <p className="text-purple-700">
              Each rung of the Advanced Ladder challenges you to go deeper than before. These practices are designed for 
              those who have mastered the basics and are ready to push the boundaries of what's imaginatively possible.
            </p>
          </div>
          
          <p className="text-lg leading-relaxed font-medium text-purple-700">
            Are you ready to climb higher?
          </p>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to {getStepTitle('ia-4-2')}
        </Button>
      </div>
    </div>
  );
};

export default IA_4_1_Content;