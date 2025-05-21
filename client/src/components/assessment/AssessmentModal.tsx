import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);
  
  // Get existing star card to check if assessment was already completed
  const { data: starCard } = useQuery<StarCardType>({ 
    queryKey: ['/api/starcard'],
    enabled: isOpen,
    staleTime: Infinity
  });
  
  // Drag and drop state
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
            setShowResults(true);
            setIsLoading(false);
            return;
          }
          
          // Otherwise try to start a new assessment
          await startAssessment.mutateAsync();
          setIsLoading(false);
        } catch (error) {
          console.error("Error starting assessment:", error);
          setIsLoading(false);
          
          // If we have an error but star card exists, show those results
          if (starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0)) {
            setAssessmentResults({
              thinking: starCard.thinking,
              feeling: starCard.feeling,
              acting: starCard.acting,
              planning: starCard.planning
            });
            setShowResults(true);
          }
        }
      };
      
      checkAssessmentStatus();
    }
  }, [isOpen, starCard]);
  
  // Reset rankings when question changes
  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [currentQuestionIndex, isOpen, answers]);
  
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
  
  // Start assessment mutation
  const startAssessment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/assessment/start', {});
      return await res.json();
    },
    onError: (error) => {
      // If assessment already exists (409), show results
      if (String(error).includes("409")) {
        // Skip toast notification and quietly load results
        return;
      }

      toast({
        title: "Error starting assessment",
        description: String(error),
        variant: "destructive"
      });
    }
  });
  
  // Save answer mutation
  const saveAnswer = useMutation({
    mutationFn: async (data: { questionId: number, rankings: RankedOption[] }) => {
      // Convert to the format expected by the server
      const res = await apiRequest('POST', '/api/assessment/answer', {
        questionId: data.questionId,
        ranking: data.rankings  // Use 'ranking' parameter to match the server schema
      });
      return await res.json();
    },
    onError: (error: any) => {
      // Don't show errors if related to an assessment that's already completed
      console.log("Save answer error:", error);
      
      // Only show error toast for non-completed assessment errors
      if (!String(error).includes("Assessment already completed")) {
        toast({
          title: "Error saving answer",
          description: String(error),
          variant: "destructive"
        });
      }
    },
    onSuccess: () => {
      // Move to next question or complete
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // Complete assessment
        completeAssessment.mutate();
      }
    }
  });
  
  // Complete assessment mutation
  const completeAssessment = useMutation({
    mutationFn: async () => {
      // Calculate final results
      const results = getQuadrantScores();

      // Format answer data for server
      const formattedAnswers = Object.entries(answers).map(([questionId, rankings]) => ({
        questionId: parseInt(questionId),
        rankings: rankings
      }));
      
      // Save to server
      const res = await apiRequest('POST', '/api/assessment/complete', {
        quadrantData: results,
        answers: formattedAnswers
      });

      return await res.json();
    },
    onSuccess: (data) => {
      // Store the StarCard data directly in the query cache
      queryClient.setQueryData(['/api/starcard'], data);
      
      toast({
        title: "Assessment Complete!",
        description: "Your Star Card has been created!"
      });
      
      // Show the results 
      setAssessmentResults({
        thinking: data.thinking,
        feeling: data.feeling,
        acting: data.acting,
        planning: data.planning
      });
      setShowResults(true);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error) => {
      toast({
        title: "Error completing assessment",
        description: String(error),
        variant: "destructive"
      });
    }
  });
  
  // Available options (not yet ranked)
  const availableOptions = currentQuestion?.options.filter(option => 
    option !== rankings.mostLikeMe && 
    option !== rankings.second && 
    option !== rankings.third && 
    option !== rankings.leastLikeMe
  ) || [];
  
  // Function to place option in the next available slot
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
  
  // Handle continue button
  const handleContinue = () => {
    // Check if all spots are filled
    if (!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe) {
      toast({
        title: "Please rank all options",
        description: "You must rank all options before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Create answer data
    const rankingData: RankedOption[] = [
      { optionId: rankings.mostLikeMe.id, rank: 1 },
      { optionId: rankings.second.id, rank: 2 },
      { optionId: rankings.third.id, rank: 3 },
      { optionId: rankings.leastLikeMe.id, rank: 4 }
    ];

    // Save to local state
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: rankingData
    }));
    
    // For last question, just complete the assessment
    if (currentQuestionIndex === totalQuestions - 1) {
      // Save the answer and complete
      saveAnswer.mutate({
        questionId: currentQuestion.id,
        rankings: rankingData
      });
    } else {
      // Just save this answer and move to next question
      saveAnswer.mutate({
        questionId: currentQuestion.id,
        rankings: rankingData
      });
    }
  };
  
  // Handle back button
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Auto-complete with demo answers
  const handleDemoAnswers = () => {
    // Pre-fill all answers
    const demoAnswers: {[key: number]: RankedOption[]} = {};
    
    assessmentQuestions.forEach((question) => {
      // Create a shuffled copy of options
      const shuffledOptions = [...question.options]
        .sort(() => Math.random() - 0.5)
        .map((option, index) => ({
          optionId: option.id,
          rank: index + 1
        }));
      
      demoAnswers[question.id] = shuffledOptions;
    });
    
    // Set current question's rankings
    const currentOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    setRankings({
      mostLikeMe: currentOptions[0],
      second: currentOptions[1],
      third: currentOptions[2],
      leastLikeMe: currentOptions[3]
    });
    
    // Save all answers
    setAnswers(demoAnswers);
  };
  
  // Progress bar calculation
  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );
  
  // Cancel assessment
  const handleCancel = () => {
    if (Object.keys(answers).length > 0) {
      if (window.confirm("Are you sure you want to cancel? Your progress will be lost.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>AllStarTeams Strengths Assessment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            For each scenario, rank the options from most like you to least like you.
          </DialogDescription>
        </DialogHeader>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        
        {/* Results display */}
        {!isLoading && showResults && assessmentResults && (
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold text-center">Your AllStarTeams Strengths Profile</h3>
            
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="w-full max-w-xs">
                  <AssessmentPieChart
                    thinking={assessmentResults.thinking}
                    acting={assessmentResults.acting}
                    feeling={assessmentResults.feeling}
                    planning={assessmentResults.planning}
                  />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
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
            
            <p className="text-gray-600 text-sm sm:text-base text-center">
              Your strengths profile has been saved. You can now continue with your learning journey.
            </p>
            
            <div className="flex justify-center">
              <Button 
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {/* Assessment questions */}
        {!isLoading && !showResults && currentQuestion && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h3>
              <span className="text-xs text-gray-500">{progressPercentage}% complete</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3">
              <h3 className="text-lg font-medium text-indigo-700 mb-3">{currentQuestion.text}</h3>
              
              {/* Options to rank - displayed as draggable items */}
              <div className="mb-4">
                <div className="bg-amber-50 p-4 rounded-lg mb-4">
                  {availableOptions.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
                      {availableOptions.map(option => (
                        <div 
                          key={option.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, option)}
                          onClick={() => handleOptionClick(option)}
                          className="bg-gray-100 rounded-lg flex items-center justify-center aspect-square w-full md:w-[70%] md:mx-auto cursor-pointer hover:bg-gray-200 transition-colors shadow p-2 relative"
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
                  <div className="flex flex-col items-center">
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'mostLikeMe')}
                      className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full md:w-[70%] md:mx-auto flex items-center justify-center transition-colors ${
                        rankings.mostLikeMe 
                          ? 'border-transparent bg-indigo-100' 
                          : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                      }`}
                    >
                      {rankings.mostLikeMe ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe as Option)}
                          className="w-full h-full flex items-center justify-center bg-indigo-100 rounded-lg cursor-move p-2 md:p-1 aspect-square"
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
                      className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full md:w-[70%] md:mx-auto flex items-center justify-center transition-colors ${
                        rankings.second 
                          ? 'border-transparent bg-purple-100' 
                          : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                      }`}
                    >
                      {rankings.second ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, rankings.second as Option)}
                          className="w-full h-full flex items-center justify-center bg-purple-100 rounded-lg cursor-move p-2 md:p-1 aspect-square"
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
                      className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full md:w-[70%] md:mx-auto flex items-center justify-center transition-colors ${
                        rankings.third 
                          ? 'border-transparent bg-teal-100' 
                          : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                      }`}
                    >
                      {rankings.third ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, rankings.third as Option)}
                          className="w-full h-full flex items-center justify-center bg-teal-100 rounded-lg cursor-move p-2 md:p-1 aspect-square"
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
                      className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full md:w-[70%] md:mx-auto flex items-center justify-center transition-colors ${
                        rankings.leastLikeMe 
                          ? 'border-transparent bg-rose-100' 
                          : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                      }`}
                    >
                      {rankings.leastLikeMe ? (
                        <div 
                          draggable
                          onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe as Option)}
                          className="w-full h-full flex items-center justify-center bg-rose-100 rounded-lg cursor-move p-2 md:p-1 aspect-square"
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
              
              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDemoAnswers}
                    size="sm"
                    className="text-xs border-indigo-300 text-indigo-600 hover:text-indigo-700"
                  >
                    Demo Answers
                  </Button>
                </div>
                
                <Button 
                  onClick={handleContinue}
                  className={`${currentQuestionIndex === totalQuestions - 1 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  disabled={!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe}
                >
                  {currentQuestionIndex === totalQuestions - 1 ? (
                    'Complete'
                  ) : (
                    <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !showResults && (
          <DialogFooter className="px-4">
            <Button 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel Assessment
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}