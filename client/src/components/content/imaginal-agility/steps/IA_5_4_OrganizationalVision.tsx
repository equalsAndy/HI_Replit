import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { FileText } from 'lucide-react';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface IA54ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_4_Content: React.FC<IA54ContentProps> = ({ onNext }) => {
  // State for PDF viewer modal
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // Event handlers for PDF viewer
  const handleOpenPdfViewer = () => {
    setIsPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-4">
        Organizational Vision
      </h1>

      <p className="text-lg text-muted-foreground mb-8 italic">
        This final module is educational rather than directive. It is designed to help individual participants understand how organizational vision actually works — neurologically, socially, and systemically — without assuming they have the authority to create or implement it alone. Vision becomes actionable through teams, cohorts, and leadership processes explored beyond the individual experience.
      </p>

      {/* Core Concept */}
      <Card className="mb-8 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4 text-center">
            What is Organizational Vision?
          </h2>
          <p className="text-center text-lg mb-2">
            Organizational vision is not a statement or strategy. It is a living capacity shaped by how imagination, meaning, and agency are held collectively over time — especially in the age of AI.
          </p>
          <p className="text-center font-semibold text-purple-700 text-lg">
            People commit to futures they help imagine.
          </p>
        </CardContent>
      </Card>

      {/* Social Imagination Visual Language Carousel */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Social Imagination Visual Language
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Explore the visual grammar that maps neural and organizational dynamics across individual, team, and organizational scales.
        </p>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((pageNum) => (
              <CarouselItem key={pageNum}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-[16/9] items-center justify-center p-0">
                      <img
                        src={`/assets/social_media_lex/Social Media Visual Lexicon pptx_Page_${String(pageNum).padStart(2, '0')}.jpg`}
                        alt={`Visual Lexicon Page ${pageNum}`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Use the arrow buttons or keyboard arrows to navigate through the visual lexicon
        </p>
      </div>

      {/* Visual Grammar Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          A Shared Visual Grammar for Organizational Vision
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          These recurring visual forms map to real neural and organizational dynamics and operate consistently across individual, team, and organizational scales.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {[
            { name: 'Circle', placeholder: '○' },
            { name: 'Network', placeholder: '⊛' },
            { name: 'Path', placeholder: '—' },
            { name: 'Horizon', placeholder: '≡' },
            { name: 'Layers', placeholder: '≣' },
            { name: 'Convergence', placeholder: '▽' }
          ].map((item) => (
            <Card key={item.name} className="text-center p-4">
              <div className="text-4xl text-purple-600 mb-2">{item.placeholder}</div>
              <div className="text-sm font-medium">{item.name}</div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground italic">
          Note: Visual elements are placeholders and will be replaced with actual graphics.
        </p>
      </div>

      {/* Three Pillars Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-purple-700 mb-6 text-center">
          From Individual Insight to Collective Intent
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Vision does not live inside one mind. Shared meaning emerges between people through inter-brain synchrony. Participation is a neural requirement.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {/* The Brain Basis of Vision */}
          <AccordionItem value="brain-basis" className="border rounded-lg">
            <AccordionTrigger className="px-4 text-lg font-semibold">
              The Brain Basis of Vision
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <div className="mb-4 text-center">
                    <h3 className="font-medium text-lg mb-6">Vision as an Emergent Neurocognitive Capacity</h3>
                    <div className="flex justify-center items-center gap-6 my-6">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-teal-600 bg-white flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-700 text-center px-2">Default<br/>Network</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-teal-600 bg-white flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-700">Executive</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-teal-600 bg-white flex items-center justify-center">
                          <span className="text-sm font-semibold text-teal-700">Reward</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-4xl text-purple-600 mb-4 font-bold">↓</div>
                    <Badge className="bg-teal-600 text-white text-lg px-8 py-3 font-semibold">EMERGENCE</Badge>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Vision arises from three interacting brain systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Future simulation enables shared possibility</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Motivation sustains commitment over time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Vision fails when threat suppresses imagination</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Why Vision Must Be Distributed */}
          <AccordionItem value="distributed" className="border rounded-lg">
            <AccordionTrigger className="px-4 text-lg font-semibold">
              Why Vision Must Be Distributed
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Vision decays when centralized</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Teams translate vision into lived practice</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Middle layers sustain meaning over time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span>Distributed agency preserves adaptability</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm italic">
                      Vision becomes real through participation, not proclamation. Organizations succeed when vision flows through networks, not hierarchies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* Vision Across Time Horizons */}
          <AccordionItem value="time-horizons" className="border rounded-lg">
            <AccordionTrigger className="px-4 text-lg font-semibold">
              Vision Across Time Horizons
            </AccordionTrigger>
            <AccordionContent>
              <Card className="border-0">
                <CardContent className="pt-4">
                  <p className="text-sm mb-4">
                    Vision counters short-term bias. Multiple horizons stabilize decision-making. Collective imagination renews the future. Vision is sustained, not announced.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                      <Badge variant="outline">Short-term</Badge>
                      <span className="text-sm">Immediate actions and tactical decisions</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-100 rounded">
                      <Badge variant="outline">Mid-term</Badge>
                      <span className="text-sm">Strategic initiatives and capability building</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-200 rounded">
                      <Badge variant="outline">Long-term</Badge>
                      <span className="text-sm">Aspirational futures and transformative goals</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    Organizations that balance all three horizons create sustainable, adaptive vision.
                  </p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Key Takeaways */}
      <Card className="bg-white border-purple-200">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Key Takeaways</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <p className="text-sm pt-1">
                <strong>Vision is Neurocognitive:</strong> It emerges from the interaction of default, executive, and reward brain networks working together.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <p className="text-sm pt-1">
                <strong>Vision Requires Participation:</strong> Shared meaning emerges through inter-brain synchrony—people must help imagine the future they'll commit to.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <p className="text-sm pt-1">
                <strong>Vision Must Be Distributed:</strong> Centralized vision decays. Teams, middle management, and distributed networks sustain vision over time.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                4
              </div>
              <p className="text-sm pt-1">
                <strong>Vision Spans Multiple Horizons:</strong> Balancing short-term, mid-term, and long-term perspectives creates sustainable, adaptive organizational capacity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Resource Button */}
      <div className="bg-white rounded-lg p-6 mt-8 border border-purple-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Organizational Vision: Neuroscience Basics
            </h3>
            <p className="text-gray-700 mb-4">
              Access the comprehensive guide that explores the neurological foundations of organizational vision, including brain systems, distributed networks, and time horizons.
            </p>
            <Button
              onClick={handleOpenPdfViewer}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View Neuroscience Guide
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This module provides a framework for understanding organizational vision. The practical application of these principles typically requires collaboration with teams, leadership, and organizational development processes beyond individual work.
        </p>
      </div>

      {/* PDF Viewer Modal */}
      {isPdfViewerOpen && (
        <PDFViewer
          pdfUrl="/assets/org-vision-neuro-basics.pdf"
          title="Organizational Vision: Neuroscience Basics"
          downloadUrl="/assets/org-vision-neuro-basics.pdf"
          onClose={handleClosePdfViewer}
        />
      )}
    </div>
  );
};

export default IA_5_4_Content;
