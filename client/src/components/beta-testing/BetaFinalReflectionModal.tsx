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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-400 animate-in slide-in-from-bottom-8 zoom-in-95"
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
            className="text-white p-8 pb-6 rounded-t-2xl relative overflow-hidden"
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
                className="w-16 h-16 flex items-center justify-center p-3 mb-5 border-2 border-white border-opacity-30"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px'
                }}
              >
                <img 
                  src={AllStarTeamsLogo} 
                  alt="AllStarTeams" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                Hi Beta Tester, you're Almost Done! 🎉
              </h1>
              <p className="text-lg opacity-90 leading-relaxed">
                Final Reflection - The last step of your workshop journey
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-gray-600 text-base leading-relaxed mb-6">
              When you finish the Final Reflection, all your previous answers will be locked and your holistic report will be <strong className="text-gray-800 font-semibold">*unlocked*</strong> along with the sample growth plan and the example team workshop prep. The most important part is to generate and review your reports, as this is the result of your previous work. As you'll see on the page the professional report is meant to be shared while the personal report is your choice whether to share.
            </div>
            <div className="text-gray-600 text-base leading-relaxed mb-6">
              After you see your reports, click through the growth plan and team prep. The button at the end of team prep will trigger a screen to complete your feedback. You will be able to review and edit any notes you took and then there will be some final questions.
            </div>

            {/* What's Left to See Section */}
            <div 
              className="rounded-2xl p-6 mb-6 border"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div 
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold"
                >
                  👀
                </div>
                <h3 className="text-xl font-semibold text-gray-800">What's left to see:</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: 'Download your Star Card',
                    description: 'Get your personalized strength profile to keep and share'
                  },
                  {
                    title: 'Your Holistic Report*',
                    description: 'Comprehensive insights based on your authentic responses'
                  },
                  {
                    title: 'Growth Plan',
                    description: 'Sample development pathway based on your results'
                  },
                  {
                    title: 'Team Workshop Prep',
                    description: 'Preview of how your insights translate to team collaboration'
                  },
                  {
                    title: 'Workshop Resources',
                    description: 'Additional materials and next steps information'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div 
                      className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Continue Button */}
            <button 
              onClick={handleContinue}
              className="w-full py-4 px-8 rounded-xl text-white font-semibold text-lg transition-all duration-300 relative overflow-hidden group"
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
            <div className="text-center text-gray-500 text-sm mt-4 italic">
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