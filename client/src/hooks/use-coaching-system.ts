// client/src/hooks/use-coaching-system.ts
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface CoachingSystemState {
  isEnabled: boolean;
  conversationType: 'workshop_assistant' | 'post_workshop_coach' | 'team_prep';
  demoMode: boolean;
  teamAccess: boolean;
  currentConversationId: string | null;
  isLoading: boolean;
}

export function useCoachingSystem(currentStep?: string) {
  const [state, setState] = useState<CoachingSystemState>({
    isEnabled: false,
    conversationType: 'workshop_assistant',
    demoMode: false,
    teamAccess: true,
    currentConversationId: null,
    isLoading: true
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      determineCoachingContext();
    }
  }, [user, currentStep]);

  const determineCoachingContext = () => {
    if (!user) return;

    const isWorkshopCompleted = user.astWorkshopCompleted;
    const teamAccess = user.teamAccess ?? true;
    const isTestUser = user.isTestUser;
    
    // Determine conversation type based on context
    let conversationType: CoachingSystemState['conversationType'] = 'workshop_assistant';
    
    if (currentStep === '5-4') {
      conversationType = 'team_prep';
    } else if (isWorkshopCompleted) {
      conversationType = 'post_workshop_coach';
    } else {
      conversationType = 'workshop_assistant';
    }

    setState({
      isEnabled: true,
      conversationType,
      demoMode: isTestUser,
      teamAccess,
      currentConversationId: null,
      isLoading: false
    });
  };

  const startConversation = async () => {
    if (!user || state.currentConversationId) return;

    try {
      const response = await fetch('/api/coaching/conversation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          conversationType: state.conversationType,
          context: currentStep,
          demoMode: state.demoMode,
          teamAccess: state.teamAccess
        })
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          currentConversationId: data.conversationId
        }));
        return data.conversationId;
      }
    } catch (error) {
      console.error('Failed to start coaching conversation:', error);
    }
    return null;
  };

  const updateTeamAccess = (hasTeamAccess: boolean) => {
    setState(prev => ({
      ...prev,
      teamAccess: hasTeamAccess
    }));
  };

  return {
    ...state,
    startConversation,
    updateTeamAccess
  };
}