/**
 * AllStarTeams Assessment Modal with Progression Logic
 * Implements exact assessment flow as specified in progression requirements
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useProgressionTracker } from '@/hooks/use-progression-tracker';
import { getMenuItemName } from '@/lib/progressionLogic';

interface QuadrantData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

interface AssessmentOption {
  id: string;
  text: string;
}

interface RankedOption {
  optionId: string;
  rank: number;
}

interface ProgressionAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepId: string;
  assessmentType: 'strengths' | 'flow';
  nextStepId?: string;
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "When facing a new challenge, which approaches resonate most with you?",
    options: [
      { id: "1a", text: "I analyze the situation thoroughly before acting" },
      { id: "1b", text: "I jump in and learn by doing" },
      { id: "1c", text: "I consider how it affects others emotionally" },
      { id: "1d", text: "I create a detailed plan with clear steps" }
    ]
  },
  {
    id: 2,
    text: "In team meetings, you typically:",
    options: [
      { id: "2a", text: "Ask probing questions to understand the issues" },
      { id: "2b", text: "Volunteer to take on action items" },
      { id: "2c", text: "Focus on team dynamics and relationships" },
      { id: "2d", text: "Suggest organizing ideas into clear frameworks" }
    ]
  },
  {
    id: 3,
    text: "When learning something new, you prefer to:",
    options: [
      { id: "3a", text: "Research and understand the theory first" },
      { id: "3b", text: "Practice hands-on with real examples" },
      { id: "3c", text: "Connect it to personal experiences and values" },
      { id: "3d", text: "Break it down into structured learning modules" }
    ]
  }
];

const optionMapping = {
  "1a": "thinking", "2a": "thinking", "3a": "thinking",
  "1b": "acting", "2b": "acting", "3b": "acting", 
  "1c": "feeling", "2c": "feeling", "3c": "feeling",
  "1d": "planning", "2d": "planning", "3d": "planning"
};

export function ProgressionAssessmentModal({
  isOpen,
  onClose,
  stepId,
  assessmentType,
  nextStepId
}: ProgressionAssessmentModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: RankedOption[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  const {
    progressionState,
    saveAssessmentData,
    getNextButtonText
  } = useProgressionTracker();

  // Check if assessment is already completed
  useEffect(() => {
    if (isOpen) {
      const existingResults = progressionState.assessmentResults[stepId];
      if (existingResults && existingResults.completed) {
        setAssessmentResults(existingResults);
        setShowResults(true);
        setAllQuestionsAnswered(true);
      } else {
        // Reset to initial state for new assessment
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setAssessmentResults(null);
        setAllQuestionsAnswered(false);
      }
    }
  }, [isOpen, stepId, progressionState.assessmentResults]);

  // Check if all questions are answered
  useEffect(() => {
    const totalQuestions = assessmentQuestions.length;
    const answeredQuestions = Object.keys(answers).length;
    setAllQuestionsAnswered(answeredQuestions === totalQuestions);
  }, [answers]);

  const handleOptionRank = (questionId: number, optionId: string, rank: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [
        ...(prev[questionId] || []).filter(r => r.optionId !== optionId),
        { optionId, rank }
      ].sort((a, b) => a.rank - b.rank)
    }));
  };

  const calculateQuadrantScores = (): QuadrantData => {
    const scores = { thinking: 0, acting: 0, feeling: 0, planning: 0 };
    
    Object.values(answers).forEach(questionAnswers => {
      questionAnswers.forEach(answer => {
        const quadrant = optionMapping[answer.optionId as keyof typeof optionMapping];
        if (quadrant) {
          // Higher rank = higher score (rank 1 = 4 points, rank 2 = 3 points, etc.)
          scores[quadrant as keyof QuadrantData] += (5 - answer.rank);
        }
      });
    });

    return scores;
  };

  const handleCompleteAssessment = async () => {
    if (!allQuestionsAnswered) return;

    const results = calculateQuadrantScores();
    setAssessmentResults(results);
    setShowResults(true);

    // Save assessment data according to progression rules
    await saveAssessmentData(stepId, {
      results,
      answers,
      completed: true,
      assessmentType,
      completedAt: new Date().toISOString()
    });
  };

  const handleNextStep = () => {
    onClose();
  };

  const nextButtonText = nextStepId ? `Next: ${getMenuItemName(nextStepId)}` : getNextButtonText(stepId);

  const chartData = assessmentResults ? [
    { name: 'Thinking', value: assessmentResults.thinking, color: '#3B82F6' },
    { name: 'Acting', value: assessmentResults.acting, color: '#10B981' },
    { name: 'Feeling', value: assessmentResults.feeling, color: '#F59E0B' },
    { name: 'Planning', value: assessmentResults.planning, color: '#8B5CF6' }
  ] : [];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assessmentType === 'strengths' ? 'Star Strengths Assessment' : 'Flow Assessment'}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {assessmentQuestions.length}
              </span>
              <div className="flex space-x-1">
                {assessmentQuestions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentQuestion ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Current Question */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {assessmentQuestions[currentQuestion]?.text}
                </h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Rank these options from 1 (most like you) to 4 (least like you):
                  </p>
                  
                  {assessmentQuestions[currentQuestion]?.options.map(option => {
                    const currentRank = answers[assessmentQuestions[currentQuestion].id]?.find(
                      r => r.optionId === option.id
                    )?.rank;
                    
                    return (
                      <div key={option.id} className="flex items-center space-x-3">
                        <span className="flex-1 text-sm">{option.text}</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map(rank => (
                            <button
                              key={rank}
                              onClick={() => handleOptionRank(assessmentQuestions[currentQuestion].id, option.id, rank)}
                              className={`w-8 h-8 rounded-full border-2 text-sm font-medium ${
                                currentRank === rank
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'border-gray-300 hover:border-indigo-400'
                              }`}
                            >
                              {rank}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentQuestion < assessmentQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={!answers[assessmentQuestions[currentQuestion].id]}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteAssessment}
                  disabled={!allQuestionsAnswered}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Complete Assessment
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Display */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Your Assessment Results</h3>
              <p className="text-gray-600">Here's your personal profile breakdown:</p>
            </div>

            {/* Results Chart */}
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full lg:w-1/2 space-y-4">
                {chartData.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-lg font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleNextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2"
              >
                {nextButtonText}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}