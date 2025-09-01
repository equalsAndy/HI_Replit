import React, { useState } from 'react';
import { useNavigationProgress } from '../../../hooks/use-navigation-progress';
import { CheckCircle, Trophy, ArrowRight } from 'lucide-react';

interface FinishWorkshopStepProps {
  stepId: string;
}

export const FinishWorkshopStep: React.FC<FinishWorkshopStepProps> = ({ stepId }) => {
  const { markStepCompleted, progress, setCurrentStep } = useNavigationProgress('ast');
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const isCompleted = progress.completedSteps.includes(stepId);

  const handleFinishWorkshop = async () => {
    if (isCompleted) {
      // Already completed, just navigate to Module 4
      setCurrentStep('4-1');
      return;
    }

    setIsCompleting(true);
    
    try {
      // Mark this step as completed, which will trigger workshop completion
      await markStepCompleted(stepId);
      
      // Show celebration
      setShowCelebration(true);
      
      // After a moment, navigate to Module 4
      setTimeout(() => {
        setCurrentStep('4-1');
        setShowCelebration(false);
      }, 2500);
      
    } catch (error) {
      console.error('Error completing workshop:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Trophy className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isCompleted ? 'Workshop Completed!' : 'Finish Your AST Workshop'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isCompleted 
            ? 'Congratulations! You have successfully completed the AllStarTeams workshop. Your takeaways and resources are now available.'
            : 'You\'ve made incredible progress through your strengths discovery and future visioning journey. Complete your workshop to unlock your personalized resources and next steps.'
          }
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Journey So Far</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Module 1</h3>
            <p className="text-sm text-gray-600">Getting Started</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Module 2</h3>
            <p className="text-sm text-gray-600">Strength and Flow</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Module 3</h3>
            <p className="text-sm text-gray-600">Visualize Your Potential</p>
          </div>
        </div>
      </div>

      {/* What You'll Unlock */}
      {!isCompleted && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🎉 What You'll Unlock</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Module 4: Takeaways & Next Steps</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Download your personalized Star Card</li>
                <li>• Access your Holistic Development Report</li>
                <li>• Create your Growth Plan</li>
                <li>• Team Workshop Preparation</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Module 5: More Information</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Learn more about AllStarTeams</li>
                <li>• Explore additional resources</li>
                <li>• Discover Imaginal Agility</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Completion Button */}
      <div className="text-center">
        {showCelebration && (
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl font-semibold text-green-600">Workshop Completed!</p>
            <p className="text-gray-600">Redirecting to your resources...</p>
          </div>
        )}
        
        {!showCelebration && (
          <button
            onClick={handleFinishWorkshop}
            disabled={isCompleting}
            className={`inline-flex items-center px-8 py-4 rounded-lg font-medium text-lg transition-all ${
              isCompleted
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            } ${isCompleting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Completing Workshop...
              </>
            ) : isCompleted ? (
              <>
                View Your Resources
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                Finish Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer Message */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          {isCompleted 
            ? 'You can always return to review your workshop content and access your resources.'
            : 'Take a moment to reflect on your journey before completing your workshop.'
          }
        </p>
      </div>
    </div>
  );
};

export default FinishWorkshopStep;
