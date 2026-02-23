import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA54ContentProps {
  onNext?: (stepId: string) => void;
}

interface IA54StepData {
  haiq_reflection: string;
}

const INITIAL_DATA: IA54StepData = {
  haiq_reflection: '',
};

const IQ_EQ_HAIQ = [
  { label: 'IQ',   sub: 'Logical Reasoning',    color: 'bg-blue-50 border-blue-300 text-blue-800' },
  { label: 'EQ',   sub: 'Emotional Intelligence', color: 'bg-green-50 border-green-300 text-green-800' },
  { label: 'HaiQ', sub: 'Human-AI Agency',        color: 'bg-purple-50 border-purple-300 text-purple-800' },
];

const RUNG_PAIRS = [
  { solo: 'Autoflow',      soloSub: 'Self-awareness',       ai: 'Mindful Prompts',      aiSub: 'Intentional framing' },
  { solo: 'Visualization', soloSub: 'Inner clarity',         ai: 'Stretch',              aiSub: 'Expanded possibility' },
  { solo: 'Purpose',       soloSub: 'Values coherence',      ai: 'Global Bridge',        aiSub: 'Ethical reasoning' },
  { solo: 'Inspiration',   soloSub: 'Openness',              ai: 'Muse Collaboration',   aiSub: 'Creative partnering' },
  { solo: 'Unimaginable',  soloSub: 'Ambiguity tolerance',   ai: 'What If…',             aiSub: 'Visionary agency' },
];

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

  const { data, updateData } = useWorkshopStepData<IA54StepData>(
    'ia',
    'ia-5-4',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      <h1 className="text-3xl font-bold text-purple-700 mb-2">Your HaiQ</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Pronounced "High-Q" — your Human-AI intelligence.
      </p>

      {/* Video */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : undefined}
        title={videoData?.title || "Learn More About HaiQ"}
        transcriptMd={null}
        glossary={null}
      />

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
        <p className="text-lg text-gray-700 leading-relaxed">
          HaiQ measures your ability to work with AI in ways that strengthen — not replace — your human
          capabilities. Each time you work with AI intentionally — questioning, refining, choosing — you
          strengthen your human agency.
        </p>
      </div>

      {/* IQ → EQ → HaiQ Progression */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 mb-6">
          {IQ_EQ_HAIQ.map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <span className="text-2xl text-gray-400 hidden md:block">→</span>}
              {i > 0 && <span className="text-2xl text-gray-400 md:hidden">↓</span>}
              <div className={`${item.color} border-2 rounded-xl px-6 py-4 text-center min-w-[140px]`}>
                <div className="text-2xl font-bold">{item.label}</div>
                <div className="text-sm mt-1">{item.sub}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <p className="text-center text-gray-600 text-sm">
          IQ measured logical reasoning. EQ measured emotional intelligence. HaiQ measures how effectively
          you partner with AI while maintaining creative agency.
        </p>
      </div>

      {/* Your HaiQ in This Microcourse — rung mapping table */}
      <div className="bg-purple-50 rounded-xl shadow-lg p-8 border border-purple-200 mb-6">
        <h2 className="text-xl font-semibold text-purple-800 mb-1">Your HaiQ in This Microcourse</h2>
        <p className="text-sm text-gray-600 mb-6">
          Here's how the exercises you completed connect to HaiQ dimensions:
        </p>
        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 hidden sm:grid">
            <span>Module 3 (Solo)</span>
            <span className="text-center"></span>
            <span>Module 4 (AI-Partnered)</span>
          </div>
          {RUNG_PAIRS.map((pair, i) => (
            <div
              key={pair.solo}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center rounded-lg px-3 py-3 ${
                i % 2 === 0 ? 'bg-white' : 'bg-purple-100/40'
              }`}
            >
              <div>
                <span className="text-xs text-purple-500 font-medium uppercase sm:hidden">Solo · </span>
                <span className="font-medium text-purple-800">{pair.solo}</span>
                <span className="text-gray-500 text-sm"> — {pair.soloSub}</span>
              </div>
              <div className="text-center text-purple-400 font-bold hidden sm:block">→</div>
              <div>
                <span className="text-xs text-indigo-500 font-medium uppercase sm:hidden">AI · </span>
                <span className="font-medium text-indigo-700">{pair.ai}</span>
                <span className="text-gray-500 text-sm"> — {pair.aiSub}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-6 text-center">
          By completing both ladders, you practiced the full spectrum of Human-AI collaboration.
        </p>
      </div>

      {/* Optional Reflection */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          What did you notice about working with AI versus working solo?
        </p>
        <Textarea
          rows={2}
          placeholder="I noticed..."
          value={data.haiq_reflection}
          onChange={(e) => updateData({ haiq_reflection: e.target.value })}
          className="border-gray-200 focus:border-purple-400"
        />
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <Button
          onClick={() => onNext?.('ia-5-5')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Development Arc →
        </Button>
      </div>
    </div>
  );
};

export default IA_5_4_HaiQ;
