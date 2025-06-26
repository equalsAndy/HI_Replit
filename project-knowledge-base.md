## 📄 **Complete Updated Project Knowledge Base File**

```markdown
# Heliotrope Imaginal - Project Knowledge Base

## 🎯 Project Overview

**Heliotrope Imaginal** is a dual-workshop platform with shared infrastructure and distinct workshop experiences:

- **Overall Platform**: Heliotrope Imaginal (yellow header bar)
- **AST Workshop**: AllStarTeams (blue theme, numbered step IDs)
- **IA Workshop**: Imaginal Agility (purple theme, ia- prefixed step IDs)
- **Shared Features**: Admin dashboards, facilitator tools, authentication

## ✅ Environment Status (June 2025)
- **Claude Code**: ✅ Installed and operational
- **Git Performance**: ✅ Fast (0.093s operations)
- **iCloud Protection**: ✅ Active (.git excluded)
- **File Access**: ✅ Claude direct editing confirmed

## 💡 User Communication Preferences
- **Adaptive Step Delivery**: Single step when Claude needs output verification, multiple steps when sequential and independent
- **Development Context**: Uses Replit Agent for complex changes, Claude for simple changes, Claude Code for analysis

## 🤖 Replit Assistant Integration

**When to Request Assistant Help:**
- Complex file system analysis (finding/auditing components)
- Multi-file code pattern identification  
- Current implementation discovery
- Performance/behavior assessment
- Architecture mapping
- Video/component inconsistency analysis

**Assistant Request Template:**
```
"Please analyze [specific aspect] in this project and provide [specific deliverable]. 
Focus on [key constraints/requirements]."
```

**Claude Focus Areas After Assistant Analysis:**
- Strategy and planning based on Assistant findings
- Risk assessment and mitigation  
- Implementation prompt creation for Replit Agent
- Documentation synthesis and architectural recommendations

**Example Workflow:**
1. **Assistant**: "Analyze video implementations across workshops"
2. **Claude**: Creates standardization strategy and Replit Agent prompts
3. **Replit Agent**: Executes implementation based on Claude's plan

**Benefits:**
- ✅ Saves Claude message limits for strategy work
- ✅ Leverages Assistant's direct code access
- ✅ Focuses Claude on high-value synthesis
- ✅ Creates efficient discovery → planning → implementation workflow

## 🎯 Video Component Standardization (Lessons Learned)

### **Issue Resolution: Video Display Inconsistencies**
- **Problem**: Different video implementations causing sizing/responsive behavior differences
- **Root Cause**: Multiple files with similar names, custom YouTube API vs VideoPlayer component
- **Solution**: Standardize all video displays to use VideoPlayer component with identical props

### **VideoPlayer Standardization Pattern:**
```jsx
<div className="mb-8 max-w-4xl mx-auto">
  <VideoPlayer
    workshopType="allstarteams"
    stepId="[step-id]"
    fallbackUrl="[youtube-url]"
    title="[video-title]"
    aspectRatio="16:9"
    autoplay={true}
    onProgress={(progress) => console.log('Video progress:', progress)}
    startTime={0}
  />
</div>
```

### **Critical Implementation Notes:**
- **File naming consistency**: Use PascalCase (WellBeingView.tsx not WellbeingView.tsx)
- **Avoid custom YouTube API**: Use VideoPlayer component for consistency
- **Check actual imports**: Apps may import different files than expected
- **Delete duplicate files**: Prevent confusion between similar filenames

## 🔄 Enhanced Development Workflow

### **Multi-Environment Git Management:**
- **Always specify location**: "In Replit terminal" vs "In VS Code terminal"
- **Check git status first**: Identify which files are actually tracked
- **Handle divergent branches**: Use `git config pull.rebase false` then `git pull origin main`
- **Resolve merge conflicts**: Keep the most precise/recent implementation

### **File Duplication Issues:**
- **Search for imports**: Find which files are actually being used by the app
- **Test with copy/paste**: Quick way to identify correct file
- **Clean up immediately**: Remove duplicates to prevent future confusion
- **Use exact filenames**: Check `git status` for actual tracked names

### **Testing Deployment Workflow:**
1. **Make changes locally** (VS Code)
2. **Commit and push** (VS Code terminal): `git add [files] && git commit -m "..." && git push origin main`
3. **Pull in Replit** (Replit terminal): `git pull origin main`  
4. **Test in browser** (Replit preview)
5. **Iterate as needed**

## 🚨 Common Git Issues & Solutions

### **Divergent Branches:**
- **Symptom**: `fatal: Need to specify how to reconcile divergent branches`
- **Solution**: 
  ```bash
  git config pull.rebase false
  git pull origin main
  ```

### **Push Rejected (Non-Fast-Forward):**
- **Symptom**: `Updates were rejected because the tip of your current branch is behind`
- **Solution**: Always pull before pushing
  ```bash
  git pull origin main
  git push origin main
  ```

### **Local Changes Would Be Overwritten:**
- **Symptom**: `Your local changes to the following files would be overwritten by merge`
- **Solutions**:
  - **Keep local**: `git add . && git commit -m "Save local changes"`
  - **Discard local**: `git restore [filename]`
  - **Remove old file**: `git rm [filename]`

### **Merge Commit Editor:**
- **Vim commands**: `i` (insert) → type message → `Esc` → `:wq` (save & quit)
- **Quick exit**: `Esc` → `:q!` (quit without saving - uses default message)

## 🔧 File Management Best Practices

### **Filename Consistency Checks:**
- **Always check**: `git status` shows actual tracked filenames
- **React convention**: PascalCase for components (`WellBeingView.tsx`)
- **Case sensitivity**: macOS/Windows ignore case, but Git tracks exact case
- **Import verification**: Ensure imports match actual filenames

### **Preventing Duplicate Files:**
- **Before creating files**: Check if similar names exist
- **Search patterns**: Look for variations (WellBeing vs Wellbeing vs wellbeing)
- **Clean up immediately**: Remove unused duplicates as soon as identified
- **Team communication**: Document naming conventions

## 📋 Troubleshooting Workflow

### **When Things Go Wrong:**
1. **Stop and assess**: `git status` to see current state
2. **Identify the issue**: Read error messages carefully
3. **Choose resolution strategy**: Commit, restore, or remove conflicting files
4. **Test the fix**: Verify solution works before continuing
5. **Document the solution**: Add to knowledge base for future reference

### **Emergency Reset (Use Sparingly):**
```bash
# Nuclear option - resets local to match remote exactly
git fetch origin
git reset --hard origin/main
# ⚠️ This loses ALL local changes
```

## 💡 Working with Claude - Optimizations

### **Effective Collaboration Patterns:**
- **Always specify command locations**: Prevents confusion between VS Code/Replit terminals
- **Show actual file contents**: Copy/paste current code rather than describing it
- **Request complete replacements**: "Give me the whole file" vs partial edits
- **Use Replit Assistant for discovery**: Complex file analysis, then Claude for strategy
- **Test immediately**: Don't accumulate multiple changes without testing

### **Precision Over Speed:**
- **Agent limitations**: Creates "close enough" solutions vs exact matches
- **Claude strengths**: Exact pattern recognition and replication
- **File access**: Claude can read/edit local files directly when safe
- **Simple changes**: Claude direct editing preferred over Agent complexity

### **Environment Considerations:**
- **Git performance**: 0.093s operations (iCloud conflicts resolved)
- **File access**: Claude can safely read/write desktop files
- **Multiple environments**: Keep VS Code, Replit, and Git synchronized
- **Filename casing**: macOS case-insensitive, but Git tracks exact case

## 📚 Environment Setup Checklist

### **Development Session Startup:**
1. **Check git status** in both VS Code and Replit
2. **Pull latest changes** before starting work: `git pull origin main`
3. **Verify tracked filenames**: Use `git status` not just file explorer
4. **Test basic functionality** before making changes

### **Required Configurations:**
- **VS Code command line tools**: `code .` command working
- **Git pull strategy**: `git config pull.rebase false` set
- **Replit terminal access**: Shell/Console tab accessible
- **File naming awareness**: Understand PascalCase conventions

---

**Project Location**: /Users/bradtopliff/Desktop/HI_Replit
**Last Updated**: June 26, 2025
**Status**: Video standardization complete, workflow optimized, Git troubleshooting documented
**Project**: Heliotrope Imaginal Dual-Workshop Platform
```
