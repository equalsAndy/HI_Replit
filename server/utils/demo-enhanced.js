import fs from 'fs';

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

// Simple transformation function
function transformStrengths(starCard) {
  if (!starCard) return { leading: [], supporting: [], quieter: [] };

  const entries = Object.entries(starCard).sort(([,a], [,b]) => b - a);
  const result = { leading: [], supporting: [], quieter: [] };

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

function transformData(data, options = {}) {
  const assessments = data.assessments;
  const strengths = transformStrengths(assessments.starCard);

  // Check for gibberish reflections
  const stepReflections = assessments.stepByStepReflection || {};
  const roundingOut = assessments.roundingOutReflection || {};

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
    report_type: options.report_type || "personal",
    imagination_mode: options.imagination_mode || "default",
    participant_name: data.userInfo?.userName || 'Participant',
    strengths: strengths,
    flow: {
      flowScore: assessments.flowAssessment?.flowScore || assessments.flowAttributes?.flowScore || 0,
      flowAttributes: (assessments.flowAttributes?.attributes || [])
        .sort((a, b) => a.order - b.order)
        .map(attr => attr.name),
      flowEnablers: [roundingOut.passions, roundingOut.strengths].filter(Boolean),
      flowBlockers: [roundingOut.values].filter(Boolean)
    },
    reflections: {
      strength1: stepReflections.strength1 || '',
      strength2: stepReflections.strength2 || '',
      strength3: stepReflections.strength3 || '',
      strength4: stepReflections.strength4 || '',
      teamValues: stepReflections.teamValues || '',
      uniqueContribution: stepReflections.uniqueContribution || '',
      flowNatural: roundingOut.strengths || '',
      flowBlockers: roundingOut.values || '', // misleading name, contains blockers
      flowConditions: roundingOut.passions || '',
      flowOpportunities: roundingOut.growthAreas || ''
    },
    cantrilLadder: {
      wellBeingLevel: assessments.cantrilLadder?.wellBeingLevel || 0,
      futureWellBeingLevel: assessments.cantrilLadder?.futureWellBeingLevel || 0,
      currentFactors: assessments.cantrilLadder?.currentFactors || '',
      futureImprovements: assessments.cantrilLadder?.futureImprovements || '',
      specificChanges: assessments.cantrilLadder?.specificChanges || '',
      quarterlyProgress: assessments.cantrilLadder?.quarterlyProgress || '',
      quarterlyActions: assessments.cantrilLadder?.quarterlyActions || ''
    },
    futureSelf: {
      flowOptimizedLife: assessments.futureSelfReflection?.flowOptimizedLife || '',
      futureSelfDescription: assessments.futureSelfReflection?.futureSelfDescription || '',
      visualizationNotes: assessments.futureSelfReflection?.visualizationNotes || '',
      additionalNotes: assessments.futureSelfReflection?.additionalNotes || '',
      selectedImages: (assessments.futureSelfReflection?.imageData?.selectedImages || []).map(img => ({
        url: img.url,
        credit: [img.credit?.photographer, img.credit?.source].filter(Boolean).join(', ')
      })),
      imageMeaning: assessments.futureSelfReflection?.imageData?.imageMeaning || ''
    },
    finalReflection: {
      keyInsight: assessments.finalReflection?.futureLetterText || ''
    }
  };

  // Add reflections_invalid flag if detected
  if (reflections_invalid) {
    assistantInput.reflections_invalid = true;
  }

  return { assistantInput, invalidFields, allReflections };
}

function demonstrateTransformation() {
  console.log('AST Report Writer API - Enhanced Transformation Demo');
  console.log('====================================================\n');

  // Example 1: Valid reflections (Testy Two)
  const testyTwoData = {
    userInfo: { userName: "Testy Two", firstName: "Testy", lastName: "Two" },
    assessments: {
      starCard: { thinking: 18, feeling: 21, acting: 34, planning: 27 },
      flowAssessment: { flowScore: 46 },
      flowAttributes: {
        flowScore: 0,
        attributes: [
          { name: "industrious", order: 1 },
          { name: "receptive", order: 2 },
          { name: "immersed", order: 3 },
          { name: "thoughtful", order: 4 }
        ]
      },
      stepByStepReflection: {
        strength1: "I excel at breaking down complex problems into manageable components",
        strength2: "I thrive when working with passionate, dedicated team members",
        strength3: "I bring strategic thinking and long-term planning to projects",
        strength4: "I maintain high standards and attention to detail",
        teamValues: "Trust, transparency, and mutual respect",
        uniqueContribution: "Strategic analysis and systems thinking approach"
      },
      roundingOutReflection: {
        strengths: "I perform best in quiet, focused environments with minimal interruptions",
        values: "Constant interruptions, unclear requirements, and rushed deadlines",
        passions: "Working on meaningful projects that create lasting impact",
        growthAreas: "Public speaking confidence and presentation skills"
      },
      cantrilLadder: {
        wellBeingLevel: 7,
        futureWellBeingLevel: 9,
        currentFactors: "Strong work-life balance and supportive team environment",
        futureImprovements: "Enhanced leadership opportunities and skill development",
        specificChanges: "Taking on team lead role and completing advanced training",
        quarterlyProgress: "Complete leadership certification program",
        quarterlyActions: "Enroll in presentation skills workshop and mentor junior team member"
      },
      futureSelfReflection: {
        flowOptimizedLife: "Leading a high-performing, innovative team that delivers exceptional results",
        futureSelfDescription: "A confident, inspiring leader who empowers others while driving strategic initiatives",
        visualizationNotes: "Standing confidently before my team, presenting our quarterly achievements",
        additionalNotes: "Feeling energized by meaningful work and strong team connections",
        imageData: {
          selectedImages: [{
            url: "https://example.com/leadership-image.jpg",
            credit: { photographer: "Professional Photos", source: "Corporate Gallery" }
          }],
          imageMeaning: "This image represents the confident leadership presence I aspire to develop"
        }
      },
      finalReflection: {
        futureLetterText: "Dear Future Me, you have grown into the strategic leader you always knew you could become."
      }
    }
  };

  // Example 2: Gibberish reflections
  const gibberishData = {
    userInfo: { userName: "Gibberish Test", firstName: "Gibberish", lastName: "Test" },
    assessments: {
      starCard: { thinking: 25, feeling: 25, acting: 25, planning: 25 },
      flowAssessment: { flowScore: 32 },
      flowAttributes: {
        flowScore: 0,
        attributes: [
          { name: "industrious", order: 1 },
          { name: "receptive", order: 2 },
          { name: "immersed", order: 3 },
          { name: "thoughtful", order: 4 }
        ]
      },
      stepByStepReflection: {
        strength1: "xyzabc123!@#$%^&*()",
        strength2: "qqqqqqqqqqqqqqqqqqqqq",
        strength3: "abc",
        strength4: "normalresponsehere",
        teamValues: "!!!!!!!!!!!!!!!!!!!!",
        uniqueContribution: "12345!@#$%"
      },
      roundingOutReflection: {
        strengths: "########",
        values: "asdfasdfasdfasdfasdfasdfasdfasdf",
        passions: "!!!!",
        growthAreas: "validgrowtharea"
      },
      cantrilLadder: {
        wellBeingLevel: 5,
        futureWellBeingLevel: 8,
        currentFactors: "Some normal text here",
        futureImprovements: "More normal text",
        specificChanges: "Specific changes text",
        quarterlyProgress: "Progress description",
        quarterlyActions: "Action items"
      },
      futureSelfReflection: {
        flowOptimizedLife: "",
        futureSelfDescription: "",
        visualizationNotes: "",
        additionalNotes: "",
        imageData: { selectedImages: [], imageMeaning: "" }
      },
      finalReflection: { futureLetterText: "" }
    }
  };

  // Process both examples
  console.log('🟢 EXAMPLE 1: Valid Reflections (Testy Two)');
  console.log('============================================');

  const { assistantInput: validInput, invalidFields: validInvalid, allReflections: validAll } = transformData(testyTwoData);

  console.log(`✅ Participant: "${validInput.participant_name}"`);
  console.log(`✅ Flow score: ${validInput.flow.flowScore} (from flowAssessment, not flowAttributes:0)`);
  console.log(`✅ Flow attributes: [${validInput.flow.flowAttributes.map(a => `"${a}"`).join(', ')}] (real values from export)`);
  console.log(`✅ Strengths: leading=[${validInput.strengths.leading.join(', ')}], supporting=[${validInput.strengths.supporting.join(', ')}], quieter=[${validInput.strengths.quieter.join(', ')}]`);
  console.log(`✅ Gibberish detection: ${validInvalid.length}/${validAll.length} invalid fields → reflections_invalid: ${validInput.reflections_invalid || 'undefined'}`);
  console.log(`✅ Complete Cantril Ladder: wellBeing=${validInput.cantrilLadder.wellBeingLevel}, future=${validInput.cantrilLadder.futureWellBeingLevel}, quarterly actions included`);
  console.log(`✅ Empty strings preserved: futureSelf fields include all keys even when empty`);

  console.log('\n🔴 EXAMPLE 2: Gibberish Reflections');
  console.log('===================================');

  const { assistantInput: gibberishInput, invalidFields: gibInvalid, allReflections: gibAll } = transformData(gibberishData);

  console.log(`✅ Participant: "${gibberishInput.participant_name}"`);
  console.log(`✅ Flow score: ${gibberishInput.flow.flowScore} (different from example 1)`);
  console.log(`✅ Flow attributes: [${gibberishInput.flow.flowAttributes.map(a => `"${a}"`).join(', ')}] (same real values)`);
  console.log(`✅ Tied strengths: [${gibberishInput.strengths.leading.join(', ')}] all distributed fairly`);
  console.log(`⚠️  Gibberish detection: ${gibInvalid.length}/${gibAll.length} invalid fields → reflections_invalid: ${gibberishInput.reflections_invalid}`);
  console.log(`✅ Empty strings preserved: all futureSelf fields are empty strings, not omitted`);

  console.log('\n📋 SAMPLE OUTPUT WITH reflections_invalid FLAG:');
  console.log('===============================================');
  console.log(JSON.stringify(gibberishInput, null, 2));

  return { validInput, gibberishInput };
}

// Run the demo
demonstrateTransformation();

export { demonstrateTransformation, transformData };