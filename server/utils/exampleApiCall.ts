import OpenAI from 'openai';
import { transformExportToAssistantInput } from './transformExportToAssistantInput';

// Example master prompt - replace with your actual assistant instructions
const MASTER_PROMPT = `You are an AI assistant specialized in generating personalized AST (AllStarTeams) reports. You will receive a JSON object containing participant data including strengths, flow assessment, reflections, and future self visualization.

Your task is to create a comprehensive, engaging report that:
1. Analyzes the participant's unique strengths profile
2. Integrates their flow assessment and optimization opportunities
3. Weaves in their personal reflections and future self vision
4. Provides actionable insights for personal and team development

The report should be warm, professional, and highly personalized. Avoid mentioning specific numbers or percentages from the raw data - instead, focus on narrative insights and meaningful patterns.

If you encounter a participant with mostly invalid reflections (indicated by reflections_invalid: true), acknowledge this gracefully and focus more heavily on the strengths and flow data while providing generic but helpful guidance.

Generate the report in markdown format with clear sections and engaging content.`;

interface ApiCallOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Makes an OpenAI API call to generate an AST report with timing information
 */
export async function generateASTReport(
  exportData: any,
  transformOptions: { report_type?: "personal" | "sharable"; imagination_mode?: "default" | "low" } = {},
  apiOptions: ApiCallOptions
): Promise<string> {
  const startTime = Date.now();
  console.log('Starting AST report generation process');

  // Transform the export data to the compact assistant input format
  const transformStartTime = Date.now();
  const assistantInput = transformExportToAssistantInput(exportData, transformOptions);
  const transformDuration = Date.now() - transformStartTime;
  console.log(`Successfully transformed export data to assistant input (${transformDuration}ms)`);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: apiOptions.apiKey,
  });

  try {
    // Make the API call
    const apiStartTime = Date.now();
    const response = await openai.chat.completions.create({
      model: apiOptions.model || 'gpt-4o-mini',
      temperature: apiOptions.temperature || 0.7,
      max_tokens: apiOptions.maxTokens || 4000,
      messages: [
        {
          role: 'system',
          content: MASTER_PROMPT
        },
        {
          role: 'user',
          content: JSON.stringify(assistantInput, null, 2)
        }
      ]
    });
    const apiDuration = Date.now() - apiStartTime;

    const report = response.choices[0]?.message?.content;

    if (!report) {
      throw new Error('No content returned from OpenAI API');
    }

    const totalDuration = Date.now() - startTime;

    // Add timing information to the bottom of the report
    const reportWithTiming = `${report}

---

*Report generated in ${formatDuration(totalDuration)} (Transform: ${formatDuration(transformDuration)}, AI Generation: ${formatDuration(apiDuration)}) using ${apiOptions.model || 'gpt-4o-mini'}*`;

    console.log(`Successfully generated AST report in ${formatDuration(totalDuration)}`);
    return reportWithTiming;

  } catch (error) {
    console.error('Error generating AST report:', error);
    throw new Error(`Failed to generate AST report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Formats duration in milliseconds to a human-readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }
}

/**
 * Example usage with sample data
 */
export async function exampleUsage() {
  // Sample export data (use the "Testy Two" example from your prompt)
  const sampleExportData = {
    userInfo: {
      userName: 'Testy Two',
      firstName: 'Testy',
      lastName: 'Two'
    },
    assessments: {
      starCard: {
        thinking: 18,
        feeling: 21,
        acting: 34,
        planning: 27
      },
      flowAssessment: {
        flowScore: 46
      },
      flowAttributes: {
        flowScore: 0,
        attributes: [
          { name: 'focus', order: 1 },
          { name: 'challenge', order: 2 },
          { name: 'skills', order: 3 }
        ]
      },
      stepByStepReflection: {
        strength1: 'I excel at breaking down complex problems into manageable components',
        strength2: 'I thrive when working with passionate, dedicated team members',
        strength3: 'I bring strategic thinking and long-term planning to projects',
        strength4: 'I maintain high standards and attention to detail',
        teamValues: 'Trust, transparency, and mutual respect',
        uniqueContribution: 'Strategic analysis and systems thinking approach'
      },
      roundingOutReflection: {
        strengths: 'I perform best in quiet, focused environments with minimal interruptions',
        values: 'Constant interruptions, unclear requirements, and rushed deadlines',
        passions: 'Working on meaningful projects that create lasting impact',
        growthAreas: 'Public speaking confidence and presentation skills'
      },
      cantrilLadder: {
        wellBeingLevel: 7,
        futureWellBeingLevel: 9,
        currentFactors: 'Strong work-life balance and supportive team environment',
        futureImprovements: 'Enhanced leadership opportunities and skill development',
        specificChanges: 'Taking on team lead role and completing advanced training',
        quarterlyProgress: 'Complete leadership certification program',
        quarterlyActions: 'Enroll in presentation skills workshop and mentor junior team member'
      },
      futureSelfReflection: {
        flowOptimizedLife: 'Leading a high-performing, innovative team that delivers exceptional results',
        futureSelfDescription: 'A confident, inspiring leader who empowers others while driving strategic initiatives',
        visualizationNotes: 'Standing confidently before my team, presenting our quarterly achievements',
        additionalNotes: 'Feeling energized by meaningful work and strong team connections',
        imageData: {
          selectedImages: [
            {
              url: 'https://example.com/leadership-image.jpg',
              credit: {
                photographer: 'Professional Photos',
                source: 'Corporate Gallery'
              }
            }
          ],
          imageMeaning: 'This image represents the confident leadership presence I aspire to develop'
        }
      },
      finalReflection: {
        futureLetterText: 'Dear Future Me, you have grown into the strategic leader you always knew you could become. Your team trusts your vision and follows your guidance because you have learned to balance high standards with genuine care for people.'
      }
    }
  };

  // Example API call (replace with actual API key)
  try {
    const report = await generateASTReport(
      sampleExportData,
      {
        report_type: 'personal',
        imagination_mode: 'default'
      },
      {
        apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 4000
      }
    );

    console.log('Generated Report:');
    console.log('================');
    console.log(report);
    return report;

  } catch (error) {
    console.error('Example failed:', error);
    throw error;
  }
}

// For testing - show the exact assistant input that would be sent
export function showAssistantInput(exportData: any, options = {}) {
  const assistantInput = transformExportToAssistantInput(exportData, options);
  console.log('Assistant Input JSON:');
  console.log('====================');
  console.log(JSON.stringify(assistantInput, null, 2));
  return assistantInput;
}

// Command line usage example
if (require.main === module) {
  // You can run this file directly to see the example
  console.log('AST Report Generator Example');
  console.log('============================\n');

  // Show the assistant input format
  const sampleData = {
    userInfo: { userName: 'Test User' },
    assessments: {
      starCard: { thinking: 25, feeling: 25, acting: 25, planning: 25 },
      flowAssessment: { flowScore: 50 },
      flowAttributes: { flowScore: 0, attributes: [] },
      stepByStepReflection: {},
      roundingOutReflection: {},
      cantrilLadder: {},
      futureSelfReflection: { imageData: { selectedImages: [] } },
      finalReflection: {}
    }
  };

  showAssistantInput(sampleData);

  console.log('\nTo actually generate a report, set OPENAI_API_KEY and call:');
  console.log('exampleUsage().then(report => console.log(report));');
}