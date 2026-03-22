import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface IA54ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

interface IA54StepData {
  haiq_reflection: string;
  visited_capabilities: string[];
}

const INITIAL_DATA: IA54StepData = {
  haiq_reflection: '',
  visited_capabilities: [],
};

// ─── Constants ──────────────────────────────────────────────────────────────

const IQ_EQ_HAIQ = [
  { label: 'IQ',   sub: 'Logical Reasoning',    color: 'bg-blue-50 border-blue-300 text-blue-800' },
  { label: 'EQ',   sub: 'Emotional Intelligence', color: 'bg-green-50 border-green-300 text-green-800' },
  { label: 'HaiQ', sub: 'Human-AI Agency',        color: 'bg-purple-50 border-purple-300 text-purple-800' },
];

const CAPABILITY_CARDS: {
  key: CapabilityKey;
  label: string;
  color: string;
  lightBg: string;
  border: string;
  icon: string;
  oneLiner: string;
  youBring: string;
  aiCant: string;
  extraCallout?: string;
}[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    border: '#d8b4fe',
    icon: '/assets/Imagination_sq.png',
    oneLiner: "Your ability to want a future AI can't want",
    youBring: "The ability to build what doesn't exist yet — a future, a solution, a version of yourself you haven't become. It has a generative side and a shadow side. Both are powerful.",
    aiCant: "AI generates possibilities by recombining patterns. It doesn't want a future. It has no pull toward one outcome over another. Your imagination has direction because it's connected to what you care about.",
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    color: '#10b981',
    lightBg: '#ecfdf5',
    border: '#6ee7b7',
    icon: '/assets/Curiosity_sq.png',
    oneLiner: 'The itch of not-knowing that AI never feels',
    youBring: "The willingness to be changed by the answers — outward toward others (the real question, not the polite one) and inward toward yourself (the question you've been avoiding). Both take courage. The outward kind is how you get information worth having. The inward kind is how insight actually happens.",
    aiCant: "AI retrieves and recombines. It doesn't experience not-knowing. It has no felt gap between what it understands and what it doesn't — because it doesn't understand. Your curiosity is driven by an itch that leads to insight, not just more information.",
  },
  {
    key: 'caring',
    label: 'Caring',
    color: '#3b82f6',
    lightBg: '#eff6ff',
    border: '#93c5fd',
    icon: '/assets/Caring_sq.png',
    oneLiner: "Stakes that AI doesn't have",
    youBring: "The warm side — noticing, reading the room, building trust. The hard side — honesty that risks friction because the person matters. And the inward side — including yourself in who you care about.",
    aiCant: "AI can analyze impact and generate empathetic language. It doesn't care what happens next. It has no stake in whether the outcome is good for the people involved. Your caring is what makes you weigh trade-offs no metric captures.",
  },
  {
    key: 'creativity',
    label: 'Creativity',
    color: '#f59e0b',
    lightBg: '#fffbeb',
    border: '#fcd34d',
    icon: '/assets/Creativity_sq.png',
    oneLiner: 'Knowing which combination is right, not just novel',
    youBring: "Seeing a bridge between things that weren't connected — and knowing when it clicks versus when it's just novel. Without caring it becomes novelty addiction. Without courage it never ships.",
    aiCant: "AI makes novel combinations at enormous scale. It can't feel the difference between clever and right. Your creativity includes the judgment of \"this one, not that one\" — and that comes from everything you've lived, not everything you've processed.",
  },
  {
    key: 'courage',
    label: 'Courage',
    color: '#ef4444',
    lightBg: '#fef2f2',
    border: '#fca5a5',
    icon: '/assets/courage_sq.png',
    oneLiner: 'Something to lose — which AI never has',
    youBring: "Three forms — the courage to act, the courage to pause, and the courage to be wrong. Without imagination it's recklessness. Without caring it's bulldozing.",
    aiCant: "Courage requires something to lose. AI has no stakes — no reputation, no vulnerability, no fear of being wrong in front of people who matter. It can be a safe space to explore a scary idea. But the decision is yours alone.",
    extraCallout: "AI doesn't judge you. But you must judge it.",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

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

  // ── Capability card state ────────────────────────────────────────────────
  const [openCards, setOpenCards] = useState<Set<CapabilityKey>>(new Set());

  const visitedCards = useMemo(
    () => new Set((data.visited_capabilities || []) as CapabilityKey[]),
    [data.visited_capabilities]
  );

  const toggleCard = (key: CapabilityKey) => {
    // Persist visited state
    if (!visitedCards.has(key)) {
      const updated = [...(data.visited_capabilities || []), key];
      updateData({ visited_capabilities: updated });
    }
    // Toggle open/close locally
    setOpenCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const allReviewed = visitedCards.size === 5;

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
        transcriptMd={videoData?.transcriptMd}
        glossary={videoData?.glossary}
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
          IQ measured logical reasoning. EQ measured emotional intelligence. HaiQ is how effectively
          you partner with AI while maintaining creative agency.
        </p>
      </div>

      {/* ── What Makes HaiQ Human — Five Collapsible Cards ── */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-purple-800 mb-1">What Makes HaiQ Human</h2>
          <p className="text-sm text-gray-600 mb-2">
            Your five capabilities — and why AI doesn't have them.
          </p>
          {allReviewed ? (
            <span className="text-sm font-medium text-green-600">✓ All 5 reviewed</span>
          ) : (
            <span className="text-sm text-gray-400">{visitedCards.size} of 5 reviewed</span>
          )}
        </div>

        <div className="space-y-3">
          {CAPABILITY_CARDS.map(card => {
            const isOpen = openCards.has(card.key);
            const isVisited = visitedCards.has(card.key);

            return (
              <div
                key={card.key}
                className="rounded-xl border overflow-hidden transition-all"
                style={{
                  borderColor: isVisited ? card.color : card.border,
                  backgroundColor: isOpen || isVisited ? card.lightBg : '#fff',
                }}
              >
                {/* Collapsed header — always visible */}
                <button
                  type="button"
                  onClick={() => toggleCard(card.key)}
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
                      : isVisited
                        ? <span className="text-xl font-bold leading-none" style={{ color: card.color }}>✓</span>
                        : <ChevronDown size={18} className="text-gray-400" />
                    }
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4">
                    {/* You bring */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: card.color }}>
                        You bring
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {card.youBring}
                      </p>
                    </div>

                    {/* AI can't */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                        AI can't
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {card.aiCant}
                      </p>
                    </div>

                    {/* Extra callout for courage */}
                    {card.extraCallout && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800 font-medium italic">
                          {card.extraCallout}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Combinations mention — revealed after all 5 reviewed */}
      {allReviewed && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <p className="text-purple-800 leading-relaxed">
            These capabilities don't work alone — you experienced that throughout
            the workshop. When they combine, they produce something greater: {' '}
            <strong>judgment</strong>. The ability to navigate complexity with
            awareness, integrity, and vision. AI can analyze. Judgment is yours.
          </p>
        </div>
      )}

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

      {/* Continue — gated on all 5 reviewed */}
      <div className="flex flex-col items-end">
        {!allReviewed && (
          <p className="text-sm text-gray-400 text-center mb-2">
            Review all 5 capabilities to continue
          </p>
        )}
        <Button
          onClick={() => onNext?.('ia-5-1')}
          disabled={!allReviewed}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg disabled:opacity-40"
        >
          Continue to Your Capability Matrix →
        </Button>
      </div>
    </div>
  );
};

export default IA_5_4_HaiQ;
