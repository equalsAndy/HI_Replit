// client/src/components/modals/CoachingModal.tsx
import React from 'react';
import TaliaPanel from './TaliaPanel';
import ReflectionPanel from './ReflectionPanel';
import { CoachingModalState, TaliaMessage, Reflection } from '@/types/coaching';
import { X } from 'lucide-react';

interface CoachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: CoachingModalState['context'];
  chatHistory: TaliaMessage[];
  addMessage: (message: Omit<TaliaMessage, 'id' | 'timestamp'>) => void;
  reflectionDraft: Partial<Reflection>;
  updateReflectionDraft: (draft: Partial<Reflection>) => void;
}

const CoachingModal: React.FC<CoachingModalProps> = ({
  isOpen,
  onClose,
  context,
  chatHistory,
  addMessage,
  reflectionDraft,
  updateReflectionDraft,
}) => {
  if (!isOpen || !context) return null;

  const reflectionQuestion = `How and when do you use your ${context.strength.name} strength?`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Talia • AI Coach</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </header>

        {/* Split Content */}
        <div className="flex flex-1 min-h-0">
          {/* Coach Panel */}
          <div className="w-1/2 flex flex-col">
            <TaliaPanel
              chatHistory={chatHistory}
              addMessageToHistory={addMessage}
              strength={context.strength}
            />
          </div>
          
          {/* Reflection Panel */}
          <div className="w-1/2 border-l border-gray-200 flex flex-col">
            <ReflectionPanel
              question={reflectionQuestion}
              reflectionDraft={reflectionDraft}
              updateReflectionDraft={updateReflectionDraft}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingModal;
