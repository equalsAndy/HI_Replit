import React, { useState } from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection } from '@/components/navigation';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { ArrowRightIcon, CheckCircleIcon } from 'lucide-react';

// Sample assessment questions for demonstration
const sampleQuestions = [
  {
    id: 'q1',
    text: 'When working on a project, I prefer to:',
    options: [
      { id: 'q1-a', text: 'Take immediate action and get started right away', quadrant: 'acting' },
      { id: 'q1-b', text: 'Create a detailed plan before beginning', quadrant: 'planning' },
      { id: 'q1-c', text: 'Discuss the project with team members to get their input', quadrant: 'feeling' },
      { id: 'q1-d', text: 'Think about the big picture and brainstorm ideas', quadrant: 'thinking' }
    ]
  },
  {
    id: 'q2',
    text: 'I feel most energized when:',
    options: [
      { id: 'q2-a', text: 'I\'m taking decisive action and seeing immediate results', quadrant: 'acting' },
      { id: 'q2-b', text: 'I\'m organizing information and creating structure', quadrant: 'planning' },
      { id: 'q2-c', text: 'I\'m connecting with people and building relationships', quadrant: 'feeling' },
      { id: 'q2-d', text: 'I\'m exploring new concepts and generating ideas', quadrant: 'thinking' }
    ]
  },
  {
    id: 'q3',
    text: 'When solving a problem, I typically:',
    options: [
      { id: 'q3-a', text: 'Take immediate steps to address it', quadrant: 'acting' },
      { id: 'q3-b', text: 'Analyze all the details and create a systematic approach', quadrant: 'planning' },
      { id: 'q3-c', text: 'Consider how it affects people and seek consensus', quadrant: 'feeling' },
      { id: 'q3-d', text: 'Look for patterns and consider multiple perspectives', quadrant: 'thinking' }
    ]
  },
  {
    id: 'q4',
    text: 'Others would describe me as:',
    options: [
      { id: 'q4-a', text: 'Decisive, direct, and results-oriented', quadrant: 'acting' },
      { id: 'q4-b', text: 'Organized, reliable, and detail-focused', quadrant: 'planning' },
      { id: 'q4-c', text: 'Supportive, empathetic, and collaborative', quadrant: 'feeling' },
      { id: 'q4-d', text: 'Innovative, visionary, and analytical', quadrant: 'thinking' }
    ]
  },
  {
    id: 'q5',
    text: 'In a team setting, I naturally tend to:',
    options: [
      { id: 'q5-a', text: 'Drive the team toward action and results', quadrant: 'acting' },
      { id: 'q5-b', text: 'Create structure and ensure everything is on track', quadrant: 'planning' },
      { id: 'q5-c', text: 'Focus on team dynamics and ensure everyone is heard', quadrant: 'feeling' },
      { id: 'q5-d', text: 'Contribute ideas and challenge conventional thinking', quadrant: 'thinking' }
    ]
  }
];

export default function StrengthsAssessment() {
  const { markStepCompleted } = useNavigationProgress();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({
    acting: 0,
    planning: 0,
    feeling: 0,
    thinking: 0
  });
  
  // Calculate how many questions have been answered
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = sampleQuestions.length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);
  
  const handleSelectOption = (questionId: string, optionId: string, quadrant: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleSubmitAssessment = () => {
    if (answeredCount < totalQuestions) {
      toast({
        title: "Assessment Incomplete",
        description: `Please answer all ${totalQuestions} questions before submitting.`,
        variant: "destructive"
      });
      return;
    }
    
    // Calculate results based on selected answers
    const newResults = { acting: 0, planning: 0, feeling: 0, thinking: 0 };
    
    // Count selections for each quadrant
    Object.entries(answers).forEach(([questionId, optionId]) => {
      // Find the question and selected option
      const question = sampleQuestions.find(q => q.id === questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.id === optionId);
        if (selectedOption && selectedOption.quadrant) {
          // Increment the count for the quadrant
          newResults[selectedOption.quadrant as keyof typeof newResults] += 1;
        }
      }
    });
    
    // Convert counts to percentages (for demo purposes)
    const total = Object.values(newResults).reduce((sum, count) => sum + count, 0);
    const percentageResults = Object.entries(newResults).reduce((result, [quadrant, count]) => {
      const percentage = Math.round((count / total) * 100);
      return { ...result, [quadrant]: percentage };
    }, {} as Record<string, number>);
    
    setResults(percentageResults);
    setSubmitted(true);
    
    // Mark step as completed
    markStepCompleted('strengths-assessment');
  };
  
  const handleCompleteStep = () => {
    markStepCompleted('strengths-assessment');
  };
  
  return (
    <MainContainer 
      stepId="strengths-assessment" 
      useModernNavigation={true}
      showStepNavigation={true}
    >
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Core Strengths Assessment"
          description="Discover your unique pattern of strengths across the four quadrants"
          stepId="strengths-assessment"
          estimatedTime={15}
          onNextClick={handleCompleteStep}
          showNextButton={submitted}
        >
          <div className="space-y-6">
            {!submitted ? (
              <>
                <p>
                  Answer the following questions honestly based on what feels most natural to you,
                  not what you think is the "right" answer or what others expect from you.
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                  <p className="text-right text-sm text-gray-500 mt-1">
                    {answeredCount} of {totalQuestions} questions answered
                  </p>
                </div>
                
                <div className="space-y-8">
                  {sampleQuestions.map(question => (
                    <div key={question.id} className="bg-white p-5 rounded-lg border shadow-sm">
                      <h3 className="font-medium text-lg mb-4">{question.text}</h3>
                      <div className="space-y-3">
                        {question.options.map(option => (
                          <div 
                            key={option.id}
                            className={`
                              p-3 rounded-md border cursor-pointer transition-colors
                              ${answers[question.id] === option.id 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-gray-50'
                              }
                            `}
                            onClick={() => handleSelectOption(question.id, option.id, option.quadrant)}
                          >
                            <div className="flex items-center">
                              <div 
                                className={`
                                  w-4 h-4 rounded-full mr-3 border-2 flex-shrink-0
                                  ${answers[question.id] === option.id 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                  }
                                `}
                              ></div>
                              <span>{option.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={handleSubmitAssessment}
                    size="lg"
                    disabled={answeredCount < totalQuestions}
                  >
                    Submit Assessment
                  </Button>
                </div>
              </>
            ) : (
              // Assessment results
              <div className="space-y-6">
                <div className="bg-green-50 p-5 rounded-lg border border-green-100 mb-6">
                  <h3 className="font-medium text-green-800 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Assessment Completed
                  </h3>
                  <p className="text-green-700 mt-2">
                    Based on your answers, we've generated your unique Star Profile showing
                    your natural strengths across the four quadrants.
                  </p>
                </div>
                
                <h3 className="text-xl font-semibold">Your Star Profile Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5 border-l-4 border-l-red-500">
                    <h4 className="font-medium mb-2 flex justify-between">
                      <span>ACTING</span>
                      <span>{results.acting}%</span>
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${results.acting}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your capacity for taking action, being decisive, and driving results.
                    </p>
                  </Card>
                  
                  <Card className="p-5 border-l-4 border-l-yellow-500">
                    <h4 className="font-medium mb-2 flex justify-between">
                      <span>PLANNING</span>
                      <span>{results.planning}%</span>
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${results.planning}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your capacity for organization, structure, and methodical execution.
                    </p>
                  </Card>
                  
                  <Card className="p-5 border-l-4 border-l-blue-500">
                    <h4 className="font-medium mb-2 flex justify-between">
                      <span>FEELING</span>
                      <span>{results.feeling}%</span>
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${results.feeling}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your capacity for empathy, relationship-building, and collaboration.
                    </p>
                  </Card>
                  
                  <Card className="p-5 border-l-4 border-l-green-500">
                    <h4 className="font-medium mb-2 flex justify-between">
                      <span>THINKING</span>
                      <span>{results.thinking}%</span>
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${results.thinking}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your capacity for analysis, vision, and conceptual thinking.
                    </p>
                  </Card>
                </div>
                
                <p className="mt-6">
                  These results represent your natural pattern of strengths. Your highest 
                  quadrants indicate the kinds of activities that likely energize and engage you 
                  the most, while your lower quadrants may represent areas that require more 
                  effort or conscious attention.
                </p>
                
                <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 mt-8">
                  <h4 className="font-medium text-purple-800 mb-2">Next Steps</h4>
                  <p className="text-purple-700 mb-4">
                    In the next section, you'll review your Star Profile in more detail and learn 
                    how to leverage your unique strengths pattern.
                  </p>
                  <Button 
                    onClick={handleCompleteStep}
                    asChild
                  >
                    <Link to="/discover-strengths/review">
                      Continue to Review Your Star Profile <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ContentSection>
      </div>
    </MainContainer>
  );
}