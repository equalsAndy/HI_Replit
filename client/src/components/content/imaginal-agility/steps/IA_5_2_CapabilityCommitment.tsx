import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import type { CapabilityType } from '@/lib/types';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

const ACTIVATION_CARDS: {
  key: string;
  label: string;
  color: string;
  lightBg: string;
  border: string;
  icon: string;
  oneLiner: string;
}[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    border: '#d8b4fe',
    icon: '/assets/Imagination_sq.png',
    oneLiner: "More than creativity — it's your mind's ability to build what doesn't exist yet",
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    color: '#10b981',
    lightBg: '#ecfdf5',
    border: '#6ee7b7',
    icon: '/assets/Curiosity_sq.png',
    oneLiner: "Not just asking questions — it's the willingness to be changed by the answers",
  },
  {
    key: 'caring',
    label: 'Caring',
    color: '#3b82f6',
    lightBg: '#eff6ff',
    border: '#93c5fd',
    icon: '/assets/Caring_sq.png',
    oneLiner: "Not just empathy — it includes the hardest kind of honesty",
  },
  {
    key: 'creativity',
    label: 'Creativity',
    color: '#f59e0b',
    lightBg: '#fffbeb',
    border: '#fcd34d',
    icon: '/assets/Creativity_sq.png',
    oneLiner: "Not just art — it's making connections between things that weren't connected",
  },
  {
    key: 'courage',
    label: 'Courage',
    color: '#ef4444',
    lightBg: '#fef2f2',
    border: '#fca5a5',
    icon: '/assets/courage_sq.png',
    oneLiner: "Not just boldness — sometimes the bravest thing is to pause",
  },
];

const IA_5_2_CapabilityCommitment: React.FC<IA52ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading } = useVideoByStepId('ia', 'ia-5-2');
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const [openBrowseCards, setOpenBrowseCards] = useState<Set<string>>(new Set());

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
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

  const toggleBrowseCard = (key: string) => {
    setOpenBrowseCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleExampleTap = (capabilityKey: string, example: string) => {
    // Auto-select the capability
    if (data.selected_capability !== capabilityKey) {
      updateData({ selected_capability: capabilityKey });
    }
    // Populate or append to commitment text
    if (!data.commitment_text.trim()) {
      updateData({ commitment_text: example });
    } else {
      updateData({ commitment_text: data.commitment_text.trimEnd() + '\n' + example });
    }
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

      {/* ── Browsable Activation Cards ── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-purple-800 mb-1">What Activating Each Capability Looks Like</h2>
        <p className="text-sm text-gray-600 mb-4">Browse all five before choosing your focus.</p>

        <div className="space-y-3">
          {ACTIVATION_CARDS.map(card => {
            const isOpen = openBrowseCards.has(card.key);
            const examples = CAPABILITY_EXAMPLES[card.key] || [];

            return (
              <div
                key={card.key}
                className="rounded-xl border overflow-hidden transition-all"
                style={{
                  borderColor: isOpen ? card.color : card.border,
                  backgroundColor: isOpen ? card.lightBg : '#fff',
                }}
              >
                {/* Header — always visible */}
                <button
                  type="button"
                  onClick={() => toggleBrowseCard(card.key)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <img
                    src={card.icon}
                    alt={card.label}
                    className="w-11 h-11 rounded-lg flex-shrink-0"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base uppercase tracking-wide" style={{ color: card.color }}>
                      {card.label}
                    </p>
                    <p className="text-sm text-gray-600 leading-snug">
                      {card.oneLiner}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isOpen
                      ? <ChevronUp size={18} className="text-gray-400" />
                      : <ChevronDown size={18} className="text-gray-400" />
                    }
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* Practice examples */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Try:</p>
                      <div className="flex flex-col gap-2">
                        {examples.map((example, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleExampleTap(card.key, example)}
                            className="text-left px-4 py-3 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors text-sm text-gray-700 leading-relaxed"
                          >
                            <span className="text-purple-500 mr-2">→</span>
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
