import React from 'react';
import { useLocation } from 'wouter';
import { Star, ArrowRight, X } from 'lucide-react';

interface ReportPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportPromptModal: React.FC<ReportPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleGoToReport = () => {
    onClose();
    setLocation('/allstarteams'); // Navigate to workshop page where they can access reports
    
    // Scroll to holistic report section after a brief delay
    setTimeout(() => {
      const reportElement = document.querySelector('[data-content="holistic-report"]');
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Complete Your Experience</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Your Holistic Report First
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Before sharing your feedback, please generate and review your personalized Holistic Report. 
                This will help you provide more meaningful insights about your workshop experience.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Why this matters:</h4>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    Your Holistic Report contains AI-generated insights about your unique strengths and development opportunities. 
                    Reviewing it will enhance the quality of feedback you can provide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Maybe Later
            </button>
            <button
              onClick={handleGoToReport}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              Go to Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};