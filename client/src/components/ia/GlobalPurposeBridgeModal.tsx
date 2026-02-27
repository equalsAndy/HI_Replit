import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
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
    aiAnswer1: string;
    aiAnswer2: string;
    aiReflection: string;
    transcript: string[];
  }) => void;
}

export function GlobalPurposeBridgeModal({
  open,
  onOpenChange,
  higherPurpose,
  globalChallenge,
  onComplete,
}: GlobalPurposeBridgeModalProps) {
  // ── Phase: 'reframe' | 'questions' ──
  const [phase, setPhase] = React.useState<'reframe' | 'questions'>('reframe');

  // Transcript (all AI + user messages for passing to content area)
  type ChatMsg = { role: 'user' | 'assistant'; content: string };
  const [transcript, setTranscript] = React.useState<ChatMsg[]>([]);

  // ── Right column state (accumulates across phases) ──
  // Phase 1 output
  const [reframedView, setReframedView] = React.useState('');
  // Phase 2 inputs
  const [question1, setQuestion1] = React.useState('');
  const [question2, setQuestion2] = React.useState('');
  // Phase 2 AI outputs (displayed on LEFT)
  const [aiAnswer1, setAiAnswer1] = React.useState('');
  const [aiAnswer2, setAiAnswer2] = React.useState('');
  const [aiReflection, setAiReflection] = React.useState('');
  const [answersLoading, setAnswersLoading] = React.useState(false);
  const [answersLoaded, setAnswersLoaded] = React.useState(false);

  // InlineChat
  const chatRef = React.useRef<InlineChatHandle | null>(null);
  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const [chatKey, setChatKey] = React.useState(0);

  // ── Reset on close ──
  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setReframedView('');
      setQuestion1('');
      setQuestion2('');
      setAiAnswer1('');
      setAiAnswer2('');
      setAiReflection('');
      setAnswersLoading(false);
      setAnswersLoaded(false);
      setChatKey(0);
    } else {
      // Fresh open
      setChatKey(prev => prev + 1);
    }
  }, [open]);

  // ── Auto-scroll chat ──
  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 100);
  }, [transcript, aiAnswer1, aiAnswer2, aiReflection]);

  // ── Phase 1: InlineChat callbacks ──
  const onChatReply = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', content: msg }]);

    // Auto-extract reframed view from AI response using [BRIDGE] tag
    if (phase === 'reframe') {
      const bridgeMatch = msg.match(/\[BRIDGE\]\s*([\s\S]+?)(?:\n\n|$)/);
      if (bridgeMatch) {
        // Take the paragraph after [BRIDGE], strip trailing question
        const raw = bridgeMatch[1].trim();
        const cleaned = raw.replace(/Does this feel like[\s\S]*$/i, '').trim();
        setReframedView(cleaned || raw);
      } else {
        // Fallback: look for paragraph before "Does this feel like"
        const feelMatch = msg.match(/^([\s\S]+?)(?:\n\n)?Does this feel like/i);
        if (feelMatch) {
          setReframedView(feelMatch[1].trim());
        } else if (!reframedView.trim()) {
          const lines = msg.split('\n').filter(l => l.trim());
          const nonQ = lines.filter(l => !l.trim().endsWith('?'));
          if (nonQ.length > 0) setReframedView(nonQ.join(' ').trim());
        }
      }
    }
  }, [phase, reframedView]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  // ── Phase transition: reframe → questions ──
  const onNext = () => {
    if (phase === 'reframe' && reframedView.trim()) {
      setPhase('questions');
      // Add transition message to transcript (shows on LEFT)
      setTranscript(prev => [...prev, {
        role: 'assistant',
        content: `You're looking at ${globalChallenge.toLowerCase()} through the lens of your intention.\n\nIf this were actually your challenge to work on — and AI was your research partner — what two questions would you ask to figure out where to start?\n\nWrite them on the right. They don't need to be perfect.`
      }]);
    }
  };

  const onBack = () => {
    if (phase === 'questions' && !answersLoaded) {
      setPhase('reframe');
    }
  };

  // ── Phase 2: Fetch AI answers (one-shot) ──
  const fetchAnswers = async () => {
    if (!question1.trim() || !question2.trim()) return;
    setAnswersLoading(true);

    try {
      // 1. Answer both questions
      const answerPrompt = `You are answering two questions from a participant in the Imaginal Agility workshop.

PARTICIPANT'S INTENTION: "${higherPurpose}"
GLOBAL CHALLENGE: ${globalChallenge}
REFRAMED VIEW: "${reframedView}"

QUESTION 1: "${question1}"
QUESTION 2: "${question2}"

RULES:
- Answer each question in ~150 words with real, substantive knowledge
- Cite specific approaches, organizations, research, or frameworks where relevant
- Thread their intention through naturally — don't force it
- Be direct, not hedging
- Use this exact format with the divider:

**Question 1: ${question1}**

[~150 word answer]

---SPLIT---

**Question 2: ${question2}**

[~150 word answer]

End with: "Look at the two questions you asked. We'll come back to what they tell you about how you think."`;

      const answerResp = await fetch('/api/ai/chat/plain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          training_id: 'ia-4-4',
          messages: [
            { role: 'system', content: answerPrompt },
            { role: 'user', content: `Answer my two questions about ${globalChallenge}.` },
          ],
        }),
      });

      const answerData = await answerResp.json();
      if (answerData?.success && answerData.reply) {
        const fullAnswer = answerData.reply.trim();

        // Split answers
        const parts = fullAnswer.split('---SPLIT---');
        if (parts.length >= 2) {
          setAiAnswer1(parts[0].trim());
          setAiAnswer2(parts[1].trim());
        } else {
          // Fallback: split on "Question 2" header
          const q2Idx = fullAnswer.indexOf('**Question 2');
          if (q2Idx > 0) {
            setAiAnswer1(fullAnswer.substring(0, q2Idx).trim());
            setAiAnswer2(fullAnswer.substring(q2Idx).trim());
          } else {
            setAiAnswer1(fullAnswer);
            setAiAnswer2('');
          }
        }

        // Add to transcript
        setTranscript(prev => [
          ...prev,
          { role: 'user', content: `Question 1: ${question1}\nQuestion 2: ${question2}` },
          { role: 'assistant', content: fullAnswer },
        ]);

        // 2. Fetch capability reflection (brief delay so participant can read answers)
        await new Promise(resolve => setTimeout(resolve, 2500));
        const reflectPrompt = `You are reflecting on what a participant's questions reveal about their capabilities.

PARTICIPANT'S INTENTION: "${higherPurpose}"
GLOBAL CHALLENGE: ${globalChallenge}
QUESTION 1: "${question1}"
QUESTION 2: "${question2}"

The five capabilities are: imagination, curiosity, caring, creativity, courage.

RULES:
- In 2-3 sentences, name which 2-3 capabilities showed up in their specific questions
- Quote or reference their actual questions — be specific
- Don't list all five — only the ones that genuinely appeared
- Don't use generic praise
- End with: "What did this exercise give you? Choose below when you're ready."`;

        const reflectResp = await fetch('/api/ai/chat/plain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            training_id: 'ia-4-4',
            messages: [
              { role: 'system', content: reflectPrompt },
              { role: 'user', content: 'What do my questions reveal about my capabilities?' },
            ],
          }),
        });

        const reflectData = await reflectResp.json();
        if (reflectData?.success && reflectData.reply) {
          setAiReflection(reflectData.reply.trim());
          setTranscript(prev => [...prev, { role: 'assistant', content: reflectData.reply.trim() }]);
        }

        setAnswersLoaded(true);
      }
    } catch (err) {
      console.error('IA-4-4 answer fetch error:', err);
      setAiAnswer1('Something went wrong — please try again.');
    } finally {
      setAnswersLoading(false);
    }
  };

  // ── Complete ──
  const handleComplete = () => {
    onComplete({
      reframedView: reframedView.trim(),
      question1: question1.trim(),
      question2: question2.trim(),
      aiAnswer1,
      aiAnswer2,
      aiReflection,
      transcript: transcript.map(m => `${m.role}: ${m.content}`),
    });
    onOpenChange(false);
  };

  // ── Start Over ──
  const handleStartOver = () => {
    if (confirm('Start over? This will clear everything.')) {
      setPhase('reframe');
      setTranscript([]);
      setReframedView('');
      setQuestion1('');
      setQuestion2('');
      setAiAnswer1('');
      setAiAnswer2('');
      setAiReflection('');
      setAnswersLoading(false);
      setAnswersLoaded(false);
      setChatKey(prev => prev + 1);
      setTimeout(() => {
        chatRef.current?.setInput(`Show me what ${globalChallenge.toLowerCase()} looks like through the lens of my intention.`);
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-4 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* ── Header ── */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung3_split.png" alt="Rung 3" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Global Purpose Bridge — AI Partner
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleStartOver}>Start Over</Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* ═══════════ LEFT COLUMN: Always AI ═══════════ */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          {/* Context banner */}
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-4">
            <div><strong>Intention:</strong> {higherPurpose.length > 120 ? `${higherPurpose.slice(0, 120)}...` : higherPurpose}</div>
            <div className="mt-1"><strong>Challenge:</strong> {globalChallenge}</div>
          </div>

          {/* Phase 1: Live AI conversation */}
          {phase === 'reframe' && (
            <div className="flex-1 flex flex-col min-h-0">
              <InlineChat
                key={chatKey}
                ref={chatRef}
                trainingId="ia-4-4"
                systemPrompt={`${PROMPTS.IA_4_4}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\n\nCURRENT_PHASE: reframe`}
                seed={`Show me what ${globalChallenge.toLowerCase()} looks like through the lens of my intention.`}
                onReply={onChatReply}
                onUserSend={onChatUserSend}
                hideHistory={true}
                className="border-0 p-0 bg-transparent flex-1"
                placeholder="Tell AI how to adjust the angle..."
              />
            </div>
          )}

          {/* Phase 2: Chat history (read-only) + AI answers + reflection */}
          {phase === 'questions' && (
            <div ref={chatStreamRef} className="flex-1 overflow-y-auto space-y-3">
              {/* Show the reframe conversation as read-only context */}
              {transcript.filter(m => m.role === 'assistant').slice(-1).map((m, i) => (
                <div key={`ctx-${i}`} className="max-w-[90%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm text-gray-700">
                  {m.content}
                </div>
              ))}

              {/* AI answers (appear after fetch) */}
              {answersLoading && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
                  <p className="text-sm text-gray-500">Researching your questions...</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              )}

              {aiAnswer1 && !answersLoading && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{aiAnswer1}</div>
                </div>
              )}
              {aiAnswer2 && !answersLoading && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{aiAnswer2}</div>
                </div>
              )}
              {aiReflection && !answersLoading && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-xs font-semibold uppercase text-purple-600 mb-2">What your questions reveal</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">{aiReflection}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT COLUMN: Participant workspace (accumulates) ═══════════ */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">

          {/* Section 1: Reframed view (always visible once populated) */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase mb-2">How you see this challenge</h2>
            <div className={`min-h-[80px] p-3 border rounded text-sm mb-3 ${
              reframedView.trim() ? 'bg-gray-50 text-gray-900' : 'bg-gray-50 text-gray-400'
            }`}>
              {reframedView.trim() || 'Work with AI to see the challenge through your intention. The reframed view will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={onNext} disabled={!reframedView.trim()} className="w-full">
                This resonates — next
              </Button>
            )}
          </section>

          {/* Section 2: Questions (appears in phase 2, accumulates below reframe) */}
          {phase === 'questions' && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold uppercase mb-2">Your two questions</h2>
              <p className="text-xs text-gray-500 mb-3">
                What would you ask AI to figure out where to start on this challenge?
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Question 1</label>
                  <Textarea
                    value={question1}
                    onChange={(e) => setQuestion1(e.target.value)}
                    placeholder="Your first question..."
                    rows={2}
                    className="text-sm resize-none"
                    disabled={answersLoaded}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Question 2</label>
                  <Textarea
                    value={question2}
                    onChange={(e) => setQuestion2(e.target.value)}
                    placeholder="Your second question..."
                    rows={2}
                    className="text-sm resize-none"
                    disabled={answersLoaded}
                  />
                </div>
              </div>

              {/* Buttons: Ask AI → then I'm done */}
              <div className="flex gap-2">
                {!answersLoaded && (
                  <Button variant="secondary" size="sm" onClick={onBack} className="flex-1">
                    Back
                  </Button>
                )}
                {!answersLoaded ? (
                  <Button
                    onClick={fetchAnswers}
                    disabled={!question1.trim() || !question2.trim() || answersLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {answersLoading ? (
                      'Researching...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    I'm done
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GlobalPurposeBridgeModal;
