import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, Loader2 } from 'lucide-react';
import { PROMPTS, buildCrossExerciseContext } from '@/constants/prompts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MuseResult {
  activity: string;
  activityCategory: string;
  guide: string;
  chipSelections: Record<string, string[]>;
  transcript: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface InvitingTheMuseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMuse: { id: string; title: string; response: string } | null;
  chosenActivity: string;
  activityCategory: string;
  reframeData: { challenge: string; reframe: string } | null;
  onComplete: (result: MuseResult) => void;
  crossExerciseOutputs?: Parameters<typeof buildCrossExerciseContext>[0];
}

// Backward-compat alias
export type ActionPlanningModalProps = InvitingTheMuseModalProps;

// ─── Marker helpers ────────────────────────────────────────────────────────────

function extractGuide(text: string): string | null {
  const match = text.match(/\[GUIDE\]([\s\S]*?)\[\/GUIDE\]/i);
  return match ? match[1].trim() : null;
}

function stripMarkers(text: string): string {
  return text
    .replace(/\[GUIDE\][\s\S]*?\[\/GUIDE\]/gi, '')
    .replace(/^\[REDIRECT\]\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Simple guide renderer ──────────────────────────────────────────────────

export function renderGuideContent(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-purple-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (trimmed.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 ml-2 text-sm text-gray-700">
          <span className="text-purple-500 flex-shrink-0">&bull;</span>
          <span>{rendered.map((r) => typeof r === 'string' ? r.replace(/^- /, '') : r)}</span>
        </div>
      );
    }

    return <p key={i} className="text-sm text-gray-700">{rendered}</p>;
  });
}

// Keep old name for backward compat
export const renderPrepCardContent = renderGuideContent;

// ─── Chip Data Structure ──────────────────────────────────────────────────────

interface ChipQuestion {
  id: string;
  label: string;
  chips: string[];
  /** If set, this question is skipped for activities whose id is in skipFor */
  skipFor?: string[];
  /** Activity-specific chip variants for movement category */
  variants?: Record<string, { label?: string; chips: string[] }>;
}

interface CategoryChipSet {
  questions: ChipQuestion[];
}

const MOVEMENT_CHIPS: CategoryChipSet = {
  questions: [
    {
      id: 'frees-mind',
      label: 'What kind of [activity] frees your mind?',
      chips: [], // overridden by variants
      variants: {
        driving: { chips: ['Highway / freeway', 'Back roads', 'Long familiar routes', 'Road trips'] },
        nature: { chips: ['Neighborhood streets', 'Trail or park', 'Somewhere new', 'Familiar loop'] },
        walking: { chips: ['Neighborhood streets', 'Trail or park', 'Somewhere new', 'Familiar loop'] },
        'pet-walk': { chips: ['Neighborhood streets', 'Trail or park', 'Somewhere new', 'Familiar loop'] },
        running: { chips: ['Steady pace', 'Interval or hard effort', 'Long slow distance', 'Treadmill'] },
        swimming: { chips: ['Laps', 'Open water', 'Just floating'] },
      },
    },
    {
      id: 'audio',
      label: 'What do you usually have on?',
      chips: ['Podcasts', 'Music', 'Audiobooks', 'Nothing'],
      skipFor: ['swimming'],
    },
    {
      id: 'mind-wander',
      label: 'When does your mind start to wander?',
      chips: ['Right away', 'After 15\u201320 min', 'Once I settle in'],
      variants: {
        driving: { chips: ['Right away', 'After 15\u201320 min', 'Once I settle in', 'When I stop thinking about directions'] },
        nature: { chips: ['Right away', 'After 15\u201320 min', 'Once I settle in', 'When I stop thinking about directions'] },
        walking: { chips: ['Right away', 'After 15\u201320 min', 'Once I settle in', 'When I stop thinking about directions'] },
        'pet-walk': { chips: ['Right away', 'After 15\u201320 min', 'Once I settle in', 'When I stop thinking about directions'] },
      },
    },
  ],
};

const MAKING_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'approach', label: 'How do you approach it?', chips: ['Follow a plan', 'Improvise', 'Mix of both'] },
    { id: 'setting', label: "What's the setting?", chips: ['Solo and quiet', 'Background music or TV', 'With other people around'] },
    { id: 'relaxes', label: 'What part relaxes you?', chips: ['Repetitive motion', 'Problem-solving', 'Sensory focus (textures, sounds, smells)'] },
  ],
};

const STILLNESS_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'time', label: 'How much time do you usually have?', chips: ['Quick (5\u201310 min)', 'Medium (15\u201330 min)', 'Long (30+ min)'] },
    { id: 'where', label: 'Where?', chips: ['Indoors', 'Outdoors', 'Depends'] },
    { id: 'thoughts', label: 'What happens to your thoughts?', chips: ['They slow down', 'They wander freely', 'They get clearer', 'They come in bursts'] },
  ],
};

const WORDS_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'engage', label: 'How do you engage?', chips: ['Deep focus', 'Browsing and following threads', 'Alternating between active and passive'] },
    { id: 'social', label: 'Alone or shared?', chips: ['Solo', 'Discussing with someone', 'Both'] },
    { id: 'ideas-when', label: 'When do ideas hit?', chips: ['While I\'m in it', 'Right after', 'Later, unexpectedly'] },
  ],
};

const SENSES_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'draws-in', label: 'What draws you in?', chips: ['Visual detail', 'Sound or music', 'The unexpected', 'Emotional resonance'] },
    { id: 'create-absorb', label: 'Are you creating or absorbing?', chips: ['Creating or capturing', 'Absorbing', 'Both'] },
    { id: 'after', label: 'What happens after?', chips: ['I want to talk about it', 'I sit with it quietly', 'I want to make something'] },
  ],
};

const PLAY_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'mode', label: "What's the mode?", chips: ['Structured (rules, goals)', 'Unstructured (goofing around)', 'Social energy', 'Solitary play'] },
    { id: 'frees-up', label: 'What does it free up?', chips: ['I stop self-editing', 'I think out loud', 'I get competitive focus', 'I laugh and reset'] },
    { id: 'ideas-how', label: 'How do ideas come?', chips: ['In conversation', 'During the activity', 'After, when I\'m alone'] },
  ],
};

const GENERAL_CHIPS: CategoryChipSet = {
  questions: [
    { id: 'approach', label: 'How do you approach this activity?', chips: ['Follow a routine', 'Improvise', 'Mix of both'] },
    { id: 'setting', label: "What's the setting?", chips: ['Solo and quiet', 'With background sound', 'With other people'] },
    { id: 'ideas-when', label: 'When do ideas surface?', chips: ['During the activity', 'Right after', 'Later, unexpectedly'] },
  ],
};

const CATEGORY_CHIP_SETS: Record<string, CategoryChipSet> = {
  movement: MOVEMENT_CHIPS,
  making: MAKING_CHIPS,
  stillness: STILLNESS_CHIPS,
  words: WORDS_CHIPS,
  senses: SENSES_CHIPS,
  'play-connection': PLAY_CHIPS,
  general: GENERAL_CHIPS,
};

// Shared chip sections (rendered after category-specific questions)
const DEVICE_QUESTION: ChipQuestion = {
  id: 'device',
  label: 'Will you have a phone or device with you?',
  chips: ['Yes, within reach', 'Yes, but put away', 'No'],
};

const PHONE_TYPE_QUESTION: ChipQuestion = {
  id: 'phone-type',
  label: 'What kind of phone?',
  chips: ['iPhone', 'Android', 'Other'],
};

const PHONE_HEAR_QUESTION: ChipQuestion = {
  id: 'phone-hear',
  label: 'Can your phone hear you? (voice commands like Siri or Google Assistant)',
  chips: ['Yes', 'No', 'Not sure'],
};

const VOICE_AI_QUESTION: ChipQuestion = {
  id: 'voice-ai',
  label: 'Do you use conversational voice AI? (ChatGPT voice, Claude, Perplexity, etc.)',
  chips: ['All the time', "I've tried it", "I'm interested", 'Not for me'],
};

const CAPABILITY_QUESTION: ChipQuestion = {
  id: 'capability',
  label: 'What do you want to practice noticing?',
  chips: ['Courage', 'Curiosity', 'Creativity', 'Caring', 'Imagination', 'Open to whatever'],
};

const CAPABILITY_CHIP_COLORS: Record<string, string> = {
  'Imagination': 'bg-purple-100 border-purple-300 text-purple-700',
  'Curiosity': 'bg-green-100 border-green-300 text-green-700',
  'Caring': 'bg-blue-100 border-blue-300 text-blue-700',
  'Creativity': 'bg-amber-100 border-amber-300 text-amber-700',
  'Courage': 'bg-red-100 border-red-300 text-red-700',
  'Open to whatever': 'bg-gray-100 border-gray-300 text-gray-600',
};

const CAPABILITY_ACTIVE_COLORS: Record<string, string> = {
  'Imagination': 'bg-purple-200 border-purple-500 text-purple-800 ring-2 ring-purple-300',
  'Curiosity': 'bg-green-200 border-green-500 text-green-800 ring-2 ring-green-300',
  'Caring': 'bg-blue-200 border-blue-500 text-blue-800 ring-2 ring-blue-300',
  'Creativity': 'bg-amber-200 border-amber-500 text-amber-800 ring-2 ring-amber-300',
  'Courage': 'bg-red-200 border-red-500 text-red-800 ring-2 ring-red-300',
  'Open to whatever': 'bg-gray-200 border-gray-500 text-gray-700 ring-2 ring-gray-300',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQuestionsForCategory(categoryId: string, activityId: string): ChipQuestion[] {
  const chipSet = CATEGORY_CHIP_SETS[categoryId] ?? CATEGORY_CHIP_SETS.general;
  return chipSet.questions
    .filter(q => !q.skipFor?.includes(activityId))
    .map(q => {
      if (q.variants && q.variants[activityId]) {
        const variant = q.variants[activityId];
        return { ...q, chips: variant.chips, label: variant.label ?? q.label };
      }
      return q;
    });
}

function formatChipMessage(
  activity: string,
  category: string,
  selections: Record<string, string[]>,
  crossContext: string,
  reframeData: { challenge: string; reframe: string } | null,
): string {
  const lines: string[] = [
    `ACTIVITY: ${activity}`,
    `CATEGORY: ${category}`,
    '',
  ];

  // Category-specific chips
  const catChips: string[] = [];
  const deviceChips: string[] = [];
  let voiceAi = '';
  let capabilities = '';

  for (const [key, values] of Object.entries(selections)) {
    if (values.length === 0) continue;
    const joined = values.join(', ');
    if (key === 'device' || key === 'phone-type' || key === 'phone-hear') {
      deviceChips.push(`- ${key}: ${joined}`);
    } else if (key === 'voice-ai') {
      voiceAi = joined;
    } else if (key === 'capability') {
      capabilities = joined;
    } else {
      catChips.push(`- ${key}: ${joined}`);
    }
  }

  if (catChips.length > 0) {
    lines.push('ACTIVITY CHIPS:');
    lines.push(...catChips);
    lines.push('');
  }

  if (deviceChips.length > 0) {
    lines.push('DEVICE CHIPS:');
    lines.push(...deviceChips);
    lines.push('');
  }

  if (voiceAi) {
    lines.push(`VOICE AI: ${voiceAi}`);
    lines.push('');
  }

  if (capabilities) {
    lines.push(`CAPABILITIES: ${capabilities}`);
    lines.push('');
  }

  if (reframeData) {
    lines.push(`REFRAME HOOK: "${reframeData.reframe}" (from challenge: "${reframeData.challenge}")`);
    lines.push('');
  }

  if (crossContext) {
    lines.push('CROSS-EXERCISE CONTEXT:');
    lines.push(crossContext);
  }

  return lines.join('\n').trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

type ModalPhase = 'chips' | 'conversation' | 'done';

export function InvitingTheMuseModal({
  open,
  onOpenChange,
  chosenActivity,
  activityCategory,
  reframeData,
  onComplete,
  crossExerciseOutputs = {},
}: InvitingTheMuseModalProps) {
  const [phase, setPhase] = React.useState<ModalPhase>('chips');
  const [chipSelections, setChipSelections] = React.useState<Record<string, string[]>>({});
  const [transcript, setTranscript] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [currentGuide, setCurrentGuide] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [userInput, setUserInput] = React.useState('');
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);

  const apiMessagesRef = React.useRef<Array<{ role: string; content: string }>>([]);
  const transcriptEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll
  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setPhase('chips');
      setChipSelections({});
      setTranscript([]);
      setCurrentGuide('');
      setIsSending(false);
      setUserInput('');
      setShowCloseConfirm(false);
      apiMessagesRef.current = [];
    }
  }, [open]);

  // Derive activity ID from chosen activity title
  const activityId = React.useMemo(() => {
    const chipSet = CATEGORY_CHIP_SETS[activityCategory];
    if (!chipSet) return '';
    // Search all categories for matching activity title
    // We need the ID, not the title - but we receive the title as chosenActivity
    // The parent passes the title, so we need to look it up
    return chosenActivity.toLowerCase().replace(/\s+/g, '-');
  }, [chosenActivity, activityCategory]);

  // Get the actual activity ID by matching title across all categories
  const resolvedActivityId = React.useMemo(() => {
    for (const cat of Object.values(CATEGORY_CHIP_SETS)) {
      // We don't have access to FLOW_CATEGORIES here, so we use a prop-based approach
    }
    // The activityCategory and chosenActivity come from the parent.
    // For movement sub-variants, we need to identify the specific activity.
    // The parent passes the activity title. We match known titles to IDs.
    const titleToId: Record<string, string> = {
      'Walking in nature': 'nature',
      'Walking or hiking': 'walking',
      'Walking or playing with a pet': 'pet-walk',
      'Running or exercise': 'running',
      'Swimming or being in water': 'swimming',
      'Driving alone': 'driving',
    };
    return titleToId[chosenActivity] ?? activityId;
  }, [chosenActivity, activityId]);

  // Category questions based on activity
  const categoryQuestions = React.useMemo(
    () => getQuestionsForCategory(activityCategory, resolvedActivityId),
    [activityCategory, resolvedActivityId],
  );

  // Check if any phone option was selected (for conditional questions)
  const hasPhone = React.useMemo(() => {
    const device = chipSelections['device'] ?? [];
    return device.some(d => d.startsWith('Yes'));
  }, [chipSelections]);

  // Check if any chip is selected
  const hasAnyChip = React.useMemo(() => {
    return Object.values(chipSelections).some(v => v.length > 0);
  }, [chipSelections]);

  // Toggle a chip selection (multi-select)
  const toggleChip = (questionId: string, chip: string) => {
    setChipSelections(prev => {
      const current = prev[questionId] ?? [];
      const next = current.includes(chip)
        ? current.filter(c => c !== chip)
        : [...current, chip];
      // If deselecting all phone options, clear conditional questions
      if (questionId === 'device' && !next.some(d => d.startsWith('Yes'))) {
        const { 'phone-type': _pt, 'phone-hear': _ph, ...rest } = prev;
        return { ...rest, [questionId]: next };
      }
      return { ...prev, [questionId]: next };
    });
  };

  // Build system prompt
  const fullSystemPrompt = React.useMemo(() => {
    const crossCtx = buildCrossExerciseContext(crossExerciseOutputs);
    return crossCtx ? `${PROMPTS.IA_4_5}\n\n${crossCtx}` : PROMPTS.IA_4_5;
  }, [crossExerciseOutputs]);

  // Send to AI
  const sendToAI = React.useCallback(async (userText: string) => {
    setIsSending(true);
    try {
      apiMessagesRef.current = [
        ...apiMessagesRef.current,
        { role: 'user', content: userText },
      ];

      const resp = await fetch('/api/ai/chat/plain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          training_id: 'ia-4-5',
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...apiMessagesRef.current,
          ],
        }),
      });

      const data = await resp.json();
      if (data?.success && data?.reply) {
        apiMessagesRef.current = [
          ...apiMessagesRef.current,
          { role: 'assistant', content: data.reply },
        ];

        // Extract guide
        const guide = extractGuide(data.reply);
        if (guide) setCurrentGuide(guide);

        // Strip markers for display
        const clean = stripMarkers(data.reply);
        const displayText = clean || (guide ? '' : data.reply);

        setTranscript(prev => [...prev, { role: 'assistant', content: guide ? data.reply.replace(/\[GUIDE\][\s\S]*?\[\/GUIDE\]/i, guide).replace(/\[GUIDE\]/gi, '').replace(/\[\/GUIDE\]/gi, '') : displayText }]);
      }
    } catch (err) {
      console.error('AI send failed:', err);
    } finally {
      setIsSending(false);
    }
  }, [fullSystemPrompt]);

  // Handle "Prepare me" button
  const handlePrepareMe = async () => {
    const crossCtx = buildCrossExerciseContext(crossExerciseOutputs);
    const msg = formatChipMessage(chosenActivity, activityCategory, chipSelections, crossCtx, reframeData);
    setPhase('conversation');
    setTranscript([]);
    await sendToAI(msg);
  };

  // Handle refinement send
  const handleSendRefinement = async () => {
    if (!userInput.trim() || isSending) return;
    const text = userInput.trim();
    setUserInput('');
    setTranscript(prev => [...prev, { role: 'user', content: text }]);
    await sendToAI(text);
  };

  // Handle accept
  const handleAccept = () => {
    setPhase('done');
  };

  // Handle done
  const handleDone = () => {
    onComplete({
      activity: chosenActivity,
      activityCategory,
      guide: currentGuide,
      chipSelections,
      transcript,
    });
    onOpenChange(false);
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (phase === 'done') {
      // On done screen, just close (guide already accepted)
      handleDone();
      return;
    }
    if (hasAnyChip || phase === 'conversation') {
      setShowCloseConfirm(true);
      return;
    }
    onOpenChange(false);
  };

  // ── Render chip question ──────────────────────────────────────────────────

  const renderChipQuestion = (q: ChipQuestion, isCapability?: boolean) => {
    const selected = chipSelections[q.id] ?? [];
    return (
      <div key={q.id} className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          {q.label.replace('[activity]', chosenActivity.toLowerCase())}
        </p>
        <div className="flex flex-wrap gap-2">
          {q.chips.map(chip => {
            const isSelected = selected.includes(chip);
            let chipClass: string;
            if (isCapability) {
              chipClass = isSelected
                ? CAPABILITY_ACTIVE_COLORS[chip] ?? 'bg-purple-200 border-purple-500 text-purple-800 ring-2 ring-purple-300'
                : CAPABILITY_CHIP_COLORS[chip] ?? 'bg-gray-100 border-gray-300 text-gray-600';
            } else {
              chipClass = isSelected
                ? 'bg-purple-100 border-purple-400 text-purple-800 ring-2 ring-purple-300'
                : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50';
            }
            return (
              <button
                key={chip}
                type="button"
                onClick={() => toggleChip(q.id, chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${chipClass}`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Render conversation messages ──────────────────────────────────────────

  const renderConversationMessages = () => (
    <div className="flex-1 overflow-y-auto space-y-3 mb-3">
      {transcript.map((msg, i) => {
        if (msg.role === 'user') return null; // Don't show the structured data message
        return (
          <div key={i} className="bg-white border-l-2 border-purple-400 rounded-lg px-4 py-3">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {renderGuideContent(msg.content)}
            </div>
            {/* Show "This looks right" after each AI message when not sending */}
            {!isSending && i === transcript.length - 1 && (
              <div className="mt-4">
                <Button
                  onClick={handleAccept}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  This looks right
                </Button>
              </div>
            )}
          </div>
        );
      })}
      {isSending && (
        <div className="flex items-center gap-2 text-sm text-purple-600 px-3 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Preparing your guide...
        </div>
      )}
      <div ref={transcriptEndRef} />
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={() => handleClose()} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[540px] w-full p-0 rounded-lg shadow-lg overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-3 px-4 py-3 flex-shrink-0">
          <img src="/assets/adv_rung4_split.png" alt="Rung 4" className="h-8 flex-shrink-0" />
          <div className="flex-grow min-w-0">
            <DialogTitle className="text-base font-semibold text-gray-800">
              Inviting the muse &mdash; AI partner
            </DialogTitle>
            <p className="text-xs text-purple-600 truncate">Preparing: {chosenActivity}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </header>

        {/* ── Close Confirmation Overlay ── */}
        {showCloseConfirm && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-5 max-w-[320px] shadow-xl">
              <p className="text-sm text-gray-700 mb-4">
                Close without finishing? Your selections and conversation will be lost.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowCloseConfirm(false)}>
                  Keep going
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 1: Chips ── */}
        {phase === 'chips' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {/* Category-specific questions */}
            {categoryQuestions.map(q => renderChipQuestion(q))}

            {/* Divider + Capture Setup */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Capture setup</p>
              {renderChipQuestion(DEVICE_QUESTION)}
              {hasPhone && (
                <>
                  {renderChipQuestion(PHONE_TYPE_QUESTION)}
                  {renderChipQuestion(PHONE_HEAR_QUESTION)}
                </>
              )}
            </div>

            {/* Voice AI */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              {renderChipQuestion(VOICE_AI_QUESTION)}
              <p className="text-xs text-gray-500 -mt-2 mb-3">
                After your activity, voice AI can help you develop what surfaced.
              </p>
            </div>

            {/* Capabilities */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              {renderChipQuestion(CAPABILITY_QUESTION, true)}
            </div>

            {/* Prepare me button */}
            <div className="pt-4 pb-2">
              <Button
                onClick={handlePrepareMe}
                disabled={!hasAnyChip || isSending}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white"
              >
                Prepare me
              </Button>
            </div>
          </div>
        )}

        {/* ── Phase 2: Conversation ── */}
        {phase === 'conversation' && (
          <div className="flex-1 flex flex-col min-h-0 p-4" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {renderConversationMessages()}

            {/* Refinement input */}
            {!isSending && transcript.some(m => m.role === 'assistant') && (
              <div className="flex-shrink-0 flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendRefinement(); } }}
                  placeholder="Tell AI what to adjust..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                />
                <Button
                  onClick={handleSendRefinement}
                  disabled={!userInput.trim()}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Send
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Phase 3: Done ── */}
        {phase === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-purple-500 mb-4" />
            <p className="text-sm text-gray-700 mb-6">
              Your guide is ready &mdash; it&apos;s on the content area below.
            </p>
            <Button onClick={handleDone} className="bg-purple-600 hover:bg-purple-700 text-white">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Backward-compat default export and named alias
export default InvitingTheMuseModal;
export { InvitingTheMuseModal as ActionPlanningModal };
