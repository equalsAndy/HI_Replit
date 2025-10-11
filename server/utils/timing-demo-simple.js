// Simple timing demo that shows how timing information appears in generated reports

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

function demonstrateTiming() {
  console.log('AST Report Timing Demo');
  console.log('======================\n');

  // Simulate actual timing scenarios
  const scenarios = [
    { name: 'Fast Generation', transform: 8, api: 1247, total: 1255 },
    { name: 'Typical Generation', transform: 12, api: 3156, total: 3168 },
    { name: 'Slower Generation', transform: 15, api: 7842, total: 7857 },
    { name: 'Complex Report', transform: 23, api: 12456, total: 12479 }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log('   ' + '-'.repeat(scenario.name.length + 3));

    // Mock report content
    const mockReport = `# Your AST Personal Development Report

## Executive Summary
Based on your comprehensive AST assessment, you demonstrate strong leadership potential with a balanced approach to strategic thinking and execution.

[... report content continues ...]

## Key Insights
- Your action-oriented strengths position you well for leadership roles
- Flow optimization opportunities exist in creating focused work environments
- Future vision aligns with natural capabilities

## Recommendations
1. Continue developing presentation and communication skills
2. Leverage planning strengths for strategic initiatives
3. Create structured environments that support your flow state

---

*This personalized report provides insights for your continued growth and development journey.*`;

    // Add timing footer
    const reportWithTiming = `${mockReport}

---

*Report generated in ${formatDuration(scenario.total)} (Transform: ${formatDuration(scenario.transform)}, AI Generation: ${formatDuration(scenario.api)}) using gpt-4o-mini*`;

    console.log(`   Transform: ${formatDuration(scenario.transform)}`);
    console.log(`   AI Generation: ${formatDuration(scenario.api)}`);
    console.log(`   Total: ${formatDuration(scenario.total)}`);
    console.log(`   Model: gpt-4o-mini`);
    console.log('');

    if (index === 1) { // Show full report for typical scenario
      console.log('📄 SAMPLE REPORT OUTPUT (Typical Generation):');
      console.log('==============================================');
      console.log(reportWithTiming);
      console.log('\n' + '='.repeat(50) + '\n');
    }
  });

  console.log('⏱️  TIMING INSIGHTS:');
  console.log('==================');
  console.log('• Transform time is consistently fast (<25ms)');
  console.log('• AI generation dominates total time (95%+ of duration)');
  console.log('• Typical reports generate in 2-8 seconds');
  console.log('• Model choice affects generation speed');
  console.log('• Timing helps users understand performance characteristics');
  console.log('\n✅ All reports automatically include timing footer for transparency!');
}

// Run the demo
demonstrateTiming();

export { demonstrateTiming, formatDuration };