import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { assessmentQuestions, optionCategoryMapping, type AssessmentOption } from '@/data/assessmentQuestions';
import { youthAssessmentQuestions, optionCategoryMapping as youthOptionCategoryMapping } from '@/data/youthAssessmentQuestions';
// Import QuadrantData type directly to fix import error
interface QuadrantData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}
import { calculateQuadrantScores, type RankedOption } from '@/lib/assessmentScoring';
import MainContainer from '@/components/layout/MainContainer';
import { useTestUser } from '@/hooks/useTestUser';
import { AssessmentPieChart } from '@/components/assessment/AssessmentPieChart';

type Option = AssessmentOption;

type Question = {
  id: number;
  text: string;
  options: Option[];
};

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
}

export default function Assessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shouldShowDemoButtons } = useTestUser();

  // Get current user data to determine content access preference
  const { data: userData } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      role?: string;
      contentAccess?: string;
      isTestUser: boolean;
    }
  }>({ 
    queryKey: ['/api/auth/me']
  });

  // Determine which question set to use based on content access preference
  // Check contentAccess first (for admin/facilitator interface toggle), then fall back to role
  const isStudentContent = userData?.user?.contentAccess === 'student' || userData?.user?.role === 'student';
  const currentAssessmentQuestions = isStudentContent ? youthAssessmentQuestions : assessmentQuestions;
  const currentOptionCategoryMapping = isStudentContent ? youthOptionCategoryMapping : optionCategoryMapping;

  // Get star card data to check if assessment is already completed
  const { data: starCard, isLoading: loadingStarCard } = useQuery<StarCardType>({
    queryKey: ['/api/starcard'],
    staleTime: 0, // Always fetch fresh data from database
    gcTime: 0, // Don't cache the data
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
  });

  // Current question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [progress, setProgress] = useState<number>(0);
  const [showResultsPopup, setShowResultsPopup] = useState<boolean>(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);

  // Check assessment status when page loads
  React.useEffect(() => {
    // Function to check if assessment is already completed
    const checkAssessmentStatus = async () => {
      try {
        // Try to start an assessment to check if it's allowed
        const res = await fetch('/api/assessment/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        const data = await res.json();

        // If we get a 409 status, the assessment is already completed or in progress
        if (res.status === 409) {
          console.log("Assessment is already completed or in progress, showing results");

          if (!loadingStarCard && starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning) {
            // Set assessment results and show results popup
            // Set assessment results without showing toast messages
            setAssessmentResults({
              thinking: starCard.thinking,
              feeling: starCard.feeling,
              acting: starCard.acting,
              planning: starCard.planning
            });
            setShowResultsPopup(true);
          }
        } else {
          console.log("Assessment can be taken");
        }
      } catch (error) {
        console.error("Error checking assessment status:", error);
      }
    };

    // Run the check
    checkAssessmentStatus();
  }, [loadingStarCard, starCard, navigate, toast]);

  // Helper function to check if starCard has valid scores
  const hasCompletedAssessment = (card: StarCardType): boolean => {
    if (!card) return false;

    // Check if any quadrant score is greater than 0
    return (
      card.thinking > 0 ||
      card.acting > 0 ||
      card.feeling > 0 ||
      card.planning > 0
    );
  };

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

  const currentQuestion = currentAssessmentQuestions[currentQuestionIndex];
  const totalQuestions = currentAssessmentQuestions.length;

  // Update progress when answers change
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;
    const newProgress = Math.floor((answeredCount / totalQuestions) * 100);
    setProgress(newProgress);
  }, [answers, totalQuestions]);

  // Initialize rankings when question changes
  React.useEffect(() => {
    // Reset rankings when question changes
    setRankings({
      mostLikeMe: null,
      second: null,
      third: null,
      leastLikeMe: null
    });

    // Load existing answer if available
    const existingAnswer = answers[currentQuestion.id];
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
  }, [currentQuestionIndex, currentQuestion.id]);

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

  // Save answer mutation
  const saveAnswer = useMutation({
    mutationFn: async (data: { questionId: number, rankings: RankedOption[] }) => {
      // Convert to the format expected by the server
      const res = await fetch('/api/assessment/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionId: data.questionId,
          ranking: data.rankings  // Use 'ranking' parameter to match the server schema
        })
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

  // Start assessment mutation
  const startAssessment = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      return await res.json();
    },
    onError: (error) => {
      // If assessment already exists (409), show a friendly message
      if (error.message.includes("409")) {
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

  // Complete assessment mutation
  const completeAssessment = useMutation({
    mutationFn: async () => {
      // Calculate final results
      const results = getQuadrantScores();

      // Log the scores we're sending to verify they're correct
      console.log("Assessment Results:", results);

      // Format answer data for server
      const formattedAnswers = Object.entries(answers).map(([questionId, rankings]) => ({
        questionId: parseInt(questionId),
        rankings: rankings // Make sure this matches what the server expects
      }));

      console.log("Submitting formatted answers:", formattedAnswers);

      // Save to server - send the quadrant data
      const res = await fetch('/api/assessment/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quadrantData: results
        })
      });

      // This will return the updated star card data
      return await res.json();
    },
    onSuccess: (data) => {
        // The server now returns the updated StarCard data
        console.log("Assessment completed successfully. StarCard data:", data);

        // Make sure data has the correct structure and values
        const starCardData = {
          id: data.id,
          userId: data.userId,
          thinking: data.thinking || 0,
          acting: data.acting || 0,
          feeling: data.feeling || 0,
          planning: data.planning || 0,
          createdAt: data.createdAt || new Date().toISOString()
        };
        
        // Store the formatted StarCard data directly in the query cache
        queryClient.setQueryData(['/api/starcard'], starCardData);
        
        // Also invalidate the starcard query to force a refresh
        queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
        queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });

        // Update user progress
        const updateProgress = async () => {
          try {
            await fetch('/api/user/progress', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ progress: 100 })
            });
            // Invalidate user profile query to refresh progress data
            queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
          } catch (error) {
            console.error("Failed to update progress:", error);
          }
        };
        updateProgress();

        toast({
          title: "Assessment Complete!",
          description: "Your Star Card has been created!"
        });

        // Show the results popup with verified data
        // Force data to be numeric for consistent handling
        const thinking = Number(data.thinking) || 25;
        const feeling = Number(data.feeling) || 25;
        const acting = Number(data.acting) || 25;
        const planning = Number(data.planning) || 25;
        
        console.log("Setting assessment results:", {thinking, feeling, acting, planning});
        
        setAssessmentResults({
          thinking: thinking,
          feeling: feeling,
          acting: acting,
          planning: planning
        });
        
        // Force modal to appear after a short delay
        setTimeout(() => {
          setShowResultsPopup(true);
          console.log("Assessment modal should now be visible");
        }, 300);
      },
    onError: (error) => {
      // Removed error toast - assessment completion handles errors gracefully
      console.log("Assessment completion attempted with local results calculation");
    }
  });

  // Available options (not yet ranked)
  const availableOptions = currentQuestion.options.filter(option => 
    option !== rankings.mostLikeMe && 
    option !== rankings.second && 
    option !== rankings.third && 
    option !== rankings.leastLikeMe
  );

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
        // TypeScript needs help here
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

    // Save the answer to the server
    saveAnswer.mutate({
      questionId: currentQuestion.id,
      rankings: rankingData
    });

    // Update progress based on local state
    const newProgress = Math.floor(((Object.keys(answers).length + 1) / totalQuestions) * 100);

    // For demo, just go to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Complete assessment - calculate results
      const results = getQuadrantScores();
      console.log("Assessment Results:", results);

      // Submit these results to the server and redirect to home on success
      completeAssessment.mutate();

      // Toast notification
      toast({
        title: "Assessment Complete!",
        description: "Redirecting you to see your results..."
      });
    }
  };

  // Progress bar calculation
  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );

  // Results popup handler removed as we now auto-redirect


  return (
    <MainContainer showStepNavigation={false} className="bg-gray-50">
      {/* Results popup removed to auto-redirect to foundations page */}

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-row justify-between items-center mb-2 gap-2">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-sm font-semibold text-gray-800">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h2>
              <span className="text-xs text-gray-500">{progressPercentage}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3">
          <h3 className="text-lg font-medium text-indigo-700 mb-3">{currentQuestion.text}</h3>

          {/* Options to rank - displayed as draggable squares */}
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

            {/* Ranking Slots as drop zones */}
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

          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              className={`px-8 ${currentQuestionIndex === totalQuestions - 1 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              disabled={!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe}
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResultsPopup && assessmentResults && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Star Strengths Results</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <span className="font-semibold text-indigo-700">Congratulations!</span> You've completed the assessment and created your unique Star Card showing your strengths across four key dimensions.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Your Star Card will guide your personal development journey and help you identify areas where you shine and where you can grow. The workshop activities will help you explore these dimensions in depth.
              </p>

              <div className="flex justify-center items-center w-full mb-6 h-[350px]">
                <AssessmentPieChart 
                  thinking={assessmentResults?.thinking || 0}
                  acting={assessmentResults?.acting || 0}
                  feeling={assessmentResults?.feeling || 0}
                  planning={assessmentResults?.planning || 0}
                />
              </div>

              <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                {Object.entries({
                  thinking: { color: 'bg-green-600', label: 'Analytical & logical approach', value: assessmentResults?.thinking || 0 },
                  acting: { color: 'bg-red-600', label: 'Decisive & action-oriented', value: assessmentResults?.acting || 0 },
                  feeling: { color: 'bg-blue-600', label: 'Empathetic & relationship-focused', value: assessmentResults?.feeling || 0 },
                  planning: { color: 'bg-yellow-600', label: 'Organized & methodical', value: assessmentResults?.planning || 0 }
                })
                .sort(([,a], [,b]) => b.value - a.value)
                .map(([key, { color, label, value }]) => (
                  <div key={key} className="flex items-center">
                    <div className={`w-4 h-4 ${color} rounded-sm mr-2`}></div>
                    <span className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}: {value}%</span>
                    <span className="ml-2 text-xs text-gray-500">- {label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowResultsPopup(false);
                }}
              >
                Close
              </Button>
              <Button 
                variant="default"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setShowResultsPopup(false);
                  // Navigate to foundations page with starcard tab selected
                  navigate('/foundations?tab=starcard');
                }}
              >
                Continue to Your Star Card
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}