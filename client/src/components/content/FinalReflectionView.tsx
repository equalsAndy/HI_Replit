
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCurrentUser } from '@/hooks/use-current-user';
import ladderImage from '@assets/journeyladder_1749683540778.png';
import { ValidationMessage } from '@/components/ui/validation-message';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';
import { BetaFinalReflectionModal } from '@/components/beta-testing/BetaFinalReflectionModal';
import { LockedInputWrapper } from '@/components/ui/LockedInputWrapper';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

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
  markStepCompleted,
  setCurrentContent
}: FinalReflectionViewProps) {
  const queryClient = useQueryClient();
  const [insight, setInsight] = useState('');
  const [showBetaEndModal, setShowBetaEndModal] = useState(false);
  const { data: user } = useCurrentUser();

  // Application context for proper app type detection
  const { currentApp } = useApplication();
  const appType = currentApp === 'allstarteams' ? 'ast' : 'ia';

  // Workshop status
  const { astCompleted, iaCompleted } = useWorkshopStatus();
  const completed = appType === 'ast' ? astCompleted : iaCompleted;
  
  
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
    } else {
      // Set default prefix text if no existing data
      setInsight('The intention I want to carry forward is ');
    }
  }, [existingData]);

  // Modal removed - users navigate directly to workshop recap

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


  const handleInsightChange = (value: string) => {
    setInsight(value);
    // Clear validation error when user starts typing
    const prefix = "The intention I want to carry forward is ";
    const contentLength = value.startsWith(prefix) ? value.slice(prefix.length).trim().length : value.trim().length;
    if (validationError && contentLength >= 25) {
      setValidationError('');
    }
    // Removed auto-save - data will only save when user clicks "Complete Your Journey"
  };

  const handleComplete = async () => {
    // Validate input before proceeding - check content after prefix
    const prefix = 'The intention I want to carry forward is ';
    const contentAfterPrefix = insight.startsWith(prefix) ? insight.slice(prefix.length).trim() : insight.trim();

    if (contentAfterPrefix.length < 25) {
      setValidationError('Please write at least 25 characters describing your intention');
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

      // Auto-scroll to continue button after a brief delay
      setTimeout(() => {
        const continueButton = document.querySelector('[data-continue-button="true"]');
        if (continueButton) {
          continueButton.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 1000); // Increased delay to ensure DOM updates

      // Navigate to workshop recap (step 3-4) for all users
      setCurrentContent('workshop-recap');
      
    } catch (error) {
      console.error('Failed to save final reflection:', error);
      setSaveStatus('error');
    }
  };

  // Prevent body scroll when beta modal is open
  useEffect(() => {
    if (showBetaEndModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showBetaEndModal]);

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


  return (
    <>
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="blue"
      />

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
            
          </div>
          
          {/* Bottom Section: Reflection */}
          <div className="reflection-section">
            <div className="reflection-header">
              <h2 className="section-title">Your Final Reflection</h2>
              <div className="intention-card">
                <h3 className="intention-card-title">Capture an Intention</h3>
                <p className="intention-card-text">
                  End this step by choosing one clear intention to carry forward. This becomes the bridge between your vision and your next steps.
                </p>
                <ul className="intention-card-list">
                  <li>Write one sentence that captures your most important takeaway</li>
                  <li>Begin with: <strong>"The intention I want to carry forward is…"</strong></li>
                  <li>Keep it short, specific, and meaningful to you</li>
                </ul>
              </div>
            </div>
            
            <div className="input-section">
              <div className="textarea-wrapper">
                <LockedInputWrapper stepId="3-4">
                  <textarea
                    className={`insight-input ${validationError ? 'border-red-300 focus:border-red-500' : ''}`}
                    value={insight}
                    onChange={(e) => handleInsightChange(e.target.value)}
                    placeholder=""
                    rows={4}
                  />
                </LockedInputWrapper>

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
                      {/* Navigation instructions */}
                      <div className="completion-notice mb-3">
                        <p className="text-sm text-gray-600 text-center">
                          Head to the recap and click Finish Workshop to access your Starcard and reports
                        </p>
                      </div>
                      
                      <button
                        className={`continue-button ${(() => {
                          const prefix = 'The intention I want to carry forward is ';
                          const contentAfterPrefix = insight.startsWith(prefix) ? insight.slice(prefix.length).trim() : insight.trim();
                          return contentAfterPrefix.length >= 25 ? 'enabled' : 'disabled';
                        })()}`}
                        onClick={handleComplete}
                        disabled={(() => {
                          const prefix = 'The intention I want to carry forward is ';
                          const contentAfterPrefix = insight.startsWith(prefix) ? insight.slice(prefix.length).trim() : insight.trim();
                          return contentAfterPrefix.length < 25;
                        })()}
                        data-continue-button="true"
                      >
                        Continue to Workshop Recap
                      </button>
                    </div>
                    
                  </>
                ) : (
                  // Workshop already completed - show navigation to recap
                  <div className="completed-section">
                    <div className="completion-indicator">
                      <span className="checkmark">✅</span>
                      <p className="completed-text">Workshop Complete</p>
                    </div>

                    <button
                      onClick={() => setCurrentContent('workshop-recap')}
                      className="continue-button enabled"
                    >
                      Continue to Workshop Recap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


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
          display: none;
        }

        .ladder-container {
          display: none;
        }

        .ladder-image {
          display: none;
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

        .intention-card {
          background: #f8f3ff;
          border: 2px solid #d8b4fe;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
          text-align: left;
        }

        .intention-card-title {
          color: #7c3aed;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .intention-card-text {
          color: #6b21a8;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .intention-card-list {
          color: #7c3aed;
          font-size: 1rem;
          line-height: 1.8;
          margin-left: 20px;
          list-style-type: disc;
        }

        .intention-card-list li {
          margin-bottom: 8px;
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

      {/* Beta Tester Workshop End Modal - COMMENTED OUT */}
      {/* <BetaFinalReflectionModal
        isOpen={showBetaEndModal}
        onClose={() => setShowBetaEndModal(false)}
      /> */}
    </>
  );
}
