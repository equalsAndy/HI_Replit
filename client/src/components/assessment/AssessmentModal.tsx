import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, X, ArrowLeft, CheckCircle, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AssessmentPieChart } from './AssessmentPieChart';
import { assessmentQuestions, optionCategoryMapping, type AssessmentOption } from '@/data/assessmentQuestions';
import { QuadrantData } from '@shared/schema';
import { calculateQuadrantScores, type RankedOption } from '@/lib/assessmentScoring';

type Option = AssessmentOption;

// Define the StarCard type to match server response
interface StarCardType {
  id: number | null;
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  pending?: boolean;
  createdAt: string;
  imageUrl?: string | null;
  state?: string;
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const { toast } = useToast();
  
  // State management
  const [view, setView] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);
  
  // For drag and drop
  const [draggedOption, setDraggedOption] = useState<Option | null>(null);
  const [rankings, setRankings] = useState<{
    mostLikeMe: Option | null,
    second: Option | null,
    third: Option | null,
    leastLikeMe: Option | null
  }>({
    mostLikeMe: null,
    second: null,
    third: null,
    leastLikeMe: null
  });
  
  // Get existing star card to check if assessment was already completed
  const { data: starCard } = useQuery<StarCardType>({ 
    queryKey: ['/api/starcard'],
    enabled: isOpen,
    staleTime: Infinity
  });
  
  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const totalQuestions = assessmentQuestions.length;
  
  // Check assessment status when modal opens
  useEffect(() => {
    if (isOpen) {
      const checkAssessmentStatus = async () => {
        setIsLoading(true);
        try {
          // If star card exists with scores, show results directly
          if (starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0)) {
            setAssessmentResults({
              thinking: starCard.thinking,
              feeling: starCard.feeling,
              acting: starCard.acting,
              planning: starCard.planning
            });
            setView('results');
            setIsLoading(false);
            return;
          }
          
          // Otherwise try to start a new assessment
          try {
            await fetch('/api/assessment/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include'
            });
          } catch (error) {
            console.error("Error starting assessment:", error);
          }
          
          setView('intro');
          setIsLoading(false);
        } catch (error) {
          console.error("Error checking assessment status:", error);
          setIsLoading(false);
          
          // If we have an error but star card exists, show those results
          if (starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0)) {
            setAssessmentResults({
              thinking: starCard.thinking,
              feeling: starCard.feeling,
              acting: starCard.acting,
              planning: starCard.planning
            });
            setView('results');
          } else {
            setView('intro');
          }
        }
      };
      
      checkAssessmentStatus();
    }
  }, [isOpen, starCard]);
  
  // Reset rankings when question changes
  useEffect(() => {
    if (!isOpen || view !== 'assessment') return;
    
    // Reset rankings when question changes
    setRankings({
      mostLikeMe: null,
      second: null,
      third: null,
      leastLikeMe: null
    });

    // Load existing answer if available
    const existingAnswer = answers[currentQuestion?.id];
    if (existingAnswer) {
      const rankToOption: { [key: number]: Option | null } = {
        1: null, 2: null, 3: null, 4: null
      };

      existingAnswer.forEach(ranked => {
        const option = currentQuestion.options.find(opt => opt.id === ranked.optionId);
        if (option) {
          rankToOption[ranked.rank] = option;
        }
      });

      setRankings({
        mostLikeMe: rankToOption[1],
        second: rankToOption[2],
        third: rankToOption[3],
        leastLikeMe: rankToOption[4]
      });
    }
  }, [currentQuestionIndex, isOpen, answers, view]);
  
  // Start assessment - move from intro to assessment view
  const startAssessment = async () => {
    setView('assessment');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };
  
  // Function to get quadrant scores from answers
  const getQuadrantScores = (): QuadrantData => {
    // Convert answers object to array
    const answersArray = Object.entries(answers).map(([questionId, rankings]) => ({
      questionId: parseInt(questionId),
      rankings
    }));

    // Use the imported calculation function
    return calculateQuadrantScores(answersArray, optionCategoryMapping);
  };
  
  // Complete the assessment
  const completeAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate final results
      const results = getQuadrantScores();
      
      // Format answer data for server
      const formattedAnswers = Object.entries(answers).map(([questionId, rankings]) => ({
        questionId: parseInt(questionId),
        rankings
      }));
      
      // Save to server
      const response = await fetch('/api/assessment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quadrantData: results,
          answers: formattedAnswers
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete assessment');
      }
      
      const data = await response.json();
      
      // Invalidate star card query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      
      // Show toast notification
      toast({
        title: "Assessment Complete!",
        description: "Your Star Card has been created!",
      });
      
      // Set results and show results view
      setAssessmentResults(results);
      setView('results');
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(data);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error completing assessment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Save the current answer and move to next question (or complete)
  const saveAnswerAndContinue = async () => {
    // Check if all spots are filled
    if (!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe) {
      toast({
        title: "Please rank all options",
        description: "You must rank all options before continuing.",
        variant: "destructive"
      });
      return;
    }
    
    // Format the rankings
    const rankingData: RankedOption[] = [
      { optionId: rankings.mostLikeMe.id, rank: 1 },
      { optionId: rankings.second.id, rank: 2 },
      { optionId: rankings.third.id, rank: 3 },
      { optionId: rankings.leastLikeMe.id, rank: 4 }
    ];
    
    // Save answer to local state
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: rankingData
    }));
    
    // Try to save to server (but don't block progress if it fails)
    try {
      await fetch('/api/assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionId: currentQuestion.id,
          ranking: rankingData
        })
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
    
    // Move to next question or complete
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // This is the last question, complete the assessment
      completeAssessment();
    }
  };
  
  // Go back to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Handle clicking on an option
  const placeOptionInNextAvailableSlot = (option: Option) => {
    // Create a new rankings object to modify
    const newRankings = { ...rankings };

    // Find if the option is already in a position
    let optionPreviousPosition: keyof typeof rankings | null = null;

    Object.entries(rankings).forEach(([pos, rankedOption]) => {
      if (rankedOption?.id === option.id) {
        optionPreviousPosition = pos as keyof typeof rankings;
      }
    });

    // If option is already placed somewhere, remove it first
    if (optionPreviousPosition) {
      (newRankings as any)[optionPreviousPosition] = null;
    }

    // Find the next available position
    if (!newRankings.mostLikeMe) {
      newRankings.mostLikeMe = option;
    } else if (!newRankings.second) {
      newRankings.second = option;
    } else if (!newRankings.third) {
      newRankings.third = option;
    } else if (!newRankings.leastLikeMe) {
      newRankings.leastLikeMe = option;
    }

    // Update the state with all changes at once
    setRankings(newRankings);
  };
  
  // Handle click on an option
  const handleOptionClick = (option: Option) => {
    // Only handle click if there's an empty slot
    if (!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe) {
      placeOptionInNextAvailableSlot(option);
    }
  };
  
  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, option: Option) => {
    e.dataTransfer.setData('optionId', option.id);
    setDraggedOption(option);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, position: keyof typeof rankings) => {
    e.preventDefault();
    const optionId = e.dataTransfer.getData('optionId');
    const option = currentQuestion.options.find(opt => opt.id === optionId);

    if (option) {
      // First, save what was previously in the dropped position
      const previousOption = rankings[position];

      // Create a new rankings object to modify
      const newRankings = { ...rankings };

      // Find if the dropped option was already in any position
      let optionPreviousPosition: keyof typeof rankings | null = null;

      Object.entries(rankings).forEach(([pos, rankedOption]) => {
        if (rankedOption?.id === option.id) {
          optionPreviousPosition = pos as keyof typeof rankings;
        }
      });

      // If the option is already ranked somewhere, swap positions
      if (optionPreviousPosition) {
        // Put the previous option from the drop target into the spot where the dragged option came from
        (newRankings as any)[optionPreviousPosition] = previousOption;
      }

      // Place the dragged option in the drop target
      newRankings[position] = option;

      // Update the state with all changes at once
      setRankings(newRankings);
    }

    setDraggedOption(null);
  };
  
  // Auto-complete with demo answers
  const handleDemoAnswers = () => {
    // Pre-fill current question's rankings with random order
    const currentOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    setRankings({
      mostLikeMe: currentOptions[0],
      second: currentOptions[1],
      third: currentOptions[2],
      leastLikeMe: currentOptions[3]
    });
  };
  
  // Progress bar calculation
  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );
  
  // Available options (not yet ranked)
  const availableOptions = currentQuestion?.options.filter(option => 
    option !== rankings.mostLikeMe && 
    option !== rankings.second && 
    option !== rankings.third && 
    option !== rankings.leastLikeMe
  ) || [];
  
  // Continue assessment button
  const continueAssessment = () => {
    onClose();
  };
  
  // Render the intro screen
  const renderIntro = () => (
    <div className="py-4 space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">About this assessment</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>22 questions about how you approach work and collaboration</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Takes approximately 10-15 minutes to complete</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Rank options based on how well they describe you</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Creates your personal Star Card showing your strengths distribution</span>
          </li>
        </ul>
      </div>
      
      <div className="bg-amber-50 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">Instructions</h3>
        <p className="text-sm text-amber-700">
          For each scenario, drag and drop the options to rank them from most like you (1) to least 
          like you (4). There are no right or wrong answers - just be honest about your preferences.
        </p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" /> What you'll get
        </h3>
        <p className="text-sm text-green-700">
          Your personal Star Card showing your unique distribution of strengths across the four 
          dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
          through the rest of the AllStarTeams program.
        </p>
      </div>
      
      <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancel
        </Button>
        <Button 
          onClick={startAssessment} 
          className="w-full sm:w-auto order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
        >
          Start Assessment <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </div>
  );
  
  // Render the assessment questions
  const renderAssessment = () => (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </h3>
        <span className="text-xs text-gray-500">{progressPercentage}% complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div 
          className="bg-indigo-600 h-1.5 rounded-full transition-all" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="bg-white rounded-lg mb-3">
        <h3 className="text-lg font-medium text-indigo-700 mb-4">{currentQuestion.text}</h3>
        
        {/* Options to rank - displayed as draggable items */}
        <div className="mb-4">
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            {availableOptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                {availableOptions.map(option => (
                  <div 
                    key={option.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, option)}
                    onClick={() => handleOptionClick(option)}
                    className="bg-gray-100 rounded-lg flex items-center justify-center p-3 cursor-pointer hover:bg-gray-200 transition-colors shadow relative"
                  >
                    <p className="text-xs sm:text-sm text-center">{option.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">All options have been ranked. You can drag them to reorder.</p>
            )}
          </div>
          
          {/* Ranking slots as drop zones */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'mostLikeMe')}
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.mostLikeMe 
                    ? 'border-transparent bg-indigo-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.mostLikeMe ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe as Option)}
                    className="w-full flex items-center justify-center bg-indigo-100 rounded-lg cursor-move p-2"
                  >
                    <p className="text-xs sm:text-sm text-center">{rankings.mostLikeMe.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center">Drop here</p>
                )}
              </div>
              <p className="mt-1 text-gray-700 text-xs sm:text-sm font-medium">Most like me</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'second')}
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.second 
                    ? 'border-transparent bg-purple-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.second ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.second as Option)}
                    className="w-full flex items-center justify-center bg-purple-100 rounded-lg cursor-move p-2"
                  >
                    <p className="text-xs sm:text-sm text-center">{rankings.second.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center">Drop here</p>
                )}
              </div>
              <p className="mt-1 text-gray-700 text-xs sm:text-sm font-medium">Second</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'third')}
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.third 
                    ? 'border-transparent bg-teal-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.third ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.third as Option)}
                    className="w-full flex items-center justify-center bg-teal-100 rounded-lg cursor-move p-2"
                  >
                    <p className="text-xs sm:text-sm text-center">{rankings.third.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center">Drop here</p>
                )}
              </div>
              <p className="mt-1 text-gray-700 text-xs sm:text-sm font-medium">Third</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'leastLikeMe')}
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.leastLikeMe 
                    ? 'border-transparent bg-rose-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.leastLikeMe ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe as Option)}
                    className="w-full flex items-center justify-center bg-rose-100 rounded-lg cursor-move p-2"
                  >
                    <p className="text-xs sm:text-sm text-center">{rankings.leastLikeMe.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs text-center">Drop here</p>
                )}
              </div>
              <p className="mt-1 text-gray-700 text-xs sm:text-sm font-medium">Least like me</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pb-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDemoAnswers}
              className="h-9 text-xs border-indigo-300 text-indigo-600 hover:text-indigo-700"
            >
              Demo
            </Button>
          </div>
          
          <Button 
            onClick={saveAnswerAndContinue}
            className={`${currentQuestionIndex === totalQuestions - 1 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'} h-10`}
            disabled={!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              'Complete Assessment'
            ) : (
              <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
        
        {/* Cancel button */}
        <div className="mt-4 sm:mt-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1" /> Cancel Assessment
          </Button>
        </div>
      </div>
    </div>
  );
  
  // Render the results screen
  const renderResults = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-xl font-bold text-center">Your AllStarTeams Strengths Profile</h3>
      
      {assessmentResults && (
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-64 h-64 sm:w-72 sm:h-72">
              <AssessmentPieChart
                thinking={assessmentResults.thinking}
                acting={assessmentResults.acting}
                feeling={assessmentResults.feeling}
                planning={assessmentResults.planning}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(1,162,82)] mr-2"></div>
              <span className="text-sm sm:text-base">Thinking: {assessmentResults.thinking}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(241,64,64)] mr-2"></div>
              <span className="text-sm sm:text-base">Acting: {assessmentResults.acting}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(22,126,253)] mr-2"></div>
              <span className="text-sm sm:text-base">Feeling: {assessmentResults.feeling}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(255,203,47)] mr-2"></div>
              <span className="text-sm sm:text-base">Planning: {assessmentResults.planning}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <p className="text-gray-600 text-sm sm:text-base mb-8">
          Your strengths profile has been saved. You can now continue with your learning journey.
        </p>
        
        <Button 
          onClick={continueAssessment}
          className="bg-indigo-600 hover:bg-indigo-700 px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>AllStarTeams Strengths Assessment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {view === 'intro' && "Discover your unique strengths profile with this assessment."}
            {view === 'assessment' && "For each scenario, rank the options from most like you to least like you."}
            {view === 'results' && "Your personal strengths profile based on your assessment."}
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {view === 'intro' && renderIntro()}
            {view === 'assessment' && renderAssessment()}
            {view === 'results' && renderResults()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}