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
  { value: 'missing-piece', label: 'A missing piece', helper: "I found something I wasn't representing" },
  { value: 'an-edge', label: 'An edge', helper: "I found where my comfort zone ends" },
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
  discover: 'Exploring your image',
  new_image: 'Finding a second image',
  story: 'Writing your story',
  capability: 'Capability',
  tag: 'Tag',
};

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
      setStory('');
      setCapability(null);
      setTag('');
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
    const allResults: SearchGroup[] = [];
    for (const term of terms) {
      try {
        const results = await searchUnsplash(term, 4);
        allResults.push({ term, results: results || [] });
      } catch (err) {
        console.error(`Search failed for "${term}":`, err);
        allResults.push({ term, results: [] });
      }
    }
    setSearchGroups(allResults);
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

  // Phase navigation
  const handleFindSecondImage = () => {
    // Parse AI's last message for SEARCH: suggestions
    const suggestions = parseSearchSuggestions(transcript);
    setSearchPills(suggestions);
    setPhase('new_image');
    if (suggestions.length > 0) {
      runSearches(suggestions);
    }
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

  const handleApply = () => {
    if (!tag || !capability) return;
    const transcriptLines = transcript
      .filter(m => m.content.trim().length > 0)
      .map(m => m.content);
    onApply({
      transcript: transcriptLines,
      original_image: ia33Image || '',
      original_title: ia33Title,
      new_image: selectedNewImage || '',
      new_title: newTitle,
      story,
      capability,
      tag,
    });
    onOpenChange(false);
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? This will clear your progress.')) {
      onStartOver();
    }
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
            <p className="text-xs text-gray-500">{PHASE_LABELS[phase]}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleStartOver}>Start Over</Button>
            <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </header>

        {/* ═══ LEFT COLUMN — Process ═══ */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">

          {/* ===== PHASE 1: DISCOVER ===== */}
          {phase === 'discover' && (
            <div className="flex flex-col flex-1 min-h-0">
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
                style={{ maxHeight: '400px' }}
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
                    {m.content}
                  </div>
                ))}
              </div>

              {/* InlineChat — active only in discover */}
              <InlineChat
                ref={chatRef}
                trainingId="ia-4-3"
                systemPrompt={`${PROMPTS.IA_4_3}\n\nCURRENT_PHASE: discover`}
                seed={`My image is titled "${ia33Title}". My reflection was: "${ia33Reflection}"`}
                onUserSend={onChatUserSend}
                onReply={onChatReply}
                hideHistory
                className="border-0 p-0 bg-transparent flex-shrink-0"
              />

              {/* Navigation — after 2+ user messages */}
              {userMessageCount >= 2 && (
                <div className="pt-3 border-t border-gray-200 flex-shrink-0">
                  <Button
                    onClick={handleFindSecondImage}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Find a second image
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ===== PHASE 2: NEW_IMAGE ===== */}
          {phase === 'new_image' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
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
                  Finding what &ldquo;{ia33Title}&rdquo; doesn't capture&hellip;
                </p>
              </div>

              {/* AI search pills */}
              {searchPills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
                  {searchPills.map((pill, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchGroups([]);
                        runSearches([pill]);
                      }}
                      className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full border border-purple-200 hover:bg-purple-200 transition-colors"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}

              {/* Free search */}
              <div className="flex gap-2 mb-3 flex-shrink-0">
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

              {/* Search results — 3-column grid */}
              {searchGroups.map((group, gi) => (
                <div key={gi} className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">&ldquo;{group.term}&rdquo;</h4>
                  <div className="grid grid-cols-3 gap-2">
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
                            className="w-full h-24 object-cover rounded"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Back button */}
              <div className="pt-2 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>
              </div>
            </div>
          )}

          {/* ===== PHASE 3: STORY ===== */}
          {phase === 'story' && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Image pair display */}
              <div className="flex justify-center items-start gap-4 mb-4 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <img
                    src={ia33Image || ''}
                    alt={ia33Title}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 shadow"
                  />
                  <p className="mt-1 text-xs font-semibold text-gray-700">&ldquo;{ia33Title}&rdquo;</p>
                </div>
                <div className="flex items-center pt-12 text-2xl font-light text-purple-400">+</div>
                <div className="flex flex-col items-center">
                  <img
                    src={selectedNewImage || ''}
                    alt={newTitle}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-purple-400 shadow"
                  />
                  <p className="mt-1 text-xs font-semibold text-purple-800">&ldquo;{newTitle}&rdquo;</p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">
                What do these two images reveal together about your potential that neither shows alone?
              </p>

              <div className="flex gap-2 mt-auto flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={handleBack}>Back</Button>
              </div>
            </div>
          )}

          {/* ===== PHASE 4: CAPABILITY ===== */}
          {phase === 'capability' && (
            <div className="flex flex-col flex-1 min-h-0">
              <p className="text-sm text-gray-700 mb-4">
                You looked at one image of your potential and found what it was missing.
                Then you found a second image to hold that.
                Together they show more than either one alone.
              </p>
              <p className="text-sm font-medium text-gray-800 mb-4">
                What did you draw on to do that?
              </p>

              <CapabilitySelector
                mode="single"
                selected={capability}
                onSelect={(val) => setCapability(val as CapabilityType)}
                prompt="Which capability felt most present?"
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
              <h3 className="text-sm font-semibold uppercase text-gray-600 mb-3">What did this exercise give you?</h3>
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
                  disabled={!tag}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Complete Exercise
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

          {/* Placeholder — during discover */}
          {phase === 'discover' && (
            <p className="text-xs text-gray-400 italic">
              As you explore with the AI, your second image and story will appear here.
            </p>
          )}

          {/* Selected new image — during new_image phase and beyond */}
          {(phase === 'new_image' || phase === 'story' || phase === 'capability' || phase === 'tag') && (
            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Second Image</h2>
              {selectedNewImage ? (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3">
                  <img
                    src={selectedNewImage}
                    alt={newTitle || 'Selected image'}
                    className="w-full h-32 object-cover rounded-lg border border-purple-300"
                  />
                  {phase === 'new_image' ? (
                    <>
                      <label className="block text-xs font-medium text-gray-700">
                        Give this image a one-word title:
                      </label>
                      <Input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="One word..."
                        className="max-w-xs"
                      />
                      <Button
                        onClick={handleConfirmNewImage}
                        disabled={!newTitle.trim()}
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Confirm Image
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-purple-800 text-center">&ldquo;{newTitle}&rdquo;</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Select an image from the search results.</p>
              )}
            </section>
          )}

          {/* Image pair + story — during story phase and beyond */}
          {(phase === 'story' || phase === 'capability' || phase === 'tag') && (
            <section className="mb-4">
              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Your Pair</h2>
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={ia33Image || ''}
                  alt={ia33Title}
                  className="w-16 h-16 object-cover rounded border border-gray-300"
                />
                <span className="text-lg font-light text-purple-400">+</span>
                <img
                  src={selectedNewImage || ''}
                  alt={newTitle}
                  className="w-16 h-16 object-cover rounded border border-purple-300"
                />
              </div>

              <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">What These Reveal Together</h2>
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
