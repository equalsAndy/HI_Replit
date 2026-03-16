import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StretchModal, TAG_OPTIONS } from './StretchModal';
import type { StretchResult } from './StretchModal';
import { searchUnsplash, describeImage } from '@/services/api-services';
import { Loader2 } from 'lucide-react';

// IA-3-3 data structure for proper typing
interface IA33StepData {
  selectedImage: string | null;
  uploadedImage: string | null;
  reflection: string;
  imageTitle: string;
  imageDescription?: string;
}

// Stretch examples — each tells the story of a stretch in words
// Each stretched image uses a different style to showcase the modal's style options
const STRETCH_EXAMPLES = [
  {
    startLabel: 'Calm Ocean',
    startImg: '/assets/calm-water-ia-4-3-square.png',
    represents: 'I stay composed when everything around me is chaotic.',
    stretchLabel: 'Standing Firm',
    stretchImg: '/assets/lighthouse-stretch-photorealistic.png',
    style: 'Photorealistic',
    stretchQ: 'What does that composure look like when the pressure is on you, not just around you?',
    stretched: 'I don\u2019t just stay calm \u2014 I hold steady when I\u2019m the one under fire.',
  },
  {
    startLabel: 'Mountain Peak',
    startImg: '/assets/peak-ia-4-3-square.png',
    represents: 'I\u2019m driven to reach the top of whatever I take on.',
    stretchLabel: 'The Path',
    stretchImg: '/assets/mountain-trail-stretch-illustration.png',
    style: 'Bold Illustration',
    stretchQ: 'What if the part that matters most isn\u2019t arriving \u2014 but how you get there?',
    stretched: 'My real strength isn\u2019t finishing \u2014 it\u2019s what I become during the effort.',
  },
  {
    startLabel: 'Seedling',
    startImg: '/assets/seedling.png',
    represents: 'I\u2019m just getting started, but I know I can grow.',
    stretchLabel: 'Breaking Through',
    stretchImg: '/assets/tree-roots-stretch-watercolor.png',
    style: 'Watercolor',
    stretchQ: 'What would it look like if that growth wasn\u2019t just happening \u2014 but breaking through something?',
    stretched: 'I\u2019m not just growing \u2014 I\u2019m reshaping what was holding me back.',
  },
];

const CAPABILITY_OPTIONS = [
  { key: 'curiosity', label: 'Curiosity', color: 'green' },
  { key: 'caring', label: 'Caring', color: 'blue' },
  { key: 'creativity', label: 'Creativity', color: 'orange' },
  { key: 'courage', label: 'Courage', color: 'red' },
] as const;

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
  const [showExamples, setShowExamples] = React.useState(true);

  // Image override state
  const [showImageReplace, setShowImageReplace] = React.useState(false);
  const [replaceSearch, setReplaceSearch] = React.useState('');
  const [replaceResults, setReplaceResults] = React.useState<any[]>([]);
  const [replaceLoading, setReplaceLoading] = React.useState(false);
  const [overrideImage, setOverrideImage] = React.useState<string | null>(null);
  const [overrideTitle, setOverrideTitle] = React.useState('');
  const [overrideHydrated, setOverrideHydrated] = React.useState(false);

  // Capability stretch state
  const [capStretchLoading, setCapStretchLoading] = React.useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = React.useState<string | null>(null);

  // Other tag state
  const [otherTagText, setOtherTagText] = React.useState(state?.ia_4_3?.other_tag_text || '');

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

  // Access IA-3-3 data
  const { data: ia33Data } = useWorkshopStepData<IA33StepData>('ia', 'ia-3-3', {
    selectedImage: null,
    uploadedImage: null,
    reflection: '',
    imageTitle: '',
  });

  const ia = state?.ia_4_3 ?? {};

  const ia33Image = ia33Data?.uploadedImage || ia33Data?.selectedImage;
  const ia33Title = ia33Data?.imageTitle || '';
  const ia33Reflection = ia33Data?.reflection || '';
  const ia33ImageDescription = ia33Data?.imageDescription || '';

  const effectiveImage = overrideImage || ia33Image;
  const effectiveTitle = overrideImage ? overrideTitle : ia33Title;
  const effectiveReflection = overrideImage ? '' : ia33Reflection;

  if (loading || !state) return null;

  const hasIA33Data = Boolean(ia33Image && ia33Title);
  const hasStartingImage = Boolean(effectiveImage && effectiveTitle);

  // New completion logic: modal results + tag on content area
  const stretchImageUrl = ia.new_image_url || ia.new_image || null;
  const hasModalResults = Boolean(stretchImageUrl);
  const isFullyComplete = Boolean(hasModalResults && ia.tag);
  const capStretches = ia.capability_stretches || {};
  const capStretchCount = Object.keys(capStretches).length;
  const hasCapStretch = capStretchCount > 0;

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
      setState((prev) => ({
        ...prev,
        ia_4_3: {
          ...(prev.ia_4_3 || {}),
          starting_override_image: overrideImage,
          starting_override_title: overrideTitle.trim(),
          starting_override_description: '',
        },
      }));
      setTimeout(() => saveNow(), 0);
      setShowImageReplace(false);

      // Fire Vision in background for override image
      describeImage(overrideImage).then((description) => {
        if (description) {
          setState((prev) => ({
            ...prev,
            ia_4_3: {
              ...(prev.ia_4_3 || {}),
              starting_override_description: description,
            },
          }));
          setTimeout(() => saveNow(), 0);
        }
      }).catch(() => {});
    }
  };

  const clearOverride = () => {
    setOverrideImage(null);
    setOverrideTitle('');
    setReplaceResults([]);
    setReplaceSearch('');
    setShowImageReplace(false);
    setState((prev) => {
      const { starting_override_image, starting_override_title, ...rest } = (prev.ia_4_3 || {}) as any;
      return { ...prev, ia_4_3: rest };
    });
    setTimeout(() => saveNow(), 0);
  };

  function onModalApply(result: StretchResult) {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        ...(prev.ia_4_3 || {}),
        // Preserve override fields
        ...(prev.ia_4_3?.starting_override_image ? {
          starting_override_image: prev.ia_4_3.starting_override_image,
          starting_override_title: prev.ia_4_3.starting_override_title,
        } : {}),
        // Preserve capability stretches from previous state
        capability_stretches: prev.ia_4_3?.capability_stretches || {},
        original_image: result.original_image,
        original_title: result.original_title,
        original_reflection: effectiveReflection,
        new_image_url: result.new_image_url,
        new_image_photo_id: result.new_image_photo_id,
        new_title: result.new_title,
        style: result.style,
        story: prev.ia_4_3?.story || '',
        transcript: result.transcript,
        // Not completed yet — need tag on content area
        completed: false,
        // Clear tag so user selects fresh
        tag: '',
      },
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onModalStartOver() {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        // Preserve override fields
        ...(prev.ia_4_3?.starting_override_image ? {
          starting_override_image: prev.ia_4_3.starting_override_image,
          starting_override_title: prev.ia_4_3.starting_override_title,
        } : {}),
        original_image: null,
        original_title: '',
        original_reflection: '',
        new_image_url: undefined,
        new_image_photo_id: undefined,
        new_title: '',
        story: '',
        tag: '',
        transcript: [],
        completed: false,
        capability_stretches: {},
      },
    }));
  }

  // Handle tag selection — sets tag and marks exercise complete
  function handleTagSelect(tagValue: string) {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        ...(prev.ia_4_3 || {}),
        tag: tagValue,
        // For 'other', store the custom text too
        ...(tagValue === 'other' ? { other_tag_text: otherTagText } : {}),
        completed: true,
      },
    }));
    setTimeout(() => saveNow(), 0);
  }

  // Handle capability stretch generation — one only, no redo
  async function handleCapabilityStretch(capability: string) {
    if (capStretchLoading || hasCapStretch) return;
    if (capStretches[capability]) return; // Already done

    setCapStretchLoading(capability);
    try {
      const resp = await fetch('/api/ai/image/capability-stretch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          original_title: ia.original_title || effectiveTitle,
          stretch_title: ia.new_title || '',
          story: ia.story || '',
          capability,
          style: ia.style || 'photorealistic',
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to generate capability stretch');
      }

      setState((prev) => ({
        ...prev,
        ia_4_3: {
          ...(prev.ia_4_3 || {}),
          capability_stretches: {
            ...(prev.ia_4_3?.capability_stretches || {}),
            [capability]: {
              text: data.text || '',
              photo_id: data.photo_id,
              photo_url: data.photo_url || data.fallback_base64 || '',
              title: data.suggested_title || capability,
              response: '',
            },
          },
        },
      }));
      setTimeout(() => saveNow(), 0);
    } catch (err: any) {
      console.error(`Capability stretch (${capability}) failed:`, err);
    } finally {
      setCapStretchLoading(null);
    }
  }

  // Update capability stretch response text
  function updateCapStretchResponse(capability: string, response: string) {
    setState((prev) => ({
      ...prev,
      ia_4_3: {
        ...(prev.ia_4_3 || {}),
        capability_stretches: {
          ...(prev.ia_4_3?.capability_stretches || {}),
          [capability]: {
            ...(prev.ia_4_3?.capability_stretches?.[capability] || {} as any),
            response,
          },
        },
      },
    }));
  }

  const tagLabel = TAG_OPTIONS.find(t => t.value === ia.tag)?.label ?? ia.tag;
  const tagHelper = TAG_OPTIONS.find(t => t.value === ia.tag)?.helper ?? '';

  return (
    <>
      {/* PRE-MODAL: Examples + Launch */}
      {!hasModalResults && (
        <div className="space-y-6">

          {/* How stretching works — collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowExamples(prev => !prev)}
              className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-1 hover:text-purple-700 transition-colors"
            >
              <span className={`text-sm text-purple-500 transition-transform ${showExamples ? 'rotate-90' : ''}`}>&#9654;</span>
              How it works
            </button>

            {showExamples && (
            <>
            <p className="text-sm text-gray-500 mb-4 ml-5">
              Each stretch starts from one image and pushes to find what&apos;s beyond it.{' '}
              <span className="text-gray-400">Click to enlarge the images.</span>
            </p>

            <div className="space-y-4 ml-5">
              {STRETCH_EXAMPLES.map((ex) => (
                <div
                  key={ex.startLabel}
                  className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
                >
                  {/* Row 1: Image pair with titles */}
                  <div className="flex items-center gap-3 mb-3">
                    <button type="button" onClick={() => setEnlargedImg({ src: ex.startImg, alt: ex.startLabel })} className="cursor-pointer flex-shrink-0">
                      <Thumb src={ex.startImg} fallback="" alt={ex.startLabel} />
                    </button>

                    <div className="flex flex-col items-center flex-shrink-0">
                      <span className="text-purple-400 text-lg leading-none">&rarr;</span>
                    </div>

                    <button type="button" onClick={() => setEnlargedImg({ src: ex.stretchImg, alt: ex.stretchLabel })} className="cursor-pointer flex-shrink-0">
                      <Thumb src={ex.stretchImg} fallback="" alt={ex.stretchLabel} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-700">&ldquo;{ex.startLabel}&rdquo;</span>
                        <span className="text-purple-400">&rarr;</span>
                        <span className="text-sm font-semibold text-purple-700">&ldquo;{ex.stretchLabel}&rdquo;</span>
                        {ex.style && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-500 rounded-full font-medium">
                            {ex.style}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* The stretch story — three lines showing the process */}
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-500">Represents:</span>{' '}
                      <span className="italic">&ldquo;{ex.represents}&rdquo;</span>
                    </p>
                    <p className="text-purple-600">
                      <span className="font-medium text-purple-500">Stretch:</span>{' '}
                      <span className="italic">&ldquo;{ex.stretchQ}&rdquo;</span>
                    </p>
                    <p className="text-gray-800 font-medium">
                      <span className="text-gray-500 font-medium">Landed:</span>{' '}
                      &ldquo;{ex.stretched}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </>
            )}
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

              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Your starting image represents <strong>one side of who you are</strong> &mdash; a quality
                  or capacity that feels present but maybe underused. If your original image doesn&apos;t
                  feel right anymore, search for one that better captures where you are now.
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Think: what one image would capture something true about you that you want to take further?
                </p>
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
        ia33ImageDescription={overrideImage ? (ia.starting_override_description || '') : ia33ImageDescription}
        onApply={onModalApply}
        onStartOver={onModalStartOver}
      />

      {/* POST-MODAL: Results + Tag + Capability Stretches */}
      {hasModalResults && (
        <div className="space-y-6">

          {/* What You Just Did */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You stretched how you see your potential &mdash; pushing past your first image to find
              where it reaches further. AI generated a stretch image from your conversation, and
              together these two images reveal more about your potential than either shows alone.
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
                  src={stretchImageUrl || ''}
                  alt={ia.new_title}
                  className="w-40 h-40 object-cover rounded-lg border-2 border-purple-400 shadow"
                />
                <p className="mt-2 text-sm font-semibold text-purple-800">&ldquo;{ia.new_title}&rdquo;</p>
              </div>
            </div>

            {/* Story textarea */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do these two images reveal together?
              </label>
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
                placeholder="Together, these images show..."
              />
            </div>
          </div>

          {/* Tag Selection (moved from modal) */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-3">What did stretching give you?</h3>
            <div className="grid grid-cols-2 gap-2">
              {TAG_OPTIONS.map(({ value, label, helper }) => (
                <label
                  key={value}
                  className={`flex items-start gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-all ${
                    ia.tag === value ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="stretch-tag"
                    value={value}
                    checked={ia.tag === value}
                    onChange={() => handleTagSelect(value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-gray-500">{helper}</div>
                  </div>
                </label>
              ))}
              {/* Other option */}
              <label
                className={`flex items-start gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-all col-span-2 ${
                  ia.tag === 'other' ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="stretch-tag"
                  value="other"
                  checked={ia.tag === 'other'}
                  onChange={() => {
                    if (otherTagText.trim()) handleTagSelect('other');
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Something else</div>
                  <Input
                    value={otherTagText}
                    onChange={(e) => setOtherTagText(e.target.value)}
                    onBlur={() => {
                      if (ia.tag === 'other' && otherTagText.trim()) {
                        setState((prev) => ({
                          ...prev,
                          ia_4_3: { ...(prev.ia_4_3 || {}), other_tag_text: otherTagText },
                        }));
                        setTimeout(() => saveNow(), 0);
                      }
                    }}
                    placeholder="In your own words..."
                    className="mt-1 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {ia.tag !== 'other' && otherTagText.trim() && (
                    <button
                      type="button"
                      onClick={() => handleTagSelect('other')}
                      className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Select this
                    </button>
                  )}
                </div>
              </label>
            </div>
            {ia.tag && (
              <p className="mt-2 text-xs text-green-600 font-medium">Exercise complete &mdash; you can continue to the next step.</p>
            )}
          </div>

          {/* Capability Stretch (optional, 1 only) */}
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-2">Capability Stretch</h3>
            <p className="text-xs text-gray-500 mb-4">
              Which capability feels least used by you? Pick one and the AI will show your stretch through that lens.
            </p>

            {!hasCapStretch ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {CAPABILITY_OPTIONS.map(({ key, label, color }) => {
                    const isSelected = selectedCapability === key;
                    const isLoading = capStretchLoading === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => !isLoading && setSelectedCapability(isSelected ? null : key)}
                        disabled={isLoading}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all text-left ${
                          isSelected
                            ? 'border-purple-400 bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                            : `border-gray-200 hover:border-${color}-300 hover:bg-${color}-50 text-gray-700`
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                          </span>
                        ) : (
                          label
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedCapability && !capStretchLoading && (
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleCapabilityStretch(selectedCapability)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Generate {CAPABILITY_OPTIONS.find(c => c.key === selectedCapability)?.label} stretch
                    </Button>
                    <p className="text-xs text-gray-400">One generation &mdash; no redo</p>
                  </div>
                )}
              </>
            ) : null}

            {/* Rendered capability stretch cards */}
            {Object.entries(capStretches).map(([cap, data]) => (
              <div key={cap} className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex gap-4 mb-3">
                  {data.photo_url && (
                    <img
                      src={data.photo_url}
                      alt={data.title}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 capitalize mb-1">
                      {CAPABILITY_OPTIONS.find(c => c.key === cap)?.label || cap}: &ldquo;{data.title}&rdquo;
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{data.text}</p>
                  </div>
                </div>
                <textarea
                  className="w-full min-h-[60px] p-2 border border-gray-300 rounded text-sm resize-y bg-white"
                  value={data.response || ''}
                  onChange={(e) => updateCapStretchResponse(cap, e.target.value)}
                  onBlur={() => saveNow()}
                  placeholder="What does this perspective add to your stretch?"
                />
              </div>
            ))}
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
          {!isFullyComplete && (
            <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
              Select a tag above to complete this exercise.
            </p>
          )}

        </div>
      )}
    </>
  );
}
