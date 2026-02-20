import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

const TAG_OPTIONS = [
  { value: 'Reframe',  label: 'Reframe',  helper: "I'm holding it differently now." },
  { value: 'Surprise', label: 'Surprise', helper: "Something I didn't expect clicked." },
  { value: 'Clarity',  label: 'Clarity',  helper: 'It feels simpler or sharper.' },
  { value: 'Curiosity',label: 'Curiosity',helper: 'I want to explore, not conclude.' },
  { value: 'Humor',    label: 'Humor',    helper: "It lightened; there's play here." },
  { value: 'Calm',     label: 'Calm',     helper: 'Less noise, more ease.' },
  { value: 'Insight',  label: 'Insight',  helper: 'A fresh understanding landed.' },
  { value: 'Other',    label: 'Other',    helper: 'Something else—name it later.' },
];

const SHIFT_TEMPLATE = 'I went from [where you were] to [where you are now]';
const SHIFT_SEED = `Here is what shifted for me: ${SHIFT_TEMPLATE}`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  skipReframe?: boolean;
  isReframeOffer?: boolean;
  isShiftSuggestion?: boolean;
};

export interface ReframeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: string;
  onApply: (result: { transcript: string[]; shift: string; tag: string; reframe: string }) => void;
  onStartOver: () => void;
  onKeepContext?: () => void;
}

export function ReframeModal({
  open,
  onOpenChange,
  challenge,
  onApply,
  onStartOver,
  onKeepContext,
}: ReframeModalProps) {
  const [phase, setPhase] = React.useState<'reframe' | 'shift' | 'tag'>('reframe');
  const [transcript, setTranscript] = React.useState<ChatMessage[]>([]);
  const [shiftBox, setShiftBox] = React.useState('');
  const [tag, setTag] = React.useState(TAG_OPTIONS[0].value);
  const [currentReframe, setCurrentReframe] = React.useState('');

  // Guided shift flow state
  const [shiftAttempts, setShiftAttempts] = React.useState(0);
  const [shiftStep, setShiftStep] = React.useState<'template' | 'askFrom' | 'askTo'>('template');
  const [shiftFrom, setShiftFrom] = React.useState('');

  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const chatRef = React.useRef<InlineChatHandle | null>(null);

  function toFirstPerson(text: string) {
    let t = text;
    t = t.replace(/[""]/g, '"');
    t = t.replace(/\bthe way you\b/gi, 'the way I');
    t = t.replace(/\byou show yourself\b/gi, 'I show myself');
    t = t.replace(/\bshow yourself\b/gi, 'show myself');
    t = t.replace(/\bappreciate you\b/gi, 'appreciate me');
    t = t.replace(/\bknow you\b/gi, 'know me');
    t = t.replace(/\bvalue you\b/gi, 'value me');
    t = t.replace(/\bget to know you\b/gi, 'get to know me');
    t = t.replace(/\byourself\b/gi, 'myself');
    t = t.replace(/\byours\b/gi, 'mine');
    t = t.replace(/\byour\b/gi, 'my');
    t = t.replace(/\byou're\b/gi, "I'm");
    t = t.replace(/\byou are\b/gi, 'I am');
    t = t.replace(/\byou were\b/gi, 'I was');
    t = t.replace(/\byou have\b/gi, 'I have');
    t = t.replace(/\b(to|for|about|with|of|from|at|on|by|like) you\b/gi, (_m, p1) => `${p1} me`);
    // Subject-position "you" at sentence start
    t = t.replace(/(^|[.!?]\s+)you\b/gi, (_m, p1) => `${p1}I`);
    // Subject-position "you" after subordinators and conjunctions (if you, what if you, that you, etc.)
    t = t.replace(/\b(if|that|when|while|because|although|whether|unless|until|once|before|after|where|so|and|but|or)\s+you\b/gi, (_m, p1) => `${p1} I`);
    // Subject-position "you" after comma (", you expanded" → ", I expanded")
    t = t.replace(/,\s+you\b/gi, ', I');
    // Subject-position "you" after colon or semicolon
    t = t.replace(/[;:]\s+you\b/gi, (m) => m.replace(/you/i, 'I'));
    // Remaining "you" → "me" (object position)
    t = t.replace(/\byou\b/gi, 'me');
    t = t.replace(/\bI as I am\b/g, 'me as I am');
    // Fix any "me" that ended up before a verb (should be "I")
    t = t.replace(/\bme\s+(might|could|would|should|shall|will|can|may|did|do|had|has|have|was|were|am|are|is|need|want|think|feel|see|know|believe|recognize|understand|went|go|come|seem|appear|expanded|expand|try|tried|start|began|begin|become|became|find|found|make|made|take|took|get|got|give|gave|keep|kept|let|say|said|tell|told)\b/gi, (_m, verb) => `I ${verb}`);
    return t.replace(/\s+/g, ' ').trim();
  }

  function cleanReframeText(text: string) {
    let t = text.trim();
    // Strip leading colons, dashes, quotes, and whitespace
    t = t.replace(/^[:\-\s]+/, '').replace(/^["'""''`]+\s*/, '').replace(/["'""''`]+$/, '').trim();
    // Ensure it ends with a period (if it doesn't already end with punctuation)
    if (t.length > 0 && !/[.!?]$/.test(t)) {
      t += '.';
    }
    return t;
  }

  function extractReframe(raw: string) {
    // Normalize curly/smart quotes to straight quotes for easier matching
    const normalized = raw
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')   // curly double quotes → "
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");  // curly single quotes → '

    // 1. Try to find quoted reframes (most common AI pattern)
    // Allow periods inside quotes since reframes are full sentences
    const quotedReframePattern = /"([^"]{15,})"/g;
    const quotedMatches = Array.from(normalized.matchAll(quotedReframePattern));

    for (const match of quotedMatches) {
      const quote = match[1].trim();
      // Skip questions or generic filler responses
      if (quote.endsWith('?') ||
          quote.toLowerCase().includes('something else') ||
          quote.toLowerCase().includes('more hopeful') ||
          quote.toLowerCase().includes('more practical')) continue;
      // Accept if it contains first-person language (or will after conversion)
      if (/\b(I'm|I am|I feel|I see|I've|I have|I recognize|I can|I need|I want|you're|you are|you need|you have|you can)\b/i.test(quote)) {
        return cleanReframeText(toFirstPerson(quote)).slice(0, 300);
      }
    }

    // 2. Look for specific reframe introduction patterns
    const reframeIntroPatterns = [
      /(?:here'?s|here is)\s+(?:a\s+)?(?:quick\s+)?reframe[:\s]+"([^"]+)"/i,
      /(?:how about|what about)\s+this(?:\s+as)?(?:\s+a)?\s*(?:fresh\s+)?reframe[:\s]+"([^"]+)"/i,
      /(?:try\s+this|consider\s+this)[:\s]+"([^"]+)"/i,
    ];

    for (const pattern of reframeIntroPatterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        const reframe = match[1].trim();
        if (reframe.length > 10) {
          return cleanReframeText(toFirstPerson(reframe)).slice(0, 300);
        }
      }
    }

    // 3. Pattern-based extraction (no quotes)
    const reframePatterns = [
      /instead of[^,.]*,?\s*(?:you might|try|consider|what if|perhaps)\s*([^.!?]*[.!?])/i,
      /rather than[^,.]*,?\s*(?:you could|try|consider|what if|perhaps)\s*([^.!?]*[.!?])/i,
      /what if (?:you|we)\s*([^.!?]*[.!?])/i,
      /try (?:thinking|seeing|viewing)\s*([^.!?]*[.!?])/i,
      /consider (?:that)?\s*([^.!?]*[.!?])/i,
      /perhaps\s*([^.!?]*[.!?])/i,
      /maybe\s*([^.!?]*[.!?])/i,
      /^I\s+(?:am|feel|see|think|believe|recognize|understand)\s*([^.!?]*[.!?])/i,
    ];

    for (const pattern of reframePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        let reframe = match[1] || match[0];
        if (/^(I|you)\s/i.test(reframe)) {
          reframe = match[0];
        }
        reframe = reframe.replace(/^(?:this\s+)?(?:reframe|this)\s*[:\-]?\s*/i, '').replace(/^["'`]|["'`]$/g, '');
        if (reframe.trim().length > 10) {
          return cleanReframeText(toFirstPerson(reframe.trim())).slice(0, 300);
        }
      }
    }

    // 4. Sentence-level fallback
    const sentences = normalized.split(/[.!?]+/).filter(s => s.trim().length > 20);
    for (const sentence of sentences) {
      if (sentence.includes('?') || sentence.trim().length < 20) continue;

      const reframeIndicators = [
        'instead', 'rather', 'reframe', 'perspective', 'view',
        'opportunity', 'chance', 'possibility', 'potential', 'growth', 'learning'
      ];

      if (reframeIndicators.some(indicator => sentence.toLowerCase().includes(indicator))) {
        const cleaned = sentence.replace(/^(?:this\s+)?(?:reframe|this)\s*[:\-]?\s*/i, '').replace(/^["'`]|["'`]$/g, '');
        if (cleaned.trim().length > 10) {
          return cleanReframeText(toFirstPerson(cleaned.trim())).slice(0, 300);
        }
      }
    }

    return '';
  }

  function cleanShiftPart(text: string) {
    let t = text.trim();
    // Strip leading "I was", "I felt", "I am", "I had", "that I", etc.
    t = t.replace(/^I was\s+/i, '');
    t = t.replace(/^I felt\s+/i, 'feeling ');
    t = t.replace(/^I am\s+/i, '');
    t = t.replace(/^I had\s+/i, 'having ');
    t = t.replace(/^I have\s+/i, 'having ');
    t = t.replace(/^that I\s+/i, '');
    t = t.replace(/^I\s+/i, '');
    return t.trim();
  }

  function extractShiftSuggestion(raw: string) {
    const shiftPatterns = [
      /I went from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
      /from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
      /you went from ([^.!?]*) to ([^.!?]*[.!?]?)/i,
    ];

    for (const pattern of shiftPatterns) {
      const match = raw.match(pattern);
      if (match) {
        const from = cleanShiftPart(match[1]);
        const to = cleanShiftPart(match[2].replace(/[.!?]*$/, ''));
        return `I went from ${from} to ${to}`;
      }
    }

    return '';
  }

  function hasBrackets(text: string) {
    return text.includes('[') && text.includes(']');
  }

  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setShiftBox('');
      setTag(TAG_OPTIONS[0].value);
      setCurrentReframe('');
      setShiftAttempts(0);
      setShiftStep('template');
      setShiftFrom('');
    } else {
      // Initial opening - start with the challenge from props
      setPhase('reframe');
      setTranscript([
        {
          role: 'assistant',
          content: 'Hi! I see you have a challenge. I put a starter prompt in the box below—feel free to edit and hit Send.',
          skipReframe: true
        },
      ]);
      setShiftBox('');
      setCurrentReframe('');
      setShiftAttempts(0);
      setShiftStep('template');
      setShiftFrom('');
    }
  }, [open]);

  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 100);
  }, [transcript]);

  const onChatReply = React.useCallback((msg: string) => {
    // Only process reframes during reframe phase
    if (phase === 'reframe') {
      const potentialReframe = extractReframe(msg);
      const isReframeOffer = potentialReframe.length > 0;

      if (isReframeOffer) {
        setCurrentReframe(potentialReframe);
      }

      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: msg.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim(),
        isReframeOffer
      }]);
    } else if (phase === 'shift') {
      // During shift phase, look for shift suggestions
      const potentialShift = extractShiftSuggestion(msg);
      const isShiftSuggestion = potentialShift.length > 0;

      if (isShiftSuggestion) {
        setShiftBox(potentialShift);
      }

      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: msg.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim(),
        isShiftSuggestion
      }]);
    } else {
      // Default for other phases
      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: msg.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim()
      }]);
    }
  }, [phase]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  // Intercept sends during shift phase for guided flow
  const onBeforeSend = React.useCallback((text: string): boolean => {
    if (phase !== 'shift') return true; // Let reframe phase sends go through to AI

    // Template step: user has the pre-filled template
    if (shiftStep === 'template') {
      if (hasBrackets(text)) {
        // They sent without filling in brackets
        setTranscript(prev => [...prev, { role: 'user', content: text }]);
        const attempts = shiftAttempts + 1;
        setShiftAttempts(attempts);

        if (attempts < 2) {
          // First failed attempt — ask them to fill in the words
          setTimeout(() => {
            setTranscript(prev => [...prev, {
              role: 'assistant',
              content: "Try replacing the words in brackets with your own experience. For example: 'I went from feeling stuck to seeing new possibilities.'",
              skipReframe: true
            }]);
            // Re-fill the input with the template so they can try again
            chatRef.current?.setInput(SHIFT_SEED);
          }, 300);
        } else {
          // Second failed attempt — break it down into two questions
          setShiftStep('askFrom');
          setTimeout(() => {
            setTranscript(prev => [...prev, {
              role: 'assistant',
              content: 'If your framing of the challenge shifted, where did you start?',
              skipReframe: true
            }]);
          }, 300);
        }
        return false; // Cancel AI call
      }

      // They filled it in — extract the shift and populate the box
      const potentialShift = extractShiftSuggestion(text);
      if (potentialShift) {
        setShiftBox(potentialShift);
      } else {
        // They wrote something free-form, use it as the shift
        const cleaned = text.replace(/^here is what shifted for me:\s*/i, '').trim();
        setShiftBox(cleaned || text);
      }
      setTranscript(prev => [...prev, { role: 'user', content: text }]);
      return false; // Don't need AI for this
    }

    // askFrom step: user answers "where did you start?"
    if (shiftStep === 'askFrom') {
      const fromAnswer = cleanShiftPart(text);
      setShiftFrom(fromAnswer);
      setTranscript(prev => [...prev, { role: 'user', content: text }]);
      setShiftStep('askTo');

      setTimeout(() => {
        setTranscript(prev => [...prev, {
          role: 'assistant',
          content: `Got it — you started from "${fromAnswer}". Now, where did you end up?`,
          skipReframe: true
        }]);
      }, 300);
      return false; // Cancel AI call
    }

    // askTo step: user answers "where did you end up?"
    if (shiftStep === 'askTo') {
      const toAnswer = cleanShiftPart(text);
      const fullShift = `I went from ${shiftFrom} to ${toAnswer}`;
      setShiftBox(fullShift);
      setTranscript(prev => [...prev, { role: 'user', content: text }]);

      setTimeout(() => {
        setTranscript(prev => [...prev, {
          role: 'assistant',
          content: `Your shift statement: "${fullShift}"`,
          skipReframe: true
        }]);
      }, 300);
      return false; // Cancel AI call
    }

    return true; // Fallback: let AI handle
  }, [phase, shiftStep, shiftAttempts, shiftFrom]);

  const onNext = () => {
    if (phase === 'reframe' && currentReframe.trim().length > 0) {
      setPhase('shift');
      // Pre-fill shift template in the right-side box
      setShiftBox(SHIFT_TEMPLATE);
      // Reset guided shift state
      setShiftAttempts(0);
      setShiftStep('template');
      setShiftFrom('');
      setTranscript((prev) => [
        ...prev,
        { role: 'assistant', content: "Now let's capture what shifted for you. I've put a template in the box below — replace the words in brackets with your experience.", skipReframe: true },
      ]);
      // Pre-fill the chat input with the shift seed
      setTimeout(() => {
        chatRef.current?.setInput(SHIFT_SEED);
      }, 100);
    } else if (phase === 'shift' && shiftBox.trim().length > 0) {
      setPhase('tag');
    }
  };

  const onBack = () => {
    if (phase === 'tag') setPhase('shift');
    else if (phase === 'shift') setPhase('reframe');
  };

  const onApplyClick = () => {
    if (!shiftBox.trim() || !tag) return;
    const transcriptLines = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => m.content);
    onApply({ transcript: transcriptLines, shift: shiftBox.trim(), tag, reframe: currentReframe.trim() });
    onOpenChange(false);
  };

  const handleStartOverClick = () => {
    if (confirm('Are you sure you want to start over? This will clear everything and start fresh.')) {
      setPhase('reframe');
      setTranscript([
        {
          role: 'assistant',
          content: 'What challenge do you want to tackle today? I\'ll help you reframe it in a more empowering way.',
          skipReframe: true
        },
      ]);
      setShiftBox('');
      setCurrentReframe('');
      setTag(TAG_OPTIONS[0].value);
      setShiftAttempts(0);
      setShiftStep('template');
      setShiftFrom('');
      // Don't close modal, just reset it
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-4 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung1_split.png" alt="Rung 1" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Autoflow Mindful Prompts — Guided Reframe
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleStartOverClick}>Start Over</Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* Left Column: Challenge + Chat */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          <label className="font-medium text-gray-700 mb-1 text-sm">
            Your Challenge
          </label>
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-900 shadow-sm mb-4">
            "{challenge}"
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Bubbles */}
            <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{maxHeight: '400px'}}>
              {transcript.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'max-w-[75%] ml-auto rounded-xl border bg-blue-50 px-3 py-2 text-sm'
                      : 'max-w-[75%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm'
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>

            {/* InlineChat for input only */}
            <InlineChat
              ref={chatRef}
              trainingId="ia-4-2"
              systemPrompt={PROMPTS.IA_4_2}
              seed={`I need a new perspective. Help me reframe my challenge: "${challenge}"`}
              onUserSend={onChatUserSend}
              onReply={onChatReply}
              onBeforeSend={onBeforeSend}
              hideHistory={true}
              className="border-0 p-0 bg-transparent"
              placeholder={phase === 'shift' ? SHIFT_TEMPLATE : undefined}
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase mb-2">YOUR CHALLENGE REFRAMED</h2>
            <div className="min-h-[100px] p-3 border rounded bg-gray-50 text-sm mb-3">
              {currentReframe.trim() ? currentReframe : 'Work with AI to reframe your challenge and it will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={onNext} disabled={!currentReframe.trim()} className="w-full">
                This looks good
              </Button>
            )}
          </section>

          {/* Shift section */}
          {phase !== 'reframe' && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold uppercase mb-2">What shifted for you?</h2>
              <div className={`min-h-[80px] p-3 border rounded bg-gray-50 text-sm mb-3`}>
                {shiftBox.trim() && !hasBrackets(shiftBox) ? shiftBox : ''}
              </div>
              {phase === 'shift' && (
                <>
                  <p className="text-xs italic text-gray-500 mb-3">Edit the template in the message box and hit Send, or tell AI how to adjust your shift statement.</p>
                  <div className="flex gap-2 mb-4">
                    <Button variant="secondary" onClick={onBack} size="sm" className="flex-1">Back to reframe</Button>
                    <Button onClick={onNext} disabled={!shiftBox.trim() || hasBrackets(shiftBox)} size="sm" className="flex-1">Looks good</Button>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Tag section */}
          {phase === 'tag' && (
            <section>
              <h2 className="text-sm font-semibold uppercase mb-2">Tag this shift</h2>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {TAG_OPTIONS.map(({ value, label, helper }) => (
                  <label
                    key={value}
                    className="flex items-start gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="shift-tag"
                      value={value}
                      checked={tag === value}
                      onChange={() => setTag(value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="text-xs text-gray-500">{helper}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onBack} size="sm" className="flex-1">Back</Button>
                <Button onClick={onApplyClick} disabled={!shiftBox.trim() || !tag} size="sm" className="flex-1">
                  I'm done
                </Button>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReframeModal;
