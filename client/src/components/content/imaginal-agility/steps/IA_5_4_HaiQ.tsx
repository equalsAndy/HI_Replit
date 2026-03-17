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
  { solo: 'Autoflow',      soloSub: 'Self-awareness',       ai: 'Reframing',          aiSub: 'Finding new angles' },
  { solo: 'Visualization', soloSub: 'Inner clarity',         ai: 'Stretching',         aiSub: 'Expanded possibility' },
  { solo: 'Purpose',       soloSub: 'Values coherence',      ai: 'Global Bridge',      aiSub: 'Connecting to what matters' },
  { solo: 'Inspiration',   soloSub: 'Openness',              ai: 'Inviting the Muse',  aiSub: 'Creative partnering' },
  { solo: 'Unimaginable',  soloSub: 'Ambiguity tolerance',   ai: 'Your What If',       aiSub: 'Solo synthesis' },
];

const IA_5_4_HaiQ: React.FC<IA54ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-4');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
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
          HaiQ is your ability to work with AI in ways that strengthen — not replace — your human capabilities. Every time you questioned an AI output, refined it with your own judgment, or decided it wasn't right for your situation, you were exercising HaiQ.
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

      {/* Capabilities as Daily Judgment */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-purple-800 mb-4">Your Capabilities as Daily Judgment</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Every day you encounter content that may have been created by AI, by a person, or both. There's often no way to tell. Your capabilities are the filter.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Pause before reacting</p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium" style={{ color: '#ef4444' }}>Courage</span> — resist the pull of urgency. What looks authoritative isn't always right.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Ask what it wants you to believe</p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium" style={{ color: '#10b981' }}>Curiosity</span> + <span className="font-medium" style={{ color: '#8b5cf6' }}>Imagination</span> — question your own response. Picture what's missing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <p className="text-gray-900 font-semibold">Consider who's affected</p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium" style={{ color: '#3b82f6' }}>Caring</span> — think about impact before you share, forward, or decide.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-purple-800">
            That sequence is your capabilities working as judgment. AI can analyze. Judgment is yours.
          </p>
        </div>
      </div>

      {/* Optional Reflection */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          What did you notice about how you worked with AI across this microcourse?
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
          onClick={() => onNext?.('ia-5-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Your Capability Matrix →
        </Button>
      </div>
    </div>
  );
};

export default IA_5_4_HaiQ;
