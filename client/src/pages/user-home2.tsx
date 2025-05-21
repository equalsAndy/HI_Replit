import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import { NavigationDrawer } from '@/components/navigation/NavigationDrawer';
import { ContentViews } from '@/components/content/ContentViews';
import { useLearningState } from '@/hooks/use-learning-state';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  const { 
    completedSteps, 
    currentContent, 
    setCurrentContent, 
    markStepCompleted, 
    isStepAccessible 
  } = useLearningState();

  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
  }>({ queryKey: ['/api/user/profile'] });

  const { data: starCard } = useQuery<{
    id?: number;
    userId: number;
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    state?: string;
    createdAt?: string;
    imageUrl?: string | null;
  }>({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });

  const handleAssessmentComplete = (result: any) => {
    markStepCompleted('2-2');
  };

  const handleStepClick = (step: any, accessible: boolean) => {
    if (accessible) {
      if (step.id === '2-1') {
        setCurrentContent("intro-strengths");
        markStepCompleted(step.id);
      } else if (step.id === '2-2') {
        setCurrentContent("strengths-assessment");
      } else if (step.id === '2-3') {
        setCurrentContent("star-card-preview");
        markStepCompleted(step.id);
      } else if (step.id === '2-4') {
        setCurrentContent("reflection");
        markStepCompleted(step.id);
      } else if (step.id === '3-1') {
        setCurrentContent("intro-flow");
        markStepCompleted(step.id);
      } else {
        navigate(step.path);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />

      <NavigationDrawer 
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        completedSteps={completedSteps}
        isStepAccessible={isStepAccessible}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <ContentViews 
            currentContent={currentContent}
            setCurrentContent={setCurrentContent}
            starCard={starCard}
            markStepCompleted={markStepCompleted}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
          />
        </div>
      </div>
    </div>
  );
}