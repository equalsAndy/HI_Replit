import React, { useState } from 'react';
import { CheckCircle, Download, BookOpen, Users, ArrowRight, Star, BarChart3, Target, Award } from 'lucide-react';
import allstarteamsLogo from '@assets/all-star-teams-logo-250px.png';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useApplication } from '@/hooks/use-application';
import WorkshopCompletionBanner from '@/components/common/WorkshopCompletionBanner';

interface WorkshopRecapProps {
  setCurrentContent: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
}

export default function WorkshopRecap({ setCurrentContent, markStepCompleted }: WorkshopRecapProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const { completeWorkshop, astCompleted, iaCompleted } = useWorkshopStatus();
  const { currentApp } = useApplication();
  const appType = currentApp === 'allstarteams' ? 'ast' : 'ia';
  const isWorkshopCompleted = appType === 'ast' ? astCompleted : iaCompleted;

  const handleFinishWorkshop = async () => {
    if (isWorkshopCompleted) {
      // Workshop already completed, navigate to star card
      setCurrentContent('download-star-card');
      return;
    }

    setIsFinishing(true);

    try {
      console.log(`🎯 Completing ${appType.toUpperCase()} workshop via recap button...`);

      // CRITICAL: Mark step 3-4 as completed FIRST so the workshop completion API can find it
      console.log('📋 Marking step 3-4 as completed before workshop completion check...');
      await markStepCompleted?.('3-4');

      // Add a small delay to ensure the save completes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now complete the workshop using the official completion function
      const result = await completeWorkshop(appType);

      if (result.success) {
        console.log('✅ Workshop completed successfully from recap');

        // Removed auto-scroll as per requirements

        // Show success message briefly, then stay on current view to show updated buttons
        setTimeout(() => {
          setIsFinishing(false);
          // Stay on current content - don't navigate away
          // This allows the post-completion buttons to become enabled
        }, 2000);
      } else {
        console.error('❌ Failed to complete workshop:', result.error);
        setIsFinishing(false);
        // Don't navigate away on failure either
      }
    } catch (error) {
      console.error('Error finishing workshop:', error);
      setIsFinishing(false);
      // Don't navigate away on error
    }
  };

  const accomplishments = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Discovered Your Strengths Profile",
      description: "You identified your core strengths distribution across Thinking, Acting, Feeling, and Planning, creating your personalized Star Card.",
      completed: true
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-500" />,
      title: "Explored Your Flow Patterns",
      description: "You analyzed what conditions help you perform at your best and identified your unique flow triggers.",
      completed: true
    },
    {
      icon: <Target className="w-6 h-6 text-green-500" />,
      title: "Mapped Your Well-Being Journey",
      description: "You assessed your current well-being level and created a concrete plan for quarterly growth.",
      completed: true
    },
    {
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      title: "Envisioned Your Future Self",
      description: "You crafted a compelling vision of your 5, 10, and 20-year aspirations aligned with your strengths.",
      completed: true
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-teal-500" />,
      title: "Captured Key Insights",
      description: "You distilled your learning into actionable insights that will guide your ongoing development.",
      completed: true
    }
  ];

  const nextSteps = [
    {
      icon: <Download className="w-6 h-6 text-blue-600" />,
      title: "Download Your Star Card",
      description: "Get your personalized strengths profile as a shareable visual reference",
      action: () => {
        console.log('🔍 WorkshopRecap: Navigating to download-star-card');
        setCurrentContent('download-star-card');
      },
      primary: true
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: "Generate Holistic Report",
      description: "Create a comprehensive report of all your workshop insights and recommendations",
      action: () => {
        console.log('🔍 WorkshopRecap: Navigating to holistic-report');
        setCurrentContent('holistic-report');
      },
      primary: true
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Prepare for Team Workshop",
      description: "Access materials and guidance for participating in the team collaboration phase",
      action: () => {
        console.log('🔍 WorkshopRecap: Navigating to team-workshop-prep');
        setCurrentContent('team-workshop-prep');
      },
      primary: false
    }
  ];

  console.log('🔍 WorkshopRecap: Rendering with isWorkshopCompleted =', isWorkshopCompleted);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Workshop Completion Banner */}
      <WorkshopCompletionBanner stepId="workshop-recap" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src={allstarteamsLogo} alt="AllStarTeams" className="h-12 w-auto" />
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Workshop (Almost) Complete!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You've taken a significant step in understanding your unique strengths and potential.
          <strong className="block mt-2">Scroll down to the green button to finish your workshop and unlock your takeaways.</strong>
        </p>
      </div>

      {/* Accomplishments */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
          What You Accomplished
        </h2>
        
        <div className="space-y-4">
          {accomplishments.map((item, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <ArrowRight className="w-6 h-6 text-blue-600 mr-2" />
          Your Next Steps
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nextSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => {
                console.log('🔍 WorkshopRecap: Button clicked -', step.title, '| isWorkshopCompleted =', isWorkshopCompleted);
                step.action();
              }}
              className={`
                p-6 rounded-lg border-2 text-left transition-all duration-200
                ${step.primary
                  ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100 hover:shadow-lg cursor-pointer'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 hover:shadow-lg cursor-pointer'
                }
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${step.primary ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                {step.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Finish Workshop Button */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6 mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {isWorkshopCompleted ? 'Workshop Completed' : 'Complete Your Workshop'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {isWorkshopCompleted
              ? 'Your workshop is complete! Modules 1-3 are now locked for reference, and Modules 4-5 are unlocked for your takeaways.'
              : 'Ready to finish and unlock your takeaways? Click below to complete your workshop journey and access your Star Card, holistic report, and additional resources.'
            }
          </p>
          
          <button
            onClick={handleFinishWorkshop}
            disabled={isFinishing}
            className={`
              px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
              ${
                isFinishing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }
            `}
            data-continue-button="true"
          >
            {isFinishing ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Finishing Workshop...
              </>
            ) : (
              isWorkshopCompleted ? 'Go to Star Card' : 'Finish Workshop & Unlock Modules 4-5'
            )}
          </button>
          
          {isFinishing && (
            <p className="text-sm text-green-600 mt-3 font-medium">
              🎉 Congratulations! Unlocking your next steps...
            </p>
          )}
        </div>
      </div>


      {/* Footer Note */}
      <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Completing your workshop will unlock Modules 4 & 5 in the navigation menu, 
          giving you access to your Star Card download, holistic report generation, and additional resources. 
          Your workshop responses will be preserved for future reference.
        </p>
      </div>
    </div>
  );
}