import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getAttributeColor, QUADRANT_COLORS } from '@/components/starcard/starCardConstants';

interface Mod2RecapViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
  starCard?: any;
  flowAttributesData?: any;
}

// Helper function to sort strengths by percentage (descending)
const getSortedStrengths = (starCard: any) => {
  if (!starCard) return [];

  const strengths = [
    { name: 'Thinking', value: starCard.thinking || 0, color: QUADRANT_COLORS.thinking },
    { name: 'Acting', value: starCard.acting || 0, color: QUADRANT_COLORS.acting },
    { name: 'Feeling', value: starCard.feeling || 0, color: QUADRANT_COLORS.feeling },
    { name: 'Planning', value: starCard.planning || 0, color: QUADRANT_COLORS.planning },
  ];

  return strengths.sort((a, b) => b.value - a.value);
};

// Helper function to map flow attributes with colors
const getFlowAttributes = (flowAttributesData: any) => {
  if (!flowAttributesData?.attributes || !Array.isArray(flowAttributesData.attributes)) {
    return [];
  }
  return flowAttributesData.attributes.map((attr: any) => ({
    text: attr.name || attr.text || '',
    color: getAttributeColor(attr.name || attr.text || '')
  }));
};

export default function Mod2RecapView({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  flowAttributesData
}: Mod2RecapViewProps) {

  // Get user data for Star Card image URL
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000,
  });
  const userId = (userData as any)?.user?.id || (userData as any)?.id;

  // Get sorted strengths and flow attributes
  const sortedStrengths = getSortedStrengths(starCard);
  const flowAttributes = getFlowAttributes(flowAttributesData);

  const handleNext = async () => {
    await markStepCompleted('2-4');
    setCurrentContent('wellbeing-ladder');

    setTimeout(() => {
      document.getElementById('content-top')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  return (
    <div className="mod2-recap-container">
      <div className="page-container">
        <div className="header-section">
          <h1 className="main-title">🌟 Module 2 Recap</h1>
        </div>

        <div className="content-section">
          {/* Smaller achievement card */}
          <div className="achievement-card-small">
            <p className="achievement-text">
              🌟 <strong>Congratulations!</strong> You've completed Module 2 and discovered your unique strengths profile.
              Let's review what you've learned about yourself.
            </p>
          </div>

          {/* Two-column layout: Strengths + Star Card */}
          <div className="data-grid">
            {/* Strengths Section */}
            <div className="data-card">
              <h3 className="data-title">💪 Your Core Strengths</h3>
              <div className="strengths-list">
                {sortedStrengths.length > 0 ? (
                  sortedStrengths.map((strength, index) => (
                    <div key={strength.name} className="strength-row">
                      <span className="strength-rank">{index + 1}.</span>
                      <span
                        className="strength-name"
                        style={{ color: strength.color }}
                      >
                        {strength.name}
                      </span>
                      <span className="strength-value">{Math.round(strength.value)}%</span>
                      <div className="strength-bar-container">
                        <div
                          className="strength-bar"
                          style={{
                            width: `${strength.value}%`,
                            backgroundColor: strength.color
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Complete the Star Strengths Assessment to see your results.</p>
                )}
              </div>
            </div>

            {/* Star Card Section */}
            <div className="data-card starcard-card">
              <h3 className="data-title">🎯 Your Star Card</h3>
              <div className="starcard-container">
                {userId ? (
                  <img
                    src={`/api/star-card/${userId}`}
                    alt="Your Star Card"
                    className="starcard-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const fallback = document.getElementById('starcard-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div id="starcard-fallback" className="starcard-fallback" style={{ display: 'none' }}>
                  <p>Star Card image not available yet.</p>
                  <p className="text-sm">Complete the flow exercise to generate your card.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flow Attributes Section */}
          <div className="flow-section">
            <h3 className="data-title">🌊 Your Flow Amplifiers</h3>
            <p className="flow-description">
              These are the qualities that intensify when you're in your flow state:
            </p>
            <div className="flow-attributes">
              {flowAttributes.length > 0 ? (
                flowAttributes.map((attr: { text: string; color: string }, index: number) => (
                  <span
                    key={index}
                    className="flow-tag"
                    style={{
                      backgroundColor: `${attr.color}20`,
                      borderColor: attr.color,
                      color: attr.color
                    }}
                  >
                    {attr.text}
                  </span>
                ))
              ) : (
                <p className="no-data">Complete the Flow Patterns exercise to see your flow amplifiers.</p>
              )}
            </div>
          </div>

          {/* Next Module Preview */}
          <div className="next-module-preview">
            <h2 className="preview-title">What's Next: Module 3 — Visualize Your Potential</h2>
            <p className="preview-description">
              Now that you understand your strengths and flow patterns, it's time to envision where they can take you.
            </p>
            <ul className="preview-list">
              <li>Place yourself on the Well-Being Ladder</li>
              <li>Envision your Future Self</li>
              <li>Capture your key insights</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
            data-continue-button="true"
          >
            ➡️ Continue to Well-Being Ladder
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
          max-width: 950px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .header-section {
          text-align: center;
          padding: 40px 40px 30px;
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .content-section {
          padding: 30px 40px;
        }

        /* Smaller achievement card */
        .achievement-card-small {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 30px;
          border-left: 4px solid #3498db;
        }

        .achievement-text {
          color: #1e3a5f;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0;
        }

        /* Two-column data grid */
        .data-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 30px;
        }

        .data-card {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 24px;
        }

        .data-title {
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e9ecef;
        }

        /* Strengths styling */
        .strengths-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .strength-row {
          display: grid;
          grid-template-columns: 24px 90px 50px 1fr;
          align-items: center;
          gap: 8px;
        }

        .strength-rank {
          color: #7f8c8d;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .strength-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .strength-value {
          color: #2c3e50;
          font-weight: 700;
          font-size: 1rem;
          text-align: right;
        }

        .strength-bar-container {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .strength-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        /* Star Card styling */
        .starcard-card {
          display: flex;
          flex-direction: column;
        }

        .starcard-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 220px;
        }

        .starcard-image {
          width: 154px;
          height: 214px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .starcard-fallback {
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #7f8c8d;
          padding: 20px;
        }

        /* Flow section styling */
        .flow-section {
          background: #ffffff;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }

        .flow-description {
          color: #5d6d7e;
          font-size: 1rem;
          margin-bottom: 16px;
        }

        .flow-attributes {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .flow-tag {
          padding: 8px 16px;
          border-radius: 20px;
          border: 2px solid;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .no-data {
          color: #95a5a6;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }

        /* Next module preview */
        .next-module-preview {
          background: linear-gradient(135deg, #e8f6ff 0%, #d1ecff 100%);
          border-radius: 16px;
          padding: 30px;
          border: 2px solid #3498db;
          margin-bottom: 20px;
        }

        .preview-title {
          color: #2980b9;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 12px;
          text-align: center;
        }

        .preview-description {
          color: #34495e;
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 16px;
          text-align: center;
        }

        .preview-list {
          color: #34495e;
          font-size: 0.95rem;
          line-height: 1.6;
          list-style: none;
          padding: 0;
          max-width: 400px;
          margin: 0 auto;
        }

        .preview-list li {
          position: relative;
          padding-left: 24px;
          margin-bottom: 8px;
        }

        .preview-list li::before {
          content: "✨";
          position: absolute;
          left: 0;
          top: 0;
        }

        .text-center {
          text-align: center;
          padding: 20px 40px 40px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .mod2-recap-container {
            padding: 10px;
          }

          .header-section {
            padding: 30px 20px 20px;
          }

          .main-title {
            font-size: 2rem;
          }

          .content-section {
            padding: 20px;
          }

          .data-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .strength-row {
            grid-template-columns: 20px 80px 45px 1fr;
          }

          .starcard-container {
            min-height: 180px;
          }
        }

        @media (max-width: 480px) {
          .header-section {
            padding: 25px 15px 15px;
          }

          .content-section {
            padding: 15px;
          }

          .main-title {
            font-size: 1.75rem;
          }

          .data-card {
            padding: 16px;
          }

          .strength-row {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .strength-name {
            display: inline;
          }

          .strength-value {
            display: inline;
            text-align: left;
          }

          .strength-bar-container {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  );
}
