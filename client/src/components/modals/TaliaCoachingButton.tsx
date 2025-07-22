// client/src/components/modals/TaliaCoachingButton.tsx
import React from 'react';
import { useCoachingModal } from '@/hooks/useCoachingModal';
import { StrengthData } from '@/types/coaching';
import { MessageCircle, Sparkles } from 'lucide-react';

interface TaliaCoachingButtonProps {
  strength: StrengthData;
  className?: string;
}

const TaliaCoachingButton: React.FC<TaliaCoachingButtonProps> = ({ 
  strength, 
  className = '' 
}) => {
  const { openModal } = useCoachingModal();

  const handleOpenCoaching = () => {
    openModal(strength);
  };

  return (
    <button
      onClick={handleOpenCoaching}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${className}`}
    >
      <div className="relative">
        <MessageCircle size={16} />
        <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-300" />
      </div>
      <span className="font-medium">Chat with Talia</span>
    </button>
  );
};

export default TaliaCoachingButton;
