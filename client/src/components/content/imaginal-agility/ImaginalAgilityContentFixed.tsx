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
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/UOlOCJeP04w" 
                title="Introduction to Imaginal Agility"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Welcome to the Imaginal Agility Workshop — a transformative journey into the heart of human creativity and collaboration in the age of AI.</p>
              
              <p>In this workshop, you'll discover how to harness your imagination as a strategic advantage, develop core human capabilities, and learn to work synergistically with artificial intelligence while maintaining your unique human edge.</p>
              
              <p>Get ready to unlock your potential and revolutionize how you approach challenges, innovation, and teamwork.</p>
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
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/7Jl0wnHlnzM" 
                title="The Triple Challenge"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Modern teams face an unprecedented triple challenge that requires a new approach to human capability development.</p>
              
              <p>Understanding these three interconnected challenges is essential for developing the agility needed to thrive in today's complex, rapidly evolving landscape.</p>
              
              <p>In this session, we'll explore how these challenges create both obstacles and opportunities for revolutionary thinking and collaboration.</p>
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
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination and AI</h1>
            
            <div className="mb-8">
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/9DswWxC8hkw" 
                title="Imagination and AI"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
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
              <iframe 
                width="100%" 
                height="400" 
                src="https://www.youtube.com/embed/hOV2zaWVxeU" 
                title="Teamwork Preparation"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="space-y-4 text-lg text-gray-700">
              <p>Welcome to the next stage of the Imaginal Agility Workshop.</p>
              
              <p>Now that you've completed your self-assessment and explored your radar profile, it's time to bring your imagination into action — with your team.</p>
              
              <p>Together, you'll enter a shared digital whiteboard space designed for real-time collaboration. This is where individual insights become team breakthroughs.</p>
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
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Team Practice</h1>
            <p className="text-lg text-gray-700 mb-8">
              Engage in collaborative exercises that put your capabilities into action.
            </p>
            
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
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Future Applications</h1>
            <p className="text-lg text-gray-700 mb-8">
              Explore how to apply your capabilities in real-world scenarios.
            </p>
            
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
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Next Steps</h1>
            <p className="text-lg text-gray-700 mb-8">
              Your journey in developing Imaginal Agility continues beyond this workshop.
            </p>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Congratulations!</h3>
              <p className="text-gray-700">
                You've completed the Imaginal Agility Workshop. Continue practicing and applying 
                these capabilities in your daily work and life.
              </p>
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