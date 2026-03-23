import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { X, CheckCircle, ArrowRight, Download } from 'lucide-react';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';
import { User } from '@/hooks/use-current-user';

type AppType = 'allstarteams' | 'imaginal-agility';

interface BetaTesterWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartWorkshop: () => void;
  onDontShowAgain: (dontShow: boolean) => void;
  user?: User;
  appType?: AppType;
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
    // Map step IDs to friendly names based on workshop type
    const astStepNames: Record<string, string> = {
      '1-1': 'Getting Started',
      '1-2': 'Star Card Creation',
      '2-1': 'Strengths Exploration',
      '2-2': 'Flow Discovery',
      '3-1': 'Team Integration',
      '3-2': 'Final Reflection',
    };
    const iaStepNames: Record<string, string> = {
      'ia-1-1': 'Overview',
      'ia-2-1': 'I4C Prism',
      'ia-2-2': 'Capability Dynamics',
      'ia-2-3': 'Self Assessment',
      'ia-3-1': 'Ladder Overview',
      'ia-4-1': 'Advanced Ladder',
    };
    const stepNames = currentStep?.startsWith('ia-') ? iaStepNames : astStepNames;
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
  appType = 'allstarteams',
}) => {
  const [showAtStartup, setShowAtStartup] = useState(true);
  const progress = getWorkshopProgress(user);
  const isIA = appType === 'imaginal-agility';
  const workshopName = isIA ? 'Imaginal Agility' : 'AllStarTeams';
  const logo = isIA ? ImaginalAgilityLogo : AllStarTeamsLogo;
  const gradientClass = isIA ? 'from-purple-600 to-purple-800' : 'from-blue-600 to-blue-800';
  const accentColor = isIA ? 'purple' : 'blue';

  const handleClose = () => {
    if (!showAtStartup) {
      onDontShowAgain(true);
    }
    onClose();
  };

  const handleStartWorkshop = () => {
    if (!showAtStartup) {
      onDontShowAgain(true);
    }
    onStartWorkshop();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br ${gradientClass}`}>
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
                  src={logo}
                  alt={workshopName}
                  className="h-16 w-auto"
                />
              </div>
            </div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {progress.isReturning ? `Welcome Back to ${workshopName} Beta` : `Welcome to ${workshopName} Beta`}
            </h1>
            <p className={`${isIA ? 'text-purple-100' : 'text-blue-100'} text-xl font-light`}>
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
                    Congratulations! You've completed the {workshopName} beta workshop. {progress.progressText}
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
                    <ArrowRight className={`${isIA ? 'text-purple-600' : 'text-blue-600'} h-8 w-8`} />
                    Continue Your Journey
                  </h2>
                  <p className="text-slate-600 text-lg mb-4 leading-relaxed">
                    Welcome back! {progress.progressText}
                  </p>
                  <div className={`${isIA ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-4`}>
                    <h3 className={`${isIA ? 'text-purple-800' : 'text-blue-800'} font-semibold mb-2`}>Your Progress:</h3>
                    <p className={`${isIA ? 'text-purple-700' : 'text-blue-700'} text-sm`}>
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
                    {isIA
                      ? 'Imaginal Agility is a workshop that helps people develop creative capabilities, expand their imagination, and unlock new perspectives.'
                      : 'AllStarTeams is a workshop that helps people discover their strengths, find their flow, and build better teams.'}
                    {' '}You're testing the <strong>individual self-directed experience</strong> - complete the workshop through the Final Reflection.
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
                <div className={`relative bg-white border-2 border-slate-200 rounded-2xl p-6 ${isIA ? 'hover:border-purple-500' : 'hover:border-blue-500'} hover:shadow-lg transition-all duration-300 group`}>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 ${isIA ? 'bg-purple-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
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
                <div className={`relative bg-white border-2 border-slate-200 rounded-2xl p-6 ${isIA ? 'hover:border-purple-500' : 'hover:border-blue-500'} hover:shadow-lg transition-all duration-300 group`}>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 ${isIA ? 'bg-purple-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
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
                <div className={`relative bg-white border-2 border-slate-200 rounded-2xl p-6 ${isIA ? 'hover:border-purple-500' : 'hover:border-blue-500'} hover:shadow-lg transition-all duration-300 group`}>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 ${isIA ? 'bg-purple-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                    3
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Take Notes Along the Way
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">
                      If you would like to take notes on your experience, click this in the lower right of your screen.
                      Tell us about bugs, confusing parts, or ideas for improvement as you go through the workshop.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`relative bg-white border-2 border-slate-200 rounded-2xl p-6 ${isIA ? 'hover:border-purple-500' : 'hover:border-blue-500'} hover:shadow-lg transition-all duration-300 group`}>
                  <div className={`absolute -top-3 -right-3 w-10 h-10 ${isIA ? 'bg-purple-600' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                    4
                  </div>
                  <h3 className="text-slate-800 text-lg font-semibold mb-3">
                    Complete the Feedback Review
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    After your Final Reflection, review your notes and submit your feedback.
                    Then download your report and explore the additional features available.
                  </p>
                </div>
              </div>
              </div>
            )}

            {/* Dynamic CTA Button */}
            <div className="text-center mb-6">
              <Button
                onClick={handleStartWorkshop}
                className={`bg-gradient-to-r ${isIA ? 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
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

            {/* Show at Startup */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Checkbox
                id="showAtStartup"
                checked={showAtStartup}
                onCheckedChange={(checked) => setShowAtStartup(!!checked)}
              />
              <label htmlFor="showAtStartup" className="cursor-pointer">
                Show this at startup
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className={`text-center mt-6 ${isIA ? 'text-purple-100' : 'text-blue-100'}`}>
            <p className="mb-2">Thank you for helping us build something amazing! 🌟</p>
            <p className="text-sm opacity-80">Heliotrope Imaginal • {workshopName} Beta Program</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetaTesterWelcomeModal;