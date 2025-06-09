import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import VideoPlayer from '@/components/content/VideoPlayer';

export default function ImaginalAgilityHome() {
  const [location, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState('ia-1-1');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me');
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Please log in to access this workshop.",
          });
          localStorage.setItem('selectedApp', 'imaginal-agility');
          navigate('/auth?app=imaginal-agility');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/auth?app=imaginal-agility');
      }
    };
    checkAuth();
  }, [navigate, toast]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('ia-navigation-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCurrentStep(parsed.currentStepId || 'ia-1-1');
        setCompletedSteps(parsed.completedSteps || []);
      } catch (error) {
        console.error('Failed to parse IA progress:', error);
      }
    }
  }, []);

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      role?: string;
    }
  }>({
    queryKey: ['/api/user/me'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  const markStepCompleted = (stepId: string) => {
    const updatedCompleted = [...new Set([...completedSteps, stepId])];
    setCompletedSteps(updatedCompleted);
    
    const progress = {
      completedSteps: updatedCompleted,
      currentStepId: stepId,
      appType: 'ia',
      lastVisitedAt: new Date().toISOString(),
      unlockedSteps: updatedCompleted,
      videoProgress: {}
    };
    
    localStorage.setItem('ia-navigation-progress', JSON.stringify(progress));
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);
  
  const getNextStep = (stepId: string) => {
    const sequence = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'];
    const currentIndex = sequence.indexOf(stepId);
    return sequence[currentIndex + 1] || null;
  };

  const handleNext = (currentStepId: string) => {
    markStepCompleted(currentStepId);
    const nextStep = getNextStep(currentStepId);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading Imaginal Agility Workshop...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'ia-1-1':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Imaginal Agility Workshop Course › Orientation
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Introduction to Imaginal Agility
              </h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/k3mDEAbUwZ4?enablejsapi=1&autoplay=1&rel=0"
                  title="Introduction to Imaginal Agility"
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome.</h2>
              
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.
                </p>
                
                <p>
                  As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.
                </p>
                
                <p>This Micro Course is your starting point.</p>
                
                <p>
                  You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.
                </p>
                
                <p>
                  It's the first step in building <strong>Imaginal Agility</strong> — a skillset for navigating change, solving problems, and creating value.
                </p>
                
                <p>
                  Next, you'll meet with your team to turn fresh insight into shared breakthroughs.
                </p>
                
                <p className="font-medium">
                  You're not just learning about imagination. You're harnessing it — together.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleNext('ia-1-1')}
                className="px-6 py-3 text-base font-medium"
              >
                Next: The Triple Challenge
              </Button>
            </div>
          </div>
        );

      case 'ia-2-1':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Imaginal Agility Workshop Course › AI's Triple Challenge
              </div>
              <h1 className="text-3xl font-bold text-gray-900">The Triple Challenge</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/EsExXeKFiKg?enablejsapi=1&autoplay=1&rel=0"
                  title="The Triple Challenge"
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">AI's Triple Challenge Overview</h2>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.
              </p>

              <div className="grid gap-4">
                <div className="flex">
                  <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                    <h3 className="text-xl font-semibold">Metacognitive Laziness</h3>
                  </div>
                  <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                    <p className="text-gray-700">Outsourcing thinking and sense-making</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                    <h3 className="text-xl font-semibold">Imagination Deficit</h3>
                  </div>
                  <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                    <p className="text-gray-700">Diminishing the generative core of human potential</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                    <h3 className="text-xl font-semibold">Psychological Debt</h3>
                  </div>
                  <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                    <p className="text-gray-700">Fatigue, disconnection, and loss of purpose</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleNext('ia-2-1')}
                className="px-6 py-3 text-base font-medium"
              >
                Next: Imaginal Agility Solution
              </Button>
            </div>
          </div>
        );

      case 'ia-3-1':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Imaginal Agility Workshop Course › Introducing Imaginal Agility
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Imaginal Agility Solution</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/l3XVwPGE6UY?enablejsapi=1&autoplay=1&rel=0"
                  title="Imaginal Agility Solution"
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome</h2>
              
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Imagination is a primal human power — not content with what we know, but impelled to ask: 'What if?' Let's explore what this means, and how to harness it — individually and as a team.
                </p>
                
                <p>
                  Upon viewing the video, please click on the button below to complete your Core Capabilities Self-Assessment.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleNext('ia-3-1')}
                className="px-6 py-3 text-base font-medium"
              >
                Next: Self-Assessment
              </Button>
            </div>
          </div>
        );

      case 'ia-4-1':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Imaginal Agility Workshop Course › Assessment
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Self-Assessment</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-video">
                <iframe 
                  src="https://www.youtube.com/embed/Xdn8lkSzTZU?enablejsapi=1&autoplay=1&rel=0"
                  title="Self-Assessment"
                  className="w-full h-full border-0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Core Capabilities Assessment</h2>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                This assessment will help you understand your current strengths across the five core capabilities of Imaginal Agility: Imagination, Curiosity, Empathy, Creativity, and Courage.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Assessment functionality is being developed. For now, you can proceed to see the assessment results structure.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => handleNext('ia-4-1')}
                className="px-6 py-3 text-base font-medium"
              >
                Next: Review Results
              </Button>
            </div>
          </div>
        );

      case 'ia-4-2':
        return (
          <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-blue-600 mb-2">
                Imaginal Agility Workshop Course › Assessment Results
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Review Results</h1>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Core Capabilities Profile</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800">Five Core Capabilities</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-blue-700">Imagination</h4>
                      <p className="text-sm text-gray-600">The ability to envision new possibilities</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-green-700">Curiosity</h4>
                      <p className="text-sm text-gray-600">An openness to exploring and questioning</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-purple-700">Empathy</h4>
                      <p className="text-sm text-gray-600">Understanding perspectives beyond your own</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-orange-700">Creativity</h4>
                      <p className="text-sm text-gray-600">Finding novel solutions to challenges</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-red-700">Courage</h4>
                      <p className="text-sm text-gray-600">Acting on values despite uncertainty</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Radar Chart Visualization</h3>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Radar chart will display here once assessment is completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h3>
              <p className="text-blue-800">
                Your assessment results will guide your development journey in building stronger Imaginal Agility capabilities.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setCurrentStep('ia-1-1')}
                variant="outline"
                className="px-6 py-3 text-base font-medium"
              >
                Return to Beginning
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Step Not Found</h1>
            <Button onClick={() => setCurrentStep('ia-1-1')}>Return to Start</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Imaginal Agility Workshop</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user?.user?.name && (
              <span className="text-blue-100">Welcome, {user.user.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Progress:</span>
            <div className="flex space-x-2">
              {['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'].map((stepId) => (
                <div
                  key={stepId}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    isStepCompleted(stepId)
                      ? 'bg-green-500'
                      : currentStep === stepId
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    const stepIndex = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'].indexOf(stepId);
                    const currentIndex = ['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'].indexOf(currentStep);
                    if (stepIndex <= currentIndex || completedSteps.length > stepIndex) {
                      setCurrentStep(stepId);
                    }
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {completedSteps.length} of 5 steps completed
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        {renderStepContent()}
      </div>
    </div>
  );
}