// client/src/components/modals/CoachingModalProvider.tsx
import React from 'react';
import { useCoachingModal } from '@/hooks/useCoachingModal';
import CoachingModal from './CoachingModal';

interface CoachingModalProviderProps {
  children: React.ReactNode;
}

const CoachingModalProvider: React.FC<CoachingModalProviderProps> = ({ children }) => {
  const modal = useCoachingModal();

  return (
    <>
      {children}
      <CoachingModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        context={modal.context}
        chatHistory={modal.chatHistory}
        addMessage={modal.addMessage}
        reflectionDraft={modal.reflectionDraft}
        updateReflectionDraft={modal.updateReflectionDraft}
      />
    </>
  );
};

export default CoachingModalProvider;
