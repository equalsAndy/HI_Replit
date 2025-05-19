import React from 'react';

// A component that renders the ladder directly as SVG
export function LadderVisual() {
  return (
    <svg width="100%" height="700" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      {/* Title */}
      <text x="250" y="30" textAnchor="middle" fontWeight="bold" fontSize="24">Your Well-Being Ladder</text>
      <text x="250" y="55" textAnchor="middle" fontSize="14">Where are you now? Where do you want to be?</text>
      
      {/* Ladder structure */}
      <rect x="175" y="80" width="150" height="550" fill="none" stroke="#444" strokeWidth="4" />
      
      {/* Ladder rungs */}
      {[...Array(11)].map((_, i) => {
        const y = 80 + i * 55;
        return (
          <g key={i}>
            <line x1="175" y1={y} x2="325" y2={y} stroke="#444" strokeWidth="3" />
            <text x="160" y={y+5} textAnchor="end" fontWeight="bold" fontSize="16">{10-i}</text>
          </g>
        );
      })}
      
      {/* Labels */}
      <text x="335" y="90" fontSize="14" fontWeight="bold">Best possible life</text>
      <text x="335" y="630" fontSize="14" fontWeight="bold">Worst possible life</text>
      
      {/* Legend - placed below ladder on each side */}
      <g>
        <circle cx="175" cy="650" r="6" fill="#9333ea" />
        <text x="175" y="668" fontSize="12" textAnchor="middle">Current</text>
      </g>
      <g>
        <circle cx="325" cy="650" r="6" fill="#f97316" />
        <text x="325" y="668" fontSize="12" textAnchor="middle">1 year from now</text>
      </g>
    </svg>
  );
}

export default LadderVisual;