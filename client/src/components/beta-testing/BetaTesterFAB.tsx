import React, { useState } from 'react';
import { Edit3, MessageSquareText, Star } from 'lucide-react';
import { BetaTesterNotesModal } from './BetaTesterNotesModal';
import { BetaFeedbackSurveyModal } from './BetaFeedbackSurveyModal';
import { ReportPromptModal } from './ReportPromptModal';
import { useCurrentUser } from '../../hooks/use-current-user';
import { isFeatureEnabled } from '../../utils/featureFlags';
import { useBetaWorkshopCompletion } from '../../hooks/use-beta-workshop-completion';

export const BetaTesterFAB: React.FC = () => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isReportPromptOpen, setIsReportPromptOpen] = useState(false);
  const { data: user } = useCurrentUser();
  const { isBetaTester, workshopCompleted, hasSeenReport } = useBetaWorkshopCompletion();

  // Debug logging
  console.log('🔍 BetaTesterFAB - Debug info:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester: user?.isBetaTester,
    astWorkshopCompleted: user?.astWorkshopCompleted,
    iaWorkshopCompleted: user?.iaWorkshopCompleted,
    workshopCompleted,
    hasSeenReport,
    showFeedbackFAB: workshopCompleted
  });

  // Check if feedback system is enabled
  if (!isFeatureEnabled('feedbackSystem')) {
    return null;
  }

  // Only show for beta testers or admin users (admins are also beta testers)
  if (!user?.isBetaTester && user?.role !== 'admin') {
    return null;
  }

  // Determine FAB behavior based on workshop completion state
  const showFeedbackFAB = workshopCompleted;
  const fabTitle = showFeedbackFAB ? 'Beta Feedback Survey' : 'Take Notes (Beta Tester)';
  const fabIcon = showFeedbackFAB ? MessageSquareText : Edit3;

  const handleOpenModal = () => {
    if (showFeedbackFAB) {
      // Workshop is completed - show feedback survey or report prompt
      if (hasSeenReport) {
        // User has seen their report, show feedback survey
        console.log('🔍 Opening beta feedback survey modal');
        setIsFeedbackModalOpen(true);
      } else {
        // User hasn't seen report yet, prompt them to view it first
        console.log('🔍 Opening report prompt modal');
        setIsReportPromptOpen(true);
      }
    } else {
      // Workshop not completed - show notes modal
      console.log('🔍 Opening beta tester notes modal');
      setIsNotesModalOpen(true);
    }
  };

  const handleCloseNotesModal = () => {
    console.log('🔍 Closing notes modal');
    setIsNotesModalOpen(false);
  };

  const handleCloseFeedbackModal = () => {
    console.log('🔍 Closing feedback modal');
    setIsFeedbackModalOpen(false);
  };

  const handleCloseReportPrompt = () => {
    console.log('🔍 Closing report prompt modal');
    setIsReportPromptOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-40 group ${
          showFeedbackFAB 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-purple-500 to-indigo-600'
        }`}
        title={fabTitle}
      >
        {React.createElement(fabIcon, { 
          size: 24, 
          className: "group-hover:scale-110 transition-transform" 
        })}
      </button>

      {/* Notes Modal - shown during workshop */}
      <BetaTesterNotesModal
        isOpen={isNotesModalOpen}
        onClose={handleCloseNotesModal}
      />

      {/* Feedback Survey Modal - shown after completion when report viewed */}
      <BetaFeedbackSurveyModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
      />

      {/* Report Prompt Modal - shown after completion when report not viewed */}
      <ReportPromptModal
        isOpen={isReportPromptOpen}
        onClose={handleCloseReportPrompt}
      />
    </>
  );
};