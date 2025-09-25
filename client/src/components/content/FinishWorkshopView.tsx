import React, { useEffect } from 'react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import allstarteamsLogo from '@assets/all-star-teams-logo-250px.png';

interface FinishWorkshopViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function FinishWorkshopView({ 
  navigate, 
  markStepCompleted, 
  setCurrentContent 
}: FinishWorkshopViewProps) {
  
  const { astCompleted } = useWorkshopStatus();

  // Mark step 3-4 as completed when component mounts (workshop recap step)
  useEffect(() => {
    markStepCompleted('3-4');
  }, [markStepCompleted]);

  const handleNavigateToOption = (option: string) => {
    // Check if the option is accessible before navigating
    if (!isOptionAccessible(option)) {
      return; // Do nothing if option is locked
    }

    switch(option) {
      case 'star-card':
        setCurrentContent('download-star-card');
        break;
      case 'holistic-report':
        setCurrentContent('holistic-report');
        break;
      case 'growth-plan':
        setCurrentContent('growth-plan');
        break;
      case 'team-workshop':
        setCurrentContent('team-workshop-prep');
        break;
      default:
        setCurrentContent('download-star-card');
        break;
    }
  };

  const isOptionAccessible = (option: string): boolean => {
    switch(option) {
      case 'star-card':
        // Star Card should be available when AST assessment is completed
        return true; // This is generally available after module 2
      case 'holistic-report':
      case 'growth-plan':
      case 'team-workshop':
        // These features are only available after workshop completion
        return astCompleted;
      default:
        return false;
    }
  };

  return (
    <div className="finish-workshop-container">
      {/* Workshop Completion Banner */}
      {astCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto mt-4">
          <div className="flex items-center gap-3">
            <div className="text-green-600">🎉</div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Congratulations! Workshop complete. All steps are now unlocked for review.
              </h3>
            </div>
            <div className="text-green-600">
              🔓
            </div>
          </div>
        </div>
      )}

      <div className="page-container">
        <div className="header-section">
          <div className="logo-container">
            <img src={allstarteamsLogo} alt="AllStarTeams" className="logo" />
          </div>
          <div className="celebration-icon">🎉</div>
          <h1 className="main-title">Workshop Recap</h1>
          <p className="subtitle">Reflecting on Your AllStarTeams Journey</p>
        </div>
        
        <div className="content-section">
          <div className="recap-content">
            <h2 className="recap-title">Your Journey Summary</h2>
            <p className="recap-description">
              Throughout this workshop, you've taken a meaningful journey of self-discovery:
            </p>
            
            <div className="journey-highlights">
              <div className="highlight-item">
                <div className="highlight-icon">💪</div>
                <div className="highlight-content">
                  <h3>Discovered Your Strengths</h3>
                  <p>You identified your top talents and learned how they create unique value</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <div className="highlight-icon">🌊</div>
                <div className="highlight-content">
                  <h3>Found Your Flow</h3>
                  <p>You explored the patterns that help you perform at your best</p>
                </div>
              </div>
              
              <div className="highlight-item">
                <div className="highlight-icon">🎯</div>
                <div className="highlight-content">
                  <h3>Visualized Your Potential</h3>
                  <p>You envisioned your future self and captured key insights for growth</p>
                </div>
              </div>
            </div>
            
            <div className="completion-message">
              <p>🎉 <strong>Congratulations!</strong> You've completed the AllStarTeams Individual Workshop and are now ready to take your insights forward.</p>
            </div>
          </div>
          
          <div className="next-steps-section">
            <h2 className="next-steps-title">
              <span className="next-steps-arrow">➔</span> Your Next Steps
            </h2>
            <p className="next-steps-description">
              Now that you've completed your individual journey, here are some ways to continue growing:
            </p>
          </div>
          
          <div className="options-grid">
            <button
              className={`option-card ${isOptionAccessible('star-card') ? '' : 'option-card-locked'}`}
              onClick={() => handleNavigateToOption('star-card')}
              disabled={!isOptionAccessible('star-card')}
            >
              <div className="option-icon">⭐</div>
              <h3 className="option-title">Download Your Star Card</h3>
              <p className="option-description">Get your personalized strengths profile to keep and share</p>
              {!isOptionAccessible('star-card') && <div className="locked-indicator">🔒 Complete assessment first</div>}
            </button>

            <button
              className={`option-card ${isOptionAccessible('holistic-report') ? '' : 'option-card-locked'}`}
              onClick={() => handleNavigateToOption('holistic-report')}
              disabled={!isOptionAccessible('holistic-report')}
            >
              <div className="option-icon">📊</div>
              <h3 className="option-title">Generate Holistic Report</h3>
              <p className="option-description">Create a comprehensive report of all your workshop insights and recommendations</p>
              {!isOptionAccessible('holistic-report') && <div className="locked-indicator">🔒 Complete workshop first</div>}
            </button>

            <button
              className={`option-card ${isOptionAccessible('growth-plan') ? '' : 'option-card-locked'}`}
              onClick={() => handleNavigateToOption('growth-plan')}
              disabled={!isOptionAccessible('growth-plan')}
            >
              <div className="option-icon">📈</div>
              <h3 className="option-title">Create a Growth Plan</h3>
              <p className="option-description">Explore our quarterly growth planning feature</p>
              {!isOptionAccessible('growth-plan') && <div className="locked-indicator">🔒 Complete workshop first</div>}
            </button>

            <button
              className={`option-card ${isOptionAccessible('team-workshop') ? '' : 'option-card-locked'}`}
              onClick={() => handleNavigateToOption('team-workshop')}
              disabled={!isOptionAccessible('team-workshop')}
            >
              <div className="option-icon">👥</div>
              <h3 className="option-title">Prepare for Team Workshop</h3>
              <p className="option-description">Access materials and guidance for participating in the team collaboration phase</p>
              {!isOptionAccessible('team-workshop') && <div className="locked-indicator">🔒 Complete workshop first</div>}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .finish-workshop-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
        }

        .page-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .header-section {
          text-align: center;
          padding: 60px 40px 40px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .logo-container {
          margin-bottom: 20px;
        }

        .logo {
          height: 50px;
          width: auto;
        }

        .celebration-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .main-title {
          color: #2c3e50;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .subtitle {
          color: #5d6d7e;
          font-size: 1.3rem;
          font-weight: 500;
          margin: 0;
        }

        .content-section {
          padding: 40px 50px 60px;
        }

        .recap-content {
          margin-bottom: 40px;
        }

        .recap-title {
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 16px;
          text-align: center;
        }

        .recap-description {
          color: #5d6d7e;
          font-size: 1.1rem;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .journey-highlights {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border-left: 4px solid #3498db;
        }

        .highlight-icon {
          font-size: 2rem;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .highlight-content h3 {
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .highlight-content p {
          color: #5d6d7e;
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
        }

        .completion-message {
          background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
          border: 1px solid #c8e6c9;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
        }

        .completion-message p {
          color: #2e7d32;
          font-size: 1.1rem;
          font-weight: 500;
          margin: 0;
        }

        .next-steps-section {
          margin-bottom: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .next-steps-title {
          color: #2c3e50;
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 12px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .next-steps-arrow {
          color: #3498db;
          font-size: 1.4rem;
        }

        .next-steps-description {
          color: #5d6d7e;
          font-size: 1.1rem;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 24px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .description {
          color: #5d6d7e;
          font-size: 1.2rem;
          line-height: 1.6;
          text-align: center;
          margin-bottom: 50px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .option-card {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }

        .option-card:hover:not(.option-card-locked) {
          border-color: #3498db;
          background: #f8fbff;
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(52, 152, 219, 0.2);
        }

        .option-card-locked {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .option-card-locked:hover {
          transform: none;
          box-shadow: none;
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .locked-indicator {
          margin-top: 12px;
          padding: 8px 12px;
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          color: #92400e;
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
        }

        .option-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .option-title {
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .option-description {
          color: #5d6d7e;
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .finish-workshop-container {
            padding: 10px;
          }

          .header-section {
            padding: 40px 30px 30px;
          }

          .content-section {
            padding: 30px 30px 40px;
          }

          .main-title {
            font-size: 2.2rem;
          }

          .subtitle {
            font-size: 1.1rem;
          }

          .options-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .celebration-icon {
            font-size: 3rem;
          }
          
          .journey-highlights {
            gap: 16px;
          }
          
          .highlight-item {
            padding: 16px;
          }
          
          .highlight-icon {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .header-section {
            padding: 30px 20px 20px;
          }

          .content-section {
            padding: 25px 20px 30px;
          }

          .main-title {
            font-size: 1.9rem;
          }

          .option-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}