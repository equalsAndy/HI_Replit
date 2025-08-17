import React from 'react';
import { VideoPlayer } from '@/components/content/VideoPlayer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IA51ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_1_Content: React.FC<IA51ContentProps> = ({ onNext }) => {
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
      
      {/* Video Section using VideoPlayer component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-5-1"
          title="Outcomes and Benefits Overview"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Interactive Outcomes & Benefits */}
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
