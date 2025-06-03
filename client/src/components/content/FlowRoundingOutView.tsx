import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from './VideoPlayer';
import { ContentViewProps } from '../../shared/types';
import { Check, ChevronRight, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/lib/utils';

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

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const response = await fetch('/api/workshop-data/rounding-out', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data && result.data.answers) {
          setAnswers(result.data.answers);
          
          // Check if all questions are answered
          const allAnswered = roundingOutQuestions.every(q => 
            result.data.answers[q.id] && result.data.answers[q.id].trim().length > 0
          );

          if (allAnswered) {
            setReflectionCompleted(true);
          }
        }
      } catch (error) {
        console.log('No existing data found');
      }
    };
    
    loadExistingData();
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (answersToSave) => {
      try {
        const response = await fetch('/api/workshop-data/rounding-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers: answersToSave })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('Auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000),
    []
  );

  // Trigger save whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      debouncedSave(answers);
    }
  }, [answers, debouncedSave]);

  // Complete reflection function
  const completeReflection = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/workshop-data/rounding-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setReflectionCompleted(true);
        toast({
          title: "Reflection completed!",
          description: "Your responses have been saved successfully.",
          duration: 3000
        });
        markStepCompleted('3-3');
        // Navigate to the next step: Add Flow to Star Card
        if (navigate) {
          setTimeout(() => {
            navigate('find-your-flow', '3-4');
          }, 1500); // Small delay to show the success message
        }
      }
    } catch (error) {
      toast({
        title: "Failed to save reflection",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Get current question
  const question = roundingOutQuestions[currentQuestion];
  const currentAnswer = answers[question?.id] || '';

  // Continue to next step
  const handleContinue = () => {
    setCurrentContent('star-card');
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < roundingOutQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExample(false);
    }
  };

  // Check if all questions are answered
  const allQuestionsAnswered = () => {
    return roundingOutQuestions.every(q => 
      answers[q.id] && answers[q.id].trim().length > 0
    );
  };

  // Handle save reflection
  const handleSaveReflection = async () => {
    console.log('Complete Reflection button clicked!');
    console.log('All questions answered:', allQuestionsAnswered());
    console.log('Current answers:', answers);
    
    if (!allQuestionsAnswered()) {
      toast({
        title: "Incomplete reflection",
        description: "You must provide answers to all reflection questions before continuing.",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting reflection save process...');
    await completeReflection();
  };

  // Toggle example visibility
  const toggleExample = () => {
    setShowExample(prev => !prev);
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

  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + 1) / roundingOutQuestions.length) * 100;

  // Example answers for each question
  const getExampleAnswer = (questionId: number) => {
    switch (questionId) {
      case 1:
        return "When I'm working on a creative problem or designing something new, I often lose track of time. I also experience flow when I'm fully engaged in deep conversations with my team about important projects.";
      case 2:
        return "Constant notifications, interruptions from colleagues, and switching between too many tasks at once. Also, when I'm feeling overwhelmed or when the task feels either too easy or impossibly difficult.";
      case 3:
        return "A quiet environment, clear objectives, having all the resources I need available, and feeling well-rested. Music also helps me focus, and working during my peak energy hours in the morning.";
      case 4:
        return "I could set specific blocks of uninterrupted time for deep work, turn off notifications during focused work periods, and break larger projects into smaller, manageable challenges that match my skill level.";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Rounding Out: Flow State Mastery
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Now that you've completed the flow assessment, take some time to round out your understanding 
          of flow and how you can create more opportunities for it in your work and life.
        </p>
      </div>

      {/* YouTube Video Player */}
      <div className="mb-8">
        <VideoPlayer
          workshopType="allstarteams"
          stepId="3-3"
          fallbackUrl="https://youtu.be/BBAx5dNZw6Y"
          title="Rounding Out Your Flow Understanding"
          aspectRatio="16:9"
          autoplay={true}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">

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
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Intrinsic motivation</strong> - Driven by personal satisfaction and growth</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="bg-green-50 p-5 rounded-lg border border-green-100 h-full">
            <h3 className="font-medium text-green-800 mb-3 flex items-center">
              <ChevronRight className="h-4 w-4 mr-2 text-green-600" />
              Creating Flow at Work
            </h3>
            <ul className="space-y-2 text-green-700 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Time blocking</strong> - Schedule uninterrupted focus periods</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Environment design</strong> - Minimize distractions and interruptions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Right-sized challenges</strong> - Match tasks to your current skill level</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Progress tracking</strong> - Build in regular feedback loops</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Energy management</strong> - Work during your peak performance hours</span>
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
                  Download Flow Guide
                </a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
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
              rows={4}
            />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="text-gray-600"
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
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    {saving ? 'Saving...' : 'Next: Add Flow to Star Card'}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Completion status removed to avoid confusion during typing */}

        </div>
      )}
    </>
  );
};

export default FlowRoundingOutView;