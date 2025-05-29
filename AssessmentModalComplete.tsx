
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mock data and types
interface QuadrantData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

interface RankedOption {
  optionId: string;
  rank: number;
}

interface AssessmentOption {
  id: string;
  text: string;
}

interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

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
  state?: string;
}

// Mock assessment questions (first 3 for demo)
const mockAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "When faced with a complex problem, what is your preferred approach?",
    options: [
      { id: "1a", text: "Analyze all available data thoroughly" },
      { id: "1b", text: "Take immediate action to test solutions" },
      { id: "1c", text: "Consider how it affects people involved" },
      { id: "1d", text: "Create a detailed step-by-step plan" }
    ]
  },
  {
    id: 2,
    text: "In a team meeting, you're most likely to:",
    options: [
      { id: "2a", text: "Ask probing questions to understand details" },
      { id: "2b", text: "Push for quick decisions and next steps" },
      { id: "2c", text: "Ensure everyone's voice is heard" },
      { id: "2d", text: "Suggest organizing ideas into clear categories" }
    ]
  },
  {
    id: 3,
    text: "When starting a new project, your first instinct is to:",
    options: [
      { id: "3a", text: "Research best practices and gather information" },
      { id: "3b", text: "Jump in and start experimenting" },
      { id: "3c", text: "Talk to stakeholders about their needs" },
      { id: "3d", text: "Outline the project scope and timeline" }
    ]
  }
];

// Mock option category mapping for scoring
const mockOptionCategoryMapping: { [key: string]: keyof QuadrantData } = {
  "1a": "thinking", "1b": "acting", "1c": "feeling", "1d": "planning",
  "2a": "thinking", "2b": "acting", "2c": "feeling", "2d": "planning",
  "3a": "thinking", "3b": "acting", "3c": "feeling", "3d": "planning"
};

// Mock results data
const mockAssessmentResults: QuadrantData = {
  thinking: 31,
  acting: 26,
  feeling: 20,
  planning: 23
};

const mockUserProfile = {
  name: "Bob Dylan",
  organization: "Guitar Store",
  title: "Picker"
};

// UI Components (simplified versions)
const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const DialogHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: any) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

const DialogDescription = ({ children }: any) => (
  <p className="text-gray-600 text-sm">{children}</p>
);

const DialogFooter = ({ children, className = "" }: any) => (
  <div className={`flex justify-end space-x-2 mt-4 ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  className = "", 
  disabled = false,
  ...props 
}: any) => {
  const baseClasses = "px-4 py-2 rounded font-medium transition-colors";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Icons (simplified SVG versions)
const ChevronLeft = ({ className = "" }: any) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className = "" }: any) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Loader2 = ({ className = "" }: any) => (
  <svg className={`w-4 h-4 animate-spin ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CheckCircle = ({ className = "" }: any) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClipboardCheck = ({ className = "" }: any) => (
  <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// Toast hook (simplified)
const useToast = () => ({
  toast: ({ title, description, variant }: any) => {
    console.log(`Toast: ${title} - ${description} (${variant || 'default'})`);
    alert(`${title}: ${description}`);
  }
});

// Assessment Pie Chart Component
const AssessmentPieChart = ({ thinking, acting, feeling, planning }: QuadrantData) => {
  const COLORS = {
    thinking: 'rgb(1,162,82)',    // Green
    acting: 'rgb(241,64,64)',     // Red
    feeling: 'rgb(22,126,253)',   // Blue
    planning: 'rgb(255,203,47)'   // Yellow
  };

  const data = [
    { name: 'Acting', value: acting, color: COLORS.acting },
    { name: 'Feeling', value: feeling, color: COLORS.feeling },
    { name: 'Planning', value: planning, color: COLORS.planning },
    { name: 'Thinking', value: thinking, color: COLORS.thinking }
  ];

  const filteredData = data.filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">{data.value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.value}%`;
  };

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No assessment data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
            <span style={{ color: entry.color }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Mock scoring function
const calculateQuadrantScores = (answers: any[], optionMapping: any): QuadrantData => {
  const scores = { thinking: 0, acting: 0, feeling: 0, planning: 0 };
  
  answers.forEach(answer => {
    answer.rankings.forEach((ranking: RankedOption) => {
      const category = optionMapping[ranking.optionId];
      if (category) {
        // Higher rank (1 = most like me) gets more points
        const points = 5 - ranking.rank;
        scores[category] += points;
      }
    });
  });

  // Convert to percentages
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  if (total === 0) return { thinking: 25, acting: 25, feeling: 25, planning: 25 };

  return {
    thinking: Math.round((scores.thinking / total) * 100),
    acting: Math.round((scores.acting / total) * 100),
    feeling: Math.round((scores.feeling / total) * 100),
    planning: Math.round((scores.planning / total) * 100)
  };
};

// Main Assessment Modal Props
interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

// Main Assessment Modal Component
export function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const { toast } = useToast();

  // State management
  const [view, setView] = useState<'intro' | 'assessment' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: RankedOption[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<QuadrantData | null>(null);

  // For drag and drop
  const [draggedOption, setDraggedOption] = useState<AssessmentOption | null>(null);
  const [rankings, setRankings] = useState<{
    mostLikeMe: AssessmentOption | null,
    second: AssessmentOption | null,
    third: AssessmentOption | null,
    leastLikeMe: AssessmentOption | null
  }>({
    mostLikeMe: null,
    second: null,
    third: null,
    leastLikeMe: null
  });

  const currentQuestion = mockAssessmentQuestions[currentQuestionIndex];
  const totalQuestions = mockAssessmentQuestions.length;

  // Initialize with results view for demo
  useEffect(() => {
    if (isOpen) {
      setAssessmentResults(mockAssessmentResults);
      setView('results');
    }
  }, [isOpen]);

  // Reset rankings when question changes
  useEffect(() => {
    if (!isOpen || view !== 'assessment') return;

    setRankings({
      mostLikeMe: null,
      second: null,
      third: null,
      leastLikeMe: null
    });

    const existingAnswer = answers[currentQuestion?.id];
    if (existingAnswer) {
      const rankToOption: { [key: number]: AssessmentOption | null } = {
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
  }, [currentQuestionIndex, isOpen, answers, view]);

  const startAssessment = () => {
    setView('assessment');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const getQuadrantScores = (): QuadrantData => {
    const answersArray = Object.entries(answers).map(([questionId, rankings]) => ({
      questionId: parseInt(questionId),
      rankings
    }));
    return calculateQuadrantScores(answersArray, mockOptionCategoryMapping);
  };

  const completeAssessment = async () => {
    setIsSubmitting(true);

    try {
      const results = getQuadrantScores();
      
      toast({
        title: "Assessment Complete!",
        description: "Your Star Card has been created!",
      });

      setAssessmentResults(results);
      setView('results');

      if (onComplete) {
        onComplete({ quadrantData: results });
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error completing assessment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveAnswerAndContinue = async () => {
    if (!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe) {
      toast({
        title: "Please rank all options",
        description: "You must rank all options before continuing.",
        variant: "destructive"
      });
      return;
    }

    const rankingData: RankedOption[] = [
      { optionId: rankings.mostLikeMe.id, rank: 1 },
      { optionId: rankings.second.id, rank: 2 },
      { optionId: rankings.third.id, rank: 3 },
      { optionId: rankings.leastLikeMe.id, rank: 4 }
    ];

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: rankingData
    }));

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRankings({
        mostLikeMe: null,
        second: null,
        third: null,
        leastLikeMe: null
      });
    } else {
      completeAssessment();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const placeOptionInNextAvailableSlot = (option: AssessmentOption) => {
    const newRankings = { ...rankings };

    let optionPreviousPosition: keyof typeof rankings | null = null;
    Object.entries(rankings).forEach(([pos, rankedOption]) => {
      if (rankedOption?.id === option.id) {
        optionPreviousPosition = pos as keyof typeof rankings;
      }
    });

    if (optionPreviousPosition) {
      (newRankings as any)[optionPreviousPosition] = null;
    }

    if (!newRankings.mostLikeMe) {
      newRankings.mostLikeMe = option;
    } else if (!newRankings.second) {
      newRankings.second = option;
    } else if (!newRankings.third) {
      newRankings.third = option;
    } else if (!newRankings.leastLikeMe) {
      newRankings.leastLikeMe = option;
    }

    setRankings(newRankings);
  };

  const handleOptionClick = (option: AssessmentOption) => {
    if (!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe) {
      placeOptionInNextAvailableSlot(option);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, option: AssessmentOption) => {
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
      const previousOption = rankings[position];
      const newRankings = { ...rankings };

      let optionPreviousPosition: keyof typeof rankings | null = null;
      Object.entries(rankings).forEach(([pos, rankedOption]) => {
        if (rankedOption?.id === option.id) {
          optionPreviousPosition = pos as keyof typeof rankings;
        }
      });

      if (optionPreviousPosition) {
        (newRankings as any)[optionPreviousPosition] = previousOption;
      }

      newRankings[position] = option;
      setRankings(newRankings);
    }

    setDraggedOption(null);
  };

  const handleDemoAnswers = async () => {
    setIsLoading(true);

    const demoAnswers: {[key: number]: RankedOption[]} = {};

    mockAssessmentQuestions.forEach(question => {
      const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
      demoAnswers[question.id] = [
        { optionId: shuffledOptions[0].id, rank: 1 },
        { optionId: shuffledOptions[1].id, rank: 2 },
        { optionId: shuffledOptions[2].id, rank: 3 },
        { optionId: shuffledOptions[3].id, rank: 4 }
      ];
    });

    setAnswers(demoAnswers);
    setCurrentQuestionIndex(totalQuestions - 1);

    if (mockAssessmentQuestions[totalQuestions - 1]) {
      const options = mockAssessmentQuestions[totalQuestions - 1].options;
      setRankings({
        mostLikeMe: options[0],
        second: options[1],
        third: options[2],
        leastLikeMe: options[3]
      });
    }

    toast({
      title: "Demo Data Ready",
      description: `You're at question ${totalQuestions}. Click 'Continue' to complete the assessment.`,
    });

    setIsLoading(false);
  };

  const progressPercentage = Math.min(
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100),
    100
  );

  const availableOptions = currentQuestion?.options.filter(option => 
    option !== rankings.mostLikeMe && 
    option !== rankings.second && 
    option !== rankings.third && 
    option !== rankings.leastLikeMe
  ) || [];

  const continueAssessment = () => {
    if (!assessmentResults) {
      toast({
        title: "Assessment results not available",
        description: "Please complete the assessment first.",
        variant: "destructive"
      });
      return;
    }
    
    onClose();
    
    if (onComplete) {
      const quadrantData = {
        thinking: assessmentResults.thinking,
        feeling: assessmentResults.feeling,
        acting: assessmentResults.acting,
        planning: assessmentResults.planning
      };
      
      onComplete({
        quadrantData,
        navigateToStarCardPreview: true
      });
    }
  };

  const renderIntro = () => (
    <div className="py-4 space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">About this assessment</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>22 questions about how you approach work and collaboration</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Takes approximately 10-15 minutes to complete</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Rank options based on how well they describe you</span>
          </li>
          <li className="flex items-start">
            <ClipboardCheck className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Creates your personal Star Card showing your strengths distribution</span>
          </li>
        </ul>
      </div>

      <div className="bg-amber-50 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">Instructions</h3>
        <p className="text-sm text-amber-700">
          For each scenario, drag and drop the options to rank them from most like you (1) to least 
          like you (4). There are no right or wrong answers - just be honest about your preferences.
        </p>
      </div>

      <div className="bg-green-50 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" /> What you'll get
        </h3>
        <p className="text-sm text-green-700">
          Your personal Star Card showing your unique distribution of strengths across the four 
          dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
          through the rest of the AllStarTeams program.
        </p>
      </div>

      <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancel
        </Button>
        <Button 
          onClick={startAssessment} 
          className="w-full sm:w-auto order-1 sm:order-2 bg-indigo-600 hover:bg-indigo-700"
        >
          Start Assessment <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </div>
  );

  const renderAssessment = () => (
    <div className="p-2 sm:p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </h3>
        <span className="text-xs text-gray-500">{progressPercentage}% complete</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div 
          className="bg-indigo-600 h-1.5 rounded-full transition-all" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-lg mb-3">
        <h3 className="text-lg font-medium text-indigo-700 mb-4">{currentQuestion.text}</h3>

        <div className="mb-4">
          <div className="bg-amber-50 p-4 rounded-lg mb-4">
            {availableOptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
                {availableOptions.map(option => (
                  <div 
                    key={option.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, option)}
                    onClick={() => handleOptionClick(option)}
                    className="bg-gray-100 rounded-lg flex items-center justify-center p-3 cursor-pointer hover:bg-gray-200 transition-colors shadow relative"
                  >
                    <p className="text-xs sm:text-sm text-center">{option.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">All options have been ranked. You can drag them to reorder.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'mostLikeMe')}
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.mostLikeMe 
                    ? 'border-transparent bg-indigo-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.mostLikeMe ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.mostLikeMe as AssessmentOption)}
                    className="w-full flex items-center justify-center bg-indigo-100 rounded-lg cursor-move p-2"
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
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.second 
                    ? 'border-transparent bg-purple-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.second ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.second as AssessmentOption)}
                    className="w-full flex items-center justify-center bg-purple-100 rounded-lg cursor-move p-2"
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
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.third 
                    ? 'border-transparent bg-teal-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.third ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.third as AssessmentOption)}
                    className="w-full flex items-center justify-center bg-teal-100 rounded-lg cursor-move p-2"
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
                className={`border-2 border-dashed rounded-lg p-3 w-full flex items-center justify-center transition-colors min-h-[80px] ${
                  rankings.leastLikeMe 
                    ? 'border-transparent bg-rose-100' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-300'
                }`}
              >
                {rankings.leastLikeMe ? (
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, rankings.leastLikeMe as AssessmentOption)}
                    className="w-full flex items-center justify-center bg-rose-100 rounded-lg cursor-move p-2"
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

        <div className="flex justify-between items-center pb-2">
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="h-9"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>

            <Button
              variant="outline"
              onClick={handleDemoAnswers}
              className="h-9 text-xs border-indigo-300 text-indigo-600 hover:text-indigo-700"
            >
              Demo Data
            </Button>
          </div>

          <Button 
            onClick={saveAnswerAndContinue}
            className={`${currentQuestionIndex === totalQuestions - 1 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'} h-10`}
            disabled={!rankings.mostLikeMe || !rankings.second || !rankings.third || !rankings.leastLikeMe || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              'Complete Assessment'
            ) : (
              <>Continue <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="p-4 space-y-5">
      <h2 className="text-2xl font-bold text-gray-900">Your Star Strengths Results</h2>

      {assessmentResults && (
        <>
          <div>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Congratulations!</span> You've completed the assessment and 
              created your unique Star Card showing your strengths across four key dimensions.
            </p>

            <p className="text-gray-700 mb-5">
              Your Star Card will guide your personal development journey and help
              you identify areas where you shine and where you can grow. The
              workshop activities will help you explore these dimensions in depth.
            </p>
          </div>

          <div className="flex flex-col items-center my-4 w-full px-4">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="#FFB000" strokeWidth="1"/>
                </svg>
              </div>
            </div>
            <div className="w-full max-w-[800px] h-[350px] lg:h-[400px] mx-auto">
              <AssessmentPieChart
                thinking={assessmentResults.thinking}
                acting={assessmentResults.acting}
                feeling={assessmentResults.feeling}
                planning={assessmentResults.planning}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              {[
                { name: 'Thinking', value: assessmentResults.thinking, color: 'rgb(1,162,82)', desc: 'Analytical & logical approach' },
                { name: 'Planning', value: assessmentResults.planning, color: 'rgb(255,203,47)', desc: 'Organized & methodical' },
                { name: 'Feeling', value: assessmentResults.feeling, color: 'rgb(22,126,253)', desc: 'Empathetic & relationship-focused' },
                { name: 'Acting', value: assessmentResults.acting, color: 'rgb(241,64,64)', desc: 'Decisive & action-oriented' }
              ]
                .sort((a, b) => b.value - a.value)
                .map(strength => (
                  <div key={strength.name} className="flex items-center">
                    <div className="w-5 h-5 rounded mr-3" style={{ backgroundColor: strength.color }}></div>
                    <span className="font-semibold">{strength.name}: {strength.value}%</span>
                    <span className="ml-3 text-gray-600 text-sm"> - {strength.desc}</span>
                  </div>
                ))
              }
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="#FFB000" strokeWidth="1"/>
                  </svg>
                </div>
                <span className="font-semibold">Imagination</span>
                <span className="ml-3 text-gray-600 text-sm"> - your limitless potential capacity that brings the other core dimensions into focus.</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Close
        </Button>

        <Button 
          onClick={continueAssessment}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Continue to Your Star Card
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl sm:max-w-3xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AllStarTeams Strengths Assessment</DialogTitle>
          <DialogDescription>
            {view === 'intro' && "Discover your unique strengths profile with this assessment."}
            {view === 'assessment' && "For each scenario, rank the options from most like you to least like you."}
            {view === 'results' && "Your personal strengths profile based on your assessment."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {view === 'intro' && renderIntro()}
            {view === 'assessment' && renderAssessment()}
            {view === 'results' && renderResults()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Example usage component
export default function AssessmentModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Assessment Modal Demo</h1>
      <p>This demo shows the AssessmentModal as it currently appears in the app.</p>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: '#3B82F6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        Open Assessment Modal
      </button>

      <AssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={(data) => {
          console.log('Assessment completed:', data);
          alert('Assessment completed! Check console for results.');
        }}
      />

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Current Mock Data:</h3>
        <p><strong>User:</strong> {mockUserProfile.name} - {mockUserProfile.title} at {mockUserProfile.organization}</p>
        <p><strong>Assessment Results:</strong></p>
        <ul>
          <li>Thinking: {mockAssessmentResults.thinking}%</li>
          <li>Acting: {mockAssessmentResults.acting}%</li>
          <li>Feeling: {mockAssessmentResults.feeling}%</li>
          <li>Planning: {mockAssessmentResults.planning}%</li>
        </ul>
        <p><strong>Questions:</strong> {mockAssessmentQuestions.length} sample questions included</p>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
