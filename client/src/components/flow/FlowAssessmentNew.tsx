import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FlowQuestion {
  id: number;
  text: string;
}

// Flow assessment questions
const flowQuestions: FlowQuestion[] = [
  { id: 1, text: "I often feel deeply focused and energized by my work." },
  { id: 2, text: "The challenges I face are well matched to my skills." },
  { id: 3, text: "I lose track of time when I'm fully engaged." },
  { id: 4, text: "I feel in control of what I'm doing, even under pressure." },
  { id: 5, text: "I receive clear feedback that helps me stay on track." },
  { id: 6, text: "I know exactly what needs to be done in my work." },
  { id: 7, text: "I feel self-conscious and more spontaneous when I'm in flow." },
  { id: 8, text: "I do things automatically, almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

interface FlowAssessmentProps {
  onTabChange?: (tabId: string) => void;
}

interface FlowResults {
  flowScore: number;
  answers: Record<number, number>;
  totalQuestions: number;
  maxScore: number;
}

export default function FlowAssessment({ onTabChange }: FlowAssessmentProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [existingResults, setExistingResults] = useState<FlowResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Check for existing assessment on component mount
  useEffect(() => {
    const checkForExistingAssessment = async () => {
      try {
        const response = await fetch('/api/user/assessments', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.currentUser?.assessments?.flowAssessment?.formattedResults) {
            const results = data.currentUser.assessments.flowAssessment.formattedResults;
            console.log('✅ Found existing flow assessment:', results);
            setExistingResults(results);
          }
        }
      } catch (error) {
        console.error('Error checking for existing assessment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkForExistingAssessment();
  }, []);

  const valueToLabel = (value: number) => {
    switch (value) {
      case 1: return "Never";
      case 2: return "Rarely";
      case 3: return "Sometimes";
      case 4: return "Often";
      case 5: return "Always";
      default: return "";
    }
  };

  const getInterpretation = (score: number) => {
    const percentage = (score / 60) * 100;
    
    if (percentage >= 80) {
      return {
        level: "High Flow State",
        description: "You frequently experience flow states at work. You're operating in your zone of optimal performance, with excellent challenge-skill balance and clear goals. Continue to cultivate these conditions for sustained high performance."
      };
    } else if (percentage >= 60) {
      return {
        level: "Moderate Flow State",
        description: "You experience flow states fairly regularly. There are good foundations in place, but there's room to optimize your work environment and approach to achieve more consistent flow experiences."
      };
    } else if (percentage >= 40) {
      return {
        level: "Emerging Flow State",
        description: "You experience some elements of flow, but there are opportunities to improve. Focus on better matching challenges to your skills, clarifying goals, and minimizing distractions."
      };
    } else {
      return {
        level: "Limited Flow State",
        description: "Flow states are rare in your current work situation. Consider restructuring your work environment, seeking more challenging tasks, or developing clearer goals to increase flow opportunities."
      };
    }
  };

  const handleSliderChange = (questionId: number, value: number[]) => {
    const newAnswers = { ...answers, [questionId]: value[0] };
    setAnswers(newAnswers);

    if (autoAdvance && value[0] > 0 && currentQuestion < flowQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 500);
    }
  };

  const handleSubmit = async () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    
    try {
      const response = await fetch('/api/user/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'flowAssessment',
          results: {
            flowScore: totalScore,
            answers,
            totalQuestions: flowQuestions.length,
            maxScore: flowQuestions.length * 5
          }
        })
      });

      if (response.ok) {
        const results = {
          flowScore: totalScore,
          answers,
          totalQuestions: flowQuestions.length,
          maxScore: flowQuestions.length * 5
        };
        setExistingResults(results);
        console.log('✅ Flow assessment saved successfully');
      }
    } catch (error) {
      console.error('Error saving flow assessment:', error);
    }
  };

  const allQuestionsAnswered = flowQuestions.every(q => answers[q.id] > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading assessment...</div>
      </div>
    );
  }

  // Show results if assessment is already completed
  if (existingResults) {
    const interpretation = getInterpretation(existingResults.flowScore);
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Flow Assessment Results</h3>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-indigo-700">
                {existingResults.flowScore} / {existingResults.maxScore}
              </p>
              <p className="text-lg font-semibold">
                {interpretation.level}
              </p>
            </div>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg text-left">
              <p>{interpretation.description}</p>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your flow assessment is complete. Continue to the next section to add flow attributes to your Star Card.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setExistingResults(null)}
                variant="outline"
                className="border-indigo-700 text-indigo-700 hover:bg-indigo-50"
              >
                Retake Assessment
              </Button>
              <Button 
                onClick={() => onTabChange ? onTabChange("roundingout") : null}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Continue to Rounding Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show assessment form
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Flow Assessment</h3>
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {flowQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestion + 1) / flowQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">{question.text}</p>
            
            <div className="space-y-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rate how often this applies to your work experience</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="px-4">
                <Slider
                  value={[currentValue]}
                  onValueChange={(value) => handleSliderChange(question.id, value)}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Never</span>
                  <span>Always</span>
                </div>
                
                {currentValue > 0 && (
                  <div className="text-center mt-2">
                    <span className="text-indigo-600 font-medium">
                      {valueToLabel(currentValue)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoAdvance"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoAdvance" className="text-sm text-gray-600">
                Auto-advance
              </label>
            </div>

            {currentQuestion < flowQuestions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!currentValue}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className="bg-green-700 hover:bg-green-800"
              >
                Complete Assessment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}