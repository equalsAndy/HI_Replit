/**
 * AllStarTeams Reflection Form with Progression Logic
 * Implements exact reflection flow as specified in progression requirements
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgressionTracker } from '@/hooks/use-progression-tracker';
import { getMenuItemName } from '@/lib/progressionLogic';

interface ReflectionQuestion {
  id: string;
  question: string;
  placeholder?: string;
  required?: boolean;
}

interface ProgressionReflectionFormProps {
  stepId: string;
  title: string;
  questions: ReflectionQuestion[];
  nextStepId?: string;
  onComplete?: () => void;
}

export function ProgressionReflectionForm({
  stepId,
  title,
  questions,
  nextStepId,
  onComplete
}: ProgressionReflectionFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [allAnswered, setAllAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    progressionState,
    saveReflectionData,
    getNextButtonText
  } = useProgressionTracker();

  // Load existing reflection data if step is completed
  useEffect(() => {
    const existingData = progressionState.reflectionData[stepId];
    if (existingData && existingData.allAnswered) {
      setAnswers(existingData.answers || {});
      setIsCompleted(true);
      setAllAnswered(true);
    }
  }, [stepId, progressionState.reflectionData]);

  // Check if all required questions are answered
  useEffect(() => {
    const requiredQuestions = questions.filter(q => q.required !== false);
    const answeredRequired = requiredQuestions.every(q => 
      answers[q.id] && answers[q.id].trim().length > 0
    );
    setAllAnswered(answeredRequired);
  }, [answers, questions]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || isSaving) return;

    setIsSaving(true);
    try {
      await saveReflectionData(stepId, {
        answers,
        allAnswered: true,
        completedAt: new Date().toISOString()
      });

      setIsCompleted(true);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving reflection data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const nextButtonText = nextStepId ? `Next: ${getMenuItemName(nextStepId)}` : getNextButtonText(stepId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {index + 1}. {question.question}
                {question.required !== false && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder={question.placeholder || 'Enter your reflection here...'}
                className="min-h-[100px]"
                disabled={isCompleted}
              />
              {answers[question.id] && (
                <div className="text-xs text-gray-500">
                  {answers[question.id].length} characters
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {questions.filter(q => answers[q.id] && answers[q.id].trim().length > 0).length} / {questions.length} answered
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(questions.filter(q => answers[q.id] && answers[q.id].trim().length > 0).length / questions.length) * 100}%` 
            }}
          />
        </div>
        {!allAnswered && (
          <p className="text-xs text-gray-500 mt-2">
            Please answer all required questions to continue
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
        >
          {isSaving ? 'Saving...' : isCompleted ? nextButtonText : 'Complete Reflection'}
        </Button>
      </div>

      {/* Completion Status */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Reflection completed successfully!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default reflection questions for different steps
export const strengthsReflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'strengths_understanding',
    question: 'Based on your Star Card results, which strengths surprised you the most and why?',
    required: true
  },
  {
    id: 'strengths_application',
    question: 'How do you currently use these strengths in your work or personal life?',
    required: true
  },
  {
    id: 'strengths_development',
    question: 'Which strength would you like to develop further, and what specific steps could you take?',
    required: true
  },
  {
    id: 'strengths_balance',
    question: 'How might you better balance your different strengths in challenging situations?',
    required: true
  },
  {
    id: 'strengths_team',
    question: 'How could understanding your strengths improve your teamwork and collaboration?',
    required: true
  },
  {
    id: 'strengths_growth',
    question: 'What insights about yourself will you take forward from this assessment?',
    required: true
  }
];

export const wellbeingReflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'current_wellbeing',
    question: 'Reflecting on your current well-being rating, what factors most influence where you are today?',
    required: true
  },
  {
    id: 'future_wellbeing',
    question: 'What specific changes or improvements would help you reach your ideal well-being level?',
    required: true
  },
  {
    id: 'wellbeing_strengths',
    question: 'How can your identified strengths support your well-being journey?',
    required: true
  }
];

export const futureSelfreflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'future_vision',
    question: 'Describe your ideal future self in detail. What does success look like for you?',
    required: true
  },
  {
    id: 'growth_areas',
    question: 'What key areas do you want to develop or improve to become this future self?',
    required: true
  },
  {
    id: 'action_steps',
    question: 'What specific actions will you take in the next 3 months to move toward this vision?',
    required: true
  }
];

export const finalReflectionQuestions: ReflectionQuestion[] = [
  {
    id: 'key_insights',
    question: 'What are the most important insights you gained from this workshop about yourself and your potential?',
    required: true
  }
];