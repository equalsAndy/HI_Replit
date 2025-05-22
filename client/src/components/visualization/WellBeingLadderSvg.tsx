import React from 'react';

interface WellBeingLadderSvgProps {
  currentValue: number;
  futureValue: number;
}

const WellBeingLadderSvg: React.FC<WellBeingLadderSvgProps> = ({ currentValue, futureValue }) => {
  // Calculate positions (SVG has 10 at top, 0 at bottom)
  // Each rung is 55 units apart, starting at y=80 for rung 10
  const getCurrentY = (value: number) => 630 - (value * 55);
  const getFutureY = (value: number) => 630 - (value * 55);
  
  const currentY = getCurrentY(currentValue);
  const futureY = getFutureY(futureValue);
  
  return (
    <svg 
      width="100%" 
      height="550" 
      viewBox="0 0 500 700" 
      xmlns="http://www.w3.org/2000/svg" 
      preserveAspectRatio="xMidYMid meet"
      className="mx-auto"
    >
      <text x="250" y="30" textAnchor="middle" fontWeight="bold" fontSize="24">Your Well-Being Ladder</text>
      <text x="250" y="55" textAnchor="middle" fontSize="14">Where are you now? Where do you want to be?</text>
      
      <rect x="175" y="80" width="150" height="550" fill="none" stroke="#444" strokeWidth="4"></rect>
      
      {/* Ladder rungs */}
      <g>
        <line x1="175" y1="80" x2="325" y2="80" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="85" textAnchor="end" fontWeight="bold" fontSize="16">10</text>
      </g>
      <g>
        <line x1="175" y1="135" x2="325" y2="135" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="140" textAnchor="end" fontWeight="bold" fontSize="16">9</text>
      </g>
      <g>
        <line x1="175" y1="190" x2="325" y2="190" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="195" textAnchor="end" fontWeight="bold" fontSize="16">8</text>
      </g>
      <g>
        <line x1="175" y1="245" x2="325" y2="245" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="250" textAnchor="end" fontWeight="bold" fontSize="16">7</text>
      </g>
      <g>
        <line x1="175" y1="300" x2="325" y2="300" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="305" textAnchor="end" fontWeight="bold" fontSize="16">6</text>
      </g>
      <g>
        <line x1="175" y1="355" x2="325" y2="355" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="360" textAnchor="end" fontWeight="bold" fontSize="16">5</text>
      </g>
      <g>
        <line x1="175" y1="410" x2="325" y2="410" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="415" textAnchor="end" fontWeight="bold" fontSize="16">4</text>
      </g>
      <g>
        <line x1="175" y1="465" x2="325" y2="465" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="470" textAnchor="end" fontWeight="bold" fontSize="16">3</text>
      </g>
      <g>
        <line x1="175" y1="520" x2="325" y2="520" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="525" textAnchor="end" fontWeight="bold" fontSize="16">2</text>
      </g>
      <g>
        <line x1="175" y1="575" x2="325" y2="575" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="580" textAnchor="end" fontWeight="bold" fontSize="16">1</text>
      </g>
      <g>
        <line x1="175" y1="630" x2="325" y2="630" stroke="#444" strokeWidth="3"></line>
        <text x="160" y="635" textAnchor="end" fontWeight="bold" fontSize="16">0</text>
      </g>
      
      <text x="335" y="90" fontSize="14" fontWeight="bold">Best possible life</text>
      <text x="335" y="630" fontSize="14" fontWeight="bold">Worst possible life</text>
      
      {/* Current marker */}
      <g>
        <circle cx="175" cy={currentY} r="10" fill="#3b82f6" stroke="#fff" strokeWidth="2"></circle>
        <text x="155" y={currentY+5} fontSize="12" textAnchor="end" fontWeight="bold" fill="#3b82f6">NOW</text>
      </g>
      
      {/* Future marker */}
      <g>
        <circle cx="325" cy={futureY} r="10" fill="#10b981" stroke="#fff" strokeWidth="2"></circle>
        <text x="345" y={futureY+5} fontSize="12" textAnchor="start" fontWeight="bold" fill="#10b981">GOAL</text>
      </g>
      
      {/* Legend */}
      <g>
        <circle cx="175" cy="650" r="6" fill="#3b82f6"></circle>
        <text x="175" y="668" fontSize="12" textAnchor="middle">Current</text>
      </g>
      <g>
        <circle cx="325" cy="650" r="6" fill="#10b981"></circle>
        <text x="325" y="668" fontSize="12" textAnchor="middle">1 year from now</text>
      </g>
    </svg>
  );
};

export default WellBeingLadderSvg;