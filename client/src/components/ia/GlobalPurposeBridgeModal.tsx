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
    taskForceIdea: string;
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
  const [phase, setPhase] = React.useState<'reframe' | 'taskforce'>('reframe');

  // ── Display transcript (parent-managed, always visible) ──
  const [transcript, setTranscript] = React.useState<ChatMsg[]>([]);

  // ── Phase 1 output ──
  const [reframedView, setReframedView] = React.useState('');

  // ── Phase 2: Task Force ──
  const [taskForceIdea, setTaskForceIdea] = React.useState('');
  const [taskForceResponded, setTaskForceResponded] = React.useState(false);
  const taskForceUserSentRef = React.useRef(false); // has user sent their idea?

  // ── InlineChat ──
  const chatRef = React.useRef<InlineChatHandle | null>(null);
  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const [chatKey, setChatKey] = React.useState(0);

  // ── System prompts ──
  const reframePrompt = React.useMemo(() => {
    return `${PROMPTS.IA_4_4}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\n\nCURRENT_PHASE: reframe`;
  }, [higherPurpose, globalChallenge]);

  const taskForcePrompt = React.useMemo(() => {
    return `${PROMPTS.IA_4_4_EXPLORE}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\nTheir Bridge: ${reframedView}\n\nCURRENT_PHASE: taskforce`;
  }, [higherPurpose, globalChallenge, reframedView]);

  // ── Reset on close ──
  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setReframedView('');
      setTaskForceIdea('');
      setTaskForceResponded(false);
      taskForceUserSentRef.current = false;
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
        const beforeFeel = msg.match(/^([\s\S]+?)(?:\n\n)?Does this (?:feel like|connection land)/i);
        if (beforeFeel) {
          const sentences = beforeFeel[1].trim().split(/\.\s+/);
          setReframedView(sentences.slice(0, 2).join('. ').trim() + '.');
        }
      }
    }

    if (phase === 'taskforce') {
      // Handle [RETRY] or [FALLBACK] — don't mark as responded
      if (msg.includes('[RETRY]') || msg.includes('[FALLBACK]')) {
        taskForceUserSentRef.current = false;
        return;
      }

      // Extract [IDEA] marker if present
      const ideaMatch = msg.match(/\[IDEA\]\s*([\s\S]*?)\s*\[\/IDEA\]/i);
      if (ideaMatch) {
        setTaskForceIdea(ideaMatch[1].trim());
      }

      // If the user already sent their idea, this AI response means we're done
      if (taskForceUserSentRef.current) {
        setTaskForceResponded(true);
      }
    }
  }, [phase]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);

    if (phase === 'taskforce') {
      taskForceUserSentRef.current = true;
      // Also capture the raw idea in case AI doesn't produce [IDEA] marker
      if (!taskForceIdea) {
        setTaskForceIdea(msg.trim());
      }
    }
  }, [phase, taskForceIdea]);

  // ── Phase transition: reframe → taskforce ──
  const handleTransitionToTaskForce = () => {
    if (reframedView.trim()) {
      setPhase('taskforce');
      taskForceUserSentRef.current = false;
      // Inject transition into transcript
      setTranscript(prev => [...prev, {
        role: 'assistant',
        content: `Good \u2014 that\u2019s your bridge. Now step into it.\n\nYou\u2019ve got a seat on a task force working on ${globalChallenge.toLowerCase()}. What\u2019s one thing you\u2019d want to try, change, or build?`
      }]);
      // Remount InlineChat with taskforce prompt
      setChatKey(prev => prev + 1);
    }
  };

  // ── Complete ──
  const handleComplete = () => {
    onComplete({
      reframedView: reframedView.trim(),
      taskForceIdea: taskForceIdea.trim(),
      transcript: transcript.map(m => `${m.role}: ${m.content}`),
    });
    onOpenChange(false);
  };

  // ── Derive UI state ──
  const isDone = phase === 'taskforce' && taskForceResponded;

  // ── Active system prompt based on phase ──
  const activeSystemPrompt = phase === 'reframe' ? reframePrompt : taskForcePrompt;

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
            Global Purpose Bridge &mdash; AI Partner
          </DialogTitle>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* =========== LEFT COLUMN: Always a conversation =========== */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          {/* Context banner */}
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-3 flex-shrink-0">
            <div title={higherPurpose}><strong>Intention:</strong> {higherPurpose.length > 120 ? `${higherPurpose.slice(0, 120)}...` : higherPurpose}</div>
            <div className="mt-1"><strong>Challenge:</strong> {globalChallenge}</div>
          </div>

          {/* Chat bubbles — always visible, parent-managed */}
          <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{ maxHeight: '460px' }}>
            {transcript.map((m, i) => {
              // Strip protocol tags before display
              const displayContent = m.role === 'assistant'
                ? m.content
                    .replace(/^\s*\[VIEW\]\s*.+$/gim, '')
                    .replace(/\[IDEA\][\s\S]*?\[\/IDEA\]/gi, '')
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

          {/* InlineChat — hidden once task force is done */}
          {!isDone && (
            <InlineChat
              key={chatKey}
              ref={chatRef}
              trainingId="ia-4-4"
              systemPrompt={activeSystemPrompt}
              seed={
                phase === 'reframe'
                  ? `How does my intention connect to ${globalChallenge.toLowerCase()}?`
                  : undefined // No seed in taskforce — the transition message IS the prompt
              }
              onReply={onChatReply}
              onUserSend={onChatUserSend}
              hideHistory={true}
              className="border-0 p-0 bg-transparent flex-shrink-0"
              placeholder={
                phase === 'reframe'
                  ? 'Tell AI how to adjust the angle...'
                  : 'What would you try, change, or build?'
              }
            />
          )}
        </div>

        {/* =========== RIGHT COLUMN: Accumulating artifacts =========== */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto border-l border-gray-200">

          {/* Section 1: Reframed view */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">The bridge</h2>
            <div className={`min-h-[70px] p-3 border rounded text-sm ${
              reframedView.trim() ? 'bg-purple-50/50 border-purple-200 text-gray-900' : 'bg-gray-50 text-gray-400'
            }`}>
              {reframedView.trim() || 'The AI will offer a bridge between your intention and this challenge. It will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={handleTransitionToTaskForce} disabled={!reframedView.trim()} className="w-full mt-3">
                This resonates &mdash; step into this challenge
              </Button>
            )}
          </section>

          {/* Section 2: Task Force Idea — appears after they propose */}
          {phase === 'taskforce' && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your task force idea</h2>
              {taskForceIdea ? (
                <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-sm text-gray-800">
                  {taskForceIdea}
                </div>
              ) : (
                <div className="p-3 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 italic">
                  What would you try, change, or build? Your idea will appear here.
                </div>
              )}
            </section>
          )}

          {/* Method + Done */}
          {phase === 'taskforce' && isDone && (
            <div className="mt-auto pt-4 space-y-4">
              <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-4">
                <h2 className="text-xs font-semibold uppercase text-purple-600 mb-2">The method you just practiced</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Bridge</strong> — find where your intention connects to something bigger.<br/>
                  <strong>Step in</strong> — imagine what you’d actually do at that scale.<br/>
                  <strong>Bring it back</strong> — notice what showed up and apply it to your own world.
                </p>
                <p className="text-xs text-purple-600 mt-3 font-medium">
                  Next, you’ll reflect on what this stretch revealed and bring a capability back to your intention.
                </p>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Save & continue →
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalPurposeBridgeModal;
