import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';

const TAG_OPTIONS = [
  { value: 'Reframe',  label: 'Reframe',  helper: 'I’m holding it differently now.' },
  { value: 'Surprise', label: 'Surprise', helper: 'Something I didn’t expect clicked.' },
  { value: 'Clarity',  label: 'Clarity',  helper: 'It feels simpler or sharper.' },
  { value: 'Curiosity',label: 'Curiosity',helper: 'I want to explore, not conclude.' },
  { value: 'Humor',    label: 'Humor',    helper: 'It lightened; there’s play here.' },
  { value: 'Calm',     label: 'Calm',     helper: 'Less noise, more ease.' },
  { value: 'Insight',  label: 'Insight',  helper: 'A fresh understanding landed.' },
  { value: 'Other',    label: 'Other',    helper: 'Something else—name it later.' },
];

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface ReframeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: string;
  onApply: (result: { transcript: string[]; shift: string; tag: string }) => void;
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

  const latestReframe = React.useMemo(() => {
    for (let i = transcript.length - 1; i >= 0; i--) {
      const msg = transcript[i];
      if (msg.role === 'assistant' && msg.content.trim()) {
        return msg.content.trim();
      }
    }
    return '';
  }, [transcript]);

  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setTranscript([]);
      setShiftBox('');
      setTag(TAG_OPTIONS[0].value);
    }
  }, [open]);

  const onChatReply = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', content: msg }]);
  }, []);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  const onNext = () => {
    if (phase === 'reframe' && latestReframe.trim().length > 0) {
      setPhase('shift');
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
    onApply({ transcript: transcriptLines, shift: shiftBox.trim(), tag });
    onOpenChange(false);
  };

  const handleStartOverClick = () => {
    if (confirm('Are you sure you want to start over? This will clear your challenge and AI chat.')) {
      onStartOver();
      onOpenChange(false);
    }
  };

  const handleKeepContextClick = () => { if (onKeepContext) onKeepContext(); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        // Use inline styles to override the default centered transform so this
        // modal renders closer to the top of the viewport without changing
        // the global dialog implementation.
        style={{ top: '5rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[1080px] w-full grid grid-cols-[1.25fr_0.9fr] gap-6 p-6 max-h-[calc(100vh-6rem)] rounded-lg shadow-lg overflow-hidden min-h-[420px]"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-4">
          <img src="/assets/adv_rung1_split.png" alt="Rung 1" className="h-10 flex-shrink-0" />
          <DialogTitle className="text-base sm:text-lg font-semibold flex-grow">
            Autoflow Mindful Prompts — Guided Reframe
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleStartOverClick}>Start Over</Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* Left Column: Challenge echo + InlineChat */}
        <div className="flex flex-col bg-gray-50 p-4 rounded-lg min-h-0 overflow-auto pt-24 pb-6">
          <label htmlFor="challenge-echo" className="font-medium text-gray-700 mb-1 block select-none">
            Your Challenge
          </label>
          <div
            id="challenge-echo"
            className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-[14px] leading-5 text-gray-900 shadow-sm mb-4 whitespace-pre-wrap"
            aria-live="polite"
          >
            {challenge}
          </div>

          <div id="chat-error" className="hidden text-sm text-red-600 bg-red-50/70 border border-red-200 rounded px-3 py-2 mb-2" />

          <div className="flex flex-col min-h-[520px] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Chat transcript stream (bubbles) */}
            <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50/60" id="chat-stream" aria-live="polite">
              {transcript.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Start by telling AI how you’d like to see this challenge differently.
                </div>
              ) : (
                transcript.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === 'user'
                        ? 'max-w-[75%] ml-auto rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm'
                        : 'max-w-[75%] mr-auto rounded-2xl border border-indigo-100 bg-indigo-50 px-3 py-2 shadow-sm'
                    }
                  >
                    <div className="whitespace-pre-wrap text-[14px] leading-[1.35] text-gray-900">{m.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Chat input powered by InlineChat */}
            <div className="border-t bg-white p-3">
              <InlineChat
                trainingId="ia-4-2"
                systemPrompt={PROMPTS.IA_4_2}
                seed={challenge}
                onUserSend={onChatUserSend}
                onReply={onChatReply}
                onError={(err: any) => {
                  const el = document.getElementById('chat-error');
                  if (el) {
                    el.textContent = err?.message || 'Something went wrong.';
                    el.classList.remove('hidden');
                  }
                }}
                className="w-full"
                hideSystemMessages
              />
            </div>
          </div>
        </div>

        {/* Right Column: Exercise answers (reframe always visible) */}
        <div className="flex flex-col bg-white p-6 rounded-lg border border-gray-200 min-h-0 overflow-auto max-h-[calc(100vh-4rem-96px)] pt-24 pb-6 gap-6">
          {/* Reframe panel stays visible across phases */}
          <section>
            <h2 className="text-sm font-semibold uppercase mb-2">Reframing your challenge</h2>
            <div
              className="min-h-[120px] p-3 border border-gray-300 rounded whitespace-pre-wrap mb-2 bg-gray-50 text-gray-800"
              aria-live="polite"
              aria-atomic="true"
            >
              {latestReframe || '(No reframe yet—work with AI to craft it.)'}
            </div>
            <p className="text-xs italic text-gray-500 mb-2">If it’s not quite right, tell AI what to change.</p>
            {phase === 'reframe' && (
              <Button onClick={onNext} disabled={!latestReframe.trim()} className="w-full">
                Looks right — explore what shifted
              </Button>
            )}
          </section>

          {/* Shift phase */}
          {phase !== 'reframe' && (
            <section aria-hidden={phase !== 'shift'} className={phase === 'shift' ? '' : 'hidden'}>
              <h2 className="text-sm font-semibold uppercase mb-2">What shifted for you?</h2>
              <textarea
                id="shift-textarea"
                value={shiftBox}
                onChange={(e) => setShiftBox(e.target.value)}
                placeholder="e.g., From pressure → experiment"
                rows={6}
                className="w-full resize-y border border-gray-300 rounded p-2 mb-2"
                aria-label="What shifted for you?"
              />
              <p className="text-xs italic text-gray-500 mb-4">You can tweak the wording. AI will keep checking it with you.</p>
              {phase === 'shift' && (
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onBack} className="flex-1">Back to reframe</Button>
                  <Button onClick={onNext} disabled={!shiftBox.trim()} className="flex-1">Looks right — choose a tag</Button>
                </div>
              )}
            </section>
          )}

          {/* Tag phase */}
          {phase === 'tag' && (
            <section>
              <h2 className="text-sm font-semibold uppercase mb-2">Tag this shift</h2>
              <fieldset className="space-y-3 mb-4" aria-label="Tag this shift">
                {TAG_OPTIONS.map(({ value, label, helper }) => (
                  <label
                    key={value}
                    className="grid grid-cols-[26px_1fr] items-start gap-2 cursor-pointer select-none"
                    htmlFor={`tag-${value}`}
                  >
                    <input
                      type="radio"
                      id={`tag-${value}`}
                      name="shift-tag"
                      value={value}
                      checked={tag === value}
                      onChange={() => setTag(value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="text-xs text-gray-500">{helper}</div>
                    </div>
                  </label>
                ))}
              </fieldset>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={onBack} className="flex-1">Back to shift</Button>
                <Button onClick={onApplyClick} disabled={!shiftBox.trim() || !tag} className="flex-1">
                  Apply &amp; Close
                </Button>
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
