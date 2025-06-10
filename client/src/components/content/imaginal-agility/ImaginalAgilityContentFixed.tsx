import React, { useState, useEffect } from 'react';
import { ContentViewProps } from '../../../shared/types';
import PlaceholderView from '../PlaceholderView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, BarChart3, Play } from 'lucide-react';
import { ImaginalAgilityAssessment } from '@/components/assessment/ImaginalAgilityAssessment';
import { ImaginalAgilityResults } from '@/components/assessment/ImaginalAgilityResults';
import { apiRequest } from '@/lib/queryClient';
import { imaginalAgilityNavigationSections } from '@/components/navigation/navigationData';

interface ImaginalAgilityContentProps extends ContentViewProps {
  currentContent: string;
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
}

interface AssessmentResults {
  imagination: number;
  curiosity: number;
  empathy: number;
  creativity: number;
  courage: number;
  responses: { [key: string]: number };
  radarChart: {
    imagination: number;
    curiosity: number;
    empathy: number;
    creativity: number;
    courage: number;
  };
  completedAt: string;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get step name from navigation data
  const getStepName = (stepId: string): string => {
    const allSteps = imaginalAgilityNavigationSections[0].steps;
    const step = allSteps.find(s => s.id === stepId);
    return step ? step.title : stepId;
  };

  // Load existing assessment results on component mount
  useEffect(() => {
    const loadAssessmentResults = async () => {
      if (currentContent === 'ia-4-1' || currentContent === 'ia-4-2') {
        try {
          const response = await apiRequest('/api/workshop-data/userAssessments');
          const assessments = response.assessments || [];
          const iaAssessment = assessments.find((a: any) => a.assessmentType === 'iaCoreCabilities');
          
          if (iaAssessment && iaAssessment.results) {
            const parsedResults = typeof iaAssessment.results === 'string' 
              ? JSON.parse(iaAssessment.results) 
              : iaAssessment.results;
            setAssessmentResults(parsedResults);
          }
        } catch (error) {
          console.error('Error loading assessment results:', error);
        }
      }
    };
    
    loadAssessmentResults();
  }, [currentContent]);

  const handleAssessmentComplete = async (results: AssessmentResults) => {
    setIsLoading(true);
    try {
      // Save assessment results to database
      const response = await fetch('/api/workshop-data/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'iaCoreCabilities',
          results: results
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAssessmentResults(results);
      markStepCompleted('ia-4-1');
      setCurrentContent('ia-4-2');
    } catch (error) {
      console.error('Error saving assessment results:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    switch (currentContent) {
      case 'ia-1-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/k3mDEAbUwZ4" 
                  title="Introduction to Imaginal Agility"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Welcome.</p>
              
              <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
              
              <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
              
              <p>This Micro Course is your starting point.</p>
              
              <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
              
              <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
              
              <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
              
              <p>You're not just learning about imagination. You're harnessing it — together.</p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-1-1');
                  setCurrentContent("ia-2-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-2-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-2-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">The Triple Challenge</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/EsExXeKFiKg" 
                  title="The Triple Challenge"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.</p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-2-1');
                  setCurrentContent("ia-3-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-3-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-3-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Imaginal Agility Solution</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/l3XVwPGE6UY" 
                  title="Imaginal Agility Solution"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Imagination is a primal human power — not content with what we know, but impelled to ask: 'What if?' Let's explore what this means, and how to harness it — individually and as a team.</p>
              
              <p className="font-semibold">Upon viewing the video, please click on the button below to complete your Core Capabilities Self-Assessment.</p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-3-1');
                  setCurrentContent("ia-4-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-4-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-4-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Self-Assessment</h1>
            
            <div className="mb-8">
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/Xdn8lkSzTZU" 
                title="Self-Assessment Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {!assessmentResults ? (
              <div className="space-y-6">
                <Card className="border-2 border-purple-100 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-600 text-white rounded-lg">
                        <Zap className="h-6 w-6" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-purple-800">Core Capabilities Self-Assessment</h2>
                        <div className="text-gray-700">
                          <p>As organizations face what Deloitte identifies as an "imagination deficit" in the AI era, robust imagination self-assessment becomes essential for maintaining human creative agency and fostering transformative innovation capacity.</p>
                          
                          <p className="mt-4">This Self-Assessment helps participants to reflect on their five core capabilities essential for personal growth, team synergy, and collaborative intelligence:</p>
                          
                          <ul className="mt-3 space-y-1 list-disc list-inside">
                            <li><strong>Imagination</strong></li>
                            <li><strong>Curiosity</strong></li>
                            <li><strong>Empathy</strong></li>
                            <li><strong>Creativity</strong></li>
                            <li><strong>Courage</strong></li>
                          </ul>
                          
                          <p className="mt-4">Your responses will generate a visual radar map for reflection and use in the Teamwork Practice Session. The process should take about 10–15 minutes.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button 
                    onClick={() => setIsAssessmentOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Zap className="h-5 w-5" />
                    {isLoading ? 'Processing...' : 'Take Assessment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="border-2 border-green-100 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-green-800">
                      <BarChart3 className="h-6 w-6" />
                      <h3 className="text-lg font-semibold">Assessment Complete!</h3>
                    </div>
                    <p className="text-green-700 mt-2">
                      You've completed your self-assessment. Your results are available in the next step.
                    </p>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      markStepCompleted('ia-4-1');
                      setCurrentContent('ia-4-2');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    Next: {getStepName('ia-4-2')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'ia-4-2':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Review Results</h1>
            
            <div className="mb-8">
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/If2FH40IgTM" 
                title="Review Results Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>

            {assessmentResults ? (
              <div className="space-y-6">
                <ImaginalAgilityResults results={assessmentResults} />
                
                <div className="flex justify-end mt-8">
                  <Button 
                    onClick={() => {
                      markStepCompleted('ia-4-2');
                      setCurrentContent("ia-5-1");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    Next: {getStepName('ia-5-1')}
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-yellow-800">
                    <Zap className="h-6 w-6" />
                    <h3 className="text-lg font-semibold">Assessment Required</h3>
                  </div>
                  <p className="text-yellow-700 mt-2">
                    Please complete the self-assessment first to view your results.
                  </p>
                  <Button 
                    onClick={() => setCurrentContent('ia-4-1')}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Take Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'ia-5-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Teamwork Preparation</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/hOV2zaWVxeU" 
                  title="Teamwork Preparation"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Welcome to the next stage of the Imaginal Agility Workshop.</p>
              
              <p>Now that you've completed your self-assessment and explored your radar profile, it's time to bring your imagination into action — with your team.</p>
              
              <p>Together, you'll enter a shared digital whiteboard space designed for real-time collaboration. This is where individual insights become team breakthroughs.</p>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">What to Expect</h3>
              
              <h4 className="text-lg font-medium text-purple-600">A Structured Whiteboard Practice</h4>
              <p>• Guided exercises will help your team apply imaginal agility in a creative, visual, and action-oriented way.</p>
              
              <h4 className="text-lg font-medium text-purple-600">Real-Time Co-Creation</h4>
              <p>• You'll brainstorm, align, and design solutions together — rapidly and with purpose.</p>
              
              <h4 className="text-lg font-medium text-purple-600">Human + AI Synergy</h4>
              <p>• You'll raise your HaiQ — the ability to stay imaginative, collaborative, and human while working with AI.</p>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">What You Leave With</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>A shared model for alignment and trust</li>
                <li>Tools and language to apply imagination at scale</li>
                <li>Personal and team AI insights and prompt packs</li>
                <li>Clearer team identity and action direction</li>
              </ul>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-5-1');
                  setCurrentContent("ia-6-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-6-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-6-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Discernment Guide</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/U7pQjMYKk_s" 
                  title="Discernment Guide"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <h2 className="text-2xl font-bold text-purple-700">REALITY DISCERNMENT</h2>
              
              <p className="text-xl font-semibold">Train Your Mind to Know What's Real.</p>
              
              <p>In an age of AI-generated content, deepfakes, and digital manipulation, discernment is no longer optional — it's essential.</p>
              
              <p>This short learning experience introduces you to the neuroscience behind reality monitoring — the brain's ability to tell what's real from what's imagined — and offers practical tools.</p>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">What You'll Learn:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Why imagination is your first line of cognitive defense</li>
                <li>How AI content bypasses our natural filters</li>
                <li>What neuroscience reveals about perception and deception</li>
                <li>How to track your own AI interaction patterns in real time</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">What You'll Practice:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>The AI Mirror Test — a powerful self-reflection tool to observe your own thinking habits in AI interaction</li>
                <li>Real vs. Fake visual discernment challenge</li>
                <li>Discernment Toolkit — 5 simple questions to strengthen daily clarity</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">Why It Matters:</h3>
              <p className="italic">"You can't depend on your eyes when your imagination is out of focus." — Mark Twain</p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-6-1');
                  setCurrentContent("ia-7-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-7-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-7-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">The Neuroscience</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/43Qs7OvToeI" 
                  title="The Neuroscience"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <h2 className="text-2xl font-bold text-purple-700">The Neuroscience Behind Imaginal Agility</h2>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">Built for Every Mind</h3>
              <p>Imagination isn't one-size-fits-all. The method supports diverse cognitive styles — including visual, verbal, emotional, and neurodivergent profiles.</p>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">Why It Works</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our method activates real brain systems — not just ideas.</li>
                <li>Each practice is designed to strengthen imagination as a core cognitive capability.</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">What the Science Shows</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mental synthesis fuses stored images into new ideas</li>
                <li>Five brain systems power imagination: memory, planning, empathy, fluency, vision</li>
                <li>Repetition builds clarity, agility, and insight</li>
                <li>Trained imagination improves reality discernment</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-purple-700 mt-6">From Neurons to Organizational Brilliance</h3>
              <p>The same neural process that sparks individual insight scales to team alignment and cultural change.</p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-7-1');
                  setCurrentContent("ia-8-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: {getStepName('ia-8-1')}
              </Button>
            </div>
          </div>
        );

      case 'ia-8-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">More About Workshop</h1>
            
            <div className="mb-8">
              <div className="relative w-full aspect-video">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/8Q5G3CF3yxI" 
                  title="More About Workshop"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Your journey in developing Imaginal Agility continues beyond this workshop.</p>
              
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">Congratulations!</h3>
                <p className="text-gray-700">
                  You've completed the Imaginal Agility Workshop. Continue practicing and applying 
                  these capabilities in your daily work and life.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <PlaceholderView 
            title={`${currentContent}`}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            currentContent={currentContent}
          />
        );
    }
  };
  
  return (
    <div>
      {renderContent()}
      
      <ImaginalAgilityAssessment
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
};

export default ImaginalAgilityContent;