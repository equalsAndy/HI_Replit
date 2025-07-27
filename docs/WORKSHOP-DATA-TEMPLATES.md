# Workshop Data Export/View Templates

## Overview

This document provides comprehensive templates for displaying both AST (AllStarTeams) and IA (Imaginal Agility) workshop data in exports and data view components. Each field includes a question hint to help identify what should be there.

## AST (AllStarTeams) Workshop Data Template

### Section 1: Introduction & Overview
```
// No data collection in section 1 - videos only
```

### Section 2: Star Strengths Discovery

#### 2-2: Star Strengths Self-Assessment (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'starCard'
interface StarCardData {
  thinking: number;     // "Thinking" strength score (0-100)
  acting: number;       // "Acting" strength score (0-100)  
  feeling: number;      // "Feeling" strength score (0-100)
  planning: number;     // "Planning" strength score (0-100)
}
```

#### 2-4: Strength Reflection (Reflection)
```typescript
// Data stored in workshop_step_data table as step '2-4'
interface ASTStrengthReflectionData {
  strengthReflection: string;    // "Reflect on your top strengths and how they show up"
  strengthExamples: string;      // "Give examples of when you've used these strengths"
  strengthGrowth: string;        // "How could you develop these strengths further?"
}
```

### Section 3: Flow State Discovery

#### 3-2: Flow Assessment (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'flowAssessment'
interface FlowAssessmentData {
  flowScore: number;             // Overall flow score (0-100)
  challenge: number;             // Challenge level rating
  skills: number;                // Skills level rating
  goals: number;                 // Goals clarity rating
  feedback: number;              // Feedback quality rating
  concentration: number;         // Concentration level rating
  control: number;               // Sense of control rating
}
```

#### 3-2: Flow Attributes (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'flowAttributes'
interface FlowAttributesData {
  attributes: string[];          // Selected flow attributes (e.g., ["Focus", "Creativity"])
  flowScore: number;             // Calculated flow score
}
```

#### 3-4: Flow Reflection (Reflection)
```typescript
// Data stored in workshop_step_data table as step '3-4'
interface ASTFlowReflectionData {
  flowReflection: string;        // "When do you experience flow at work?"
  flowBarriers: string;          // "What prevents you from experiencing flow?"
  flowOptimization: string;      // "How could you create more flow opportunities?"
}
```

### Section 4: Well-being & Future Vision

#### 4-1: Cantril Ladder (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'cantrilLadder'
interface CantrilLadderData {
  wellBeingLevel: number;        // "Current well-being level" (1-10)
  futureWellBeingLevel: number;  // "Future well-being level target" (1-10)
}
```

#### 4-1: Cantril Ladder Reflection (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'cantrilLadderReflection'
interface CantrilReflectionData {
  currentFactors: string;        // "What contributes to your current well-being?"
  futureImprovements: string;    // "What would improve your well-being?"
  specificChanges: string;       // "What specific changes would help?"
  quarterlyProgress: string;     // "What progress do you expect this quarter?"
  quarterlyActions: string;      // "What actions will you take this quarter?"
}
```

#### 4-4: Future Self Reflection (Reflection)
```typescript
// Data stored in workshop_step_data table as step '4-4'
interface ASTFutureSelfData {
  futureSelfVision: string;      // "Describe your future self in 2-3 years"
  futureSelfStrengths: string;   // "How will your strengths have evolved?"
  futureSelfGoals: string;       // "What goals will you have achieved?"
  futureSelfContribution: string; // "How will you be contributing to others?"
}
```

#### 4-5: Final Reflection (Reflection)
```typescript
// Data stored in workshop_step_data table as step '4-5'
interface ASTFinalReflectionData {
  keyInsights: string;           // "What are your key insights from this workshop?"
  actionCommitments: string;     // "What specific actions will you commit to?"
  supportNeeded: string;         // "What support do you need to succeed?"
  nextSteps: string;             // "What are your immediate next steps?"
}
```

### Section 4: Step-by-Step Reflection (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'stepByStepReflection'
interface StepByStepReflectionData {
  step1Reflection: string;       // "Reflection on workshop introduction"
  step2Reflection: string;       // "Reflection on strengths discovery"
  step3Reflection: string;       // "Reflection on flow assessment"
  step4Reflection: string;       // "Reflection on well-being ladder"
  overallReflection: string;     // "Overall workshop reflection"
  actionItems: string[];         // "Key action items from workshop"
}
```

---

## IA (Imaginal Agility) Workshop Data Template

### Section 2: The I4C Model

#### ia-2-2: Self-Assessment (Assessment)
```typescript
// Assessment data stored in userAssessments table as 'ia-assessment'
interface IAAssessmentData {
  imagination: number;           // "Imagination capacity" score (0-100)
  innovation: number;            // "Innovation ability" score (0-100)
  intuition: number;             // "Intuition strength" score (0-100)
  inspiration: number;           // "Inspiration level" score (0-100)
}
```

### Section 3: Ladder of Imagination

#### ia-3-2: Autoflow (Interactive)
```typescript
// Data stored in workshop_step_data table as step 'ia-3-2'
interface IA32StepData {
  savedMoments: Array<{         // "Capture moments of autoflow"
    text: string;               // "Describe the moment"
    tag: string;                // "Tag the type" (Surprise, Memory, Anxiety, etc.)
  }>;
  currentMomentText: string;    // Current input (not persisted)
  currentSelectedTag: string;   // Current selection (not persisted)
}
```

#### ia-3-3: Visualizing Your Potential (Interactive)
```typescript
// Data stored in workshop_step_data table as step 'ia-3-3'
interface IA33StepData {
  selectedImage: string | null;  // "Selected image from gallery"
  uploadedImage: string | null;  // "Uploaded custom image"
  reflection: string;            // "What does this image reveal about your creative potential?"
  imageTitle: string;            // "One word to title your image"
}
```

#### ia-3-4: From Insight to Intention (Reflection)
```typescript
// Data stored in workshop_step_data table as step 'ia-3-4'
interface IA34StepData {
  whyReflection: string;         // "Why is this important to you?"
  howReflection: string;         // "How will you approach this?"
  whatReflection: string;        // "What do you envision as the outcome?"
  nextStep: string;              // "What's your immediate next step?"
}
```

#### ia-3-5: Inspiration (Reflection)
```typescript
// Data stored in workshop_step_data table as step 'ia-3-5'
interface IA35StepData {
  inspirationSource: string;     // "What inspires you most?"
  inspirationImpact: string;     // "How does this inspiration affect your work?"
  inspirationBlock: string;      // "What blocks your inspiration?"
  inspirationCultivation: string; // "How can you cultivate more inspiration?"
}
```

#### ia-3-6: The Unimaginable (Interactive)
```typescript
// Data stored in workshop_step_data table as step 'ia-3-6'
interface IA36StepData {
  selectedMystery: string;       // "Selected mystery/paradox to explore"
  visionText: string;            // "Your vision of the unimaginable"
  reflectionText: string;        // "How does this expand your thinking?"
}
```

### Section 4: Advanced Ladder of Imagination

#### ia-4-2: Autoflow Mindful Prompts (Interactive)
```typescript
// Data stored in workshop_step_data table as step 'ia-4-2'
interface IA42StepData {
  challenge: string;             // "Current challenge you're facing"
  aiResponse: string;            // "AI's perspective on the challenge"
  shift: string;                 // "How did the AI perspective shift your thinking?"
  tag: string;                   // "Tag for this insight"
  newPerspective: string;        // "Your new perspective after the shift"
}
```

#### ia-4-3: Visualization Stretch (Interactive)
```typescript
// Data stored in workshop_step_data table as step 'ia-4-3'
interface IA43StepData {
  currentFrame: string;          // "Current way of framing the situation"
  aiStretch: string;             // "AI's stretched perspective"
  stretchVision: string;         // "Your stretched vision"
  resistance: string;            // "What resistance do you feel?"
  stretchName: string;           // "Name for your stretch"
}
```

#### ia-4-4: Higher Purpose Uplift (Reflection)
```typescript
// Data stored in workshop_step_data table as step 'ia-4-4'
interface IA44StepData {
  higherPurpose: string;         // "Your higher purpose or core intention"
  selectedChallenge: string;     // "Selected global challenge to address"
  aiPerspectives: string;        // "AI's three perspectives on the challenge"
  contribution: string;          // "Your small but meaningful contribution"
  bridgeName: string;            // "Name for your bridge contribution"
  scaledContribution: string;    // "How your contribution could scale globally"
}
```

#### ia-4-5: Inspiration Support (Reflection)
```typescript
// Data stored in workshop_step_data table as step 'ia-4-5'
interface IA45StepData {
  interludePatterns: string;     // "Patterns you notice in interludes"
  musePrompt: string;            // "Prompt for your inner muse"
  museConversation: string;      // "Conversation with your muse"
  museName: string;              // "Name for your muse"
}
```

#### ia-4-6: Nothing is Unimaginable (Video + Reflection)
```typescript
// Data stored in workshop_step_data table as step 'ia-4-6'
interface IA46StepData {
  vision: string;                // "Your final vision statement (50 words max)"
  wordCount: number;             // Word count for vision statement
}
```

---

## Export Template Structure

### Complete User Export Template
```typescript
interface CompleteWorkshopExport {
  userInfo: {
    id: number;
    name: string;
    email: string;
    // ... other user fields
  };
  
  // Navigation progress
  navigationProgress: {
    ast?: {
      currentStepId: string;
      completedSteps: string[];
      unlockedSteps: string[];
      videoProgress: Record<string, any>;
    };
    ia?: {
      currentStepId: string;  
      completedSteps: string[];
      unlockedSteps: string[];
      videoProgress: Record<string, any>;
    };
  };
  
  // Assessment results (stored in userAssessments table)
  assessments: {
    // AST Assessments
    starCard?: StarCardData;
    flowAssessment?: FlowAssessmentData;
    flowAttributes?: FlowAttributesData;
    cantrilLadder?: CantrilLadderData;
    cantrilLadderReflection?: CantrilReflectionData;
    stepByStepReflection?: StepByStepReflectionData;
    
    // IA Assessments  
    'ia-assessment'?: IAAssessmentData;
  };
  
  // Workshop step data (stored in workshop_step_data table)
  workshopStepData: {
    ast: {
      // AST step data by step ID
      '2-4'?: ASTStrengthReflectionData;
      '3-4'?: ASTFlowReflectionData;
      '4-4'?: ASTFutureSelfData;
      '4-5'?: ASTFinalReflectionData;
    };
    ia: {
      // IA step data by step ID
      'ia-3-2'?: IA32StepData;
      'ia-3-3'?: IA33StepData;
      'ia-3-4'?: IA34StepData;
      'ia-3-5'?: IA35StepData;
      'ia-3-6'?: IA36StepData;
      'ia-4-2'?: IA42StepData;
      'ia-4-3'?: IA43StepData;
      'ia-4-4'?: IA44StepData;
      'ia-4-5'?: IA45StepData;
      'ia-4-6'?: IA46StepData;
    };
  };
  
  exportMetadata: {
    exportedAt: string;
    exportedBy: string;
    dataVersion: string;
    totalAssessments: number;
    totalWorkshopSteps: number;
  };
}
```

---

## React Component Templates

### Data View Component Template
```tsx
import React from 'react';

interface WorkshopDataViewProps {
  exportData: CompleteWorkshopExport;
}

const WorkshopDataView: React.FC<WorkshopDataViewProps> = ({ exportData }) => {
  const { userInfo, assessments, workshopStepData } = exportData;
  
  return (
    <div className="workshop-data-view">
      <div className="user-header">
        <h1>{userInfo.name}'s Workshop Data</h1>
        <p>Email: {userInfo.email}</p>
      </div>
      
      {/* AST Workshop Data */}
      <section className="ast-workshop">
        <h2>AllStarTeams Workshop</h2>
        
        {/* Assessments */}
        <div className="assessments">
          <h3>Assessments</h3>
          
          {assessments.starCard && (
            <div className="star-card-data">
              <h4>Star Strengths</h4>
              <p><strong>Thinking:</strong> {assessments.starCard.thinking}%</p>
              <p><strong>Acting:</strong> {assessments.starCard.acting}%</p>
              <p><strong>Feeling:</strong> {assessments.starCard.feeling}%</p>
              <p><strong>Planning:</strong> {assessments.starCard.planning}%</p>
            </div>
          )}
          
          {assessments.flowAssessment && (
            <div className="flow-assessment-data">
              <h4>Flow Assessment</h4>
              <p><strong>Overall Flow Score:</strong> {assessments.flowAssessment.flowScore}</p>
              <p><strong>Challenge Level:</strong> {assessments.flowAssessment.challenge}</p>
              <p><strong>Skills Level:</strong> {assessments.flowAssessment.skills}</p>
              {/* ... other flow metrics */}
            </div>
          )}
          
          {assessments.cantrilLadder && (
            <div className="cantril-data">
              <h4>Well-being Ladder</h4>
              <p><strong>Current Level:</strong> {assessments.cantrilLadder.wellBeingLevel}/10</p>
              <p><strong>Future Target:</strong> {assessments.cantrilLadder.futureWellBeingLevel}/10</p>
            </div>
          )}
          
          {assessments.cantrilLadderReflection && (
            <div className="cantril-reflection-data">
              <h4>Well-being Reflections</h4>
              <p><strong>Current Factors:</strong> {assessments.cantrilLadderReflection.currentFactors}</p>
              <p><strong>Future Improvements:</strong> {assessments.cantrilLadderReflection.futureImprovements}</p>
              <p><strong>Quarterly Actions:</strong> {assessments.cantrilLadderReflection.quarterlyActions}</p>
            </div>
          )}
        </div>
        
        {/* Step Data */}
        <div className="step-data">
          <h3>Reflection Responses</h3>
          
          {workshopStepData.ast['2-4'] && (
            <div className="strength-reflection">
              <h4>Strength Reflection (Step 2-4)</h4>
              <p><strong>Strength Reflection:</strong> {workshopStepData.ast['2-4'].strengthReflection}</p>
              <p><strong>Examples:</strong> {workshopStepData.ast['2-4'].strengthExamples}</p>
              <p><strong>Growth Areas:</strong> {workshopStepData.ast['2-4'].strengthGrowth}</p>
            </div>
          )}
          
          {workshopStepData.ast['4-4'] && (
            <div className="future-self">
              <h4>Future Self Vision (Step 4-4)</h4>
              <p><strong>Future Vision:</strong> {workshopStepData.ast['4-4'].futureSelfVision}</p>
              <p><strong>Evolved Strengths:</strong> {workshopStepData.ast['4-4'].futureSelfStrengths}</p>
              <p><strong>Goals Achievement:</strong> {workshopStepData.ast['4-4'].futureSelfGoals}</p>
            </div>
          )}
          
          {workshopStepData.ast['4-5'] && (
            <div className="final-reflection">
              <h4>Final Reflection (Step 4-5)</h4>
              <p><strong>Key Insights:</strong> {workshopStepData.ast['4-5'].keyInsights}</p>
              <p><strong>Action Commitments:</strong> {workshopStepData.ast['4-5'].actionCommitments}</p>
              <p><strong>Next Steps:</strong> {workshopStepData.ast['4-5'].nextSteps}</p>
            </div>
          )}
        </div>
      </section>
      
      {/* IA Workshop Data */}
      <section className="ia-workshop">
        <h2>Imaginal Agility Workshop</h2>
        
        {/* IA Assessment */}
        {assessments['ia-assessment'] && (
          <div className="ia-assessment">
            <h3>I4C Assessment</h3>
            <p><strong>Imagination:</strong> {assessments['ia-assessment'].imagination}%</p>
            <p><strong>Innovation:</strong> {assessments['ia-assessment'].innovation}%</p>
            <p><strong>Intuition:</strong> {assessments['ia-assessment'].intuition}%</p>
            <p><strong>Inspiration:</strong> {assessments['ia-assessment'].inspiration}%</p>
          </div>
        )}
        
        {/* IA Step Data */}
        <div className="ia-step-data">
          <h3>Imaginal Journey Responses</h3>
          
          {workshopStepData.ia['ia-3-2'] && (
            <div className="autoflow-moments">
              <h4>Autoflow Moments (Step 3-2)</h4>
              {workshopStepData.ia['ia-3-2'].savedMoments.map((moment, index) => (
                <div key={index} className="moment">
                  <p><strong>{moment.tag}:</strong> {moment.text}</p>
                </div>
              ))}
            </div>
          )}
          
          {workshopStepData.ia['ia-3-3'] && (
            <div className="visualization">
              <h4>Potential Visualization (Step 3-3)</h4>
              <p><strong>Image Title:</strong> {workshopStepData.ia['ia-3-3'].imageTitle}</p>
              <p><strong>Reflection:</strong> {workshopStepData.ia['ia-3-3'].reflection}</p>
              {workshopStepData.ia['ia-3-3'].selectedImage && (
                <p><strong>Selected Image:</strong> Gallery image</p>
              )}
              {workshopStepData.ia['ia-3-3'].uploadedImage && (
                <p><strong>Custom Image:</strong> User uploaded</p>
              )}
            </div>
          )}
          
          {workshopStepData.ia['ia-3-4'] && (
            <div className="insight-to-intention">
              <h4>From Insight to Intention (Step 3-4)</h4>
              <p><strong>Why Important:</strong> {workshopStepData.ia['ia-3-4'].whyReflection}</p>
              <p><strong>How to Approach:</strong> {workshopStepData.ia['ia-3-4'].howReflection}</p>
              <p><strong>Envisioned Outcome:</strong> {workshopStepData.ia['ia-3-4'].whatReflection}</p>
              <p><strong>Next Step:</strong> {workshopStepData.ia['ia-3-4'].nextStep}</p>
            </div>
          )}
          
          {workshopStepData.ia['ia-4-4'] && (
            <div className="higher-purpose">
              <h4>Higher Purpose Uplift (Step 4-4)</h4>
              <p><strong>Higher Purpose:</strong> {workshopStepData.ia['ia-4-4'].higherPurpose}</p>
              <p><strong>Global Challenge:</strong> {workshopStepData.ia['ia-4-4'].selectedChallenge}</p>
              <p><strong>Your Contribution:</strong> {workshopStepData.ia['ia-4-4'].contribution}</p>
              <p><strong>Bridge Name:</strong> {workshopStepData.ia['ia-4-4'].bridgeName}</p>
              <p><strong>Scaled Impact:</strong> {workshopStepData.ia['ia-4-4'].scaledContribution}</p>
            </div>
          )}
          
          {workshopStepData.ia['ia-4-6'] && (
            <div className="final-vision">
              <h4>Final Vision (Step 4-6)</h4>
              <p><strong>Vision Statement ({workshopStepData.ia['ia-4-6'].wordCount} words):</strong></p>
              <blockquote>{workshopStepData.ia['ia-4-6'].vision}</blockquote>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WorkshopDataView;
```

### Export Utility Functions
```typescript
// Utility functions for exporting data
export const formatWorkshopDataForExport = (exportData: CompleteWorkshopExport) => {
  return {
    // Flatten the data structure for CSV/Excel export
    userId: exportData.userInfo.id,
    userName: exportData.userInfo.name,
    userEmail: exportData.userInfo.email,
    
    // AST Assessment Data
    astThinking: exportData.assessments.starCard?.thinking,
    astActing: exportData.assessments.starCard?.acting,
    astFeeling: exportData.assessments.starCard?.feeling,
    astPlanning: exportData.assessments.starCard?.planning,
    astFlowScore: exportData.assessments.flowAssessment?.flowScore,
    astCurrentWellbeing: exportData.assessments.cantrilLadder?.wellBeingLevel,
    astFutureWellbeing: exportData.assessments.cantrilLadder?.futureWellBeingLevel,
    
    // AST Reflection Data
    astStrengthReflection: exportData.workshopStepData.ast['2-4']?.strengthReflection,
    astFutureSelfVision: exportData.workshopStepData.ast['4-4']?.futureSelfVision,
    astKeyInsights: exportData.workshopStepData.ast['4-5']?.keyInsights,
    astActionCommitments: exportData.workshopStepData.ast['4-5']?.actionCommitments,
    
    // IA Assessment Data
    iaImagination: exportData.assessments['ia-assessment']?.imagination,
    iaInnovation: exportData.assessments['ia-assessment']?.innovation,
    iaIntuition: exportData.assessments['ia-assessment']?.intuition,
    iaInspiration: exportData.assessments['ia-assessment']?.inspiration,
    
    // IA Journey Data
    iaAutoflowMomentsCount: exportData.workshopStepData.ia['ia-3-2']?.savedMoments.length,
    iaVisualizationTitle: exportData.workshopStepData.ia['ia-3-3']?.imageTitle,
    iaWhyImportant: exportData.workshopStepData.ia['ia-3-4']?.whyReflection,
    iaHigherPurpose: exportData.workshopStepData.ia['ia-4-4']?.higherPurpose,
    iaFinalVision: exportData.workshopStepData.ia['ia-4-6']?.vision,
    iaFinalVisionWordCount: exportData.workshopStepData.ia['ia-4-6']?.wordCount,
    
    exportDate: exportData.exportMetadata.exportedAt,
    totalAssessments: exportData.exportMetadata.totalAssessments,
    totalWorkshopSteps: exportData.exportMetadata.totalWorkshopSteps
  };
};

// Generate summary statistics
export const generateWorkshopSummary = (exportData: CompleteWorkshopExport) => {
  return {
    astCompleted: {
      assessments: {
        starCard: !!exportData.assessments.starCard,
        flowAssessment: !!exportData.assessments.flowAssessment,
        cantrilLadder: !!exportData.assessments.cantrilLadder
      },
      reflections: {
        strengthReflection: !!exportData.workshopStepData.ast['2-4'],
        futureSelf: !!exportData.workshopStepData.ast['4-4'],
        finalReflection: !!exportData.workshopStepData.ast['4-5']
      }
    },
    iaCompleted: {
      assessment: !!exportData.assessments['ia-assessment'],
      journeySteps: {
        autoflow: !!exportData.workshopStepData.ia['ia-3-2'],
        visualization: !!exportData.workshopStepData.ia['ia-3-3'],
        insightToIntention: !!exportData.workshopStepData.ia['ia-3-4'],
        higherPurpose: !!exportData.workshopStepData.ia['ia-4-4'],
        finalVision: !!exportData.workshopStepData.ia['ia-4-6']
      }
    }
  };
};
```

---

## Usage Instructions

1. **For Admin Exports**: Use the `CompleteWorkshopExport` interface to structure exported data
2. **For Data Views**: Use the `WorkshopDataView` component as a starting point for displaying user data
3. **For CSV/Excel**: Use `formatWorkshopDataForExport()` to flatten data for spreadsheet export
4. **For Analytics**: Use `generateWorkshopSummary()` to create completion statistics

## Notes

- All data includes question hints in comments to help identify purpose
- Assessment data is stored in `userAssessments` table with specific `assessmentType` values
- Step data is stored in `workshop_step_data` table with workshop type and step ID
- Some steps are video-only and don't collect data
- Data structures match the actual TypeScript interfaces in the codebase
- Export includes metadata for versioning and audit trails