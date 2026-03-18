import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA_4_6_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
interface IA46StepData {
  whatIf: string;
  processReflection: string;
  // Legacy fields so old data doesn't break on load
  vision?: string;
  wordCount?: number;
  capstone_reflection?: string;
}

// Activity ID → display title lookup (mirrored from AdvancedInspirationExercise)
const ACTIVITY_TITLES: Record<string, string> = {
  nature: 'Walking in nature',
  walking: 'Walking or hiking',
  running: 'Running or exercise',
  swimming: 'Swimming or being in water',
  driving: 'Driving alone',
  'painting-drawing': 'Painting, drawing, or clay',
  cooking: 'Cooking or baking',
  gardening: 'Gardening',
  doodling: 'Doodling or sketching',
  'playing-music': 'Playing music',
  puzzles: 'Puzzles or jigsaw',
  meditating: 'Meditating',
  napping: 'Napping',
  'sitting-outdoors': 'Sitting quietly outdoors',
  showering: 'Showering or bathing',
  dishes: 'Doing dishes or housework',
  writing: 'Writing without a plan',
  reading: 'Reading something absorbing',
  learning: 'Trying something new',
  'collecting-images': 'Collecting inspiring images',
  photography: 'Photography or noticing details',
  'galleries-music': 'Live music, galleries, or film',
  building: 'Building (Lego, blocks, models)',
  'being-playful': 'Being silly or playful',
  games: 'Card or board games',
  friends: 'Hanging out with friends or colleagues',
};

function resolveActivityTitle(id: string): string {
  return ACTIVITY_TITLES[id] || id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
}

const IA_4_6_Content: React.FC<IA_4_6_ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();

  const initialData: IA46StepData = {
    whatIf: '',
    processReflection: '',
  };

  const { data, updateData, saving, loaded, saveNow } = useWorkshopStepData('ia', 'ia-4-6', initialData);

  // Rung 1-4 read-only data
  const [rungData, setRungData] = useState<{
    ia42: any; ia43: any; ia44: any; ia45: any; loading: boolean;
  }>({ ia42: null, ia43: null, ia44: null, ia45: null, loading: true });

  // Display/edit mode for whatIf
  const [isEditing, setIsEditing] = useState(true);

  // Fetch prior exercise data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r42, r43, r44, r45] = await Promise.all([
          fetch('/api/workshop-data/step/ia/ia-4-2', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-3', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-4', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-5', { credentials: 'include' }).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        setRungData({
          ia42: r42?.data ?? null,
          ia43: r43?.data ?? null,
          ia44: r44?.data ?? null,
          ia45: r45?.data ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) setRungData(prev => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When data loads from DB, if whatIf already exists show display mode
  useEffect(() => {
    if (loaded && data.whatIf?.trim()) {
      setIsEditing(false);
    }
  }, [loaded]);

  const handleSave = async () => {
    try {
      await saveNow();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const wordCount = data.whatIf.trim() ? data.whatIf.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

  // Demo data
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) return;
    updateData({
      whatIf: "What if the fear people feel about AI displacement is actually the signal that tells us exactly who needs to be at the table shaping these systems \u2014 and what if we built that table?",
      processReflection: "The reframe and the bridge were saying the same thing from different angles. I didn't see that until they were side by side.",
    });
  };

  // Journey card config
  const journeyCards = [
    {
      label: 'The Reframe',
      content: rungData.ia42?.new_perspective,
    },
    {
      label: 'The Bigger Vision',
      title: rungData.ia43?.new_title,
      content: rungData.ia43?.story,
    },
    {
      label: 'The Global Connection',
      content: rungData.ia44?.reframed_view,
    },
    {
      label: 'The Practice',
      content: rungData.ia45
        ? [
            rungData.ia45.exploredActivity ? resolveActivityTitle(rungData.ia45.exploredActivity) : null,
            rungData.ia45.anchor,
          ].filter(Boolean).join(' \u2014 ')
        : null,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* A. Page Title */}
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Nothing is Unimaginable
      </h1>

      {/* B. Rung Graphic + Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img
              src="/assets/ADV_Rung5.png"
              alt="Advanced Rung 5: Unlimited Vision"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('\u2705 ADV Rung 5 graphic loaded successfully')}
              onError={(e) => {
                console.error('\u274c Failed to load ADV Rung 5 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <div className="text-gray-700 space-y-2 mb-4">
            <p>You've climbed the Ladder of Imagination.</p>
            <p>You've reframed, stretched, bridged, and invited the muse.</p>
            <p className="font-medium">
              Now look across everything you've built &mdash; and see what emerges.
            </p>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              From Mastery to Vision: See what only you can see.
            </p>
            <p className="text-purple-700 text-center mt-2 font-semibold">
              No tools. No AI. Just your voice and vision, awakened.
            </p>
          </div>
        </div>
      </div>

      {/* C. Your Four Rungs — Read-Only Journey Cards */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Your Four Rungs</h2>

        {rungData.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-5">
                <div className="h-3 bg-purple-100 rounded w-24 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journeyCards.map((card) => {
              const hasContent = card.title || card.content;
              return (
                <div
                  key={card.label}
                  className="border border-purple-100 bg-purple-50/30 rounded-lg p-5"
                >
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                    {card.label}
                  </p>
                  {hasContent ? (
                    <div>
                      {card.title && (
                        <p className="text-sm font-medium text-gray-800 mb-1">{card.title}</p>
                      )}
                      {card.content && (
                        <p className={`text-sm text-gray-700 leading-relaxed ${card.title ? 'text-gray-500' : ''}`}>
                          {card.content.length > 200 ? card.content.slice(0, 200).replace(/\s+\S*$/, '') + '\u2026' : card.content}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Not yet completed</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* D–G: Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">

          {/* D. Your What If — Synthesis Input */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">
              Your &ldquo;What If&rdquo;
            </h4>
            <p className="text-blue-700 text-sm mb-4">
              You've reframed a challenge, stretched a vision, connected your purpose to the world, and found where the muse lives.
              <br /><br />
              Looking across all four &mdash; what's the &ldquo;What If&rdquo; that emerges when you hold them together?
            </p>

            {isEditing ? (
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    placeholder="What if..."
                    value={data.whatIf}
                    onChange={(e) => updateData({ whatIf: e.target.value })}
                    className="w-full h-32 resize-none"
                  />
                  {wordCount > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center pt-2">
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                    disabled={!data.whatIf.trim() || saving}
                  >
                    {saving ? 'Saving\u2026' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <blockquote className="border-l-4 border-purple-400 pl-5 py-3 bg-purple-50 rounded-r-lg">
                  <p className="text-purple-900 italic text-lg leading-relaxed">{data.whatIf}</p>
                </blockquote>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* E. No AI Callout */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-700 text-sm font-medium">
              <strong>Important:</strong> Do not use AI to support or generate your ideas.<br />
              This is about your <strong>own</strong> inner vision.
            </p>
          </div>

          {/* F. Process Reflection */}
          {data.whatIf.trim() && !isEditing && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-indigo-800 mb-3">
                Reflect on the Process
              </h4>
              <label className="block text-indigo-700 text-sm mb-3">
                What did you notice while looking across your own work?
              </label>
              <Textarea
                placeholder="What stood out, surprised you, or connected..."
                value={data.processReflection || ''}
                onChange={(e) => updateData({ processReflection: e.target.value })}
                className="w-full h-24 resize-none"
              />
            </div>
          )}

          {/* G. Closing */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">CLOSING</h4>
            <div className="text-purple-700 space-y-2">
              <p>You've crossed the threshold.</p>
              <p>You've glimpsed who you are when imagination becomes courage.</p>
              <p className="font-medium">There is no final answer&mdash;only a deeper beginning.</p>
              <p className="text-xl font-semibold">Thank you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* H. Continue + Demo Buttons */}
      <div className="flex justify-end items-center gap-3 mt-8">
        {shouldShowDemoButtons && (
          <Button
            variant="outline"
            size="sm"
            onClick={fillWithDemoData}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Demo Data
          </Button>
        )}
        <Button
          onClick={() => onNext && onNext('ia-4-7')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue &rarr;
        </Button>
      </div>
    </div>
  );
};

export default IA_4_6_Content;
