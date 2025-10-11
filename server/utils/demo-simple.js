import fs from 'fs';
import path from 'path';

// Simple gibberish detection function
function isLikelyGibberish(text) {
  if (!text || text.length < 6) return true;

  const alphaChars = (text.match(/[A-Za-z]/g) || []).length;
  const alphaRatio = alphaChars / text.length;
  if (alphaRatio < 0.6) return true;

  const nonLetterRuns = text.match(/[^A-Za-z\s]{6,}/g);
  if (nonLetterRuns && nonLetterRuns.length > 0) return true;

  const tokens = text.split(/\s+/).filter(token => token.length > 0);
  if (tokens.length >= 10) {
    const avgTokenLength = tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length;
    if (avgTokenLength > 15) return true;
  }

  return false;
}

// Simple JavaScript version for demo purposes
const testyTwoData = {
  "userInfo": {
    "userName": "Testy Two",
    "firstName": "Testy",
    "lastName": "Two"
  },
  "assessments": {
    "starCard": {
      "thinking": 18,
      "feeling": 21,
      "acting": 34,
      "planning": 27
    },
    "flowAssessment": {
      "flowScore": 46
    },
    "flowAttributes": {
      "flowScore": 0,
      "attributes": [
        { "name": "industrious", "order": 1 },
        { "name": "receptive", "order": 2 },
        { "name": "immersed", "order": 3 },
        { "name": "thoughtful", "order": 4 }
      ]
    },
    "stepByStepReflection": {
      "strength1": "I excel at breaking down complex problems into manageable components",
      "strength2": "I thrive when working with passionate, dedicated team members",
      "strength3": "I bring strategic thinking and long-term planning to projects",
      "strength4": "I maintain high standards and attention to detail",
      "teamValues": "Trust, transparency, and mutual respect",
      "uniqueContribution": "Strategic analysis and systems thinking approach"
    },
    "roundingOutReflection": {
      "strengths": "I perform best in quiet, focused environments with minimal interruptions",
      "values": "Constant interruptions, unclear requirements, and rushed deadlines",
      "passions": "Working on meaningful projects that create lasting impact",
      "growthAreas": "Public speaking confidence and presentation skills"
    },
    "cantrilLadder": {
      "wellBeingLevel": 7,
      "futureWellBeingLevel": 9,
      "currentFactors": "Strong work-life balance and supportive team environment",
      "futureImprovements": "Enhanced leadership opportunities and skill development",
      "specificChanges": "Taking on team lead role and completing advanced training",
      "quarterlyProgress": "Complete leadership certification program",
      "quarterlyActions": "Enroll in presentation skills workshop and mentor junior team member"
    },
    "futureSelfReflection": {
      "flowOptimizedLife": "Leading a high-performing, innovative team that delivers exceptional results",
      "futureSelfDescription": "A confident, inspiring leader who empowers others while driving strategic initiatives",
      "visualizationNotes": "Standing confidently before my team, presenting our quarterly achievements",
      "additionalNotes": "Feeling energized by meaningful work and strong team connections",
      "imageData": {
        "selectedImages": [
          {
            "url": "https://example.com/leadership-image.jpg",
            "credit": {
              "photographer": "Professional Photos",
              "source": "Corporate Gallery"
            }
          }
        ],
        "imageMeaning": "This image represents the confident leadership presence I aspire to develop"
      }
    },
    "finalReflection": {
      "futureLetterText": "Dear Future Me, you have grown into the strategic leader you always knew you could become."
    }
  }
};

// Example with gibberish reflections
const gibberishData = {
  "userInfo": {
    "userName": "Gibberish Test",
    "firstName": "Gibberish",
    "lastName": "Test"
  },
  "assessments": {
    "starCard": {
      "thinking": 25,
      "feeling": 25,
      "acting": 25,
      "planning": 25
    },
    "flowAssessment": {
      "flowScore": 32
    },
    "flowAttributes": {
      "flowScore": 0,
      "attributes": [
        { "name": "industrious", "order": 1 },
        { "name": "receptive", "order": 2 },
        { "name": "immersed", "order": 3 },
        { "name": "thoughtful", "order": 4 }
      ]
    },
    "stepByStepReflection": {
      "strength1": "xyzabc123!@#$%^&*()",
      "strength2": "qqqqqqqqqqqqqqqqqqqqq",
      "strength3": "abc",
      "strength4": "normalresponsehere",
      "teamValues": "!!!!!!!!!!!!!!!!!!!!",
      "uniqueContribution": "anothernormalresponse"
    },
    "roundingOutReflection": {
      "strengths": "########",
      "values": "asdfasdfasdfasdfasdfasdfasdfasdf",
      "passions": "b",
      "growthAreas": "validgrowtharea"
    },
    "cantrilLadder": {
      "wellBeingLevel": 5,
      "futureWellBeingLevel": 8,
      "currentFactors": "Some normal text here",
      "futureImprovements": "More normal text",
      "specificChanges": "Specific changes text",
      "quarterlyProgress": "Progress description",
      "quarterlyActions": "Action items"
    },
    "futureSelfReflection": {
      "flowOptimizedLife": "",
      "futureSelfDescription": "",
      "visualizationNotes": "",
      "additionalNotes": "",
      "imageData": {
        "selectedImages": [],
        "imageMeaning": ""
      }
    },
    "finalReflection": {
      "futureLetterText": ""
    }
  }
};

// Simple transformation function (JavaScript version)
function transformStrengths(starCard) {
  if (!starCard) return { leading: [], supporting: [], quieter: [] };

  const entries = Object.entries(starCard).sort(([,a], [,b]) => b - a);
  const result = { leading: [], supporting: [], quieter: [] };

  // Simple distribution - top 1-2 go to leading, middle to supporting, rest to quieter
  const third = Math.ceil(entries.length / 3);

  entries.forEach(([name], index) => {
    if (index < third) {
      result.leading.push(name);
    } else if (index < 2 * third) {
      result.supporting.push(name);
    } else {
      result.quieter.push(name);
    }
  });

  return result;
}

function transformData(data, description) {
  const assessments = data.assessments;
  const strengths = transformStrengths(assessments.starCard);

  // Check for gibberish reflections
  const stepReflections = assessments.stepByStepReflection;
  const roundingOut = assessments.roundingOutReflection;

  const allReflections = [
    stepReflections.strength1,
    stepReflections.strength2,
    stepReflections.strength3,
    stepReflections.strength4,
    stepReflections.teamValues,
    stepReflections.uniqueContribution,
    roundingOut.strengths,
    roundingOut.values,
    roundingOut.passions,
    roundingOut.growthAreas
  ].filter(text => text && text.length > 0);

  const invalidFields = allReflections.filter(isLikelyGibberish);
  const reflections_invalid = allReflections.length > 0 && (invalidFields.length / allReflections.length) >= 0.6;

  const assistantInput = {
    report_type: "personal",
    imagination_mode: "default",
    participant_name: data.userInfo.userName,
    strengths: strengths,
    flow: {
      flowScore: assessments.flowAssessment.flowScore, // 46, not 0 from flowAttributes
      flowAttributes: assessments.flowAttributes.attributes
        .sort((a, b) => a.order - b.order)
        .map(attr => attr.name),
      flowEnablers: [assessments.roundingOutReflection.passions, assessments.roundingOutReflection.strengths].filter(Boolean),
      flowBlockers: [assessments.roundingOutReflection.values].filter(Boolean)
    },
    reflections: {
      strength1: assessments.stepByStepReflection.strength1 || '',
      strength2: assessments.stepByStepReflection.strength2 || '',
      strength3: assessments.stepByStepReflection.strength3 || '',
      strength4: assessments.stepByStepReflection.strength4 || '',
      teamValues: assessments.stepByStepReflection.teamValues || '',
      uniqueContribution: assessments.stepByStepReflection.uniqueContribution || '',
      // Key mappings from roundingOutReflection
      flowNatural: assessments.roundingOutReflection.strengths || '',
      flowBlockers: assessments.roundingOutReflection.values || '', // misleading name, contains blockers
      flowConditions: assessments.roundingOutReflection.passions || '',
      flowOpportunities: assessments.roundingOutReflection.growthAreas || ''
    },
    cantrilLadder: {
      wellBeingLevel: assessments.cantrilLadder.wellBeingLevel || 0,
      futureWellBeingLevel: assessments.cantrilLadder.futureWellBeingLevel || 0,
      currentFactors: assessments.cantrilLadder.currentFactors || '',
      futureImprovements: assessments.cantrilLadder.futureImprovements || '',
      specificChanges: assessments.cantrilLadder.specificChanges || '',
      quarterlyProgress: assessments.cantrilLadder.quarterlyProgress || '',
      quarterlyActions: assessments.cantrilLadder.quarterlyActions || ''
    },
    futureSelf: {
      flowOptimizedLife: assessments.futureSelfReflection.flowOptimizedLife || '',
      futureSelfDescription: assessments.futureSelfReflection.futureSelfDescription || '',
      visualizationNotes: assessments.futureSelfReflection.visualizationNotes || '',
      additionalNotes: assessments.futureSelfReflection.additionalNotes || '',
      selectedImages: (assessments.futureSelfReflection.imageData?.selectedImages || []).map(img => ({
        url: img.url,
        credit: [img.credit?.photographer, img.credit?.source].filter(Boolean).join(', ')
      })),
      imageMeaning: assessments.futureSelfReflection.imageData?.imageMeaning || ''
    },
    finalReflection: {
      keyInsight: assessments.finalReflection.futureLetterText || ''
    }
  };

  console.log('✅ SUCCESSFULLY TRANSFORMED TESTY TWO EXPORT DATA');
  console.log('✅ Key transformations applied:');
  console.log(`   - Flow score: ${assistantInput.flow.flowScore} (from flowAssessment, not flowAttributes)`);
  console.log(`   - Strengths grouped: leading=[${strengths.leading.join(', ')}], supporting=[${strengths.supporting.join(', ')}], quieter=[${strengths.quieter.join(', ')}]`);
  console.log(`   - Images processed: ${assistantInput.futureSelf.selectedImages.length} with credits`);
  console.log(`   - Reflections mapped with correct keys`);
  console.log('');

  console.log('ASSISTANT INPUT JSON (ready for OpenAI API):');
  console.log('===========================================');
  console.log(JSON.stringify(assistantInput, null, 2));

  return assistantInput;
}

// Run the demo
transformDemo();

export { transformDemo };