import React from 'react';
import { useQuery } from '@tanstack/react-query';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideoByStepId } from '@/hooks/use-videos';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface IA51ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

const CAPABILITY_COLORS: Record<CapabilityKey, string> = {
  imagination: '#8b5cf6',
  curiosity:   '#3b82f6',
  caring:      '#10b981',
  creativity:  '#f59e0b',
  courage:     '#ef4444',
};

const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  imagination: 'Imagination',
  curiosity:   'Curiosity',
  caring:      'Caring',
  creativity:  'Creativity',
  courage:     'Courage',
};

function Dots({ count, color }: { count: number; color: string }) {
  const filled = Math.min(Math.round(count), 4);
  return (
    <div className="flex gap-1 justify-center">
      {[0, 1, 2, 3].map(i => (
        <span
          key={i}
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: i < filled ? color : '#e5e7eb' }}
        />
      ))}
    </div>
  );
}

function MovementIndicator({ solo, ai }: { solo: number; ai: number }) {
  const diff = ai - solo;
  if (diff >= 2) return <span className="text-green-600 font-bold text-lg">↑↑</span>;
  if (diff >= 1) return <span className="text-green-500 font-bold text-lg">↑</span>;
  if (diff <= -1) return <span className="text-gray-400 font-bold text-lg">↓</span>;
  return <span className="text-amber-500 font-bold text-lg">→</span>;
}

const IA_5_1_Content: React.FC<IA51ContentProps> = ({ onNext }) => {
  const { data: videoData, isLoading: videoLoading } = useVideoByStepId('ia', 'ia-5-1');

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (videoData) console.log('🎬 IA-5-1 Video found:', videoData.title);
    else if (!videoLoading) console.log('🎬 IA-5-1 No video data found for step ia-5-1');
  }, [videoData, videoLoading]);

  // Fetch activation snapshot
  const { data: snapshotResponse, isLoading: snapshotLoading } = useQuery({
    queryKey: ['/api/ia/activation-snapshot'],
    queryFn: async () => {
      const res = await fetch('/api/ia/activation-snapshot', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const snapshot = snapshotResponse?.snapshot;
  const prism: Record<CapabilityKey, number> | null = snapshot?.prism ?? null;
  const soloActivations: Record<CapabilityKey, number> = snapshot?.soloActivations ?? { imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0 };
  const aiActivations: Record<CapabilityKey, number> = snapshot?.aiActivations ?? { imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0 };
  const completeness = snapshot?.completeness;

  const RungPreview: React.FC<{ n: 1 | 2 | 3 | 4 | 5 }> = ({ n }) => (
    <div className="flex items-center gap-2 md:gap-3">
      <img
        src={`/assets/solo_rung${n}_split.png`}
        alt={`Rung ${n} Solo`}
        className="h-12 w-24 sm:h-14 sm:w-28 md:h-20 md:w-40 lg:h-24 lg:w-48 xl:h-28 xl:w-56 object-contain"
      />
      <span className="text-muted-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl">→</span>
      <img
        src={`/assets/adv_rung${n}_split.png`}
        alt={`Rung ${n} ADV`}
        className="h-12 w-24 sm:h-14 sm:w-28 md:h-20 md:w-40 lg:h-24 lg:w-48 xl:h-28 xl:w-56 object-contain"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Outcomes and Benefits
      </h1>

      {/* Video Section */}
      <VideoTranscriptGlossary
        youtubeId={videoData?.url ? extractYouTubeId(videoData.url) : undefined}
        title={videoData?.title || "Outcomes and Benefits Overview"}
        transcriptMd={null}
        glossary={null}
      />

      {/* ── Activation Snapshot Card ───────────────────────────────────────── */}
      <Card className="mb-8 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl text-purple-800">Your Activation Snapshot</CardTitle>
          <p className="text-sm text-gray-600">
            Your Prism showed your capabilities as you understood them at the start.
            The Activation columns show which capabilities you drew on — first working
            solo, then in partnership with AI. Notice where the pattern shifted.
          </p>
        </CardHeader>

        <CardContent>
          {snapshotLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
              <span className="text-gray-600">Loading your snapshot…</span>
            </div>
          ) : (
            <>
              {!completeness?.hasPrism && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                  Complete the I4C Self-Assessment (Module 2) to see your Prism scores.
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-28">Capability</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 w-20">Prism</th>
                      <th className="text-center py-2 px-3 font-semibold text-purple-700 w-24">Solo</th>
                      <th className="text-center py-2 px-3 font-semibold text-indigo-700 w-28">AI-Partnered</th>
                      <th className="text-center py-2 px-3 font-semibold text-gray-700 w-20">Movement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAPABILITIES.map(cap => (
                      <tr key={cap} className="border-b border-gray-100">
                        <td className="py-3 pr-4">
                          <span className="font-medium" style={{ color: CAPABILITY_COLORS[cap] }}>
                            {CAPABILITY_LABELS[cap]}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {prism
                            ? <span className="text-gray-700 font-mono text-sm">{prism[cap].toFixed(1)}</span>
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Dots count={soloActivations[cap]} color="#8b5cf6" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Dots count={aiActivations[cap]} color="#6366f1" />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <MovementIndicator
                            solo={soloActivations[cap]}
                            ai={aiActivations[cap]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Completeness notes */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                {completeness && (
                  <>
                    <span>Solo: {completeness.soloStepsCompleted}/{completeness.soloStepsTotal} exercises tracked</span>
                    <span>·</span>
                    <span>AI: {completeness.aiStepsCompleted}/{completeness.aiStepsTotal} exercises tracked</span>
                  </>
                )}
              </div>

              {/* Dot legend */}
              <div className="mt-3 flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-purple-500" /> Solo activation
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-indigo-500" /> AI activation
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-200" /> Not activated
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Capstone Callout ─────────────────────────────────────────────────── */}
      {(snapshot?.capstoneVision || snapshot?.capstoneReflection) && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Your Capstone Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snapshot.capstoneVision && (
              <blockquote className="border-l-4 border-green-400 pl-4 text-green-800 italic">
                "{snapshot.capstoneVision}"
              </blockquote>
            )}
            {snapshot.capstoneReflection && (
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">What it required of you:</p>
                <p className="text-green-800 text-sm">{snapshot.capstoneReflection}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Interactive Outcomes & Benefits ────────────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-purple-700">Click each set of rungs to see some of the benefits.</h2>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {/* 1. AUTO-FLOW / PROMPT YOUR FLOW */}
          <AccordionItem value="item-1" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
                <RungPreview n={1} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="font-medium">AUTO-FLOW <span className="text-muted-foreground">→</span> PROMPT YOUR FLOW</div>
                    <div className="text-sm text-muted-foreground">Self-awareness and spontaneous expression</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Psychological Benefits</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Enhances emotional self-awareness and presence.</li>
                        <li>Builds confidence in spontaneous creative expression and reflective noticing.</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Neurocognitive Growth</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Strengthens salience network, attentional control, and metacognitive switching.</li>
                        <li>Improves fluid recall and pattern interruption.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 2. VISUALIZATION / STRETCH POTENTIAL */}
          <AccordionItem value="item-2" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
                <RungPreview n={2} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="font-medium">VISUALIZATION <span className="text-muted-foreground">→</span> STRETCH POTENTIAL</div>
                    <div className="text-sm text-muted-foreground">Symbolic thinking and inner clarity</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Psychological Benefits</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Activates self-symbolization.</li>
                        <li>Deepens inner clarity and aspirational identity.</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Neurocognitive Growth</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Engages visual cortex and DMN to integrate imagery with executive planning.</li>
                        <li>Supports future scenario modeling.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 3. HIGHER PURPOSE / WORLD CHALLENGES */}
          <AccordionItem value="item-3" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
                <RungPreview n={3} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="font-medium">HIGHER PURPOSE <span className="text-muted-foreground">→</span> WORLD CHALLENGES</div>
                    <div className="text-sm text-muted-foreground">Coherence between values and vision</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Psychological Benefits</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Fosters coherence between values and vision.</li>
                        <li>Builds a moral and motivational compass.</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Neurocognitive Growth</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Enhances theory of mind, empathy circuits, and long-range goal scaffolding.</li>
                        <li>Activates moral reasoning networks.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 4. INSPIRATION / INVITING THE MUSE */}
          <AccordionItem value="item-4" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
                <RungPreview n={4} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="font-medium">INSPIRATION <span className="text-muted-foreground">→</span> INVITING THE MUSE</div>
                    <div className="text-sm text-muted-foreground">Openness and meaningful resonance</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Psychological Benefits</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Amplifies openness and intrinsic motivation.</li>
                        <li>Strengthens affective resonance with aesthetic and meaningful experiences.</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Neurocognitive Growth</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Stimulates dopaminergic novelty response and limbic-affective integration.</li>
                        <li>Engages right-hemisphere associative networks.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* 5. UNIMAGINED / WHAT IF... */}
          <AccordionItem value="item-5" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              <div className="flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
                <RungPreview n={5} />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="font-medium">UNIMAGINED <span className="text-muted-foreground">→</span> WHAT IF...</div>
                    <div className="text-sm text-muted-foreground">Tolerating ambiguity; visionary expression</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">Psychological Benefits</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Builds tolerance for ambiguity and deepens existential awareness.</li>
                        <li>Encourages visionary expression and meaning-making.</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">Neurocognitive Growth</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Activates integration across DMN, limbic, and executive systems.</li>
                        <li>Enhances generative ideation and transcendent cognition.</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Framework Overview */}
      <div className="mt-8 bg-white rounded-xl border p-6">
        <h3 className="text-xl font-semibold mb-3">Framework Overview</h3>
        <ol className="list-decimal pl-6 space-y-1 text-sm">
          <li><strong>AUTO-FLOW → PROMPT YOUR FLOW</strong>: Building foundational self-awareness</li>
          <li><strong>VISUALIZATION → STRETCH POTENTIAL</strong>: Developing symbolic thinking capabilities</li>
          <li><strong>HIGHER PURPOSE → WORLD CHALLENGES</strong>: Cultivating social responsibility</li>
          <li><strong>INSPIRATION → INVITING THE MUSE</strong>: Enhancing overall well-being</li>
          <li><strong>UNIMAGINED → WHAT IF...</strong>: Achieving meta-cognitive transcendence</li>
        </ol>
      </div>
    </div>
  );
};

export default IA_5_1_Content;
