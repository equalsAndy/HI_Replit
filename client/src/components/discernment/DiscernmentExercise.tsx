import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Eye, Brain, Shield, Search, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DiscernmentResponse {
  stepId: number;
  response: string;
  timestamp: Date;
}

interface DiscernmentData {
  responses: DiscernmentResponse[];
  completedAt?: Date;
  currentStep: number;
}

const DISCERNMENT_STEPS = [
  {
    id: 1,
    title: "The 3-Second Reality Check",
    subtitle: "Rapid Assessment Technique",
    icon: Clock,
    description: "Learn to quickly assess the authenticity of information using your intuitive response within the first 3 seconds.",
    prompt: "Describe a recent situation where you had to quickly determine if information was trustworthy. What did you notice in those first few seconds that influenced your judgment?",
    example: "Example: When I received an urgent email about account suspension, I noticed the sender's email address didn't match the official domain, and the urgency felt manufactured.",
    minLength: 50,
    color: "purple"
  },
  {
    id: 2,
    title: "Source Pattern Recognition",
    subtitle: "Identifying Red Flags",
    icon: Search,
    description: "Develop skills to recognize patterns that indicate artificial generation, manipulation, or unreliable sources.",
    prompt: "Think about content you've encountered recently (articles, videos, social media posts). What specific patterns or details made you question their authenticity?",
    example: "Example: I noticed the article had no author byline, used overly emotional language, and the accompanying image looked artificially enhanced with unusual lighting.",
    minLength: 60,
    color: "blue"
  },
  {
    id: 3,
    title: "Context Evaluation",
    subtitle: "Situational Awareness",
    icon: Brain,
    description: "Practice evaluating the context, timing, and motivation behind information to assess its reliability.",
    prompt: "Describe a time when the context or timing of information made you suspicious. How did considering 'who benefits' from this information affect your assessment?",
    example: "Example: A news story appeared right before a major election, and I noticed it only appeared on partisan websites with no verification from neutral sources.",
    minLength: 70,
    color: "green"
  },
  {
    id: 4,
    title: "Intuitive Validation",
    subtitle: "Trusting Your Instincts",
    icon: Eye,
    description: "Learn to combine gut instincts with logical analysis for more accurate discernment decisions.",
    prompt: "Reflect on a situation where your initial gut feeling about information conflicted with logical analysis. How did you resolve this, and what was the outcome?",
    example: "Example: The data seemed credible, but something felt off. I discovered the research was funded by a company with clear bias, validating my initial skepticism.",
    minLength: 60,
    color: "orange"
  },
  {
    id: 5,
    title: "Personal Discernment Toolkit",
    subtitle: "Your Action Plan",
    icon: Shield,
    description: "Create your personalized set of quick tests and questions for future discernment challenges.",
    prompt: "Based on your reflections, create a personal 'Discernment Toolkit' - list 5 specific questions or checks you will use when evaluating information authenticity in the future.",
    example: "Example: 1) Check the source domain, 2) Look for author credentials, 3) Verify with secondary sources, 4) Check publication date relevance, 5) Trust my initial gut reaction.",
    minLength: 80,
    color: "red"
  }
];

export function DiscernmentExercise() {
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExample, setShowExample] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (responses[currentStep] && responses[currentStep].trim().length > 0) {
        saveProgress();
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [responses, currentStep]);

  // Load existing data on mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/workshop-data/discernment-exercise');
      if (response.success && response.data) {
        const data = response.data;
        const responsesMap: Record<number, string> = {};
        data.responses?.forEach((r: DiscernmentResponse) => {
          responsesMap[r.stepId] = r.response;
        });
        setResponses(responsesMap);
        setCurrentStep(data.currentStep || 1);
      }
    } catch (error) {
      console.error('Error loading discernment exercise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = useCallback(async () => {
    try {
      setIsSaving(true);
      const data: DiscernmentData = {
        responses: Object.entries(responses).map(([stepId, response]) => ({
          stepId: parseInt(stepId),
          response,
          timestamp: new Date()
        })),
        currentStep
      };

      await apiRequest('/api/workshop-data/discernment-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error saving discernment exercise:', error);
      toast({
        title: "Save Error",
        description: "Your response couldn't be saved. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [responses, currentStep, toast]);

  const handleResponseChange = (stepId: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const isStepValid = (stepId: number) => {
    const response = responses[stepId];
    const step = DISCERNMENT_STEPS.find(s => s.id === stepId);
    return response && response.trim().length >= (step?.minLength || 50);
  };

  const canProceed = () => {
    return isStepValid(currentStep);
  };

  const handleNext = () => {
    if (canProceed() && currentStep < DISCERNMENT_STEPS.length) {
      setCurrentStep(currentStep + 1);
      saveProgress();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const data: DiscernmentData = {
        responses: Object.entries(responses).map(([stepId, response]) => ({
          stepId: parseInt(stepId),
          response,
          timestamp: new Date()
        })),
        currentStep,
        completedAt: new Date()
      };

      await apiRequest('/api/workshop-data/discernment-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      toast({
        title: "Exercise Completed!",
        description: "Your discernment exercise has been saved successfully.",
      });
    } catch (error) {
      console.error('Error completing discernment exercise:', error);
      toast({
        title: "Completion Error",
        description: "Unable to mark exercise as complete. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExample = (stepId: number) => {
    setShowExample(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const currentStepData = DISCERNMENT_STEPS.find(step => step.id === currentStep);
  const progress = (currentStep / DISCERNMENT_STEPS.length) * 100;
  const completedSteps = Object.keys(responses).filter(stepId => isStepValid(parseInt(stepId))).length;

  if (isLoading && Object.keys(responses).length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discernment exercise...</p>
        </div>
      </div>
    );
  }

  if (!currentStepData) {
    return <div>Step not found</div>;
  }

  const IconComponent = currentStepData.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Reality Discernment Exercise</h1>
          <div className="text-sm text-gray-500">
            Step {currentStep} of {DISCERNMENT_STEPS.length}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedSteps} of {DISCERNMENT_STEPS.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {DISCERNMENT_STEPS.map((step) => {
              const isCompleted = isStepValid(step.id);
              const isCurrent = step.id === currentStep;
              const StepIcon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                    isCurrent 
                      ? "border-purple-500 bg-purple-50" 
                      : isCompleted 
                        ? "border-green-200 bg-green-50" 
                        : "border-gray-200 bg-gray-50 opacity-60"
                  )}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className="flex items-center">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <StepIcon className={cn(
                        "h-5 w-5 mr-3",
                        isCurrent ? "text-purple-600" : "text-gray-400"
                      )} />
                    )}
                    <div>
                      <div className={cn(
                        "font-medium text-sm",
                        isCurrent ? "text-purple-900" : isCompleted ? "text-green-900" : "text-gray-500"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">{step.subtitle}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Exercise Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center mb-2">
                <IconComponent className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                  <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-700">{currentStepData.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Exercise Prompt */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Exercise Prompt:</h3>
                <p className="text-gray-700">{currentStepData.prompt}</p>
              </div>

              {/* Example Toggle */}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExample(currentStep)}
                  className="mb-3"
                >
                  {showExample[currentStep] ? 'Hide' : 'Show'} Example Response
                </Button>
                
                {showExample[currentStep] && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800 italic">{currentStepData.example}</p>
                  </div>
                )}
              </div>

              {/* Response Area */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Your Response
                  </label>
                  <div className="text-sm text-gray-500">
                    {responses[currentStep]?.length || 0} / {currentStepData.minLength} minimum characters
                  </div>
                </div>
                
                <Textarea
                  placeholder={`Share your thoughts about ${currentStepData.title.toLowerCase()}...`}
                  value={responses[currentStep] || ''}
                  onChange={(e) => handleResponseChange(currentStep, e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                
                {responses[currentStep] && responses[currentStep].length < currentStepData.minLength && (
                  <div className="flex items-center mt-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Please provide at least {currentStepData.minLength} characters for a complete response.
                  </div>
                )}
              </div>

              {/* Auto-save indicator */}
              {isSaving && (
                <div className="text-sm text-gray-500 italic">
                  Saving your progress...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < DISCERNMENT_STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Completing...' : 'Complete Exercise'}
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}