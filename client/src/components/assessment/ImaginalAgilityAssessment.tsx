import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Zap, BarChart3, FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';

interface AssessmentQuestion {
  id: number;
  text: string;
  category: string;
  subcategory?: string;
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
  // Imagination Category (12 questions)
  // Generative Fluency (2 questions)
  { id: 1, text: "I can easily come up with multiple, unconventional ideas.", category: "imagination", subcategory: "generative_fluency" },
  { id: 2, text: "I often generate new ideas in my daily life.", category: "imagination", subcategory: "generative_fluency" },
  
  // Temporal Flexibility (2 questions)
  { id: 3, text: "I can vividly imagine different possible futures or pasts.", category: "imagination", subcategory: "temporal_flexibility" },
  { id: 4, text: "I often reflect on alternative outcomes before making decisions.", category: "imagination", subcategory: "temporal_flexibility" },
  
  // Perspectival Agility (2 questions)
  { id: 5, text: "I can imagine experiences beyond my current reality.", category: "imagination", subcategory: "perspectival_agility" },
  { id: 6, text: "I frequently consider other people's viewpoints in discussions.", category: "imagination", subcategory: "perspectival_agility" },
  
  // Boundary Permeability (2 questions)
  { id: 7, text: "I'm comfortable blending ideas from different domains (e.g., science and art).", category: "imagination", subcategory: "boundary_permeability" },
  { id: 8, text: "I actively seek inspiration from outside my usual field.", category: "imagination", subcategory: "boundary_permeability" },
  
  // Ambiguity Tolerance (2 questions)
  { id: 9, text: "I can explore complex ideas without needing quick answers.", category: "imagination", subcategory: "ambiguity_tolerance" },
  { id: 10, text: "I feel comfortable with uncertainty when solving problems.", category: "imagination", subcategory: "ambiguity_tolerance" },
  
  // Embodied Translation (2 questions)
  { id: 11, text: "I can turn abstract ideas into tangible actions or prototypes.", category: "imagination", subcategory: "embodied_translation" },
  { id: 12, text: "I regularly translate my ideas into practical applications.", category: "imagination", subcategory: "embodied_translation" },
  
  // Core Capabilities (8 questions)
  // Curiosity (2 questions)
  { id: 13, text: "I actively seek out new experiences and knowledge.", category: "curiosity" },
  { id: 14, text: "I ask questions that challenge conventional thinking.", category: "curiosity" },
  
  // Empathy (2 questions)
  { id: 15, text: "I can understand and relate to others' emotional experiences.", category: "empathy" },
  { id: 16, text: "I consider multiple perspectives when making decisions.", category: "empathy" },
  
  // Creativity (2 questions)
  { id: 17, text: "I enjoy finding novel solutions to complex problems.", category: "creativity" },
  { id: 18, text: "I regularly engage in creative activities or thinking.", category: "creativity" },
  
  // Courage (2 questions)
  { id: 19, text: "I'm willing to take calculated risks for meaningful outcomes.", category: "courage" },
  { id: 20, text: "I speak up for what I believe in, even when it's difficult.", category: "courage" }
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

  const currentQ = ASSESSMENT_QUESTIONS[currentQuestion];
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
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    // Generate meaningful demo responses that create a balanced, realistic profile
    const demoResponses: AssessmentResponse = {
      // Imagination questions (higher scores for imaginative profile)
      q1: 4, q2: 4, q3: 3, q4: 4, q5: 3, q6: 4, q7: 3, q8: 4, q9: 3, q10: 4, q11: 3, q12: 4,
      // Curiosity questions (moderate-high scores)
      q13: 4, q14: 3, q15: 4, q16: 3, q17: 4, q18: 3, q19: 4, q20: 3, q21: 4, q22: 3, q23: 4, q24: 3,
      // Empathy questions (balanced scores)
      q25: 3, q26: 4, q27: 3, q28: 4, q29: 3, q30: 4, q31: 3, q32: 4, q33: 3, q34: 4, q35: 3, q36: 4,
      // Creativity questions (high scores)
      q37: 4, q38: 4, q39: 3, q40: 4, q41: 3, q42: 4, q43: 3, q44: 4, q45: 3, q46: 4, q47: 3, q48: 4,
      // Courage questions (moderate scores for realistic profile)
      q49: 3, q50: 3, q51: 4, q52: 3, q53: 4, q54: 3, q55: 4, q56: 3, q57: 4, q58: 3, q59: 4, q60: 3
    };
    
    setResponses(demoResponses);
    setCurrentQuestion(ASSESSMENT_QUESTIONS.length - 1); // Go to last question
    console.log('IA Assessment filled with meaningful demo data');
  };

  const calculateResults = (): AssessmentResults => {
    // Calculate averages for each capability
    const imaginationQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'imagination');
    const curiosityQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'curiosity');
    const empathyQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'empathy');
    const creativityQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'creativity');
    const courageQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === 'courage');

    const calculateAverage = (questions: AssessmentQuestion[]) => {
      const sum = questions.reduce((acc, q) => acc + (responses[`q${q.id}`] || 0), 0);
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
      onClose(); // Close modal immediately - results will show on page
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'imagination': return 'bg-purple-500';
      case 'curiosity': return 'bg-blue-500';
      case 'empathy': return 'bg-green-500';
      case 'creativity': return 'bg-orange-500';
      case 'courage': return 'bg-red-500';
      default: return 'bg-purple-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'imagination': return <Zap className="h-5 w-5" />;
      case 'curiosity': return <BarChart3 className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
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
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`p-2 rounded-lg text-white ${getCategoryColor(currentQ.category)}`}>
                  {getCategoryIcon(currentQ.category)}
                </div>
                <div>
                  <span className="text-sm font-medium text-purple-700 capitalize">
                    {currentQ.category}
                  </span>
                  {currentQ.subcategory && (
                    <span className="text-xs text-gray-500 block">
                      {currentQ.subcategory.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

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