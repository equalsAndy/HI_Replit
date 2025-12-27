import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ImaginalAgilityRadarChart from './ImaginalAgilityRadarChart';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trpc } from "@/utils/trpc";
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import IA_1_1_Overview from './steps/IA_1_1_Overview';
import IA_1_2_WhatIsImagination from './steps/IA_1_2_WhatIsImagination';
import IA_1_3_ImaginationDeficit from './steps/IA_1_3_ImaginationDeficit';
import IA_1_4_TheBiggerPicture from './steps/IA_1_4_TheBiggerPicture';
import IA_1_5_RealityAndWords from './steps/IA_1_5_RealityAndWords';
import IA_2_1_I4CPrismOverview from './steps/IA_2_1_I4CPrismOverview';
import IA_2_2_SelfAssessment from './steps/IA_2_2_SelfAssessment';
import IA_3_1_LadderOverview from './steps/IA_3_1_LadderOverview';
import IA_3_2_Autoflow from './steps/IA_3_2_Autoflow';
import IA_3_3_VisualizingYourPotential from './steps/IA_3_3_VisualizingYourPotential';
import IA_3_4_FromInsightToIntention from './steps/IA_3_4_FromInsightToIntention';
import IA_3_5_Inspiration from './steps/IA_3_5_Inspiration';
import IA_3_6_TheUnimaginable from './steps/IA_3_6_TheUnimaginable';
import IA_4_1_AdvancedLadderOverview from './steps/IA_4_1_AdvancedLadderOverview';
import IA_4_2_AutoflowMindfulPrompts from './steps/IA_4_2_AutoflowMindfulPrompts';
import IA_4_3_VisualizationStretch from './steps/IA_4_3_VisualizationStretch';
import IA_4_4_HigherPurposeUplift from './steps/IA_4_4_HigherPurposeUplift';
import IA_4_5_InspirationSupport from './steps/IA_4_5_InspirationSupport';
import IA_4_6_NothingIsUnimaginable from './steps/IA_4_6_NothingIsUnimaginable';
import IA_5_1_Overview from './steps/IA_5_1_Overview';
import IA_5_2_TeamLadder from './steps/IA_5_2_TeamLadder';
import IA_5_3_TeamBoard from './steps/IA_5_3_TeamBoard';
import IA_5_4_OrganizationalVision from './steps/IA_5_4_OrganizationalVision';


// Component for ia-4-1 Assessment step
const ImaginalAgilityAssessmentContent: React.FC<{ onOpenAssessment?: () => void; onNext?: (stepId: string) => void }> = ({ onOpenAssessment, onNext }) => {
  // Get video data for debugging
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-4-1');

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Simple debug logging for video data
  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-4-1 Assessment Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-4-1 Assessment No video data found for step ia-4-1');
    }
  }, [videoData, isLoading]);

  // Check if assessment is completed
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/workshop-data/ia-assessment'],
    retry: false
  });

  const isAssessmentCompleted = assessmentData && (assessmentData as any).data !== null;

  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Self-Assessment
      </h1>
      
      <div className="mb-8">
        {/* Video Section using VideoTranscriptGlossary component like AST */}
        <VideoTranscriptGlossary
          youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'MUbEbYEiimk'} // Fallback to known ID from migration
          title={videoData?.title || "Self-Assessment"}
          transcriptMd={null} // No transcript data available yet
          glossary={null} // No glossary data available yet
        />
      </div>
      
      <div className="text-lg text-gray-700 space-y-4">
        <p>As organizations face what Deloitte identifies as an "imagination deficit" in the AI era, robust imagination self-assessment becomes essential for maintaining human creative agency and fostering transformative innovation capacity.</p>
        
        <p>This Self-Assessment helps participants to reflect on their five core capabilities essential for personal growth, team synergy, and collaborative intelligence:</p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Imagination</li>
          <li>Curiosity</li>
          <li>Caring</li>
          <li>Creativity</li>
          <li>Courage</li>
        </ul>
        
        <p>Your responses will generate a visual radar map for reflection and use in the Teamwork Practice Session. The process should take about 10–15 minutes.</p>
        
        <div className="mt-8">
          {isAssessmentCompleted ? (
            <Button 
              onClick={() => onNext && onNext('ia-5-1')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Next: Assessment Results
            </Button>
          ) : (
            <Button 
              onClick={onOpenAssessment}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Take the Assessment
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}

interface ImaginalAgilityContentProps {
  stepId: string;
  onNext?: (nextStepId: string) => void;
  onOpenAssessment?: () => void;
  onOpenContactModal?: () => void;
  assessmentResults?: any;
  user?: any;
}

// Assessment Results Content moved outside renderStepContent for switch/case compatibility
const AssessmentResultsContent: React.FC<{ onNext?: (stepId: string) => void }> = ({ onNext }) => {
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/workshop-data/ia-assessment'],
    retry: false
  });

  const hasAssessmentData = assessmentData && (assessmentData as any).data;
  let resultData = null;
  
  if (hasAssessmentData) {
    const rawResults = (assessmentData as any).data.results;
    // Handle different result formats
    if (typeof rawResults === 'string') {
      // Normal JSON string (new correct format)
      try {
        resultData = JSON.parse(rawResults);
      } catch (e) {
        console.error('Failed to parse JSON string:', e);
        resultData = null;
      }
    } else if (typeof rawResults === 'object' && rawResults !== null && !Array.isArray(rawResults)) {
      // Check if it's already a parsed object
      if (rawResults.imagination !== undefined) {
        resultData = rawResults;
      } else {
        // Fallback: character-indexed object (legacy format)
        const keys = Object.keys(rawResults).map(Number).sort((a, b) => a - b);
        const jsonString = keys.map(key => rawResults[key]).join('');
        try {
          resultData = JSON.parse(jsonString);
        } catch (e) {
          console.error('Failed to parse reconstructed JSON:', e);
          resultData = null;
        }
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Assessment Results
      </h1>
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed mb-6">
            Here are your Imaginal Agility assessment results. This radar chart shows your current strengths across the five core capabilities.
          </p>
          {hasAssessmentData && resultData ? (
            <div className="space-y-8">
              {/* Radar Chart */}
              <div className="flex justify-center mb-8">
                <ImaginalAgilityRadarChart data={{
                  imagination: resultData.imagination || 0,
                  curiosity: resultData.curiosity || 0,
                  empathy: resultData.empathy || 0,
                  creativity: resultData.creativity || 0,
                  courage: resultData.courage || 0
                }} />
              </div>
              {/* Individual Capability Scores with Icons */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Your Capability Scores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {capacity: 'Imagination', score: parseFloat(resultData.imagination) || 0, icon: '/assets/Imagination_sq.png', color: 'bg-gray-50 border-gray-200'},
                    {capacity: 'Curiosity', score: parseFloat(resultData.curiosity) || 0, icon: '/assets/Curiosity_sq.png', color: 'bg-green-50 border-green-200'},
                    {capacity: 'Creativity', score: parseFloat(resultData.creativity) || 0, icon: '/assets/Creativity_sq.png', color: 'bg-orange-50 border-orange-200'},
                    {capacity: 'Courage', score: parseFloat(resultData.courage) || 0, icon: '/assets/courage_sq.png', color: 'bg-red-50 border-red-200'},
                    {capacity: 'Caring', score: parseFloat(resultData.empathy) || 0, icon: '/assets/Caring_sq.png', color: 'bg-blue-50 border-blue-200'}
                  ].map(item => (
                    <div key={item.capacity} className={`${item.color} p-3 rounded-lg border text-center flex flex-col items-center justify-center min-h-[140px]`}>
                      <div className="w-16 h-16 mb-2 flex items-center justify-center">
                        <img 
                          src={item.icon} 
                          alt={item.capacity} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.capacity}</h4>
                      <div className="text-xl font-bold text-purple-700">{item.score.toFixed(1)}</div>
                      <div className="text-xs text-gray-600">
                        {item.score >= 4.0 ? 'Strength' : item.score >= 3.5 ? 'Developing' : 'Growth Area'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Simplified Interpretation */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Understanding Your Results</h3>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-green-700">Strengths (4.0+):</span> Your natural superpowers - leverage these capabilities
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-700">Developing (3.5-3.9):</span> Strong foundation - ready for advanced practice
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-orange-700">Growth Areas (below 3.5):</span> Opportunities for intentional development
                  </p>
                </div>
              </div>
              {/* Development Recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">Daily Practice</h4>
                    <p className="text-sm text-gray-700">
                      Spend 10 minutes daily on imagination exercises focused on your growth areas.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Team Collaboration</h4>
                    <p className="text-sm text-gray-700">
                      Partner with teammates who excel in your development areas for mutual learning.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Strength Application</h4>
                    <p className="text-sm text-gray-700">
                      Use your strongest capabilities to tackle complex challenges and mentor others.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="text-center">
                <p className="text-lg font-medium text-yellow-800 mb-2">Assessment Not Completed</p>
                <p className="text-yellow-700 mb-4">
                  Please complete your self-assessment first to see your radar chart results.
                </p>
                <Button 
                  onClick={() => onNext && onNext('ia-4-1')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                >
                  Take Assessment
                </Button>
              </div>
            </div>
          )}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Understanding Your Results</h3>
            <p className="text-base text-purple-700 mb-4">
              Your radar chart reveals your unique profile across the five capabilities. There are no "right" or "wrong" results — only insights into your current strengths and growth opportunities.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-purple-700">
              <li><strong>Higher scores</strong> indicate areas where you feel confident and capable</li>
              <li><strong>Lower scores</strong> represent opportunities for intentional development</li>
              <li><strong>Balance</strong> across capabilities creates the most agile response to complex challenges</li>
            </ul>
          </div>
          <p className="text-lg leading-relaxed">
            In the next step, you'll prepare for teamwork by understanding how these capabilities can be leveraged in collaborative settings.
          </p>
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-6-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Next: Teamwork Preparation
        </Button>
      </div>
    </div>
  );
};

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({ stepId, onNext, onOpenAssessment, onOpenContactModal }) => {
  // Get video data using the existing video hook - for ia-1-1 and ia-7-1
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId(
    'ia',
    (stepId === 'ia-1-1' || stepId === 'ia-7-1') ? stepId : ''
  );

  // Helper function to extract YouTube ID from video URL
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const renderStepContent = () => {
    switch (stepId) {
      case 'ia-1-1':
        return <IA_1_1_Overview onNext={onNext} />;
      case 'ia-1-2':
        return <IA_1_2_WhatIsImagination onNext={onNext} />;
      case 'ia-1-3':
        return <IA_1_3_ImaginationDeficit onNext={onNext} />;
      case 'ia-1-4':
        return <IA_1_4_TheBiggerPicture onNext={onNext} />;
      case 'ia-1-5':
        return <IA_1_5_RealityAndWords onNext={onNext} />;
      case 'ia-2-1':
        return <IA_2_1_I4CPrismOverview onNext={onNext} />;
      case 'ia-2-2':
        return <IA_2_2_SelfAssessment onNext={onNext} onOpenAssessment={onOpenAssessment} />;
      case 'ia-3-1':
        return <IA_3_1_LadderOverview onNext={onNext} />;
      case 'ia-3-2':
        return <IA_3_2_Autoflow onNext={onNext} />;
      case 'ia-3-3':
        return <IA_3_3_VisualizingYourPotential onNext={onNext} />;
      case 'ia-3-4':
        return <IA_3_4_FromInsightToIntention onNext={onNext} />;
      case 'ia-3-5':
        return <IA_3_5_Inspiration onNext={onNext} />;
      case 'ia-3-6':
        return <IA_3_6_TheUnimaginable onNext={onNext} />;
      case 'ia-4-1':
        return <IA_4_1_AdvancedLadderOverview onNext={onNext} />;
      case 'ia-4-2':
        return <IA_4_2_AutoflowMindfulPrompts onNext={onNext} />;
      case 'ia-4-3':
        return <IA_4_3_VisualizationStretch onNext={onNext} />;
      case 'ia-4-4':
        return <IA_4_4_HigherPurposeUplift onNext={onNext} />;
      case 'ia-4-5':
        return <IA_4_5_InspirationSupport onNext={onNext} />;
      case 'ia-4-6':
        return <IA_4_6_NothingIsUnimaginable onNext={onNext} />;
      case 'ia-5-1':
        return <IA_5_1_Overview onNext={onNext} />;
      case 'ia-5-2':
        return <IA_5_2_TeamLadder onNext={onNext} />;
      case 'ia-5-3':
        return <IA_5_3_TeamBoard onNext={onNext} onOpenContactModal={onOpenContactModal} />;
      case 'ia-5-4':
        return <IA_5_4_OrganizationalVision onNext={onNext} />;
      case 'ia-6-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Quarterly Tune-up Orientation
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed">
                  Content for ia-6-1 step.
                </p>
              </div>
            </div>
          </div>
        );
      case 'ia-7-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Welcome
            </h1>
            {/* Video Section using VideoTranscriptGlossary component like AST */}
            <VideoTranscriptGlossary
              youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'ScQ7JqLOOVY'} // Fallback to known ID from migration
              title={videoData?.title || "Welcome"}
              transcriptMd={null} // No transcript data available yet
              glossary={null} // No glossary data available yet
            />
            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed">
                  This page activates the final part of your journey — where your personal growth becomes shared intelligence.
                </p>
                
                <p className="text-lg leading-relaxed font-medium">
                  As a team, you'll climb five steps:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 text-lg">
                  <li>Express what you're sensing</li>
                  <li>Visualize what's possible</li>
                  <li>Align around shared purpose</li>
                  <li>Surface hidden energetic patterns</li>
                  <li>Co-create practices that shape the future</li>
                </ul>
                
                <p className="text-lg leading-relaxed">
                  Use images, metaphors, and insights. Let AI assist when needed. Move at your own pace — together.
                </p>
                
                <p className="text-lg leading-relaxed font-medium">
                  This is not a test. It's a tool for real collaboration.
                </p>
                
                <p className="text-lg leading-relaxed">
                  When you're ready, begin the first rung.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => onNext && onNext('ia-7-2')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Begin the First Rung
              </Button>
            </div>
          </div>
        );
      case 'ia-7-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              Team Whiteboard Workspace
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <p className="text-lg leading-relaxed mb-6">
                  Access the collaborative team workspace for Imaginal Agility exercises.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">
                    NEW TEAM IMAGINAL AGILITY WHITEBOARD TEMPLATE
                  </h3>
                  <p className="text-purple-700 mb-4">
                    This collaborative workspace allows your team to work together on imagination exercises and build collective creative capacity.
                  </p>
                  <a 
                    href="https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1752840219288/724532f9efa7cf6b7e62f338cf511f2eb9272e4a?sender=ua9824e7f46ca005336059760"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">
                      Access Team Workspace
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      // Section 8: More Info content
      case 'ia-8-1':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              The Neuroscience of Imagination
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-lg font-medium text-yellow-800">
                    🚧 This section is temporarily hidden but available for future activation.
                  </p>
                  <p className="text-yellow-700 mt-2">
                    Scientific foundation of imagination development and the neurological basis for imaginative capacity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ia-8-2':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-purple-700 mb-8">
              About Heliotrope Imaginal
            </h1>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-lg font-medium text-yellow-800">
                    🚧 This section is temporarily hidden but available for future activation.
                  </p>
                  <p className="text-yellow-700 mt-2">
                    Organization background and methodology behind the Imaginal Agility workshop.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="imaginal-agility-content">
      {renderStepContent()}
    </div>
  );
};

export default ImaginalAgilityContent;