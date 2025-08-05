import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { X, CheckCircle, ArrowRight, Download } from 'lucide-react';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import { User } from '@/hooks/use-current-user';

interface BetaTesterWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkshop: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
  user?: User;
}

// Helper function to analyze user's workshop progress
function getWorkshopProgress(user?: User) {
  if (!user) return { isReturning: false, isCompleted: false, currentStep: '', progressText: '' };

  // Check if workshop is completed
  const isCompleted = user.astWorkshopCompleted || user.iaWorkshopCompleted;
  
  // Parse navigation progress if available
  let currentStep = '';
  let completedSteps: string[] = [];
  let isReturning = false;

  if (user.navigationProgress) {
    try {
      const progress = JSON.parse(user.navigationProgress);
      currentStep = progress.currentStepId || '';
      completedSteps = progress.completedSteps || [];
      isReturning = completedSteps.length > 0 || !!currentStep;
    } catch (error) {
      console.warn('Failed to parse navigation progress:', error);
    }
  }

  // Generate progress text based on status
  let progressText = '';
  if (isCompleted) {
    progressText = "You've completed the workshop! You can review your answers and download reports.";
  } else if (isReturning && currentStep) {
    // Map step IDs to friendly names
    const stepNames: Record<string, string> = {
      '1-1': 'Getting Started',
      '1-2': 'Star Card Creation',
      '2-1': 'Strengths Exploration',
      '2-2': 'Flow Discovery',
      '3-1': 'Team Integration',
      '3-2': 'Final Reflection',
    };
    const stepName = stepNames[currentStep] || `Step ${currentStep}`;
    progressText = `You're currently on: ${stepName}`;
  } else if (isReturning) {
    progressText = `You've made some progress. Continue where you left off!`;
  }

  return {
    isReturning,
    isCompleted,
    currentStep,
    progressText,
    completedStepsCount: completedSteps.length
  };
}

const BetaTesterWelcomeModal: React.FC<BetaTesterWelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartWorkshop,
  onDontShowAgain,
  user,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const progress = getWorkshopProgress(user);

  const handleClose = () => {
    if (dontShowAgain) {
      onDontShowAgain(true);
    }
    onClose();
  };

  const handleStartWorkshop = () => {
    if (dontShowAgain) {
      onDontShowAgain(true);
    }
    onStartWorkshop();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-blue-600 to-blue-800">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-2xl">
                <img 
                  src={AllStarTeamsLogo} 
                  alt="AllStarTeams" 
                  className="h-16 w-auto"
                />
              </div>
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {progress.isReturning ? 'Welcome Back to AllStarTeams Beta' : 'Welcome to AllStarTeams Beta'}
            </h1>
            <p className="text-blue-100 text-xl font-light">
              {progress.isReturning ? 'Ready to continue your beta testing journey?' : 'Thanks for helping us test'}
            </p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {/* Dynamic Welcome Section */}
            <div className="mb-8">
              {progress.isCompleted ? (
                // Completed Workshop Content
                <>
                  <h2 className="text-slate-800 text-3xl font-semibold mb-4 flex items-center gap-3">
                    <CheckCircle className="text-green-600 h-8 w-8" />
                    Workshop Complete!
                  </h2>
                  <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                    Congratulations! You've completed the AllStarTeams beta workshop. {progress.progressText}
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h3 className="text-green-800 font-semibold mb-2">What you can do now:</h3>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• Review your Star Card and workshop answers</li>
                      <li>• Download your personalized reports</li>
                      <li>• Provide feedback on your overall experience</li>
                      <li>• Note: Your answers are now read-only to preserve your results</li>
                    </ul>
                  </div>
                </>
              ) : progress.isReturning ? (
                // Returning User Content  
                <>
                  <h2 className="text-slate-800 text-3xl font-semibold mb-4 flex items-center gap-3">
                    <ArrowRight className="text-blue-600 h-8 w-8" />
                    Continue Your Journey
                  </h2>
                  <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                    Welcome back! {progress.progressText}
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="text-blue-800 font-semibold mb-2">Your Progress:</h3>
                    <p className="text-blue-700 text-sm">
                      You've completed {progress.completedStepsCount} steps. Continue testing the workshop experience and remember to use the feedback button for any issues or suggestions.
                    </p>
                  </div>
                </>
              ) : (
                // First-time User Content
                <>
                  <h2 className="text-slate-800 text-3xl font-semibold mb-4 flex items-center gap-3">
                    <span className="text-2xl">🙏</span>
                    Thank You!
                  </h2>
                  <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                    AllStarTeams is a workshop that helps people discover their strengths, find their flow, and build better teams. 
                    You're testing the <strong>individual self-directed experience</strong> - complete the workshop through the Final Reflection.
                  </p>
                  <p className="text-slate-500 text-base italic">
                    <em>Note: Some features will be disabled during testing (team features, growth plan). 
                    You may see some AI features with a chatbot called Talia - these are very new but feel free to try them out.</em>
                  </p>
                </>
              )}
            </div>

            {/* Steps Section - Only show for first-time users */}
            {!progress.isReturning && (
              <div className="mb-8">
                <h2 className="text-slate-800 text-2xl font-semibold mb-6 text-center">
                  What We Need
                </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Step 1 */}
                <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    1
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Answer Questions Authentically
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Be genuinely yourself in all responses. Your authentic answers determine the personalized insights you'll receive at the end.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    2
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Complete Through Final Reflection
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Go through the entire individual workshop journey - create your Star Card, explore your strengths, and complete the Final Reflection.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    3
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Use the Feedback Button
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Click the feedback button in the yellow bar at the top. Tell us about bugs, confusing parts, or ideas for improvement.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    4
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Complete the Final Survey
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    After your Final Reflection, you'll see a survey to help us understand your overall experience. Please fill it out!
                  </p>
                </div>
              </div>
              </div>
            )}

            {/* Dynamic CTA Button */}
            <div className="text-center mb-6">
              <Button
                onClick={handleStartWorkshop}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
              >
                {progress.isCompleted ? (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Review & Download Reports
                  </>
                ) : progress.isReturning ? (
                  <>
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Continue Your Workshop
                  </>
                ) : (
                  'Start Your Beta Experience'
                )}
              </Button>
            </div>

            {/* Don't Show Again */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(!!checked)}
              />
              <label htmlFor="dontShowAgain" className="cursor-pointer">
                Don't show this welcome message again
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-blue-100">
            <p className="mb-2">Thank you for helping us build something amazing! 🌟</p>
            <p className="text-sm opacity-80">Heliotrope Imaginal • AllStarTeams Beta Program</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaTesterWelcomeModal;