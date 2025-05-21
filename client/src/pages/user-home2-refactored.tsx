import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigationWithStarCard';
import ContentViews from '@/components/content/ContentViews';
import { navigationSections } from '@/components/navigation/navigationData';
import { StarCard, User, FlowAttributesResponse } from '@/shared/types';

// Constants
const PROGRESS_STORAGE_KEY = 'allstarteams-navigation-progress';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState("welcome");
  
  // Fetch user profile data
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false
  });
  
  // Fetch user's Star Card data
  const { data: starCard } = useQuery<StarCard>({
    queryKey: ['/api/starcard'],
    refetchOnWindowFocus: false
  });
  
  // Fetch flow attributes data
  const { data: flowAttributesData } = useQuery<FlowAttributesResponse>({
    queryKey: ['/api/flow-attributes'],
    refetchOnWindowFocus: false
  });
  
  // Load completed steps from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { completed } = JSON.parse(savedProgress);
        setCompletedSteps(completed || []);
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);
  
  // Update navigation sections with completed steps count
  const updatedNavigationSections = navigationSections.map(section => {
    const completedStepsInSection = section.steps.filter(step => 
      completedSteps.includes(step.id)
    ).length;
    
    return {
      ...section,
      completedSteps: completedStepsInSection
    };
  });
  
  // Toggle drawer open/closed
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: newCompletedSteps }));
    }
  };
  
  // Function to determine if a step is accessible
  const isStepAccessible = (sectionId: string, stepId: string) => {
    const sectionIndex = parseInt(sectionId) - 1;
    const stepIndex = parseInt(stepId.split('-')[1]) - 1;
    
    // If it's the first step of the first section, it's always accessible
    if (sectionIndex === 0 && stepIndex === 0) return true;
    
    // For the first step of other sections, check if all steps in previous section are completed
    if (stepIndex === 0 && sectionIndex > 0) {
      const prevSection = navigationSections[sectionIndex - 1];
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }
    
    // For other steps, check if the previous step in the same section is completed
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    // Mark the assessment step as completed
    markStepCompleted('2-2');
    // You may want to update other state or navigate after assessment completes
  };
  
  // Handle step click
  const handleStepClick = (sectionId: string, stepId: string) => {
    // Handle navigation based on the specific step
    
    // Section 1: AllStarTeams Introduction
    if (stepId === '1-1') {
      // If it's "Introduction Video", show the welcome content
      setCurrentContent("welcome");
      markStepCompleted(stepId);
    } 
    
    // Section 2: Discover your Strengths
    else if (stepId === '2-1') { 
      // If it's "Intro to Strengths", show the content in-place
      setCurrentContent("intro-strengths");
      markStepCompleted(stepId);
    } else if (stepId === '2-2') {
      // If it's "Strengths Assessment", show the content in the right panel
      setCurrentContent("strengths-assessment");
      // Don't mark as completed yet - will do that after assessment
    } else if (stepId === '2-3') {
      // If it's "Star Card Preview", show the star card preview content
      setCurrentContent("star-card-preview");
      markStepCompleted(stepId);
    } else if (stepId === '2-4') {
      // If it's "Reflect", show the reflection content
      setCurrentContent("reflection");
      markStepCompleted(stepId);
    } 
    
    // Section 3: Find your Flow
    else if (stepId === '3-1') {
      // If it's "Intro to Flow", show the flow intro content
      setCurrentContent("intro-flow");
      markStepCompleted(stepId);
    } else if (stepId === '3-2') {
      // Flow Assessment
      setCurrentContent("flow-assessment");
      // Don't mark as completed yet - marking will happen when they complete the assessment
    } else if (stepId === '3-3') {
      // Rounding Out
      setCurrentContent("flow-rounding-out");
      markStepCompleted(stepId);
    } else if (stepId === '3-4') {
      // Add Flow to Star Card
      setCurrentContent("flow-star-card");
      markStepCompleted(stepId);
    } 
    
    // Section 4: Visualize your Potential
    else if (stepId === '4-1') {
      // Ladder of Well-being
      setCurrentContent("wellbeing");
      markStepCompleted(stepId);
    } else if (stepId === '4-2') {
      // Cantril Ladder
      setCurrentContent("cantril-ladder");
      markStepCompleted(stepId);
    } else if (stepId === '4-3') {
      // Visualizing You
      setCurrentContent("visualizing-you");
      markStepCompleted(stepId);
    } else if (stepId === '4-4') {
      // Your Future Self
      setCurrentContent("future-self");
      markStepCompleted(stepId);
    } else if (stepId === '4-5') {
      // Your Statement
      setCurrentContent("your-statement");
      markStepCompleted(stepId);
    } else if (stepId === '4-6') {
      // Recap
      setCurrentContent("recap");
      markStepCompleted(stepId);
    } 
    
    // Resources and other sections
    else {
      // For other pages, use the placeholder content
      setCurrentContent(`placeholder-${stepId}`);
      markStepCompleted(stepId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />
      
      {/* Left Navigation Drawer */}
      <UserHomeNavigation
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        navigationSections={updatedNavigationSections}
        completedSteps={completedSteps}
        isStepAccessible={isStepAccessible}
        handleStepClick={handleStepClick}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <ContentViews
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          user={user}
          flowAttributesData={flowAttributesData}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      </div>
    </div>
  );
}