import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { ContentViewProps } from '@/shared/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

// Define the 5-capacity assessment questions
interface AssessmentQuestion {
  id: number;
  text: string;
  capacity: 'imagination' | 'curiosity' | 'empathy' | 'creativity' | 'courage';
  subDimension?: string;
}

const assessmentQuestions: AssessmentQuestion[] = [
  // Imagination - Generative Fluency (2 questions)
  { id: 1, text: "I can easily come up with multiple, unconventional ideas.", capacity: 'imagination', subDimension: 'generativeFluency' },
  { id: 2, text: "I often generate new ideas in my daily life.", capacity: 'imagination', subDimension: 'generativeFluency' },
  
  // Imagination - Temporal Flexibility (2 questions)
  { id: 3, text: "I can vividly imagine different possible futures or pasts.", capacity: 'imagination', subDimension: 'temporalFlexibility' },
  { id: 4, text: "I often reflect on alternative outcomes before making decisions.", capacity: 'imagination', subDimension: 'temporalFlexibility' },
  
  // Imagination - Perspectival Agility (2 questions)
  { id: 5, text: "I can imagine experiences beyond my current reality.", capacity: 'imagination', subDimension: 'perspectivalAgility' },
  { id: 6, text: "I frequently consider other people's viewpoints in discussions.", capacity: 'imagination', subDimension: 'perspectivalAgility' },
  
  // Imagination - Boundary Permeability (2 questions)
  { id: 7, text: "I'm comfortable blending ideas from different domains (e.g., science and art).", capacity: 'imagination', subDimension: 'boundaryPermeability' },
  { id: 8, text: "I actively seek inspiration from outside my usual field.", capacity: 'imagination', subDimension: 'boundaryPermeability' },
  
  // Imagination - Ambiguity Tolerance (2 questions)
  { id: 9, text: "I can explore complex ideas without needing quick answers.", capacity: 'imagination', subDimension: 'ambiguityTolerance' },
  { id: 10, text: "I feel comfortable with uncertainty when solving problems.", capacity: 'imagination', subDimension: 'ambiguityTolerance' },
  
  // Imagination - Embodied Translation (2 questions)
  { id: 11, text: "I can turn abstract ideas into tangible actions or prototypes.", capacity: 'imagination', subDimension: 'embodiedTranslation' },
  { id: 12, text: "I take steps to bring my ideas to life.", capacity: 'imagination', subDimension: 'embodiedTranslation' },
  
  // Imagination - Playful Wonder (1 question)
  { id: 13, text: "I allow myself to daydream, imagine, or wonder—even if it feels unproductive.", capacity: 'imagination', subDimension: 'playfulWonder' },
  
  // Curiosity (2 questions)
  { id: 14, text: "I frequently seek out new experiences or knowledge.", capacity: 'curiosity' },
  { id: 15, text: "I enjoy exploring unfamiliar topics.", capacity: 'curiosity' },
  
  // Empathy (2 questions)
  { id: 16, text: "I'm good at understanding how others feel.", capacity: 'empathy' },
  { id: 17, text: "I try to see situations through others' eyes.", capacity: 'empathy' },
  
  // Creativity (2 questions)
  { id: 18, text: "I engage regularly in creative activities (e.g., art, writing, design).", capacity: 'creativity' },
  { id: 19, text: "I often come up with novel solutions to everyday challenges.", capacity: 'creativity' },
  
  // Courage (2 questions)
  { id: 20, text: "I take risks to pursue ideas or values I believe in.", capacity: 'courage' },
  { id: 21, text: "I stand up for what I believe, even when it's unpopular.", capacity: 'courage' }
];

const likertScale = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" }
];

// Function to calculate scores from responses
const calculateScores = (responses: Record<number, number>) => {
  // Calculate sub-dimension averages for Imagination (13 questions total)
  const generativeFluencyScore = (responses[1] + responses[2]) / 2;
  const temporalFlexibilityScore = (responses[3] + responses[4]) / 2;
  const perspectivalAgilityScore = (responses[5] + responses[6]) / 2;
  const boundaryPermeabilityScore = (responses[7] + responses[8]) / 2;
  const ambiguityToleranceScore = (responses[9] + responses[10]) / 2;
  const embodiedTranslationScore = (responses[11] + responses[12]) / 2;
  const playfulWonderScore = responses[13]; // single question

  // Overall Imagination score (average of 7 sub-dimensions)
  const imaginationScore = (
    generativeFluencyScore +
    temporalFlexibilityScore +
    perspectivalAgilityScore +
    boundaryPermeabilityScore +
    ambiguityToleranceScore +
    embodiedTranslationScore +
    playfulWonderScore
  ) / 7;

  // Calculate other capacity averages
  const curiosityScore = (responses[14] + responses[15]) / 2;
  const empathyScore = (responses[16] + responses[17]) / 2;
  const creativityScore = (responses[18] + responses[19]) / 2;
  const courageScore = (responses[20] + responses[21]) / 2;

  return {
    imagination: imaginationScore,
    curiosity: curiosityScore,
    empathy: empathyScore,
    creativity: creativityScore,
    courage: courageScore,
    subDimensions: {
      generativeFluency: generativeFluencyScore,
      temporalFlexibility: temporalFlexibilityScore,
      perspectivalAgility: perspectivalAgilityScore,
      boundaryPermeability: boundaryPermeabilityScore,
      ambiguityTolerance: ambiguityToleranceScore,
      embodiedTranslation: embodiedTranslationScore,
      playfulWonder: playfulWonderScore
    }
  };
};

// Guidance based on scores
const getGuidance = (scores: ReturnType<typeof calculateScores>) => {
  const strengths = [];
  const opportunities = [];

  // Identify strengths (scores above 4.0)
  if (scores.imagination >= 4.0) strengths.push("Your imagination capabilities show strong development across multiple dimensions");
  if (scores.curiosity >= 4.0) strengths.push("Your curiosity drives you to actively seek new experiences and knowledge");
  if (scores.empathy >= 4.0) strengths.push("Your empathy allows you to understand and connect with others effectively");
  if (scores.creativity >= 4.0) strengths.push("Your creativity manifests in both regular creative activities and novel problem-solving");
  if (scores.courage >= 4.0) strengths.push("Your courage enables you to take risks and stand up for your beliefs");

  // Identify opportunities (scores below 3.5)
  if (scores.imagination < 3.5) opportunities.push("Practice imagination exercises to strengthen your ability to envision possibilities");
  if (scores.curiosity < 3.5) opportunities.push("Actively seek out new experiences and unfamiliar topics to cultivate curiosity");
  if (scores.empathy < 3.5) opportunities.push("Practice perspective-taking to better understand others' feelings and viewpoints");
  if (scores.creativity < 3.5) opportunities.push("Engage in more creative activities and experiment with novel approaches to challenges");
  if (scores.courage < 3.5) opportunities.push("Take small risks to build confidence in pursuing your ideas and values");

  // Default messages if scores are moderate
  if (strengths.length === 0) strengths.push("You show balanced development across the five capacities");
  if (opportunities.length === 0) opportunities.push("Continue developing all five capacities through regular practice and reflection");

  return { strengths, opportunities };
};

interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function ImaginationAssessmentContent({ navigate, markStepCompleted, setCurrentContent }: ContentViewProps) {
  const { toast } = useToast();
  
  // State for current question, responses, and completion
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Handle Likert scale response
  const handleLikertResponse = (questionId: number, value: number) => {
    const newResponses = {
      ...responses,
      [questionId]: value,
    };
    setResponses(newResponses);
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Complete assessment
        setIsCompleted(true);
        toast({
          title: "Assessment Completed",
          description: "Your 5-capacity assessment has been saved.",
        });
      }
    }, 500);
  };

  // Handle completion and navigation
  const handleCompleteAssessment = () => {
    markStepCompleted('1-5');
    setCurrentContent("five-c-assessment");
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + (isCompleted ? 1 : 0)) / assessmentQuestions.length) * 100;
  
  // Calculate scores for results display
  const scores = isCompleted ? calculateScores(responses) : null;
  const guidance = scores ? getGuidance(scores) : null;
  
  // Prepare radar chart data
  const radarData = scores ? [
    { capacity: 'Imagination', value: scores.imagination * 20, fullMark: 100 }, // Convert 5-point scale to 100-point
    { capacity: 'Curiosity', value: scores.curiosity * 20, fullMark: 100 },
    { capacity: 'Empathy', value: scores.empathy * 20, fullMark: 100 },
    { capacity: 'Creativity', value: scores.creativity * 20, fullMark: 100 },
    { capacity: 'Courage', value: scores.courage * 20, fullMark: 100 }
  ] : [];
  
  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-right text-sm text-gray-500 mt-1">
          {isCompleted ? 'Complete' : `Question ${currentQuestion + 1} of ${assessmentQuestions.length}`}
        </p>
      </div>
      
      {!isCompleted ? (
        /* Question display */
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">
                {assessmentQuestions[currentQuestion].text}
              </h2>
              
              <div className="space-y-3">
                {likertScale.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleLikertResponse(assessmentQuestions[currentQuestion].id, option.value)}
                    variant={responses[assessmentQuestions[currentQuestion].id] === option.value ? "default" : "outline"}
                    className={`w-full text-left justify-start h-auto p-4 ${
                      responses[assessmentQuestions[currentQuestion].id] === option.value 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : "hover:bg-purple-50"
                    }`}
                  >
                    <div className="flex items-center w-full">
                      <span className="font-medium mr-3">{option.value}</span>
                      <span>{option.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Capacity: <span className="font-medium capitalize">{assessmentQuestions[currentQuestion].capacity}</span>
                {assessmentQuestions[currentQuestion].subDimension && (
                  <span> • Sub-dimension: <span className="font-medium">{assessmentQuestions[currentQuestion].subDimension}</span></span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results display */
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-2xl font-semibold text-purple-800">Assessment Complete</h2>
            </div>
            <p className="text-gray-700 mb-6">
              Thank you for completing the 5-Capacity Assessment. Your responses reveal your strengths across imagination, curiosity, empathy, creativity, and courage.
            </p>
            
            <h3 className="text-lg font-semibold text-purple-700 mb-4">Your 5-Capacity Profile</h3>
            
            {/* Radar Chart */}
            <div className="mb-8">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="capacity" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={false}
                    />
                    <Radar
                      name="Your Scores"
                      dataKey="value"
                      stroke="#8754b4"
                      fill="#8754b4"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Detailed Scores */}
            <div className="space-y-4 mb-6">
              {Object.entries({
                Imagination: scores?.imagination,
                Curiosity: scores?.curiosity,
                Empathy: scores?.empathy,
                Creativity: scores?.creativity,
                Courage: scores?.courage
              }).map(([capacity, score]) => (
                <div key={capacity} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{capacity}</span>
                    <span>{score ? (score * 20).toFixed(0) : 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${score ? score * 20 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            {guidance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">Your Strengths</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {guidance.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-2">Growth Opportunities</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {guidance.opportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">→</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={handleCompleteAssessment}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Complete the 5Cs Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}