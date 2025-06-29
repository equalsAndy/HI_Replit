# Claude Development Session Starter

## 🚨 MANDATORY FIRST CHECK
**Always start by asking Brad:**
```
Before we begin, please run:
cd /Users/bradtopliff/Desktop/HI_Replit
git pull origin main
git status

Report the results - we don't start work until Git is synced and clean.
```

## 📊 **Message Usage Management**
- **Monitor usage throughout sessions** and warn at logical breakpoints
- **High usage activities**: Code writing, file operations, artifact creation, complex analysis
- **Resource planning**: Factor in planned Agent prompts and multi-file changes
- **At 80% estimated capacity**: "⚠️ We're at ~80% usage capacity. Should I create a handoff for the next chat?"
- **Create handoffs**: Before hitting limits or when scope significantly changes
- **Conservative approach**: Better to preserve capacity for implementation work than risk hitting limits mid-task

## 🛠️ **Tool Decision Matrix**

### **Replit Assistant (Questions)**
Give Brad: `Ask Replit Assistant: "[exact question]"`
- File structure queries
- Current implementation questions
- "How is X currently working?"

### **Replit Agent (Implementation)**  
Give Brad: Precision prompt with `# REPLIT AGENT: [Task]`
- Multi-file changes (3+ files)
- New features or components
- Complex implementations

### **Claude Direct (Simple)**
Handle directly without external tools:
- 1-2 file modifications
- Text/config updates
- Analysis and planning

### **Shell Commands**
Give Brad: `Run: [command]`
- Git operations
- File navigation
- Quick verification

## ⚠️ **Critical Project Rules**

### **Workshop Separation (NEVER MIX)**
- **AST**: Blue theme, numbered step IDs (1-1, 2-1, etc.)
- **IA**: Purple theme, prefixed step IDs (ia-1-1, ia-2-1, etc.)
- Always specify which workshop in prompts

### **Key Files**
- **IA Content**: `client/src/components/content/imaginal-agility/ImaginalAgilityContent.tsx` (single switch file)
- **Navigation**: `client/src/components/navigation/navigationData.ts`
- **AST vs IA**: Separate directories, never modify both simultaneously

### **Git Safety**
- Always `git status` before changes
- Use `git diff` to verify changes
- Never proceed without clean Git state

## 📁 **Project Context**
**Location**: `/Users/bradtopliff/Desktop/HI_Replit`
**Type**: Dual-workshop platform (AST + IA)
**Status**: Production ready, Git optimized
**Brad's Level**: Comfortable with files/terminal, needs technical guidance

## 🎯 **Standard Session Pattern**
1. **Git sync check** (mandatory first step)
2. **Problem analysis** → Tool decision → Precise instructions
3. **Brad executes** → Reports results → Next coordinated step
4. **Update docs** if changes affect future sessions
5. **Monitor usage** → Handoff before limits

**Always coordinate, never assume. Always verify Git sync first. Always specify which tool and why.**