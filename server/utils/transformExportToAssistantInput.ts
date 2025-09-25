import Ajv from 'ajv';
import outputSchema from './assistantInputSchema.json';

const ajv = new Ajv();
const validateOutput = ajv.compile(outputSchema);

interface ExportData {
  userInfo: {
    userName?: string;
    firstName?: string;
    lastName?: string;
  };
  assessments: {
    starCard: Record<string, number>;
    flowAssessment: {
      flowScore: number;
    };
    flowAttributes: {
      flowScore: number;
      attributes: Array<{ name: string; order: number }>;
    };
    stepByStepReflection: Record<string, string>;
    roundingOutReflection: {
      strengths?: string;
      values?: string;
      passions?: string;
      growthAreas?: string;
    };
    cantrilLadder: {
      wellBeingLevel: number;
      futureWellBeingLevel: number;
      currentFactors: string;
      futureImprovements: string;
      specificChanges: string;
      quarterlyProgress: string;
      quarterlyActions: string;
    };
    futureSelfReflection: {
      flowOptimizedLife: string;
      futureSelfDescription: string;
      visualizationNotes: string;
      additionalNotes: string;
      imageData: {
        selectedImages: Array<{
          url: string;
          credit: {
            photographer?: string;
            source?: string;
          };
        }>;
        imageMeaning: string;
      };
    };
    finalReflection: {
      futureLetterText: string;
    };
  };
}

interface TransformOptions {
  report_type?: "personal" | "sharable";
  imagination_mode?: "default" | "low";
}

interface AssistantInput {
  report_type: "personal" | "sharable";
  imagination_mode: "default" | "low";
  participant_name: string;
  strengths: {
    leading: string[];
    supporting: string[];
    quieter: string[];
  };
  flow: {
    flowScore: number;
    flowAttributes: string[];
    flowEnablers: string[];
    flowBlockers: string[];
  };
  reflections: {
    strength1: string;
    strength2: string;
    strength3: string;
    strength4: string;
    teamValues: string;
    uniqueContribution: string;
    flowNatural: string;
    flowBlockers: string;
    flowConditions: string;
    flowOpportunities: string;
  };
  cantrilLadder: {
    wellBeingLevel: number;
    futureWellBeingLevel: number;
    currentFactors: string;
    futureImprovements: string;
    specificChanges: string;
    quarterlyProgress: string;
    quarterlyActions: string;
  };
  futureSelf: {
    flowOptimizedLife: string;
    futureSelfDescription: string;
    visualizationNotes: string;
    additionalNotes: string;
    selectedImages: Array<{
      url: string;
      credit: string;
    }>;
    imageMeaning: string;
  };
  finalReflection: {
    keyInsight: string;
  };
  reflections_invalid?: boolean;
}

/**
 * Detects if text appears to be gibberish based on multiple criteria
 */
export function isLikelyGibberish(text: string): boolean {
  if (!text || text.length < 6) {
    return true;
  }

  // Check alphabetic ratio
  const alphaChars = text.match(/[A-Za-z]/g)?.length || 0;
  const alphaRatio = alphaChars / text.length;
  if (alphaRatio < 0.6) {
    return true;
  }

  // Check for long runs of non-letters
  const nonLetterRuns = text.match(/[^A-Za-z\s]{6,}/g);
  if (nonLetterRuns && nonLetterRuns.length > 0) {
    return true;
  }

  // Check average token length
  const tokens = text.split(/\s+/).filter(token => token.length > 0);
  if (tokens.length >= 10) {
    const avgTokenLength = tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length;
    if (avgTokenLength > 15) {
      return true;
    }
  }

  return false;
}

/**
 * Transforms star card percentages into relative strength groupings
 */
function transformStrengths(starCard: Record<string, number>): AssistantInput['strengths'] {
  const entries = Object.entries(starCard).sort(([, a], [, b]) => b - a);

  const leading: string[] = [];
  const supporting: string[] = [];
  const quieter: string[] = [];

  if (entries.length === 0) {
    console.warn('No star card data found');
    return { leading, supporting, quieter };
  }

  // Handle ties by grouping same values together
  const groups: Array<{ value: number; names: string[] }> = [];
  let currentGroup = { value: entries[0][1], names: [entries[0][0]] };

  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1] === currentGroup.value) {
      currentGroup.names.push(entries[i][0]);
    } else {
      groups.push(currentGroup);
      currentGroup = { value: entries[i][1], names: [entries[i][0]] };
    }
  }
  groups.push(currentGroup);

  // Distribute into buckets
  const totalItems = entries.length;
  let assigned = 0;

  for (const group of groups) {
    const remaining = totalItems - assigned;
    const leadingNeeded = Math.max(0, Math.ceil(totalItems / 3) - leading.length);
    const supportingNeeded = Math.max(0, Math.ceil(totalItems / 3) - supporting.length);

    if (leadingNeeded > 0 && assigned < totalItems / 3) {
      const toLeading = Math.min(group.names.length, leadingNeeded);
      leading.push(...group.names.slice(0, toLeading));
      if (group.names.length > toLeading) {
        supporting.push(...group.names.slice(toLeading));
      }
    } else if (supportingNeeded > 0 && assigned < 2 * totalItems / 3) {
      supporting.push(...group.names);
    } else {
      quieter.push(...group.names);
    }
    assigned += group.names.length;
  }

  return { leading, supporting, quieter };
}

/**
 * Builds flow enablers and blockers from rounding out reflection
 */
function buildFlowEnablersBlockers(roundingOut: ExportData['assessments']['roundingOutReflection']) {
  const enablers: string[] = [];
  const blockers: string[] = [];

  if (roundingOut.passions) {
    enablers.push(roundingOut.passions);
  }

  if (roundingOut.strengths) {
    // Extract conditions/enablers from strengths text
    enablers.push(roundingOut.strengths);
  }

  // The "values" key often contains blockers despite the name
  if (roundingOut.values) {
    blockers.push(roundingOut.values);
  }

  return { enablers, blockers };
}

/**
 * Main transformation function
 */
export function transformExportToAssistantInput(
  exportJson: ExportData,
  options: TransformOptions = {}
): AssistantInput {
  console.log('🔍 [TRANSFORMER] ========== ENTRY POINT ==========');
  console.log('🔍 [TRANSFORMER] exportJson type:', typeof exportJson);
  console.log('🔍 [TRANSFORMER] exportJson keys:', Object.keys(exportJson || {}));

  if (exportJson?.userInfo) {
    console.log('🔍 [TRANSFORMER] userInfo:', exportJson.userInfo);
  }

  if (exportJson?.assessments) {
    console.log('🔍 [TRANSFORMER] assessments type:', Array.isArray(exportJson.assessments) ? 'ARRAY ❌' : 'OBJECT ✅');
    console.log('🔍 [TRANSFORMER] assessments keys:', Object.keys(exportJson.assessments));

    if (Array.isArray(exportJson.assessments)) {
      console.error('🔍 [TRANSFORMER] ERROR: Received array format! Expected object format.');
      console.error('🔍 [TRANSFORMER] First item:', exportJson.assessments[0]);
    }
  }

  console.log('🔍 [TRANSFORMER] =====================================');
  console.log('Starting transformation of export data to assistant input');

  // Set defaults
  const report_type = options.report_type || "personal";
  const imagination_mode = options.imagination_mode || "default";

  // Extract participant name
  const userInfo = exportJson.userInfo || {};
  const participant_name = userInfo.userName ||
    `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() ||
    'Participant';

  console.log('🔍 [TRANSFORMER] Participant name:', participant_name);

  // Transform strengths
  const strengths = transformStrengths(exportJson.assessments?.starCard || {});
  console.log('🔍 [TRANSFORMER] Leading strengths:', strengths.leading);

  // Get flow score from correct source
  const flowScore = exportJson.assessments?.flowAssessment?.flowScore ||
    exportJson.assessments?.flowAttributes?.flowScore || 0;

  if (exportJson.assessments?.flowAttributes?.flowScore !== undefined &&
      exportJson.assessments?.flowAssessment?.flowScore !== undefined &&
      exportJson.assessments.flowAttributes.flowScore !== exportJson.assessments.flowAssessment.flowScore) {
    console.warn('Using flowAssessment.flowScore over legacy flowAttributes.flowScore');
  }

  // Transform flow attributes
  const flowAttributes = (exportJson.assessments?.flowAttributes?.attributes || [])
    .sort((a, b) => a.order - b.order)
    .map(attr => attr.name);

  // Build flow enablers and blockers
  const { enablers: flowEnablers, blockers: flowBlockers } =
    buildFlowEnablersBlockers(exportJson.assessments?.roundingOutReflection || {});

  // Transform reflections with key mapping
  const stepReflections = exportJson.assessments?.stepByStepReflection || {};
  const roundingOut = exportJson.assessments?.roundingOutReflection || {};

  const reflections = {
    strength1: stepReflections.strength1 || '',
    strength2: stepReflections.strength2 || '',
    strength3: stepReflections.strength3 || '',
    strength4: stepReflections.strength4 || '',
    teamValues: stepReflections.teamValues || '',
    uniqueContribution: stepReflections.uniqueContribution || '',
    flowNatural: roundingOut.strengths || '',
    flowBlockers: roundingOut.values || '', // Misleading name, actually contains blockers
    flowConditions: roundingOut.passions || '',
    flowOpportunities: roundingOut.growthAreas || ''
  };

  // Gibberish detection
  const reflectionFields = Object.values(reflections).filter(val => val.length > 0);
  const invalidFields = reflectionFields.filter(isLikelyGibberish);
  const reflections_invalid = reflectionFields.length > 0 &&
    (invalidFields.length / reflectionFields.length) >= 0.6;

  if (reflections_invalid) {
    console.warn(`Detected mostly gibberish reflections: ${invalidFields.length}/${reflectionFields.length} fields invalid`);
  }

  // Transform cantril ladder
  const cantrilLadder = exportJson.assessments?.cantrilLadder || {};

  // Transform future self
  const futureSelfRefl = exportJson.assessments?.futureSelfReflection || {};
  const imageData = futureSelfRefl.imageData || {};

  const selectedImages = (imageData.selectedImages || []).map(img => ({
    url: img.url,
    credit: [img.credit?.photographer, img.credit?.source].filter(Boolean).join(', ') || ''
  }));

  const futureSelf = {
    flowOptimizedLife: futureSelfRefl.flowOptimizedLife || '',
    futureSelfDescription: futureSelfRefl.futureSelfDescription || '',
    visualizationNotes: futureSelfRefl.visualizationNotes || '',
    additionalNotes: futureSelfRefl.additionalNotes || '',
    selectedImages,
    imageMeaning: imageData.imageMeaning || ''
  };

  // Transform final reflection
  const finalReflection = {
    keyInsight: exportJson.assessments?.finalReflection?.futureLetterText || ''
  };

  // Build result
  const result: AssistantInput = {
    report_type,
    imagination_mode,
    participant_name,
    strengths,
    flow: {
      flowScore,
      flowAttributes,
      flowEnablers,
      flowBlockers
    },
    reflections,
    cantrilLadder: {
      wellBeingLevel: cantrilLadder.wellBeingLevel || 0,
      futureWellBeingLevel: cantrilLadder.futureWellBeingLevel || 0,
      currentFactors: cantrilLadder.currentFactors || '',
      futureImprovements: cantrilLadder.futureImprovements || '',
      specificChanges: cantrilLadder.specificChanges || '',
      quarterlyProgress: cantrilLadder.quarterlyProgress || '',
      quarterlyActions: cantrilLadder.quarterlyActions || ''
    },
    futureSelf,
    finalReflection
  };

  if (reflections_invalid) {
    result.reflections_invalid = true;
  }

  // Validate output
  const valid = validateOutput(result);
  if (!valid) {
    const errors = validateOutput.errors?.map(err =>
      `${err.instancePath}: ${err.message}`
    ).join('; ') || 'Unknown validation error';
    throw new Error(`Assistant input validation failed: ${errors}`);
  }

  console.log('Successfully transformed export data to assistant input');
  return result;
}