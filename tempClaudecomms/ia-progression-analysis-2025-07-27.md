# IA Workshop Progression Analysis
**Date**: 2025-07-27  
**Issue**: Investigate unlock timing for ia-5-1, ia-7-1, and ia-7-2

## Current IA Step Progression Order

Based on `client/src/pages/imaginal-agility.tsx` lines 162-177 and 221-236:

```
Section 1: ia-1-1, ia-1-2 (WELCOME)
Section 2: ia-2-1, ia-2-2 (THE I4C MODEL) 
Section 3: ia-3-1, ia-3-2, ia-3-3, ia-3-4, ia-3-5, ia-3-6 (LADDER OF IMAGINATION)
Section 4: ia-4-1, ia-4-2, ia-4-3, ia-4-4, ia-4-5, ia-4-6 (ADVANCED LADDER)
Section 5: ia-5-1 (OUTCOMES & BENEFITS)
Section 6: ia-6-coming-soon (QUARTERLY TUNE-UP - placeholder)
Section 7: ia-7-1, ia-7-2 (TEAM LADDER OF IMAGINATION)
```

## Unlock Logic Analysis

The `isStepAccessible` function uses linear progression - each step requires the previous step to be completed.

### **ia-5-1 (Overview)** 
- **Should unlock after**: ia-4-6 (Nothing is Unimaginable) completed
- **Status**: ✅ Working correctly
- **Section**: OUTCOMES & BENEFITS (Section 5)

### **ia-7-1 (Team Ladder Overview)**
- **Should unlock after**: Last step in Section 6 completed
- **Current blocker**: Section 6 only has `ia-6-coming-soon` placeholder
- **Status**: ❓ **POTENTIAL ISSUE** - Section 7 may be inaccessible
- **Section**: TEAM LADDER OF IMAGINATION (Section 7)

### **ia-7-2 (Whiteboard Link)**
- **Should unlock after**: ia-7-1 completed  
- **Status**: ✅ Should work if ia-7-1 is accessible
- **Section**: TEAM LADDER OF IMAGINATION (Section 7)

## The Section 6 Problem - MAJOR MISMATCH FOUND

**Critical Issue**: There's a mismatch between navigation and content systems:

### Navigation Data (`navigationData.ts`):
- Shows only placeholder: `ia-6-coming-soon`
- Real steps `ia-6-1` and `ia-6-2` are commented out

### Content System (`ContentViews.tsx`):
- Still has active content for `ia-6-1` ("Teamwork Preparation")
- Video player and content are fully implemented
- References to `ia-6-1` exist throughout codebase

### Progression Logic (`imaginal-agility.tsx`):
- Expects linear progression: `ia-5-1` → `ia-6-1` → `ia-6-2` → `ia-7-1`
- But navigation only shows `ia-6-coming-soon`
- **Result**: Section 7 is unreachable because progression looks for `ia-6-2` completion

**Root Cause**: Section 6 steps were replaced with placeholder in navigation but content still exists

## Section Expansion States

From `client/src/components/navigation/navigationData.ts`:
- Sections 1-3: `expanded: true` (default expanded) ✅
- Sections 4-7: `expanded: false` (default collapsed) ✅

## IMMEDIATE SOLUTIONS

### Solution 1: Restore Section 6 Navigation (RECOMMENDED)
Uncomment the real Section 6 steps in `navigationData.ts`:
```typescript
// Replace the placeholder with actual steps:
{
  id: '6',
  title: 'QUARTERLY TUNE-UP',
  expanded: false,
  steps: [
    { 
      id: 'ia-6-1', 
      title: 'Orientation', 
      type: 'video',
      contentKey: 'ia-6-1'
    },
    { 
      id: 'ia-6-2', 
      title: 'Practices', 
      type: 'interactive',
      contentKey: 'ia-6-2'
    }
  ]
}
```

### Solution 2: Update Progression Logic (QUICK FIX)
Skip Section 6 placeholder in progression:
```typescript
// In imaginal-agility.tsx, update step order array:
const iaStepOrder = [
  'ia-1-1', 'ia-1-2',
  'ia-2-1', 'ia-2-2', 
  'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6',
  'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6',
  'ia-5-1',
  // SKIP Section 6 placeholder
  'ia-7-1', 'ia-7-2'
];
```

## DEPLOYMENT READY

Commands prepared in: `/tempClaudecomms/deploy-v2.1.4-database-fix.sh`

**Deploy v2.1.4 now** - contains critical database reset fixes that will solve the workshop data persistence issue.

## NEXT ACTIONS

1. **Deploy v2.1.4** (critical database fix)
2. **Choose Solution 1 or 2** for IA progression 
3. **Test with Barney's account** after deployment