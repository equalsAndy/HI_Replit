import { useState } from 'react';
import { CheckCircle2, XCircle, CheckSquare, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { cn } from '@/lib/utils';

interface KnowledgeCheckOption {
  id: string;
  text: string;
  correct: boolean;
  feedback?: string;
}

interface KnowledgeCheckProps {
  id: string;
  question: string;
  options: KnowledgeCheckOption[];
  onComplete?: (correct: boolean) => void;
}

export function KnowledgeCheck({
  id,
  question,
  options,
  onComplete
}: KnowledgeCheckProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { markStepCompleted } = useNavigationProgress();
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!isSubmitted) {
      setSelectedOptionId(optionId);
    }
  };
  
  // Handle submitting the answer
  const handleSubmit = () => {
    if (!selectedOptionId) return;
    
    const selectedOption = options.find(opt => opt.id === selectedOptionId);
    const correct = !!selectedOption?.correct;
    
    setIsCorrect(correct);
    setIsSubmitted(true);
    
    // Always mark as completed, regardless of correctness
    markStepCompleted(id);
    
    // Call the callback if provided
    if (onComplete) {
      onComplete(correct);
    }
  };
  
  // Handle continuing to next section
  const handleContinue = () => {
    // This is intentionally empty as navigation is handled by the parent component
    // We've already marked this step as completed
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-indigo-50 border-b border-indigo-100 p-4">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-indigo-900">Knowledge Check</h3>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Test your understanding of the material covered so far.
        </p>
      </div>
      
      <div className="p-5">
        <p className="text-base font-medium text-gray-900 mb-4">{question}</p>
        
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const showCorrectness = isSubmitted;
            const isCorrectOption = option.correct;
            
            return (
              <div
                key={option.id}
                className={cn(
                  "border rounded-md p-3 cursor-pointer transition-all",
                  isSelected 
                    ? "border-indigo-400 bg-indigo-50" 
                    : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50",
                  showCorrectness && isCorrectOption && "border-green-400 bg-green-50",
                  showCorrectness && isSelected && !isCorrectOption && "border-red-400 bg-red-50"
                )}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {showCorrectness ? (
                      isCorrectOption ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        isSelected ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <div className="h-5 w-5 border border-gray-300 rounded-sm" />
                        )
                      )
                    ) : (
                      isSelected ? (
                        <CheckSquare className="h-5 w-5 text-indigo-600" />
                      ) : (
                        <div className="h-5 w-5 border border-gray-300 rounded-sm" />
                      )
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-indigo-700" : "text-gray-700",
                      showCorrectness && isCorrectOption && "text-green-700",
                      showCorrectness && isSelected && !isCorrectOption && "text-red-700"
                    )}>
                      {option.text}
                    </p>
                  </div>
                </div>
                
                {/* Feedback text */}
                {showCorrectness && (isSelected || isCorrectOption) && option.feedback && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-sm ml-8"
                    >
                      <p className={cn(
                        isCorrectOption ? "text-green-600" : "text-red-600"
                      )}>
                        {option.feedback}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleContinue}
              variant={isCorrect ? "default" : "outline"}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}