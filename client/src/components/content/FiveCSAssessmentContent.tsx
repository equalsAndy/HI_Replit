import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ContentViewProps } from '@/shared/types';

// Define the 5Cs
const fiveCs = [
  {
    name: 'Curiosity',
    description: 'The desire to learn or know more about something or someone',
    icon: '🔍',
    color: 'bg-blue-500',
  },
  {
    name: 'Creativity',
    description: 'The use of imagination or original ideas to create something',
    icon: '🎨',
    color: 'bg-green-500',
  },
  {
    name: 'Courage',
    description: 'The ability to do something that frightens one; bravery',
    icon: '🦁',
    color: 'bg-orange-500',
  },
  {
    name: 'Empathy',
    description: 'The ability to understand and share the feelings of another',
    icon: '❤️',
    color: 'bg-red-500',
  },
  {
    name: 'Imagination',
    description: 'The faculty of forming images in the mind',
    icon: '✨',
    color: 'bg-purple-500',
  },
];

// Define assessment questions
const questions = [
  {
    text: 'When faced with a problem at work, I typically:',
    options: [
      { id: 'a1', text: 'Ask many questions to understand all aspects', category: 'curiosity' },
      { id: 'a2', text: 'Immediately brainstorm multiple possible solutions', category: 'creativity' },
      { id: 'a3', text: 'Take on challenging aspects that others avoid', category: 'courage' },
      { id: 'a4', text: 'Consider how the issue affects different team members', category: 'empathy' },
      { id: 'a5', text: 'Envision scenarios beyond conventional thinking', category: 'imagination' },
    ],
  },
  {
    text: 'I feel most engaged in my work when I am:',
    options: [
      { id: 'b1', text: 'Learning something new or exploring unfamiliar territory', category: 'curiosity' },
      { id: 'b2', text: 'Finding novel approaches or creating new processes', category: 'creativity' },
      { id: 'b3', text: 'Overcoming significant obstacles or resistance', category: 'courage' },
      { id: 'b4', text: 'Helping others succeed or addressing human needs', category: 'empathy' },
      { id: 'b5', text: 'Thinking about future possibilities and potential', category: 'imagination' },
    ],
  },
  {
    text: 'When collaborating with others, my strength is:',
    options: [
      { id: 'c1', text: 'Asking insightful questions that expand the conversation', category: 'curiosity' },
      { id: 'c2', text: 'Generating unique ideas that hadn\'t been considered', category: 'creativity' },
      { id: 'c3', text: 'Speaking up about difficult topics others are avoiding', category: 'courage' },
      { id: 'c4', text: 'Sensing how others are feeling and accommodating their needs', category: 'empathy' },
      { id: 'c5', text: 'Envisioning how ideas might evolve in unexpected ways', category: 'imagination' },
    ],
  },
  {
    text: 'I believe my most valuable contribution to a team is:',
    options: [
      { id: 'd1', text: 'My inquisitive nature and desire to dig deeper', category: 'curiosity' },
      { id: 'd2', text: 'My ability to develop original solutions', category: 'creativity' },
      { id: 'd3', text: 'My willingness to tackle difficult challenges head-on', category: 'courage' },
      { id: 'd4', text: 'My understanding of others\' perspectives and feelings', category: 'empathy' },
      { id: 'd5', text: 'My capacity to envision what doesn\'t yet exist', category: 'imagination' },
    ],
  },
  {
    text: 'When I encounter resistance to my ideas, I typically:',
    options: [
      { id: 'e1', text: 'Try to understand the reasoning behind the resistance', category: 'curiosity' },
      { id: 'e2', text: 'Find creative ways to address concerns or reframe the idea', category: 'creativity' },
      { id: 'e3', text: 'Persist despite the pushback if I believe in the idea', category: 'courage' },
      { id: 'e4', text: 'Listen carefully to understand others\' feelings about it', category: 'empathy' },
      { id: 'e5', text: 'Imagine alternative futures to help others see possibilities', category: 'imagination' },
    ],
  },
];

// Define result descriptions
const resultDescriptions = {
  curiosity: "You have a strong drive to understand the world around you. This curiosity allows you to continuously learn and gather valuable insights that others may miss. You ask great questions and enjoy exploring new territories.",
  creativity: "You excel at generating novel ideas and solutions. Your creative thinking helps teams break out of conventional patterns and find innovative approaches to problems. You're comfortable with ambiguity and enjoy the process of creation.",
  courage: "You demonstrate remarkable bravery in facing challenges. Your willingness to take calculated risks, speak up when necessary, and persevere through difficulties makes you a valuable asset in navigating uncertain situations.",
  empathy: "You have an exceptional ability to understand others' feelings and perspectives. This empathic awareness helps build strong relationships and create inclusive environments where everyone feels valued and understood.",
  imagination: "You can envision possibilities beyond current realities. This imaginative capacity allows you to picture alternative futures and pathways that aren't immediately obvious to others, opening up new strategic directions.",
};

export default function FiveCSAssessmentContent({ navigate, markStepCompleted, setCurrentContent }: ContentViewProps) {
  const { toast } = useToast();
  
  // State for current question, answers, and results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({
    curiosity: 0,
    creativity: 0,
    courage: 0,
    empathy: 0,
    imagination: 0,
  });
  
  // Handle answer selection
  const handleAnswerSelect = (answerId: string) => {
    const category = questions[currentQuestion].options.find(o => o.id === answerId)?.category || '';
    
    // Update answers
    setAnswers({
      ...answers,
      [currentQuestion]: answerId,
    });
    
    // If last question, calculate results
    if (currentQuestion === questions.length - 1) {
      const newResults = { ...results };
      
      // Count all answers by category
      Object.values(answers).forEach(id => {
        // Find the selected answer across all questions
        for (const q of questions) {
          const option = q.options.find(o => o.id === id);
          if (option) {
            newResults[option.category] = (newResults[option.category] || 0) + 1;
          }
        }
      });
      
      // Add the final answer
      newResults[category] = (newResults[category] || 0) + 1;
      
      setResults(newResults);
      setShowResults(true);
      
      // Save results notification
      setTimeout(() => {
        toast({
          title: "Assessment Completed",
          description: "Your 5Cs assessment results have been saved.",
        });
      }, 1000);
    } else {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Find the top strength
  const findTopStrength = () => {
    let topCategory = 'curiosity';
    let topScore = 0;
    
    Object.entries(results).forEach(([category, score]) => {
      if (score > topScore) {
        topScore = score;
        topCategory = category;
      }
    });
    
    return {
      category: topCategory,
      score: topScore,
    };
  };
  
  // Handle continue to insights
  const handleContinue = () => {
    markStepCompleted('1-6');
    setCurrentContent("insights-dashboard");
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + (showResults ? 1 : 0)) / questions.length) * 100;
  
  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-right text-sm text-gray-500 mt-1">
          {showResults ? 'Complete' : `Question ${currentQuestion + 1} of ${questions.length}`}
        </p>
      </div>
      
      {!showResults ? (
        /* Question display */
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {questions[currentQuestion].text}
          </h2>
          
          <RadioGroup className="space-y-4">
            {questions[currentQuestion].options.map((option) => (
              <div 
                key={option.id}
                className="border border-gray-200 rounded-md p-4 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => handleAnswerSelect(option.id)}
              >
                <div className="flex items-start">
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="ml-3">
                    <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      ) : (
        /* Results display */
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">Your 5Cs Results</h2>
          <p className="text-gray-700 mb-6">
            Based on your responses, here's how you score across the 5Cs of Imaginal Agility:
          </p>
          
          {/* Results bars */}
          <div className="space-y-4 mb-8">
            {Object.entries(results).map(([category, score]) => {
              const matchingC = fiveCs.find(c => c.name.toLowerCase() === category);
              const percentage = (score / questions.length) * 100;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="mr-2">{matchingC?.icon}</span>
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${matchingC?.color || 'bg-purple-500'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Top strength */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-800 mb-2">Your Top Strength: <span className="capitalize">{findTopStrength().category}</span></h3>
            <p className="text-gray-700">
              {resultDescriptions[findTopStrength().category as keyof typeof resultDescriptions]}
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: View Insights Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}