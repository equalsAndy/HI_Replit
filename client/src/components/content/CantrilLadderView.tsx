import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, FileText } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';
import { debounce } from '@/lib/utils';
import { useTestUser } from '@/hooks/useTestUser';
import { validateAtLeastOneField } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';

// Cantril Ladder reflection questions
interface CantrilQuestion {
  id: number;
  key: keyof CantrilFormData;
  title: string;
  question: string;
  description: string;
  placeholder: string;
  section: 'current' | 'future' | 'quarterly';
}

interface CantrilFormData {
  currentFactors: string;
  futureImprovements: string;
  specificChanges: string;
  quarterlyProgress: string;
  quarterlyActions: string;
}

// Cantril Ladder Questions
const cantrilQuestions: CantrilQuestion[] = [
  {
    id: 1,
    key: 'currentFactors',
    title: 'Current Well-being Factors',
    question: 'What factors shape your current rating?',
    description: 'What are the main elements contributing to your current well-being?',
    placeholder: 'Consider your work, relationships, health, finances, and personal growth...',
    section: 'current'
  },
  {
    id: 2,
    key: 'futureImprovements', 
    title: 'Future Vision',
    question: 'What improvements do you envision?',
    description: 'What achievements or changes would make your life better in one year?',
    placeholder: 'Describe specific improvements you hope to see in your life...',
    section: 'future'
  },
  {
    id: 3,
    key: 'specificChanges',
    title: 'Tangible Differences',
    question: 'What will be different?',
    description: 'How will your experience be noticeably different in tangible ways?',
    placeholder: 'Describe concrete changes you\'ll experience...',
    section: 'future'
  },
  {
    id: 4,
    key: 'quarterlyProgress',
    title: 'Quarterly Milestones',
    question: 'What progress would you expect in 3 months?',
    description: 'Name one specific indicator that you\'re moving up the ladder.',
    placeholder: 'Describe a measurable sign of progress...',
    section: 'quarterly'
  },
  {
    id: 5,
    key: 'quarterlyActions',
    title: 'Quarterly Commitments',
    question: 'What actions will you commit to this quarter?',
    description: 'Name 1-2 concrete steps you\'ll take before your first quarterly check-in.',
    placeholder: 'Describe specific actions you\'ll take...',
    section: 'quarterly'
  }
];

// Props interface
interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

const CantrilLadderView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  // Current question navigation
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // READ-ONLY values loaded from visualization data (set in step 4-1)
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(5);
  const [formData, setFormData] = useState<CantrilFormData>({
    currentFactors: '',
    futureImprovements: '',
    specificChanges: '',
    quarterlyProgress: '',
    quarterlyActions: ''
  });
  const { shouldShowDemoButtons } = useTestUser();
  const { updateContext, setCurrentStep: setFloatingAIStep } = useFloatingAI();
  
  // Workshop status for testing
  const { astCompleted: workshopCompleted, loading: workshopLoading } = useWorkshopStatus();
  // Remove unused test variable - using workshopCompleted directly
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  // Fetch user's actual wellbeing data from the visualization API
  const { data: visualizationData } = useQuery({
    queryKey: ['/api/visualization'],
    staleTime: 0
  });

  // Fetch assessment data to load saved ladder values
  const { data: userAssessments } = useQuery({
    queryKey: ['/api/user/assessments'],
    staleTime: 0
  });

  // Load persisted values from assessment data first, then visualization API as fallback
  useEffect(() => {
    let ladderLoaded = false;
    
    // Try to load from assessment data first (highest priority)
    if (userAssessments && typeof userAssessments === 'object') {
      const assessmentData = userAssessments as Record<string, any>;
      const cantrilData = assessmentData.cantrilLadder || assessmentData.assessments?.cantrilLadder;
      
      if (cantrilData && cantrilData.wellBeingLevel !== undefined && cantrilData.futureWellBeingLevel !== undefined) {
        console.log('CantrilLadder: Loading from assessment data:', cantrilData);
        setWellBeingLevel(cantrilData.wellBeingLevel);
        setFutureWellBeingLevel(cantrilData.futureWellBeingLevel);
        ladderLoaded = true;
      }
    }
    
    // Fallback to visualization API if no assessment data found
    if (!ladderLoaded && visualizationData) {
      const data = visualizationData as any;
      
      if (data && data.wellBeingLevel !== undefined) {
        setWellBeingLevel(data.wellBeingLevel);
      } else {
        setWellBeingLevel(5); // Default value
      }
      
      if (data && data.futureWellBeingLevel !== undefined) {
        setFutureWellBeingLevel(data.futureWellBeingLevel);
      } else {
        setFutureWellBeingLevel(5); // Default value
      }
      
      console.log('CantrilLadder: Loading from visualization data:', data?.wellBeingLevel || 5, data?.futureWellBeingLevel || 5);
    }
    
    // If no data found anywhere, use defaults
    if (!ladderLoaded && !visualizationData) {
      setWellBeingLevel(5);
      setFutureWellBeingLevel(5);
      console.log('CantrilLadder: Using default values (5, 5)');
    }
  }, [visualizationData, userAssessments]);

  // Load existing text data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('CantrilLadderView: Loading existing data...');
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          credentials: 'include'
        });
        const result = await response.json();
        console.log('CantrilLadderView: API response:', result);
        
        if (result.success && result.data) {
          console.log('CantrilLadderView: Setting form data:', result.data);
          setFormData(result.data);
        } else {
          console.log('CantrilLadderView: No existing data found or API failed');
        }
      } catch (error) {
        console.log('CantrilLadderView: Error loading data:', error);
      }
    };
    
    loadExistingData();
  }, []);

  // Set up FloatingAI context for step 4-2 with current question context
  useEffect(() => {
    setFloatingAIStep('4-2');
    
    const currentQuestionData = cantrilQuestions[currentQuestion];
    updateContext({
      stepName: 'Cantril Ladder Reflection',
      strengthLabel: undefined,
      questionText: currentQuestionData?.question,
      aiEnabled: true,
      workshopContext: {
        currentStep: '4-2',
        stepName: 'Cantril Ladder Reflection - Well-being Analysis',
        previousSteps: [
          'Completed strengths assessment and discovered your Star Card',
          'Explored individual strengths in detail through reflection',
          'Learned about Flow states and completed Flow assessment',
          'Set your current and future well-being levels on the Cantril Ladder'
        ],
        currentTask: `Reflecting on Cantril Ladder question ${currentQuestion + 1} of ${cantrilQuestions.length}`,
        questionContext: {
          questionNumber: currentQuestion + 1,
          totalQuestions: cantrilQuestions.length,
          currentQuestion: currentQuestionData?.question,
          hint: currentQuestionData?.description,
          allQuestions: cantrilQuestions.map(q => q.question),
          currentSection: currentQuestionData?.section,
          wellBeingLevels: {
            current: wellBeingLevel,
            future: futureWellBeingLevel
          }
        }
      }
    });
  }, [currentQuestion, updateContext, setFloatingAIStep, wellBeingLevel, futureWellBeingLevel]);

  // Navigation functions
  const nextQuestion = () => {
    if (currentQuestion < cantrilQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Get current question data
  const currentQuestionData = cantrilQuestions[currentQuestion];
  const currentValue = formData[currentQuestionData.key];

  // Debounced save function for text inputs only (ladder values are READ-ONLY from step 4-1)
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...dataToSave
            // DO NOT include ladder values - they are read-only from step 4-1
          })
        });
        
        const result = await response.json();
        if (result.success) {
          // console.log('Cantril Ladder reflections auto-saved successfully');
        }
      } catch (error) {
        console.error('Cantril Ladder auto-save failed:', error);
      }
    }, 1000),
    [] // No dependencies on ladder values since they're read-only
  );

  // Trigger save only when form data changes (NOT ladder values) and workshop not locked
  useEffect(() => {
    // Don't auto-save if workshop is locked
    if (workshopCompleted) {
      return;
    }
    
    if (Object.values(formData).some(value => value && typeof value === 'string' && value.trim().length > 0)) {
      // console.log('Cantril Ladder reflections auto-saving...'); // Reduced logging
      debouncedSave(formData);
    }
  }, [formData, debouncedSave, workshopCompleted]);

  // Handle text input changes
  const handleInputChange = (field: keyof CantrilFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError && value.trim().length >= 10) {
      setValidationError('');
    }
  };

  // Function to populate with meaningful demo data
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoData = {
      currentFactors: "My current well-being is shaped by meaningful work that aligns with my strengths, supportive relationships with colleagues and family, good physical health through regular exercise, and financial stability. I feel energized when I can use my planning and analytical skills to solve complex problems.",
      futureImprovements: "In one year, I envision having greater autonomy in my role, leading a high-performing team that leverages everyone's strengths effectively, maintaining excellent work-life balance, and feeling confident about my career trajectory. I want to be recognized as a go-to person for strategic thinking and team development.",
      specificChanges: "I'll have more flexible work arrangements, be managing or mentoring team members, have completed a leadership development program, improved my public speaking skills, and established better boundaries between work and personal time. My stress levels will be lower and my sense of purpose higher.",
      quarterlyProgress: "I'll have initiated at least two process improvements using my analytical skills, received positive feedback on a leadership opportunity I've taken on, and established a consistent routine for professional development. I'll notice feeling more confident in meetings and decision-making.",
      quarterlyActions: "I will schedule monthly one-on-ones with my manager to discuss growth opportunities, sign up for a leadership workshop or online course, volunteer to lead a cross-functional project, and implement a weekly planning routine that aligns my daily work with my long-term goals."
    };
    
    setFormData(demoData);
    // Jump to the last question
    setCurrentQuestion(cantrilQuestions.length - 1);
  };

  // Handle next step with validation
  const handleNextStep = async () => {
    // Validate that at least one field is filled (minimum 10 characters)
    const validation = validateAtLeastOneField(formData, 10);
    
    if (!validation.isValid) {
      const errorMessage = validation.errors[0]?.message || 'Please complete at least one field to continue';
      setValidationError(errorMessage);
      return;
    }
    
    // Clear any validation error
    setValidationError('');
    
    try {
      // Mark step as completed (this unlocks the next step)
      markStepCompleted('4-2');
      
      // Navigate to step 4-3 (Visualizing You) 
      setCurrentContent('visualizing-you');
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Cantril Ladder Well-being Reflection
      </h1>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {cantrilQuestions.length}</span>
          <span>{currentQuestionData.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestion + 1) / cantrilQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Top row: Ladder and Well-being Levels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* SVG Ladder */}
        <div className="flex justify-center">
          <div className="w-full">
            <WellBeingLadderSvg 
              currentValue={wellBeingLevel}
              futureValue={futureWellBeingLevel}
            />
          </div>
        </div>

        {/* Well-being levels display */}
        <div className="flex items-center">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 w-full">
            <h3 className="text-lg font-medium text-blue-800 mb-4">Your Well-being Levels</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <div className="text-sm text-gray-700">Current Level:</div>
                <div className="text-2xl font-bold text-blue-600">Level {wellBeingLevel}</div>
              </div>
              <div className={`${futureWellBeingLevel < wellBeingLevel ? 'bg-red-50 border-red-200' : 'bg-white'} p-4 rounded border`}>
                <div className="text-sm text-gray-700">Future Level (1 year):</div>
                <div className={`text-2xl font-bold ${futureWellBeingLevel < wellBeingLevel ? 'text-red-600' : 'text-green-600'}`}>
                  Level {futureWellBeingLevel}
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-600 italic mt-3">
              Set in the previous step
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row: Current question section spanning full width */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentQuestionData.question}
            </h2>
            <p className="text-gray-600 text-sm">
              {currentQuestionData.description}
            </p>
          </div>

          <div className="mb-6">
            <textarea
              value={currentValue}
              onChange={(e) => handleInputChange(currentQuestionData.key, e.target.value)}
              disabled={workshopCompleted}
              readOnly={workshopCompleted}
              className={`w-full h-40 p-4 border border-gray-300 rounded-md resize-none ${
                workshopCompleted ? 'opacity-60 cursor-not-allowed bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder={currentQuestionData.placeholder}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Your task: Write 2-3 sentences about this reflection</span>
              <span>{currentValue.length} characters</span>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0 || workshopCompleted}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {shouldShowDemoButtons && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fillWithDemoData}
                  disabled={workshopCompleted}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Demo
                </Button>
              )}

              {currentQuestion < cantrilQuestions.length - 1 ? (
                <Button
                  onClick={nextQuestion}
                  disabled={workshopCompleted}
                  className="flex items-center gap-2"
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNextStep}
                  disabled={workshopCompleted}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next: Visualizing You
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question context info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">
            All Reflection Questions:
          </h4>
          <ol className="text-sm text-gray-600 space-y-1">
            {cantrilQuestions.map((q, index) => (
              <li 
                key={q.id} 
                className={`${index === currentQuestion ? 'font-medium text-blue-600' : ''} ${
                  formData[q.key].trim().length > 0 ? 'text-green-600' : ''
                }`}
              >
                {index + 1}. {q.question} {formData[q.key].trim().length > 0 ? '✓' : ''}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Validation error display */}
      {validationError && (
        <div className="mb-4">
          <ValidationMessage 
            message={validationError} 
            type="error" 
            show={!!validationError}
          />
        </div>
      )}
    </>
  );
};

export default CantrilLadderView;