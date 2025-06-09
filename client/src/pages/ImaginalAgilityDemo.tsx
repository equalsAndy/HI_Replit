import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, Brain, Heart, Eye, Lightbulb, Shield } from 'lucide-react';

const iaSteps = [
  { id: 'ia-1-1', title: 'Introduction to Imaginal Agility', description: 'Understanding the five core capabilities', icon: Brain },
  { id: 'ia-2-1', title: 'Imagination Development', description: 'Building creative thinking skills', icon: Lightbulb },
  { id: 'ia-3-1', title: 'Curiosity Cultivation', description: 'Enhancing questioning and exploration', icon: Eye },
  { id: 'ia-4-1', title: 'Core Assessment', description: '20-question Likert scale assessment', icon: Shield },
  { id: 'ia-5-1', title: 'Empathy Enhancement', description: 'Developing understanding and connection', icon: Heart },
  { id: 'ia-6-1', title: 'Creativity Expansion', description: 'Unleashing innovative potential', icon: Lightbulb },
  { id: 'ia-7-1', title: 'Courage Building', description: 'Strengthening brave action', icon: Shield },
  { id: 'ia-8-1', title: 'Integration & Next Steps', description: 'Bringing it all together', icon: Brain }
];

const assessmentQuestions = [
  { id: 1, text: "I can easily come up with multiple, unconventional ideas.", category: "imagination" },
  { id: 2, text: "I often generate new ideas in my daily life.", category: "imagination" },
  { id: 3, text: "I ask questions to better understand situations.", category: "curiosity" },
  { id: 4, text: "I enjoy exploring new topics and learning.", category: "curiosity" },
  { id: 5, text: "I can sense how others are feeling.", category: "empathy" },
  { id: 6, text: "I try to understand different perspectives.", category: "empathy" },
  { id: 7, text: "I find unique solutions to problems.", category: "creativity" },
  { id: 8, text: "I enjoy creating new things.", category: "creativity" },
  { id: 9, text: "I speak up when something is important to me.", category: "courage" },
  { id: 10, text: "I take action even when uncertain.", category: "courage" },
  { id: 11, text: "I can visualize detailed future scenarios.", category: "imagination" },
  { id: 12, text: "I think about possibilities beyond the obvious.", category: "imagination" },
  { id: 13, text: "I dig deeper when something interests me.", category: "curiosity" },
  { id: 14, text: "I wonder about how things work.", category: "curiosity" },
  { id: 15, text: "I notice when others need support.", category: "empathy" },
  { id: 16, text: "I can relate to others' experiences.", category: "empathy" },
  { id: 17, text: "I combine ideas in new ways.", category: "creativity" },
  { id: 18, text: "I see connections others might miss.", category: "creativity" },
  { id: 19, text: "I stand up for what I believe in.", category: "courage" },
  { id: 20, text: "I face challenges with confidence.", category: "courage" }
];

export default function ImaginalAgilityDemo() {
  const [currentStep, setCurrentStep] = useState('ia-1-1');
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
    setAssessmentMode(stepId === 'ia-4-1');
    setShowResults(false);
  };

  const handleAssessmentResponse = (questionId: number, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    const categories = ['imagination', 'curiosity', 'empathy', 'creativity', 'courage'];
    const results: Record<string, number> = {};
    
    categories.forEach(category => {
      const categoryQuestions = assessmentQuestions.filter(q => q.category === category);
      const categoryResponses = categoryQuestions.map(q => responses[q.id] || 3);
      const average = categoryResponses.reduce((sum, val) => sum + val, 0) / categoryResponses.length;
      results[category] = Math.round(average * 20); // Scale to 100
    });
    
    return results;
  };

  const currentStepData = iaSteps.find(step => step.id === currentStep);
  const Icon = currentStepData?.icon || Brain;
  const progress = (iaSteps.findIndex(step => step.id === currentStep) + 1) / iaSteps.length * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Imaginal Agility Workshop</h1>
                <p className="text-sm text-gray-600">Developing five core capabilities for innovation</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Navigation Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Workshop Steps</h2>
          <div className="space-y-2">
            {iaSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = index < iaSteps.findIndex(s => s.id === currentStep);
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50'
                      : isCompleted
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-purple-600' : isCompleted ? 'bg-green-600' : 'bg-gray-400'
                    }`}>
                      <StepIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{step.title}</h3>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {!assessmentMode && !showResults && (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{currentStepData?.title}</CardTitle>
                    <CardDescription className="text-lg">{currentStepData?.description}</CardDescription>
                  </div>
                </div>
                <Progress value={progress} className="mt-4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  {currentStep === 'ia-1-1' && (
                    <div>
                      <h3>Welcome to Imaginal Agility</h3>
                      <p>Imaginal Agility represents your capacity to navigate uncertainty and create meaningful change through five interconnected capabilities:</p>
                      <ul>
                        <li><strong>Imagination:</strong> Generating novel possibilities and envisioning futures</li>
                        <li><strong>Curiosity:</strong> Asking questions and exploring with wonder</li>
                        <li><strong>Empathy:</strong> Understanding and connecting with others</li>
                        <li><strong>Creativity:</strong> Combining ideas in innovative ways</li>
                        <li><strong>Courage:</strong> Taking action despite uncertainty</li>
                      </ul>
                    </div>
                  )}
                  
                  {currentStep === 'ia-4-1' && (
                    <div>
                      <h3>Ready for Your Assessment?</h3>
                      <p>The Core Capabilities Assessment consists of 20 questions designed to measure your current levels across all five dimensions of Imaginal Agility.</p>
                      <Button 
                        onClick={() => setAssessmentMode(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Start Assessment <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                  
                  {currentStep !== 'ia-1-1' && currentStep !== 'ia-4-1' && (
                    <div>
                      <h3>Step Content</h3>
                      <p>This step focuses on developing your {currentStepData?.title.toLowerCase()} capabilities through guided exercises and reflections.</p>
                      <p>Content for this step would include videos, interactive exercises, and reflection prompts to help you grow in this area.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {assessmentMode && !showResults && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Core Capabilities Assessment</CardTitle>
                <CardDescription>Question {currentQuestion + 1} of {assessmentQuestions.length}</CardDescription>
                <Progress value={(currentQuestion + 1) / assessmentQuestions.length * 100} />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    {assessmentQuestions[currentQuestion].text}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    How well does this statement reflect your experience?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 1, label: "Not at all like me" },
                      { value: 2, label: "Rarely like me" },
                      { value: 3, label: "Sometimes like me" },
                      { value: 4, label: "Often like me" },
                      { value: 5, label: "Very much like me" }
                    ].map((option) => (
                      <label 
                        key={option.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-white ${
                          responses[assessmentQuestions[currentQuestion].id] === option.value 
                            ? 'border-purple-500 bg-white' 
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option.value}
                          checked={responses[assessmentQuestions[currentQuestion].id] === option.value}
                          onChange={() => handleAssessmentResponse(assessmentQuestions[currentQuestion].id, option.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          responses[assessmentQuestions[currentQuestion].id] === option.value 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-gray-300'
                        }`}>
                          {responses[assessmentQuestions[currentQuestion].id] === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="flex-1">{option.label}</span>
                        <Badge variant="outline">{option.value}</Badge>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    disabled={!responses[assessmentQuestions[currentQuestion].id]}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {currentQuestion === assessmentQuestions.length - 1 ? 'View Results' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showResults && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Imaginal Agility Profile</CardTitle>
                <CardDescription>Your scores across the five core capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(calculateResults()).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-lg font-bold text-purple-600">{score}/100</span>
                    </div>
                    <Progress value={score} className="h-3" />
                  </div>
                ))}
                
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Assessment Complete!</h4>
                  <p className="text-green-700">
                    Your results provide insight into your current Imaginal Agility capabilities. 
                    Use these insights to guide your development journey.
                  </p>
                </div>
                
                <Button 
                  onClick={() => {
                    setAssessmentMode(false);
                    setShowResults(false);
                    setCurrentStep('ia-5-1');
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Next Step
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}