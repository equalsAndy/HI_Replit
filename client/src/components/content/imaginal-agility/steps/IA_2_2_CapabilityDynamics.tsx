import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CapabilityPulse from '@/components/ia/CapabilityPulse';
import { useContinuity } from '@/hooks/useContinuity';

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

interface IA22DynamicsProps {
  onNext?: (stepId: string) => void;
}

const CAPABILITY_DEFS: Record<CapabilityKey, {
  color: string;
  lightBg: string;
  border: string;
  image: string;
  label: string;
}> = {
  imagination: { color: '#8b5cf6', lightBg: '#faf5ff', border: '#d8b4fe', image: '/assets/Imagination_sq.png', label: 'Imagination' },
  curiosity:   { color: '#10b981', lightBg: '#ecfdf5', border: '#6ee7b7', image: '/assets/Curiosity_sq.png',   label: 'Curiosity' },
  caring:      { color: '#3b82f6', lightBg: '#eff6ff', border: '#93c5fd', image: '/assets/Caring_sq.png',      label: 'Caring' },
  creativity:  { color: '#f59e0b', lightBg: '#fffbeb', border: '#fcd34d', image: '/assets/Creativity_sq.png',  label: 'Creativity' },
  courage:     { color: '#ef4444', lightBg: '#fef2f2', border: '#fca5a5', image: '/assets/courage_sq.png',     label: 'Courage' },
};

const CAPABILITY_ORDER: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

interface Dimension {
  title: string;
  text: string;
}

interface CapabilityContent {
  oneLiner: string;
  dimensions: Dimension[];
  insight: string;
}

const CAPABILITY_CONTENT: Record<CapabilityKey, CapabilityContent> = {
  imagination: {
    oneLiner: "More than creativity — it's your mind's ability to build what doesn't exist yet",
    dimensions: [
      {
        title: 'The generative side',
        text: 'Imagination is how you picture a future that hasn\'t happened, a solution that doesn\'t exist yet, a version of yourself you haven\'t become. It\'s the engine behind every plan, every ambition, every "what if we tried..." moment. When someone says "I can see it" — that\'s imagination working.',
      },
      {
        title: 'The shadow side',
        text: 'The same engine that builds hopeful futures also builds terrifying ones. Anxiety is imagination at work — vivid, detailed, locked onto a single worst-case scenario. The capability isn\'t broken. It\'s just unbalanced — running at full power without curiosity to open other channels or courage to face what it\'s showing you.',
      },
    ],
    insight: 'When your imagination is generating worry, that\'s not weakness. It\'s a powerful capability that needs a partner. The question isn\'t "how do I stop imagining?" — it\'s "what else could I imagine?"',
  },
  curiosity: {
    oneLiner: "Not just asking questions — it's the willingness to be changed by the answers",
    dimensions: [
      {
        title: 'Curiosity outward — toward others',
        text: 'Genuinely asking someone a question you don\'t know the answer to. Not the polite "how was your weekend?" but the real question: "What\'s actually going on with this project?" This requires caring enough to want to understand — and courage to hear an answer you might not expect or want.',
      },
      {
        title: 'Curiosity inward — toward yourself',
        text: 'Asking yourself the question you\'ve been avoiding. "Why did that bother me so much?" or "What am I actually afraid of here?" This is perhaps the hardest form of curiosity. Without courage, self-inquiry stays at the surface — "I wonder why I do that... anyway." — never uncomfortable enough to produce real insight.',
      },
    ],
    insight: "Most people think of curiosity as gentle and pleasant. The curiosity that actually changes you requires courage as its partner. If it doesn't feel slightly uncomfortable, you might just be browsing.",
  },
  caring: {
    oneLiner: "Not just empathy — it includes the hardest kind of honesty",
    dimensions: [
      {
        title: 'The warm side',
        text: 'Noticing when someone is struggling before they say anything. Reading the room. Remembering what matters to people. Caring is the capability that makes teams feel safe and relationships feel real. It\'s how trust gets built — one moment of "I see you" at a time.',
      },
      {
        title: 'The hard side',
        text: "Caring also means telling someone what they need to hear, not what they want to hear. Holding someone accountable because you care about them, not despite it. A manager who avoids hard feedback isn't being kind — they're abandoning the person who needs to grow. Real caring sometimes looks like friction.",
      },
      {
        title: 'Caring turned inward',
        text: "The most overlooked dimension: caring about yourself enough to set limits. People with high caring often put themselves last — treating self-care as selfish. But a capability that only flows outward eventually empties. Caring without self-inclusion is a path to burnout, not virtue.",
      },
    ],
    insight: "If you find yourself exhausted from caring about others, the answer isn't to care less. It's to include yourself in who you care about — and to let courage help you protect that.",
  },
  creativity: {
    oneLiner: "Not just art — it's making connections between things that weren't connected",
    dimensions: [
      {
        title: 'The connective side',
        text: "Creativity is what happens when two ideas that had no business being together suddenly click. It's the engineer who borrows from biology. The teacher who uses a game mechanic to explain physics. The manager who solves a team conflict with an approach from improv theater. Creativity isn't making something from nothing — it's seeing a bridge between things that already exist.",
      },
      {
        title: 'The restless side',
        text: "Creativity without direction becomes novelty addiction — reinventing things that were working fine, starting projects you won't finish, generating ideas faster than anyone can absorb them. The energy is real, but it's spinning. Creativity needs caring to give it purpose: \"Does this actually matter to anyone?\" — and courage to finish what it starts instead of chasing the next spark.",
      },
    ],
    insight: "The most creative people you know probably aren't the ones with the most ideas. They're the ones who connected an idea to something that mattered — and had the courage to ship it imperfect.",
  },
  courage: {
    oneLiner: "Not just boldness — sometimes the bravest thing is to pause",
    dimensions: [
      {
        title: 'Courage to act',
        text: "Saying the thing everyone is thinking but no one will say. Starting before you feel ready. Submitting the proposal that might get rejected. Raising your hand when you'd rather stay invisible. This is the courage people recognize — the willingness to move toward discomfort instead of away from it.",
      },
      {
        title: 'Courage to pause',
        text: "Equally hard and far less celebrated: the courage not to react. To sit with ambiguity when everyone wants an answer now. To let a silence hold instead of filling it. To resist the pull of urgency when the situation actually needs thought. Pausing looks like inaction. Often it's the bravest choice available.",
      },
      {
        title: 'Courage to be wrong',
        text: 'Perhaps the rarest form: publicly changing your mind. Saying "I was wrong about this" in front of people who heard you be confident. Most people would rather quietly pivot than openly admit the shift. Courage to be wrong is what makes learning visible — and gives others permission to do the same.',
      },
    ],
    insight: "Courage without imagination is recklessness. Courage without caring is bulldozing. The capability isn't about being fearless — it's about acting (or pausing) with full awareness of what's at stake.",
  },
};

interface CombinationResult {
  title: string;
  description: string;
  example: string;
}

const COMBINATIONS: Record<string, CombinationResult> = {
  'courage,imagination': {
    title: 'Bold Vision',
    description: 'You can picture something ambitious and step toward it. The imagination provides the destination; the courage provides the first step.',
    example: 'Proposing a radical product direction in a room full of skeptics — because you can see where it leads.',
  },
  'caring,curiosity': {
    title: 'Deep Listening',
    description: 'You genuinely want to understand, and you care about what you hear. This is how trust gets built in one conversation.',
    example: 'Asking your quiet team member what they really think about the new strategy — and staying with the answer.',
  },
  'courage,creativity': {
    title: 'Ideas That Ship',
    description: 'Novel thinking meets willingness to put it out there imperfect. Most ideas die in notebooks. These ones escape.',
    example: 'Sharing a rough prototype with a client instead of waiting for polish — because the feedback is worth more than the finish.',
  },
  'caring,imagination': {
    title: 'Empathy With Vision',
    description: 'You feel what others feel and can picture a way forward. This is what makes someone a leader people follow by choice.',
    example: 'Sensing your team is burned out and imagining a different way to structure the sprint — before anyone asks.',
  },
  'caring,courage': {
    title: 'Honest Kindness',
    description: "You care enough to say the hard thing. Not cruelty dressed as honesty — genuine concern that risks discomfort to serve growth.",
    example: "Telling a colleague their presentation needs rework — with specifics and an offer to help — instead of nodding politely.",
  },
  'curiosity,imagination': {
    title: 'Possibility Space',
    description: "Curiosity asks 'what if?' and imagination builds it. Together they generate options no one else has considered.",
    example: "Walking into a stuck meeting and asking 'What would this look like if we had no budget constraints?' — then sketching it.",
  },
  'curiosity,courage': {
    title: 'Fearless Inquiry',
    description: 'The willingness to ask questions that make people uncomfortable — including yourself. This is how blind spots get named.',
    example: "Asking your CEO 'What are we avoiding talking about?' in the all-hands. Or asking yourself the same question at 2am.",
  },
  'caring,creativity': {
    title: 'Purposeful Innovation',
    description: "Creative solutions anchored in what actually matters to people. Not novelty for its own sake — invention with heart.",
    example: "Designing a new onboarding flow not because the old one was boring, but because new hires felt lost and alone.",
  },
  'courage,curiosity,imagination': {
    title: "Explorer's Courage",
    description: "You venture into unknown territory with open eyes and open mind. You can imagine what might be out there, you want to understand it, and you're willing to go.",
    example: "Taking on a project in a domain you know nothing about — because the questions excite you more than the risk scares you.",
  },
  'caring,curiosity,courage': {
    title: 'Transformative Conversation',
    description: "The combination behind every conversation that actually changes something. You care, you're genuinely curious, and you're willing to go where the truth leads.",
    example: "A performance review that both people walk away from feeling seen, challenged, and motivated — because you brought all three.",
  },
  'caring,creativity,courage': {
    title: 'Compassionate Disruption',
    description: "You see a better way, you care about the people affected, and you have the nerve to make it happen. Change that serves people instead of ignoring them.",
    example: "Restructuring a dysfunctional team process — with transparency about why, genuine concern for the transition, and a creative new approach.",
  },
  'creativity,curiosity,imagination': {
    title: 'Visionary Exploration',
    description: "Ideas flow from everywhere. You're asking questions, imagining answers, and connecting dots across domains. This is where breakthrough thinking lives.",
    example: "A research rabbit hole that leads you to combine concepts from neuroscience and architecture into a new workspace design.",
  },
  'caring,courage,creativity,curiosity,imagination': {
    title: 'Judgment',
    description: "All five capabilities working together. This is what produces human judgment — the ability to navigate complexity with awareness, integrity, and vision. AI can analyze. This is what it cannot do.",
    example: "Every meaningful decision you've ever been proud of probably had all five present in some measure.",
  },
};

interface SignalCard {
  emoji: string;
  headline: string;
  story: string;
  overactive: string;
  overactiveColor: string;
  needed: string[];
  neededColors: string[];
  remedy: string;
}

const SIGNAL_CARDS: SignalCard[] = [
  {
    emoji: '🌀',
    headline: "You can picture everything that could go wrong — and you can't stop.",
    story: "The same scenario plays on repeat. The meeting going badly. The project failing. The conversation turning hostile. Your imagination is fully operational — it's just locked onto a single channel, generating vivid futures you can't look away from.",
    overactive: 'Imagination overactive',
    overactiveColor: CAPABILITY_DEFS.imagination.color,
    needed: ['Curiosity needed'],
    neededColors: [CAPABILITY_DEFS.curiosity.color],
    remedy: '"Curiosity breaks the loop by opening other channels. "What else could actually happen? What am I not considering? What would I tell a friend in this situation?" — the moment you ask a genuine question, you give imagination somewhere else to go.',
  },
  {
    emoji: '🫠',
    headline: "You say yes when you mean no. You absorb everyone's stress.",
    story: "You feel everything — the team's anxiety, your manager's pressure, the client's frustration. You take it on because you genuinely care. But you can't set a boundary to save your life. You leave every interaction depleted and wonder why no one notices what it costs you.",
    overactive: 'Caring overactive',
    overactiveColor: CAPABILITY_DEFS.caring.color,
    needed: ['Courage needed', 'Self-caring needed'],
    neededColors: [CAPABILITY_DEFS.courage.color, CAPABILITY_DEFS.caring.color],
    remedy: "Courage to say the hard thing — because you care, not despite it. And a radical reframe: self-care isn't selfishness. It's including yourself in the circle of people you care about. A depleted caregiver helps no one.",
  },
  {
    emoji: '🔄',
    headline: "You keep researching. You never feel ready to decide.",
    story: "One more article. One more opinion. One more data point. Your curiosity is doing its job beautifully — exploring every angle, finding every nuance. But nothing ever feels certain enough to act on. The deadline arrives and you still want more information.",
    overactive: 'Curiosity overactive',
    overactiveColor: CAPABILITY_DEFS.curiosity.color,
    needed: ['Courage needed'],
    neededColors: [CAPABILITY_DEFS.courage.color],
    remedy: '"Courage to commit to a direction with incomplete information. "What would I do if I trusted what I already know?" You\'ll never have all the data. At some point, the next step isn\'t more research — it\'s a decision.',
  },
  {
    emoji: '💨',
    headline: "You charge forward. You'll figure out the details later.",
    story: "Decisive, bold, unstoppable — until the consequences catch up. You said the thing without imagining how it would land. You launched the initiative without picturing what happens to the team carrying it. The courage was real. The imagination and caring weren't there yet.",
    overactive: 'Courage overactive',
    overactiveColor: CAPABILITY_DEFS.courage.color,
    needed: ['Imagination needed', 'Caring needed'],
    neededColors: [CAPABILITY_DEFS.imagination.color, CAPABILITY_DEFS.caring.color],
    remedy: '"Slow down enough to imagine the ripple effects. "What happens after I do this — to me, to them, to the thing I care about?" Courage paired with imagination becomes strategic boldness instead of reactive force.',
  },
  {
    emoji: '✨',
    headline: "You have great ideas constantly. None of them land.",
    story: "The ideas keep coming — new approaches, better systems, fresh frameworks. People nod enthusiastically. Then nothing happens. You're already onto the next idea before anyone has finished processing the last one. The creativity is real. What's missing is the grounding to finish and the conviction that any one idea is worth committing to.",
    overactive: 'Creativity overactive',
    overactiveColor: CAPABILITY_DEFS.creativity.color,
    needed: ['Caring needed', 'Courage needed'],
    neededColors: [CAPABILITY_DEFS.caring.color, CAPABILITY_DEFS.courage.color],
    remedy: 'Caring asks "Does this actually matter to anyone?" — connecting the idea to a human need. Courage asks "Am I willing to finish this one before starting the next?" The most creative people aren\'t the ones with the most ideas — they\'re the ones who connected one idea to something that mattered and shipped it.',
  },
];

const SUGGESTION_COMBOS: { label: string; keys: CapabilityKey[] }[] = [
  { label: 'Imagination + Courage', keys: ['imagination', 'courage'] },
  { label: 'Curiosity + Caring + Courage', keys: ['curiosity', 'caring', 'courage'] },
  { label: 'Creativity + Caring', keys: ['creativity', 'caring'] },
  { label: 'All five', keys: ['caring', 'courage', 'creativity', 'curiosity', 'imagination'] },
];

const LANGUAGE_SWITCHES = [
  { suppresses: '"Be realistic."', activates: '"What might be possible?"' },
  { suppresses: '"I can\'t imagine that."', activates: '"Help me imagine how this could work."' },
  { suppresses: '"Don\'t overthink it."', activates: '"What are we not seeing?"' },
  { suppresses: '"That\'s just how it is."', activates: '"What if it didn\'t have to be?"' },
];

function getComboKey(caps: CapabilityKey[]): string {
  return [...caps].sort().join(',');
}

const IA_2_2_CapabilityDynamics: React.FC<IA22DynamicsProps> = ({ onNext }) => {
  const { state, set } = useContinuity();
  const [openCards, setOpenCards] = useState<Set<CapabilityKey>>(new Set());
  const [visitedCards, setVisitedCards] = useState<Set<CapabilityKey>>(new Set());
  const [pulseFired, setPulseFired] = useState(false);
  const pulseComplete = pulseFired || !!state?.ia_2_1_pulse?.completedAt;
  const [selectedComboCaps, setSelectedComboCaps] = useState<CapabilityKey[]>([]);
  const [expandedSignals, setExpandedSignals] = useState<Set<number>>(new Set());
  const section2Ref = useRef<HTMLDivElement>(null);

  const allExplored = visitedCards.size === 5;

  const toggleCard = (key: CapabilityKey) => {
    setVisitedCards(prev => new Set(prev).add(key)); // always mark visited on open
    setOpenCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // When state loads async and pulse was already completed, scroll to sections
  const didAutoScroll = useRef(false);
  useEffect(() => {
    if (pulseComplete && !didAutoScroll.current) {
      didAutoScroll.current = true;
    }
  }, [pulseComplete]);

  const handlePulseComplete = (data: any) => {
    set((prev: any) => ({ ...prev, ia_2_1_pulse: data }));
    setPulseFired(true);
    setTimeout(() => {
      section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
  };

  const toggleComboChip = (key: CapabilityKey) => {
    setSelectedComboCaps(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      if (prev.length >= 5) return prev;
      return [...prev, key];
    });
  };

  const applySuggestion = (keys: CapabilityKey[]) => {
    setSelectedComboCaps(keys);
  };

  const comboResult: CombinationResult | null = selectedComboCaps.length >= 2
    ? COMBINATIONS[getComboKey(selectedComboCaps)] || {
        title: 'Explore this combination',
        description: 'Every combination produces something unique. In the exercises ahead, you\'ll discover what your specific combinations create.',
        example: '',
      }
    : null;

  const toggleSignal = (i: number) => {
    setExpandedSignals(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* Page header */}
      <h1 className="text-3xl font-bold text-purple-700 mb-2">Understanding Your Capabilities</h1>
      <p className="text-lg text-gray-500 mb-10">These five capabilities are already part of how you operate. Here's what they actually mean.</p>

      {/* ── Section 1: Capability Definitions ── */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Section 1</p>
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Five Capabilities, Five Dimensions of You</h2>
        <p className="text-gray-500 mb-8">Each capability is richer than its name suggests. Tap each one to discover what it actually looks like in practice — you'll recognize yourself.</p>

        <div className="space-y-3">
          {CAPABILITY_ORDER.map(key => {
            const def = CAPABILITY_DEFS[key];
            const content = CAPABILITY_CONTENT[key];
            const isOpen = openCards.has(key);
            const isVisited = visitedCards.has(key);

            return (
              <div
                key={key}
                className="rounded-xl border overflow-hidden transition-all"
                style={{
                  borderColor: isVisited ? def.color : def.border,
                  backgroundColor: isOpen ? def.lightBg : isVisited ? def.lightBg : '#fff',
                }}
              >
                {/* Collapsed header */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => toggleCard(key)}
                >
                  <img
                    src={def.image}
                    alt={def.label}
                    className="rounded-xl flex-shrink-0"
                    style={{ width: 44, height: 44, objectFit: 'cover' }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-base" style={{ color: def.color }}>{def.label}</span>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">{content.oneLiner}</p>
                  </div>
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {isOpen
                      ? <ChevronUp size={18} className="text-gray-400" />
                      : isVisited
                        ? <span className="text-xl font-bold leading-none" style={{ color: def.color }}>✓</span>
                        : <ChevronDown size={18} className="text-gray-400" />
                    }
                  </div>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-6 space-y-5">
                    {content.dimensions.map((dim, i) => (
                      <div key={i}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: def.color }}>{dim.title}</p>
                        <p className="text-gray-700 leading-relaxed text-sm">{dim.text}</p>
                      </div>
                    ))}
                    <div className="rounded-lg p-4 bg-purple-50 border border-purple-200 mt-2">
                      <p className="text-purple-800 text-sm italic leading-relaxed">"{content.insight}"</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explore counter */}
        <div className="mt-6 flex items-center gap-2">
          {allExplored ? (
            <span className="text-green-600 font-semibold text-sm">✓ All 5 explored</span>
          ) : (
            <span className="text-gray-500 text-sm">{visitedCards.size} / 5 explored</span>
          )}
        </div>
      </div>

      {/* ── CapabilityPulse ── */}
      <div className="mb-8">
        {!allExplored && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
            <Lock size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-medium">Explore all 5 capabilities above to unlock</p>
          </div>
        )}
        {allExplored && (
          <CapabilityPulse
            onComplete={handlePulseComplete}
            onContinue={() => {}}
            savedData={state?.ia_2_1_pulse || null}
            hideContinueButton
          />
        )}
      </div>

      {/* ── Section 2: Combination Explorer ── */}
      <div ref={section2Ref} className="relative mb-8">
        <div className={`bg-white rounded-xl shadow-lg p-8 border border-gray-200 ${!pulseComplete ? 'select-none' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Section 2</p>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">What Happens When They Combine</h2>
          <p className="text-gray-500 mb-2">Capabilities don't just work in pairs — they stack. The more you bring to a moment, the more dimensions your response has.</p>
          <p className="text-gray-500 text-sm mb-6">Click any two or three capabilities to see what they produce together. Notice that the same capability creates different outcomes depending on its partners.</p>

          <p className="text-center text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select 2–3 capabilities</p>

          {/* Capability chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CAPABILITY_ORDER.map(key => {
              const def = CAPABILITY_DEFS[key];
              const selected = selectedComboCaps.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleComboChip(key)}
                  disabled={!pulseComplete}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 font-medium text-sm transition-all"
                  style={{
                    borderColor: selected ? def.color : '#e5e7eb',
                    backgroundColor: selected ? def.lightBg : '#fff',
                    color: selected ? def.color : '#6b7280',
                  }}
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: def.color }} />
                  {def.label}
                </button>
              );
            })}
          </div>

          {/* Result area */}
          {comboResult && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-purple-700 mb-2">{comboResult.title}</h3>
              <p className="text-gray-700 leading-relaxed mb-3">{comboResult.description}</p>
              {comboResult.example && (
                <p className="text-sm text-gray-500 italic">Example: {comboResult.example}</p>
              )}
            </div>
          )}

          {/* Suggestion pills */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">A few combinations to try</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTION_COMBOS.map(s => (
                <button
                  key={s.label}
                  onClick={() => pulseComplete && applySuggestion(s.keys)}
                  disabled={!pulseComplete}
                  className="text-xs px-3 py-1.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-40"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        {!pulseComplete && (
          <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center"
            style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200 max-w-xs mx-4">
              <Lock size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">Complete the Capability Pulse above to unlock</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 3: Out of Balance ── */}
      <div className="relative mb-8">
        <div className={`bg-white rounded-xl shadow-lg p-8 border border-gray-200 ${!pulseComplete ? 'select-none' : ''}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Section 3</p>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">When Capabilities Are Out of Balance</h2>
          <p className="text-gray-500 mb-2">These aren't character flaws. They're signals — recognizable patterns that tell you what needs to shift. See if any feel familiar.</p>
          <p className="text-gray-500 text-sm mb-6">When a capability is running strong without enough support from others, it produces a pattern you'll probably recognize. Tap any card to see what's happening and what would restore balance.</p>

          <div className="space-y-3">
            {SIGNAL_CARDS.map((card, i) => {
              const isOpen = expandedSignals.has(i);
              return (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    className="w-full flex items-center gap-3 px-5 py-4 text-left"
                    onClick={() => pulseComplete && toggleSignal(i)}
                    disabled={!pulseComplete}
                  >
                    <span className="text-2xl flex-shrink-0">{card.emoji}</span>
                    <span className="flex-1 font-medium text-gray-800 text-sm leading-snug">{card.headline}</span>
                    <span className="flex-shrink-0 text-gray-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{card.story}</p>

                      {/* Balance pills */}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                          style={{ backgroundColor: card.overactiveColor }}
                        >
                          {card.overactive}
                        </span>
                        {card.needed.map((label, j) => (
                          <span
                            key={j}
                            className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                            style={{ backgroundColor: card.neededColors[j] }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Remedy</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{card.remedy}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Punchline box */}
          <div className="mt-8 rounded-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            <p className="font-bold text-lg mb-2">Every signal points to a capability you already have.</p>
            <p className="text-purple-100 text-sm leading-relaxed">The remedy is never "be better" or "try harder." It's noticing which capability is dormant and switching it on. You'll practice this throughout the workshop — and you'll start recognizing these signals in real time.</p>
          </div>

          {/* Language switches */}
          <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-2">One More Pattern to Notice</h3>
            <p className="text-sm text-gray-500 mb-5">The words around you activate or suppress capabilities before you consciously decide. Once you hear these switches, you'll catch them everywhere.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left pb-2 text-red-500 font-semibold text-xs uppercase tracking-wider w-1/2">Suppresses</th>
                    <th className="text-left pb-2 text-green-600 font-semibold text-xs uppercase tracking-wider w-1/2 pl-4">Activates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {LANGUAGE_SWITCHES.map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 text-gray-500 italic">{row.suppresses}</td>
                      <td className="py-3 text-gray-800 pl-4">{row.activates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lock overlay */}
        {!pulseComplete && (
          <div className="absolute inset-0 rounded-xl z-10 flex items-center justify-center"
            style={{ backdropFilter: 'blur(3px)', backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200 max-w-xs mx-4">
              <Lock size={28} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium text-sm">Complete the Capability Pulse above to unlock</p>
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => onNext?.('ia-2-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default IA_2_2_CapabilityDynamics;
