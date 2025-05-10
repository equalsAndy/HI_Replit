import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

// Define the scenarios
const scenarios = [
  {
    id: 1,
    title: "The Changing Workplace",
    description: "Imagine that within the next five years, artificial intelligence has automated 40% of current office tasks. How do you envision your role evolving, and what new skills or capabilities might you develop to remain valuable?",
    hint: "Consider both technical and uniquely human capabilities that may be in demand."
  },
  {
    id: 2,
    title: "Cross-Cultural Collaboration",
    description: "Imagine you're leading a global team with members from five different countries, all working remotely. What new approaches or systems might you create to foster genuine connection and effective collaboration?",
    hint: "Think beyond basic virtual meeting tools to deeper forms of engagement."
  },
  {
    id: 3,
    title: "Resource Constraints",
    description: "Imagine your organization has suddenly lost 30% of its budget. Rather than simply cutting back, how might you reimagine your team's approach to deliver even more value with fewer resources?",
    hint: "Consider radical simplification or entirely new operating models."
  },
  {
    id: 4,
    title: "Customer Evolution",
    description: "Imagine your customers' needs and expectations fundamentally change over the next three years. What might these new expectations be, and how could your products or services evolve to meet them?",
    hint: "Consider shifts in values, preferences, and behaviors that might emerge."
  },
  {
    id: 5,
    title: "Your Legacy",
    description: "Imagine you're looking back on your career from 20 years in the future. What impact would you most hope to have made through your work, beyond conventional measures of success?",
    hint: "Think about the ripple effects your work might have on individuals, organizations, or society."
  }
];

// Define insights and guidance
const insights = [
  {
    title: "Vivid Detail",
    description: "Your imagination shows strength in creating detailed scenarios with specific elements that make your visions tangible and compelling.",
    score: 85
  },
  {
    title: "Future Orientation",
    description: "You demonstrate a strong ability to project forward in time and envision possibilities that don't yet exist.",
    score: 78
  },
  {
    title: "Perspective Shifting",
    description: "Your responses show you can adopt different viewpoints and imagine experiences from perspectives other than your own.",
    score: 92
  },
  {
    title: "Boundary Breaking",
    description: "Your imagination sometimes extends beyond conventional constraints, though there's opportunity to push further beyond the familiar.",
    score: 65
  },
  {
    title: "Overall Imagination Agility",
    description: "You demonstrate strong imagination with particular strengths in perspective-taking and creating detailed scenarios.",
    score: 80
  }
];

const imaginationGuidance = {
  strengths: [
    "Your ability to imagine from others' perspectives is particularly valuable for collaborative work",
    "You create scenarios with compelling details that help others see possibilities",
    "Your imagination shows versatility across different types of challenges"
  ],
  opportunities: [
    "Practice breaking more conventional boundaries in your imaginative thinking",
    "Experiment with combining seemingly unrelated concepts or ideas",
    "Consider dedicating time specifically for imagination exercises"
  ]
};

export default function ImaginationAssessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for current scenario, responses, and completion
  const [currentScenario, setCurrentScenario] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Handle response submission
  const handleSubmitResponse = () => {
    if (currentResponse.trim().length < 50) {
      toast({
        title: "Response too short",
        description: "Please provide a more detailed response to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Save the current response
    setResponses({
      ...responses,
      [scenarios[currentScenario].id]: currentResponse,
    });
    
    // Check if this is the last scenario
    if (currentScenario === scenarios.length - 1) {
      setIsCompleted(true);
      
      // Mock API call to save responses
      setTimeout(() => {
        toast({
          title: "Assessment Completed",
          description: "Your imagination assessment has been saved.",
        });
      }, 1000);
    } else {
      // Move to next scenario
      setCurrentScenario(currentScenario + 1);
      setCurrentResponse('');
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentScenario + (isCompleted ? 1 : 0)) / scenarios.length) * 100;
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-purple-600 mr-2" />
              <h1 className="text-xl font-bold text-purple-800">Imagination Assessment</h1>
            </div>
            <Link href="/user-home" className="text-purple-600 hover:text-purple-800">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-right text-sm text-gray-500 mt-1">
              {isCompleted ? 'Complete' : `Scenario ${currentScenario + 1} of ${scenarios.length}`}
            </p>
          </div>
          
          {!isCompleted ? (
            /* Scenario display */
            <div>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold text-purple-800 mb-3">
                    {scenarios[currentScenario].title}
                  </h2>
                  <p className="text-gray-700 mb-4">
                    {scenarios[currentScenario].description}
                  </p>
                  <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                    <p className="text-sm text-purple-800">
                      <span className="font-medium">Hint:</span> {scenarios[currentScenario].hint}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your response:
                </label>
                <Textarea 
                  placeholder="Type your response here..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-right text-sm text-gray-500 mt-1">
                  {currentResponse.length} characters (minimum 50)
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitResponse}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={currentResponse.trim().length < 50}
                >
                  {currentScenario === scenarios.length - 1 ? 'Complete Assessment' : 'Next Scenario'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Results display */
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  <h2 className="text-2xl font-bold text-purple-800">Assessment Complete</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Thank you for completing the Imagination Assessment. Your responses have been analyzed to provide insights into your imaginative capabilities.
                </p>
                
                <h3 className="text-lg font-semibold text-purple-700 mb-3">Your Imagination Profile</h3>
                <div className="space-y-4 mb-6">
                  {insights.map((insight, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{insight.title}</span>
                        <span>{insight.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${insight.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-2">Your Strengths</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {imaginationGuidance.strengths.map((strength, index) => (
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
                      {imaginationGuidance.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">→</span>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => navigate('/5cs-assessment')}
                  >
                    Continue to 5Cs Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/user-home')}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Your Responses</h3>
                <div className="space-y-6">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="pb-4 border-b border-gray-200 last:border-0">
                      <h4 className="font-medium text-purple-700 mb-2">{scenario.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-700">{responses[scenario.id]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}