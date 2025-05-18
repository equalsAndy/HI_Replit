import React from 'react';

// A component that renders the ladder directly as SVG
export function LadderVisual() {
  return (
    <svg width="400" height="700" viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg">
      {/* Title */}
      <text x="200" y="30" textAnchor="middle" fontWeight="bold" fontSize="24">Your Well-Being Ladder</text>
      <text x="200" y="55" textAnchor="middle" fontSize="14">Where are you now? Where do you want to be?</text>
      
      {/* Ladder structure */}
      <rect x="150" y="80" width="150" height="550" fill="none" stroke="#444" strokeWidth="4" />
      
      {/* Ladder rungs */}
      {[...Array(11)].map((_, i) => {
        const y = 80 + i * 55;
        return (
          <g key={i}>
            <line x1="150" y1={y} x2="300" y2={y} stroke="#444" strokeWidth="3" />
            <text x="135" y={y+5} textAnchor="end" fontWeight="bold" fontSize="16">{10-i}</text>
          </g>
        );
      })}
      
      {/* Labels */}
      <text x="310" y="90" fontSize="14" fontWeight="bold">Best possible life</text>
      <text x="310" y="630" fontSize="14" fontWeight="bold">Worst possible life</text>
      
      {/* Legend */}
      <text x="100" y="660" fontSize="12">Place purple sticky for current position</text>
      <text x="100" y="680" fontSize="12">Place orange sticky for future aspiration (1 year from now)</text>
    </svg>
  );
}

export default LadderVisual;