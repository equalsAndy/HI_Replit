import React from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import { useVideosByStepId } from '@/hooks/use-videos';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import CapabilityMatrix from '../CapabilityMatrix';

interface IA51ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const IA_5_1_Content: React.FC<IA51ContentProps> = ({ onNext }) => {
  const { data: videosData, isLoading: videoLoading } = useVideosByStepId('ia', 'ia-5-1');
  const [introVideo, matrixVideo] = videosData ?? [];

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  React.useEffect(() => {
    if (introVideo) console.log('🎬 IA-5-1 Video 1 found:', introVideo.title);
    if (matrixVideo) console.log('🎬 IA-5-1 Video 2 found:', matrixVideo.title);
    if (!videoLoading && !introVideo) console.log('🎬 IA-5-1 No videos found for step ia-5-1');
  }, [introVideo, matrixVideo, videoLoading]);

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
  const pulseRanking: CapabilityKey[] | null = snapshot?.pulseRanking ?? null;
  const soloExercises = snapshot?.soloExercises ?? [];
  const aiExercises = snapshot?.aiExercises ?? [];
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
        Your Capability Matrix
      </h1>

      {/* Video 1: Introduction to Module 5 */}
      <VideoTranscriptGlossary
        youtubeId={introVideo?.url ? extractYouTubeId(introVideo.url) : undefined}
        title={introVideo?.title || "Introduction to Module 5"}
        transcriptMd={introVideo?.transcriptMd}
        glossary={introVideo?.glossary}
      />

      <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-2">
        Your Capability Matrix
      </h2>
      <p className="text-lg text-gray-600 mb-8">Each row is a capability. Each column is a different moment of noticing — from first instinct to AI-partnered exercises.</p>

      {/* Video 2: The Imaginal Agility Matrix */}
      <VideoTranscriptGlossary
        youtubeId={matrixVideo?.url ? extractYouTubeId(matrixVideo.url) : undefined}
        title={matrixVideo?.title || "The Imaginal Agility Matrix"}
        transcriptMd={matrixVideo?.transcriptMd}
        glossary={matrixVideo?.glossary}
      />

      {/* ── Capability Matrix ──────────────────────────────────────────────────── */}
      {snapshotLoading ? (
        <div className="flex justify-center items-center h-32 mb-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
          <span className="text-gray-600">Loading your snapshot…</span>
        </div>
      ) : (pulseRanking || prism || soloExercises.length > 0 || aiExercises.length > 0) ? (
        <CapabilityMatrix
          prism={prism}
          pulseRanking={pulseRanking}
          soloExercises={soloExercises}
          aiExercises={aiExercises}
          completeness={completeness}
        />
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          Complete the Capability Pulse (Module 2) or exercises (Modules 3–4) to see your Capability Matrix.
        </div>
      )}

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
        <div>
          <h2 className="text-2xl font-semibold text-purple-700 mb-1">Outcomes &amp; Benefits</h2>
          <p className="text-gray-600">Expand each rung pair to see what you gain from the progression — click the first one below to get started.</p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
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
                    <div className="font-medium">AUTO-FLOW <span className="text-muted-foreground">→</span> REFRAMING</div>
                    <div className="text-sm text-muted-foreground">Self-awareness and spontaneous expression</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">What You Gain</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Sharper awareness of your own thought patterns and automatic reactions</li>
                        <li>More confidence in spontaneous expression and reflective noticing</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">What Strengthens</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your ability to notice what matters and shift focus intentionally</li>
                        <li>Faster recall and the skill of interrupting unproductive patterns</li>
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
                    <div className="font-medium">VISUALIZATION <span className="text-muted-foreground">→</span> STRETCHING</div>
                    <div className="text-sm text-muted-foreground">Inner clarity and bigger vision</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">What You Gain</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Clearer sense of who you're becoming, not just who you are</li>
                        <li>Deeper connection between what you picture and what you plan</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">What Strengthens</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your ability to hold a mental image and build from it</li>
                        <li>The bridge between imagining a future and taking steps toward it</li>
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
                    <div className="font-medium">PURPOSE <span className="text-muted-foreground">→</span> GLOBAL BRIDGE</div>
                    <div className="text-sm text-muted-foreground">Connecting values to direction</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">What You Gain</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Stronger alignment between your values and your direction</li>
                        <li>A clearer sense of why your work matters beyond your immediate context</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">What Strengthens</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your ability to understand how others see a situation differently</li>
                        <li>Long-range thinking that connects personal purpose to broader impact</li>
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
                    <div className="text-sm text-muted-foreground">Openness and creative responsiveness</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">What You Gain</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>More openness to what excites and motivates you</li>
                        <li>Stronger connection between what inspires you and what you create</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">What Strengthens</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Your responsiveness to novelty and meaningful experience</li>
                        <li>The link between feeling moved by something and making something from it</li>
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
                    <div className="font-medium">UNIMAGINABLE <span className="text-muted-foreground">→</span> YOUR WHAT IF</div>
                    <div className="text-sm text-muted-foreground">Sitting with the unknown; finding your voice</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="outline" className="mb-2">What You Gain</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Greater comfort with not knowing and not having a plan</li>
                        <li>The ability to express a vision that doesn't have a roadmap yet</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-2">What Strengthens</Badge>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Integration across imagination, emotion, and decision-making</li>
                        <li>The capacity to think beyond what's currently possible</li>
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
          <li><strong>AUTO-FLOW → REFRAMING</strong>: Building self-awareness and the skill of seeing differently</li>
          <li><strong>VISUALIZATION → STRETCHING</strong>: Developing the ability to picture and pursue bigger possibilities</li>
          <li><strong>PURPOSE → GLOBAL BRIDGE</strong>: Connecting what drives you to what the world needs</li>
          <li><strong>INSPIRATION → INVITING THE MUSE</strong>: Strengthening your creative responsiveness</li>
          <li><strong>UNIMAGINABLE → YOUR WHAT IF</strong>: Learning to act from vision, not just from plans</li>
        </ol>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext?.('ia-5-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Choose Your Focus →
        </Button>
      </div>
    </div>
  );
};

export default IA_5_1_Content;
