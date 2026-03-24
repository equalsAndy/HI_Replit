import React, { Suspense } from 'react';

// Module 1
const PM_1_1_Welcome = React.lazy(() => import('./steps/PM_1_1_Welcome'));
const PM_1_2_AboutYou = React.lazy(() => import('./steps/PM_1_2_AboutYou'));
const PM_1_3_EverythingIsAProduct = React.lazy(() => import('./steps/PM_1_3_EverythingIsAProduct'));
const PM_1_4_TheMissingTraining = React.lazy(() => import('./steps/PM_1_4_TheMissingTraining'));
const PM_1_5_WhyNow = React.lazy(() => import('./steps/PM_1_5_WhyNow'));
const PM_1_6_ProductMindsetProfile = React.lazy(() => import('./steps/PM_1_6_ProductMindsetProfile'));
const PM_1_7_StrengthsAndFlow = React.lazy(() => import('./steps/PM_1_7_StrengthsAndFlow'));
const PM_1_8_HumanCapabilities = React.lazy(() => import('./steps/PM_1_8_HumanCapabilities'));

// Module 2
const PM_2_1_HowProductPeopleThink = React.lazy(() => import('./steps/PM_2_1_HowProductPeopleThink'));
const PM_2_2_TheRoleDecomposed = React.lazy(() => import('./steps/PM_2_2_TheRoleDecomposed'));
const PM_2_3_EveryoneIsAPM = React.lazy(() => import('./steps/PM_2_3_EveryoneIsAPM'));
const PM_2_4_NavigatingStakeholders = React.lazy(() => import('./steps/PM_2_4_NavigatingStakeholders'));
const PM_2_5_YourProductTeamWithAI = React.lazy(() => import('./steps/PM_2_5_YourProductTeamWithAI'));
const PM_2_6_AgreeableAssistantTrap = React.lazy(() => import('./steps/PM_2_6_AgreeableAssistantTrap'));

// Module 3
const PM_3_1_QuestionsProductPeopleAsk = React.lazy(() => import('./steps/PM_3_1_QuestionsProductPeopleAsk'));
const PM_3_2_WhatIsAValueProp = React.lazy(() => import('./steps/PM_3_2_WhatIsAValueProp'));
const PM_3_3_InternalVsExternalCustomers = React.lazy(() => import('./steps/PM_3_3_InternalVsExternalCustomers'));
const PM_3_4_DelightVsFriction = React.lazy(() => import('./steps/PM_3_4_DelightVsFriction'));
const PM_3_5_MetricsBeyondRevenue = React.lazy(() => import('./steps/PM_3_5_MetricsBeyondRevenue'));
const PM_3_6_TheDesignSquiggle = React.lazy(() => import('./steps/PM_3_6_TheDesignSquiggle'));
const PM_3_7_SquiggleVariations = React.lazy(() => import('./steps/PM_3_7_SquiggleVariations'));

// Module 4
const PM_4_1_KnowYourUser = React.lazy(() => import('./steps/PM_4_1_KnowYourUser'));
const PM_4_2_FrameTheRealProblem = React.lazy(() => import('./steps/PM_4_2_FrameTheRealProblem'));
const PM_4_3_TranslateAConcept = React.lazy(() => import('./steps/PM_4_3_TranslateAConcept'));
const PM_4_4_PrioritizeWithConstraints = React.lazy(() => import('./steps/PM_4_4_PrioritizeWithConstraints'));
const PM_4_5_TestYourThinking = React.lazy(() => import('./steps/PM_4_5_TestYourThinking'));

// Module 5
const PM_5_1_HowAIUsesContext = React.lazy(() => import('./steps/PM_5_1_HowAIUsesContext'));
const PM_5_2_WritingSystemPrompts = React.lazy(() => import('./steps/PM_5_2_WritingSystemPrompts'));
const PM_5_3_IndividualVsTeamSetup = React.lazy(() => import('./steps/PM_5_3_IndividualVsTeamSetup'));
const PM_5_4_ConfigureAIToChallenge = React.lazy(() => import('./steps/PM_5_4_ConfigureAIToChallenge'));
const PM_5_5_MeetThePMCoach = React.lazy(() => import('./steps/PM_5_5_MeetThePMCoach'));
const PM_5_6_WhatChanged = React.lazy(() => import('./steps/PM_5_6_WhatChanged'));
const PM_5_7_YourActionPlan = React.lazy(() => import('./steps/PM_5_7_YourActionPlan'));

const StepFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
  </div>
);

interface ProductMindsetContentProps {
  stepId: string;
  onNext?: (nextStepId: string) => void;
  user?: any;
}

const ProductMindsetContent: React.FC<ProductMindsetContentProps> = ({ stepId, onNext }) => {
  const renderStepContent = () => {
    switch (stepId) {
      // Module 1
      case 'pm-1-1': return <PM_1_1_Welcome onNext={onNext} />;
      case 'pm-1-2': return <PM_1_2_AboutYou onNext={onNext} />;
      case 'pm-1-3': return <PM_1_3_EverythingIsAProduct onNext={onNext} />;
      case 'pm-1-4': return <PM_1_4_TheMissingTraining onNext={onNext} />;
      case 'pm-1-5': return <PM_1_5_WhyNow onNext={onNext} />;
      case 'pm-1-6': return <PM_1_6_ProductMindsetProfile onNext={onNext} />;
      case 'pm-1-7': return <PM_1_7_StrengthsAndFlow onNext={onNext} />;
      case 'pm-1-8': return <PM_1_8_HumanCapabilities onNext={onNext} />;
      // Module 2
      case 'pm-2-1': return <PM_2_1_HowProductPeopleThink onNext={onNext} />;
      case 'pm-2-2': return <PM_2_2_TheRoleDecomposed onNext={onNext} />;
      case 'pm-2-3': return <PM_2_3_EveryoneIsAPM onNext={onNext} />;
      case 'pm-2-4': return <PM_2_4_NavigatingStakeholders onNext={onNext} />;
      case 'pm-2-5': return <PM_2_5_YourProductTeamWithAI onNext={onNext} />;
      case 'pm-2-6': return <PM_2_6_AgreeableAssistantTrap onNext={onNext} />;
      // Module 3
      case 'pm-3-1': return <PM_3_1_QuestionsProductPeopleAsk onNext={onNext} />;
      case 'pm-3-2': return <PM_3_2_WhatIsAValueProp onNext={onNext} />;
      case 'pm-3-3': return <PM_3_3_InternalVsExternalCustomers onNext={onNext} />;
      case 'pm-3-4': return <PM_3_4_DelightVsFriction onNext={onNext} />;
      case 'pm-3-5': return <PM_3_5_MetricsBeyondRevenue onNext={onNext} />;
      case 'pm-3-6': return <PM_3_6_TheDesignSquiggle onNext={onNext} />;
      case 'pm-3-7': return <PM_3_7_SquiggleVariations onNext={onNext} />;
      // Module 4
      case 'pm-4-1': return <PM_4_1_KnowYourUser onNext={onNext} />;
      case 'pm-4-2': return <PM_4_2_FrameTheRealProblem onNext={onNext} />;
      case 'pm-4-3': return <PM_4_3_TranslateAConcept onNext={onNext} />;
      case 'pm-4-4': return <PM_4_4_PrioritizeWithConstraints onNext={onNext} />;
      case 'pm-4-5': return <PM_4_5_TestYourThinking onNext={onNext} />;
      // Module 5
      case 'pm-5-1': return <PM_5_1_HowAIUsesContext onNext={onNext} />;
      case 'pm-5-2': return <PM_5_2_WritingSystemPrompts onNext={onNext} />;
      case 'pm-5-3': return <PM_5_3_IndividualVsTeamSetup onNext={onNext} />;
      case 'pm-5-4': return <PM_5_4_ConfigureAIToChallenge onNext={onNext} />;
      case 'pm-5-5': return <PM_5_5_MeetThePMCoach onNext={onNext} />;
      case 'pm-5-6': return <PM_5_6_WhatChanged onNext={onNext} />;
      case 'pm-5-7': return <PM_5_7_YourActionPlan onNext={onNext} />;
      default:
        return (
          <div className="p-8 text-center text-gray-500">
            <p>Step content coming soon: {stepId}</p>
          </div>
        );
    }
  };

  return (
    <div className="product-mindset-content">
      <Suspense fallback={<StepFallback />}>
        {renderStepContent()}
      </Suspense>
    </div>
  );
};

export default ProductMindsetContent;
