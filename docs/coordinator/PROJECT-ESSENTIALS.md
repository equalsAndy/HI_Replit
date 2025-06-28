# Heliotrope Imaginal - Project Essentials

## 🎯 What This Is
Dual-workshop platform with shared infrastructure:
- **AST Workshop**: AllStarTeams (blue theme, numbered step IDs: 1-1, 2-1, etc.)
- **IA Workshop**: Imaginal Agility (purple theme, prefixed step IDs: ia-1-1, ia-2-1, etc.)
- **Platform**: Yellow header, admin tools, shared navigation

**Location:** `/Users/bradtopliff/Desktop/HI_Replit`

## 🏗️ Architecture Overview

### **Workshop Separation (CRITICAL)**
- **AST**: 19 steps, blue theme, AllStarTeams branding
- **IA**: 8 steps, purple theme, Imaginal Agility branding
- **Shared**: Navigation component with `isImaginalAgility` prop
- **Database**: Separate step IDs and progress tracking

### **Key Files**
```
client/src/components/navigation/navigationData.ts (defines both workshops)
client/src/pages/allstarteams.tsx (AST workshop page)
client/src/pages/imaginal-agility.tsx (IA workshop page)
```

## 📋 Workshop Structures

### **AST Workshop (19 steps):**
Section 1: Introduction (1-1)
Section 2: DISCOVER YOUR STAR STRENGTHS (2-1, 2-2, 2-3, 2-4)
Section 3: IDENTIFY YOUR FLOW (3-1, 3-2, 3-3, 3-4)
Section 4: VISUALIZE YOUR POTENTIAL (4-1, 4-2, 4-3, 4-4, 4-5)
Section 5: NEXT STEPS (5-1, 5-2, 5-3, 5-4) - unlocks after 4-5
Section 6: MORE INFORMATION (6-1)

### **IA Workshop (8 steps):**
Section 1: Imaginal Agility Program
- ia-1-1: Introduction to Imaginal Agility
- ia-2-1: The Triple Challenge  
- ia-3-1: The Imaginal Agility Solution
- ia-4-1: Self-Assessment
- ia-5-1: Assessment Results
- ia-6-1: Teamwork Preparation
- ia-7-1: Reality Discernment
- ia-8-1: Neuroscience

## ⚠️ Critical Constraints

### **Never Mix Workshops:**
- AST changes must not affect IA files
- IA changes must not affect AST files
- Always specify which workshop when requesting changes

### **File Safety:**
- Always `git status` before modifications
- Use `git diff` to verify changes before commit
- Keep workshop themes separate (blue vs purple)

## 🔧 Development Environment

### **Tools Available:**
- **Replit Assistant**: Code questions, file structure queries
- **Replit Agent**: Multi-file implementations, complex features
- **Claude Direct**: Simple changes, analysis, coordination
- **VS Code**: Available for personal quick edits
- **Git**: Fast operations (0.093s), safe for local work

### **Standard Git Workflow:**
```bash
cd /Users/bradtopliff/Desktop/HI_Replit
git status
git pull origin main
[make changes]
git diff
git add .
git commit -m "Description"
git push origin main
```

## 📋 **Enhanced Handoff Templates**

### **Standard Session Handoff:**
```markdown
# SESSION HANDOFF - [Task Name]
*Created: [Date]*

## CHAT GOALS:
1. [Specific objective to accomplish]
2. [Specific objective to accomplish] 
3. [Specific objective to accomplish]

## CURRENT STATE:
- ✅ **Completed:** [What's working properly]
- ❌ **Issues:** [What's broken/missing]
- 🔄 **In Progress:** [Current step/partial work]

## SPECIFIC FIXES NEEDED:
1. **[Issue Name]:** [Detailed description and solution approach]
2. **[Issue Name]:** [Detailed description and solution approach]

## FILES INVOLVED:
- `client/src/path/to/file.tsx` - [specific changes needed]
- `client/src/other/file.ts` - [what needs modification]

## START WITH:
"[Exact phrase for new chat to continue work]"
```

### **Workshop-Specific Handoff:**
```markdown
# SESSION HANDOFF - [AST/IA] Workshop [Feature]
*Created: [Date]*

## CHAT GOALS:
1. Fix [specific workshop issue]
2. Verify [specific functionality] 
3. Test [specific user flow]

## WORKSHOP: [AST/IA] - [Theme: Blue/Purple]

## CURRENT STATE:
- ✅ **Navigation:** [working/broken]
- ✅ **Content:** [working/broken]
- ✅ **Progression:** [working/broken] 
- ❌ **Issues:** [specific problems]

## VERIFICATION NEEDED:
1. Test workshop at `/[workshop-path]`
2. Check [specific steps/features]
3. Verify [specific functionality]

## FOR NEW CHAT:
"Continue [workshop] fixes from handoff - [next action]"
```

## 📊 **Key Learnings (June 28, 2025)**

### **Coordination Success Patterns:**
- **File Access Confirmed**: Claude direct editing works safely for 1-2 file changes
- **Hybrid Workflow**: Claude analysis + targeted edits + Replit Agent prompts
- **Workshop Flow**: Hidden steps (ia-7-1) work, but Next buttons are essential
- **Graphics Location**: IA capability images exist in `/public/assets/` need path resolution

### **Critical Workshop Requirements:**
- **Next buttons**: Essential for step progression - never remove during content edits
- **Path resolution**: Graphics in `/public/assets/` need proper loading paths
- **Navigation flow**: Must skip hidden steps while maintaining progression
- **Content consistency**: Maintain original voice/tone during technical fixes

---

**Last Updated:** June 28, 2025  
**Environment Status:** Production ready, Git optimized