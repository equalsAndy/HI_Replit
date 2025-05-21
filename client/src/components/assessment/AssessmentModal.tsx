import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AssessmentPieChart } from './AssessmentPieChart';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionOption {
  id: string;
  text: string;
  quadrant: string;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface DraggableOptionProps {
  option: QuestionOption;
  position: number;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

// Sample questions from the assessment screenshot
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    text: "When solving a problem at work, I typically...",
    options: [
      { id: "1a", text: "Look at the facts and think through different solutions", quadrant: "thinking" },
      { id: "1b", text: "Talk with colleagues to hear their concerns and ideas", quadrant: "feeling" },
      { id: "1c", text: "Jump in quickly to find a practical fix", quadrant: "acting" },
      { id: "1d", text: "Create a step-by-step plan to tackle the issue", quadrant: "planning" }
    ]
  },
  {
    id: 2,
    text: "In team meetings, I tend to focus on...",
    options: [
      { id: "2a", text: "Analyzing information and identifying key insights", quadrant: "thinking" },
      { id: "2b", text: "Building consensus and ensuring everyone feels heard", quadrant: "feeling" },
      { id: "2c", text: "Moving the discussion toward concrete actions", quadrant: "acting" },
      { id: "2d", text: "Establishing clear processes and timelines", quadrant: "planning" }
    ]
  },
  {
    id: 3,
    text: "When working on a project, I'm at my best when...",
    options: [
      { id: "3a", text: "I can explore ideas and think conceptually", quadrant: "thinking" },
      { id: "3b", text: "I'm connecting with people and understanding their needs", quadrant: "feeling" },
      { id: "3c", text: "I'm taking action and producing tangible results", quadrant: "acting" },
      { id: "3d", text: "I'm organizing tasks and creating structure", quadrant: "planning" }
    ]
  },
  {
    id: 4,
    text: "When faced with change, my first reaction is to...",
    options: [
      { id: "4a", text: "Analyze why the change is happening and its implications", quadrant: "thinking" },
      { id: "4b", text: "Consider how people will be affected and how to support them", quadrant: "feeling" },
      { id: "4c", text: "Start adapting quickly and look for opportunities", quadrant: "acting" },
      { id: "4d", text: "Create a roadmap for navigating the transition", quadrant: "planning" }
    ]
  },
  {
    id: 5,
    text: "I find it most satisfying when I can...",
    options: [
      { id: "5a", text: "Solve complex problems and find innovative solutions", quadrant: "thinking" },
      { id: "5b", text: "Build meaningful relationships and help others succeed", quadrant: "feeling" },
      { id: "5c", text: "Take initiative and make things happen", quadrant: "acting" },
      { id: "5d", text: "Create efficient systems and monitor progress", quadrant: "planning" }
    ]
  }
];

// Position labels
const POSITION_LABELS = [
  "Most like me",
  "Second",
  "Third",
  "Least like me"
];

// DraggableOption component
function DraggableOption({ option, position }: DraggableOptionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white p-4 my-2 rounded-lg shadow border border-gray-200 cursor-move"
      {...attributes} 
      {...listeners}
    >
      <p className="text-sm md:text-base">{option.text}</p>
    </div>
  );
}

// Droppable Area component
function DroppableArea({ position, items = [], questionOptions }: { 
  position: number; 
  items: string[];
  questionOptions: QuestionOption[];
}) {
  // Find the actual option objects that match the ids in items
  const optionsInPosition = items.map(id => 
    questionOptions.find(option => option.id === id)
  ).filter(Boolean) as QuestionOption[];

  return (
    <div className="w-full">
      <div className="min-h-[80px] p-2 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
        {optionsInPosition.length === 0 ? (
          <div className="text-gray-400 p-4">Drop here</div>
        ) : (
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {optionsInPosition.map(option => (
              <DraggableOption key={option.id} option={option} position={position} />
            ))}
          </SortableContext>
        )}
      </div>
      <p className="text-center mt-2 font-medium">{POSITION_LABELS[position]}</p>
    </div>
  );
}

export function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sortedOptions, setSortedOptions] = useState<{ [key: number]: string[][] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get existing star card to check if assessment was already completed
  const { data: starCard } = useQuery({ 
    queryKey: ['/api/starcard'],
    enabled: isOpen
  });
  
  useEffect(() => {
    if (isOpen) {
      if (starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0)) {
        // Star card exists with scores, show results directly
        setResults({
          thinking: starCard.thinking || 0,
          acting: starCard.acting || 0,
          feeling: starCard.feeling || 0,
          planning: starCard.planning || 0
        });
        setIsLoading(false);
      } else {
        // Start new assessment
        initializeAssessment();
      }
    }
  }, [isOpen, starCard]);
  
  // Initialize new assessment
  const initializeAssessment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to start a new assessment on the server
      await apiRequest('POST', '/api/assessment/start', {});
      
      // Set up the questions and initial state
      setQuestions(SAMPLE_QUESTIONS);
      setCurrentQuestionIndex(0);
      setSortedOptions({});
      setResults(null);
    } catch (err: any) {
      // If this fails because an assessment is already in progress,
      // we'll need to manually reset it or create a force reset option
      if (err.message && err.message.includes('completed or in progress')) {
        setError('An assessment is already in progress. Please reset your assessment data or continue with your current assessment.');
      } else {
        setError('There was an error starting your assessment. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentQuestionIndex(0);
      setSortedOptions({});
      setResults(null);
      setError(null);
      setDemoModeEnabled(false);
    }
  }, [isOpen]);
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion.id;
    
    // Get the current state for this question or initialize it
    const currentSorted = sortedOptions[questionId] || [[], [], [], []];
    
    // Find which arrays contain the dragged item
    let sourceIndex = -1;
    let sourceArray: string[] = [];
    
    for (let i = 0; i < currentSorted.length; i++) {
      if (currentSorted[i].includes(active.id as string)) {
        sourceIndex = i;
        sourceArray = [...currentSorted[i]];
        break;
      }
    }
    
    // Find the target array index from the over.id
    const targetId = String(over.id);
    let targetIndex = parseInt(targetId.split('-')[1], 10);
    
    // If target is not a drop area, it's another item
    if (isNaN(targetIndex)) {
      // Find which array contains the target item
      for (let i = 0; i < currentSorted.length; i++) {
        if (currentSorted[i].includes(targetId)) {
          targetIndex = i;
          break;
        }
      }
    }
    
    // Don't do anything if source and target are the same or if invalid indices
    if (sourceIndex === targetIndex || sourceIndex === -1 || targetIndex === -1) return;
    
    // Remove from source array
    const newSourceArray = sourceArray.filter(id => id !== active.id);
    
    // Add to target array (if there's already an item, swap them)
    const newTargetArray = [...currentSorted[targetIndex]];
    
    // If the target already has an item and the source doesn't have space
    if (newTargetArray.length >= 1 && newSourceArray.length >= 1) {
      // Just add the dragged item to the target (replacing any existing item)
      newTargetArray.splice(0, newTargetArray.length, active.id as string);
    } else {
      // Add the dragged item to target
      newTargetArray.push(active.id as string);
    }
    
    // Create new state
    const newSorted = [...currentSorted];
    newSorted[sourceIndex] = newSourceArray;
    newSorted[targetIndex] = newTargetArray;
    
    // Update state
    setSortedOptions({
      ...sortedOptions,
      [questionId]: newSorted
    });
  };
  
  // Toggle demo mode
  const toggleDemoMode = () => {
    if (!demoModeEnabled) {
      // Pre-fill answers for demo
      const demoAnswers: { [key: number]: string[][] } = {};
      
      questions.forEach((question, index) => {
        const options = [...question.options];
        const shuffled = options.sort(() => 0.5 - Math.random());
        
        demoAnswers[question.id] = [
          [shuffled[0].id],
          [shuffled[1].id],
          [shuffled[2].id],
          [shuffled[3].id]
        ];
      });
      
      setSortedOptions(demoAnswers);
    } else {
      // Clear answers
      setSortedOptions({});
    }
    
    setDemoModeEnabled(!demoModeEnabled);
  };
  
  // Check if current question is complete (all options are placed)
  const isCurrentQuestionComplete = () => {
    if (!questions[currentQuestionIndex]) return false;
    
    const questionId = questions[currentQuestionIndex].id;
    const currentSorted = sortedOptions[questionId] || [[], [], [], []];
    
    // Count total items in all positions
    const totalPlaced = currentSorted.reduce((total, position) => total + position.length, 0);
    
    // Check if all options are placed
    return totalPlaced === questions[currentQuestionIndex].options.length;
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // If this is the last question, show results
      submitAssessment();
    }
  };
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Cancel assessment
  const cancelAssessment = () => {
    // Check if there are any answers
    const hasAnswers = Object.keys(sortedOptions).length > 0;
    
    if (hasAnswers) {
      // Show confirmation if there are answers
      if (window.confirm("Are you sure you want to cancel? All your answers will be lost.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Reset assessment
  const resetAssessment = async () => {
    if (window.confirm("Are you sure you want to reset your assessment? All your data will be lost.")) {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentQuestionIndex(0);
        setSortedOptions({});
        setResults(null);
        setDemoModeEnabled(false);
        
        // Reload questions
        setQuestions(SAMPLE_QUESTIONS);
        setIsLoading(false);
      } catch (error) {
        toast({
          title: "Error resetting assessment",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Submit assessment answers
  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate results based on the answers
      const quadrantScores = {
        thinking: 0,
        acting: 0,
        feeling: 0,
        planning: 0
      };
      
      // Process each question's ranking
      Object.entries(sortedOptions).forEach(([questionId, positions]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (!question) return;
        
        // Assign points based on position (inverted: position 0 = 4pts, position 3 = 1pt)
        positions.forEach((optionIds, positionIndex) => {
          optionIds.forEach(optionId => {
            const option = question.options.find(o => o.id === optionId);
            if (!option) return;
            
            // Calculate points (4 for position 0, 3 for position 1, etc.)
            const points = 4 - positionIndex;
            
            // Add points to the corresponding quadrant
            if (option.quadrant in quadrantScores) {
              quadrantScores[option.quadrant as keyof typeof quadrantScores] += points;
            }
          });
        });
      });
      
      // Calculate total points
      const totalPoints = Object.values(quadrantScores).reduce((sum, points) => sum + points, 0);
      
      // Convert to percentages
      const result = {
        thinking: Math.round((quadrantScores.thinking / totalPoints) * 100),
        acting: Math.round((quadrantScores.acting / totalPoints) * 100),
        feeling: Math.round((quadrantScores.feeling / totalPoints) * 100),
        planning: Math.round((quadrantScores.planning / totalPoints) * 100)
      };
      
      // Ensure percentages add up to 100
      const total = result.thinking + result.acting + result.feeling + result.planning;
      if (total !== 100) {
        // Find highest value and adjust it
        const highestQuadrant = Object.entries(result).reduce(
          (highest, [key, value]) => value > highest.value ? { key, value } : highest, 
          { key: '', value: 0 }
        );
        
        // Adjust the highest value
        result[highestQuadrant.key as keyof typeof result] += (100 - total);
      }
      
      // Set results
      setResults(result);
      
      // Save to server
      try {
        // In production, we would complete the assessment with the API
        await apiRequest('POST', '/api/assessment/complete', { quadrants: result });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      } catch (err) {
        // Just log the error but still show the results since we have them
        console.error('Error saving assessment results to server:', err);
      }
      
      // Notify completion
      toast({
        title: "Assessment Completed",
        description: "Your strengths profile has been created.",
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      toast({
        title: "Error processing assessment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render the drag and drop question UI
  const renderDragDropQuestion = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="py-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={resetAssessment}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Reset Assessment
            </Button>
          </div>
        </div>
      );
    }
    
    if (!questions.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-center text-gray-500 mb-4">No assessment questions available.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion.id;
    const currentSorted = sortedOptions[questionId] || [[], [], [], []];
    
    // Collect all option IDs that are already placed
    const placedOptionIds = currentSorted.flat();
    
    // Get unplaced options
    const unplacedOptions = currentQuestion.options.filter(
      option => !placedOptionIds.includes(option.id)
    );
    
    // Create array of all option IDs
    const allOptionIds = currentQuestion.options.map(option => option.id);
    
    // Progress percentage
    const progressPercentage = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
    
    return (
      <div className="px-2 sm:px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Question {currentQuestionIndex + 1} of {questions.length}</h3>
          <div className="text-sm text-gray-500">
            {progressPercentage}% complete
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded mb-4">
          <div 
            className="h-1 bg-indigo-600 rounded transition-all" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Question text */}
        <div className="mb-6 p-4 bg-[#f8f9fe] rounded-lg">
          <p className="text-base sm:text-lg font-medium text-[#4F46E5]">{currentQuestion.text}</p>
        </div>
        
        {/* Drag and drop area */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Unplaced options */}
          {unplacedOptions.length > 0 && (
            <div className="mb-6 p-4 bg-[#fffbf1] rounded-lg">
              <p className="mb-3 text-sm text-gray-500">Drag each option to rank them from most to least like you:</p>
              <SortableContext items={unplacedOptions.map(o => o.id)} strategy={verticalListSortingStrategy}>
                {unplacedOptions.map(option => (
                  <DraggableOption key={option.id} option={option} position={-1} />
                ))}
              </SortableContext>
            </div>
          )}
          
          {/* Drop areas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[0, 1, 2, 3].map(position => (
              <DroppableArea 
                key={`position-${position}`} 
                position={position} 
                items={currentSorted[position] || []}
                questionOptions={currentQuestion.options}
              />
            ))}
          </div>
        </DndContext>
        
        {/* Navigation buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between mt-8">
          <div className="mt-3 sm:mt-0">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="w-full sm:w-auto mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={toggleDemoMode}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              {demoModeEnabled ? "Clear Answers" : "Demo Answers"}
            </Button>
          </div>
          
          <Button 
            onClick={goToNextQuestion}
            disabled={!isCurrentQuestionComplete() || isSubmitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : currentQuestionIndex < questions.length - 1 ? (
              <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
            ) : (
              'Complete Assessment'
            )}
          </Button>
        </div>
      </div>
    );
  };
  
  // Render results
  const renderResults = () => {
    if (!results) return null;
    
    const { thinking, acting, feeling, planning } = results;
    
    return (
      <div className="p-2 sm:p-4 space-y-6">
        <h3 className="text-xl font-bold text-center">Your AllStarTeams Strengths Profile</h3>
        
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <AssessmentPieChart
                thinking={thinking || 0}
                acting={acting || 0}
                feeling={feeling || 0}
                planning={planning || 0}
              />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(1,162,82)] mr-2"></div>
              <span className="text-sm sm:text-base">Thinking: {thinking}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(241,64,64)] mr-2"></div>
              <span className="text-sm sm:text-base">Acting: {acting}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(22,126,253)] mr-2"></div>
              <span className="text-sm sm:text-base">Feeling: {feeling}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(255,203,47)] mr-2"></div>
              <span className="text-sm sm:text-base">Planning: {planning}%</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm sm:text-base">
          Your strengths profile has been saved. You can now continue with your learning journey.
        </p>
        
        <Button 
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Continue
        </Button>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && cancelAssessment()}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sm:px-2">
          <div className="flex items-center justify-between">
            <DialogTitle>AllStarTeams Strengths Assessment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={cancelAssessment} className="h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            For each scenario, rank the options from most like you to least like you by dragging them to the appropriate position.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2 sm:py-4">
          {results ? renderResults() : renderDragDropQuestion()}
        </div>
        
        {!isLoading && !error && !results && (
          <DialogFooter className="px-2 sm:px-4">
            <Button 
              variant="outline" 
              onClick={cancelAssessment}
            >
              Cancel Assessment
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}