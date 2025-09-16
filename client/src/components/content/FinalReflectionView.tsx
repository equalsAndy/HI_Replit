
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTestUser } from '@/hooks/useTestUser';
import { useCurrentUser } from '@/hooks/use-current-user';
import { FileText } from 'lucide-react';
import ladderImage from '@assets/journeyladder_1749683540778.png';
import allstarteamsLogo from '@assets/all-star-teams-logo-250px.png';
import { validateTextInput } from '@/lib/validation';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';
import { BetaFinalReflectionModal } from '@/components/beta-testing/BetaFinalReflectionModal';

interface FinalReflectionViewProps {
  currentContent: string;
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

interface FinalReflectionData {
  futureLetterText: string;
}

export default function FinalReflectionView({ 
  currentContent, 
  navigate, 
  markStepCompleted, 
  setCurrentContent 
}: FinalReflectionViewProps) {
  const queryClient = useQueryClient();
  const [insight, setInsight] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBetaEndModal, setShowBetaEndModal] = useState(false);
  const { shouldShowDemoButtons } = useTestUser();
  const { data: user } = useCurrentUser();
  
  // Application context for proper app type detection
  const { currentApp } = useApplication();
  const appType = currentApp === 'allstarteams' ? 'ast' : 'ia';
  
  // Workshop status
  const { astCompleted, iaCompleted, loading, isWorkshopLocked, triggerGlobalCompletion } = useWorkshopStatus();
  const completed = appType === 'ast' ? astCompleted : iaCompleted;
  
  // Return visit auto-modal countdown (5 seconds)
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Modal auto-close countdown (20 seconds)
  const [modalCountdown, setModalCountdown] = useState(20);
  const [isModalCountingDown, setIsModalCountingDown] = useState(false);
  
  // Save status tracking
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Validation state
  const [validationError, setValidationError] = useState<string>('');

  // Note: Step 4-5 should only be marked completed when user actually submits their final reflection
  // This is handled in the handleComplete function, not on component mount

  // Fetch existing final reflection data
  const { data: existingData } = useQuery({
    queryKey: ['/api/workshop-data/final-reflection'],
    staleTime: 30000,
  });

  // Check if step is completed - using simple text length check for now
  // TODO: Replace with actual progression system check
  const isStepCompleted = existingData && typeof existingData === 'object' && 'success' in existingData && 
    existingData.success && 'data' in existingData && existingData.data && 
    typeof existingData.data === 'object' && 'futureLetterText' in existingData.data &&
    existingData.data.futureLetterText && 
    typeof existingData.data.futureLetterText === 'string' &&
    existingData.data.futureLetterText.length >= 10;
  
  const savedInsight = existingData && typeof existingData === 'object' && 'data' in existingData && 
    existingData.data && typeof existingData.data === 'object' && 'futureLetterText' in existingData.data &&
    typeof existingData.data.futureLetterText === 'string' ? existingData.data.futureLetterText : '';

  useEffect(() => {
    if (existingData && typeof existingData === 'object' && 'success' in existingData && 
        existingData.success && 'data' in existingData && existingData.data && 
        typeof existingData.data === 'object' && 'futureLetterText' in existingData.data &&
        existingData.data.futureLetterText) {
      // Always set the insight from saved data when available
      setInsight(String(existingData.data.futureLetterText));
    }
  }, [existingData]);

  // Remove auto-show modal - users will click "View Options" button instead

  // Auto-close modal after 20 seconds for first-time completion
  useEffect(() => {
    if (showModal && !isStepCompleted) { // Only for first-time completion
      setModalCountdown(20);
      setIsModalCountingDown(true);
      
      const timer = setInterval(() => {
        setModalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsModalCountingDown(false);
            setShowModal(false);
            if (setCurrentContent) {
              setCurrentContent('download-star-card'); // Navigate to star card
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setIsModalCountingDown(false);
      };
    }
  }, [showModal, isStepCompleted, setCurrentContent]);

  // Save final reflection data
  const saveMutation = useMutation({
    mutationFn: (data: FinalReflectionData) => {
      setSaveStatus('saving');
      return apiRequest('/api/workshop-data/final-reflection', {
        method: 'POST',
        body: data, // apiRequest will handle JSON.stringify
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/final-reflection'] });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000); // Clear saved status after 2 seconds
    },
    onError: (error) => {
      console.error('Failed to save final reflection:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000); // Clear error status after 3 seconds
    },
  });

  // Debounced auto-save function
  // Function to populate with meaningful demo data
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoInsights = [
      "I want to carry forward the understanding that my unique combination of strengths creates value when I lean into them fully. My top strength in planning gives me the foundation to create structure, while my feeling strength helps me ensure that structure serves people, not just processes.",
      "The key insight I'm taking with me is that my authentic contribution emerges when I stop trying to be good at everything and instead focus on being excellent at what energizes me. My strengths work best when I use them intentionally in service of both individual and team goals.",
      "What I want to remember is that self-awareness is not a destination but a practice. Understanding my strengths profile gives me a compass for decision-making, whether I'm choosing how to contribute to a project or advocating for the conditions where I can do my best work."
    ];
    
    const randomInsight = demoInsights[Math.floor(Math.random() * demoInsights.length)];
    setInsight(randomInsight);
  };

  const handleInsightChange = (value: string) => {
    setInsight(value);
    // Clear validation error when user starts typing
    if (validationError && value.trim().length >= 10) {
      setValidationError('');
    }
    // Removed auto-save - data will only save when user clicks "Complete Your Journey"
  };

  const handleComplete = async () => {
    // Validate input before proceeding
    const error = validateTextInput(insight, 'insight', 10);
    if (error) {
      setValidationError(error.message);
      return;
    }
    
    // Clear any previous validation errors
    setValidationError('');
    
    // Save the final reflection data - workshop completion handled separately
    setSaveStatus('saving');
    try {
      const saveData = { futureLetterText: insight.trim() };
      const result = await saveMutation.mutateAsync(saveData);
      setSaveStatus('saved');

      // Mark step as completed
      markStepCompleted('3-3');
      
      // Navigate to workshop recap instead of showing modal
      if (!user?.isBetaTester) {
        setCurrentContent('workshop-recap');
      }
      
    } catch (error) {
      console.error('Failed to save final reflection:', error);
      setSaveStatus('error');
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal || showBetaEndModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal, showBetaEndModal]);

  // Show beta tester end modal when they first arrive at Final Reflection
  useEffect(() => {
    if (user?.isBetaTester && !completed) {
      const sessionKey = `beta_end_modal_shown_${user.id}`;
      const hasShownThisSession = sessionStorage.getItem(sessionKey);
      
      if (!hasShownThisSession) {
        setShowBetaEndModal(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [user?.isBetaTester, user?.id, completed]);

  const handleModalOption = (option: string) => {
    setIsModalCountingDown(false); // Stop countdown
    setShowModal(false);
    
    // Navigate based on option using setCurrentContent
    switch(option) {
      case 'star-card':
        if (setCurrentContent) {
          setCurrentContent('download-star-card');
        }
        break;
      case 'holistic-report':
        if (setCurrentContent) {
          setCurrentContent('holistic-report');
        }
        break;
      case 'growth-plan':
        if (setCurrentContent) {
          setCurrentContent('growth-plan');
        }
        break;
      case 'team-workshop':
        if (setCurrentContent) {
          setCurrentContent('team-workshop-prep');
        }
        break;
      default:
        if (setCurrentContent) {
          setCurrentContent('download-star-card'); // Default to star card
        }
        break;
    }
  };

  const closeModal = () => {
    setIsModalCountingDown(false); // Stop countdown
    setShowModal(false);
    
    // Only navigate for first-time completion
    if (!isStepCompleted && setCurrentContent) {
      setCurrentContent('download-star-card'); // Navigate to star card
    }
    // Returning users: just close modal, stay on page
  };

  return (
    <>


      {/* Workshop Completion Banner */}
      {completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-3">
            <FileText className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Workshop complete. Your responses are locked, but you can watch videos and read your answers.
              </h3>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      <div className="final-reflection-container">
        <div className="content-layout">
          {/* Top Section: Ladder + Explanation Side by Side */}
          <div className="ladder-section">
            <div className="ladder-container">
              <img 
                src={ladderImage} 
                alt="Your personal journey ladder showing each step of growth"
                className="ladder-image"
              />
            </div>
            
            <div className="explanation-content">
              <h3 className="explanation-title">What This Ladder Represents</h3>
              
              <div className="explanation-item">
                <h4 className="item-title">A Natural Progression</h4>
                <p className="item-text">
                  Each step builds on the one before — not in leaps, but in deepening awareness.
                </p>
              </div>
              
              <div className="explanation-item">
                <h4 className="item-title">Reflective Mirror</h4>
                <p className="item-text">
                  This journey wasn't about adding something new. It was about surfacing 
                  what's already strong within you.
                </p>
              </div>
              
              <div className="explanation-item">
                <h4 className="item-title">Team Flow Starts Here</h4>
                <p className="item-text">
                  Your self-awareness is your starting point. Now you're ready to contribute 
                  with clarity and imagination.
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Section: Reflection */}
          <div className="reflection-section">
            <div className="reflection-header">
              <h2 className="section-title">What's the one insight you want to carry forward?</h2>
              <p className="intro-text">
                You've just completed a journey of personal discovery. From understanding your core strengths to envisioning your future potential, each step revealed something valuable about who you are.
              </p>
              <p className="intro-text">
                Now, distill this experience into one clear insight that will guide you forward—something you want to remember as you move into team collaboration.
              </p>
            </div>
            
            <div className="input-section">
              <div className="textarea-wrapper">
                <textarea
                  className={`insight-input ${isStepCompleted || completed ? 'readonly' : ''} ${validationError ? 'border-red-300 focus:border-red-500' : ''}`}
                  value={insight}
                  onChange={isStepCompleted || completed ? undefined : (e) => handleInsightChange(e.target.value)}
                  disabled={isStepCompleted || completed}
                  readOnly={isStepCompleted || completed}
                  placeholder={isStepCompleted || completed ? (completed ? "This workshop is completed and locked for editing" : "") : "What I want to carry forward is..."}
                  rows={4}
                />
                
                {/* Validation feedback */}
                {!isStepCompleted && !completed && (
                  <ValidationMessage 
                    message={validationError} 
                    type="error" 
                    show={!!validationError}
                  />
                )}
                
                {/* Save status shown only when user clicks Complete Your Journey */}
                {saveStatus === 'saving' && !isStepCompleted && (
                  <div className="save-status">
                    <span className="status saving">Saving...</span>
                  </div>
                )}
              </div>
              
              <div className="action-section">
                {!isStepCompleted && !completed ? (
                  // Original completion flow for first-time users
                  <>
                    <div className="flex items-center justify-center gap-3">
                      {shouldShowDemoButtons && (
                        <button
                          onClick={fillWithDemoData}
                          className="demo-button-inline"
                          type="button"
                        >
                          <FileText className="demo-icon" />
                          Add Demo Data
                        </button>
                      )}
                      
                      {/* Gentle completion notice */}
                      <div className="completion-notice mb-3">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="text-blue-500">ℹ️</span>
                          Finishing your workshop will prevent any further editing.
                        </p>
                      </div>
                      
                      <button
                        className={`continue-button ${insight.length >= 10 ? 'enabled' : 'disabled'}`}
                        onClick={handleComplete}
                        disabled={insight.length < 10}
                      >
                        Complete Your Journey
                      </button>
                    </div>
                    
                    {insight.length < 10 && (
                      <p className="helper-text">
                        Share your insight to complete the workshop
                      </p>
                    )}
                  </>
                ) : completed ? (
                  // Workshop completed via locking system
                  <div className="completed-section">
                    <div className="completion-indicator">
                      <span className="checkmark">✅</span>
                      <p className="completed-text">Workshop complete. Your responses are locked, but you can watch videos and read your answers.</p>
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setShowModal(true)}
                        className="continue-button enabled"
                      >
                        View Options
                      </button>
                    </div>
                  </div>
                ) : (
                  // Completed state via natural completion flow - show completion message and lock the input
                  <div className="completed-section">
                    <div className="completion-indicator">
                      <span className="checkmark">✅</span>
                      <p className="completed-text">Workshop complete. Your responses are locked, but you can watch videos and read your answers.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="logo-container">
                <img src={allstarteamsLogo} alt="AllStarTeams" className="allstarteams-logo" />
              </div>
              <div className="celebration-icon">🎉</div>
              <h2 className="modal-title">Congratulations!</h2>
              <p className="modal-subtitle">You have completed the AllStarTeams Individual Workshop</p>
            </div>
            
            <div className="modal-content">
              <p className="modal-description">
                You've discovered your strengths, explored your potential, and captured your key insights. 
                What would you like to do next?
              </p>
              
              <div className="options-grid">
                <button className="option-card" onClick={() => handleModalOption('star-card')}>
                  <div className="option-icon">⭐</div>
                  <h3 className="option-title">Download Your Star Card</h3>
                  <p className="option-description">Get your personalized strengths profile to keep and share</p>
                </button>
                
                <button className="option-card" onClick={() => handleModalOption('holistic-report')}>
                  <div className="option-icon">📊</div>
                  <h3 className="option-title">See Your Holistic Report</h3>
                  <p className="option-description">View your complete workshop results and insights</p>
                </button>
                
                <button className="option-card" onClick={() => handleModalOption('growth-plan')}>
                  <div className="option-icon">📈</div>
                  <h3 className="option-title">Create a Growth Plan</h3>
                  <p className="option-description">Explore our quarterly growth planning feature</p>
                </button>
                
                <button className="option-card" onClick={() => handleModalOption('team-workshop')}>
                  <div className="option-icon">👥</div>
                  <h3 className="option-title">Prepare for Team Workshop</h3>
                  <p className="option-description">Get ready to collaborate with your team</p>
                </button>
              </div>
              
              <div className="modal-footer">
                {!isStepCompleted && isModalCountingDown && (
                  <p className="auto-proceed-text">
                    Continuing to your Star Card in {modalCountdown} seconds...
                  </p>
                )}
                
                <button className="close-button" onClick={closeModal}>
                  {isStepCompleted ? "Close" : "I'll decide later"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .final-reflection-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .content-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* Top Section: Ladder + Explanation Side by Side */
        .ladder-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
          background: #f8f9fa;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .ladder-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .ladder-image {
          width: 100%;
          max-width: 300px;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease;
        }

        .ladder-image:hover {
          transform: translateY(-4px);
        }

        .explanation-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-left: 20px;
        }

        .explanation-title {
          color: #2c3e50;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 24px;
          line-height: 1.3;
        }

        .explanation-item {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .explanation-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .item-title {
          color: #34495e;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .item-text {
          color: #5d6d7e;
          line-height: 1.7;
          font-size: 1rem;
        }

        /* Bottom Section: Reflection */
        .reflection-section {
          background: #fefcf7;
          border-radius: 16px;
          padding: 40px;
          border-left: 4px solid #f1c40f;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .reflection-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-with-demo {
          position: relative;
        }

        .header-content {
          text-align: center;
        }

        .demo-button {
          position: absolute;
          top: 0;
          right: 0;
          background: #ffffff;
          border: 2px solid #e8f4fd;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #3498db;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .demo-button:hover {
          background: #f8fbff;
          border-color: #3498db;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.15);
        }

        .demo-icon {
          width: 14px;
          height: 14px;
        }

        .demo-button-inline {
          background: #ffffff;
          border: 2px solid #e8f4fd;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #3498db;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .demo-button-inline:hover {
          background: #f8fbff;
          border-color: #3498db;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.15);
        }

        .section-title {
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .intro-text {
          color: #5d6d7e;
          line-height: 1.7;
          font-size: 1.1rem;
          margin-bottom: 16px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .input-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .textarea-wrapper {
          position: relative;
        }

        .save-status {
          position: absolute;
          top: 8px;
          right: 12px;
          pointer-events: none;
        }

        .status {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .status.saving {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status.saved {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status.error {
          background: #ffebee;
          color: #c62828;
        }

        .insight-input {
          width: 100%;
          min-height: 140px;
          padding: 24px;
          border: 2px solid #e8f4fd;
          border-radius: 12px;
          font-size: 16px;
          line-height: 1.6;
          resize: vertical;
          font-family: inherit;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 24px;
        }

        .insight-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
        }

        .insight-input::placeholder {
          color: #95a5a6;
          font-style: italic;
        }

        .insight-input.readonly {
          background: #f8f9fa;
          border-color: #dee2e6;
          cursor: default;
          color: #495057;
        }

        .action-section {
          text-align: center;
        }

        .completed-section {
          text-align: center;
        }

        .completion-indicator {
          margin-bottom: 16px;
        }

        .checkmark {
          font-size: 1.5rem;
          margin-right: 8px;
        }

        .completed-text {
          color: #28a745;
          font-weight: 600;
          font-size: 1.1rem;
          margin: 0;
        }

        .countdown-text {
          color: #6c757d;
          font-style: italic;
          font-size: 1rem;
          margin: 12px 0;
        }

        .continue-button {
          padding: 18px 48px;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
          text-transform: none;
        }

        .continue-button.enabled {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .continue-button.enabled:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }

        .continue-button.disabled {
          background: #ecf0f1;
          color: #bdc3c7;
          cursor: not-allowed;
        }

        .helper-text {
          color: #7f8c8d;
          font-size: 1rem;
          font-style: italic;
          margin-top: 8px;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-container {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-header {
          text-align: center;
          padding: 40px 40px 20px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px 20px 0 0;
        }

        .logo-container {
          margin-bottom: 20px;
        }

        .allstarteams-logo {
          height: 40px;
          width: auto;
        }

        .celebration-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .modal-title {
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          color: #5d6d7e;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .modal-content {
          padding: 30px 40px 40px;
        }

        .modal-description {
          color: #5d6d7e;
          font-size: 1.1rem;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 32px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }

        .option-card {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: inherit;
        }

        .option-card:hover {
          border-color: #3498db;
          background: #f8fbff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
        }

        .option-icon {
          font-size: 2rem;
          margin-bottom: 12px;
        }

        .option-title {
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .option-description {
          color: #5d6d7e;
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 0;
        }

        .modal-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .auto-proceed-text {
          color: #6c757d;
          font-size: 0.9rem;
          font-style: italic;
          margin-bottom: 12px;
          text-align: center;
        }

        .close-button {
          background: transparent;
          border: none;
          color: #7f8c8d;
          font-size: 1rem;
          cursor: pointer;
          padding: 12px 24px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f8f9fa;
          color: #5d6d7e;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .final-reflection-container {
            padding: 20px 16px;
          }

          .ladder-section {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 30px;
          }

          .explanation-content {
            padding-left: 0;
          }

          .reflection-section {
            padding: 30px;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .explanation-title {
            font-size: 1.5rem;
          }

          .modal-content {
            padding: 20px 24px 30px;
          }

          .modal-header {
            padding: 30px 24px 15px;
          }

          .options-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .modal-title {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 480px) {
          .ladder-section {
            padding: 20px;
          }

          .reflection-section {
            padding: 24px;
          }

          .insight-input {
            padding: 20px;
          }

          .continue-button {
            padding: 16px 32px;
            font-size: 1.1rem;
          }
        }
      `}</style>

      {/* Beta Tester Workshop End Modal */}
      <BetaFinalReflectionModal
        isOpen={showBetaEndModal}
        onClose={() => setShowBetaEndModal(false)}
      />
    </>
  );
}
