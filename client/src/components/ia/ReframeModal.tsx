import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

const TAG_OPTIONS = [
  { value: 'New Angle',    label: 'A new angle',              helper: 'I can see something I couldn\'t see before.' },
  { value: 'Clarity',      label: 'Clarity',                  helper: 'The real problem just got sharper.' },
  { value: 'Agency',       label: 'Agency',                   helper: 'I see where I have leverage now.' },
  { value: 'Better Question', label: 'A question worth following', helper: 'I don\'t have the answer, but I have a better question.' },
];


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
  onApply: (result: { transcript: string[]; shift: string; tag: string; reframe: string; situation: string }) => void;
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
  const [currentSituation, setCurrentSituation] = React.useState('');

  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const chatRef = React.useRef<InlineChatHandle | null>(null);

  function toFirstPerson(text: string) {
    let t = text;
    t = t.replace(/[""]/g, '"');
    t = t.replace(/['']/g, "'");
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

  function extractMarkedSituation(raw: string): string {
    const match = raw.match(/\[SITUATION\]\s*([\s\S]*?)\[\/SITUATION\]/i);
    if (!match) return '';
    const text = match[1].trim();
    if (text.length < 10) return '';
    return text.slice(0, 500);
  }

  function extractMarkedReframe(raw: string): string {
    // Try closed marker first: [REFRAME]...[/REFRAME]
    const closedMatch = raw.match(/\[REFRAME\]\s*([\s\S]*?)\[\/REFRAME\]/i);
    if (closedMatch) {
      const text = closedMatch[1].trim();
      if (text.length >= 10) {
        return cleanReframeText(toFirstPerson(text)).slice(0, 400);
      }
    }
    // Fallback to existing open-ended extraction for backward compatibility
    const markerMatch = raw.match(/\[REFRAME\]\s*([\s\S]+)/i);
    if (!markerMatch) return '';
    const afterMarker = markerMatch[1].trim();
    const sentences = afterMarker.match(/[^.!?]+[.!?]*/g) || [];
    const reframeSentences: string[] = [];
    for (const s of sentences) {
      if (s.trim().endsWith('?')) break;
      if (s.trim().length > 5) reframeSentences.push(s.trim());
      if (reframeSentences.length >= 3) break;
    }
    const reframeText = reframeSentences.join(' ').trim();
    if (reframeText.length < 10) return '';
    return cleanReframeText(toFirstPerson(reframeText)).slice(0, 400);
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
      setCurrentSituation('');
    } else {
      // Initial opening - start with the challenge from props
      setPhase('reframe');
      setTranscript([
        {
          role: 'assistant',
          content: 'Hi! I can see your challenge above. Hit Send to get started, or type your own message.',
          skipReframe: true
        },
      ]);
      setShiftBox('');
      setCurrentReframe('');
      setCurrentSituation('');
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
    // Detect off-topic redirect
    const isRedirect = /^\[REDIRECT\]/i.test(msg.trimStart());

    // Strip all protocol markers from chat display — [REDIRECT], [SITUATION], and [REFRAME] are internal signals only
    // Strip protocol markers AND the reframe/situation text itself from chat display
    // since they are extracted to the right panel — no need to show them twice
    const markedReframeForStrip = extractMarkedReframe(msg);
    let displayContent = msg
      .replace(/^\[REDIRECT\]\s*/i, '')
      .trim();
    // Strip closed markers first (reliable)
    displayContent = displayContent.replace(/\[SITUATION\][\s\S]*?\[\/SITUATION\]\s*/gi, '');
    displayContent = displayContent.replace(/\[REFRAME\][\s\S]*?\[\/REFRAME\]\s*/gi, '');
    // Then strip any remaining open-ended [REFRAME] (backward compat / fallback)
    displayContent = displayContent.replace(/\[REFRAME\]\s*/gi, '');
    // If we extracted a reframe via open-ended match, strip those sentences from the chat bubble
    if (markedReframeForStrip.length > 0 && !msg.match(/\[\/REFRAME\]/i)) {
      const reframeRaw = msg.match(/\[REFRAME\]\s*([\s\S]+)/i);
      if (reframeRaw) {
        const afterMarker = reframeRaw[1].trim();
        const sentences = afterMarker.match(/[^.!?]+[.!?]+/g) || [];
        const questionParts = sentences.filter(s => s.trim().endsWith('?')).map(s => s.trim());
        const beforeMarker = msg.split(/\[REFRAME\]/i)[0]
          .replace(/^\[REDIRECT\]\s*/i, '')
          .replace(/\[SITUATION\][\s\S]*?\[\/SITUATION\]\s*/gi, '')
          .trim();
        displayContent = [beforeMarker, ...questionParts].filter(Boolean).join(' ').trim();
      }
    }

    if (phase === 'reframe') {
      // Only update the reframe/situation boxes when the AI explicitly marks them
      if (!isRedirect) {
        const markedReframe = extractMarkedReframe(msg);
        const markedSituation = extractMarkedSituation(msg);
        if (markedReframe.length > 0) {
          setCurrentReframe(markedReframe);
        }
        if (markedSituation.length > 0) {
          setCurrentSituation(markedSituation);
        }
      }

      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: displayContent.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim(),
        isReframeOffer: !isRedirect && /\[REFRAME\]/i.test(msg),
        skipReframe: isRedirect,
      }]);
    } else if (phase === 'shift') {
      // Only update the shift box for genuine shift suggestions, not redirects
      if (!isRedirect) {
        const potentialShift = extractShiftSuggestion(displayContent);
        if (potentialShift.length > 0) {
          setShiftBox(potentialShift);
        }
      }

      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: displayContent.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim(),
        isShiftSuggestion: !isRedirect && extractShiftSuggestion(displayContent).length > 0,
        skipReframe: isRedirect,
      }]);
    } else {
      setTranscript((prev) => [...prev, {
        role: 'assistant',
        content: displayContent.replace(/\s*Shift\s*[:\-][\s\S]*$/i, '').trim(),
      }]);
    }
  }, [phase]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  // All phases now go through to AI — shift conversation is AI-guided
  const onBeforeSend = React.useCallback((_text: string): boolean => {
    return true;
  }, []);

  const onNext = () => {
    if (phase === 'reframe' && currentReframe.trim().length > 0) {
      setPhase('shift');
      setTranscript((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Nice. Now let\'s name the shift. I\'ll suggest one — hit Send below.',
          skipReframe: true
        },
      ]);
      // Pre-fill the input so the participant can just hit Send to get the AI's shift proposal
      setTimeout(() => {
        chatRef.current?.setInput('Suggest a shift statement for me.');
      }, 200);
    } else if (phase === 'shift' && shiftBox.trim().length > 0 && !hasBrackets(shiftBox)) {
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
    onApply({ transcript: transcriptLines, shift: shiftBox.trim(), tag, reframe: currentReframe.trim(), situation: currentSituation.trim() });
    onOpenChange(false);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-4 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung1_split.png" alt="Rung 1" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Guided Reframe — AI Partner
          </DialogTitle>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
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

            <InlineChat
              ref={chatRef}
              trainingId="ia-4-2"
              systemPrompt={`${PROMPTS.IA_4_2}\n\nCURRENT_PHASE: ${phase}\n\nPARTICIPANT'S CHALLENGE:\n"${challenge}"`}
              seed="I'd like a new perspective on my challenge."
              onUserSend={onChatUserSend}
              onReply={onChatReply}
              onBeforeSend={onBeforeSend}
              hideHistory={true}
              className="border-0 p-0 bg-transparent"
              placeholder={undefined}
            />
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase mb-2 text-gray-500">YOUR SITUATION</h2>
            <div className="min-h-[60px] p-3 border rounded bg-gray-50 text-sm mb-3">
              {currentSituation.trim()
                ? currentSituation
                : 'AI will summarize your situation here after your conversation.'}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase mb-2">YOUR REFRAME</h2>
            <div className="min-h-[80px] p-3 border rounded bg-purple-50 text-sm mb-3 font-medium">
              {currentReframe.trim()
                ? currentReframe
                : 'The perspective shift will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={onNext} disabled={!currentReframe.trim()} className="w-full">
                This looks good
              </Button>
            )}
          </section>

          {/* Shift section */}
          {(phase === 'shift' || phase === 'tag') && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold uppercase mb-2">What shifted for you?</h2>
              <textarea
                className="min-h-[80px] w-full p-3 border rounded bg-gray-50 text-sm mb-3 resize-y"
                value={shiftBox}
                onChange={(e) => setShiftBox(e.target.value)}
                placeholder="Your shift statement will appear here as you talk with AI, or type directly..."
              />
              {phase === 'shift' && (
                <>
                  <p className="text-xs italic text-gray-500 mb-3">Work with AI to name what shifted, or type your shift statement directly in the box above.</p>
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
              <h2 className="text-sm font-semibold uppercase mb-2">What did reframing give you?</h2>
              <div className="grid grid-cols-1 gap-2 mb-3">
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
                <Button
                  onClick={onApplyClick}
                  disabled={!shiftBox.trim() || !tag}
                  size="sm"
                  className="flex-1"
                >
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
