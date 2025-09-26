import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface Mod2RecapViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function Mod2RecapView({ 
  navigate, 
  markStepCompleted, 
  setCurrentContent 
}: Mod2RecapViewProps) {
  
  // Step completion should only happen when user clicks Next button
  // Removed auto-completion on mount to prevent immediate progression

  const handleNext = () => {
    // Mark the current step as completed first
    markStepCompleted('2-4');
    
    // Auto-scroll to continue button after a brief delay
    setTimeout(() => {
      const continueButton = document.querySelector('[data-continue-button="true"]');
      if (continueButton) {
        continueButton.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 1000); // Delay to ensure DOM updates
    
    // Then navigate to the next content
    setCurrentContent('wellbeing-ladder');
  };

  return (
    <div className="mod2-recap-container">
      <div className="page-container">
        <div className="header-section">
          <h1 className="main-title">Module 2 Recap</h1>
          <p className="subtitle">Reflecting on Your Strengths and Flow Journey</p>
        </div>
        
        <div className="content-section">
          <div className="recap-content">
            <div className="achievement-card">
              <div className="achievement-icon">🌟</div>
              <h2 className="achievement-title">What You've Accomplished</h2>
              <p className="achievement-description">
                Congratulations! You've completed Module 2 and made significant progress in understanding yourself better.
              </p>
            </div>

            <div className="recap-grid">
              <div className="recap-item">
                <div className="recap-icon">💪</div>
                <h3 className="recap-title">Discovered Your Strengths</h3>
                <p className="recap-description">
                  You've identified your core strengths across imagination, thinking, planning, feeling, and acting.
                </p>
              </div>

              <div className="recap-item">
                <div className="recap-icon">🌊</div>
                <h3 className="recap-title">Found Your Flow</h3>
                <p className="recap-description">
                  You've explored when and how you perform at your best, discovering your unique flow patterns.
                </p>
              </div>

              <div className="recap-item">
                <div className="recap-icon">🎯</div>
                <h3 className="recap-title">Created Your Star Card</h3>
                <p className="recap-description">
                  You've built a personalized profile that captures your strengths and flow qualities.
                </p>
              </div>

              <div className="recap-item">
                <div className="recap-icon">💭</div>
                <h3 className="recap-title">Reflected on Growth</h3>
                <p className="recap-description">
                  You've taken time to reflect on your insights and how they apply to your life and work.
                </p>
              </div>
            </div>

            <div className="next-module-preview">
              <h2 className="preview-title">What's Next: Module 3</h2>
              <p className="preview-description">
                Now that you understand your strengths and flow, it's time to visualize your potential. In Module 3, you'll explore:
              </p>
              <ul className="preview-list">
                <li>Your personal well-being and growth trajectory</li>
                <li>Rounding out your complete profile</li>
                <li>Creating a vision for your future self</li>
                <li>Capturing your key reflections and intentions</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
            data-continue-button="true"
          >
            Continue to Well-Being Ladder
          </Button>
        </div>
      </div>

      <style jsx>{`
        .mod2-recap-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 20px;
        }

        .page-container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .header-section {
          text-align: center;
          padding: 60px 40px 40px;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
        }

        .main-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .subtitle {
          font-size: 1.3rem;
          font-weight: 500;
          margin: 0;
          opacity: 0.9;
        }

        .content-section {
          padding: 50px 40px;
        }

        .achievement-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          margin-bottom: 40px;
          border: 2px solid #3498db;
        }

        .achievement-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .achievement-title {
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .achievement-description {
          color: #5d6d7e;
          font-size: 1.2rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .recap-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 50px;
        }

        .recap-item {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .recap-item:hover {
          border-color: #3498db;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.15);
        }

        .recap-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .recap-title {
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .recap-description {
          color: #5d6d7e;
          font-size: 1rem;
          line-height: 1.5;
        }

        .next-module-preview {
          background: linear-gradient(135deg, #e8f6ff 0%, #d1ecff 100%);
          border-radius: 16px;
          padding: 40px;
          border: 2px solid #3498db;
        }

        .preview-title {
          color: #2980b9;
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        .preview-description {
          color: #34495e;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 20px;
          text-align: center;
        }

        .preview-list {
          color: #34495e;
          font-size: 1rem;
          line-height: 1.6;
          list-style: none;
          padding: 0;
          max-width: 600px;
          margin: 0 auto;
        }

        .preview-list li {
          position: relative;
          padding-left: 28px;
          margin-bottom: 12px;
        }

        .preview-list li::before {
          content: "✨";
          position: absolute;
          left: 0;
          top: 0;
        }

        .navigation-section {
          padding: 30px 40px 50px;
          text-align: center;
          background: #f8f9fa;
        }

        .next-button {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }

        .next-button:hover {
          background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .mod2-recap-container {
            padding: 10px;
          }

          .header-section {
            padding: 40px 30px 30px;
          }

          .content-section {
            padding: 30px 30px;
          }

          .main-title {
            font-size: 2.2rem;
          }

          .subtitle {
            font-size: 1.1rem;
          }

          .recap-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .achievement-card {
            padding: 30px 20px;
          }

          .next-module-preview {
            padding: 30px 20px;
          }
        }

        @media (max-width: 480px) {
          .header-section {
            padding: 30px 20px 20px;
          }

          .content-section {
            padding: 25px 20px;
          }

          .navigation-section {
            padding: 25px 20px 40px;
          }

          .main-title {
            font-size: 1.9rem;
          }

          .recap-item {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}