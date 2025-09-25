# Data Flow Visualization

## Step-by-Step Transformation

### 1️⃣ Database Query
```sql
SELECT u.*, 
       json_agg(json_build_object(
         'assessment_type', ua.assessment_type,
         'results', ua.results
       )) as assessments
FROM users u
LEFT JOIN user_assessments ua ON u.id = ua.user_id
WHERE u.id = 65
```
**Output**: Array of database rows (Postgres format)
**See**: 01-raw-database-query.json

---

### 2️⃣ Initial Transformation (holistic-report-routes.ts line ~851)
```javascript
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
```
**Output**: Structured object with nested assessments
**See**: 02-transformer-input.json

---

### 3️⃣ Transformer (transformExportToAssistantInput.ts)
```javascript
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
```
**Output**: Compact, AI-ready format
**See**: 03-transformer-output-to-openai.json

---

### 4️⃣ OpenAI API Call (openai-api-service.ts line ~780)
```javascript
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
```
**Output**: Raw markdown/text report content
**See**: 04-raw-openai-response.txt

---

### 5️⃣ HTML Generation (holistic-report-routes.ts line ~935)
```javascript
function generateHtmlReport(reportContent, userData, reportType) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>/* CSS styles */</style>
      </head>
      <body>
        <div class="header">
          <h1>${userData.userName}</h1>
        </div>
        
        <!-- Strengths Section -->
        <div class="strengths-profile">
          <img src="data:image/png;base64,${starCardBase64}" />
          <svg>${pieChartSVG}</svg>
          ${strengthCards}
        </div>
        
        <!-- OpenAI Generated Content -->
        <div class="analysis">
          ${reportContent}  <!-- From step 4 -->
        </div>
      </body>
    </html>
  `;
}
```
**Output**: Complete HTML document
**See**: 05-final-html-report.html

---

### 6️⃣ Database Storage
```javascript
await pool.query(`
  UPDATE holistic_reports SET
    html_content = $1,
    report_data = $2,
    generation_status = 'completed',
    generated_at = NOW()
  WHERE id = $3
`, [htmlContent, reportDataJson, reportId]);
```
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
