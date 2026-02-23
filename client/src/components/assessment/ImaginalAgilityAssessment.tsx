import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Zap, FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';

interface AssessmentQuestion {
  id: number;
  text: string;
  category: string;
  subcategory?: string;
  reverseScored?: boolean;
}

interface AssessmentResponse {
  [key: string]: number; // q1: 4, q2: 3, etc.
}

interface AssessmentResults {
  imagination: number;
  curiosity: number;
  empathy: number;
  creativity: number;
  courage: number;
  responses: AssessmentResponse;
  radarChart: {
    imagination: number;
    curiosity: number;
    empathy: number;
    creativity: number;
    courage: number;
  };
  completedAt: string;
}

interface ImaginalAgilityAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: AssessmentResults) => void;
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Imagination (6 items - subcategories preserved for best representatives)
  { id: 1, text: "When facing a familiar problem, I often find myself reimagining it from an unexpected angle.", category: "imagination", subcategory: "generative_fluency" },
  { id: 2, text: "I sometimes catch myself mentally rehearsing conversations or events that haven't happened yet.", category: "imagination", subcategory: "temporal_flexibility" },
  { id: 3, text: "I find it natural to hold two contradictory ideas in mind and explore what emerges between them.", category: "imagination", subcategory: "ambiguity_tolerance" },
  { id: 4, text: "When I read or hear about someone's experience very different from mine, I can almost feel what it would be like.", category: "imagination", subcategory: "perspectival_agility" },
  { id: 5, text: "When I have a method that works, I rarely feel the urge to try a completely different approach.", category: "imagination", subcategory: "boundary_permeability", reverseScored: true },
  { id: 6, text: "I often connect ideas from unrelated parts of my life in ways that surprise even me.", category: "imagination", subcategory: "boundary_permeability" },

  // Curiosity (4 items)
  { id: 7, text: "In the past week, I've followed a question or topic down an unexpected path just to see where it led.", category: "curiosity" },
  { id: 8, text: "When someone gives me an answer, my instinct is to ask 'what else might be true?'", category: "curiosity" },
  { id: 9, text: "When I find a satisfactory explanation for something, I usually move on rather than digging deeper.", category: "curiosity", reverseScored: true },
  { id: 10, text: "I'm drawn to conversations where I understand the least.", category: "curiosity" },

  // Caring/Empathy (4 items - stored as "empathy" in data for backward compatibility)
  { id: 11, text: "When a colleague is struggling, I notice it in their tone or body language before they say anything.", category: "empathy" },
  { id: 12, text: "I've changed my mind about something important because I genuinely listened to someone else's experience.", category: "empathy" },
  { id: 13, text: "In group discussions, I tend to focus more on the strength of an argument than on how the person making it feels.", category: "empathy", reverseScored: true },
  { id: 14, text: "I find myself thinking about how decisions I make might ripple out to affect people I'll never meet.", category: "empathy" },

  // Creativity (4 items)
  { id: 15, text: "I've recently made something — a solution, a phrase, an object, an approach — that didn't exist before I made it.", category: "creativity" },
  { id: 16, text: "When constraints tighten, I tend to get more inventive rather than more frustrated.", category: "creativity" },
  { id: 17, text: "I'd rather improve an existing approach than start from scratch with something untested.", category: "creativity", reverseScored: true },
  { id: 18, text: "I notice unusual combinations — flavors, colors, ideas, people — that others seem to overlook.", category: "creativity" },

  // Courage (4 items)
  { id: 19, text: "I've recently said something I believed was important even though I knew it might not land well.", category: "courage" },
  { id: 20, text: "When I feel the pull to play it safe, I can usually tell the difference between wisdom and fear.", category: "courage" },
  { id: 21, text: "I generally prefer to gather more information before acting on an uncertain situation.", category: "courage", reverseScored: true },
  { id: 22, text: "I've taken a meaningful risk in the past month — not reckless, but one that required genuine commitment.", category: "courage" },
];

const LIKERT_SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

export function ImaginalAgilityAssessment({ isOpen, onClose, onComplete }: ImaginalAgilityAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse>({});
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { shouldShowDemoButtons } = useTestUser();

  // Fisher-Yates shuffle, seeded per session
  const [shuffledOrder] = useState<number[]>(() => {
    const indices = ASSESSMENT_QUESTIONS.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const currentQ = ASSESSMENT_QUESTIONS[shuffledOrder[currentQuestion]];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
  const canGoNext = responses[`q${currentQ.id}`] !== undefined;
  const canFinish = isLastQuestion && canGoNext;

  const handleResponseSelect = (value: number) => {
    const questionKey = `q${currentQ.id}`;
    setResponses(prev => ({ ...prev, [questionKey]: value }));

    if (autoAdvance && !isLastQuestion) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    }
  };

  const handleNext = () => {
    if (canGoNext && !isLastQuestion) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleDemoData = () => {
    if (!shouldShowDemoButtons) return;

    const demoResponses: AssessmentResponse = {};
    const demoValues = [4, 3, 4, 3, 2, 4, 4, 3, 2, 4, 3, 4, 2, 3, 4, 4, 3, 3, 4, 3, 2, 4];
    ASSESSMENT_QUESTIONS.forEach((q, i) => {
      demoResponses[`q${q.id}`] = demoValues[i] || 3;
    });

    setResponses(demoResponses);
    setCurrentQuestion(ASSESSMENT_QUESTIONS.length - 1);
    console.log('IA Assessment filled with demo data (22 questions)');
  };

  const calculateResults = (): AssessmentResults => {
    const imaginationQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'imagination');
    const curiosityQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'curiosity');
    const empathyQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'empathy');
    const creativityQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'creativity');
    const courageQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'courage');

    const calculateAverage = (questions: AssessmentQuestion[]) => {
      const sum = questions.reduce((acc, q) => {
        const rawValue = responses[`q${q.id}`] || 0;
        // Reverse score: convert 1→5, 2→4, 3→3, 4→2, 5→1
        const value = q.reverseScored ? (6 - rawValue) : rawValue;
        return acc + value;
      }, 0);
      return Number((sum / questions.length).toFixed(1));
    };

    const imagination = calculateAverage(imaginationQuestions);
    const curiosity = calculateAverage(curiosityQuestions);
    const empathy = calculateAverage(empathyQuestions);
    const creativity = calculateAverage(creativityQuestions);
    const courage = calculateAverage(courageQuestions);

    return {
      imagination,
      curiosity,
      empathy,
      creativity,
      courage,
      responses,
      radarChart: {
        imagination,
        curiosity,
        empathy,
        creativity,
        courage
      },
      completedAt: new Date().toISOString()
    };
  };

  const handleFinish = async () => {
    if (!canFinish) return;

    setIsLoading(true);
    try {
      const results = calculateResults();
      onComplete(results);
      onClose();
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-700">
            <Zap className="h-6 w-6" />
            Imaginal Agility Self-Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
              </span>
              <span className="text-sm text-purple-600 font-medium">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-advance"
                checked={autoAdvance}
                onCheckedChange={setAutoAdvance}
              />
              <Label htmlFor="auto-advance" className="text-sm">
                Auto-advance after selection
              </Label>
            </div>
            {shouldShowDemoButtons && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDemoData}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Add Demo Data
              </Button>
            )}
          </div>

          {/* Question Card */}
          <Card className="border-2 border-purple-100">
            <CardContent className="p-8">
              {/* Question Text */}
              <h3 className="text-lg font-medium text-gray-900 mb-8">
                {currentQ.text}
              </h3>

              {/* Horizontal Likert Scale */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  {LIKERT_SCALE.map((option) => {
                    const isSelected = responses[`q${currentQ.id}`] === option.value;
                    return (
                      <div key={option.value} className="flex flex-col items-center flex-1">
                        <button
                          onClick={() => handleResponseSelect(option.value)}
                          className={`
                            w-12 h-12 rounded-full border-2 transition-all duration-200 mb-2
                            ${isSelected
                              ? 'bg-purple-500 border-purple-500 text-white scale-110 shadow-lg'
                              : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                            }
                          `}
                        >
                          {option.value}
                        </button>
                        <span className="text-xs text-center text-gray-600 max-w-16">
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!isLastQuestion ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext || autoAdvance}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  disabled={!canFinish || isLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Processing...' : 'Finish Assessment'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
