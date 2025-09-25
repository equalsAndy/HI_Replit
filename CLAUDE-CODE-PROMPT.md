# Claude Code Debugging Prompt - Holistic Reports

## 🎯 Mission
Fix the holistic report generation system that's failing due to a data structure mismatch. The data transformation works but OpenAI call fails with `.map()` error.

## 🐛 The Problem

**Error**: `rawExport.assessments.map is not a function`

**What's happening**:
1. ✅ Data transformation in `holistic-report-routes.ts` converts DB rows to correct object structure
2. ✅ Data reaches transformer with correct format
3. ❌ Somewhere in the pipeline, code tries to call `.map()` on `assessments` (which is now an object, not an array)
4. ❌ OpenAI call fails, falls back to 535 character error message
5. ❌ View route returns 404

**Expected**: 5,000+ word personalized report  
**Actual**: 535 character error message

## 📂 Files to Debug

### Priority 1: Find the .map() Call
1. `/server/services/openai-api-service.ts`
   - Function: `createAstReportFromExport()` (around line 970-1020)
   - Check: Where is `.map()` being called on assessments?

2. `/server/utils/transformExportToAssistantInput.ts`
   - Main transformation function
   - Check: Does it handle object format correctly?

3. `/server/routes/holistic-report-routes.ts`
   - Function: `generateReportUsingTalia()` (around line 800-900)
   - Our fix is at line ~851

### Priority 2: Check the 404 Error
4. `/server/routes/holistic-report-routes.ts`
   - Route: `router.get('/:reportType/view', requireAuth, ...)` (around line 425)
   - Why is this returning 404?

## 🔍 Debugging Strategy

### Step 1: Add Comprehensive Logging
Add this at the START of `transformExportToAssistantInput()`:

```typescript
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
  
  // ... rest of function
}
```

### Step 2: Search for .map() Calls
```bash
# Find all places that call .map() on assessments
grep -n "assessments.*\.map" server/**/*.ts

# Find all references to rawExport.assessments
grep -n "rawExport\.assessments" server/**/*.ts

# Find all references to exportJson.assessments
grep -n "exportJson\.assessments" server/**/*.ts
```

### Step 3: Check the Data Format
The correct format (after our fix):
```typescript
{
  userInfo: {
    userName: "Millie Millie",
    firstName: "Millie",
    lastName: "Millie"  
  },
  assessments: {  // ← OBJECT, not array
    starCard: { thinking: 23, planning: 29, feeling: 19, acting: 29 },
    flowAssessment: { flowScore: 45, ... },
    stepByStepReflection: { strength1: "...", ... },
    cantrilLadder: { wellBeingLevel: 7, ... },
    // ... etc
  }
}
```

If you find code expecting array format:
```typescript
// ❌ OLD (array format):
rawExport.assessments.map(a => a.assessment_type)

// ✅ NEW (object format):
Object.keys(rawExport.assessments)
```

### Step 4: Fix the Issue
Once you find the `.map()` call:
1. Update it to handle object format
2. OR add compatibility to handle both formats
3. Test the fix

### Step 5: Fix the 404
Check why the view route returns 404:
```typescript
// In holistic-report-routes.ts, around line 425
router.get('/:reportType/view', requireAuth, async (req, res) => {
  const { reportType } = req.params;
  const userId = req.session?.userId;
  
  // Add logging here:
  console.log('🔍 [VIEW ROUTE] Request:', { reportType, userId });
  
  // Check the database query
  const result = await pool.query(/* ... */);
  console.log('🔍 [VIEW ROUTE] Query result:', result.rows.length);
  
  // ... rest of route
});
```

## 🧪 Testing Commands

```bash
# 1. Restart the server
npm run dev

# 2. In another terminal, run the test
node test-report-fix.js

# 3. Check the logs for:
#    - 🔍 [TRANSFORMER] logs showing data type
#    - Any .map() errors
#    - OpenAI response length (should be > 5000)

# 4. Check database
psql $DATABASE_URL -c "
  SELECT 
    id,
    user_id,
    generation_status,
    LENGTH(html_content) as html_length,
    SUBSTRING((report_data::json->>'professionalProfile')::text, 1, 200) as preview
  FROM holistic_reports 
  WHERE user_id = 65
  ORDER BY generated_at DESC 
  LIMIT 1;
"
```

## ✅ Success Criteria

You've fixed it when:
1. ✅ No `.map()` error in logs
2. ✅ Logs show: `🔍 [TRANSFORMER] assessments type: OBJECT ✅`
3. ✅ OpenAI response length > 5,000 characters
4. ✅ Database `html_length` > 50,000
5. ✅ View route returns 200 (not 404)
6. ✅ Report displays in browser correctly

## 🔧 Quick Fixes

### If assessments is still an array
The fix in `holistic-report-routes.ts` line ~851 might not be complete. Make sure it looks like this:

```typescript
// Parse all assessment results from database rows into an object
const parsedAssessments: any = {};
for (const row of assessmentResult.rows) {
  try {
    if (row.assessment_type && row.results) {
      parsedAssessments[row.assessment_type] = JSON.parse(row.results as string);
    }
  } catch (parseError) {
    console.error(`❌ [DATA FIX] Failed to parse ${row.assessment_type}:`, parseError);
  }
}

// Construct raw export data in the format expected by transformer
const rawExportData = {
  userInfo: {
    userName: user.name,
    firstName: user.name?.split(' ')[0] || user.name,
    lastName: user.name?.split(' ').slice(1).join(' ') || ''
  },
  assessments: {  // ← Must be object, not array
    starCard: parsedAssessments.starCard || {},
    flowAssessment: parsedAssessments.flowAssessment || {},
    flowAttributes: parsedAssessments.flowAttributes || {},
    stepByStepReflection: parsedAssessments.stepByStepReflection || {},
    roundingOutReflection: parsedAssessments.roundingOutReflection || {},
    cantrilLadder: parsedAssessments.cantrilLadder || {},
    futureSelfReflection: parsedAssessments.futureSelfReflection || {},
    finalReflection: parsedAssessments.finalReflection || {}
  }
};
```

### If .map() is in the transformer
Check line 195 in `transformExportToAssistantInput.ts` - the transformer expects the object format, so if there's a `.map()` call, it's probably legacy code that needs updating.

## 📊 Expected Output

After the fix, you should see logs like:
```
🔧 [DATA FIX] Structured export data:
  - userName: Millie Millie
  - starCard keys: [ 'thinking', 'feeling', 'acting', 'planning' ]

🔍 [TRANSFORMER] assessments type: OBJECT ✅
🔍 [TRANSFORMER] Participant name: Millie Millie
🔍 [TRANSFORMER] Leading strengths: [ 'acting', 'planning' ]
🔍 [REPORT DEBUG] Response length: 15000
✅ Clean AST report generation successful
✅ Report generated successfully (15000 chars)
```

## 🚀 Run This Workflow

1. Add the comprehensive logging to `transformExportToAssistantInput()`
2. Search for `.map()` calls: `grep -r "assessments.*\.map" server/`
3. Fix any code expecting array format
4. Restart server: `npm run dev`
5. Test: `node test-report-fix.js`
6. Verify: Check logs and database for success

---

**Current Status**: Data transformation works, but OpenAI call fails  
**Root Cause**: Code somewhere calls `.map()` on object  
**Solution**: Find and fix the `.map()` call to handle object format  
**Time Estimate**: 15-30 minutes once you find the `.map()` call
