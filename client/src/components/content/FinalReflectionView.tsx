
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
      <h1 className="page-title">Final Reflection</h1>
      
      <div className="content-grid">
        {/* Left Column - Content & Form */}
        <div className="left-column">
          {/* Main Reflection Section */}
          <div className="reflection-section">
            <h2 className="section-title">Final Reflection: Your Next Step</h2>
            <div className="section-content">
              <p className="intro-text">
                You've just completed a personal discovery journey — from identifying your 
                core strength to envisioning your future self.
              </p>
              <p className="intro-text">
                You've seen how your strengths (especially imagination) operate at their 
                best, and how your well-being shapes your potential. Now, take a moment 
                to name one insight or intention you want to carry forward — as 
                preparation for deeper team practice ahead.
              </p>
              
              <div className="input-container">
                <textarea
                  className="insight-input"
                  placeholder="One insight I'm taking forward is..."
                  value={insight}
                  onChange={(e) => handleInsightChange(e.target.value)}
                  rows={6}
                  maxLength={1000}
                />
                <div className="character-count">
                  {insight.length}/1000 characters
                </div>
              </div>
            </div>
          </div>

          {/* Explanatory Content - Moved from right side */}
          <div className="explanation-section">
            <h3 className="explanation-title">What This Ladder Represents</h3>
            
            <div className="explanation-grid">
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
        </div>

        {/* Right Column - Ladder Visual & Action */}
        <div className="right-column">
          <div className="ladder-container">
            <img 
              src={ladderImage} 
              alt="Journey Ladder showing the progression from Star Self-Assessment through Core Strengths, Flow State, Rounding Out, Visualizing Potential, Ladder of Well-Being, to Future Self"
              className="ladder-image"
            />
          </div>
          
          <div className="action-section">
            <button
              className={`continue-button ${isNextEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleNext}
              disabled={!isNextEnabled}
            >
              Continue to Star Card
            </button>
            
            {!isNextEnabled && (
              <p className="helper-text">
                Please share at least 10 characters to continue
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

        .page-title {
          text-align: center;
          color: #2c3e50;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 40px;
          line-height: 1.2;
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
          margin-bottom: 24px;
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

        .insight-input {
          width: 100%;
          min-height: 150px;
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
          align-items: center;
          gap: 40px;
        }

        .ladder-container {
          width: 100%;
          max-width: 400px;
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

        /* Action Section */
        .action-section {
          text-align: center;
          width: 100%;
          max-width: 300px;
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

          .page-title {
            font-size: 2rem;
            margin-bottom: 30px;
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

          .page-title {
            font-size: 1.75rem;
          }

          .section-title {
            font-size: 1.25rem;
          }

          .insight-input {
            padding: 16px;
            min-height: 120px;
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
