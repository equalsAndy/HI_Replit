import React, { useEffect } from 'react';

interface IA14TheBiggerPictureProps {
  onNext?: (stepId: string) => void;
}

const IA_1_4_TheBiggerPicture: React.FC<IA14TheBiggerPictureProps> = ({ onNext }) => {
  // Auto-advance to Module 2 since this step is retired
  useEffect(() => {
    if (onNext) {
      onNext('ia-2-1');
    }
  }, [onNext]);

  return (
    <div className="max-w-4xl mx-auto p-6 text-center py-20">
      <p className="text-gray-500">Redirecting to Module 2...</p>
    </div>
  );
};

export default IA_1_4_TheBiggerPicture;
