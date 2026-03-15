import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS, buildCrossExerciseContext } from '@/constants/prompts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MuseResult {
  activity: string;
  anchor: string;
  prepCard: string;
  transcript: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface InvitingTheMuseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMuse: { id: string; title: string; response: string } | null;
  chosenActivity: string;
  reframeData: { challenge: string; reframe: string } | null;
  onComplete: (result: MuseResult) => void;
  crossExerciseOutputs?: Parameters<typeof buildCrossExerciseContext>[0];
}

// Backward-compat alias
export type ActionPlanningModalProps = InvitingTheMuseModalProps;

// ─── Marker helpers ────────────────────────────────────────────────────────────

function extractPrepCard(text: string): string | null {
  const match = text.match(/\[PREP\]([\s\S]*?)\[\/PREP\]/i);
  return match ? match[1].trim() : null;
}

function hasReadySignal(text: string): boolean {
  return /\[READY\]/i.test(text);
}

function stripMarkers(text: string): string {
  return text
    .replace(/\[PREP\][\s\S]*?\[\/PREP\]/gi, '')
    .replace(/\[READY\]/gi, '')
    .replace(/^\[REDIRECT\]\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Simple prep card renderer ────────────────────────────────────────────────

function renderPrepCardContent(text: string) {
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
          <span className="text-purple-500 flex-shrink-0">•</span>
          <span>{rendered.map((r) => typeof r === 'string' ? r.replace(/^- /, '') : r)}</span>
        </div>
      );
    }

    return <p key={i} className="text-sm text-gray-700">{rendered}</p>;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvitingTheMuseModal({
  open,
  onOpenChange,
  originalMuse,
  chosenActivity,
  reframeData,
  onComplete,
  crossExerciseOutputs = {},
}: InvitingTheMuseModalProps) {
  const [prepCard, setPrepCard] = React.useState('');
  const [readyToAdvance, setReadyToAdvance] = React.useState(false);
  const [transcript, setTranscript] = React.useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const chatRef = React.useRef<InlineChatHandle>(null);
  const transcriptEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  React.useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Reset all state when modal closes
  React.useEffect(() => {
    if (!open) {
      setPrepCard('');
      setReadyToAdvance(false);
      setTranscript([]);
      kickstartRef.current = null;
      apiMessagesRef.current = [];
    }
  }, [open]);

  // Build system prompt with reframe context
  const fullSystemPrompt = React.useMemo(() => {
    const crossCtx = buildCrossExerciseContext(crossExerciseOutputs);
    const ctx = [
      crossCtx || '',
      reframeData
        ? `REFRAME FROM IA-4-2:\nChallenge: "${reframeData.challenge}"\nReframe: "${reframeData.reframe}"`
        : 'NO REFRAME DATA AVAILABLE',
      '',
      'ORIGINAL MUSE:',
      `Pathway: ${originalMuse?.title ?? ''}`,
      `Their reflection: "${originalMuse?.response ?? ''}"`,
      '',
      `CHOSEN ACTIVITY: ${chosenActivity}`,
    ].filter(Boolean).join('\n').trim();
    return `${PROMPTS.IA_4_5}\n\n${ctx}`;
  }, [originalMuse, chosenActivity, reframeData, crossExerciseOutputs]);

  // Handle AI replies — extract markers, update state
  const handleReply = React.useCallback((rawText: string) => {
    const card = extractPrepCard(rawText);
    const ready = hasReadySignal(rawText);
    const clean = stripMarkers(rawText);

    if (card) setPrepCard(card);
    if (ready) setReadyToAdvance(true);

    if (clean) {
      setTranscript(prev => [...prev, { role: 'assistant', content: clean }]);
    }
  }, []);

  // ── Self-managed API calls ─────────────────────────────────────────────────
  const apiMessagesRef = React.useRef<Array<{ role: string; content: string }>>([]);
  const [isSending, setIsSending] = React.useState(false);

  const sendToAI = React.useCallback(async (userText: string, sysPrompt: string) => {
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
            { role: 'system', content: sysPrompt },
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
        handleReply(data.reply);
      }
    } catch (err) {
      console.error('AI send failed:', err);
    } finally {
      setIsSending(false);
    }
  }, [handleReply]);

  // Intercept InlineChat sends
  const handleBeforeSend = React.useCallback((text: string): boolean => {
    setTranscript(prev => [...prev, { role: 'user', content: text }]);
    sendToAI(text, fullSystemPrompt);
    return false;
  }, [sendToAI, fullSystemPrompt]);

  const noopReply = React.useCallback(() => {}, []);
  const noopUserSend = React.useCallback(() => {}, []);

  // ── Kickstart: auto-fetch AI opening ──────────────────────────────────────
  const kickstartRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (open && chosenActivity && kickstartRef.current !== 'started') {
      kickstartRef.current = 'started';

      const userMsg = reframeData
        ? `I chose "${chosenActivity}". My reframe was: "${reframeData.reframe}". Prepare me.`
        : `I chose "${chosenActivity}". I don't have a reframe — ask what I'm carrying in. Prepare me.`;

      apiMessagesRef.current = [
        ...apiMessagesRef.current,
        { role: 'user', content: userMsg },
      ];

      (async () => {
        setIsSending(true);
        try {
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
            handleReply(data.reply);
          }
        } catch (err) {
          console.error('Kickstart fetch failed:', err);
        } finally {
          setIsSending(false);
        }
      })();
    }
  }, [open, chosenActivity, reframeData, fullSystemPrompt, handleReply]);

  // Extract anchor from transcript
  const extractAnchor = (): string => {
    // If the participant confirmed the reframe (short response or affirmative), use the reframe
    const firstUserMsg = transcript.find(m => m.role === 'user');
    if (!firstUserMsg) {
      return reframeData?.reframe ?? 'Open attention';
    }
    const text = firstUserMsg.content.toLowerCase().trim();
    const isConfirmation = text === 'yes' || text === 'yeah' || text === 'yep' || text === 'sure'
      || text === 'open' || text === 'not sure' || text === 'just open' || text.length < 5;
    if (isConfirmation && reframeData?.reframe) {
      return reframeData.reframe;
    }
    if (isConfirmation) {
      return 'Open attention';
    }
    return firstUserMsg.content;
  };

  // Complete the exercise
  const handleComplete = () => {
    onComplete({
      activity: chosenActivity,
      anchor: extractAnchor(),
      prepCard,
      transcript,
    });
    onOpenChange(false);
  };

  // Start over
  const handleStartOver = () => {
    chatRef.current?.reset();
    kickstartRef.current = null;
    apiMessagesRef.current = [];
    setPrepCard('');
    setReadyToAdvance(false);
    setTranscript([]);
  };

  // ── Right panel ──────────────────────────────────────────────────────────────

  const renderPanel = () => (
    <div className="flex flex-col gap-4 h-full">
      {/* Orientation card */}
      {!prepCard && (
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-3">
          <p className="text-xs text-gray-600 leading-relaxed">
            AI will check your seed, ask a couple of practical questions about this activity,
            then give you a preparation card &mdash; complete with capability coaching and a capture plan.
          </p>
        </div>
      )}

      {/* Your Activity card */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
        <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Your Activity</div>
        <div className="text-sm font-medium text-gray-800">{chosenActivity}</div>
      </div>

      {/* Preparation Card (when extracted) */}
      {prepCard && (
        <div className="rounded-lg border-2 border-purple-300 bg-white p-4 flex-1 overflow-y-auto space-y-1.5">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Your Preparation Card</div>
          {renderPrepCardContent(prepCard)}
        </div>
      )}

      {/* Complete button */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <Button
          onClick={handleComplete}
          disabled={!readyToAdvance}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Complete
        </Button>
      </div>
    </div>
  );

  // ── Chat transcript rendering ─────────────────────────────────────────────

  const renderTranscript = () => (
    <div className="flex-1 overflow-y-auto space-y-3 mb-3">
      {transcript.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-50 text-gray-800'
                : 'bg-white border-l-2 border-purple-400 text-gray-800'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={transcriptEndRef} />
    </div>
  );

  // ── Main render ──────────────────────────────────────────────────────────────

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
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-3 px-4 py-3 z-10">
          <img src="/assets/adv_rung4_split.png" alt="Rung 4" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow text-gray-800">
            Inviting the Muse &mdash; AI Partner
          </DialogTitle>
          <div className="flex items-center gap-2">
            {transcript.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartOver}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Start Over
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* ── Left Column: AI Chat ── */}
        <div
          className="flex flex-col pt-16 min-h-0 border-r border-gray-100"
          style={{ background: '#f5f3ff' }}
        >
          <div className="flex-1 flex flex-col min-h-0 p-4">
            <div className="mb-3 text-xs text-purple-700 font-medium">
              Preparing: {chosenActivity}
            </div>
            {renderTranscript()}
            <div className="flex-shrink-0">
              <InlineChat
                ref={chatRef}
                trainingId="ia-4-5"
                systemPrompt={fullSystemPrompt}
                hideHistory={true}
                onReply={noopReply}
                onUserSend={noopUserSend}
                onBeforeSend={handleBeforeSend}
                className="border-0 p-0 bg-transparent"
                placeholder={
                  isSending
                    ? 'Thinking...'
                    : "Answer the question, or tell AI what you want to carry in..."
                }
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Workspace ── */}
        <div className="flex flex-col bg-white pt-16 min-h-0">
          <div className="flex-1 overflow-y-auto p-4">
            {renderPanel()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Backward-compat default export and named alias
export default InvitingTheMuseModal;
export { InvitingTheMuseModal as ActionPlanningModal };
