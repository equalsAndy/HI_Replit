import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StretchModal, TAG_OPTIONS } from './StretchModal';
import type { StretchResult } from './StretchModal';
import { CapabilityType, CAPABILITY_LABELS } from '@/lib/types';
import { searchUnsplash } from '@/services/api-services';
import { Loader2 } from 'lucide-react';

// IA-3-3 data structure for proper typing
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
}

function wordCount(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ── Stretch examples ─────────────────────────────────────────────────
// Before image → after image, with reveal text. Square PNGs in /assets/.
const STRETCH_EXAMPLES = [
  {
    startLabel: 'Calm Ocean',
    startImg: '/assets/calm-water-ia-4-3-square.png',
    stretchLabel: 'Rough Water',
    stretchImg: '/assets/rough-water-ia-4-3-square.png',
    reveal: 'Grit under pressure — potential that only shows up when things get hard',
  },
  {
    startLabel: 'Mountain Peak',
    startImg: '/assets/peak-ia-4-3-square.png',
    stretchLabel: 'The Climb',
    stretchImg: '/assets/climb-ia-4-3-square.png',
    reveal: 'The summit is one moment — the real potential lives in the ascent itself',
  },
  {
    startLabel: 'Seedling',
    startImg: '/assets/seedling.png',
    stretchLabel: 'Destroyed Concrete',
    stretchImg: '/assets/destroyed_concrete.png',
    reveal: 'The thing that survives the crack doesn\u2019t just persist \u2014 it reshapes what held it back',
  },
];
// ─────────────────────────────────────────────────────────────────────

/** Tiny image or emoji fallback */
function Thumb({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="w-14 h-14 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xl flex-shrink-0">
      {fallback}
    </div>
  );
}

export default function VisualizationStretchExercise() {
  const { state, setState, loading, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [enlargedImg, setEnlargedImg] = React.useState<{ src: string; alt: string } | null>(null);

  // Image override state — lets user replace ia-3-3 image before stretching
  // Persisted in state.ia_4_3.starting_override_image / starting_override_title
  const [showImageReplace, setShowImageReplace] = React.useState(false);
  const [replaceSearch, setReplaceSearch] = React.useState('');
  const [replaceResults, setReplaceResults] = React.useState<any[]>([]);
  const [replaceLoading, setReplaceLoading] = React.useState(false);
  const [overrideImage, setOverrideImage] = React.useState<string | null>(null);
  const [overrideTitle, setOverrideTitle] = React.useState('');
  const [overrideHydrated, setOverrideHydrated] = React.useState(false);

  // Hydrate override from persisted state on load
  React.useEffect(() => {
    if (!loading && state?.ia_4_3 && !overrideHydrated) {
      const saved = state.ia_4_3;
      if (saved.starting_override_image && saved.starting_override_title) {
        setOverrideImage(saved.starting_override_image);
        setOverrideTitle(saved.starting_override_title);
      }
      setOverrideHydrated(true);
    }
  }, [loading, state, overrideHydrated]);

  // Access IA-3-3 data using the workshop step data hook
  const { data: ia33Data } = useWorkshopStepData<IA33StepData>('ia', 'ia-3-3', {
    selectedImage: null,
    uploadedImage: null,
    reflection: '',
    imageTitle: '',
  });

  // Normalize ia_4_3 with a fallback
  const ia = state?.ia_4_3 ?? {};

  // Extract IA-3-3 data
  const ia33Image = ia33Data?.uploadedImage || ia33Data?.selectedImage;
  const ia33Title = ia33Data?.imageTitle || '';
  const ia33Reflection = ia33Data?.reflection || '';

  // Effective starting image — override wins if set
  const effectiveImage = overrideImage || ia33Image;
  const effectiveTitle = overrideImage ? overrideTitle : ia33Title;
  const effectiveReflection = overrideImage ? '' : ia33Reflection;

  // Early return AFTER all hooks are called
  if (loading || !state) return null;

  const hasIA33Data = Boolean(ia33Image && ia33Title);
  const hasStartingImage = Boolean(effectiveImage && effectiveTitle);

  const runReplaceSearch = async () => {
    if (!replaceSearch.trim()) return;
    setReplaceLoading(true);
    try {
      const results = await searchUnsplash(replaceSearch.trim(), 8);
      setReplaceResults(results || []);
    } catch (err) {
      console.error('Replace search failed:', err);
    }
    setReplaceLoading(false);
  };

  const confirmOverride = () => {
    if (overrideImage && overrideTitle.trim()) {
      // Persist to continuity state so it survives refresh
      setState((prev) => ({
        ...prev,
        ia_4_3: {
          ...(prev.ia_4_3 || {}),
          starting_override_image: overrideImage,
          starting_override_title: overrideTitle.trim(),
        },
      }));
      setTimeout(() => saveNow(), 0);
      setShowImageReplace(false);
    }
  };

  const clearOverride = () => {
    setOverrideImage(null);
    setOverrideTitle('');
    setReplaceResults([]);
    setReplaceSearch('');
    setShowImageReplace(false);
    // Remove from persisted state
    setState((prev) => {
      const { starting_override_image, starting_override_title, ...rest } = (prev.ia_4_3 || {}) as any;
      return { ...prev, ia_4_3: rest };
    });
    setTimeout(() => saveNow(), 0);
  };
  const hasResults = Boolean(ia.completed);

  // Resolve tag and capability labels
  const tagLabel = TAG_OPTIONS.find(t => t.value === ia.tag)?.label ?? ia.tag;
  const tagHelper = TAG_OPTIONS.find(t => t.value === ia.tag)?.helper ?? '';
  const capabilityLabel = ia.capability ? CAPABILITY_LABELS[ia.capability as CapabilityType] : '';

  function onModalApply(result: StretchResult) {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        // Preserve override fields so they survive modal completion
        ...(prev.ia_4_3?.starting_override_image ? {
          starting_override_image: prev.ia_4_3.starting_override_image,
          starting_override_title: prev.ia_4_3.starting_override_title,
        } : {}),
        original_image: result.original_image,
        original_title: result.original_title,
        original_reflection: effectiveReflection,
        new_image: result.new_image,
        new_title: result.new_title,
        story: result.story,
        capability: result.capability,
        tag: result.tag,
        transcript: result.transcript,
        completed: true,
      },
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onModalStartOver() {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        // Preserve override fields so starting image choice survives redo
        ...(prev.ia_4_3?.starting_override_image ? {
          starting_override_image: prev.ia_4_3.starting_override_image,
          starting_override_title: prev.ia_4_3.starting_override_title,
        } : {}),
        original_image: null,
        original_title: '',
        original_reflection: '',
        new_image: null,
        new_title: '',
        story: '',
        capability: null,
        tag: '',
        transcript: [],
        completed: false,
      },
    }));
  }

  return (
    <>
      {/* ═══ PRE-MODAL: Examples + Launch ═══ */}
      {!hasResults && (
        <div className="space-y-6">

          {/* How stretching works — visual example cards */}
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-1">How it works</h4>
            <p className="text-sm text-gray-500 mb-4">
              Each stretch starts from one image and pushes to find what&apos;s beyond it.{' '}
              <span className="text-gray-400">Click to enlarge the images.</span>
            </p>

            <div className="space-y-3">
              {STRETCH_EXAMPLES.map((ex) => (
                <div
                  key={ex.startLabel}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                >
                  {/* Before thumbnail */}
                  <button type="button" onClick={() => setEnlargedImg({ src: ex.startImg, alt: ex.startLabel })} className="cursor-pointer">
                    <Thumb src={ex.startImg} fallback="🌊" alt={ex.startLabel} />
                  </button>

                  <div className="flex flex-col items-center flex-shrink-0 w-10">
                    <span className="text-xs font-medium text-gray-400 uppercase">start</span>
                    <span className="text-purple-400 text-lg leading-none">&rarr;</span>
                    <span className="text-xs font-medium text-purple-500 uppercase">stretch</span>
                  </div>

                  {/* After thumbnail */}
                  <button type="button" onClick={() => setEnlargedImg({ src: ex.stretchImg, alt: ex.stretchLabel })} className="cursor-pointer">
                    <Thumb src={ex.stretchImg} fallback="🌊" alt={ex.stretchLabel} />
                  </button>

                  {/* Labels + reveal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-700">&ldquo;{ex.startLabel}&rdquo;</span>
                      <span className="text-purple-400">&rarr;</span>
                      <span className="text-sm font-semibold text-purple-700">&ldquo;{ex.stretchLabel}&rdquo;</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ex.reveal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User's starting image + launch button */}
          {hasStartingImage && !showImageReplace && (
            <div className="p-5 bg-white border-2 border-purple-200 rounded-xl">
              <h4 className="text-sm font-semibold uppercase text-purple-700 mb-3">Your starting image</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
                {effectiveImage && (
                  <img
                    src={effectiveImage}
                    alt={effectiveTitle}
                    className="w-28 h-28 object-cover rounded-lg border-2 border-purple-300 shadow-sm flex-shrink-0"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold text-gray-800">&ldquo;{effectiveTitle}&rdquo;</p>
                  {effectiveReflection && (
                    <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{effectiveReflection}&rdquo;</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Button
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white text-base px-8 py-3"
                >
                  Start Stretching
                </Button>
                <button
                  type="button"
                  onClick={() => setShowImageReplace(true)}
                  className="text-sm text-gray-500 hover:text-purple-600 underline transition-colors"
                >
                  Choose a different starting image
                </button>
                {overrideImage && (
                  <button
                    type="button"
                    onClick={clearOverride}
                    className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
                  >
                    Revert to original
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Image replace search panel */}
          {showImageReplace && (
            <div className="p-5 bg-white border-2 border-purple-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase text-purple-700">Choose a different starting image</h4>
                <button
                  type="button"
                  onClick={() => setShowImageReplace(false)}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search for an image..."
                  value={replaceSearch}
                  onChange={(e) => setReplaceSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runReplaceSearch(); } }}
                  className="flex-1"
                />
                <Button
                  onClick={runReplaceSearch}
                  disabled={!replaceSearch.trim() || replaceLoading}
                  size="sm"
                >
                  {replaceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </div>

              {replaceResults.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {replaceResults.map((img: any) => {
                    const url = img.urls?.regular || img.urls?.small;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setOverrideImage(url)}
                        className={`border-2 rounded-lg p-0.5 transition-all ${
                          overrideImage === url
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

              {overrideImage && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-3">
                  <img
                    src={overrideImage}
                    alt={overrideTitle || 'Selected image'}
                    className="w-full h-32 object-cover rounded-lg border border-purple-300"
                  />
                  <label className="block text-xs font-medium text-gray-700">Title this image:</label>
                  <Input
                    value={overrideTitle}
                    onChange={(e) => setOverrideTitle(e.target.value)}
                    placeholder="What does this image represent?"
                    className="w-full"
                  />
                  <Button
                    onClick={confirmOverride}
                    disabled={!overrideTitle.trim()}
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Use This Image
                  </Button>
                </div>
              )}
            </div>
          )}

          {!hasStartingImage && !showImageReplace && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
              <p className="text-sm text-amber-700">
                Complete the visualization exercise in Module 3 (ia-3-3) first &mdash; that&apos;s where you choose the image we&apos;ll stretch from here.
              </p>
              <button
                type="button"
                onClick={() => setShowImageReplace(true)}
                className="text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Or choose an image now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image enlarge modal */}
      {enlargedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setEnlargedImg(null)}
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={enlargedImg.src}
              alt={enlargedImg.alt}
              className="w-full rounded-lg shadow-2xl"
            />
            <p className="text-white text-lg text-center mt-4 font-medium">{enlargedImg.alt}</p>
            <button
              type="button"
              onClick={() => setEnlargedImg(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg text-lg font-bold"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <StretchModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ia33Image={effectiveImage || null}
        ia33Title={effectiveTitle}
        ia33Reflection={effectiveReflection}
        onApply={onModalApply}
        onStartOver={onModalStartOver}
      />

      {/* ═══ POST-MODAL: Results ═══ */}
      {hasResults && (
        <div className="space-y-6">

          {/* What You Just Did */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You stretched how you see your potential &mdash; pushing past your first image to find
              where it reaches further. You found your edge, confirmed it with the &ldquo;too far&rdquo; test,
              and chose a second image for the territory you stretched into.
              Together, these two images reveal more about your potential than either shows alone.
            </p>
          </div>

          {/* Image Pair */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-4">Your Image Pair</h3>

            <div className="flex justify-center items-start gap-6 mb-4">
              <div className="flex flex-col items-center">
                <img
                  src={ia.original_image || ''}
                  alt={ia.original_title}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-gray-300 shadow"
                />
                <p className="mt-2 text-sm font-semibold text-gray-700">&ldquo;{ia.original_title}&rdquo;</p>
              </div>
              <div className="flex items-center pt-16 text-3xl font-light text-purple-400">+</div>
              <div className="flex flex-col items-center">
                <img
                  src={ia.new_image || ''}
                  alt={ia.new_title}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-purple-400 shadow"
                />
                <p className="mt-2 text-sm font-semibold text-purple-800">&ldquo;{ia.new_title}&rdquo;</p>
              </div>
            </div>

            {/* Editable story textarea */}
            <div className="mt-4">
              <label className="block text-sm font-semibold uppercase text-purple-700 mb-2">What The Stretch Reveals</label>
              <textarea
                className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg text-sm resize-y bg-white"
                value={ia.story ?? ''}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    ia_4_3: { ...(prev.ia_4_3 || {}), story: e.target.value },
                  }))
                }
                onBlur={() => saveNow()}
              />
              <p className="mt-1 text-xs text-gray-500">Edit if you&apos;d like to refine.</p>
            </div>
          </div>

          {/* Capability + Tag badges */}
          <div className="flex flex-wrap gap-4 items-center">
            {capabilityLabel && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                <span className="text-xs font-semibold uppercase text-gray-500">Capability:</span>
                <span className="text-sm font-medium text-purple-800">{capabilityLabel}</span>
              </div>
            )}
            {tagLabel && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                <span className="text-xs font-semibold uppercase text-gray-500">Tag:</span>
                <span className="text-sm font-medium text-purple-800">{tagLabel}</span>
              </div>
            )}
            {tagHelper && (
              <p className="text-xs text-gray-500 italic">{tagHelper}</p>
            )}
          </div>

          {/* Redo button */}
          <div>
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="text-purple-700 border-purple-300 hover:bg-purple-50"
            >
              Redo Visualization Stretch
            </Button>
          </div>

          {/* Completion gate warning */}
          {(!ia.story || wordCount(ia.story) < 10 || !ia.capability || !ia.tag) && (
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              Required to continue:
              {(!ia.story || wordCount(ia.story) < 10) && <span className="ml-1">Story (10+ words)</span>}
              {!ia.capability && <span className="ml-1">Capability</span>}
              {!ia.tag && <span className="ml-1">Tag</span>}
            </p>
          )}

        </div>
      )}
    </>
  );
}
