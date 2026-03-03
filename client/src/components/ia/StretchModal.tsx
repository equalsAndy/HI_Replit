import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InlineChat, { InlineChatHandle } from '@/components/ia/InlineChat';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { PROMPTS } from '@/constants/prompts';
import { searchUnsplash } from '@/services/api-services';
import { CapabilityType, CAPABILITY_LABELS } from '@/lib/types';
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

type Phase = 'discover' | 'new_image' | 'story' | 'capability' | 'tag';

type SearchGroup = {
  term: string;
  results: any[];
};

export interface StretchResult {
  transcript: string[];
  original_image: string;
  original_title: string;
  new_image: string;
  new_title: string;
  story: string;
  capability: CapabilityType;
  tag: string;
}

export interface StretchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ia33Image: string | null;
  ia33Title: string;
  ia33Reflection: string;
  onApply: (result: StretchResult) => void;
  onStartOver: () => void;
}

function parseSearchSuggestions(messages: ChatMessage[]): string[] {
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  if (!lastAssistant) return [];
  return lastAssistant.content
    .split('\n')
    .filter(line => line.trim().startsWith('SEARCH:'))
    .map(line => line.replace(/^SEARCH:\s*/i, '').trim())
    .filter(term => term.length > 0);
}

function wordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

const PHASE_LABELS: Record<Phase, string> = {
  discover: 'Stretching your visualization',
  new_image: 'Finding your stretch image',
  story: 'What the stretch reveals',
  capability: 'What else showed up',
  tag: 'What stretching gave you',
};

const PHASE_ORDER: Phase[] = ['discover', 'new_image', 'story', 'capability', 'tag'];

export function StretchModal({
  open,
  onOpenChange,
  ia33Image,
  ia33Title,
  ia33Reflection,
  onApply,
  onStartOver,
}: StretchModalProps) {
  const [phase, setPhase] = React.useState<Phase>('discover');
  const [transcript, setTranscript] = React.useState<ChatMessage[]>([]);
  const [userMessageCount, setUserMessageCount] = React.useState(0);

  // New image state
  const [searchGroups, setSearchGroups] = React.useState<SearchGroup[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [customSearch, setCustomSearch] = React.useState('');
  const [selectedNewImage, setSelectedNewImage] = React.useState<string | null>(null);
  const [newTitle, setNewTitle] = React.useState('');
  const [searchPills, setSearchPills] = React.useState<string[]>([]);

  // Story state
  const [story, setStory] = React.useState('');

  // Capability state
  const [capability, setCapability] = React.useState<CapabilityType | null>(null);

  // Tag state
  const [tag, setTag] = React.useState('');

  // UI state
  const [collapsedGroups, setCollapsedGroups] = React.useState<string[]>([]);
  const [swapped, setSwapped] = React.useState(false);

  const chatStreamRef = React.useRef<HTMLDivElement | null>(null);
  const chatRef = React.useRef<InlineChatHandle | null>(null);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setPhase('discover');
      setTranscript([]);
      setUserMessageCount(0);
      setSearchGroups([]);
      setSearchLoading(false);
      setCustomSearch('');
      setSelectedNewImage(null);
      setNewTitle('');
      setSearchPills([]);
      setSearchGenerating(false);
      setCollapsedGroups([]);
      setSwapped(false);
      setStory('');
      setCapability(null);
      setTag('');
      setCompleting(false);
    }
  }, [open]);

  // Auto-scroll chat
  React.useEffect(() => {
    const el = chatStreamRef.current;
    if (!el) return;
    setTimeout(() => { el.scrollTop = el.scrollHeight; }, 100);
  }, [transcript]);

  const runSearches = async (terms: string[]) => {
    setSearchLoading(true);
    const newResults: SearchGroup[] = [];
    for (const term of terms) {
      try {
        const results = await searchUnsplash(term, 4);
        newResults.push({ term, results: results || [] });
      } catch (err) {
        console.error(`Search failed for "${term}":`, err);
        newResults.push({ term, results: [] });
      }
    }
    setSearchGroups(prev => {
      // Avoid duplicating terms already displayed
      const existingTerms = new Set(prev.map(g => g.term));
      const unique = newResults.filter(g => !existingTerms.has(g.term));
      return [...prev, ...unique];
    });
    setSearchLoading(false);
  };

  const runCustomSearch = async () => {
    if (!customSearch.trim()) return;
    setSearchLoading(true);
    try {
      const results = await searchUnsplash(customSearch.trim(), 8);
      setSearchGroups(prev => [...prev, { term: customSearch.trim(), results: results || [] }]);
    } catch (err) {
      console.error('Custom search failed:', err);
    }
    setSearchLoading(false);
    setCustomSearch('');
  };

  const onChatReply = React.useCallback((msg: string) => {
    const displayContent = msg.replace(/^\[REDIRECT\]\s*/i, '').trim();
    setTranscript(prev => [...prev, { role: 'assistant', content: displayContent }]);
  }, []);

  const onChatUserSend = React.useCallback((msg: string) => {
    setTranscript(prev => [...prev, { role: 'user', content: msg }]);
    setUserMessageCount(prev => prev + 1);
  }, []);

  // Generate search terms via one-shot AI call
  const [searchGenerating, setSearchGenerating] = React.useState(false);

  const generateSearchTerms = async (): Promise<string[]> => {
    // Build a conversation summary for the AI
    const convoSummary = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');

    try {
      const resp = await fetch('/api/ai/chat/plain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          training_id: 'ia-4-3',
          messages: [
            { role: 'system', content: `${PROMPTS.IA_4_3}\n\nCURRENT_PHASE: discover` },
            { role: 'user', content: `GENERATE_SEARCHES: The participant's image is titled "${ia33Title}". Their reflection was: "${ia33Reflection}". Here is the conversation so far:\n\n${convoSummary}\n\nBased on this conversation, generate 3 Unsplash search terms for their stretch image. Remember: concrete visual nouns only, 2-4 words each, things a photographer could point a camera at.` },
          ],
        }),
      });

      const data = await resp.json();
      if (data?.success && data?.reply) {
        const terms = data.reply
          .split('\n')
          .filter((line: string) => line.trim().startsWith('SEARCH:'))
          .map((line: string) => line.replace(/^SEARCH:\s*/i, '').trim())
          .filter((t: string) => t.length > 0);
        if (terms.length > 0) return terms;
      }
    } catch (err) {
      console.error('Failed to generate search terms:', err);
    }
    // Minimal fallback — just the title
    return [`${ia33Title} scene`];
  };

  // Phase navigation
  const handleFindSecondImage = async () => {
    setSearchGenerating(true);
    const suggestions = await generateSearchTerms();
    setSearchPills(suggestions);
    setPhase('new_image');
    // Auto-search first suggestion
    if (suggestions.length > 0) {
      runSearches([suggestions[0]]);
    }
    setSearchGenerating(false);
  };

  const handleConfirmNewImage = () => {
    if (selectedNewImage && newTitle.trim()) {
      setPhase('story');
    }
  };

  const handleStoryNext = () => {
    if (wordCount(story) >= 10) {
      setPhase('capability');
    }
  };

  const handleCapabilityNext = () => {
    if (capability) {
      setPhase('tag');
    }
  };

  const [completing, setCompleting] = React.useState(false);

  const handleApply = () => {
    if (!tag || !capability) return;
    setCompleting(true);
    const transcriptLines = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => m.content);
    // Brief visual confirmation before closing
    const firstImg = swapped ? (selectedNewImage || '') : (ia33Image || '');
    const firstTitle = swapped ? newTitle : ia33Title;
    const secondImg = swapped ? (ia33Image || '') : (selectedNewImage || '');
    const secondTitle = swapped ? ia33Title : newTitle;
    setTimeout(() => {
      onApply({
        transcript: transcriptLines,
        original_image: firstImg,
        original_title: firstTitle,
        new_image: secondImg,
        new_title: secondTitle,
        story,
        capability,
        tag,
      });
      setCompleting(false);
      onOpenChange(false);
    }, 800);
  };



  const handleBack = () => {
    if (phase === 'tag') setPhase('capability');
    else if (phase === 'capability') setPhase('story');
    else if (phase === 'story') setPhase('new_image');
    else if (phase === 'new_image') setPhase('discover');
  };

  const capabilityLabel = capability ? CAPABILITY_LABELS[capability] : '';
  const tagLabel = TAG_OPTIONS.find(t => t.value === tag)?.label ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-0 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header — absolute positioned matching ReframeModal */}
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

        {/* ═══ LEFT COLUMN — Process ═══ */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">

          {/* ===== PHASE 1: DISCOVER ===== */}
          {/* Always mounted to preserve InlineChat state; hidden when not active */}
          <div className={`flex flex-col flex-1 min-h-0 ${phase !== 'discover' ? 'hidden' : ''}`}>
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
              {transcript.map((m, i) => {
                // Filter SEARCH: lines from display — they become search pills
                const displayContent = m.role === 'assistant'
                  ? m.content.split('\n').filter(line => !line.trim().startsWith('SEARCH:')).join('\n').trim()
                  : m.content;
                if (!displayContent) return null;
                return (
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
                    {displayContent}
                  </div>
                );
              })}
            </div>

            {/* Pinned bottom: InlineChat + navigation */}
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

              {/* Navigation hint — show when AI produces SEARCH: lines */}
              {parseSearchSuggestions(transcript).length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    Ready to find your stretch image → use the button on the right.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===== PHASE 2: NEW_IMAGE — show conversation read-only ===== */}
          {phase === 'new_image' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Original image reference */}
              <div className="flex items-center gap-3 mb-3 flex-shrink-0">
                {ia33Image && (
                  <img
                    src={ia33Image}
                    alt={ia33Title}
                    className="w-12 h-12 object-cover rounded border border-gray-300"
                  />
                )}
                <p className="text-sm text-gray-600">
                  Stretching beyond &ldquo;{ia33Title}&rdquo; &mdash; find your stretch image on the right
                </p>
              </div>

              {/* Read-only transcript */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white/60 rounded mb-3">
                {transcript.map((m, i) => {
                  const displayContent = m.role === 'assistant'
                    ? m.content.split('\n').filter(line => !line.trim().startsWith('SEARCH:')).join('\n').trim()
                    : m.content;
                  if (!displayContent) return null;
                  return (
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
                      {displayContent}
                    </div>
                  );
                })}
              </div>

              {/* Back to conversation */}
              <div className="pt-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>
                  ← Back to conversation
                </Button>
              </div>
            </div>
          )}

          {/* ===== PHASE 3: STORY ===== */}
          {phase === 'story' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Guidance — images are visible in right column */}
              <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-lg mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  There they are &mdash; your starting point and where you stretched to. Together, they reveal more about your potential than either shows alone.
                </p>
                <p className="text-sm text-gray-700 mt-2 font-medium">
                  What do these two images reveal about your potential when you hold them together?
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  Start with what&apos;s different between them. Then ask: what shows up when I hold both at once?
                </p>
              </div>

              <div className="flex gap-2 mt-auto flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>
              </div>
            </div>
          )}

          {/* ===== PHASE 4: CAPABILITY ===== */}
          {phase === 'capability' && (
            <div className="flex flex-col flex-1 min-h-0">
              <p className="text-sm text-gray-700 mb-4">
                Stretching your visualization is imagination in action &mdash; you just pushed
                past your first picture of yourself. But getting there may have also taken
                something else.
              </p>
              <p className="text-sm font-medium text-gray-800 mb-4">
                What else showed up while you were stretching?
              </p>

              <CapabilitySelector
                mode="single"
                selected={capability}
                onSelect={(val) => setCapability(val as CapabilityType)}
              />

              <div className="flex gap-2 mt-auto pt-4 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>
                <Button
                  onClick={handleCapabilityNext}
                  disabled={!capability}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* ===== PHASE 5: TAG ===== */}
          {phase === 'tag' && (
            <div className="flex flex-col flex-1 min-h-0">
              <h3 className="text-sm font-semibold uppercase text-gray-600 mb-3">What did stretching give you?</h3>
              <div className="grid grid-cols-1 gap-2">
                {TAG_OPTIONS.map(({ value, label, helper }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-all ${
                      tag === value ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="stretch-tag"
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

              <div className="flex gap-2 mt-auto pt-4 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>
                <Button
                  onClick={handleApply}
                  disabled={!tag || completing}
                  size="sm"
                  className={completing ? 'bg-green-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}
                >
                  {completing ? '✓ Done!' : 'Complete Exercise'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ RIGHT COLUMN — Accumulating Results ═══ */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto">

          {/* Context card — always visible */}
          <section className="mb-4">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your Image</h2>
            <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-900 shadow-sm">
              <p className="font-medium text-purple-800 mb-1">&ldquo;{ia33Title}&rdquo;</p>
              {ia33Reflection && (
                <p className="text-xs text-gray-600 italic line-clamp-3">{ia33Reflection}</p>
              )}
            </div>
          </section>

          {/* Right column during discover — button appears after 2+ user messages */}
          {phase === 'discover' && (
            <div className="space-y-3">
              {userMessageCount < 2 ? (
                <p className="text-xs text-gray-400 italic">
                  As you stretch with the AI, your second image search will appear here.
                </p>
              ) : (
                <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-700 mb-3">
                    Ready to find an image for your stretch?
                  </p>
                  <Button
                    onClick={handleFindSecondImage}
                    disabled={searchGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {searchGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Finding search terms...</>
                    ) : (
                      'Find My Stretch Image'
                    )}
                  </Button>
                  <p className="text-[11px] text-gray-500 mt-2">
                    AI will suggest image searches based on your conversation
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ===== IMAGE SEARCH UI — right column during new_image phase ===== */}
          {phase === 'new_image' && (
            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Find Your Stretch Image</h2>

              {/* AI search pills */}
              {searchPills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {searchPills.map((pill, i) => {
                    const alreadySearched = searchGroups.some(g => g.term === pill);
                    return (
                      <span key={i} className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => !alreadySearched && runSearches([pill])}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-full border transition-colors ${
                            alreadySearched
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                              : 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 cursor-pointer'
                          }`}
                        >
                          {alreadySearched ? `✓ ${pill}` : pill}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchPills(prev => prev.filter((_, idx) => idx !== i));
                            setSearchGroups(prev => prev.filter(g => g.term !== pill));
                          }}
                          className={`px-1.5 py-1.5 text-xs rounded-r-full border border-l-0 hover:bg-red-50 hover:text-red-600 transition-colors ${
                            alreadySearched
                              ? 'bg-gray-100 text-gray-400 border-gray-200'
                              : 'bg-purple-100 text-purple-500 border-purple-200'
                          }`}
                          title="Remove this search"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Free search */}
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  placeholder="Or search for something else..."
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); runCustomSearch(); }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={runCustomSearch}
                  disabled={!customSearch.trim() || searchLoading}
                  size="sm"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </div>

              {/* Loading */}
              {searchLoading && searchGroups.length === 0 && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 text-sm">Searching images...</span>
                </div>
              )}

              {/* Search results — collapsible groups */}
              {searchGroups.map((group, gi) => (
                <div key={gi} className="mb-4">
                  <button
                    type="button"
                    onClick={() => setCollapsedGroups(prev =>
                      prev.includes(group.term)
                        ? prev.filter(t => t !== group.term)
                        : [...prev, group.term]
                    )}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase mb-2 hover:text-gray-700 transition-colors w-full text-left"
                  >
                    <span className={`transition-transform ${collapsedGroups.includes(group.term) ? '' : 'rotate-90'}`}>▶</span>
                    &ldquo;{group.term}&rdquo;
                    <span className="text-gray-400 ml-1">({group.results.length})</span>
                  </button>
                  {!collapsedGroups.includes(group.term) && (
                    <div className="grid grid-cols-2 gap-2">
                      {group.results.map((img: any) => {
                        const url = img.urls?.regular || img.urls?.small;
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setSelectedNewImage(url)}
                            className={`border-2 rounded-lg p-0.5 transition-all ${
                              selectedNewImage === url
                                ? 'border-purple-600 ring-2 ring-purple-200'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <img
                              src={img.urls?.small || img.urls?.regular}
                              alt={img.alt_description || 'Image'}
                              className="w-full h-20 object-cover rounded"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Selected image + title input */}
              {selectedNewImage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3 mt-3">
                  <img
                    src={selectedNewImage}
                    alt={newTitle || 'Selected image'}
                    className="w-full h-28 object-cover rounded-lg border border-purple-300"
                  />
                  <label className="block text-xs font-medium text-gray-700">
                    Title this image:
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What does this image represent?"
                    className="w-full"
                  />
                  <Button
                    onClick={handleConfirmNewImage}
                    disabled={!newTitle.trim()}
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Confirm Image
                  </Button>
                </div>
              )}
            </section>
          )}

          {/* Selected new image — confirmed, during story/capability/tag phases */}
          {(phase === 'story' || phase === 'capability' || phase === 'tag') && (
            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Stretch Image</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <img
                  src={selectedNewImage || ''}
                  alt={newTitle || 'Selected image'}
                  className="w-full h-28 object-cover rounded-lg border border-purple-300"
                />
                <p className="text-sm font-semibold text-purple-800 text-center mt-2">&ldquo;{newTitle}&rdquo;</p>
              </div>
            </section>
          )}

          {/* Image pair + story — during story phase and beyond */}
          {(phase === 'story' || phase === 'capability' || phase === 'tag') && (
            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your Pair</h2>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex flex-col items-center">
                  <img
                    src={swapped ? (selectedNewImage || '') : (ia33Image || '')}
                    alt={swapped ? newTitle : ia33Title}
                    className="w-16 h-16 object-cover rounded border border-gray-300"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 truncate max-w-[64px]">{swapped ? newTitle : ia33Title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSwapped(prev => !prev)}
                  className="text-lg text-purple-400 hover:text-purple-600 transition-colors px-1"
                  title="Swap image order"
                >
                  ⇄
                </button>
                <div className="flex flex-col items-center">
                  <img
                    src={swapped ? (ia33Image || '') : (selectedNewImage || '')}
                    alt={swapped ? ia33Title : newTitle}
                    className="w-16 h-16 object-cover rounded border border-purple-300"
                  />
                  <span className="text-[10px] text-purple-600 mt-1 truncate max-w-[64px]">{swapped ? ia33Title : newTitle}</span>
                </div>
              </div>

              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">What The Stretch Reveals</h2>
              <p className="text-xs text-gray-500 mb-2">Tell the story these two images reveal together in a sentence or two.</p>
              <textarea
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg text-sm resize-y bg-white"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Together, these images show..."
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {wordCount(story) < 10
                    ? `${wordCount(story)}/10 words minimum`
                    : `${wordCount(story)} words`}
                </p>
                {phase === 'story' && (
                  <Button
                    onClick={handleStoryNext}
                    disabled={wordCount(story) < 10}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </section>
          )}

          {/* Capability badge — during capability phase and beyond */}
          {(phase === 'capability' || phase === 'tag') && capabilityLabel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-full mb-3 w-fit">
              <span className="text-xs font-semibold uppercase text-gray-500">Capability:</span>
              <span className="text-sm font-medium text-purple-800">{capabilityLabel}</span>
            </div>
          )}

          {/* Tag badge — during tag phase */}
          {phase === 'tag' && tagLabel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-full w-fit">
              <span className="text-xs font-semibold uppercase text-gray-500">Tag:</span>
              <span className="text-sm font-medium text-purple-800">{tagLabel}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StretchModal;
