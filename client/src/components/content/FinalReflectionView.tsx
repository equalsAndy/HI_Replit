
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import ladderImage from '@assets/journeyladder_1749683540778.png';

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

  // Fetch existing final reflection data
  const { data: existingData } = useQuery({
    queryKey: ['/api/workshop-data/final-reflection'],
    staleTime: 30000,
  });

  useEffect(() => {
    if (existingData && existingData.success && existingData.data && existingData.data.futureLetterText) {
      setInsight(String(existingData.data.futureLetterText));
    }
  }, [existingData]);

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
    
    // Auto-save after user stops typing
    const saveData = { futureLetterText: value };
    saveMutation.mutate(saveData);
  };

  const handleNext = () => {
    if (insight.trim().length >= 10) {
      markStepCompleted('4-5');
      setCurrentContent('your-star-card');
    }
  };

  const isNextEnabled = insight.trim().length >= 10;

  return (
    <div className="final-reflection-container">
      <div className="content-grid">
        {/* Left Column - Ladder & Explanation */}
        <div className="left-column">
          <div className="ladder-container">
            <img 
              src={ladderImage} 
              alt="Your personal journey ladder showing each step of growth"
              className="ladder-image"
            />
          </div>

          {/* Explanatory Content - Next to ladder */}
          <div className="explanation-section">
            <h3 className="explanation-title">Your Journey Ladder</h3>
            
            <div className="explanation-grid">
              <div className="explanation-item">
                <h4 className="item-title">Each Step Built on the Last</h4>
                <p className="item-text">
                  Your journey wasn't random steps—it was deliberate progression, deepening your self-awareness at each stage.
                </p>
              </div>
              
              <div className="explanation-item">
                <h4 className="item-title">You Already Had the Strength</h4>
                <p className="item-text">
                  This wasn't about adding new capabilities. It was about recognizing and developing what was already within you.
                </p>
              </div>
              
              <div className="explanation-item">
                <h4 className="item-title">Ready for Team Impact</h4>
                <p className="item-text">
                  Your self-knowledge becomes your contribution. You're now prepared to bring clarity and imagination to team collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reflection & Action */}
        <div className="right-column">
          {/* Main Reflection Section */}
          <div className="reflection-section">
            <h2 className="section-title">Capture Your Key Insight</h2>
            <div className="section-content">
              <p className="intro-text">
                You've completed a powerful personal discovery—from identifying your core strengths to envisioning your future potential.
              </p>
              <p className="intro-text">
                Before moving forward, take a moment to crystallize one key insight or intention that resonates most strongly. This will become your foundation for the team collaboration ahead.
              </p>
              
              <div className="input-container">
                <label className="input-label">What's the one insight you want to carry forward?</label>
                <textarea
                  className="insight-input"
                  placeholder="The most important thing I discovered about myself is..."
                  value={insight}
                  onChange={(e) => handleInsightChange(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <div className="character-count">
                  {insight.length}/1000 characters
                </div>
              </div>
            </div>
          </div>
          
          <div className="action-section">
            <button
              className={`continue-button ${isNextEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleNext}
              disabled={!isNextEnabled}
            >
              Complete Your Journey
            </button>
            
            {!isNextEnabled && (
              <p className="helper-text">
                Share your insight to complete the workshop
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .final-reflection-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* Left Column Styles */
        .left-column {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .ladder-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          text-align: center;
        }

        .ladder-image {
          width: 65%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transition: transform 0.3s ease;
        }

        .ladder-image:hover {
          transform: translateY(-6px) scale(1.02);
        }

        /* Explanation Section */
        .explanation-section {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
        }

        .explanation-section:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .explanation-title {
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .explanation-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .explanation-item {
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
          transition: transform 0.2s ease;
        }

        .explanation-item:hover {
          transform: translateX(4px);
        }

        .explanation-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-title {
          color: #34495e;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .item-text {
          color: #5d6d7e;
          line-height: 1.6;
          margin: 0;
        }

        /* Right Column Styles */
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .reflection-section {
          background: #fefcf7;
          border-radius: 16px;
          padding: 32px;
          border-left: 4px solid #f1c40f;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: box-shadow 0.3s ease;
        }

        .reflection-section:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          color: #2c3e50;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .section-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .intro-text {
          color: #5d6d7e;
          line-height: 1.7;
          font-size: 1rem;
          margin: 0;
        }

        .input-container {
          margin-top: 8px;
        }

        .input-label {
          display: block;
          color: #34495e;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 12px;
        }

        .insight-input {
          width: 100%;
          min-height: 120px;
          padding: 20px;
          border: 2px solid #e8f4fd;
          border-radius: 12px;
          font-size: 16px;
          line-height: 1.6;
          resize: vertical;
          font-family: inherit;
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .insight-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.1);
          transform: translateY(-2px);
        }

        .insight-input::placeholder {
          color: #95a5a6;
          font-style: italic;
        }

        .character-count {
          text-align: right;
          color: #95a5a6;
          font-size: 0.875rem;
          margin-top: 8px;
        }

        /* Action Section */
        .action-section {
          text-align: center;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .continue-button {
          width: 100%;
          padding: 18px 32px;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: none;
          position: relative;
          overflow: hidden;
        }

        .continue-button.enabled {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
        }

        .continue-button.enabled:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(52, 152, 219, 0.4);
        }

        .continue-button.enabled:active {
          transform: translateY(-1px);
        }

        .continue-button.disabled {
          background: #ecf0f1;
          color: #bdc3c7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .helper-text {
          color: #95a5a6;
          font-size: 0.9rem;
          margin-top: 12px;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 968px) {
          .content-grid {
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .final-reflection-container {
            padding: 20px 16px;
          }

          .reflection-section,
          .explanation-section {
            padding: 24px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .ladder-image {
            width: 80%;
          }
        }

        @media (max-width: 480px) {
          .reflection-section,
          .explanation-section {
            padding: 20px;
          }

          .section-title {
            font-size: 1.25rem;
          }

          .insight-input {
            padding: 16px;
            min-height: 100px;
          }

          .continue-button {
            padding: 16px 24px;
          }

          .ladder-image {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
