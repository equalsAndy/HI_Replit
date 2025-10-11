import React from 'react';
import { ImaginalAgilityAssessment } from './ImaginalAgilityAssessment';

interface ImaginalAgilityAssessmentCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (results: any) => void;
}

const ImaginalAgilityAssessmentComplete: React.FC<ImaginalAgilityAssessmentCompleteProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const handleAssessmentComplete = async (assessmentResults: any) => {
    try {
      // Submit assessment results to the backend
      const response = await fetch('/api/workshop-data/ia-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          results: assessmentResults
        })
      });

      if (response.ok) {
        console.log('IA Assessment submitted successfully');        
        onComplete(assessmentResults);
      } else {
        console.error('Failed to submit assessment results');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Still complete the assessment client-side even if submission fails
      onComplete(assessmentResults);
    }
  };

  return (
    <ImaginalAgilityAssessment
      isOpen={isOpen}
      onClose={onClose}
      onComplete={handleAssessmentComplete}
    />
  );
};

export default ImaginalAgilityAssessmentComplete;