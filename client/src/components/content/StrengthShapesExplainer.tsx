import React from 'react';

interface StrengthShapesExplainerProps {
  className?: string;
  userStrengths?: {
    thinking: number;
    acting: number;
    planning: number;
    feeling: number;
  };
}

/**
 * Educational component explaining the 8 core strength patterns
 * Displays between the Star Card and Reflection Questions in AST 2-1
 */
export const StrengthShapesExplainer: React.FC<StrengthShapesExplainerProps> = ({
  className = '',
  userStrengths
}) => {
  // Calculate bar heights and sort by value (largest to smallest) - matches RML renderer spec
  const getUserChartBars = () => {
    if (!userStrengths) return null;

    const maxHeight = 150;
    const maxPercentage = Math.max(
      userStrengths.thinking,
      userStrengths.acting,
      userStrengths.planning,
      userStrengths.feeling
    );

    // Create array of strengths and sort largest to smallest (ALWAYS)
    const bars = [
      {
        name: 'acting',
        label: 'Acting',
        value: userStrengths.acting,
        height: Math.round((userStrengths.acting / maxPercentage) * maxHeight),
        color: '#f14040'
      },
      {
        name: 'planning',
        label: 'Planning',
        value: userStrengths.planning,
        height: Math.round((userStrengths.planning / maxPercentage) * maxHeight),
        color: '#ffcb2f'
      },
      {
        name: 'thinking',
        label: 'Thinking',
        value: userStrengths.thinking,
        height: Math.round((userStrengths.thinking / maxPercentage) * maxHeight),
        color: '#01a252'
      },
      {
        name: 'feeling',
        label: 'Feeling',
        value: userStrengths.feeling,
        height: Math.round((userStrengths.feeling / maxPercentage) * maxHeight),
        color: '#167efd'
      }
    ].sort((a, b) => b.value - a.value); // Sort by value descending

    return bars;
  };

  const sortedBars = getUserChartBars();

  return (
    <div className={`strength-shapes-explainer ${className}`}>
      <div className="shapes-intro bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-l-4 border-indigo-500">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Strengths Shape</h3>

        <p className="text-gray-700 mb-4 leading-relaxed">
          Beyond percentages, your strengths create a unique <strong>shape</strong>—a visual pattern that reveals how your energy naturally flows and focuses across the four core domains.
        </p>

        {/* User's Personalized Chart */}
        {sortedBars && (
          <div className="my-6 bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Your Strengths Pattern</h4>
            <div className="flex justify-center items-end gap-2 h-[200px] px-4">
              {sortedBars.map((bar) => (
                <div key={bar.name} className="flex flex-col items-center">
                  <div
                    className="w-16 relative flex flex-col justify-end items-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    style={{
                      height: `${bar.height}px`,
                      background: `linear-gradient(180deg, ${bar.color} 0%, ${bar.color}dd 100%)`,
                      color: 'white',
                      fontWeight: 600,
                      padding: '8px 0'
                    }}
                  >
                    <span
                      className="text-[10px] font-medium text-center mb-2"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {bar.label}
                    </span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xs text-gray-600 font-semibold">{bar.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-gray-700 mb-6 leading-relaxed">
          Your shape is not a fixed category, but rather a mirror that helps you notice which strengths tend to lead, which provide steady support, and which operate more quietly in the background. This awareness becomes a compass for understanding your natural rhythm and how you might work most effectively with others.
        </p>

        <h4 className="text-lg font-semibold text-gray-900 mb-3">The Eight Core Patterns</h4>

        <p className="text-gray-700 mb-6">
          Every strengths profile falls into one of eight fundamental shapes. Each has its own flow, its own gifts, and its own potential for growth through imagination:
        </p>

        {/* Pattern Gallery SVG */}
        <div className="patterns-gallery bg-white p-4 rounded-lg overflow-x-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1200"
            height="220"
            viewBox="0 0 1200 220"
            className="w-full h-auto min-w-[800px]"
          >
            <style>{`
              .bar.acting   { fill: #444; }
              .bar.planning { fill: #666; }
              .bar.thinking { fill: #888; }
              .bar.feeling  { fill: #aaa; }
              .label {
                font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
                font-size: 13px;
                fill: #111;
                font-weight: 500;
              }
            `}</style>

            {/* Pattern 1: Balanced */}
            <g id="pattern-1" transform="translate(12,8)">
              <rect className="bar acting" x="11.20" y="46.29" width="25.20" height="115.71" />
              <rect className="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
              <rect className="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
              <rect className="bar feeling" x="103.60" y="46.29" width="25.20" height="115.71" />
              <text className="label" x="70.00" y="180" textAnchor="middle">1. Balanced</text>
            </g>

            {/* Pattern 2: One High */}
            <g id="pattern-2" transform="translate(160,8)">
              <rect className="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect className="bar planning" x="42.00" y="60.17" width="25.20" height="101.83" />
              <rect className="bar thinking" x="72.80" y="64.80" width="25.20" height="97.20" />
              <rect className="bar feeling" x="103.60" y="55.54" width="25.20" height="106.46" />
              <text className="label" x="70.00" y="180" textAnchor="middle">2. One High</text>
            </g>

            {/* Pattern 3: One Low */}
            <g id="pattern-3" transform="translate(308,8)">
              <rect className="bar acting" x="11.20" y="37.03" width="25.20" height="124.97" />
              <rect className="bar planning" x="42.00" y="41.66" width="25.20" height="120.34" />
              <rect className="bar thinking" x="72.80" y="46.29" width="25.20" height="115.71" />
              <rect className="bar feeling" x="103.60" y="87.94" width="25.20" height="74.06" />
              <text className="label" x="70.00" y="180" textAnchor="middle">3. One Low</text>
            </g>

            {/* Pattern 4: Two High + Two Low */}
            <g id="pattern-4" transform="translate(456,8)">
              <rect className="bar acting" x="11.20" y="27.77" width="25.20" height="134.23" />
              <rect className="bar planning" x="42.00" y="32.40" width="25.20" height="129.60" />
              <rect className="bar thinking" x="72.80" y="78.69" width="25.20" height="83.31" />
              <rect className="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
              <text className="label" x="70.00" y="180" textAnchor="middle">4. Two High +</text>
              <text className="label" x="70.00" y="196" textAnchor="middle">Two Low</text>
            </g>

            {/* Pattern 5: Three High + One Low */}
            <g id="pattern-5" transform="translate(604,8)">
              <rect className="bar acting" x="11.20" y="32.40" width="25.20" height="129.60" />
              <rect className="bar planning" x="42.00" y="37.03" width="25.20" height="124.97" />
              <rect className="bar thinking" x="72.80" y="41.66" width="25.20" height="120.34" />
              <rect className="bar feeling" x="103.60" y="83.31" width="25.20" height="78.69" />
              <text className="label" x="70.00" y="180" textAnchor="middle">5. Three High +</text>
              <text className="label" x="70.00" y="196" textAnchor="middle">One Low</text>
            </g>

            {/* Pattern 6: Three Low + One High */}
            <g id="pattern-6" transform="translate(752,8)">
              <rect className="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect className="bar planning" x="42.00" y="69.43" width="25.20" height="92.57" />
              <rect className="bar thinking" x="72.80" y="74.06" width="25.20" height="87.94" />
              <rect className="bar feeling" x="103.60" y="78.69" width="25.20" height="83.31" />
              <text className="label" x="70.00" y="180" textAnchor="middle">6. Three Low +</text>
              <text className="label" x="70.00" y="196" textAnchor="middle">One High</text>
            </g>

            {/* Pattern 7: Two Middle + Two Outliers */}
            <g id="pattern-7" transform="translate(900,8)">
              <rect className="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect className="bar planning" x="42.00" y="50.91" width="25.20" height="111.09" />
              <rect className="bar thinking" x="72.80" y="50.91" width="25.20" height="111.09" />
              <rect className="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
              <text className="label" x="70.00" y="180" textAnchor="middle">7. Two Middle +</text>
              <text className="label" x="70.00" y="196" textAnchor="middle">Two Outliers</text>
            </g>

            {/* Pattern 8: Stair-step */}
            <g id="pattern-8" transform="translate(1048,8)">
              <rect className="bar acting" x="11.20" y="23.14" width="25.20" height="138.86" />
              <rect className="bar planning" x="42.00" y="46.29" width="25.20" height="115.71" />
              <rect className="bar thinking" x="72.80" y="69.43" width="25.20" height="92.57" />
              <rect className="bar feeling" x="103.60" y="92.57" width="25.20" height="69.43" />
              <text className="label" x="70.00" y="180" textAnchor="middle">8. Stair-step</text>
            </g>
          </svg>
        </div>

        <p className="text-sm text-gray-600 mt-4 italic">
          As you reflect on your strengths, consider which pattern best describes your profile. This understanding will deepen as you explore your reflections.
        </p>
      </div>
    </div>
  );
};

export default StrengthShapesExplainer;
