import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';
import { isFeatureEnabled } from '../../utils/featureFlags';
import { useTestUser } from '../../hooks/useTestUser';

interface PageData {
  title: string;
  workshop: 'ast' | 'ia';
  workshopName: string;
  module?: string;
  url: string;
}

interface FeedbackTriggerProps {
  currentPage: PageData;
  className?: string;
  variant?: 'button' | 'fab' | 'text';
}

export const FeedbackTrigger: React.FC<FeedbackTriggerProps> = ({ 
  currentPage, 
  className = '',
  variant = 'button'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isTestUser, user } = useTestUser();

  // Check if feedback system is enabled
  if (!isFeatureEnabled('feedbackSystem')) {
    return null;
  }

  // Visibility logic based on user type and variant
  const isBetaTester = user?.isBetaTester || false;
  const shouldShowToUser = isTestUser || isBetaTester;
  
  if (!shouldShowToUser) {
    return null;
  }

  // FAB variant only for beta testers
  if (variant === 'fab' && !isBetaTester) {
    return null;
  }

  // Button/text variants only for test users (not beta testers)
  if ((variant === 'button' || variant === 'text') && isBetaTester) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Floating Action Button variant
  if (variant === 'fab') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center z-40 ${className}`}
          title="Give Feedback"
        >
          <MessageCircle size={24} />
        </button>

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          currentPage={currentPage}
        />
      </>
    );
  }

  // Text link variant
  if (variant === 'text') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={`text-blue-600 hover:text-blue-800 text-sm font-medium underline ${className}`}
        >
          Give Feedback
        </button>

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          currentPage={currentPage}
        />
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-500 rounded-lg text-sm font-medium text-white hover:bg-blue-700 hover:border-blue-600 transition-colors shadow-sm ${className}`}
      >
        <MessageCircle size={16} />
        Give Feedback
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentPage={currentPage}
      />
    </>
  );
};