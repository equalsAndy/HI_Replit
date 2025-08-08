import React from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';

interface BetaFinalReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaFinalReflectionModal: React.FC<BetaFinalReflectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleContinue = () => {
    onClose();
    // Navigate to AllStarTeams - the user should already be on the final reflection step
    setLocation('/allstarteams');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[95vh] overflow-y-auto transform transition-all duration-400 animate-in slide-in-from-bottom-8 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 bg-black bg-opacity-10 hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:scale-110 z-10"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Header with gradient and shimmer effect */}
          <div 
            className="text-white p-6 pb-4 rounded-t-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 4s ease-in-out infinite'
              }}
            />
            
            <div className="relative z-10">
              {/* AST Logo Container */}
              <div 
                className="w-12 h-12 flex items-center justify-center p-2 mb-3 border-2 border-white border-opacity-30"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px'
                }}
              >
                <img 
                  src={AllStarTeamsLogo} 
                  alt="AllStarTeams" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h1 className="text-xl font-bold mb-1 leading-tight">
                Hi Beta Tester, you're Almost Done! 🎉
              </h1>
              <p className="text-sm opacity-90 leading-relaxed">
                Final Reflection - The last step of your workshop journey
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-gray-600 text-sm leading-relaxed mb-4">
              When you finish the Final Reflection, all your previous answers will be locked and your holistic report will be <strong className="text-gray-800 font-semibold">*unlocked*</strong> along with the sample growth plan and example team workshop prep. The most important part is to generate and review your reports, as this is the result of your previous work.
            </div>
            <div className="text-gray-600 text-sm leading-relaxed mb-4">
              After you see your reports, click through the growth plan and team prep. The button at the end will trigger feedback completion where you can review notes and answer final questions.
            </div>

            {/* What's Left to See Section */}
            <div 
              className="rounded-xl p-4 mb-4 border"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                >
                  👀
                </div>
                <h3 className="text-lg font-semibold text-gray-800">What's left to see:</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Download your Star Card',
                  'Your Holistic Report*',
                  'Growth Plan', 
                  'Team Workshop Prep',
                  'Workshop Resources'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>


            {/* Continue Button */}
            <button 
              onClick={handleContinue}
              className="w-full py-3 px-6 rounded-xl text-white font-semibold transition-all duration-300 relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              Continue to Final Reflection
            </button>

            {/* Footer Note */}
            <div className="text-center text-gray-500 text-xs mt-3 italic">
              Your feedback will help shape the future of AllStarTeams ✨
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { 
            transform: translateX(-100%) translateY(-100%) rotate(45deg); 
          }
          50% { 
            transform: translateX(100%) translateY(100%) rotate(45deg); 
          }
        }
      `}</style>
    </>
  );
};