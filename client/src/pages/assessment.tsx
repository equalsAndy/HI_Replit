import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define question types
type Option = {
  id: string;
  text: string;
  category: 'thinking' | 'acting' | 'feeling' | 'planning';
};

type Question = {
  id: number;
  text: string;
  options: Option[];
};

type RankedOption = {
  optionId: string;
  rank: number; // 1 = most like me, 4 = least like me
};

// Sample question data (normally would come from API)
const sampleQuestions: Question[] = [
  {
    id: 1,
    text: 'When solving a problem at work, I typically...',
    options: [
      { id: '1a', text: 'Look at the facts and think through different solutions', category: 'thinking' },
      { id: '1b', text: 'Talk with colleagues to hear their concerns and ideas', category: 'feeling' },
      { id: '1c', text: 'Jump in quickly to find a practical fix', category: 'acting' },
      { id: '1d', text: 'Create a step-by-step plan to tackle the issue', category: 'planning' }
    ]
  },
  {
    id: 2,
    text: 'When starting a new project, I prefer to...',
    options: [
      { id: '2a', text: 'Start working right away and adjust as I go', category: 'acting' },
      { id: '2b', text: 'Get to know my teammates and build good working relationships', category: 'feeling' },
      { id: '2c', text: 'Break down the work into clear steps with deadlines', category: 'planning' },
      { id: '2d', text: 'Consider different approaches before deciding how to proceed', category: 'thinking' }
    ]
  },
  {
    id: 3,
    text: 'In a meeting, I am most likely to...',
    options: [
      { id: '3a', text: 'Offer logical analysis of the situation', category: 'thinking' },
      { id: '3b', text: 'Focus on how the decision will affect people', category: 'feeling' },
      { id: '3c', text: 'Push for immediate action and results', category: 'acting' },
      { id: '3d', text: 'Ensure we have a clear process and timeline', category: 'planning' }
    ]
  }
];

export default function Assessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Current question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  
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
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const totalQuestions = sampleQuestions.length;
  
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
      const res = await apiRequest('POST', '/api/assessment/complete', {});
      return await res.json();
    },
    onSuccess: () => {
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
    
    // Send to server (commented out for now)
    // saveAnswer.mutate({ questionId: currentQuestion.id, rankings: rankingData });
    
    // For demo, just go to next question
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Complete assessment - for demo just go to report page
      toast({
        title: "Assessment Complete!",
        description: "Your results are ready to view."
      });
      navigate('/report');
    }
  };
  
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
            <Button variant="destructive" size="sm" className="rounded-md">Logout</Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h2>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      ? 'border-transparent bg-gray-200' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.mostLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe)}
                      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md cursor-move"
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
                      ? 'border-transparent bg-gray-200' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.second ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.second)}
                      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md cursor-move"
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
                      ? 'border-transparent bg-gray-200' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.third ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.third)}
                      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md cursor-move"
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
                      ? 'border-transparent bg-gray-200' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                  }`}
                >
                  {rankings.leastLikeMe ? (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe)}
                      className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md cursor-move"
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