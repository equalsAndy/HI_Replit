import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { InvitingTheMuseModal, type MuseResult } from './AdvancedInspirationModal';
import { Zap, Plus, X, CheckCircle2 } from 'lucide-react';

// ─── Activity Constants (categorized) ────────────────────────────────────────

interface FlowActivity {
  id: string;
  title: string;
  hint?: string;
  m3Source?: string;
}

interface FlowCategory {
  id: string;
  label: string;
  activities: FlowActivity[];
}

const FLOW_CATEGORIES: FlowCategory[] = [
  {
    id: 'movement',
    label: 'Movement & Rhythm',
    activities: [
      { id: 'nature', title: 'Walking in nature', hint: 'open attention, sensory presence', m3Source: 'nature' },
      { id: 'walking', title: 'Walking or hiking', hint: 'rhythmic movement, wandering mind' },
      { id: 'running', title: 'Running or exercise', hint: 'physical effort frees thinking' },
      { id: 'swimming', title: 'Swimming or being in water', hint: 'sensory immersion, breathing rhythm' },
      { id: 'driving', title: 'Driving alone', hint: 'motion, music, uninterrupted' },
    ],
  },
  {
    id: 'making',
    label: 'Making & Hands',
    activities: [
      { id: 'painting-drawing', title: 'Painting, drawing, or clay', hint: 'hands move, mind follows', m3Source: 'create' },
      { id: 'cooking', title: 'Cooking or baking', hint: 'measuring, chopping, warmth' },
      { id: 'gardening', title: 'Gardening', hint: 'repetitive, tactile, outdoors' },
      { id: 'doodling', title: 'Doodling or sketching', hint: 'no plan, just marks' },
      { id: 'playing-music', title: 'Playing music', hint: 'fingers know the way' },
      { id: 'puzzles', title: 'Puzzles or jigsaw', hint: 'pattern-finding, quiet focus' },
    ],
  },
  {
    id: 'stillness',
    label: 'Stillness & Rest',
    activities: [
      { id: 'meditating', title: 'Meditating', hint: 'letting thoughts pass through' },
      { id: 'napping', title: 'Napping', hint: 'twilight ideas, half-awake' },
      { id: 'sitting-outdoors', title: 'Sitting quietly outdoors', hint: 'stillness plus open sky' },
      { id: 'showering', title: 'Showering or bathing', hint: 'warm water, enclosed, no screens' },
      { id: 'dishes', title: 'Doing dishes or housework', hint: 'autopilot rhythm, mind wanders' },
    ],
  },
  {
    id: 'words',
    label: 'Words & Stories',
    activities: [
      { id: 'writing', title: 'Writing without a plan', hint: 'pen moves, insight arrives', m3Source: 'journal' },
      { id: 'reading', title: 'Reading something absorbing', hint: 'lost in someone else\'s world', m3Source: 'heroes' },
      { id: 'learning', title: 'Trying something new', hint: 'curiosity pulls you forward', m3Source: 'learn' },
      { id: 'collecting-images', title: 'Collecting inspiring images', hint: 'pictures that pull you forward', m3Source: 'vision' },
    ],
  },
  {
    id: 'senses',
    label: 'Senses & Beauty',
    activities: [
      { id: 'photography', title: 'Photography or noticing details', hint: 'one detail fills attention', m3Source: 'beauty' },
      { id: 'galleries-music', title: 'Live music, galleries, or film', hint: 'something stops you', m3Source: 'art' },
    ],
  },
  {
    id: 'play-connection',
    label: 'Play & Connection',
    activities: [
      { id: 'building', title: 'Building (Lego, blocks, models)', hint: 'hands busy, mind free', m3Source: 'play' },
      { id: 'being-playful', title: 'Being silly or playful', hint: 'self-consciousness disappears', m3Source: 'play' },
      { id: 'games', title: 'Card or board games', hint: 'low stakes, full attention' },
      { id: 'friends', title: 'Hanging out with friends or colleagues', hint: 'ideas bounce between people' },
    ],
  },
];

const ALL_ACTIVITIES = FLOW_CATEGORIES.flatMap(c => c.activities);

// Migration map: old abstract IDs → new concrete IDs
const ID_MIGRATION: Record<string, string[]> = {
  'create': ['painting-drawing'],
  'beauty': ['photography'],
  'art': ['galleries-music'],
  'journal': ['writing'],
  'heroes': ['reading'],
  'learn': ['learning'],
  'vision': ['collecting-images'],
  'play': ['building', 'being-playful'],
  'absorbing-reading': ['reading'],
};

const migrateIds = (ids: string[]): string[] => {
  const migrated: string[] = [];
  for (const id of ids) {
    if (ID_MIGRATION[id]) {
      migrated.push(...ID_MIGRATION[id]);
    } else {
      migrated.push(id);
    }
  }
  return [...new Set(migrated)];
};

// ─── Capture Practice Options ────────────────────────────────────────────────

const CAPTURE_OPTIONS = [
  { id: 'voice-memo', label: 'Voice memo', icon: '\uD83C\uDFA4' },
  { id: 'photo', label: 'Photo or screenshot', icon: '\uD83D\uDCF7' },
  { id: 'text-self', label: 'Text yourself', icon: '\uD83D\uDCAC' },
  { id: 'notebook', label: 'Notebook or paper', icon: '\uD83D\uDCD3' },
  { id: 'notes-app', label: 'Notes app', icon: '\uD83D\uDCF1' },
  { id: 'other', label: 'Other', icon: '\u270F\uFE0F' },
];

// ─── Coaching line parsing from prep card ────────────────────────────────────

interface CoachingLine {
  id: string;
  capability: string;
  text: string;
}

const CAPABILITY_COLORS: Record<string, { bg: string; border: string; text: string; activeBg: string; activeBorder: string }> = {
  courage:     { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    activeBg: 'bg-red-100',    activeBorder: 'border-red-400' },
  creativity:  { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  activeBg: 'bg-amber-100',  activeBorder: 'border-amber-400' },
  curiosity:   { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  activeBg: 'bg-green-100',  activeBorder: 'border-green-400' },
  caring:      { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   activeBg: 'bg-blue-100',   activeBorder: 'border-blue-400' },
  imagination: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', activeBg: 'bg-purple-100', activeBorder: 'border-purple-400' },
};

function parseCoachingLines(prepCard: string): CoachingLine[] {
  const lines: CoachingLine[] = [];
  const regex = /\*\*(Courage|Creativity|Curiosity|Caring|Imagination)\*\*:\s*(.+)/gi;
  let match;
  while ((match = regex.exec(prepCard)) !== null) {
    const capability = match[1];
    lines.push({
      id: capability.toLowerCase(),
      capability,
      text: match[2].trim(),
    });
  }
  return lines;
}

const TAG_OPTIONS = [
  { value: 'A practice', label: 'A practice', helper: 'I have a deliberate way to invite inspiration' },
  { value: 'Recognition', label: 'Recognition', helper: 'I\'ve been doing this without realizing how it works' },
  { value: 'A capture method', label: 'A capture method', helper: 'Ideas won\'t slip away anymore' },
  { value: 'Permission', label: 'Permission', helper: 'Stepping away from the problem IS the work' },
];

// ─── IA-3-5 data shape ────────────────────────────────────────────────────────

interface IA35StepData {
  selectedInterludes: string[];
  responses: Record<string, string>;
  completed: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getActivityTitle(idOrTitle: string): string {
  const found = ALL_ACTIVITIES.find(a => a.id === idOrTitle);
  if (found) return found.title;
  const migrated = ID_MIGRATION[idOrTitle];
  if (migrated) {
    const migratedAct = ALL_ACTIVITIES.find(a => a.id === migrated[0]);
    if (migratedAct) return migratedAct.title;
  }
  return idOrTitle;
}

// ─── Simple prep card renderer (for content area) ────────────────────────────

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
          <span className="text-purple-500 flex-shrink-0">&bull;</span>
          <span>{rendered.map((r) => typeof r === 'string' ? r.replace(/^- /, '') : r)}</span>
        </div>
      );
    }

    return <p key={i} className="text-sm text-gray-700">{rendered}</p>;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvitingTheMuseExercise() {
  const { state, setState, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [showAddCustom, setShowAddCustom] = React.useState(false);
  const [customInput, setCustomInput] = React.useState('');

  // Load IA-3-5 data
  const { data: ia35Data } = useWorkshopStepData<IA35StepData>('ia', 'ia-3-5', {
    selectedInterludes: [],
    responses: {},
    completed: [],
  });

  // Normalize ia_4_5 state
  const ia45 = state?.ia_4_5 ?? {};

  // Load ia-4-2 reframe data
  const reframeData = React.useMemo(() => {
    const ia42 = state?.ia_4_2;
    if (ia42?.new_perspective && (ia42?.challenge || ia42?.original_thought)) {
      return {
        challenge: (ia42.challenge ?? ia42.original_thought ?? '').toString(),
        reframe: ia42.new_perspective.toString(),
      };
    }
    return null;
  }, [state?.ia_4_2]);

  // One-time migration: clear old state shapes + migrate old activity IDs
  React.useEffect(() => {
    const data = state?.ia_4_5;
    if (!data) return;

    // Clear legacy shapes (action_steps, insight, newMuse, spark, capabilityReflection from old versions)
    if (Array.isArray((data as any).action_steps) || (data as any).insight !== undefined
      || (data as any).newMuse !== undefined || (data as any).spark !== undefined
      || (data as any).capabilityReflection !== undefined) {
      setState((prev) => ({ ...prev, ia_4_5: {} }));
      return;
    }

    // Migrate old known/curious format to checked format
    const inv = data.flowInventory;
    if (inv && ((inv as any).known || (inv as any).curious)) {
      const oldKnown: string[] = (inv as any).known || [];
      const oldCurious: string[] = (inv as any).curious || [];
      const merged = [...new Set([...oldKnown, ...oldCurious])];
      const migrated = migrateIds(merged);
      setState((prev) => ({
        ...prev,
        ia_4_5: {
          ...prev.ia_4_5,
          flowInventory: { checked: migrated, custom: inv.custom || [] },
          exploredActivity: data.exploredActivity && ID_MIGRATION[data.exploredActivity]
            ? ID_MIGRATION[data.exploredActivity][0]
            : data.exploredActivity,
        },
      }));
      return;
    }

    // Migrate old activity IDs in checked format
    if (inv?.checked) {
      const hasOldIds = inv.checked.some((id: string) => ID_MIGRATION[id]);
      if (hasOldIds) {
        setState((prev) => ({
          ...prev,
          ia_4_5: {
            ...prev.ia_4_5,
            flowInventory: { checked: migrateIds(inv.checked), custom: inv.custom || [] },
          },
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flow inventory state
  const flowInventory = ia45.flowInventory ?? { checked: [], custom: [] };
  const checkedIds: string[] = flowInventory.checked ?? [];
  const customActivities: string[] = flowInventory.custom ?? [];

  // Build list of completed M3 interludes
  const completedInterludes = React.useMemo(() => {
    if (!ia35Data?.completed?.length) return [];
    const allMap = Object.fromEntries(ALL_ACTIVITIES.map((p) => [p.id, p.title]));
    return ia35Data.completed.map((id) => ({
      id,
      title: allMap[id] ?? id,
      response: ia35Data.responses?.[id] ?? '',
    }));
  }, [ia35Data]);

  const completedM3Ids = React.useMemo(() => completedInterludes.map(i => i.id), [completedInterludes]);
  const hasInterludes = completedInterludes.length > 0;

  // Primary original muse = first completed interlude
  const primaryOriginalMuse = completedInterludes[0] ?? null;

  // Whether the modal exercise is done
  const isModalDone = Boolean(ia45.prepCard);

  // Simple chip toggle: checked or not
  const handleChipToggle = (id: string) => {
    const nextChecked = checkedIds.includes(id)
      ? checkedIds.filter(k => k !== id)
      : [...checkedIds, id];

    setState((prev) => ({
      ...prev,
      ia_4_5: {
        ...prev.ia_4_5,
        flowInventory: { custom: customActivities, checked: nextChecked },
      },
    }));
    setTimeout(() => saveNow(), 0);
  };

  const addCustomActivity = () => {
    const trimmed = customInput.trim();
    if (!trimmed || customActivities.includes(trimmed)) return;
    const next = [...customActivities, trimmed];
    setState((prev) => ({
      ...prev,
      ia_4_5: {
        ...prev.ia_4_5,
        flowInventory: { ...flowInventory, custom: next },
      },
    }));
    setCustomInput('');
    setShowAddCustom(false);
    setTimeout(() => saveNow(), 0);
  };

  const removeCustomActivity = (activity: string) => {
    const next = customActivities.filter(a => a !== activity);
    const nextChecked = checkedIds.filter(k => k !== activity);
    setState((prev) => ({
      ...prev,
      ia_4_5: {
        ...prev.ia_4_5,
        flowInventory: { custom: next, checked: nextChecked },
        exploredActivity: prev.ia_4_5?.exploredActivity === activity ? undefined : prev.ia_4_5?.exploredActivity,
      },
    }));
    setTimeout(() => saveNow(), 0);
  };

  // Select activity to explore
  const selectExploredActivity = (id: string) => {
    setState((prev) => ({
      ...prev,
      ia_4_5: { ...prev.ia_4_5, exploredActivity: id },
    }));
    setTimeout(() => saveNow(), 0);
  };

  // Select capture practice (post-modal)
  const selectCapturePractice = (id: string) => {
    setState((prev) => ({
      ...prev,
      ia_4_5: { ...prev.ia_4_5, capturePractice: id, capturePracticeCustom: id === 'other' ? prev.ia_4_5?.capturePracticeCustom : undefined },
    }));
    setTimeout(() => saveNow(), 0);
  };

  // All checked items available for AI exploration
  const explorableItems = React.useMemo(() => {
    const items: { id: string; title: string }[] = [];
    for (const id of checkedIds) {
      const found = ALL_ACTIVITIES.find(a => a.id === id);
      if (found) items.push({ id: found.id, title: found.title });
      else if (customActivities.includes(id)) items.push({ id, title: id });
    }
    return items;
  }, [checkedIds, customActivities]);

  // Handle modal completion
  const handleModalComplete = (result: MuseResult) => {
    setState((prev) => ({
      ...prev,
      ia_4_5: {
        ...prev.ia_4_5,
        anchor: result.anchor,
        prepCard: result.prepCard,
        transcript: result.transcript,
        last_updated: new Date().toISOString(),
      },
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  };

  // Handle re-exploring
  const handleExploreAnother = () => {
    setState((prev) => ({
      ...prev,
      ia_4_5: {
        ...prev.ia_4_5,
        exploredActivity: undefined,
        anchor: undefined,
        prepCard: undefined,
        transcript: undefined,
        selectedCoachingLines: undefined,
        coachingReaction: undefined,
        capturePractice: undefined,
        capturePracticeCustom: undefined,
      },
    }));
  };

  // Coaching lines parsed from prep card
  const coachingLines = React.useMemo(() => {
    if (!ia45.prepCard) return [];
    return parseCoachingLines(ia45.prepCard);
  }, [ia45.prepCard]);

  const selectedCoachingLines: string[] = Array.isArray(ia45.selectedCoachingLines) ? ia45.selectedCoachingLines : [];

  const toggleCoachingLine = (id: string) => {
    const next = selectedCoachingLines.includes(id)
      ? selectedCoachingLines.filter(l => l !== id)
      : [...selectedCoachingLines, id];
    setState((prev) => ({
      ...prev,
      ia_4_5: { ...prev.ia_4_5, selectedCoachingLines: next },
    }));
    setTimeout(() => saveNow(), 0);
  };

  // Completion gate: tag + at least 1 coaching line tapped + capture practice selected
  const isComplete =
    Boolean(ia45.tag) &&
    selectedCoachingLines.length >= 1 &&
    Boolean(ia45.capturePractice);

  // Auto-mark complete
  React.useEffect(() => {
    if (isModalDone && isComplete && !ia45.completed) {
      setState((prev) => ({
        ...prev,
        ia_4_5: { ...prev.ia_4_5, completed: true, last_updated: new Date().toISOString() },
      }));
      setTimeout(() => saveNow(), 0);
    }
  }, [isComplete, isModalDone, ia45.completed]);

  return (
    <>
      {/* ─── Section 1: The Concept (with M3 context woven in) ───────────── */}
      <div className="mb-6 p-5 border border-purple-200 rounded-lg bg-white">
        <p className="text-gray-700 leading-relaxed mb-3">
          Inspiration arrives through many doors. Some are about movement and rhythm. Some
          are about making something with your hands. Some are about stillness or rest. And
          some are about play and connection. What they share: they free your mind just
          enough that something deeper can surface.
        </p>

        {hasInterludes && (
          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              In the Inspiration step, you explored{' '}
              {completedInterludes.map((i, idx) => (
                <React.Fragment key={i.id}>
                  {idx > 0 && idx === completedInterludes.length - 1 ? ' and ' : idx > 0 ? ', ' : ''}
                  <strong className="text-purple-700">{i.title}</strong>
                </React.Fragment>
              ))}:
            </p>
            {completedInterludes.map((i) => (
              <p key={i.id} className="text-xs text-gray-600 italic ml-3 mb-1">
                &ldquo;{i.response.length > 120 ? i.response.slice(0, 120) + '...' : i.response}&rdquo;
              </p>
            ))}
            <p className="text-sm text-gray-600 mt-2">
              Below, those pathways are broken into concrete activities &mdash; along with many
              others. Mark the ones that free your mind.
            </p>
          </div>
        )}

        <p className="text-purple-700 italic leading-relaxed">
          &ldquo;Inspiration isn&rsquo;t just a feeling. It&rsquo;s a full brain event. Your mind wanders,
          your focus sharpens, and meaning lights up.&rdquo;
        </p>
      </div>

      {/* ─── Section 2: Activity Chips ─────────────────────────────────────── */}
      {!isModalDone && (
        <>
          <div className="mb-6 p-5 bg-white border-2 border-purple-300 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-1">Inviting the Muse</h3>
            <p className="text-sm text-gray-600 mb-2">
              Which of these activities free your mind? Tap the ones that are yours.
            </p>

            <div className="space-y-4 mt-4">
              {FLOW_CATEGORIES.map((category) => (
                <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                    {category.label}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.activities.map((act) => {
                      const isChecked = checkedIds.includes(act.id);
                      const isM3 = act.m3Source ? completedM3Ids.includes(act.m3Source) : false;
                      return (
                        <button
                          key={act.id}
                          onClick={() => handleChipToggle(act.id)}
                          title={act.hint || ''}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                            isChecked
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {act.title}
                          {isM3 && <span className="ml-1 text-[10px] bg-purple-200 text-purple-700 px-1 rounded">M3</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Custom activities */}
              {customActivities.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">
                    Your additions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customActivities.map((activity) => {
                      const isChecked = checkedIds.includes(activity);
                      return (
                        <div key={activity} className="flex items-center gap-1">
                          <button
                            onClick={() => handleChipToggle(activity)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {activity}
                          </button>
                          <button
                            onClick={() => removeCustomActivity(activity)}
                            className="text-gray-400 hover:text-red-500 p-0.5"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add your own */}
            {showAddCustom ? (
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Type an activity..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomActivity()}
                  autoFocus
                />
                <Button size="sm" onClick={addCustomActivity} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setShowAddCustom(false); setCustomInput(''); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCustom(true)}
                className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 mt-3"
              >
                <Plus className="w-4 h-4" />
                Add your own
              </button>
            )}
          </div>

          {/* ─── Section 3: The Process ────────────────────────────────────── */}
          <div className="mb-6 p-5 border border-purple-200 rounded-lg bg-white">
            <h3 className="text-base font-semibold text-purple-800 mb-3">
              The Process: Review &rarr; Seed &rarr; Activity &rarr; Capture
            </h3>

            <p className="text-gray-700 leading-relaxed mb-3">
              Mind-freeing activities are most powerful when you walk in with a seed &mdash;
              something you&rsquo;ve been working on that you want your background thinking
              to process. You don&rsquo;t try to solve it. You just review it, hold it lightly,
              then let the activity do its work.
            </p>

            {reframeData ? (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg mb-3">
                <p className="text-sm text-gray-600 mb-2">In the Guided Reframe, you shifted:</p>
                <p className="text-sm text-gray-800 mb-1">
                  <span className="text-gray-500">From:</span>{' '}
                  <em>&ldquo;{reframeData.challenge}&rdquo;</em>
                </p>
                <p className="text-sm text-gray-800">
                  <span className="text-purple-600 font-medium">To:</span>{' '}
                  <strong className="text-purple-700">&ldquo;{reframeData.reframe}&rdquo;</strong>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  That reframe is your seed. AI will help you carry it into the activity you pick.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                <p className="text-sm text-gray-600">
                  You&rsquo;ll choose what to carry in when you talk to AI &mdash; a question, a problem,
                  or anything that hasn&rsquo;t settled yet.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">Review</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">Seed</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">Activity</span>
              <span className="text-gray-400">&rarr;</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">Capture</span>
            </div>
          </div>

          {/* ─── Section 4: Pick One to Explore ────────────────────────────── */}
          <div className="mb-6 p-5 bg-white border border-purple-200 rounded-lg">
            <h3 className="text-base font-semibold text-purple-800 mb-1">Pick one to explore</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pick any activity you checked &mdash; AI will help you prepare to walk into it with your seed.
            </p>

            {explorableItems.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">
                  Check at least one activity above to continue.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {explorableItems.map(({ id, title }) => (
                  <button
                    key={id}
                    onClick={() => selectExploredActivity(id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      ia45.exploredActivity === id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Section 5: Orientation + Launch ───────────────────────────── */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 mb-4 max-w-lg mx-auto">
              AI will check your seed, ask a couple of practical questions about this activity,
              then give you a preparation card &mdash; complete with capability coaching and a capture plan.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              disabled={!ia45.exploredActivity}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-8 py-4 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Prepare with AI
            </Button>
          </div>
        </>
      )}

      {/* ─── Post-Modal Content ────────────────────────────────────────── */}
      {isModalDone && (
        <>
          {/* a. Your Preparation Card (centerpiece) */}
          {ia45.prepCard && (
            <div className="mb-5 p-5 bg-white border-2 border-purple-400 rounded-lg shadow-sm">
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-3">
                Your Preparation Card
              </h3>
              <div className="space-y-1.5">
                {renderPrepCardContent(ia45.prepCard)}
              </div>
            </div>
          )}

          {/* b. Coaching Lines — tappable capability coaching from prep card */}
          {coachingLines.length > 0 && (
            <div className="mb-5 p-4 bg-white border-2 border-purple-300 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-1">Which coaching struck you?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Tap the line(s) you want to carry with you into this activity.
              </p>

              <div className="space-y-2 mb-4">
                {coachingLines.map((line) => {
                  const colors = CAPABILITY_COLORS[line.id] ?? CAPABILITY_COLORS.imagination;
                  const isSelected = selectedCoachingLines.includes(line.id);
                  return (
                    <button
                      key={line.id}
                      onClick={() => toggleCoachingLine(line.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 ${
                        isSelected
                          ? `${colors.activeBg} ${colors.activeBorder} shadow-sm`
                          : `${colors.bg} ${colors.border} hover:shadow-sm`
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${colors.border}`} />
                        )}
                      </div>
                      <div>
                        <span className={`font-semibold ${colors.text}`}>{line.capability}:</span>{' '}
                        <span className="text-sm text-gray-700">{line.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional reaction */}
              <div className="mt-3">
                <label className="block text-sm italic text-gray-500 mb-2">
                  What about this struck you?
                </label>
                <Textarea
                  rows={2}
                  className="resize-y text-sm"
                  placeholder="Optional — just if something came to mind..."
                  value={ia45.coachingReaction ?? ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      ia_4_5: { ...prev.ia_4_5, coachingReaction: e.target.value },
                    }))
                  }
                  onBlur={() => saveNow()}
                />
              </div>
            </div>
          )}

          {/* c. Capture Practice Selector (AFTER modal) */}
          <div className="mb-5 p-4 bg-white border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">Your Capture Practice</h3>
            <p className="text-sm text-gray-600 mb-3">
              The prep card recommended a capture method for this activity. Pick the one you&rsquo;ll actually use:
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {CAPTURE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectCapturePractice(opt.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    ia45.capturePractice === opt.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            {ia45.capturePractice === 'other' && (
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3"
                placeholder="Describe your capture method..."
                value={ia45.capturePracticeCustom ?? ''}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, ia_4_5: { ...prev.ia_4_5, capturePracticeCustom: e.target.value } }))
                }
                onBlur={() => saveNow()}
              />
            )}
          </div>

          {/* d. What You Just Did */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What You Just Did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You just practiced the full loop: review what you&rsquo;re working on, seed it into
              a mind-freeing activity, and prepare to capture what surfaces.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">
              <strong>Review &rarr; Seed &rarr; Activity &rarr; Capture.</strong> That&rsquo;s the process.
              Use it anytime you want inspiration to work on something real.
            </p>
          </div>

          {/* e. Your Flow Inventory (takeaway artifact) */}
          <div className="mb-5 p-4 bg-white border-2 border-purple-300 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800 mb-3">Your Flow Inventory</h3>
            <div className="space-y-2">
              {FLOW_CATEGORIES.map((category) => {
                const checkedActivities = category.activities.filter(
                  act => checkedIds.includes(act.id)
                );
                if (checkedActivities.length === 0) return null;
                return (
                  <div key={category.id} className="text-sm">
                    <span className="font-medium text-purple-700">{category.label}:</span>{' '}
                    {checkedActivities.map((act, idx) => (
                      <React.Fragment key={act.id}>
                        {idx > 0 && ', '}
                        <span className="text-gray-800">
                          {act.title}
                          {ia45.exploredActivity === act.id && (
                            <span className="ml-1 text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">prepared</span>
                          )}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
              {/* Custom activities in inventory */}
              {(() => {
                const checkedCustom = customActivities.filter(
                  act => checkedIds.includes(act)
                );
                if (checkedCustom.length === 0) return null;
                return (
                  <div className="text-sm">
                    <span className="font-medium text-purple-700">Your additions:</span>{' '}
                    {checkedCustom.map((act, idx) => (
                      <React.Fragment key={act}>
                        {idx > 0 && ', '}
                        <span className="text-gray-800">
                          {act}
                          {ia45.exploredActivity === act && (
                            <span className="ml-1 text-xs text-purple-600 bg-purple-100 px-1 py-0.5 rounded">prepared</span>
                          )}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* f. Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What did this exercise give you?</h3>
            <div className="grid grid-cols-1 gap-2">
              {TAG_OPTIONS.map(({ value, label, helper }) => (
                <label
                  key={value}
                  className={`flex items-start gap-2 cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    ia45.tag === value
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tag45"
                    value={value}
                    checked={ia45.tag === value}
                    onChange={() => {
                      setState((prev) => ({ ...prev, ia_4_5: { ...prev.ia_4_5, tag: value } }));
                      setTimeout(() => saveNow(), 0);
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{label}</div>
                    <div className="text-xs text-gray-500">{helper}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Completion hint */}
          {!isComplete && (
            <p className="mb-4 text-xs font-semibold text-amber-600 flex items-center gap-1">
              <span>&#9888;</span> Required to continue: select a tag, tap at least one coaching line, and choose a capture practice.
            </p>
          )}

          {/* g. Optional Action Step */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">When will you try this process? (optional)</h3>
            <p className="text-xs text-gray-500 mb-3">
              Pick an activity and a time. Not required to complete the exercise.
            </p>
            <Textarea
              rows={2}
              className="text-sm resize-y mb-2"
              placeholder="One step that feels connected to what you prepared for..."
              value={ia45.actionStep ?? ''}
              onChange={(e) =>
                setState((prev) => ({ ...prev, ia_4_5: { ...prev.ia_4_5, actionStep: e.target.value } }))
              }
              onBlur={() => saveNow()}
            />
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Timeframe (e.g., 'this week', 'tomorrow morning')"
              value={ia45.actionTimeframe ?? ''}
              onChange={(e) =>
                setState((prev) => ({ ...prev, ia_4_5: { ...prev.ia_4_5, actionTimeframe: e.target.value } }))
              }
              onBlur={() => saveNow()}
            />
          </div>

          {/* Explore another activity */}
          <div className="text-center mb-6">
            <Button
              onClick={handleExploreAnother}
              variant="outline"
              className="border-purple-300 text-purple-600 hover:bg-purple-50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Explore Another Activity
            </Button>
          </div>
        </>
      )}

      {/* ─── Example Section ─────────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-amber-800 mb-3">&#128161; Example</h4>
        <div className="space-y-3 text-amber-800 text-sm">
          <div>
            <strong>Activity:</strong> Cooking or baking
          </div>
          <div>
            <strong>Seed:</strong> A reframe about a stuck project at work
          </div>
          <div className="bg-amber-100 rounded p-3 space-y-2">
            <p><strong>AI:</strong> <em>&ldquo;You&rsquo;ve been working with this reframe about your stuck project &mdash; good seed for cooking. Quick question: recipes or improvise?&rdquo;</em></p>
            <p><strong>Participant:</strong> <em>&ldquo;Usually recipes, but I freestyle with stir fry.&rdquo;</em></p>
            <p><strong>AI:</strong> <em>Delivers preparation card with seed, practical advice (try freestyle tonight), capability coaching, and capture reminder.</em></p>
          </div>
          <div>
            <strong>Tag:</strong> A practice
          </div>
        </div>
      </div>

      {/* ─── Modal ───────────────────────────────────────────────────────── */}
      <InvitingTheMuseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        originalMuse={primaryOriginalMuse}
        chosenActivity={ia45.exploredActivity ? getActivityTitle(ia45.exploredActivity) : ''}
        reframeData={reframeData}
        onComplete={handleModalComplete}
      />
    </>
  );
}
