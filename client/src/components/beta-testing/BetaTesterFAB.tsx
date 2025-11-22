import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import { BetaTesterNotesModal } from './BetaTesterNotesModal';
import { useCurrentUser } from '../../hooks/use-current-user';
import { isFeatureEnabled } from '../../utils/featureFlags';
import { useBetaWorkshopCompletion } from '../../hooks/use-beta-workshop-completion';

export const BetaTesterFAB: React.FC = () => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const { isBetaTester, workshopCompleted } = useBetaWorkshopCompletion();

  // Get the actual viewing step from URL (what user is currently looking at)
  const [currentViewingStep, setCurrentViewingStep] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getStepFromUrl = () => {
      const url = window.location.pathname;
      const match = url.match(/\/(\d+-\d+|ia-\d+-\d+)/);
      return match ? match[1] : undefined;
    };

    // Update viewing step whenever URL changes
    const updateViewingStep = () => {
      const stepId = getStepFromUrl();
      console.log('🔍 FAB: Updating viewing step to:', stepId, 'from URL:', window.location.pathname);
      setCurrentViewingStep(stepId);
    };

    // Initial update
    updateViewingStep();

    // Listen for URL changes
    const handleUrlChange = () => {
      updateViewingStep();
    };

    window.addEventListener('popstate', handleUrlChange);

    // Also listen for programmatic navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleUrlChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // No need for page detection since FAB is hidden after workshop completion

  // Check if feedback system is enabled
  if (!isFeatureEnabled('feedbackSystem')) {
    return null;
  }

  // Only show for beta testers or admin users (admins are also beta testers)
  if (!user?.isBetaTester && user?.role !== 'admin') {
    return null;
  }

  // Hide FAB entirely after workshop completion - direct users to reports page instead
  if (workshopCompleted) {
    return null;
  }

  // Only show notes FAB during workshop (before completion)
  const showFeedbackFAB = false; // Never show feedback FAB - use dedicated button on reports page
  const showReportPrompt = false; // Never show report prompt - use dedicated button on reports page
  
  // Only show notes FAB during workshop
  const fabTitle = 'Take Notes (Beta Tester)';
  const fabIcon = Edit3;

  // Debug logging
  console.log('🔍 BetaTesterFAB - Debug info:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester: user?.isBetaTester,
    workshopCompleted,
    showingFAB: !workshopCompleted,
    fabTitle
  });

  const handleOpenModal = () => {
    // Only show notes modal during workshop (before completion)
    console.log('🔍 Opening beta tester notes modal');
    console.log('🔍 Current viewing step from FAB:', currentViewingStep);
    console.log('🔍 Current URL:', window.location.pathname);
    setIsNotesModalOpen(true);
  };

  const handleCloseNotesModal = () => {
    console.log('🔍 Closing notes modal');
    setIsNotesModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-40 group bg-gradient-to-r from-purple-500 to-indigo-600"
        title={fabTitle}
      >
        {React.createElement(fabIcon, { 
          size: 24, 
          className: "group-hover:scale-110 transition-transform" 
        })}
      </button>

      {/* Notes Modal - shown during workshop only */}
      <BetaTesterNotesModal
        isOpen={isNotesModalOpen}
        onClose={handleCloseNotesModal}
        viewingStepId={currentViewingStep}
      />
    </>
  );
};