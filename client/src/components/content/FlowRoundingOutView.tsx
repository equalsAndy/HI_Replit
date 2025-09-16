import React, { useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ContentViewProps } from '../../shared/types';
import { Check, ChevronRight, Edit } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import { useFloatingAI } from '@/components/ai/FloatingAIProvider';
import AstLessonContent from '@/components/ast/AstLessonContentPilot';
import FlowReflections from './FlowReflections';

const FlowRoundingOutView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const { astCompleted: workshopCompleted } = useWorkshopStatus();
  const { updateContext, setCurrentStep: setFloatingAIStep } = useFloatingAI();

  // Set up FloatingAI context for step 2-3
  useEffect(() => {
    setFloatingAIStep('2-3');
    updateContext({
      stepName: 'Flow Reflection - Rounding Out',
      aiEnabled: true,
      questionText: undefined,
      strengthLabel: undefined,
      workshopContext: {
        currentStep: '2-3',
        stepName: 'Flow Reflection - Rounding Out Your Understanding',
        previousSteps: [
          'Completed strengths assessment and discovered your Star Card',
          'Explored individual strengths in detail through reflection',
          'Learned about Flow states and completed Flow assessment'
        ],
        currentTask: 'Reflecting on personal flow experiences and creating action plans'
      }
    });
  }, [updateContext, setFloatingAIStep]);

  // TEMPORARY: Force show reflections for testing enhanced UI
  const forceShowReflections = true;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Rounding Out: Flow State Mastery
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Now that you've completed the flow assessment, take some time to round out your understanding 
          of flow and how you can create more opportunities for it in your work and life.
        </p>
      </div>

      {/* Workshop Completion Banner */}
      {workshopCompleted && !forceShowReflections && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">
                Workshop complete. Your responses are locked, but you can watch videos and read your answers.
              </h3>
            </div>
            <div className="text-green-600">
              🔒
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY: Testing Banner */}
      {workshopCompleted && forceShowReflections && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Edit className="text-blue-600" size={20} />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">
                🧪 Testing Mode: Enhanced FlowReflections with expandable sections and improved typography
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="mb-8">
        <AstLessonContent stepId="2-3" />
      </div>

      {/* Flow Principles Cards */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 h-full">
            <h3 className="font-medium text-indigo-800 mb-3 flex items-center">
              <Edit className="h-4 w-4 mr-2 text-indigo-600" />
              Flow State Key Principles
            </h3>
            <ul className="space-y-2 text-indigo-700 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Clear goals</strong> - Know exactly what you need to accomplish</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Balance of challenge & skill</strong> - Not too easy, not too hard</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Immediate feedback</strong> - Know how you're performing as you go</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Deep concentration</strong> - Full attention on the task at hand</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Intrinsic motivation</strong> - Driven by personal satisfaction and growth</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="bg-green-50 p-5 rounded-lg border border-green-100 h-full">
            <h3 className="font-medium text-green-800 mb-3 flex items-center">
              <ChevronRight className="h-4 w-4 mr-2 text-green-600" />
              Creating Flow at Work
            </h3>
            <ul className="space-y-2 text-green-700 text-sm">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Time blocking</strong> - Schedule uninterrupted focus periods</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Environment design</strong> - Minimize distractions and interruptions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Right-sized challenges</strong> - Match tasks to your current skill level</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Progress tracking</strong> - Build in regular feedback loops</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span><strong>Energy management</strong> - Work during your peak performance hours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reflections Header */}
      {(!workshopCompleted || forceShowReflections) && (
        <div className="section-headers-tabs-60 mb-4">
          <div className="section-headers-pill-60 section-headers-pill-60--reflection">
            <div className="section-headers-pill-60__strip" aria-hidden="true" />
            <div className="section-headers-pill-60__box">🤔 Reflections</div>
          </div>
        </div>
      )}

      {/* Progressive Flow Reflections - FORCE SHOW FOR TESTING */}
      {(!workshopCompleted || forceShowReflections) && (
        <FlowReflections
          onComplete={() => {
            // This will be handled by the FlowReflections component
            // It saves all data and navigates to module-2-recap
          }}
          setCurrentContent={setCurrentContent}
          markStepCompleted={markStepCompleted}
        />
      )}

      {/* Show completed message if workshop is done */}
      {workshopCompleted && !forceShowReflections && (
        <div className="text-center py-12">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Flow Reflections Complete
            </h3>
            <p className="text-green-700">
              Your flow reflections have been completed and saved. 
              You can review your responses in your holistic report.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FlowRoundingOutView;
