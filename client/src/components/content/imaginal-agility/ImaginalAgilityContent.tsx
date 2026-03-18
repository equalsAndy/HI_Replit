import React, { Suspense } from 'react';

// Module 1
const IA_1_1_Overview = React.lazy(() => import('./steps/IA_1_1_Overview'));
const IA_1_2_WhatIsImagination = React.lazy(() => import('./steps/IA_1_2_WhatIsImagination'));
const IA_1_3_ImaginationDeficit = React.lazy(() => import('./steps/IA_1_3_ImaginationDeficit'));
const IA_1_4_TheBiggerPicture = React.lazy(() => import('./steps/IA_1_4_TheBiggerPicture'));

// Module 2
const IA_2_1_I4CPrismOverview = React.lazy(() => import('./steps/IA_2_1_I4CPrismOverview'));
const IA_2_2_CapabilityDynamics = React.lazy(() => import('./steps/IA_2_2_CapabilityDynamics'));
const IA_2_3_SelfAssessment = React.lazy(() => import('./steps/IA_2_3_SelfAssessment'));

// Module 3
const IA_3_1_LadderOverview = React.lazy(() => import('./steps/IA_3_1_LadderOverview'));
const IA_3_2_Autoflow = React.lazy(() => import('./steps/IA_3_2_Autoflow'));
const IA_3_3_VisualizingYourPotential = React.lazy(() => import('./steps/IA_3_3_VisualizingYourPotential'));
const IA_3_4_FromInsightToIntention = React.lazy(() => import('./steps/IA_3_4_FromInsightToIntention'));
const IA_3_5_Inspiration = React.lazy(() => import('./steps/IA_3_5_Inspiration'));
const IA_3_6_TheUnimaginable = React.lazy(() => import('./steps/IA_3_6_TheUnimaginable'));
const IA_3_7_ModuleReflection = React.lazy(() => import('./steps/IA_3_7_ModuleReflection'));

// Module 4
const IA_4_1_AdvancedLadderOverview = React.lazy(() => import('./steps/IA_4_1_AdvancedLadderOverview'));
const IA_4_2_AutoflowMindfulPrompts = React.lazy(() => import('./steps/IA_4_2_AutoflowMindfulPrompts'));
const IA_4_3_VisualizationStretch = React.lazy(() => import('./steps/IA_4_3_VisualizationStretch'));
const IA_4_4_HigherPurposeUplift = React.lazy(() => import('./steps/IA_4_4_HigherPurposeUplift'));
const IA_4_5_InspirationSupport = React.lazy(() => import('./steps/IA_4_5_InspirationSupport'));
const IA_4_6_NothingIsUnimaginable = React.lazy(() => import('./steps/IA_4_6_NothingIsUnimaginable'));
const IA_4_7_ModuleReflection = React.lazy(() => import('./steps/IA_4_7_ModuleReflection'));

// Module 5
const IA_5_1_Content = React.lazy(() => import('./steps/IA_5_1_Content'));
const IA_5_2_CapabilityCommitment = React.lazy(() => import('./steps/IA_5_2_CapabilityCommitment'));
const IA_5_3_MonthlySignal = React.lazy(() => import('./steps/IA_5_3_MonthlySignal'));
const IA_5_4_HaiQ = React.lazy(() => import('./steps/IA_5_4_HaiQ'));
const IA_5_5_DevelopmentArc = React.lazy(() => import('./steps/IA_5_5_DevelopmentArc'));

// Module 6
const IA_6_1_TeamLadder = React.lazy(() => import('./steps/IA_6_1_TeamLadder'));
const IA_6_2_TeamWhiteboard = React.lazy(() => import('./steps/IA_6_2_TeamWhiteboard'));

// Module 7
const IA_7_1_NewParadigm = React.lazy(() => import('./steps/IA_7_1_NewParadigm'));

const StepFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

interface ImaginalAgilityContentProps {
  stepId: string;
  onNext?: (nextStepId: string) => void;
  onOpenAssessment?: () => void;
  onOpenContactModal?: () => void;
  assessmentResults?: any;
  user?: any;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({ stepId, onNext, onOpenAssessment, onOpenContactModal }) => {
  const renderStepContent = () => {
    switch (stepId) {
      case 'ia-1-1':
        return <IA_1_1_Overview onNext={onNext} />;
      case 'ia-1-2':
        return <IA_1_2_WhatIsImagination onNext={onNext} />;
      case 'ia-1-3':
        return <IA_1_3_ImaginationDeficit onNext={onNext} />;
      case 'ia-1-4':
        return <IA_1_4_TheBiggerPicture onNext={onNext} />;
      case 'ia-2-1':
        return <IA_2_1_I4CPrismOverview onNext={onNext} />;
      case 'ia-2-2':
        return <IA_2_2_CapabilityDynamics onNext={onNext} />;
      case 'ia-2-3':
        return <IA_2_3_SelfAssessment onNext={onNext} onOpenAssessment={onOpenAssessment} />;
      case 'ia-3-1':
        return <IA_3_1_LadderOverview onNext={onNext} />;
      case 'ia-3-2':
        return <IA_3_2_Autoflow onNext={onNext} />;
      case 'ia-3-3':
        return <IA_3_3_VisualizingYourPotential onNext={onNext} />;
      case 'ia-3-4':
        return <IA_3_4_FromInsightToIntention onNext={onNext} />;
      case 'ia-3-5':
        return <IA_3_5_Inspiration onNext={onNext} />;
      case 'ia-3-6':
        return <IA_3_6_TheUnimaginable onNext={onNext} />;
      case 'ia-3-7':
        return <IA_3_7_ModuleReflection onNext={onNext} />;
      case 'ia-4-1':
        return <IA_4_1_AdvancedLadderOverview onNext={onNext} />;
      case 'ia-4-2':
        return <IA_4_2_AutoflowMindfulPrompts onNext={onNext} />;
      case 'ia-4-3':
        return <IA_4_3_VisualizationStretch onNext={onNext} />;
      case 'ia-4-4':
        return <IA_4_4_HigherPurposeUplift onNext={onNext} />;
      case 'ia-4-5':
        return <IA_4_5_InspirationSupport onNext={onNext} />;
      case 'ia-4-6':
        return <IA_4_6_NothingIsUnimaginable onNext={onNext} />;
      case 'ia-4-7':
        return <IA_4_7_ModuleReflection onNext={onNext} />;
      case 'ia-5-1':
        return <IA_5_1_Content onNext={onNext} />;
      case 'ia-5-2':
        return <IA_5_2_CapabilityCommitment onNext={onNext} />;
      case 'ia-5-3':
        return <IA_5_3_MonthlySignal onNext={onNext} />;
      case 'ia-5-4':
        return <IA_5_4_HaiQ onNext={onNext} />;
      case 'ia-5-5':
        return <IA_5_5_DevelopmentArc onNext={onNext} />;
      case 'ia-6-1':
        return <IA_6_1_TeamLadder onNext={onNext} />;
      case 'ia-6-2':
        return <IA_6_2_TeamWhiteboard onNext={onNext} onOpenContactModal={onOpenContactModal} />;
      case 'ia-7-1':
        return <IA_7_1_NewParadigm onNext={onNext} />;
      default:
        return null;
    }
  };

  return (
    <div className="imaginal-agility-content">
      <Suspense fallback={<StepFallback />}>
        {renderStepContent()}
      </Suspense>
    </div>
  );
};

export default ImaginalAgilityContent;
