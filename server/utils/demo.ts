import { transformExportToAssistantInput } from './transformExportToAssistantInput';
import testyTwoExport from './__tests__/fixtures/testy_two_export.json';

/**
 * Demonstration script showing the exact transformation of Testy Two export data
 * to the compact assistant input format
 */
function demonstrateTransformation() {
  console.log('AST Report Writer API - Transformation Demo');
  console.log('============================================\n');

  console.log('1. Input: Testy Two Export Data (sample)');
  console.log('   - User: Testy Two');
  console.log('   - Star Card: thinking:18, feeling:21, acting:34, planning:27');
  console.log('   - Flow Score: 46 (from flowAssessment, not legacy flowAttributes:0)');
  console.log('   - Rich reflections with valid content');
  console.log('   - Future self with 2 selected images\n');

  // Transform the data
  const assistantInput = transformExportToAssistantInput(testyTwoExport, {
    report_type: 'personal',
    imagination_mode: 'default'
  });

  console.log('2. Output: Compact Assistant Input');
  console.log('=====================================');
  console.log(JSON.stringify(assistantInput, null, 2));
  console.log('\n');

  console.log('3. Key Transformations Applied:');
  console.log('===============================');
  console.log(`✅ Participant name: "${assistantInput.participant_name}"`);
  console.log(`✅ Strengths grouped by relative position (no numbers):`);
  console.log(`   - Leading: [${assistantInput.strengths.leading.map(s => `"${s}"`).join(', ')}]`);
  console.log(`   - Supporting: [${assistantInput.strengths.supporting.map(s => `"${s}"`).join(', ')}]`);
  console.log(`   - Quieter: [${assistantInput.strengths.quieter.map(s => `"${s}"`).join(', ')}]`);
  console.log(`✅ Flow score: ${assistantInput.flow.flowScore} (from flowAssessment, not flowAttributes)`);
  console.log(`✅ Flow attributes ordered: [${assistantInput.flow.flowAttributes.map(a => `"${a}"`).join(', ')}]`);
  console.log(`✅ Reflections mapped with correct keys:`);
  console.log(`   - flowNatural ← roundingOut.strengths`);
  console.log(`   - flowBlockers ← roundingOut.values (despite name, contains blockers)`);
  console.log(`   - flowConditions ← roundingOut.passions`);
  console.log(`   - flowOpportunities ← roundingOut.growthAreas`);
  console.log(`✅ Images transformed: ${assistantInput.futureSelf.selectedImages.length} images with combined credits`);
  assistantInput.futureSelf.selectedImages.forEach((img, idx) => {
    console.log(`   - Image ${idx + 1}: credit = "${img.credit}"`);
  });
  console.log(`✅ Final reflection: keyInsight ← futureLetterText`);
  console.log(`✅ Gibberish detection: ${assistantInput.reflections_invalid ? 'INVALID' : 'VALID'} reflections`);

  console.log('\n4. API Call Ready:');
  console.log('==================');
  console.log('This object can now be sent to OpenAI with:');
  console.log('```javascript');
  console.log('const messages = [');
  console.log('  { role: "system", content: MASTER_PROMPT },');
  console.log('  { role: "user", content: JSON.stringify(assistantInput) }');
  console.log('];');
  console.log('```\n');

  return assistantInput;
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateTransformation();
}

export { demonstrateTransformation };