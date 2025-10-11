import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from './use-current-user';

interface BetaFeedbackReviewHook {
  showReviewModal: boolean;
  handleShowReview: () => void;
  handleCloseReview: () => void;
  handleCompleteReview: () => void;
  workshopType?: 'ast' | 'ia';
}

/**
 * Hook to manage the beta tester feedback review modal
 * This should be triggered when a beta tester completes a workshop
 */
export const useBetaFeedbackReview = (): BetaFeedbackReviewHook => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [workshopType, setWorkshopType] = useState<'ast' | 'ia' | undefined>();
  const { data: user } = useCurrentUser();

  // Check if we should show the review modal
  const checkShouldShowReview = useCallback(async () => {
    // Only for beta testers
    if (!user?.isBetaTester) return;

    try {
      // Check if user has completed workshop and has unsubmitted notes
      const response = await fetch('/api/beta-tester/notes/summary', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const { unsubmittedNotes, workshopCompleted } = data;
        
        // Show review modal if workshop completed and has unsubmitted notes
        if (workshopCompleted && unsubmittedNotes > 0) {
          setWorkshopType(data.primaryWorkshopType || 'ast');
          setShowReviewModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking feedback review status:', error);
    }
  }, [user?.isBetaTester]);

  // Check on user change
  useEffect(() => {
    if (user?.isBetaTester) {
      checkShouldShowReview();
    }
  }, [user?.isBetaTester, checkShouldShowReview]);

  // Manual trigger for showing review (can be called when workshop completes)
  const handleShowReview = useCallback((type?: 'ast' | 'ia') => {
    if (user?.isBetaTester) {
      setWorkshopType(type);
      setShowReviewModal(true);
    }
  }, [user?.isBetaTester]);

  const handleCloseReview = useCallback(() => {
    setShowReviewModal(false);
    setWorkshopType(undefined);
  }, []);

  const handleCompleteReview = useCallback(() => {
    setShowReviewModal(false);
    setWorkshopType(undefined);
    
    // Optionally track completion
    console.log('Beta tester completed feedback review');
  }, []);

  return {
    showReviewModal,
    handleShowReview,
    handleCloseReview,
    handleCompleteReview,
    workshopType
  };
};