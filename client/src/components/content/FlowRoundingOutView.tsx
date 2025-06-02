import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { ContentViewProps } from '../../shared/types';
import { Check, ChevronRight, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Reflection Questions
interface RoundingOutQuestion {
  id: number;
  text: string;
  hint?: string;
}

// Rounding Out Questions
const roundingOutQuestions: RoundingOutQuestion[] = [
  {
    id: 1,
    text: "When does flow happen most naturally for you?",
    hint: "Reflect on when you get 'in the zone' and lose track of time. What activities or conditions create this experience?"
  },
  {
    id: 2,
    text: "What typically blocks or interrupts your flow state?",
    hint: "Consider what prevents you from getting into flow or pulls you out when you're already there."
  },
  {
    id: 3, 
    text: "What conditions help you get into flow more easily?",
    hint: "Think about your environment, mindset, time of day, or other factors that make flow more accessible."
  },
  {
    id: 4,
    text: "How could you create more opportunities for flow in your work and life?",
    hint: "Consider specific changes or practices you could implement to experience flow more regularly."
  }
];

const FlowRoundingOutView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  // State for reflection component
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExample, setShowExample] = useState(false);
  const [reflectionCompleted, setReflectionCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing reflection data on component mount
  const { data: existingReflection } = useQuery({
    queryKey: ['/api/assessments', 'flowReflection'],
    enabled: true
  });

  // Load existing answers from API or localStorage
  useEffect(() => {
    // First try to load from API
    if (existingReflection?.results) {
      try {
        const parsedResults = typeof existingReflection.results === 'string' 
          ? JSON.parse(existingReflection.results) 
          : existingReflection.results;

        if (parsedResults.answers) {
          setAnswers(parsedResults.answers);

          // Check if all questions are answered
          const allAnswered = roundingOutQuestions.every(q => 
            parsedResults.answers[q.id] && parsedResults.answers[q.id].trim().length > 0
          );

          if (allAnswered) {
            setReflectionCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error parsing reflection results:', error);
      }
    }
  }, [existingReflection]);

  // Save to localStorage whenever answers change
  useEffect(() => {
    const reflectionData = {
      answers,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('flowReflectionAnswers', JSON.stringify(reflectionData));
  }, [answers]);

  // Save reflection mutation
  const saveReflectionMutation = useMutation({
    mutationFn: async (reflectionData: Record<number, string>) => {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          assessmentType: 'flowReflection',
          results: {
            answers: reflectionData,
            completedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save reflection: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      toast({
        title: "Reflection saved!",
        description: "Your flow reflection responses have been saved successfully.",
        duration: 3000
      });
      markStepCompleted('3-3');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save reflection",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get current question
  const question = roundingOutQuestions[currentQuestion];
  const currentAnswer = answers[question?.id] || '';

  // Check if all questions have been answered
  const allQuestionsAnswered = () => {
    return roundingOutQuestions.every(q => 
      answers[q.id] && answers[q.id].trim().length > 0
    );
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < roundingOutQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExample(false);
    } else {
      // Moved to last question, but don't mark complete yet
      setShowExample(false);
    }
  };

  // Save all reflection answers to database
  const handleSaveReflection = async () => {
    if (!allQuestionsAnswered()) {
      toast({
        title: "Please answer all questions",
        description: "You must provide answers to all reflection questions before continuing.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await saveReflectionMutation.mutateAsync(answers);
      setReflectionCompleted(true);
    } catch (error) {
      console.error('Error saving reflection:', error);
    } finally {
      setSaving(false);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExample(false);
    }
  };

  // Update answer for current question
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: e.target.value
    }));
  };

  // Toggle example visibility
  const toggleExample = () => {
    setShowExample(prev => !prev);
  };

  // Example answers for each question
  const getExampleAnswer = (questionId: number) => {
    switch (questionId) {
      case 1:
        return "When I'm working on a creative problem or designing something new, I often lose track of time. I also experience flow when I'm fully engaged in deep conversations with my team about important projects.";
      case 2:
        return "Constant notifications, unexpected meetings, and unclear priorities all break my flow. When tasks are too easy or too difficult, I struggle to get into a flow state.";
      case 3:
        return "I find it easier to get into flow when I have clear goals, a quiet environment, and all my notifications turned off. Working during early morning hours when my energy is highest also helps.";
      case 4:
        return "I could block out specific 'deep work' time on my calendar each day with no meetings allowed. Creating a dedicated workspace with minimal distractions would help. I'll also try to match tasks to my energy levels throughout the day.";
      default:
        return "";
    }
  };

  // Continue to next section
  const handleContinue = () => {
    setCurrentContent("flow-star-card");
  };

  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + 1) / roundingOutQuestions.length) * 100;

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Rounding Out Your Flow Understanding</h1>

      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Now that you've completed the flow assessment, take some time to round out your understanding 
          of flow and how you can create more opportunities for it in your work and life.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Video Section with the requested YouTube video */}
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <VideoPlayer workshopType="allstarteams" stepId="3-3" title="Rounding Out" />
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 h-full">
            <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
              <Edit className="h-4 w-4 mr-2 text-indigo-600" />
              Flow State Key Principles
            </h3>
            <ul className="space-y-2 text-indigo-700 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Clear goals</strong> - Know exactly what you need to accomplish</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Balance of challenge & skill</strong> - Not too easy, not too hard</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Immediate feedback</strong> - Know how you're performing as you go</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Deep concentration</strong> - Full attention on the task at hand</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {reflectionCompleted ? (
        <div className="space-y-6">
          <Card className="p-6 border border-green-100 bg-green-50">
            <div className="flex items-center justify-center text-center flex-col">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reflection Completed</h3>
              <p className="text-gray-600 mb-4">
                Great work! You've completed the flow reflection exercise. You're now ready to add flow attributes
                to your Star Card to round out your profile.
              </p>

              <Button 
                onClick={handleContinue}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Add Flow to Star Card
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="uppercase font-bold text-lg mb-2 text-blue-700">Flow State Resources</h3>
              <p className="text-sm text-gray-700 mb-2">
                Download our guide to creating more flow experiences in your daily work:
              </p>
              <Button variant="outline" className="bg-white">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Resource download clicked");
                  }}
                  className="flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Flow State Guide (PDF)
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">
                  Question {currentQuestion + 1} of {roundingOutQuestions.length}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleExample}
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                >
                  {showExample ? "Hide Example" : "Show Example"}
                </Button>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{question.text}</h3>

            {question.hint && (
              <p className="text-sm text-gray-600 mb-3">{question.hint}</p>
            )}

            {showExample && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                <p className="text-sm text-indigo-900">
                  <span className="font-medium">Example: </span>
                  {getExampleAnswer(question.id)}
                </p>
              </div>
            )}

            <Textarea
              value={currentAnswer}
              onChange={handleAnswerChange}
              placeholder="Your answer here..."
              className="min-h-[120px] mb-4 border border-gray-300"
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion < roundingOutQuestions.length - 1 ? (
                  <Button
                    onClick={nextQuestion}
                    className="bg-indigo-700 hover:bg-indigo-800"
                    disabled={currentAnswer.trim().length === 0}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveReflection}
                    disabled={saving || !allQuestionsAnswered()}
                    className={`${
                      allQuestionsAnswered() && !saving
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    {saving ? 'Saving...' : 'Complete Reflection'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Show completion status if all questions answered but not yet saved */}
          {allQuestionsAnswered() && !reflectionCompleted && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">
                  All questions answered! Click "Complete Reflection" to save your responses.
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};

export default FlowRoundingOutView;