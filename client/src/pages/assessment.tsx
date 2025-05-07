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
      // Check if the option is already ranked
      Object.entries(rankings).forEach(([pos, currentOption]) => {
        if (currentOption?.id === option.id) {
          setRankings(prev => ({
            ...prev,
            [pos]: null
          }));
        }
      });
      
      // Set the option in the dropped position
      setRankings(prev => ({
        ...prev,
        [position]: option
      }));
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
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">English 🇺🇸</span>
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/user-home">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <Link href="/user-home">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-medium text-indigo-700 mb-6">{currentQuestion.text}</h3>
          
          {/* Options to rank - displayed as draggable squares */}
          <div className="mb-10">
            <div className="bg-amber-50 p-6 rounded-lg mb-8">
              {availableOptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableOptions.map(option => (
                    <div 
                      key={option.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, option)}
                      className="bg-gray-200 p-4 rounded-lg text-center flex items-center justify-center aspect-square cursor-move hover:bg-gray-300 transition-colors shadow"
                    >
                      <p className="text-sm">{option.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">All options have been ranked. You can drag them to reorder.</p>
              )}
            </div>
            
            {/* Ranking Slots as drop zones */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'mostLikeMe')}
                  className={`border-2 border-dashed rounded-lg p-4 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.mostLikeMe 
                      ? 'border-transparent bg-green-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.mostLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe as Option)}
                      className="w-full h-full flex items-center justify-center bg-green-100 rounded-md cursor-move"
                    >
                      <p className="text-sm text-center p-2">{rankings.mostLikeMe.text}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Drop here</p>
                  )}
                </div>
                <p className="mt-2 text-gray-700 font-medium">Most like me</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'second')}
                  className={`border-2 border-dashed rounded-lg p-4 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.second 
                      ? 'border-transparent bg-blue-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.second ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.second as Option)}
                      className="w-full h-full flex items-center justify-center bg-blue-100 rounded-md cursor-move"
                    >
                      <p className="text-sm text-center p-2">{rankings.second.text}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Drop here</p>
                  )}
                </div>
                <p className="mt-2 text-gray-700 font-medium">Second</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'third')}
                  className={`border-2 border-dashed rounded-lg p-4 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.third 
                      ? 'border-transparent bg-yellow-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.third ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.third as Option)}
                      className="w-full h-full flex items-center justify-center bg-yellow-100 rounded-md cursor-move"
                    >
                      <p className="text-sm text-center p-2">{rankings.third.text}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Drop here</p>
                  )}
                </div>
                <p className="mt-2 text-gray-700 font-medium">Third</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'leastLikeMe')}
                  className={`border-2 border-dashed rounded-lg p-4 aspect-square w-full flex items-center justify-center transition-colors ${
                    rankings.leastLikeMe 
                      ? 'border-transparent bg-red-100' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.leastLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe as Option)}
                      className="w-full h-full flex items-center justify-center bg-red-100 rounded-md cursor-move"
                    >
                      <p className="text-sm text-center p-2">{rankings.leastLikeMe.text}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">Drop here</p>
                  )}
                </div>
                <p className="mt-2 text-gray-700 font-medium">Least like me</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleContinue}
              className={`px-8 ${currentQuestionIndex === totalQuestions - 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
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