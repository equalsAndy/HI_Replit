import { useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import StepItem from './StepItem';
import ProfileForm from '@/components/profile/ProfileForm';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { User, Assessment, StarCard } from '@shared/schema';

interface StepListProps {
  activeStep?: string;
}

export default function StepList({ activeStep }: StepListProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [expandedStep, setExpandedStep] = useState<string | null>(activeStep || null);
  
  // Fetch user profile with progress
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity
  });

  // Fetch assessment
  const { data: assessment } = useQuery<Assessment>({
    queryKey: ['/api/assessment/start'],
    enabled: !!user, // Only fetch if user is available
    staleTime: Infinity
  });

  // Fetch starcard data
  const { data: starCard } = useQuery<StarCard>({
    queryKey: ['/api/starcard'],
    enabled: !!assessment && !!assessment.completed, // Only fetch if assessment is completed
    staleTime: Infinity
  });

  // Mutation for marking star report as reviewed
  const markReportReviewed = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/starcard/reviewed', {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Star report reviewed",
        description: "Your progress has been updated.",
      });
    }
  });

  const handleStepToggle = (step: string) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  const handleProfileComplete = () => {
    // This is handled by the profile update endpoint
    setExpandedStep('assessment');
  };

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleReviewReport = () => {
    navigate('/report');
  };

  if (isLoading) {
    return <div>Loading steps...</div>;
  }

  // Calculate completion state
  const userProgress = user?.progress ?? 0;
  const isProfileComplete = userProgress >= 33;
  const isAssessmentComplete = userProgress >= 67;
  const isReportReviewed = userProgress === 100;

  return (
    <div className="steps-sidebar space-y-4">
      <StepItem
        title={isProfileComplete ? "Profile Complete" : "Complete your Profile"}
        isComplete={isProfileComplete}
        icon="profile"
        isOpen={expandedStep === 'profile'}
        onToggle={() => handleStepToggle('profile')}
      >
        <ProfileForm onCompleted={handleProfileComplete} />
      </StepItem>
      
      <StepItem
        title={isAssessmentComplete ? "Assessment Complete" : "Complete an Assessment"}
        isComplete={isAssessmentComplete}
        icon="assessment"
        isOpen={expandedStep === 'assessment'}
        onToggle={() => handleStepToggle('assessment')}
      >
        <div className="mb-6">
          <p className="text-sm mb-4">Take the quick 22-question assessment.</p>
          <Button 
            onClick={handleStartAssessment}
            className="w-full bg-primary hover:bg-primary-dark text-white"
            disabled={!isProfileComplete}
          >
            Start Assessment
          </Button>
        </div>
      </StepItem>
      
      <StepItem
        title={isReportReviewed ? "Star Report Reviewed" : "Review your Star Report"}
        isComplete={isReportReviewed}
        icon="report"
        isOpen={expandedStep === 'report'}
        onToggle={() => handleStepToggle('report')}
      >
        <p className="text-sm mb-4">Click below to review your Star Report.</p>
        <Button 
          onClick={handleReviewReport}
          className="w-full bg-primary hover:bg-primary-dark text-white mb-4"
          disabled={!isAssessmentComplete}
        >
          Review your Star Report
        </Button>
      </StepItem>
      
      <StepItem
        title="Your Whiteboard Start Point"
        isComplete={false}
        icon="whiteboard"
        isOpen={expandedStep === 'whiteboard'}
        onToggle={() => handleStepToggle('whiteboard')}
      >
        <div className="mb-4">
          <p className="text-sm mb-4">Before you continue on to your whiteboard, you need to have the following 2 assets downloaded to your computer:</p>
          <ul className="list-disc pl-5 mb-4 text-sm">
            <li className="mb-2"><strong>Your Star Report PDF:</strong> There is a download button at the bottom of your report. Click on the previous step to access your Report if you haven't already downloaded it.</li>
            <li className="mb-2"><strong>Your Star Card:</strong> You can download it using the Download Star Card button just below your Star Card (located on the right side of this page).</li>
          </ul>
          <p className="text-sm mb-4">Once you have both files downloaded, click on the Launch My Whiteboard button below to continue on to whiteboard.</p>
          <Button className="w-full bg-neutral-200 text-neutral-600 cursor-not-allowed" disabled>
            Whiteboard Unavailable
          </Button>
        </div>
      </StepItem>
    </div>
  );
}
