import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';
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
type ExploreSubPhase = 'select' | 'prompt1' | 'mirror1' | 'prompt2' | 'mirror2';

export function GlobalPurposeBridgeModal({
  open,
  onOpenChange,
  higherPurpose,
  globalChallenge,
  onComplete,
}: GlobalPurposeBridgeModalProps) {
  // ── Phase ──
  const [phase, setPhase] = React.useState<'reframe' | 'explore'>('reframe');
  const [exploreSubPhase, setExploreSubPhase] = React.useState<ExploreSubPhase>('select');

  // ── Display transcript (parent-managed, always visible) ──
  const [transcript, setTranscript] = React.useState<ChatMsg[]>([]);

  // ── Phase 1 output ──
  const [reframedView, setReframedView] = React.useState('');

  // ── Phase 2: Explore (capability flight simulator) ──
  const [selectedCaps, setSelectedCaps] = React.useState<CapabilityType[]>([]);
  const [imaginePrompt1, setImaginePrompt1] = React.useState('');
  const [imaginePrompt2, setImaginePrompt2] = React.useState('');
  const [response1, setResponse1] = React.useState('');
  const [response2, setResponse2] = React.useState('');
  const [mirror1, setMirror1] = React.useState('');
  const [mirror2, setMirror2] = React.useState('');
  const [aiReflection, setAiReflection] = React.useState('');
  const [exploreLoading, setExploreLoading] = React.useState(false);

  // ── InlineChat ──
  const chatRef = React.useRef<InlineChatHandle | null>(null);
  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const [chatKey, setChatKey] = React.useState(0);

  // ── One-shot API helper (explore phase) ──
  const oneShotCall = React.useCallback(async (systemContent: string, userContent: string): Promise<string> => {
    const res = await fetch('/api/ai/chat/plain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        training_id: 'ia-4-4',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.reply || data.content || '';
  }, []);

  // ── Explore phase: generate contextual "imagine" prompts ──
  const generateImaginePrompts = React.useCallback(async (caps: CapabilityType[]) => {
    const systemContent = `You generate contextual "imagine" prompts for the Imaginal Agility workshop.

CONTEXT:
- Participant's intention: "${higherPurpose}"
- Their bridge into the challenge: "${reframedView}"
- Capabilities they chose to explore: ${caps[0]} and ${caps[1]}

YOUR JOB: Write one "imagine" prompt for each chosen capability. Each prompt must:
1. Start with "Imagine"
2. Be answerable from the participant's OWN imagination and intention — never requiring domain expertise or factual knowledge
3. Be woven from their specific bridge (use details from the reframed view)
4. Be completable in 1-3 sentences
5. Feel like an invitation, not a test
6. Move toward resolution/clarity, not deeper complexity

CAPABILITY PATTERNS (what each prompt should activate):
- Curiosity: Going toward someone else's experience. Understanding what you don't know. "Imagine you get one conversation with..." or "Imagine you could see inside..."
- Caring: Making a choice about who matters first. Prioritizing from empathy. "Imagine you can only help one group first..." or "Imagine one person affected by this..."
- Creativity: Breaking the expected path. Finding the non-obvious approach. "Imagine the obvious solution doesn't exist..." or "Imagine you had to solve this without..."
- Courage: Cutting through complexity to what's essential. Directness. "Imagine you could skip all the complexity and just name..." or "Imagine you have one sentence to say what this actually needs..."

ANTI-PATTERNS (never do these):
- Don't require domain expertise ("what policy would you propose?")
- Don't add cognitive load ("consider the systemic implications of...")
- Don't make it abstract ("what does this challenge mean to you?")
- Don't repeat the same structure for both prompts

Respond with ONLY a JSON object, no markdown, no backticks, no other text:
{"prompt1": "Imagine...", "prompt2": "Imagine..."}`;

    const userContent = `Generate imagine prompts for ${caps[0]} and ${caps[1]}.`;
    const raw = await oneShotCall(systemContent, userContent);

    // Parse JSON - strip any markdown fences
    const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      return { prompt1: parsed.prompt1 || '', prompt2: parsed.prompt2 || '' };
    } catch {
      // Fallback: use the raw text split
      console.warn('[explore] Failed to parse JSON prompts, using fallback');
      return {
        prompt1: `Imagine you could approach this challenge through ${caps[0]}. What would you notice first?`,
        prompt2: `Imagine you could approach this challenge through ${caps[1]}. What would you try?`,
      };
    }
  }, [higherPurpose, reframedView, oneShotCall]);

  // ── Explore phase: mirror a single round ──
  const generateMirror = React.useCallback(async (
    capability: string,
    imaginePrompt: string,
    participantResponse: string,
  ): Promise<string> => {
    const systemContent = `You are a capability coach in the Imaginal Agility workshop — warm, observant, concise.

CONTEXT:
- Participant's intention: "${higherPurpose}"
- Their bridge: "${reframedView}"
- Capability being explored: ${capability}
- The "imagine" prompt they received: "${imaginePrompt}"
- Their response: "${participantResponse}"

YOUR JOB: In 2-3 sentences, mirror what their response reveals about how they use this capability. Don't evaluate or grade. Don't add facts. Name what you see — what they reached for, what they prioritized, what their instinct was. Use their actual words.

Keep it warm and brief. This is recognition, not assessment. No bullet points. No bold text.`;

    return oneShotCall(systemContent, 'Mirror this response.');
  }, [higherPurpose, reframedView, oneShotCall]);

  // ── Explore phase: mirror round 2 + reflection connecting both ──
  const generateMirrorAndReflection = React.useCallback(async (
    cap1: string, prompt1: string, resp1: string, mirrorText1: string,
    cap2: string, prompt2: string, resp2: string,
  ): Promise<{ mirror: string; reflection: string }> => {
    const systemContent = `You are a capability coach in the Imaginal Agility workshop — warm, observant, concise.

CONTEXT:
- Participant's intention: "${higherPurpose}"
- Their bridge: "${reframedView}"
- Round 1: ${cap1} — prompt: "${prompt1}" → response: "${resp1}" → mirror: "${mirrorText1}"
- Round 2: ${cap2} — prompt: "${prompt2}" → response: "${resp2}"

YOUR JOB: Two parts.

PART 1 (2-3 sentences): Mirror what their second response reveals about ${cap2}. Same approach as round 1 — name what you see, use their words.

PART 2: On a new line, write [REFLECTION] followed by 2-3 sentences connecting BOTH rounds. What pattern do you see in how they approach a global challenge? What did exploring through ${cap1} and ${cap2} reveal about how they think? End warm and brief.

The [REFLECTION] tag will be stripped before display. Always include it. No bullet points. No bold text.`;

    const raw = await oneShotCall(systemContent, 'Mirror round 2 and connect both rounds.');

    // Parse [REFLECTION] tag
    const reflMatch = raw.match(/^[#*\s]*\[REFLECTION\]\s*([\s\S]+)$/im);
    if (reflMatch) {
      const beforeRefl = raw.slice(0, raw.search(/^[#*\s]*\[REFLECTION\]/im)).trim();
      return { mirror: beforeRefl, reflection: reflMatch[1].trim() };
    }
    // Fallback: split on double newline
    const parts = raw.trim().split(/\n\n+/);
    if (parts.length >= 2) {
      return { mirror: parts[0], reflection: parts.slice(1).join('\n\n') };
    }
    return { mirror: raw.trim(), reflection: '' };
  }, [higherPurpose, reframedView, oneShotCall]);

  // ── Build system prompt — only used for reframe phase (explore uses one-shot calls) ──
  const systemPrompt = React.useMemo(() => {
    return `${PROMPTS.IA_4_4}\n\nCONTEXT:\nUser's Intention: ${higherPurpose}\nGlobal Challenge: ${globalChallenge}\n\nCURRENT_PHASE: reframe`;
  }, [higherPurpose, globalChallenge]);

  // ── Reset on close ──
  React.useEffect(() => {
    if (!open) {
      setPhase('reframe');
      setExploreSubPhase('select');
      setTranscript([]);
      setReframedView('');
      setSelectedCaps([]);
      setImaginePrompt1('');
      setImaginePrompt2('');
      setResponse1('');
      setResponse2('');
      setMirror1('');
      setMirror2('');
      setAiReflection('');
      setExploreLoading(false);
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

  // ── Chat callbacks (reframe phase only — explore uses one-shot calls) ──
  const onChatReply = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'assistant', content: msg.trim() }]);

    // Extract [VIEW] content for the artifact panel (reframe phase)
    const viewMatch = msg.match(/^[#*\s]*\[VIEW\]\s*(.+)$/im);
    if (viewMatch) {
      setReframedView(viewMatch[1].trim());
    } else {
      const beforeFeel = msg.match(/^([\s\S]+?)(?:\n\n)?Does this feel like/i);
      if (beforeFeel) {
        const sentences = beforeFeel[1].trim().split(/\.\s+/);
        setReframedView(sentences.slice(0, 2).join('. ').trim() + '.');
      }
    }
  }, []);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
  }, []);

  // ── Phase transition: reframe → explore ──
  const onNext = () => {
    if (phase === 'reframe' && reframedView.trim()) {
      setPhase('explore');
      setExploreSubPhase('select');
      // Inject transition message into display transcript
      setTranscript(prev => [...prev, {
        role: 'assistant',
        content: `Good — that's your bridge. Now pick two capabilities to explore how you think about this challenge at scale.`
      }]);
    }
  };

  const onBack = () => {
    if (phase === 'explore' && exploreSubPhase === 'select') {
      setPhase('reframe');
      setExploreSubPhase('select');
      setChatKey(prev => prev + 1);
      // Remove the transition message from transcript
      setTranscript(prev => {
        const copy = [...prev];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === 'assistant') {
            copy.splice(i, 1);
            break;
          }
        }
        return copy;
      });
    }
  };

  // ── Complete ──
  const handleComplete = () => {
    onComplete({
      reframedView: reframedView.trim(),
      question1: `[${selectedCaps[0]}] ${imaginePrompt1}\n\nResponse: ${response1}`,
      question2: `[${selectedCaps[1]}] ${imaginePrompt2}\n\nResponse: ${response2}`,
      observation: `${mirror1}\n\n${mirror2}`,
      aiReflection: aiReflection.trim(),
      transcript: transcript.map(m => `${m.role}: ${m.content}`),
    });
    onOpenChange(false);
  };

  // ── Derive UI state ──
  const canGoBack = phase === 'explore' && exploreSubPhase === 'select';
  const isDone = phase === 'explore' && exploreSubPhase === 'mirror2' && aiReflection.trim().length > 0;

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
            Global Purpose Bridge — AI Partner
          </DialogTitle>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* ═══════════ LEFT COLUMN: Always a conversation ═══════════ */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          {/* Context banner */}
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-xs text-gray-700 shadow-sm mb-3 flex-shrink-0">
            <div><strong>Intention:</strong> {higherPurpose.length > 120 ? `${higherPurpose.slice(0, 120)}...` : higherPurpose}</div>
            <div className="mt-1"><strong>Challenge:</strong> {globalChallenge}</div>
          </div>

          {/* Chat bubbles — always visible, parent-managed */}
          <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3" style={{ maxHeight: '460px' }}>
            {transcript.map((m, i) => {
              // Strip protocol tags before display — users never see them
              const displayContent = m.role === 'assistant'
                ? m.content
                    .replace(/^[#*\s]*\[VIEW\]\s*.+$/gim, '')    // strip [VIEW] line
                    .replace(/^[#*\s]*\[REFLECTION\]\s*/gim, '') // strip [REFLECTION] prefix, keep content
                    .replace(/\n{3,}/g, '\n\n')                  // collapse excess blank lines
                    .trim()
                : m.content;
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

          {/* InlineChat — only visible in reframe phase */}
          {phase === 'reframe' && (
            <InlineChat
              key={chatKey}
              ref={chatRef}
              trainingId="ia-4-4"
              systemPrompt={systemPrompt}
              seed={`Show me what ${globalChallenge.toLowerCase()} looks like through the lens of my intention.`}
              onReply={onChatReply}
              onUserSend={onChatUserSend}
              hideHistory={true}
              className="border-0 p-0 bg-transparent flex-shrink-0"
              placeholder="Tell AI how to adjust the angle..."
            />
          )}

          {/* Explore phase: capability selector + response textareas */}
          {phase === 'explore' && (
            <div className="flex-shrink-0 space-y-3">
              {/* Sub-phase: select capabilities */}
              {exploreSubPhase === 'select' && (
                <div className="bg-white rounded-lg border p-3">
                  <p className="text-sm text-gray-600 mb-3">Pick two capabilities to explore:</p>
                  <CapabilitySelector
                    mode="dual"
                    selected={selectedCaps}
                    onSelect={(val) => setSelectedCaps(val as CapabilityType[])}
                    prompt="Which two capabilities do you want to explore?"
                    exclude={['imagination']}
                  />
                  <Button
                    onClick={async () => {
                      if (selectedCaps.length === 2) {
                        setExploreLoading(true);
                        try {
                          const { prompt1, prompt2 } = await generateImaginePrompts(selectedCaps);
                          setImaginePrompt1(prompt1);
                          setImaginePrompt2(prompt2);
                          setExploreSubPhase('prompt1');
                        } catch (err) {
                          console.error('[explore] Failed to generate prompts:', err);
                          // Fallback prompts so participant isn't stuck
                          setImaginePrompt1(`Imagine you could approach this challenge through ${selectedCaps[0]}. What would you notice first?`);
                          setImaginePrompt2(`Imagine you could approach this challenge through ${selectedCaps[1]}. What would you try?`);
                          setExploreSubPhase('prompt1');
                        } finally {
                          setExploreLoading(false);
                        }
                      }
                    }}
                    disabled={selectedCaps.length !== 2 || exploreLoading}
                    className="w-full mt-3"
                  >
                    {exploreLoading ? 'Generating...' : 'Explore these capabilities'}
                  </Button>
                </div>
              )}

              {/* Sub-phase: prompt1 — respond to first imagine prompt */}
              {exploreSubPhase === 'prompt1' && (
                <div className="bg-white rounded-lg border p-3 space-y-3">
                  <div className="text-sm text-gray-700 bg-purple-50/60 border border-purple-100 rounded p-3">
                    <span className="text-xs font-medium text-purple-600 block mb-1">Imagine · {selectedCaps[0]}</span>
                    {imaginePrompt1}
                  </div>
                  <textarea
                    value={response1}
                    onChange={(e) => setResponse1(e.target.value)}
                    placeholder="Write 1-3 sentences..."
                    className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                    rows={3}
                  />
                  <Button
                    onClick={async () => {
                      if (response1.trim()) {
                        setExploreLoading(true);
                        try {
                          const mirrorText = await generateMirror(selectedCaps[0], imaginePrompt1, response1);
                          setMirror1(mirrorText);
                          setExploreSubPhase('prompt2');
                        } catch (err) {
                          console.error('[explore] Failed to generate mirror1:', err);
                          setMirror1('');
                          setExploreSubPhase('prompt2');
                        } finally {
                          setExploreLoading(false);
                        }
                      }
                    }}
                    disabled={!response1.trim() || exploreLoading}
                    className="w-full"
                  >
                    {exploreLoading ? 'Reflecting...' : 'Submit'}
                  </Button>
                </div>
              )}

              {/* Sub-phase: prompt2 — respond to second imagine prompt */}
              {exploreSubPhase === 'prompt2' && (
                <div className="bg-white rounded-lg border p-3 space-y-3">
                  {/* Show mirror1 feedback */}
                  {mirror1 && (
                    <div className="text-sm text-gray-600 bg-blue-50/60 border border-blue-100 rounded p-3 italic">
                      {mirror1}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 bg-purple-50/60 border border-purple-100 rounded p-3">
                    <span className="text-xs font-medium text-purple-600 block mb-1">Imagine · {selectedCaps[1]}</span>
                    {imaginePrompt2}
                  </div>
                  <textarea
                    value={response2}
                    onChange={(e) => setResponse2(e.target.value)}
                    placeholder="Write 1-3 sentences..."
                    className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                    rows={3}
                  />
                  <Button
                    onClick={async () => {
                      if (response2.trim()) {
                        setExploreLoading(true);
                        try {
                          const { mirror, reflection } = await generateMirrorAndReflection(
                            selectedCaps[0], imaginePrompt1, response1, mirror1,
                            selectedCaps[1], imaginePrompt2, response2,
                          );
                          setMirror2(mirror);
                          setAiReflection(reflection);
                          setExploreSubPhase('mirror2');
                        } catch (err) {
                          console.error('[explore] Failed to generate mirror2 + reflection:', err);
                          setMirror2('');
                          setAiReflection('Something went wrong generating the reflection. You can still save your responses.');
                          setExploreSubPhase('mirror2');
                        } finally {
                          setExploreLoading(false);
                        }
                      }
                    }}
                    disabled={!response2.trim() || exploreLoading}
                    className="w-full"
                  >
                    {exploreLoading ? 'Reflecting...' : 'Submit'}
                  </Button>
                </div>
              )}

              {/* Sub-phase: mirror2 — show final reflection */}
              {exploreSubPhase === 'mirror2' && (
                <div className="bg-white rounded-lg border p-3 space-y-3">
                  {mirror2 && (
                    <div className="text-sm text-gray-600 bg-blue-50/60 border border-blue-100 rounded p-3 italic">
                      {mirror2}
                    </div>
                  )}
                  {aiReflection && (
                    <div className="text-sm text-gray-700 bg-green-50/60 border border-green-200 rounded p-3">
                      <span className="text-xs font-medium text-green-700 block mb-1">What showed up</span>
                      {aiReflection}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════════ RIGHT COLUMN: Accumulating artifacts ═══════════ */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto border-l border-gray-200">

          {/* Section 1: Reframed view (always visible once populated) */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">How you see this challenge</h2>
            <div className={`min-h-[70px] p-3 border rounded text-sm ${
              reframedView.trim() ? 'bg-purple-50/50 border-purple-200 text-gray-900' : 'bg-gray-50 text-gray-400'
            }`}>
              {reframedView.trim() || 'Work with AI to see the challenge through your intention. The bridge will appear here.'}
            </div>
            {phase === 'reframe' && (
              <Button onClick={onNext} disabled={!reframedView.trim()} className="w-full mt-3">
                This resonates — next
              </Button>
            )}
          </section>

          {/* Section 2: Capability exploration (explore phase) */}
          {phase === 'explore' && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Capabilities explored</h2>

              {/* Selected capabilities badges */}
              {selectedCaps.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {selectedCaps.map(cap => (
                    <span key={cap} className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full capitalize">
                      {cap}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {/* Round 1 */}
                {response1 && (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className="text-xs font-medium text-purple-600 block mb-1 capitalize">{selectedCaps[0]}</span>
                    <p className="text-gray-800">{response1}</p>
                    {mirror1 && (
                      <p className="text-gray-500 text-xs mt-2 italic">{mirror1}</p>
                    )}
                  </div>
                )}

                {/* Round 2 */}
                {response2 && (
                  <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className="text-xs font-medium text-purple-600 block mb-1 capitalize">{selectedCaps[1]}</span>
                    <p className="text-gray-800">{response2}</p>
                    {mirror2 && (
                      <p className="text-gray-500 text-xs mt-2 italic">{mirror2}</p>
                    )}
                  </div>
                )}

                {/* Reflection */}
                {aiReflection && (
                  <div className="p-2.5 bg-green-50/60 border border-green-200 rounded-lg text-sm">
                    <span className="text-xs font-medium text-green-700 block mb-1">What showed up</span>
                    <p className="text-gray-700">{aiReflection}</p>
                  </div>
                )}

                {/* Empty state */}
                {!response1 && selectedCaps.length === 0 && (
                  <div className="p-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 italic">
                    Pick two capabilities to begin exploring...
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Navigation / completion */}
          {phase === 'explore' && (
            <div className="mt-auto pt-4">
              {canGoBack && (
                <Button variant="secondary" size="sm" onClick={onBack} className="w-full mb-2">
                  Back to reframe
                </Button>
              )}
              {isDone && (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Save & continue ✓
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
