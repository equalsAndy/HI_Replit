import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

export interface GlobalPurposeBridgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  higherPurpose: string;
  globalChallenge: string;
  onComplete: (results: {
    reframedView: string;
    question1: string;
    question2: string;
    observation: string;
    aiReflection: string;
    transcript: string[];
  }) => void;
}

type ChatMsg = { role: 'user' | 'assistant'; content: string };

export function GlobalPurposeBridgeModal({
  open,
  onOpenChange,
  higherPurpose,
  globalChallenge,
  onComplete,
}: GlobalPurposeBridgeModalProps) {
  // ── Phase ──
  const [phase, setPhase] = React.useState<'reframe' | 'explore'>('reframe');

  // ── Display transcript (parent-managed, always visible) ──
  const [transcript, setTranscript] = React.useState<ChatMsg[]>([]);

  // ── Phase 1 output ──
  const [reframedView, setReframedView] = React.useState('');

  // ── Phase 2: Explore — track participant's questions and observation ──
  const [question1, setQuestion1] = React.useState('');
  const [question2, setQuestion2] = React.useState('');
  const [observation, setObservation] = React.useState('');
  const [aiReflection, setAiReflection] = React.useState('');
  const exploreUserCountRef = React.useRef(0); // counts user messages in explore phase

  // ── InlineChat ──
  const chatRef = React.useRef<InlineChatHandle | null>(null);
  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const [chatKey, setChatKey] = React.useState(0);

  // ── System prompts ──
  const reframePrompt = React.useMemo(() => {
    return `${PROMPTS.IA_4_4}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\n\nCURRENT_PHASE: reframe`;
  }, [higherPurpose, globalChallenge]);

  const explorePrompt = React.useMemo(() => {
    return `${PROMPTS.IA_4_4_EXPLORE}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\nTheir Bridge: ${reframedView}\n\nCURRENT_PHASE: explore`;
  }, [higherPurpose, globalChallenge, reframedView]);

  // ── Reset on close ──
  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setReframedView('');
      setQuestion1('');
      setQuestion2('');
      setObservation('');
      setAiReflection('');
      exploreUserCountRef.current = 0;
      setChatKey(0);
    } else {
      setChatKey(prev => prev + 1);
    }
  }, [open]);

  // ── Auto-scroll chat ──
  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 100);
  }, [transcript]);

  // ── Chat callbacks ──
  const onChatReply = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', content: msg.trim() }]);

    if (phase === 'reframe') {
      // Extract [VIEW] content for artifact panel
      const viewMatch = msg.match(/^\s*\[VIEW\]\s*(.+)$/im);
      if (viewMatch) {
        setReframedView(viewMatch[1].trim());
      } else {
        // Fallback: use first 2 sentences before "Does this feel like"
        const beforeFeel = msg.match(/^([\s\S]+?)(?:\n\n)?Does this feel like/i);
        if (beforeFeel) {
          const sentences = beforeFeel[1].trim().split(/\.\s+/);
          setReframedView(sentences.slice(0, 2).join('. ').trim() + '.');
        }
      }
    }

    if (phase === 'explore') {
      // Handle [RETRY] or [FALLBACK] — roll back the counter
      if (msg.includes('[RETRY]') || msg.includes('[FALLBACK]')) {
        const rollbackTo = exploreUserCountRef.current - 1;
        exploreUserCountRef.current = Math.max(0, rollbackTo);
        if (rollbackTo === 0) setQuestion1('');
        else if (rollbackTo === 1) setQuestion2('');
        return; // Don't process further
      }

      // After user's 3rd message (observation), the next AI response is the capability mirror
      if (exploreUserCountRef.current >= 3) {
        setAiReflection(msg.replace(/^\s*\[REFLECTION\]\s*/im, '').trim());
      }
    }
  }, [phase]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);

    if (phase === 'explore') {
      exploreUserCountRef.current += 1;
      const count = exploreUserCountRef.current;

      if (count === 1) {
        setQuestion1(msg.trim());
      } else if (count === 2) {
        setQuestion2(msg.trim());
      } else if (count === 3) {
        setObservation(msg.trim());
      }
    }
  }, [phase]);

  // ── Phase transition: reframe → explore ──
  const handleTransitionToExplore = () => {
    if (reframedView.trim()) {
      setPhase('explore');
      exploreUserCountRef.current = 0;
      // Inject transition into transcript
      setTranscript(prev => [...prev, {
        role: 'assistant',
        content: `Good \u2014 that's your bridge.\n\nNow I want to be your research partner for a few minutes. I know things about ${globalChallenge.toLowerCase()} that you might not, and you can ask me anything.\n\nAsk two questions about this challenge at a global scale. Follow your curiosity \u2014 whatever you're genuinely wondering about.`
      }]);
      // Remount InlineChat with explore prompt
      setChatKey(prev => prev + 1);
    }
  };

  // ── Complete ──
  const handleComplete = () => {
    onComplete({
      reframedView: reframedView.trim(),
      question1: question1.trim(),
      question2: question2.trim(),
      observation: observation.trim(),
      aiReflection: aiReflection.trim(),
      transcript: transcript.map(m => `${m.role}: ${m.content}`),
    });
    onOpenChange(false);
  };

  // ── Derive UI state ──
  const isDone = phase === 'explore' && aiReflection.trim().length > 0;

  // ── Active system prompt based on phase ──
  const activeSystemPrompt = phase === 'reframe' ? reframePrompt : explorePrompt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-0 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* ── Header ── */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung3_split.png" alt="Rung 3" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Global Purpose Bridge \u2014 AI Partner
          </DialogTitle>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* =========== LEFT COLUMN: Always a conversation =========== */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          {/* Context banner */}
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-3 flex-shrink-0">
            <div><strong>Intention:</strong> {higherPurpose.length > 120 ? `${higherPurpose.slice(0, 120)}...` : higherPurpose}</div>
            <div className="mt-1"><strong>Challenge:</strong> {globalChallenge}</div>
          </div>

          {/* Chat bubbles — always visible, parent-managed */}
          <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{ maxHeight: '460px' }}>
            {transcript.map((m, i) => {
              // Strip protocol tags before display
              const displayContent = m.role === 'assistant'
                ? m.content
                    .replace(/^\s*\[VIEW\]\s*.+$/gim, '')
                    .replace(/^\s*\[REFLECTION\]\s*/gim, '')
                    .replace(/^\s*\[RETRY\]\s*/gim, '')
                    .replace(/^\s*\[FALLBACK\]\s*/gim, '')
                    .replace(/^\s*\[REDIRECT\]\s*/gim, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim()
                : m.content;
              if (!displayContent) return null;
              return (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] ml-auto rounded-xl border bg-purple-50 px-3 py-2 text-sm'
                      : 'max-w-[85%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm text-gray-700'
                  }
                >
                  {displayContent.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < displayContent.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* InlineChat — ALWAYS MOUNTED, prompt changes by phase */}
          <InlineChat
            key={chatKey}
            ref={chatRef}
            trainingId="ia-4-4"
            systemPrompt={activeSystemPrompt}
            seed={
              phase === 'reframe'
                ? `What's the connection between what I care about and ${globalChallenge.toLowerCase()}?`
                : undefined // No seed in explore — the transition message IS the prompt
            }
            onReply={onChatReply}
            onUserSend={onChatUserSend}
            hideHistory={true}
            className="border-0 p-0 bg-transparent flex-shrink-0"
            placeholder={
              phase === 'reframe'
                ? 'Tell AI how to adjust the angle...'
                : exploreUserCountRef.current >= 3
                  ? 'Waiting for AI...'
                  : exploreUserCountRef.current >= 2
                    ? 'Reflect on what drew you to those questions...'
                    : exploreUserCountRef.current >= 1
                      ? 'Ask your second question...'
                      : 'Ask your first question about this challenge...'
            }
          />
        </div>

        {/* =========== RIGHT COLUMN: Accumulating artifacts =========== */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto border-l border-gray-200">

          {/* Section 1: Reframed view */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">How you see this challenge</h2>
            <div className={`min-h-[70px] p-3 border rounded text-sm ${
              reframedView.trim() ? 'bg-purple-50/50 border-purple-200 text-gray-900' : 'bg-gray-50 text-gray-400'
            }`}>
              {reframedView.trim() || 'Work with AI to see the challenge through your intention. The bridge will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={handleTransitionToExplore} disabled={!reframedView.trim()} className="w-full mt-3">
                This resonates \u2014 explore this challenge
              </Button>
            )}
          </section>

          {/* Section 2: Questions — appear as they're asked */}
          {phase === 'explore' && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your questions</h2>
              <div className="space-y-2">
                {question1 ? (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className="text-xs font-medium text-purple-600 mr-1.5">Q1</span>
                    <span className="text-gray-800">{question1}</span>
                  </div>
                ) : (
                  <div className="p-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 italic">
                    Your first question will appear here...
                  </div>
                )}
                {question2 ? (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className="text-xs font-medium text-purple-600 mr-1.5">Q2</span>
                    <span className="text-gray-800">{question2}</span>
                  </div>
                ) : question1 ? (
                  <div className="p-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 italic">
                    Your second question will appear here...
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {/* Section 3: Observation — appears after participant reflects */}
          {phase === 'explore' && observation && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">What you noticed</h2>
              <div className="p-2.5 bg-purple-50/50 border border-purple-200 rounded-lg text-sm text-gray-800">
                {observation}
              </div>
            </section>
          )}

          {/* Section 4: AI capability mirror — appears last */}
          {phase === 'explore' && aiReflection && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">What AI noticed</h2>
              <div className="p-2.5 bg-green-50/60 border border-green-200 rounded-lg text-sm text-gray-700">
                {aiReflection}
              </div>
            </section>
          )}

          {/* Done button */}
          {phase === 'explore' && (
            <div className="mt-auto pt-4">
              {isDone && (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Save & continue \u2192
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalPurposeBridgeModal;
