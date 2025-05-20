import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface KnowledgeCheckOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

interface KnowledgeCheckProps {
  id: string;
  question: string;
  options: KnowledgeCheckOption[];
  onComplete?: (correct: boolean) => void;
}

export default function KnowledgeCheck({
  id,
  question,
  options,
  onComplete
}: KnowledgeCheckProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  
  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const selectedAnswer = options.find(option => option.id === selectedOption);
    const correct = !!selectedAnswer?.correct;
    
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (onComplete) {
      onComplete(correct);
    }
  };
  
  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  };
  
  return (
    <Card className="p-6 mb-8 border-2 border-purple-100">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Knowledge Check</h3>
          <p className="text-gray-700">{question}</p>
        </div>
        
        <RadioGroup 
          value={selectedOption || ""} 
          onValueChange={setSelectedOption}
          className="space-y-3"
          disabled={hasSubmitted}
        >
          {options.map((option) => (
            <div 
              key={option.id}
              className={`
                border rounded-md p-4 transition-colors
                ${hasSubmitted && option.id === selectedOption && option.correct ? 'bg-green-50 border-green-200' : ''}
                ${hasSubmitted && option.id === selectedOption && !option.correct ? 'bg-red-50 border-red-200' : ''}
                ${!hasSubmitted ? 'hover:bg-gray-50 cursor-pointer' : ''}
              `}
            >
              <div className="flex items-start">
                <RadioGroupItem 
                  value={option.id} 
                  id={`option-${id}-${option.id}`}
                  className="mt-1"
                  disabled={hasSubmitted}
                />
                <div className="ml-3 flex-1">
                  <Label 
                    htmlFor={`option-${id}-${option.id}`}
                    className={`font-medium ${hasSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {option.text}
                  </Label>
                  
                  {hasSubmitted && option.id === selectedOption && (
                    <div className="mt-2 text-sm flex items-start gap-2">
                      {option.correct ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className={option.correct ? 'text-green-700' : 'text-red-700'}>
                        {option.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
        
        <div className="pt-4 flex justify-between">
          {hasSubmitted ? (
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
              {isCorrect && (
                <div className="text-green-600 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>Correct! You can now proceed.</span>
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedOption}
            >
              Submit Answer
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}