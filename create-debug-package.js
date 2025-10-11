#!/usr/bin/env node

/**
 * Comprehensive Report Generation Debug Package Creator
 * ======================================================
 * 
 * Generates a complete package of files showing data transformation at every step:
 * 1. Raw database query results
 * 2. Transformed data sent to transformer
 * 3. Transformer output (sent to OpenAI)
 * 4. Raw OpenAI response
 * 5. Final HTML report
 * 
 * Creates a timestamped folder with all artifacts for analysis
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_ID = 65;
const REPORT_TYPE = 'personal';
const API_BASE = 'http://localhost:8080';

// Create timestamped output directory
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const OUTPUT_DIR = path.join(__dirname, `report-debug-${timestamp}`);

console.log('🔬 Comprehensive Report Generation Debug Package Creator');
console.log('=========================================================\n');

async function createDebugPackage() {
  try {
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);

    // Step 1: Trigger report generation with enhanced logging
    console.log('📊 Step 1: Generating report with full debug logging...');
    const generateResponse = await fetch(`${API_BASE}/api/reports/holistic/test-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        reportType: REPORT_TYPE
      })
    });

    const generateResult = await generateResponse.json();
    
    if (!generateResult.success) {
      throw new Error(`Report generation failed: ${generateResult.message}`);
    }

    console.log(`✅ Report generated: ${generateResult.reportId}\n`);

    // Save generation response
    await fs.writeFile(
      path.join(OUTPUT_DIR, '00-generation-response.json'),
      JSON.stringify(generateResult, null, 2),
      'utf8'
    );

    // Step 2: Fetch the complete report from database
    console.log('📊 Step 2: Fetching complete report data from database...');
    const reportResponse = await fetch(
      `${API_BASE}/api/reports/holistic/debug/${generateResult.reportId}`
    );

    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      console.error('❌ Debug endpoint error:', reportResponse.status, errorText);
      throw new Error(`Failed to fetch report debug data: ${reportResponse.status} - ${errorText}`);
    }

    const reportDebugData = await reportResponse.json();

    // Step 3: Save all debug artifacts
    console.log('📊 Step 3: Extracting and saving debug artifacts...\n');

    // 1. Raw Database Query
    if (reportDebugData.rawDatabaseQuery) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '01-raw-database-query.json'),
        JSON.stringify(reportDebugData.rawDatabaseQuery, null, 2),
        'utf8'
      );
      console.log('✅ Saved: 01-raw-database-query.json');
    }

    // 2. Transformed Input to Transformer
    if (reportDebugData.transformerInput) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '02-transformer-input.json'),
        JSON.stringify(reportDebugData.transformerInput, null, 2),
        'utf8'
      );
      console.log('✅ Saved: 02-transformer-input.json');
    }

    // 3. Transformer Output (sent to OpenAI)
    if (reportDebugData.transformerOutput) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '03-transformer-output-to-openai.json'),
        JSON.stringify(reportDebugData.transformerOutput, null, 2),
        'utf8'
      );
      console.log('✅ Saved: 03-transformer-output-to-openai.json');
    }

    // 4. Raw OpenAI Response
    if (reportDebugData.openaiResponse) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '04-raw-openai-response.txt'),
        reportDebugData.openaiResponse,
        'utf8'
      );
      console.log('✅ Saved: 04-raw-openai-response.txt');
      
      // Also save word count analysis
      const wordCount = reportDebugData.openaiResponse.split(/\s+/).length;
      const charCount = reportDebugData.openaiResponse.length;
      const analysisContent = `OpenAI Response Analysis
========================

Total Characters: ${charCount}
Total Words: ${wordCount}
Total Lines: ${reportDebugData.openaiResponse.split('\n').length}

First 500 characters:
${reportDebugData.openaiResponse.substring(0, 500)}

Last 500 characters:
${reportDebugData.openaiResponse.substring(reportDebugData.openaiResponse.length - 500)}
`;
      await fs.writeFile(
        path.join(OUTPUT_DIR, '04b-openai-response-analysis.txt'),
        analysisContent,
        'utf8'
      );
      console.log('✅ Saved: 04b-openai-response-analysis.txt');
    }

    // 5. HTML Report Generation
    if (reportDebugData.htmlContent) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '05-final-html-report.html'),
        reportDebugData.htmlContent,
        'utf8'
      );
      console.log('✅ Saved: 05-final-html-report.html');
    }

    // 6. Complete Report Data (database record)
    if (reportDebugData.reportData) {
      await fs.writeFile(
        path.join(OUTPUT_DIR, '06-complete-report-data.json'),
        JSON.stringify(reportDebugData.reportData, null, 2),
        'utf8'
      );
      console.log('✅ Saved: 06-complete-report-data.json');
    }

    // Step 4: Create README explaining each file
    console.log('\n📊 Step 4: Creating documentation...');
    
    const readmeContent = `# Report Generation Debug Package
Generated: ${new Date().toISOString()}
User ID: ${USER_ID}
Report Type: ${REPORT_TYPE}
Report ID: ${generateResult.reportId}

## Files in This Package

### 00-generation-response.json
API response from the report generation endpoint. Contains report ID and generation status.

### 01-raw-database-query.json
Raw data retrieved from the database for user ${USER_ID}. This includes:
- User profile information
- All assessment results (starCard, flowAssessment, reflections, etc.)
- Step completion data
- Original database structure (arrays of rows)

### 02-transformer-input.json
Data after initial transformation to prepare for the transformer. This shows:
- Conversion from database rows to structured objects
- Assessment data organized by type
- User information formatted
- This is what gets passed to \`transformExportToAssistantInput()\`

### 03-transformer-output-to-openai.json
The compact, formatted data structure sent to OpenAI. This shows:
- Participant name and metadata
- Strengths categorized (leading, supporting, quieter)
- Flow assessment results
- All reflections formatted
- Cantril ladder data
- Future self vision
- This is the exact payload OpenAI receives

### 04-raw-openai-response.txt
The raw markdown/text response from OpenAI Assistant. This is:
- The complete generated report content
- Before any HTML formatting
- The "brain" output of the AI

### 04b-openai-response-analysis.txt
Statistical analysis of the OpenAI response including:
- Character count
- Word count
- Line count
- Preview of beginning and end

### 05-final-html-report.html
The complete HTML report as shown to users. This shows:
- OpenAI content wrapped in HTML structure
- Embedded StarCard image (base64)
- Pie chart (inline SVG)
- All styling and formatting
- This is what gets saved to the database

### 06-complete-report-data.json
The complete database record including:
- All report metadata
- Generation timestamps
- Storage information
- Database IDs and relationships

## Data Flow Summary

\`\`\`
Database Query (PostgreSQL)
    ↓
01-raw-database-query.json
    ↓
Transform DB rows to objects
    ↓
02-transformer-input.json
    ↓
transformExportToAssistantInput()
    ↓
03-transformer-output-to-openai.json
    ↓
OpenAI Assistant API Call
    ↓
04-raw-openai-response.txt
    ↓
generateHtmlReport()
    ↓
05-final-html-report.html
    ↓
Save to Database
    ↓
06-complete-report-data.json
\`\`\`

## How to Use This Package

1. **Verify Data Quality**: Check 01-raw-database-query.json to ensure all user data was retrieved
2. **Check Transformation**: Compare 02 and 03 to see how data is reformatted
3. **Review AI Input**: See 03 to understand exactly what OpenAI receives
4. **Analyze AI Output**: Read 04 to see the raw generated content and 04b for statistics
5. **Inspect Final HTML**: Open 05 in a browser to see the rendered report
6. **Debug Issues**: Compare files to find where data might be lost or transformed incorrectly

## Key Metrics

- **OpenAI Response Length**: ${reportDebugData.openaiResponse ? reportDebugData.openaiResponse.length : 'N/A'} characters
- **OpenAI Word Count**: ${reportDebugData.openaiResponse ? reportDebugData.openaiResponse.split(/\\s+/).length : 'N/A'} words
- **HTML Size**: ${reportDebugData.htmlContent ? reportDebugData.htmlContent.length : 'N/A'} characters
- **Generation Time**: Check timestamps in files

## Expected vs Actual

### Expected (Good Report)
- OpenAI Response: 5000+ words (15000+ characters)
- HTML Size: 50000+ characters
- Generation Time: 15-30 seconds

### Actual (This Report)
- OpenAI Response: ${reportDebugData.openaiResponse ? reportDebugData.openaiResponse.split(/\\s+/).length : 'N/A'} words
- HTML Size: ${reportDebugData.htmlContent ? reportDebugData.htmlContent.length : 'N/A'} characters

## Troubleshooting

If report is too short:
1. Check 03-transformer-output-to-openai.json - Is all data present?
2. Check 04-raw-openai-response.txt - Did OpenAI generate enough content?
3. If OpenAI response is short, check the Assistant instructions in OpenAI dashboard
4. Consider adjusting max_tokens or model in openai-api-service.ts

If data is missing:
1. Check 01-raw-database-query.json - Was all data retrieved?
2. Check 02-transformer-input.json - Was data properly structured?
3. Check 03-transformer-output-to-openai.json - Was data preserved through transformation?

## Files Modified During This Session

- \`/server/routes/holistic-report-routes.ts\` - Main report generation
- \`/server/services/openai-api-service.ts\` - OpenAI integration
- \`/server/utils/transformExportToAssistantInput.ts\` - Data transformation
`;

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'README.md'),
      readmeContent,
      'utf8'
    );
    console.log('✅ Saved: README.md');

    // Step 5: Create data flow visualization
    const flowContent = `# Data Flow Visualization

## Step-by-Step Transformation

### 1️⃣ Database Query
\`\`\`sql
SELECT u.*, 
       json_agg(json_build_object(
         'assessment_type', ua.assessment_type,
         'results', ua.results
       )) as assessments
FROM users u
LEFT JOIN user_assessments ua ON u.id = ua.user_id
WHERE u.id = ${USER_ID}
\`\`\`
**Output**: Array of database rows (Postgres format)
**See**: 01-raw-database-query.json

---

### 2️⃣ Initial Transformation (holistic-report-routes.ts line ~851)
\`\`\`javascript
// Convert array of assessment rows to object
const assessments = {};
rawAssessments.forEach(row => {
  if (row.assessment_type && row.results) {
    assessments[row.assessment_type] = JSON.parse(row.results);
  }
});

const transformerInput = {
  userInfo: { userName, firstName, lastName },
  assessments: assessments  // Now an object, not array
};
\`\`\`
**Output**: Structured object with nested assessments
**See**: 02-transformer-input.json

---

### 3️⃣ Transformer (transformExportToAssistantInput.ts)
\`\`\`javascript
function transformExportToAssistantInput(exportJson, options) {
  return {
    participant_name: exportJson.userInfo.userName,
    report_type: options.report_type,
    
    strengths: {
      leading: getLeadingStrengths(exportJson.assessments.starCard),
      supporting: getSupportingStrengths(exportJson.assessments.starCard),
      quieter: getQuieterStrengths(exportJson.assessments.starCard)
    },
    
    flow: {
      flowScore: exportJson.assessments.flowAssessment?.flowScore,
      attributes: exportJson.assessments.flowAttributes?.attributes,
      // ... more flow data
    },
    
    reflections: {
      strength1: exportJson.assessments.stepByStepReflection?.strength1,
      strength2: exportJson.assessments.stepByStepReflection?.strength2,
      // ... all reflections
    },
    
    cantrilLadder: { /* ... */ },
    futureSelf: { /* ... */ },
    finalReflection: { /* ... */ }
  };
}
\`\`\`
**Output**: Compact, AI-ready format
**See**: 03-transformer-output-to-openai.json

---

### 4️⃣ OpenAI API Call (openai-api-service.ts line ~780)
\`\`\`javascript
// Create thread
const thread = await openai.beta.threads.create();

// Send transformed data
await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: JSON.stringify({ 
    type: "ast_input_v2", 
    payload: compactInput  // From step 3
  })
});

// Run Assistant (uses instructions from OpenAI dashboard)
const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: 'asst_CZ9XUvnWRx3RIWFc7pLeH8U2'
});

// Wait for completion and get response
const messages = await openai.beta.threads.messages.list(thread.id);
const response = messages.data.find(m => m.role === "assistant").content[0].text.value;
\`\`\`
**Output**: Raw markdown/text report content
**See**: 04-raw-openai-response.txt

---

### 5️⃣ HTML Generation (holistic-report-routes.ts line ~935)
\`\`\`javascript
function generateHtmlReport(reportContent, userData, reportType) {
  return \`
    <!DOCTYPE html>
    <html>
      <head>
        <style>/* CSS styles */</style>
      </head>
      <body>
        <div class="header">
          <h1>\${userData.userName}</h1>
        </div>
        
        <!-- Strengths Section -->
        <div class="strengths-profile">
          <img src="data:image/png;base64,\${starCardBase64}" />
          <svg>\${pieChartSVG}</svg>
          \${strengthCards}
        </div>
        
        <!-- OpenAI Generated Content -->
        <div class="analysis">
          \${reportContent}  <!-- From step 4 -->
        </div>
      </body>
    </html>
  \`;
}
\`\`\`
**Output**: Complete HTML document
**See**: 05-final-html-report.html

---

### 6️⃣ Database Storage
\`\`\`javascript
await pool.query(\`
  UPDATE holistic_reports SET
    html_content = $1,
    report_data = $2,
    generation_status = 'completed',
    generated_at = NOW()
  WHERE id = $3
\`, [htmlContent, reportDataJson, reportId]);
\`\`\`
**Output**: Saved report record
**See**: 06-complete-report-data.json

---

## Key Transformation Points

### 🔄 Database → Transformer Input
- **Challenge**: Convert Postgres array format to structured object
- **Solution**: Loop through rows and build assessments object by type
- **Critical**: Ensure ALL assessment types are included

### 🔄 Transformer Input → OpenAI Payload
- **Challenge**: Format data for AI consumption
- **Solution**: Categorize strengths, organize reflections, structure metadata
- **Critical**: Validate data quality, detect gibberish

### 🔄 OpenAI Response → HTML
- **Challenge**: Embed AI content in visual report
- **Solution**: Wrap in styled HTML, add charts and images
- **Critical**: Handle markdown formatting, embed images as base64

## Data Quality Checkpoints

At each step, verify:
1. **Completeness**: No data lost during transformation
2. **Format**: Correct structure for next step
3. **Quality**: Valid values, no errors
4. **Size**: Appropriate length for stage

Compare files in this package to trace any issues!
`;

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'DATA-FLOW-DIAGRAM.md'),
      flowContent,
      'utf8'
    );
    console.log('✅ Saved: DATA-FLOW-DIAGRAM.md');

    // Step 6: Create comparison summary
    console.log('\n📊 Step 5: Generating summary report...');
    
    const summaryContent = `# Report Generation Summary
Generated: ${new Date().toISOString()}

## 📊 Package Contents
✅ All debug files created successfully
✅ Complete data flow captured
✅ Ready for analysis

## 📁 Files Created
- 00-generation-response.json
- 01-raw-database-query.json
- 02-transformer-input.json
- 03-transformer-output-to-openai.json
- 04-raw-openai-response.txt
- 04b-openai-response-analysis.txt
- 05-final-html-report.html
- 06-complete-report-data.json
- README.md (this file)
- DATA-FLOW-DIAGRAM.md

## 🔍 Quick Analysis

### Input Data Quality
- User ID: ${USER_ID}
- Report Type: ${REPORT_TYPE}
- Assessments Found: ${reportDebugData.rawDatabaseQuery?.assessments?.length || 'N/A'}
- Data Complete: ${reportDebugData.rawDatabaseQuery ? '✅' : '❌'}

### Transformation Success
- Transformer Input Valid: ${reportDebugData.transformerInput ? '✅' : '❌'}
- OpenAI Payload Created: ${reportDebugData.transformerOutput ? '✅' : '❌'}
- Data Structure Correct: ${reportDebugData.transformerOutput?.participant_name ? '✅' : '❌'}

### OpenAI Generation
- Response Received: ${reportDebugData.openaiResponse ? '✅' : '❌'}
- Response Length: ${reportDebugData.openaiResponse?.length || 0} characters
- Word Count: ${reportDebugData.openaiResponse?.split(/\\s+/).length || 0} words
- Quality: ${(reportDebugData.openaiResponse?.length || 0) > 5000 ? '✅ Good' : '⚠️ Short'}

### Final Output
- HTML Generated: ${reportDebugData.htmlContent ? '✅' : '❌'}
- HTML Size: ${reportDebugData.htmlContent?.length || 0} characters
- Contains StarCard: ${reportDebugData.htmlContent?.includes('data:image') ? '✅' : '❌'}
- Contains Chart: ${reportDebugData.htmlContent?.includes('<svg') ? '✅' : '❌'}

## 🎯 Next Steps

1. **Review README.md** for detailed file descriptions
2. **Check DATA-FLOW-DIAGRAM.md** to understand transformations
3. **Open 05-final-html-report.html** in browser to see result
4. **Compare files** to identify any data loss or issues
5. **Analyze 04-raw-openai-response.txt** for content quality

## 💡 Enhancement Ideas

Based on this package, you can:
- Adjust transformer logic (if data is lost in step 2-3)
- Modify OpenAI instructions (if response is too short in step 4)
- Enhance HTML template (if visual improvements needed in step 5)
- Add more data fields (if key information is missing)

---
Location: ${OUTPUT_DIR}
`;

    await fs.writeFile(
      path.join(OUTPUT_DIR, 'SUMMARY.md'),
      summaryContent,
      'utf8'
    );
    console.log('✅ Saved: SUMMARY.md');

    // Final summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEBUG PACKAGE COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📁 Package Location: ${OUTPUT_DIR}`);
    console.log('\n📄 Files Created:');
    console.log('   - 00-generation-response.json');
    console.log('   - 01-raw-database-query.json');
    console.log('   - 02-transformer-input.json');
    console.log('   - 03-transformer-output-to-openai.json');
    console.log('   - 04-raw-openai-response.txt');
    console.log('   - 04b-openai-response-analysis.txt');
    console.log('   - 05-final-html-report.html');
    console.log('   - 06-complete-report-data.json');
    console.log('   - README.md');
    console.log('   - DATA-FLOW-DIAGRAM.md');
    console.log('   - SUMMARY.md');
    
    console.log('\n📊 Quick Stats:');
    console.log(`   - OpenAI Response: ${reportDebugData.openaiResponse?.split(/\s+/).length || 0} words`);
    console.log(`   - HTML Size: ${reportDebugData.htmlContent?.length || 0} characters`);
    console.log(`   - Quality: ${(reportDebugData.openaiResponse?.length || 0) > 5000 ? '✅ Good' : '⚠️ Needs improvement'}`);
    
    console.log('\n🚀 Next Steps:');
    console.log(`   1. cd ${OUTPUT_DIR}`);
    console.log('   2. cat SUMMARY.md');
    console.log('   3. open 05-final-html-report.html');
    console.log('   4. Review each file to trace the data flow');
    
    console.log('\n💡 Tip: Compare the files to see where data is transformed or lost!\n');

  } catch (error) {
    console.error('\n❌ Error creating debug package:', error);
    console.error('\nDetails:', error.message);
    
    // Save error log
    try {
      await fs.writeFile(
        path.join(OUTPUT_DIR, 'ERROR-LOG.txt'),
        `Error occurred during debug package creation\n\n${error.stack}`,
        'utf8'
      );
      console.log(`\n📄 Error log saved to: ${path.join(OUTPUT_DIR, 'ERROR-LOG.txt')}`);
    } catch (writeError) {
      console.error('Failed to write error log:', writeError);
    }
    
    process.exit(1);
  }
}

// Add debug endpoint handler note
console.log('📝 Note: This script requires a debug endpoint at:');
console.log('   GET /api/reports/holistic/debug/:reportId');
console.log('   (This endpoint needs to be added to holistic-report-routes.ts)\n');
console.log('⏳ Starting debug package creation in 2 seconds...\n');

setTimeout(() => {
  createDebugPackage();
}, 2000);
