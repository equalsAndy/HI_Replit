import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';
import { Loader2 } from 'lucide-react';

export const TAG_OPTIONS = [
  { value: 'fuller-picture', label: 'A fuller picture', helper: "I can see more of my potential now" },
  { value: 'stretch-claiming', label: 'A stretch I\'m claiming', helper: "I'm ready to stand in new territory" },
  { value: 'an-edge', label: 'An edge I found', helper: "I know where my comfort zone ends" },
  { value: 'energy', label: 'Energy', helper: "Something about this pairing lit up" },
];

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Phase = 'discover' | 'generate';

export interface StretchResult {
  transcript: string[];
  original_image: string;
  original_title: string;
  new_image_url: string;
  new_image_photo_id: number;
  new_title: string;
}

export interface StretchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ia33Image: string | null;
  ia33Title: string;
  ia33Reflection: string;
  ia33ImageDescription?: string;
  onApply: (result: StretchResult) => void;
  onStartOver: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  discover: 'Stretching your visualization',
  generate: 'Creating your stretch image',
};

const PHASE_ORDER: Phase[] = ['discover', 'generate'];

export function StretchModal({
  open,
  onOpenChange,
  ia33Image,
  ia33Title,
  ia33Reflection,
  ia33ImageDescription,
  onApply,
  onStartOver,
}: StretchModalProps) {
  const [phase, setPhase] = React.useState<Phase>('discover');
  const [transcript, setTranscript] = React.useState<ChatMessage[]>([]);
  const [userMessageCount, setUserMessageCount] = React.useState(0);

  // [READY] signal from AI
  const [conversationReady, setConversationReady] = React.useState(false);
  const [assistantMessageCount, setAssistantMessageCount] = React.useState(0);
  const [showButtons, setShowButtons] = React.useState(false);

  // Generate phase state
  const [generating, setGenerating] = React.useState(false);
  const [generatedPhotoId, setGeneratedPhotoId] = React.useState<number | null>(null);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = React.useState<string | null>(null);
  const [suggestedTitle, setSuggestedTitle] = React.useState('');
  const [newTitle, setNewTitle] = React.useState('');
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [hasRetried, setHasRetried] = React.useState(false);

  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const chatRef = React.useRef<InlineChatHandle | null>(null);



  // Reset on open
  React.useEffect(() => {
    if (open) {
      setPhase('discover');
      setTranscript([]);
      setUserMessageCount(0);
      setConversationReady(false);
      setAssistantMessageCount(0);
      setShowButtons(false);
      setGenerating(false);
      setGeneratedPhotoId(null);
      setGeneratedPhotoUrl(null);
      setSuggestedTitle('');
      setNewTitle('');
      setGenerateError(null);
      setHasRetried(false);
    }
  }, [open]);

  // Auto-scroll chat
  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 100);
  }, [transcript]);

  const onChatReply = React.useCallback((msg: string) => {
    if (msg.includes('[READY]')) {
      setConversationReady(true);
      setShowButtons(true);
    }
    const displayContent = msg.replace(/^\[REDIRECT\]\s*/i, '').replace(/\[READY\]/g, '').trim();
    setTranscript(prev => [...prev, { role: 'assistant', content: displayContent }]);
    setAssistantMessageCount(prev => {
      const next = prev + 1;
      if (next >= 2 && !showButtons) {
        setTimeout(() => setShowButtons(true), 2000);
      }
      return next;
    });
  }, [showButtons]);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
    setUserMessageCount(prev => prev + 1);
  }, []);

  // Build transcript summary for backend
  const buildTranscriptSummary = () => {
    return transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
  };

  // Generate stretch image via DALL-E
  const handleGenerateStretch = async (adjustment?: string) => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const resp = await fetch('/api/ai/image/stretch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          original_title: ia33Title,
          original_reflection: ia33Reflection,
          image_description: ia33ImageDescription || '',
          transcript_summary: buildTranscriptSummary(),
          ...(adjustment ? { adjustment } : {}),
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to generate image');
      }
      setGeneratedPhotoId(data.photo_id ?? null);
      setGeneratedPhotoUrl(data.photo_url || data.fallback_base64 || null);
      setSuggestedTitle(data.suggested_title || '');
      setNewTitle(data.suggested_title || '');
      setPhase('generate');
    } catch (err: any) {
      console.error('Stretch image generation failed:', err);
      setGenerateError(err?.message || 'Something went wrong generating your image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Confirm image and close modal — story now lives on content area
  const handleConfirmImage = () => {
    if (!generatedPhotoUrl || !newTitle.trim()) return;
    const transcriptLines = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => m.content);

    onApply({
      transcript: transcriptLines,
      original_image: ia33Image || '',
      original_title: ia33Title,
      new_image_url: generatedPhotoUrl,
      new_image_photo_id: generatedPhotoId!,
      new_title: newTitle,
    });
    onOpenChange(false);
  };

  const handleBack = () => {
    if (phase === 'generate') setPhase('discover');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-0 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 p-3 z-10">
          <img src="/assets/adv_rung2_split.png" alt="Rung 2" className="h-8 flex-shrink-0" />
          <div className="flex-grow">
            <DialogTitle className="text-base font-semibold">
              Visualization Stretch
            </DialogTitle>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{PHASE_LABELS[phase]}</p>
              <div className="flex gap-1 ml-2">
                {PHASE_ORDER.map((p, i) => (
                  <div
                    key={p}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i <= PHASE_ORDER.indexOf(phase)
                        ? 'bg-purple-600'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* LEFT COLUMN -- Process */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">

          {/* PHASE 1: DISCOVER */}
          <div className={`stretch-discover-panel flex flex-col flex-1 min-h-0 ${phase !== 'discover' ? 'hidden' : ''}`}>
            {/* ia-3-3 image compact */}
            {ia33Image && (
              <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                <img
                  src={ia33Image}
                  alt={ia33Title}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-purple-300"
                />
                <p className="text-sm font-semibold text-purple-800">&ldquo;{ia33Title}&rdquo;</p>
              </div>
            )}

            {/* Chat bubbles */}
            <div
              ref={chatStreamRef}
              className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3"
            >
              {transcript.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'max-w-[75%] ml-auto rounded-xl border bg-blue-50 px-3 py-2 text-sm'
                      : 'max-w-[75%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm'
                  }
                >
                  {m.role === 'assistant' && (
                    <span className="text-[10px] font-medium text-purple-500 block mb-1">AI</span>
                  )}
                  {m.content}
                </div>
              ))}
            </div>

            {/* Pinned bottom: InlineChat */}
            <div className="mt-auto flex-shrink-0 space-y-2">
              <InlineChat
                ref={chatRef}
                trainingId="ia-4-3"
                systemPrompt={`${PROMPTS.IA_4_3}\n\nCURRENT_PHASE: discover`}
                seed={`My image is titled "${ia33Title}". My reflection was: "${ia33Reflection.split(' ').slice(0, 30).join(' ')}${ia33Reflection.split(' ').length > 30 ? '...' : ''}"`}
                onUserSend={onChatUserSend}
                onReply={onChatReply}
                hideHistory
                className="border-0 p-0 bg-transparent"
              />
            </div>
          </div>

          {/* PHASE 2: GENERATE -- show read-only transcript */}
          {phase === 'generate' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                {ia33Image && (
                  <img
                    src={ia33Image}
                    alt={ia33Title}
                    className="w-12 h-12 object-cover rounded border border-gray-300"
                  />
                )}
                <p className="text-sm text-gray-600">
                  Your AI-generated stretch image is on the right
                </p>
              </div>

              {/* Read-only transcript */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3">
                {transcript.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === 'user'
                        ? 'max-w-[75%] ml-auto rounded-xl border bg-blue-50 px-3 py-2 text-sm'
                        : 'max-w-[75%] mr-auto rounded-xl border bg-white px-3 py-2 text-sm'
                    }
                  >
                    {m.role === 'assistant' && (
                      <span className="text-[10px] font-medium text-purple-500 block mb-1">AI</span>
                    )}
                    {m.content}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>
                  &larr; Back to conversation
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN -- Accumulating Results */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">

          {/* Context card -- always visible */}
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your Image</h2>
            <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-900 shadow-sm">
              <p className="font-medium text-purple-800 mb-1">&ldquo;{ia33Title}&rdquo;</p>
              {ia33Reflection && (
                <p className="text-xs text-gray-600 italic line-clamp-3">{ia33Reflection}</p>
              )}
            </div>
          </section>

          {/* DISCOVER phase right column -- generate / keep stretching buttons */}
          {phase === 'discover' && (
            <div className="space-y-3">
              {!showButtons ? (
                <p className="text-xs text-gray-400 italic">
                  As you talk with the AI, your words become the ingredients for a generated image.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {hasRetried
                      ? 'Add more detail to your conversation, then generate your final image.'
                      : 'Your reflection and this conversation feed the image. The more specific you are about what your stretch looks like, the more it will feel like yours.'
                    }
                  </p>

                  <Button
                    onClick={() => handleGenerateStretch()}
                    disabled={generating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {generating ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating your image...</>
                    ) : (
                      'Generate My Image'
                    )}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    {hasRetried
                      ? 'This is your last image generation.'
                      : 'You have 2 image generations for this exercise.'
                    }
                  </p>
                  {generateError && (
                    <p className="text-xs text-red-600 mt-2">{generateError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GENERATE phase right column -- show generated image */}
          {phase === 'generate' && (
            <section className="mb-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold uppercase text-gray-500">Your Stretch Image</h2>
                <span className="text-xs text-gray-400 font-medium">
                  {hasRetried ? 'Image 2 of 2' : 'Image 1 of 2'}
                </span>
              </div>

              {generating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
                  <p className="text-sm text-gray-600">Creating your stretch image...</p>
                  <p className="text-xs text-gray-400 mt-1">This takes 10-15 seconds</p>
                </div>
              ) : generatedPhotoUrl ? (
                <div className="space-y-3">
                  <img
                    src={generatedPhotoUrl}
                    alt={newTitle || suggestedTitle || 'Stretch image'}
                    className="w-full rounded-lg border-2 border-purple-300 shadow-sm"
                  />

                  {/* Title input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Title this image:
                    </label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="One word that captures this stretch"
                      className="w-full"
                    />
                  </div>

                  {/* Confirm / Adjust */}
                  <div className="space-y-2">
                    <Button
                      onClick={handleConfirmImage}
                      disabled={!newTitle.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      This captures my stretch
                    </Button>

                    {hasRetried && (
                      <p className="text-xs text-gray-400 text-center italic">
                        Both generations used &mdash; title it and continue.
                      </p>
                    )}

                    {!hasRetried && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setHasRetried(true);
                          setPhase('discover');
                        }}
                        className="w-full"
                      >
                        Not quite &mdash; back to conversation
                      </Button>
                    )}
                  </div>

                </div>
              ) : generateError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{generateError}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerateStretch()}
                    disabled={generating}
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              ) : null}
            </section>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StretchModal;
