import React, { useState } from 'react';
import PersonalProfileHub from './PersonalProfileHub';
import AddYourAssessments from './AddYourAssessments';
import QuickStartProfile from './QuickStartProfile';
import WooInventoryScale from './WooInventoryScale';

type ViewState = 'hub' | 'add-assessments-activity' | 'quick-start-activity' | 'woo-assessment-activity';

interface PersonalProfileContainerProps {
  navigate?: (path: string) => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => Promise<void>;
}

const PersonalProfileContainer: React.FC<PersonalProfileContainerProps> = ({
  navigate,
  setCurrentContent: externalSetCurrentContent,
  markStepCompleted
}) => {
  const [currentView, setCurrentView] = useState<ViewState>('hub');

  const handleSetCurrentContent = (content: string) => {
    // Handle internal navigation
    if (content === 'add-assessments-activity') {
      setCurrentView('add-assessments-activity');
    } else if (content === 'quick-start-activity') {
      setCurrentView('quick-start-activity');
    } else if (content === 'woo-assessment-activity') {
      setCurrentView('woo-assessment-activity');
    } else if (externalSetCurrentContent) {
      // Pass through to external navigation
      externalSetCurrentContent(content);
    }
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
  };

  const handleActivityComplete = async () => {
    // Mark the activity as completed
    // This will refresh the hub to show updated status
    setCurrentView('hub');
  };

  return (
    <>
      {currentView === 'hub' && (
        <PersonalProfileHub
          navigate={navigate}
          setCurrentContent={handleSetCurrentContent}
          markStepCompleted={markStepCompleted}
        />
      )}

      {currentView === 'add-assessments-activity' && (
        <AddYourAssessments
          onBack={handleBackToHub}
          onComplete={handleActivityComplete}
        />
      )}

      {currentView === 'quick-start-activity' && (
        <QuickStartProfile
          onBack={handleBackToHub}
          onComplete={handleActivityComplete}
        />
      )}

      {currentView === 'woo-assessment-activity' && (
        <WooInventoryScale
          onBack={handleBackToHub}
          onComplete={handleActivityComplete}
        />
      )}
    </>
  );
};

export default PersonalProfileContainer;
