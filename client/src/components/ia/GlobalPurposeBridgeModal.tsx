import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Send } from 'lucide-react';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

const TAG_OPTIONS = [
  { value: 'A Way In',           label: 'A way in',                  helper: 'I can engage with something bigger than my normal scope.' },
  { value: 'Better Questions',   label: 'Better questions',          helper: 'I found questions I wouldn\'t have thought to ask before.' },
  { value: 'My Capabilities',    label: 'My capabilities at work',   helper: 'I can see which capabilities I reach for when it matters.' },
  { value: 'A Partnership',      label: 'A partnership',             helper: 'I experienced what human intention + AI knowledge can do together.' },
];

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
    tag: string;
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
  // Phase management
  const [phase, setPhase] = React.useState<'reframe' | 'questions' | 'answers' | 'tag'>('reframe');

  // Transcript for AI conversation
  type ChatMessage = { role: 'user' | 'assistant'; content: string; };
  const [transcript, setTranscript] = React.useState<ChatMessage[]>([]);

  // Phase 1: Reframe
  const [reframedView, setReframedView] = React.useState('');

  // Phase 2: Questions
  const [question1, setQuestion1] = React.useState('');
  const [question2, setQuestion2] = React.useState('');

  // Phase 3: Answers
  const [aiAnswer1, setAiAnswer1] = React.useState('');
  const [aiAnswer2, setAiAnswer2] = React.useState('');
  const [answersLoading, setAnswersLoading] = React.useState(false);

  // Phase 3→4: AI Reflection (one-shot)
  const [aiReflection, setAiReflection] = React.useState('');

  // Phase 4: Tag
  const [tag, setTag] = React.useState(TAG_OPTIONS[0].value);

  // InlineChat ref
  const chatRef = React.useRef<InlineChatHandle | null>(null);

  // Chat key for forcing remount
  const [chatKey, setChatKey] = React.useState(0);

  // Reset everything when modal closes
  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setReframedView('');
      setQuestion1('');
      setQuestion2('');
      setAiAnswer1('');
      setAiAnswer2('');
      setAnswersLoading(false);
      setAiReflection('');
      setTag(TAG_OPTIONS[0].value);
      setChatKey(0);
    }
  }, [open]);

  // When modal opens, set initial seed
  React.useEffect(() => {
    if (open && higherPurpose && globalChallenge) {
      setChatKey(prev => prev + 1);
    }
  }, [open, higherPurpose, globalChallenge]);

  // Phase transitions
  const onNext = () => {
    if (phase === 'reframe' && reframedView.trim()) {
      setPhase('questions');
    } else if (phase === 'questions' && question1.trim() && question2.trim()) {
      setPhase('answers');
      fetchAnswers();
    } else if (phase === 'answers' && aiAnswer1 && aiAnswer2) {
      setPhase('tag');
    }
  };

  const onBack = () => {
    if (phase === 'tag') setPhase('answers');
    else if (phase === 'answers') setPhase('questions');
    else if (phase === 'questions') setPhase('reframe');
  };

  // AI Answer Fetcher (Phase 2→3 transition)
  const fetchAnswers = async () => {
    setAnswersLoading(true);
    setAiAnswer1('');
    setAiAnswer2('');
    setAiReflection('');

    try {
      // 1. Fetch answers to both questions
      const answerPrompt = `You are answering two questions from a participant in the Imaginal Agility workshop.

PARTICIPANT'S INTENTION: "${higherPurpose}"
GLOBAL CHALLENGE: ${globalChallenge}
REFRAMED VIEW (how they see this challenge through their intention): "${reframedView}"

QUESTION 1: "${question1}"
QUESTION 2: "${question2}"

RULES:
- Answer each question in ~150 words with real, substantive knowledge
- Cite specific approaches, organizations, research, or frameworks
- Thread their intention through naturally — don't force it
- Be direct, not hedging
- Use this exact format:

**Question 1: ${question1}**

[~150 word answer]

---SPLIT---

**Question 2: ${question2}**

[~150 word answer]`;

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

        // Split on the divider
        const parts = fullAnswer.split('---SPLIT---');
        if (parts.length >= 2) {
          setAiAnswer1(parts[0].trim());
          setAiAnswer2(parts[1].trim());
        } else {
          // Fallback: try to split on "Question 2" header
          const q2Index = fullAnswer.indexOf('**Question 2');
          if (q2Index > 0) {
            setAiAnswer1(fullAnswer.substring(0, q2Index).trim());
            setAiAnswer2(fullAnswer.substring(q2Index).trim());
          } else {
            setAiAnswer1(fullAnswer);
            setAiAnswer2('(Answer could not be split — see above for both answers.)');
          }
        }

        // Add to transcript
        setTranscript(prev => [
          ...prev,
          { role: 'user', content: `Question 1: ${question1}\nQuestion 2: ${question2}` },
          { role: 'assistant', content: fullAnswer },
        ]);

        // 2. Fetch capability reflection
        const reflectPrompt = `You are reflecting on what a participant's questions reveal about their capabilities.

PARTICIPANT'S INTENTION: "${higherPurpose}"
GLOBAL CHALLENGE: ${globalChallenge}
QUESTION 1: "${question1}"
QUESTION 2: "${question2}"

The five capabilities are: imagination, curiosity, caring, creativity, courage.

RULES:
- In 2-3 sentences, name which 2-3 capabilities showed up in their specific questions
- Quote or reference their actual questions
- Don't list all five — only the ones that genuinely appeared
- Don't use generic praise like "Great questions!"
- End with: "What did this exercise give you? The UI will ask you to choose."`;

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
          setTranscript(prev => [
            ...prev,
            { role: 'assistant', content: reflectData.reply.trim() },
          ]);
        }
      }
    } catch (err) {
      console.error('IA-4-4 answer fetch error:', err);
      setAiAnswer1('Something went wrong — please try again.');
    } finally {
      setAnswersLoading(false);
    }
  };

  // Capture reframe from AI response (Phase 1)
  const onChatReply = (text: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', content: text }]);

    // In reframe phase, extract the reframed view
    if (phase === 'reframe') {
      // The reframe is the main paragraph before "Does this feel like YOUR way..."
      const feelMatch = text.match(/^([\s\S]+?)(?:\n\n)?Does this feel like/i);
      if (feelMatch) {
        setReframedView(feelMatch[1].trim());
      } else if (!reframedView.trim()) {
        // Fallback: use the full response minus any question at the end
        const lines = text.split('\n').filter(l => l.trim());
        const nonQuestionLines = lines.filter(l => !l.trim().endsWith('?'));
        if (nonQuestionLines.length > 0) {
          setReframedView(nonQuestionLines.join(' ').trim());
        }
      }
    }
  };

  const onChatUserSend = (text: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: text }]);
  };

  // Handle complete
  const handleComplete = () => {
    onComplete({
      reframedView: reframedView.trim(),
      question1: question1.trim(),
      question2: question2.trim(),
      aiAnswer1,
      aiAnswer2,
      aiReflection,
      tag,
      transcript: transcript.map(m => `${m.role}: ${m.content}`),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-0 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung3_split.png" alt="Rung 3" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Global Purpose Bridge — AI Partner
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {/* Phase indicators */}
            {(['reframe', 'questions', 'answers', 'tag'] as const).map((p, i) => (
              <span key={p} className={`px-2 py-0.5 rounded-full text-xs ${
                phase === p ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-400'
              }`}>
                {i + 1}. {p === 'reframe' ? 'Reframe' : p === 'questions' ? 'Questions' : p === 'answers' ? 'Answers' : 'Tag'}
              </span>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* ═══════════ LEFT COLUMN: AI Side ═══════════ */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0 border-r border-gray-200">
          {/* Context banner */}
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-4">
            <div><strong>Intention:</strong> {higherPurpose.length > 120 ? `${higherPurpose.slice(0, 120)}...` : higherPurpose}</div>
            <div className="mt-1"><strong>Challenge:</strong> {globalChallenge}</div>
          </div>

          {/* Phase 1: InlineChat for reframe conversation */}
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

          {/* Phase 2: Questions prompt (minimal AI, mostly participant) */}
          {phase === 'questions' && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800 leading-relaxed">
                  You're looking at <strong>{globalChallenge.toLowerCase()}</strong> through the lens of your intention.
                </p>
                <p className="text-sm text-gray-800 mt-3 leading-relaxed">
                  If this were actually your challenge to work on — and AI was your research partner — what two questions
                  would you ask to figure out where to start?
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  They don't need to be perfect. Your questions will reveal something about how you think.
                </p>
              </div>

              {reframedView && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-xs font-semibold uppercase text-purple-600 mb-1">Your reframed view</h4>
                  <p className="text-sm text-gray-700 italic">{reframedView}</p>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: AI Answers display */}
          {phase === 'answers' && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {answersLoading ? (
                <div className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
                  <p className="text-sm text-gray-500">Researching your questions...</p>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              ) : (
                <>
                  {aiAnswer1 && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{aiAnswer1}</div>
                    </div>
                  )}
                  {aiAnswer2 && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{aiAnswer2}</div>
                    </div>
                  )}
                  {aiReflection && (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="text-xs font-semibold uppercase text-purple-600 mb-2">What your questions reveal</h4>
                      <p className="text-sm text-gray-800 leading-relaxed">{aiReflection}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Phase 4: Tag selection (AI side shows reflection) */}
          {phase === 'tag' && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {aiReflection && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-xs font-semibold uppercase text-purple-600 mb-2">What your questions reveal</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">{aiReflection}</p>
                </div>
              )}
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Your questions told us something about how you approach big challenges. Now name what this exercise gave you.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT COLUMN: Participant workspace ═══════════ */}
        <div className="flex flex-col bg-white p-4 pt-16 min-h-0">

          {/* Phase 1: Reframed view capture */}
          {phase === 'reframe' && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">How you see this challenge</h3>
              <p className="text-xs text-gray-500 mb-3">
                When the AI shows you a view that resonates, it'll appear here. You can also write your own.
              </p>
              <Textarea
                value={reframedView}
                onChange={(e) => setReframedView(e.target.value)}
                placeholder="The reframed view will appear here from the AI conversation, or write your own..."
                rows={5}
                className="text-sm resize-none flex-1"
              />
              <div className="pt-4 mt-auto flex gap-2">
                <Button
                  onClick={onNext}
                  disabled={!reframedView.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  This resonates — next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase 2: Two questions */}
          {phase === 'questions' && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your two questions</h3>
              <p className="text-xs text-gray-500 mb-3">
                What would you ask AI to figure out where to start?
              </p>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Question 1</label>
                  <Textarea
                    value={question1}
                    onChange={(e) => setQuestion1(e.target.value)}
                    placeholder="Your first question..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Question 2</label>
                  <Textarea
                    value={question2}
                    onChange={(e) => setQuestion2(e.target.value)}
                    placeholder="Your second question..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 mt-auto flex gap-2">
                <Button variant="secondary" size="sm" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={onNext}
                  disabled={!question1.trim() || !question2.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
              </div>
            </div>
          )}

          {/* Phase 3: Review answers */}
          {phase === 'answers' && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your questions</h3>
              <div className="space-y-3 mb-4">
                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                  1. {question1}
                </div>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700">
                  2. {question2}
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs text-gray-500 italic">
                  {answersLoading
                    ? 'AI is researching your questions...'
                    : aiAnswer1
                    ? 'Read the answers on the left. When you\'re ready, continue.'
                    : 'Waiting for answers...'}
                </p>
              </div>

              <div className="pt-4 mt-auto flex gap-2">
                <Button variant="secondary" size="sm" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={onNext}
                  disabled={answersLoading || !aiAnswer1 || !aiAnswer2}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase 4: Tag selection */}
          {phase === 'tag' && (
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">What did this give you?</h3>
              <p className="text-xs text-gray-500 mb-4">
                Pick the one that fits best.
              </p>

              <div className="space-y-2 flex-1">
                {TAG_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      tag === option.value
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="tag44"
                        value={option.value}
                        checked={tag === option.value}
                        onChange={() => setTag(option.value)}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-800">{option.label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{option.helper}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 mt-auto flex gap-2">
                <Button variant="secondary" size="sm" onClick={onBack} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  I'm done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
