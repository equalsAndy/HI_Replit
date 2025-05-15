import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle } from "lucide-react";
import { AssessmentQuestion as QuestionType, RankedOption, AssessmentOption } from "@shared/schema";

interface AssessmentQuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  onComplete: (rankings: RankedOption[]) => void;
  onReturn: () => void;
}

export default function AssessmentQuestion({
  question,
  questionNumber,
  totalQuestions,
  onComplete,
  onReturn
}: AssessmentQuestionProps) {
  const { toast } = useToast();
  const [rankings, setRankings] = useState<RankedOption[]>([]);
  const [draggedOptionId, setDraggedOptionId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<{[key: string]: number}>({});
  const [autoAdvance, setAutoAdvance] = useState(false);
  
  // Order options by default (needed if we want a consistent display)
  const options = [...question.options].sort((a, b) => a.id.localeCompare(b.id));

  // Save answer to server
  const saveAnswer = useMutation({
    mutationFn: async () => {
      // Filter out only the items that have been ranked
      const rankingsToSave = options
        .filter(option => ranking[option.id] > 0)
        .map(option => ({
          optionId: option.id,
          rank: ranking[option.id]
        }));
      
      // Ensure we have rankings before submitting
      if (rankingsToSave.length === 0) {
        throw new Error("Please rank the options before proceeding");
      }
      
      const payload = {
        questionId: question.id,
        rankings: rankingsToSave  // Use 'rankings' key as expected by the API
      };
      
      const res = await apiRequest('POST', '/api/assessment/answer', payload);
      return res.json();
    },
    onSuccess: () => {
      // Only include options that have been ranked for consistent handling
      const formattedRankings = options
        .filter(option => ranking[option.id] > 0)
        .map(option => ({
          optionId: option.id,
          rank: ranking[option.id]
        }));
      onComplete(formattedRankings);
    },
    onError: (error) => {
      toast({
        title: "Failed to save answer",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Handle drag start
  const handleDragStart = (optionId: string) => {
    setDraggedOptionId(optionId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedOptionId(null);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetRank: number) => {
    e.preventDefault();
    if (draggedOptionId) {
      setRanking(prev => ({
        ...prev,
        [draggedOptionId]: targetRank
      }));
    }
  };

  // Handle click to select a rank
  const handleRankSelect = (optionId: string, rank: number) => {
    // First, check if this rank is already assigned
    const currentOwner = Object.entries(ranking).find(([id, r]) => r === rank);
    
    // If there's already an option with this rank, swap them
    if (currentOwner) {
      const currentOptionId = currentOwner[0];
      setRanking(prev => ({
        ...prev,
        [currentOptionId]: ranking[optionId] || 0,
        [optionId]: rank
      }));
    } else {
      // Just assign the new rank
      setRanking(prev => ({
        ...prev,
        [optionId]: rank
      }));
    }
  };

  // Check if the form is complete (all options have rankings)
  const isComplete = options.every(option => ranking[option.id] > 0);

  // Effect to auto-advance when all options are ranked
  useEffect(() => {
    if (autoAdvance && isComplete) {
      // Add a short delay to give user time to see their selection
      const timer = setTimeout(() => {
        handleContinue();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [ranking, autoAdvance]);

  // Handle form submission
  const handleContinue = () => {
    if (isComplete) {
      saveAnswer.mutate();
    } else {
      toast({
        title: "Please rank all options",
        description: "Please assign a rank to each option before continuing.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="assessment-question mb-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Question {questionNumber} of {totalQuestions}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onReturn}>
          Return to Dashboard
        </Button>
      </div>
      
      <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
        <h3 className="text-xl text-primary font-medium mb-6">{question.text}</h3>
        
        <div 
          className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-8 min-h-20 grid grid-cols-4 gap-4"
          onDragOver={handleDragOver}
        >
          {[1, 2, 3, 4].map(rank => (
            <div 
              key={rank} 
              className="flex-1 h-16 border border-dashed border-neutral-300 rounded flex items-center justify-center"
              onDrop={(e) => handleDrop(e, rank)}
            >
              {Object.entries(ranking).map(([optionId, r]) => {
                if (r === rank) {
                  const option = options.find(o => o.id === optionId);
                  return (
                    <div key={optionId} className="p-2 bg-neutral-100 rounded text-sm text-center">
                      {option?.text}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map(option => (
            <div 
              key={option.id}
              className={`assessment-card ${ranking[option.id] ? 'ring-2 ring-primary' : ''}`}
              draggable
              onDragStart={() => handleDragStart(option.id)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!ranking[option.id]) {
                  // Find first available rank
                  const usedRanks = Object.values(ranking);
                  for (let i = 1; i <= 4; i++) {
                    if (!usedRanks.includes(i)) {
                      handleRankSelect(option.id, i);
                      break;
                    }
                  }
                }
              }}
            >
              <div className="flex justify-between">
                <div>{option.text}</div>
                {ranking[option.id] && (
                  <div className="font-bold">Rank: {ranking[option.id]}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-advance" 
              checked={autoAdvance}
              onCheckedChange={(checked) => setAutoAdvance(!!checked)}
            />
            <label
              htmlFor="auto-advance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto Advance
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Check the box to advance to the next question after you have ranked each one. You can always go back and adjust your answers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex justify-between mt-6 items-center">
          <div className="flex space-x-16">
            <div className="text-sm">Most like me</div>
            <div className="text-sm">Least like me</div>
          </div>
          <Button 
            onClick={handleContinue}
            disabled={!isComplete || saveAnswer.isPending}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {saveAnswer.isPending ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
