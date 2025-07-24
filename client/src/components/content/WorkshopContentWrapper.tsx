import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCoachingSystem } from '@/hooks/use-coaching-system';
import TaliaCoach from '@/components/coaching/TaliaCoach';
import TeamWorkshopContent from '@/components/content/TeamWorkshopContent';

interface WorkshopContentWrapperProps {
  stepId: string;
  children: React.ReactNode;
}

export default function WorkshopContentWrapper({ stepId, children }: WorkshopContentWrapperProps) {
  const { user } = useAuth();
  const coaching = useCoachingSystem(stepId);

  if (!user) return <>{children}</>;

  // Special handling for step 5-4 (Team Workshop Prep vs Info)
  if (stepId === '5-4') {
    return (
      <div className="relative">
        <TeamWorkshopContent
          userId={user.id}
          teamAccess={coaching.teamAccess}
          workshopCompleted={user.astWorkshopCompleted}
          userName={user.name}
        />
        
        {/* Coaching assistant available on all steps */}
        {coaching.isEnabled && (
          <TaliaCoach
            userId={user.id}
            workshopCompleted={user.astWorkshopCompleted}
            currentStep={stepId}
            conversationType={coaching.conversationType}
            demoMode={coaching.demoMode}
            teamAccess={coaching.teamAccess}
          />
        )}
      </div>
    );
  }

  // Regular workshop content with coaching assistant
  return (
    <div className="relative">
      {children}
      
      {/* Coaching assistant available on all steps */}
      {coaching.isEnabled && (
        <TaliaCoach
          userId={user.id}
          workshopCompleted={user.astWorkshopCompleted}
          currentStep={stepId}
          conversationType={coaching.conversationType}
          demoMode={coaching.demoMode}
          teamAccess={coaching.teamAccess}
        />
      )}
    </div>
  );
}