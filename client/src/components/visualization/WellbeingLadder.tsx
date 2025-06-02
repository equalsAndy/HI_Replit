import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { LadderVisual } from './LadderVisual';
import wellbeingLadderImage from '@/assets/wellbeing-ladder.png';

interface WellbeingLadderProps {
  onCurrentValueChange?: (value: number) => void;
  onFutureValueChange?: (value: number) => void;
}

export function WellbeingLadder({ onCurrentValueChange, onFutureValueChange }: WellbeingLadderProps) {
  const [currentPosition, setCurrentPosition] = useState(5);
  const [futurePosition, setFuturePosition] = useState(7);

  // Calculate the position of the marker on the ladder
  // The ladder has 11 rungs (0-10), and we need to map it to CSS positions
  const calculateMarkerPosition = (value: number) => {
    // Invert the value since the top is 10, the bottom is 0
    const invertedValue = 10 - value;
    // We map the 0-10 range to the positions on the ladder image
    // For now, using a rough approximation of spacing
    return `${invertedValue * 9.2 + 1}%`;
  };

  const handleCurrentPositionChange = (value: number[]) => {
    const newValue = value[0];
    setCurrentPosition(newValue);
    if (onCurrentValueChange) {
      onCurrentValueChange(newValue);
    }
  };

  const handleFuturePositionChange = (value: number[]) => {
    const newValue = value[0];
    setFuturePosition(newValue);
    if (onFutureValueChange) {
      onFutureValueChange(newValue);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="relative">
        <div className="w-full max-w-md mx-auto">
          <LadderVisual />

          {/* Current position marker - purple circle (no number) */}
          <div 
            className="absolute rounded-full bg-purple-600 w-8 h-8 shadow-lg"
            style={{ 
              top: `${80 + (10-currentPosition) * 55 - 4}px`,
              left: `133px`,
            }}
          />

          {/* Future position marker - orange circle (no number) */}
          <div 
            className="absolute rounded-full bg-orange-500 w-8 h-8 shadow-lg"
            style={{ 
              top: `${80 + (10-futurePosition) * 55 - 4}px`,
              left: `367px`,
            }}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <Label htmlFor="current-position" className="text-base font-medium flex items-center">
            <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
            Where are you on the ladder today? (0–10)
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            Consider your overall life satisfaction at this moment.
          </p>
          <div className="flex items-center space-x-4">
            <Slider
              id="current-position"
              max={10}
              step={1}
              value={[currentPosition]}
              onValueChange={handleCurrentPositionChange}
              className="flex-1"
            />
            <span className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {currentPosition}
            </span>
          </div>
        </div>

        <div>
          <Label htmlFor="future-position" className="text-base font-medium flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            Where do you realistically see yourself in one year? (0–10)
          </Label>
          <p className="text-sm text-gray-500 mb-4">
            What achievable improvement would represent meaningful growth?
          </p>
          <div className="flex items-center space-x-4">
            <Slider
              id="future-position"
              max={10}
              step={1}
              value={[futurePosition]}
              onValueChange={handleFuturePositionChange}
              className="flex-1"
            />
            <span className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {futurePosition}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WellbeingLadder;