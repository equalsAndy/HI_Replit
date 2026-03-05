import React from 'react';
import IA_1_1_Overview from './steps/IA_1_1_Overview';
import IA_1_2_WhatIsImagination from './steps/IA_1_2_WhatIsImagination';
import IA_1_3_ImaginationDeficit from './steps/IA_1_3_ImaginationDeficit';
import IA_1_4_TheBiggerPicture from './steps/IA_1_4_TheBiggerPicture';
import IA_1_5_RealityAndWords from './steps/IA_1_5_RealityAndWords';
import IA_2_1_I4CPrismOverview from './steps/IA_2_1_I4CPrismOverview';
import IA_2_2_SelfAssessment from './steps/IA_2_2_SelfAssessment';
import IA_3_1_LadderOverview from './steps/IA_3_1_LadderOverview';
import IA_3_2_Autoflow from './steps/IA_3_2_Autoflow';
import IA_3_3_VisualizingYourPotential from './steps/IA_3_3_VisualizingYourPotential';
import IA_3_4_FromInsightToIntention from './steps/IA_3_4_FromInsightToIntention';
import IA_3_5_Inspiration from './steps/IA_3_5_Inspiration';
import IA_3_6_TheUnimaginable from './steps/IA_3_6_TheUnimaginable';
import IA_3_7_ModuleReflection from './steps/IA_3_7_ModuleReflection';
import IA_4_1_AdvancedLadderOverview from './steps/IA_4_1_AdvancedLadderOverview';
import IA_4_2_AutoflowMindfulPrompts from './steps/IA_4_2_AutoflowMindfulPrompts';
import IA_4_3_VisualizationStretch from './steps/IA_4_3_VisualizationStretch';
import IA_4_4_HigherPurposeUplift from './steps/IA_4_4_HigherPurposeUplift';
import IA_4_5_InspirationSupport from './steps/IA_4_5_InspirationSupport';
import IA_4_6_NothingIsUnimaginable from './steps/IA_4_6_NothingIsUnimaginable';
import IA_4_7_ModuleReflection from './steps/IA_4_7_ModuleReflection';
import IA_5_1_Overview from './steps/IA_5_1_Overview';
import IA_5_1_Content from './steps/IA_5_1_Content';
import IA_5_2_CapabilityCommitment from './steps/IA_5_2_CapabilityCommitment';
import IA_5_3_MonthlySignal from './steps/IA_5_3_MonthlySignal';
import IA_5_4_HaiQ from './steps/IA_5_4_HaiQ';
import IA_5_5_DevelopmentArc from './steps/IA_5_5_DevelopmentArc';
import IA_6_1_TeamLadder from './steps/IA_6_1_TeamLadder';
import IA_6_2_TeamWhiteboard from './steps/IA_6_2_TeamWhiteboard';
import IA_7_1_NewParadigm from './steps/IA_7_1_NewParadigm';


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
      case 'ia-1-5':
        return <IA_1_5_RealityAndWords onNext={onNext} />;
      case 'ia-2-1':
        return <IA_2_1_I4CPrismOverview onNext={onNext} />;
      case 'ia-2-2':
        return <IA_2_2_SelfAssessment onNext={onNext} onOpenAssessment={onOpenAssessment} />;
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
      {renderStepContent()}
    </div>
  );
};

export default ImaginalAgilityContent;