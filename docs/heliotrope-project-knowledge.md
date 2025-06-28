# Heliotrope Imaginal - Project Specific Knowledge

## 📚 **REFERENCE DOCUMENTS FIRST**

**Read these for complete development context:**
- **`docs/claude-development-workflow.md`** - Generic Claude workflow patterns, verified capabilities, Git resolution
- **`docs/brad-development-guide.md`** - User preferences, communication style, prompt templates
- **`docs/future-features-and-fixes.md`** - Feature backlog, known issues, implementation notes
- **THIS FILE** - Heliotrope-specific architecture, workshop structure, technical details

**✅ Environment Status:** Production ready - iCloud+Git conflicts resolved, 98.7% performance improvement

### **📋 Development Session Protocol**

**For every new development chat:**
1. **Check backlog first** - Review `docs/future-features-and-fixes.md` for pending items
2. **Ask user priorities** - "Would you like to work on any backlog items or start something new?"
3. **Update backlog** - Add new items discovered during development
4. **Document decisions** - Record any architecture choices or patterns established

## 🎯 Project Overview

**Heliotrope Imaginal** is a dual-workshop platform with shared infrastructure and distinct workshop experiences:

- **Overall Platform**: Heliotrope Imaginal (yellow header bar)
- **AST Workshop**: AllStarTeams (blue theme, numbered step IDs)
- **IA Workshop**: Imaginal Agility (purple theme, ia- prefixed step IDs)
- **Shared Features**: Admin dashboards, facilitator tools, authentication

## 🏗️ Architecture Structure

### **File Organization**
```
/client/src/
├── components/
│   ├── navigation/
│   │   ├── navigationData.ts (defines both workshops)
│   │   ├── ImaginalAgilityNavigation.tsx (IA-specific nav)
│   │   └── UserHomeNavigationWithStarCard.tsx (shared nav)
│   ├── content/
│   │   ├── allstarteams/ (AST-specific content)
│   │   └── imaginal-agility/ (IA-specific content)
│   └── assessment/ (shared assessment components)
└── pages/
    ├── allstarteams.tsx (AST workshop page)
    └── imaginal-agility.tsx (IA workshop page)
```

### **Workshop Separation**
- **AST Steps**: Use numbered IDs (1-1, 2-1, 3-1, etc.)
- **IA Steps**: Use prefixed IDs (ia-1-1, ia-2-1, ia-3-1, etc.)
- **Themes**: AST=blue, IA=purple, Platform=yellow header
- **Navigation**: Shared component with `isImaginalAgility` prop

## 📋 Workshop Structure

### **🔵 AllStarTeams (AST) Workshop**
**Complete 19-step learning journey with sequential progression**

#### Section 1: Introduction (1 step)
- **1-1**: "Introduction" (Learning, Book icon)

#### Section 2: DISCOVER YOUR STAR STRENGTHS (4 steps)
- **2-1**: "Intro to Star Strengths" (Learning, Book icon)
- **2-2**: "Star Strengths Self-Assessment" (Assessment, Zap icon, Modal)
- **2-3**: "Review Your Star Card" (Learning, Book icon)
- **2-4**: "Strength Reflection" (Reflection, PenTool icon)

#### Section 3: IDENTIFY YOUR FLOW (4 steps)
- **3-1**: "Intro to Flow" (Learning, Book icon)
- **3-2**: "Flow Assessment" (Assessment, Zap icon, Modal)
- **3-3**: "Rounding Out" (Learning, Book icon)
- **3-4**: "Add Flow to Star Card" (Activity, Zap icon)

#### Section 4: VISUALIZE YOUR POTENTIAL (5 steps)
- **4-1**: "Ladder of Well-being" (Learning, Book icon, has sliders)
- **4-2**: "Well-being Reflections" (Learning, Book icon)
- **4-3**: "Visualizing You" (Learning, Book icon)
- **4-4**: "Your Future Self" (Reflection, PenTool icon)
- **4-5**: "Final Reflection" (Reflection, PenTool icon)

#### Section 5: NEXT STEPS (4 steps) - Unlocks after 4-5
- **5-1**: "Download your Star Card" (Learning, Download icon)
- **5-2**: "Your Holistic Report" (Learning, Download icon)
- **5-3**: "Growth Plan" (Learning, Calendar icon)
- **5-4**: "Team Workshop Prep" (Learning, Activity icon)

#### Section 6: MORE INFORMATION (1 step visible)
- **6-1**: "Workshop Resources" (Learning, Brain icon)

*Note: More Information section may have additional steps not visible in current menu*

### **🟣 Imaginal Agility (IA) Workshop**
**Focused 8-step imagination development program**

#### Section 1: Imaginal Agility Program (8 steps)
- **ia-1-1**: "Introduction to Imaginal Agility" (Learning, Book icon)
- **ia-2-1**: "The Triple Challenge" (Learning, Book icon)
- **ia-3-1**: "The Imaginal Agility Solution" (Learning, Book icon)
- **ia-4-1**: "Self-Assessment" (Assessment, Zap icon)
- **ia-5-1**: "Assessment Results" (Learning, Book icon)
- **ia-6-1**: "Teamwork Preparation" (Learning, Book icon)
- **ia-7-1**: "Reality Discernment" (Learning, Book icon)
- **ia-8-1**: "Neuroscience" (Learning, Book icon)

## 🔧 Technical Details

### **Navigation Data Structure**
Located in: `client/src/components/navigation/navigationData.ts`

**Two separate arrays:**
- `navigationSections[]` - AST workshop (numbered step IDs)
- `imaginalAgilityNavigationSections[]` - IA workshop (ia-prefixed step IDs)

### **Navigation Components**
1. **ImaginalAgilityNavigation.tsx** - Dedicated IA navigation (purple)
2. **UserHomeNavigationWithStarCard.tsx** - Shared navigation with `isImaginalAgility` prop

### **Current Implementation**
- Both workshops use shared navigation component
- IA workshop sets `isImaginalAgility={true}` prop
- Component adapts styling and behavior based on prop

### **Assessment Systems**
- **AST**: Star Strengths + Flow assessments
- **IA**: Imagination/5Cs assessment
- **Shared**: Assessment modal components

## 🧪 Test User Workflow

### Authentication Flow:
- Test users redirect to `/testuser` after login
- Regular users continue to existing flow
- Admin users continue to `/admin`

### Data Management:
- **Export All Data**: Downloads complete user data from both workshops
- **Reset All Data**: Clears all progress with confirmation dialog
- **No individual workshop resets**: All data management centralized

### Workshop Navigation:
- **Simplified buttons**: "Go to AllStarTeams Workshop" / "Go to Imaginal Agility Workshop"
- **No complex logic**: Removed Continue/Switch dynamic behavior for simplicity

## 🔧 **Development Environment (VERIFIED PRODUCTION READY)**

### **✅ Git + iCloud Resolution (Major Breakthrough)**
- **Problem**: Git operations taking 7+ seconds, repository corruption from iCloud sync
- **Solution**: `xattr -w com.apple.fileprovider.ignore#P 1 .git/` (exclude .git from iCloud)
- **Result**: 98.7% performance improvement (7s → 0.093s)
- **Status**: Production stable, fully tested June 2025

### **🚀 Current Performance:**
- **git status**: 0.093 seconds (vs 7+ seconds before)
- **git diff**: <0.1 seconds  
- **git commit**: <0.5 seconds
- **Repository health**: Clean, no corruption
- **Claude file access**: Direct read/write confirmed working

### **🔍 Optimal Development Workflow:**
- **Claude Direct Changes**: 1-2 file modifications (simple updates)
- **Replit Agent**: Complex multi-file changes (new features)
- **Hybrid Approach**: Claude analysis + precision prompts for agents

## 🚨 Common Issues & Solutions

### **Issue: Replit Agent File Confusion**
**Cause**: Agent creates duplicate files or modifies wrong workshop
**Solution**: Use precision prompts with explicit file constraints

### **Issue: Workshop Theme Mixing**
**Cause**: Shared components don't properly distinguish workshops
**Solution**: Check `isImaginalAgility` prop usage and theme consistency

### **Issue: Step ID Conflicts**
**Cause**: AST uses numbered IDs, IA uses ia-prefixed IDs
**Solution**: Always specify which step ID format to use

### **Issue: Navigation Data Mismatch**
**Cause**: Multiple navigation files or outdated data
**Solution**: Always verify against live menu before making changes

## 📍 Project Location

**Current Location**: `/Users/bradtopliff/Desktop/HI_Replit`  
**Remote Repository**: `https://github.com/equalsAndy/HI_Replit`  
**Live Application**: `https://app.heliotropeimaginal.com`  
**Replit Environment**: `https://replit.com/@brad74/Heliotrope-Imaginal-Main`  

---

**Last Updated**: June 27, 2025  
**Project**: Heliotrope Imaginal Dual-Workshop Platform