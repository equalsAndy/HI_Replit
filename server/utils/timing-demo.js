import { transformExportToAssistantInput } from './transformExportToAssistantInput.js';

// Mock example to show timing without actual API call
function mockGenerateReport(exportData, options = {}) {
  const startTime = Date.now();
  console.log('Starting AST report generation process');

  // Transform timing
  const transformStartTime = Date.now();
  const assistantInput = transformExportToAssistantInput(exportData, options);
  const transformDuration = Date.now() - transformStartTime;
  console.log(`Successfully transformed export data to assistant input (${transformDuration}ms)`);

  // Simulate API call timing
  const apiStartTime = Date.now();

  // Mock AI-generated report content
  const mockReport = `# Your AST Personal Development Report

## Executive Summary
Based on your comprehensive AST assessment, you demonstrate a strong action-oriented approach with excellent planning capabilities. Your leadership potential shines through your strategic thinking and attention to detail.

## Strengths Profile
Your primary strengths center around **acting** and **planning** - a powerful combination that positions you as someone who can both envision strategic direction and execute with precision.

### Leading Strengths
- **Acting**: You excel at taking initiative and driving projects forward
- **Planning**: Strategic thinking and long-term vision are your hallmarks

### Supporting Strengths
- **Feeling**: Strong emotional intelligence supports your leadership
- **Thinking**: Analytical capabilities complement your action orientation

## Flow Optimization
Your flow score of 46 indicates significant room for growth in achieving optimal performance states. You perform best when:

- Working on meaningful projects that create lasting impact
- Operating in quiet, focused environments with minimal interruptions

### Growth Opportunities
Focus on developing public speaking confidence and presentation skills to maximize your leadership impact.

## Future Vision
Your aspiration to become "a confident, inspiring leader who empowers others while driving strategic initiatives" aligns perfectly with your natural strengths profile.

## Recommendations
1. Leverage your planning strengths to create structured development paths
2. Use your action orientation to drive continuous improvement
3. Focus on presentation skills to amplify your leadership voice

---

*This report represents your unique AST profile and provides a foundation for continued growth and development.*`;

  // Simulate API delay (would be actual OpenAI call time)
  const simulatedApiDuration = 2500 + Math.random() * 2000; // 2.5-4.5 seconds

  const apiDuration = Date.now() - apiStartTime + simulatedApiDuration;
  const totalDuration = Date.now() - startTime + simulatedApiDuration;

  // Format duration helper
  function formatDuration(ms) {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(1);
      return `${minutes}m ${seconds}s`;
    }
  }

  // Add timing information to the bottom of the report
  const reportWithTiming = `${mockReport}

---

*Report generated in ${formatDuration(totalDuration)} (Transform: ${formatDuration(transformDuration)}, AI Generation: ${formatDuration(apiDuration)}) using gpt-4o-mini*`;

  console.log(`Successfully generated AST report in ${formatDuration(totalDuration)}`);
  return reportWithTiming;
}

// Demo data
const demoData = {
  userInfo: { userName: "Demo User" },
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
      strength1: "I excel at breaking down complex problems",
      strength2: "I thrive with passionate team members",
      teamValues: "Trust and transparency",
      uniqueContribution: "Strategic analysis"
    },
    roundingOutReflection: {
      strengths: "I perform best in quiet environments",
      values: "Interruptions and unclear requirements",
      passions: "Working on meaningful projects",
      growthAreas: "Public speaking confidence"
    },
    cantrilLadder: {
      wellBeingLevel: 7,
      futureWellBeingLevel: 9,
      currentFactors: "Good work-life balance",
      futureImprovements: "Better career growth"
    },
    futureSelfReflection: {
      flowOptimizedLife: "Leading a high-performing team",
      futureSelfDescription: "Confident and inspiring leader",
      imageData: { selectedImages: [], imageMeaning: "" }
    },
    finalReflection: {
      futureLetterText: "Dear future me, you have grown into the leader you always wanted to be."
    }
  }
};

// Run the demo
console.log('AST Report Timing Demo');
console.log('======================\n');

const report = mockGenerateReport(demoData, {
  report_type: 'personal',
  imagination_mode: 'default'
});

console.log('\n📄 GENERATED REPORT WITH TIMING:');
console.log('=================================');
console.log(report);

export { mockGenerateReport };