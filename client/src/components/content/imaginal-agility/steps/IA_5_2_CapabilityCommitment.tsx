import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import type { CapabilityType } from '@/lib/types';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA52ContentProps {
  onNext?: (stepId: string) => void;
}

interface IA52StepData {
  selected_capability: string;
  commitment_text: string;
  commitment_reason: string;
}

const INITIAL_DATA: IA52StepData = {
  selected_capability: '',
  commitment_text: '',
  commitment_reason: '',
};

const CAPABILITY_EXAMPLES: Record<string, string[]> = {
  imagination: [
    'Spend 10 minutes each morning writing "what if..." scenarios about a current challenge',
    'Pick one routine task per week and reimagine how it could work completely differently',
    'Keep a "possibility journal" — capture one bold idea daily, no filtering',
  ],
  curiosity: [
    'Ask three genuine questions in every meeting before offering solutions',
    'Interview one person outside my field each week about how they approach problems',
    "When I catch myself saying \"I already know,\" pause and look for what I don't know",
  ],
  caring: [
    "Start each week by checking in with one colleague about what they need, not just what they're doing",
    'Before making a decision that affects others, pause and consider it from their perspective',
    'Practice noticing emotional shifts in a room — journal what I observed after meetings',
  ],
  creativity: [
    'Combine two unrelated ideas from different domains each week into something new',
    'Set a 15-minute timer and sketch, write, or prototype one rough concept — no editing allowed',
    'Seek out one unfamiliar creative input weekly (art, music, film, essay) and note what it sparks',
  ],
  courage: [
    "Share one unfinished idea per week in a setting where I'd normally stay quiet",
    "Identify the conversation I've been avoiding and schedule it this week",
    'Each day, do one small thing that makes me slightly uncomfortable professionally',
  ],
};

const IA_5_2_CapabilityCommitment: React.FC<IA52ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-2');
  const [reasonExpanded, setReasonExpanded] = useState(false);

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) {
      console.log('🎬 IA-5-2 Video found:', videoData.title);
    } else if (!isLoading) {
      console.log('🎬 IA-5-2 No video data found for step ia-5-2');
    }
  }, [videoData, isLoading]);

  const { data, updateData, saving, saveNow } = useWorkshopStepData<IA52StepData>(
    'ia',
    'ia-5-2',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  const canContinue = !!data.selected_capability && !!data.commitment_text.trim();

  const handleContinue = async () => {
    await saveNow();
    onNext?.('ia-5-3');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-2">
        Choose Your Focus
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Turning insight into sustained practice.
      </p>

      {/* Video Section */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : 'NUnJc82ptd4'}
        title={videoData?.title || "Capability Commitment"}
        transcriptMd={null}
        glossary={null}
      />

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
        <p className="text-lg text-gray-700 leading-relaxed">
          You've seen which capabilities you drew on most — and where your pattern shifted when AI was involved.
          Now choose one capability to strengthen over the next 30 days.
        </p>
      </div>

      {/* Capability Selector */}
      <CapabilitySelector
        mode="single"
        selected={(data.selected_capability as CapabilityType) || null}
        onSelect={(val) => updateData({ selected_capability: val as string })}
        prompt="Which capability do you want to strengthen?"
        className="mb-6"
      />

      {/* Commitment textarea — progressive reveal */}
      {data.selected_capability && (
        <>
          {/* Strengthening Examples */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Ideas to get you started
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Tap any example to use it as a starting point, or write your own below.
            </p>
            <div className="flex flex-col gap-2">
              {(CAPABILITY_EXAMPLES[data.selected_capability] || []).map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (!data.commitment_text.trim()) {
                      updateData({ commitment_text: example });
                    } else {
                      updateData({ commitment_text: data.commitment_text.trimEnd() + '\n' + example });
                    }
                  }}
                  className="text-left px-4 py-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-300 transition-colors text-sm text-gray-700 leading-relaxed"
                >
                  <span className="text-purple-500 mr-2">→</span>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Commitment card */}
          <div className="bg-purple-50 rounded-xl shadow-lg p-8 border border-purple-200 mb-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-1">Your 30-Day Commitment</h2>
            <p className="text-sm text-gray-600 mb-4">
              What specific practice will you commit to for the next 30 days?
            </p>
            <Textarea
              rows={3}
              placeholder="Each week, I will..."
              value={data.commitment_text}
              onChange={(e) => updateData({ commitment_text: e.target.value })}
              className="bg-white border-purple-200 focus:border-purple-400"
            />

            {/* Optional: Why this capability */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setReasonExpanded(prev => !prev)}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                {reasonExpanded ? '▾ Why this capability?' : '▸ Why this capability?'}
              </button>
              {reasonExpanded && (
                <Textarea
                  rows={2}
                  placeholder="I chose this because..."
                  value={data.commitment_reason}
                  onChange={(e) => updateData({ commitment_reason: e.target.value })}
                  className="mt-3 bg-white border-purple-200 focus:border-purple-400"
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* What Happens Next */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
        <p className="text-gray-700 leading-relaxed">
          Your commitment is the foundation for your ongoing development. The next step shows how your first monthly check-in will work.
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end items-center gap-3">
        {saving && (
          <span className="text-sm text-gray-400">Saving…</span>
        )}
        <Button
          onClick={handleContinue}
          disabled={!canContinue || saving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Continue to Monthly Signal →'}
        </Button>
      </div>
    </div>
  );
};

export default IA_5_2_CapabilityCommitment;
