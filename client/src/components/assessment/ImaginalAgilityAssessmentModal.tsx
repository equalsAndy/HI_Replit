import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle, X } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface ImaginalAgilityAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: AssessmentResults) => void;
}

interface AssessmentQuestion {
  id: number;
  text: string;
  capacity: 'imagination' | 'curiosity' | 'empathy' | 'creativity' | 'courage';
  subDimension?: string;
}

interface AssessmentResults {
  assessmentType: 'imaginationAssessment';
  completedAt: string;
  responses: Record<number, number>;
  scores: {
    imagination: number;
    curiosity: number;
    empathy: number;
    creativity: number;
    courage: number;
    subDimensions: {
      generativeFluency: number;
      temporalFlexibility: number;
      perspectivalAgility: number;
      boundaryPermeability: number;
      ambiguityTolerance: number;
      embodiedTranslation: number;
      playfulWonder: number;
    };
  };
}

// Assessment questions with exact structure from requirements
const assessmentQuestions: AssessmentQuestion[] = [
  // Imagination - Generative Fluency (2 questions)
  { id: 1, text: "I can easily come up with multiple, unconventional ideas.", capacity: 'imagination', subDimension: 'generativeFluency' },
  { id: 2, text: "I often generate new ideas in my daily life.", capacity: 'imagination', subDimension: 'generativeFluency' },
  
  // Imagination - Temporal Flexibility (2 questions)
  { id: 3, text: "I can vividly imagine different possible futures or pasts.", capacity: 'imagination', subDimension: 'temporalFlexibility' },
  { id: 4, text: "I often reflect on alternative outcomes before making decisions.", capacity: 'imagination', subDimension: 'temporalFlexibility' },
  
  // Imagination - Perspectival Agility (2 questions)
  { id: 5, text: "I can imagine experiences beyond my current reality.", capacity: 'imagination', subDimension: 'perspectivalAgility' },
  { id: 6, text: "I frequently consider other people's viewpoints in discussions.", capacity: 'imagination', subDimension: 'perspectivalAgility' },
  
  // Imagination - Boundary Permeability (2 questions)
  { id: 7, text: "I'm comfortable blending ideas from different domains (e.g., science and art).", capacity: 'imagination', subDimension: 'boundaryPermeability' },
  { id: 8, text: "I actively seek inspiration from outside my usual field.", capacity: 'imagination', subDimension: 'boundaryPermeability' },
  
  // Imagination - Ambiguity Tolerance (2 questions)
  { id: 9, text: "I can explore complex ideas without needing quick answers.", capacity: 'imagination', subDimension: 'ambiguityTolerance' },
  { id: 10, text: "I feel comfortable with uncertainty when solving problems.", capacity: 'imagination', subDimension: 'ambiguityTolerance' },
  
  // Imagination - Embodied Translation (2 questions)
  { id: 11, text: "I can turn abstract ideas into tangible actions or prototypes.", capacity: 'imagination', subDimension: 'embodiedTranslation' },
  { id: 12, text: "I take steps to bring my ideas to life.", capacity: 'imagination', subDimension: 'embodiedTranslation' },
  
  // Imagination - Playful Wonder (1 question)
  { id: 13, text: "I allow myself to daydream, imagine, or wonder—even if it feels unproductive.", capacity: 'imagination', subDimension: 'playfulWonder' },
  
  // Curiosity (2 questions)
  { id: 14, text: "I frequently seek out new experiences or knowledge.", capacity: 'curiosity' },
  { id: 15, text: "I enjoy exploring unfamiliar topics.", capacity: 'curiosity' },
  
  // Empathy (2 questions)
  { id: 16, text: "I'm good at understanding how others feel.", capacity: 'empathy' },
  { id: 17, text: "I try to see situations through others' eyes.", capacity: 'empathy' },
  
  // Creativity (2 questions)
  { id: 18, text: "I engage regularly in creative activities (e.g., art, writing, design).", capacity: 'creativity' },
  { id: 19, text: "I often come up with novel solutions to everyday challenges.", capacity: 'creativity' },
  
  // Courage (2 questions)
  { id: 20, text: "I take risks to pursue ideas or values I believe in.", capacity: 'courage' },
  { id: 21, text: "I stand up for what I believe, even when it's unpopular.", capacity: 'courage' }
];

const likertScale = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

// Function to calculate scores from responses
const calculateScores = (responses: Record<number, number>) => {
  // Calculate sub-dimension averages for Imagination (13 questions total)
  const generativeFluencyScore = (responses[1] + responses[2]) / 2;
  const temporalFlexibilityScore = (responses[3] + responses[4]) / 2;
  const perspectivalAgilityScore = (responses[5] + responses[6]) / 2;
  const boundaryPermeabilityScore = (responses[7] + responses[8]) / 2;
  const ambiguityToleranceScore = (responses[9] + responses[10]) / 2;
  const embodiedTranslationScore = (responses[11] + responses[12]) / 2;
  const playfulWonderScore = responses[13]; // single question

  // Overall Imagination score (average of 7 sub-dimensions)
  const imaginationScore = (
    generativeFluencyScore +
    temporalFlexibilityScore +
    perspectivalAgilityScore +
    boundaryPermeabilityScore +
    ambiguityToleranceScore +
    embodiedTranslationScore +
    playfulWonderScore
  ) / 7;

  // Calculate other capacity averages
  const curiosityScore = (responses[14] + responses[15]) / 2;
  const empathyScore = (responses[16] + responses[17]) / 2;
  const creativityScore = (responses[18] + responses[19]) / 2;
  const courageScore = (responses[20] + responses[21]) / 2;

  return {
    imagination: imaginationScore,
    curiosity: curiosityScore,
    empathy: empathyScore,
    creativity: creativityScore,
    courage: courageScore,
    subDimensions: {
      generativeFluency: generativeFluencyScore,
      temporalFlexibility: temporalFlexibilityScore,
      perspectivalAgility: perspectivalAgilityScore,
      boundaryPermeability: boundaryPermeabilityScore,
      ambiguityTolerance: ambiguityToleranceScore,
      embodiedTranslation: embodiedTranslationScore,
      playfulWonder: playfulWonderScore
    }
  };
};

// Guidance based on scores
const getGuidance = (scores: ReturnType<typeof calculateScores>) => {
  const strengths = [];
  const opportunities = [];

  // Identify strengths (scores above 4.0)
  if (scores.imagination >= 4.0) strengths.push("Your imagination capabilities show strong development across multiple dimensions");
  if (scores.curiosity >= 4.0) strengths.push("Your curiosity drives you to actively seek new experiences and knowledge");
  if (scores.empathy >= 4.0) strengths.push("Your empathy allows you to understand and connect with others effectively");
  if (scores.creativity >= 4.0) strengths.push("Your creativity manifests in both regular creative activities and novel problem-solving");
  if (scores.courage >= 4.0) strengths.push("Your courage enables you to take risks and stand up for your beliefs");

  // Identify opportunities (scores below 3.5)
  if (scores.imagination < 3.5) opportunities.push("Practice imagination exercises to strengthen your ability to envision possibilities");
  if (scores.curiosity < 3.5) opportunities.push("Actively seek out new experiences and unfamiliar topics to cultivate curiosity");
  if (scores.empathy < 3.5) opportunities.push("Practice perspective-taking to better understand others' feelings and viewpoints");
  if (scores.creativity < 3.5) opportunities.push("Engage in more creative activities and experiment with novel approaches to challenges");
  if (scores.courage < 3.5) opportunities.push("Take small risks to build confidence in pursuing your ideas and values");

  // Default messages if scores are moderate
  if (strengths.length === 0) strengths.push("You show balanced development across the five capacities");
  if (opportunities.length === 0) opportunities.push("Continue developing all five capacities through regular practice and reflection");

  return { strengths, opportunities };
};

export function ImaginalAgilityAssessmentModal({ isOpen, onClose, onComplete }: ImaginalAgilityAssessmentModalProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);

  // Check for existing assessment results
  const { data: existingAssessment } = useQuery({
    queryKey: ['/api/user/assessments', 'imaginationAssessment'],
    enabled: isOpen,
    staleTime: Infinity
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if assessment already exists
      if (existingAssessment?.data) {
        setAssessmentResults(existingAssessment.data);
        setView('results');
      } else {
        setView('intro');
        setCurrentQuestion(0);
        setResponses({});
      }
    }
  }, [isOpen, existingAssessment]);

  // Generate demo data for testing
  const handleDemoMode = () => {
    const demoResponses: Record<number, number> = {};
    
    // Generate random responses for all questions
    assessmentQuestions.forEach(question => {
      demoResponses[question.id] = Math.floor(Math.random() * 5) + 1; // 1-5 scale
    });
    
    setResponses(demoResponses);
    setCurrentQuestion(assessmentQuestions.length - 1);
    setView('assessment');
    
    toast({
      title: "Demo Mode Activated",
      description: "Random responses generated. You can now complete the assessment.",
    });
  };

  // Handle Likert scale response
  const handleLikertResponse = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Complete assessment
        completeAssessment();
      }
    }, 500);
  };

  // Complete the assessment
  const completeAssessment = async () => {
    setIsSubmitting(true);

    try {
      // Calculate scores
      const scores = calculateScores(responses);
      
      // Prepare assessment data
      const assessmentData: AssessmentResults = {
        assessmentType: 'imaginationAssessment',
        completedAt: new Date().toISOString(),
        responses,
        scores
      };

      // Save to database using existing API pattern
      const response = await fetch('/api/workshop-data/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(assessmentData)
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      // Show success message
      toast({
        title: "Assessment Complete!",
        description: "Your 5-capacity profile has been created!",
      });

      // Set results and show results view
      setAssessmentResults(assessmentData);
      setView('results');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(assessmentData);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare radar chart data
  const radarData = assessmentResults ? [
    { capacity: 'Imagination', value: assessmentResults.scores.imagination * 20, fullMark: 100 },
    { capacity: 'Curiosity', value: assessmentResults.scores.curiosity * 20, fullMark: 100 },
    { capacity: 'Empathy', value: assessmentResults.scores.empathy * 20, fullMark: 100 },
    { capacity: 'Creativity', value: assessmentResults.scores.creativity * 20, fullMark: 100 },
    { capacity: 'Courage', value: assessmentResults.scores.courage * 20, fullMark: 100 }
  ] : [];

  const guidance = assessmentResults ? getGuidance(assessmentResults.scores) : null;

  const progressPercentage = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-purple-700">5-Capacity Assessment</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {view === 'intro' && (
          <div className="space-y-6 p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Discover Your 5 Capacities</h2>
              <p className="text-gray-700 mb-6">
                This assessment measures your strengths across five key capacities: Imagination, Curiosity, Empathy, Creativity, and Courage.
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="font-medium text-purple-800 mb-2">What You'll Get</h3>
              <p className="text-sm text-purple-700">
                A personalized 5-axis radar chart showing your capacity profile, plus insights into your strengths and growth opportunities.
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <h3 className="font-medium text-amber-800 mb-2">Instructions</h3>
              <p className="text-sm text-amber-700">
                You'll answer 21 questions using a 5-point scale from "Strongly Disagree" to "Strongly Agree". 
                There are no right or wrong answers - be honest about your preferences.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => setView('assessment')} className="bg-purple-600 hover:bg-purple-700">
                Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleDemoMode}>
                Demo Mode
              </Button>
            </div>
          </div>
        )}

        {view === 'assessment' && (
          <div className="space-y-6 p-6">
            <div className="mb-6">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-right text-sm text-gray-500 mt-1">
                Question {currentQuestion + 1} of {assessmentQuestions.length}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-purple-800 mb-6">
                  {assessmentQuestions[currentQuestion].text}
                </h2>
                
                <div className="space-y-3">
                  {likertScale.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => handleLikertResponse(assessmentQuestions[currentQuestion].id, option.value)}
                      variant={responses[assessmentQuestions[currentQuestion].id] === option.value ? "default" : "outline"}
                      className={`w-full text-left justify-start h-auto p-4 ${
                        responses[assessmentQuestions[currentQuestion].id] === option.value 
                          ? "bg-purple-600 hover:bg-purple-700 text-white" 
                          : "hover:bg-purple-50"
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center w-full">
                        <span className="font-medium mr-3">{option.value}</span>
                        <span>{option.label}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Capacity: <span className="font-medium capitalize">{assessmentQuestions[currentQuestion].capacity}</span>
                  {assessmentQuestions[currentQuestion].subDimension && (
                    <span> • Sub-dimension: <span className="font-medium">{assessmentQuestions[currentQuestion].subDimension}</span></span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'results' && assessmentResults && (
          <div className="space-y-6 p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-2xl font-semibold text-purple-800">Assessment Complete</h2>
            </div>
            
            <p className="text-gray-700 mb-6">
              Your responses reveal your strengths across imagination, curiosity, empathy, creativity, and courage.
            </p>
            
            {/* Radar Chart */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">Your 5-Capacity Profile</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="capacity" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={false}
                    />
                    <Radar
                      name="Your Scores"
                      dataKey="value"
                      stroke="#8754b4"
                      fill="#8754b4"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Detailed Scores */}
            <div className="space-y-4 mb-6">
              {Object.entries({
                Imagination: assessmentResults.scores.imagination,
                Curiosity: assessmentResults.scores.curiosity,
                Empathy: assessmentResults.scores.empathy,
                Creativity: assessmentResults.scores.creativity,
                Courage: assessmentResults.scores.courage
              }).map(([capacity, score]) => (
                <div key={capacity} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{capacity}</span>
                    <span>{(score * 20).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${score * 20}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            {guidance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">Your Strengths</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {guidance.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">Growth Opportunities</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {guidance.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">→</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button 
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Continue to Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}