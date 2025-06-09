import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useIANavigationProgress } from '@/hooks/use-navigation-progress-ia';
import ImaginalAgilityContent from '@/components/content/imaginalagility/ImaginalAgilityContent';

export default function ImaginalAgilityHome() {
  const [location, navigate] = useLocation();
  const [currentContent, setCurrentContent] = useState("ia-introduction");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const { toast } = useToast();

  // Use IA navigation hook
  const {
    progress,
    markStepCompleted,
    isStepCompleted,
    isStepAccessible,
    isNextButtonEnabled
  } = useIANavigationProgress();

  // Check authentication on component mount
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

  // Fetch user profile data
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
      {progress && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Progress:</span>
              <div className="flex space-x-2">
                {['ia-1-1', 'ia-2-1', 'ia-3-1', 'ia-4-1', 'ia-4-2'].map((stepId) => (
                  <div
                    key={stepId}
                    className={`w-3 h-3 rounded-full ${
                      isStepCompleted(stepId)
                        ? 'bg-green-500'
                        : isStepAccessible(stepId)
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {progress.completedSteps.length} of 5 steps completed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <ImaginalAgilityContent
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      </div>
    </div>
  );
}