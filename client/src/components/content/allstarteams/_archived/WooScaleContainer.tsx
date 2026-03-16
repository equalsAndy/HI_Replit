import React, { useState, useEffect } from 'react';
import WooScaleIntro from './WooScaleIntro';
import WooScaleAssessment from './WooScaleAssessment';
import WooScaleResults from './WooScaleResults';

interface WooScaleContainerProps {
  onComplete?: (results: any) => void;
  onSave?: (data: any) => void;
  savedData?: any;
  onSkip?: () => void;
}

type ViewState = 'intro' | 'assessment' | 'results';

const WooScaleContainer: React.FC<WooScaleContainerProps> = ({
  onComplete,
  onSave,
  savedData,
  onSkip
}) => {
  const [currentView, setCurrentView] = useState<ViewState>('intro');
  const [results, setResults] = useState<{ score: number; answers: number[] } | null>(null);

  // Check if user has already completed
  useEffect(() => {
    if (savedData?.score) {
      setResults(savedData);
      setCurrentView('results');
    }
  }, [savedData]);

  const handleBegin = () => {
    setCurrentView('assessment');
  };

  const handleComplete = async (assessmentResults: { score: number; answers: number[] }) => {
    setResults(assessmentResults);

    // Save to localStorage
    localStorage.setItem('woo-scale-results', JSON.stringify(assessmentResults));

    // Save to database if callback provided
    if (onSave) {
      await onSave(assessmentResults);
    }

    setCurrentView('results');
  };

  const handleRetake = () => {
    setResults(null);
    localStorage.removeItem('woo-scale-results');
    setCurrentView('intro');
  };

  const handleContinue = () => {
    if (onComplete && results) {
      onComplete(results);
    }
  };

  const handleSkipFromIntro = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleBackToIntro = () => {
    setCurrentView('intro');
  };

  return (
    <div className="woo-scale-container">
      {currentView === 'intro' && (
        <WooScaleIntro onBegin={handleBegin} onSkip={handleSkipFromIntro} />
      )}

      {currentView === 'assessment' && (
        <WooScaleAssessment onComplete={handleComplete} onBack={handleBackToIntro} />
      )}

      {currentView === 'results' && results && (
        <WooScaleResults
          score={results.score}
          answers={results.answers}
          onRetake={handleRetake}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};

export default WooScaleContainer;
