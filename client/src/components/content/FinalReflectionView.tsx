import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ladderImage from '@assets/journeyladder_1749683540778.png';
import allstarteamsLogo from '@assets/all-star-teams-logo-250px.png';

interface FinalReflectionViewProps {
  onNext: (targetContent?: string) => void;
  markStepCompleted: (stepId: string) => void;
  isStepCompleted?: boolean;
  currentContent: string;
  setCurrentContent: (content: string) => void;
}

interface FinalReflectionData {
  futureLetterText: string;
}

export default function FinalReflectionView({ 
  currentContent, 
  onNext,
  markStepCompleted, 
  isStepCompleted,
  setCurrentContent 
}: FinalReflectionViewProps) {
  const queryClient = useQueryClient();
  const [insight, setInsight] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Return visit auto-modal countdown (5 seconds)
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Modal auto-close countdown (20 seconds)
  const [modalCountdown, setModalCountdown] = useState(20);
  const [isModalCountingDown, setIsModalCountingDown] = useState(false);

  // Fetch existing final reflection data
  const { data: existingData } = useQuery({
    queryKey: ['/api/workshop-data/final-reflection'],
    staleTime: 30000,
  });

  // Check if step is completed - using simple text length check for now
  // TODO: Replace with actual progression system check
  const isStepCompletedCheck = existingData?.data?.futureLetterText && existingData.data.futureLetterText.length >= 10;
  const savedInsight = existingData?.data?.futureLetterText || '';

  useEffect(() => {
    if (existingData && existingData.success && existingData.data && existingData.data.futureLetterText) {
      setInsight(String(existingData.data.futureLetterText));
    }
  }, [existingData]);

  // Auto-show modal for completed steps with 5-second countdown
  useEffect(() => {
    if (isStepCompletedCheck && savedInsight) {
      setIsCountingDown(true);
      setCountdown(5);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            setShowModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStepCompletedCheck, savedInsight]);

  // Auto-close modal after 20 seconds for first-time completion
  useEffect(() => {
    if (showModal && !isStepCompletedCheck) { // Only for first-time completion
      setModalCountdown(20);
      setIsModalCountingDown(true);

      const timer = setInterval(() => {
        setModalCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsModalCountingDown(false);
            setShowModal(false);
            onNext('download-star-card'); // Navigate to star card
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
  }, [showModal, isStepCompletedCheck, onNext]);

  // Save final reflection data
  const saveMutation = useMutation({
    mutationFn: (data: FinalReflectionData) => apiRequest('/api/workshop-data/final-reflection', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/final-reflection'] });
    },
  });

  const handleInsightChange = (value: string) => {
    setInsight(value);

    // Auto-save after user stops typing (only if not completed)
    if (!isStepCompletedCheck) {
      const saveData = { futureLetterText: value };
      saveMutation.mutate(saveData);
    }
  };

  const handleComplete = () => {
    if (insight.trim().length >= 10) {
      markStepCompleted('4-5');
      setShowModal(true);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const handleModalOption = (option: string) => {
    setIsModalCountingDown(false); // Stop countdown
    setShowModal(false);

    // Navigate based on option
    switch(option) {
      case 'star-card':
        // Navigate to Download Star Card step (5-1)
        onNext('download-star-card');
        break;
      case 'holistic-report':
        // Navigate to Holistic Report step (5-2)
        onNext('holistic-report');
        break;
      case 'growth-plan':
        // Navigate to Growth Plan step (5-3)
        onNext('growth-plan');
        break;
      case 'team-workshop':
        // Navigate to Team Workshop step (5-4)
        onNext('team-workshop');
        break;
    }
  };

  const closeModal = () => {
    setIsModalCountingDown(false); // Stop countdown
    setShowModal(false);

    // Only navigate for first-time completion
    if (!isStepCompletedCheck) {
      onNext('download-star-card'); // Navigate to star card
    }
    // Returning users: just close modal, stay on page
  };

  return (
    <>
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
              <textarea
                className={`insight-input ${isStepCompletedCheck ? 'readonly' : ''}`}
                value={isStepCompletedCheck ? savedInsight : insight}
                onChange={isStepCompletedCheck ? undefined : (e) => handleInsightChange(e.target.value)}
                disabled={isStepCompletedCheck}
                readOnly={isStepCompletedCheck}
                placeholder={isStepCompletedCheck ? '' : "What I want to carry forward is..."}
                rows={4}
              />

              <div className="action-section">
                {!isStepCompletedCheck ? (
                  // Original completion flow for first-time users
                  <>
                    <button
                      className={`continue-button ${insight.length >= 10 ? 'enabled' : 'disabled'}`}
                      onClick={handleComplete}
                      disabled={insight.length < 10}
                    >
                      Complete Your Journey
                    </button>

                    {insight.length < 10 && (
                      <p className="helper-text">
                        Share your insight to complete the workshop
                      </p>
                    )}
                  </>
                ) : (
                  // Completed state with countdown
                  <div className="completed-section">
                    <div className="completion-indicator">
                      <span className="checkmark">✅</span>
                      <p className="completed-text">Workshop completed!</p>
                    </div>

                    {isCountingDown ? (
                      <p className="countdown-text">
                        Options menu opens in {countdown} second{countdown !== 1 ? 's' : ''}...
                      </p>
                    ) : (
                      <button 
                        className="continue-button enabled" 
                        onClick={() => setShowModal(true)}
                      >
                        View Options
                      </button>
                    )}
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
                  <h3 className="option-title">See Our Growth Plan</h3>
                  <p className="option-description">Explore our quarterly growth planning feature</p>
                </button>

                <button className="option-card" onClick={() => handleModalOption('team-workshop')}>
                  <div className="option-icon">👥</div>
                  <h3 className="option-title">Prepare for Team Workshop</h3>
                  <p className="option-description">Get ready to collaborate with your team</p>
                </button>
              </div>

              <div className="modal-footer">
                {!isStepCompletedCheck && isModalCountingDown && (
                  <p className="auto-proceed-text">
                    Continuing to your Star Card in {modalCountdown} seconds...
                  </p>
                )}

                <button className="close-button" onClick={closeModal}>
                  {isStepCompletedCheck ? "Close" : "I'll decide later"}
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
    </>
  );
}