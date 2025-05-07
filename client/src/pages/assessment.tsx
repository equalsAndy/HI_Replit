import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { assessmentQuestions, optionCategoryMapping, type AssessmentOption } from '@/data/assessmentQuestions';
import { QuadrantData } from '@shared/schema';
import { calculateQuadrantScores, type RankedOption } from '@/lib/assessmentScoring';

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
  
  // Current question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [progress, setProgress] = useState<number>(0);
  
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
      const res = await apiRequest('POST', '/api/assessment/answer', data);
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
        description: "Your results are ready to view."
      });
      navigate('/report');
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
        // Need to cast to avoid type errors
        newRankings[optionPreviousPosition] = previousOption as (Option | null);
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
      // Complete assessment - calculate results and go to report page
      const results = getQuadrantScores();
      console.log("Assessment Results:", results);
      
      // In a real app, we would submit these results to the server
      // completeAssessment.mutate();
      
      toast({
        title: "Assessment Complete!",
        description: "Your results are ready to view."
      });
      navigate('/report');
    }
  };
  
  // Progress bar calculation
  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-md text-xs h-8" asChild>
              <Link href="/user-home">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-3 py-2 max-w-3xl">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableOptions.map(option => (
                    <div 
                      key={option.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, option)}
                      className="bg-gray-100 rounded-lg flex items-center justify-center aspect-square w-full cursor-move hover:bg-gray-200 transition-colors shadow p-2"
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'mostLikeMe')}
                  className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.mostLikeMe 
                      ? 'border-transparent bg-indigo-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.mostLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe as Option)}
                      className="w-full h-full flex items-center justify-center bg-indigo-100 rounded-lg cursor-move p-2"
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
                  className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.second 
                      ? 'border-transparent bg-purple-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.second ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.second as Option)}
                      className="w-full h-full flex items-center justify-center bg-purple-100 rounded-lg cursor-move p-2"
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
                  className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.third 
                      ? 'border-transparent bg-teal-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.third ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.third as Option)}
                      className="w-full h-full flex items-center justify-center bg-teal-100 rounded-lg cursor-move p-2"
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
                  className={`border-2 border-dashed rounded-lg p-2 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.leastLikeMe 
                      ? 'border-transparent bg-rose-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.leastLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe as Option)}
                      className="w-full h-full flex items-center justify-center bg-rose-100 rounded-lg cursor-move p-2"
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
      </main>
    </div>
  );
}