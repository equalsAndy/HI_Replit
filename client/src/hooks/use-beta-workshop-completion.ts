import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from './use-current-user';
import { useQueryClient } from '@tanstack/react-query';

interface BetaWorkshopCompletionState {
  showFeedbackModal: boolean;
  hasSeenReport: boolean;
  workshopCompleted: boolean;
}

export const useBetaWorkshopCompletion = () => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [completionState, setCompletionState] = useState<BetaWorkshopCompletionState>({
    showFeedbackModal: false,
    hasSeenReport: false,
    workshopCompleted: false
  });

  // Check if user is a beta tester
  const isBetaTester = user?.isBetaTester || user?.role === 'admin';

  // Check if workshop is completed (based on user's workshop completion flags)
  const [isWorkshopCompleted, setIsWorkshopCompleted] = useState(false);
  
  // Initialize workshop completion state
  useEffect(() => {
    const baseCompletion = user?.astWorkshopCompleted || user?.iaWorkshopCompleted;
    setIsWorkshopCompleted(baseCompletion || false);
  }, [user?.astWorkshopCompleted, user?.iaWorkshopCompleted]);

  // Listen for workshop completion events
  useEffect(() => {
    const handleWorkshopCompleted = (event: CustomEvent) => {
      console.log('🎉 Workshop completion event received:', event.detail);
      setIsWorkshopCompleted(true);
      
      // Refresh user data to get updated workshop completion status
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Also update completion state
      setCompletionState(prev => ({
        ...prev,
        workshopCompleted: true
      }));
    };

    window.addEventListener('workshopCompleted', handleWorkshopCompleted as EventListener);

    return () => {
      window.removeEventListener('workshopCompleted', handleWorkshopCompleted as EventListener);
    };
  }, [queryClient]);

  const workshopCompleted = isWorkshopCompleted;

  // Debug logging
  console.log('🔍 useBetaWorkshopCompletion - Debug info:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester,
    astWorkshopCompleted: user?.astWorkshopCompleted,
    iaWorkshopCompleted: user?.iaWorkshopCompleted,
    isWorkshopCompleted,
    workshopCompleted,
    hasSeenReport: completionState.hasSeenReport
  });

  // Listen for holistic report view events
  useEffect(() => {
    const handleReportViewed = () => {
      if (isBetaTester && workshopCompleted) {
        console.log('🎉 Beta tester viewed report - marking as seen');
        setCompletionState(prev => ({
          ...prev,
          hasSeenReport: true
        }));
        
        // Store in localStorage so it persists across sessions
        localStorage.setItem(`beta_report_viewed_${user?.id}`, 'true');
      }
    };

    // Listen for custom event when holistic report is viewed
    window.addEventListener('holistic-report-viewed', handleReportViewed);

    return () => {
      window.removeEventListener('holistic-report-viewed', handleReportViewed);
    };
  }, [isBetaTester, workshopCompleted, user?.id]);

  const checkFeedbackStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/beta-tester/feedback-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Don't automatically show feedback modal - only set completion state
        setCompletionState(prev => ({
          ...prev,
          workshopCompleted: true
          // Remove showFeedbackModal: true - this should only be triggered manually
        }));
      }
    } catch (error) {
      console.error('Error checking feedback status:', error);
    }
  }, []);

  // Auto-check if we should show feedback modal on mount
  useEffect(() => {
    if (isBetaTester && workshopCompleted && user?.id) {
      // Check if user has viewed their report (persisted in localStorage)
      const hasViewedReport = localStorage.getItem(`beta_report_viewed_${user.id}`) === 'true';
      
      setCompletionState(prev => ({
        ...prev,
        hasSeenReport: hasViewedReport,
        workshopCompleted: true
      }));
      
      // Check if user has already submitted feedback
      checkFeedbackStatus();
    }
  }, [isBetaTester, workshopCompleted, user?.id, checkFeedbackStatus]);

  const closeFeedbackModal = () => {
    setCompletionState(prev => ({
      ...prev,
      showFeedbackModal: false
    }));
  };

  const submitFeedback = async (feedbackData: any) => {
    try {
      const response = await fetch('/api/beta-tester/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        console.log('✅ Beta feedback submitted successfully');
        setCompletionState(prev => ({
          ...prev,
          showFeedbackModal: false
        }));
        
        // Show success message
        alert('Thank you for your feedback! Your input helps us improve the AllStarTeams experience.');
        return true;
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting beta feedback:', error);
      alert('Failed to submit feedback. Please try again.');
      return false;
    }
  };

  return {
    isBetaTester,
    workshopCompleted,
    showFeedbackModal: completionState.showFeedbackModal,
    hasSeenReport: completionState.hasSeenReport,
    closeFeedbackModal,
    submitFeedback,
    triggerFeedbackModal: () => setCompletionState(prev => ({ ...prev, showFeedbackModal: true }))
  };
};