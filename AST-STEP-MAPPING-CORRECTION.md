# AST Step Mapping Correction Summary

## ❌ **Current Problem (Incorrect Mapping):**

The current video database has incorrect step mappings:

```
stepId: "1-1" → "Introduction" ✅ (correct)
stepId: "2-1" → "Intro to Star Strengths" ✅ (correct) 
stepId: "2-3" → "Review Your Star Card" ✅ (correct)
stepId: "3-1" → "Intro to Flow" ❌ (WRONG - should be well-being)
stepId: "4-1" → "Ladder of Well-being" ❌ (WRONG - should be 3-1)
Missing: "2-2" → Flow Patterns ❌ (missing)
```

## ✅ **Corrected Mapping (What It Should Be):**

```
stepId: "1-1" → "Introduction" 
stepId: "2-1" → "Intro to Star Strengths"
stepId: "2-2" → "Flow Patterns" (NEW - with transcript/glossary tabs)
stepId: "2-3" → "Review Your Star Card"
stepId: "3-1" → "Ladder of Well-being" (MOVED from 4-1)
stepId: "3-3" → "Rounding Out"
stepId: "4-4" → "Future Self"
```

## 🔧 **Files That Fix This:**

### **1. Database Correction Script**
- **File**: `sql/fix-ast-step-mapping.sql`
- **Action**: Moves well-being to 3-1, adds Flow Patterns to 2-2, removes incorrect flow from 3-1

### **2. Component Updates**
- **File**: `client/src/components/content/IntroToFlowView.tsx` 
- **Action**: Uses stepId "2-2" for Flow Patterns (correct)
- **Uses**: VideoTranscriptGlossary component with full Flow content

### **3. Route Mapping Check Needed**
- **Check**: `AllStarTeamsContent.tsx` route `'flow-patterns'` → should use IntroToFlowView
- **Check**: Route `'wellbeing'` or similar → should map to step 3-1

## 🚀 **To Deploy the Fix:**

1. **Run the correction SQL script**:
   ```bash
   # Use your preferred database execution method
   node run-flow-video-sql.js  # (if using Node script)
   # OR execute sql/fix-ast-step-mapping.sql directly in database
   ```

2. **Verify step routing**:
   - AST 2-2 (Flow Patterns) → Uses IntroToFlowView with VideoTranscriptGlossary
   - AST 3-1 (Well-being) → Should use WellBeingView component

3. **Test the corrected flow**:
   - Navigate through AST steps in correct order
   - Verify Flow Patterns appears at step 2-2 with tabs
   - Verify Well-being appears at step 3-1

## 📋 **Current Status:**

- ✅ **VideoTranscriptGlossary component** ready with tabs
- ✅ **Flow Patterns content** added (transcript + 14-term glossary)
- ✅ **IntroToFlowView** updated to use new video component  
- ✅ **Database correction script** ready to execute
- ⏳ **Database update** needs to be run
- ⏳ **Route verification** may be needed

This correction ensures the AST workshop steps follow the proper sequence and that Flow Patterns (2-2) has the enhanced video experience with transcript and glossary tabs.
