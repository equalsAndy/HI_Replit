import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { assessmentQuestions, optionCategoryMapping, type AssessmentOption } from '@/data/assessmentQuestions';
import { QuadrantData } from '@shared/schema';
import { calculateQuadrantScores, type RankedOption } from '@/lib/assessmentScoring';
import MainContainer from '@/components/layout/MainContainer';
import { useDemoMode } from '@/hooks/use-demo-mode';

// Define question types - match the types from data file
type Option = AssessmentOption;

type Question = {
  id: number;
  text: string;
  options: Option[];
};

export default function Assessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemoMode();

  // Current question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [progress, setProgress] = useState<number>(0);
  const [showResultsPopup, setShowResultsPopup] = useState<boolean>(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);

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
      const res = await apiRequest('POST', '/api/assessment/answer', {
        questionId: data.questionId,
        ranking: data.rankings  // Changed from 'rankings' to 'ranking' to match the server schema
      });
      return await res.json();
    },
    onSuccess: () => {
      // Move to next question or complete
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        // Complete assessment
        completeAssessment.mutate();
      }
    },
    onError: (error) => {
      toast({
        title: "Error saving answer",
        description: String(error),
        variant: "destructive"
      });
    }
  });

  // Start assessment mutation
  const startAssessment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/assessment/start', {});
      return await res.json();
    },
    onError: (error) => {
      // Ignore "Assessment already exists" errors (409)
      if (error.message.includes("409")) {
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

      // Save to server
      const res = await apiRequest('POST', '/api/assessment/complete', {
        quadrantData: results,
        answers: Object.entries(answers).map(([questionId, rankings]) => ({
          questionId: parseInt(questionId),
          rankings
        }))
      });

      return await res.json();
    },
    onSuccess: () => {
      // Update user progress
      const updateProgress = async () => {
        try {
          await apiRequest('PUT', '/api/user/progress', { progress: 100 });
          queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
        } catch (error) {
          console.error("Failed to update progress:", error);
        }
      };
      updateProgress();

      toast({
        title: "Assessment Complete!",
        description: "Your Star Card is ready to view."
      });
      navigate('/foundations?tab=starcard');
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

    // Update progress based on local state
    const newProgress = Math.floor(((Object.keys(answers).length + 1) / totalQuestions) * 100);

    // For demo, just go to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Complete assessment - calculate results and show popup
      const results = getQuadrantScores();
      console.log("Assessment Results:", results);

      // In a real app, we would submit these results to the server
      // completeAssessment.mutate();

      // Set the results and show the popup
      setAssessmentResults(results);
      setShowResultsPopup(true);

      toast({
        title: "Assessment Complete!",
        description: "Your results are ready to view."
      });
    }
  };

  // Progress bar calculation
  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );

  // Function to close the popup and navigate to the report page
  const handleCloseResultsPopup = () => {
    setShowResultsPopup(false);
    navigate('/report');
  };

  // Auto-complete the assessment with random answers for demo purposes
  const autoCompleteAssessment = async () => {
    try {
      // First, start the assessment
      await startAssessment.mutateAsync();

      const newAnswers: {[key: number]: RankedOption[]} = {};

      // Process each question sequentially
      for (const question of assessmentQuestions) {
        // Create a copy of the options array
        const options = [...question.options];

        // Shuffle the options randomly
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        // Create ranking data
        const rankingData: RankedOption[] = [
          { optionId: options[0].id, rank: 1 },
          { optionId: options[1].id, rank: 2 },
          { optionId: options[2].id, rank: 3 },
          { optionId: options[3].id, rank: 4 }
        ];

        // Save answer to server first
        await apiRequest('POST', '/api/assessment/answer', {
          questionId: question.id,
          ranking: rankingData  // Changed from 'rankings' to 'ranking' to match the server schema
        });

        // Then store locally
        newAnswers[question.id] = rankingData;
      }

      // Set answers locally
      setAnswers(newAnswers);

      // Calculate and validate results
      const results = calculateQuadrantScores(
        Object.entries(newAnswers).map(([questionId, rankings]) => ({
          questionId: parseInt(questionId),
          rankings
        })), 
        optionCategoryMapping
      );

      // Validate results
      if (!results || Object.values(results).some(val => val === null)) {
        throw new Error("Invalid results calculated");
      }

      // Complete the assessment
      await completeAssessment.mutateAsync();

      // Navigate to report page
      navigate('/report');

      toast({
        title: "Assessment Auto-Completed",
        description: "Navigating to your Star Card..."
      });
    } catch (error) {
      console.error("Error in auto-complete:", error);
      toast({
        title: "Auto-Complete Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <MainContainer showStepNavigation={false} className="bg-gray-50">
      {/* Results Popup */}
      {showResultsPopup && assessmentResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Strength Assessment Results</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Thinking:</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${assessmentResults.thinking}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-indigo-600">{assessmentResults.thinking}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Acting:</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full" 
                      style={{ width: `${assessmentResults.acting}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-purple-600">{assessmentResults.acting}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Feeling:</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-teal-600 h-2.5 rounded-full" 
                      style={{ width: `${assessmentResults.feeling}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-teal-600">{assessmentResults.feeling}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Planning:</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-rose-600 h-2.5 rounded-full" 
                      style={{ width: `${assessmentResults.planning}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-bold text-rose-600">{assessmentResults.planning}%</span>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-indigo-800 mb-2">Your Top Strength: {assessmentResults.apexStrength}</h3>
              <p className="text-gray-700 text-sm">
                {assessmentResults.apexStrength === 'Thinking' && 'You excel at analytical thinking and problem-solving. Your ability to process complex information and make logical decisions is your standout strength.'}
                {assessmentResults.apexStrength === 'Acting' && 'You are action-oriented and decisive. Your ability to implement ideas and make things happen is your standout strength.'}
                {assessmentResults.apexStrength === 'Feeling' && 'You have strong emotional intelligence and empathy. Your ability to understand and connect with others is your standout strength.'}
                {assessmentResults.apexStrength === 'Planning' && 'You are organized and strategic. Your ability to plan ahead and create structure is your standout strength.'}
              </p>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleCloseResultsPopup}
                className="px-8 bg-indigo-600 hover:bg-indigo-700"
              >
                Continue to Star Card
              </Button>
            </div>
          </div>
        </div>
      )}

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

          {/* Auto-complete button (visible only in demo mode) */}
          <Button 
            onClick={() => {
              // Fill answers with random data
              const newAnswers: {[key: number]: RankedOption[]} = {};
              
              assessmentQuestions.forEach((question) => {
                // Create a shuffled copy of options
                const shuffledOptions = [...question.options]
                  .sort(() => Math.random() - 0.5)
                  .map((option, index) => ({
                    optionId: option.id,
                    rank: index + 1
                  }));
                
                newAnswers[question.id] = shuffledOptions;
              });
              
              // Set all answers and move to last question
              setAnswers(newAnswers);
              setCurrentQuestionIndex(assessmentQuestions.length - 1);
              
              // Set rankings for last question display
              const lastQuestion = assessmentQuestions[assessmentQuestions.length - 1];
              const lastAnswers = newAnswers[lastQuestion.id];
              
              const newRankings = {
                mostLikeMe: lastQuestion.options.find(opt => opt.id === lastAnswers[0].optionId) || null,
                second: lastQuestion.options.find(opt => opt.id === lastAnswers[1].optionId) || null,
                third: lastQuestion.options.find(opt => opt.id === lastAnswers[2].optionId) || null,
                leastLikeMe: lastQuestion.options.find(opt => opt.id === lastAnswers[3].optionId) || null
              };
              
              setRankings(newRankings);
            }}
            variant="outline"
            size="sm"
            className="text-xs border-indigo-300 text-indigo-600 hover:text-indigo-700"
          >
            Demo Answers
          </Button>
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
    </MainContainer>
  );
}