# Brad's Development Guide - Working with Claude

## 💡 Your Developer Profile

### **Technical Skill Level**
- **Not a programmer** but comfortable with file systems and console commands
- **Basic Git knowledge** - can follow commands but prefers clear step-by-step guidance
- **Comfortable with**: Terminal commands, file management, following instructions
- **Needs support with**: Complex Git operations, debugging code issues, technical architecture decisions

### **Preferred Communication Style**
- **Clear, step-by-step instructions** with expected outcomes
- **Safe testing approaches** before making major changes
- **Explicit confirmation** of what commands will do
- **Simple explanations** of technical concepts when needed
- **Ask clarifying questions**: Have Claude request clarification from external assistants when needed
- **Collaborative approach**: Use both Claude analysis and external tool knowledge

### **Development Context**
- **Uses external agents** (like Replit Agent) for code changes but they create too many checkpoints
- **Works with Claude** to create better prompts for external agents
- **Manages multiple products** with shared infrastructure
- **Concerned about costs** from unnecessary checkpoint/operation systems

## 🔧 Your Current Setup

### **Hardware & Environment**
- **macOS** with Claude Desktop
- **Project Location**: Usually `/Users/bradtopliff/Desktop/[ProjectName]`
- **Git**: Basic operations, prefers guided commands
- **Chrome**: Available for navigation and testing

### **Claude Desktop Configuration**
- **Filesystem Access**: Enabled via extensions
- **Chrome Integration**: Basic tab management and navigation
- **Git Integration**: Read-only repository analysis

## 🎯 How to Start New Development Projects with Claude

### **Step 1: Project Setup Conversation Starter**
```
I'm starting work on [project name/description].

Project details:
- Type: [web app/tool/etc.]
- Main goal: [what you're trying to build/fix]
- Current status: [new project/existing code/etc.]
- Location: /Users/bradtopliff/Desktop/[ProjectName]

My technical level: Comfortable with files/terminal but not a programmer.
Please use clear step-by-step instructions.

Reference my Brad's Development Guide for how to work with me.
```

### **Step 2: Share Project Context**
Always include one of these approaches:
1. **New Project**: "Help me plan the architecture and file structure"
2. **Existing Project**: "Analyze my current setup and suggest improvements"  
3. **Specific Problem**: "I need to fix [specific issue] in my [type] project"

### **Step 3: Request Approach Analysis**
```
Please analyze the best approach using the three hats framework:
- Black Hat: What could go wrong
- Yellow Hat: What are the benefits  
- Green Hat: What alternatives exist

Then recommend whether to use:
- Claude Direct changes (you modify files)
- Precision prompts (for external agents)
- Hybrid approach
```

## 📋 Your Git Workflow (Always Use This)

### **🔄 Before Claude Makes Changes**
```bash
cd /Users/bradtopliff/Desktop/[ProjectName]
git pull origin main
git status
```

### **🔄 After Claude Makes Changes**  
```bash
git status
git diff          # Review what changed
# [Test locally first!]
git add .
git commit -m "Descriptive message about the change"
git push origin main
```

### **🔄 If Using External Deployment (like Replit)**
- Check auto-sync OR manually pull in deployment environment
- Verify changes work in live application

## 🎨 How to Request Changes

### **For Simple Changes (Icons, Text, Config)**
```
I need to change [specific thing] in my [project type].

Current issue: [what's wrong]
Desired outcome: [what should happen]

Please use Claude Direct approach - analyze the files and make the changes.
Include Git reminders at the right workflow steps.
```

### **For Complex Changes (New Features, Architecture)**
```
I want to add [new feature/capability] to my [project].

Requirements:
- [specific requirement 1]
- [specific requirement 2]
- [etc.]

Please create a precision prompt for [external agent] that prevents:
- File confusion
- Unnecessary checkpoints
- Scope creep

Include explicit constraints and verification steps.
```

## 🚨 When Things Go Wrong

### **If Claude Can't Access Files**
1. **Check Claude Desktop extensions** are enabled
2. **Verify project is in** `/Users/bradtopliff/Desktop/`
3. **Try restarting Claude Desktop**
4. **Fallback**: Upload specific files to Claude for analysis

### **If Git Gets Confusing**
```bash
# Check current state
git status

# If you need to undo changes (before commit)
git restore .

# If you need to undo last commit (after commit)
git reset --soft HEAD~1

# If you're completely lost
git fetch origin
git reset --hard origin/main  # WARNING: This loses local changes
```

### **If External Agents Get Confused**
1. **Stop the agent** immediately
2. **Check what files were changed**
3. **Ask Claude to create a more specific prompt** with tighter constraints
4. **Consider switching to Claude Direct approach** for simpler changes

## 📝 Templates for Common Requests

### **New Project Setup**
```
I'm starting a new [type] project called [name].

Goals: [what it should do]
Tech preferences: [any specific requirements]
Location: /Users/bradtopliff/Desktop/[name]

Please help me:
1. Plan the file structure
2. Set up Git repository  
3. Create initial files
4. Set up development workflow

Use Claude Direct approach and include Git setup guidance.
```

### **Fix Existing Issue**
```
I have an issue with my [project name] project.

Problem: [specific issue description]
Expected behavior: [what should happen instead]
Current setup: [brief description]

Please:
1. Analyze my current files to understand the issue
2. Recommend the best fix approach
3. Either make direct changes or create precision prompts
4. Include testing steps

Project location: /Users/bradtopliff/Desktop/[name]
```

### **Add New Feature**
```
I want to add [feature] to my [project name].

Feature requirements:
- [requirement 1]
- [requirement 2]

Please analyze:
- How complex is this change?
- Should we use Claude Direct or external agent?
- What files need to be modified?
- What could go wrong?

Then proceed with implementation using the best approach.
```

## 🎯 Success Indicators

### **Good Development Session**
- ✅ Clear step-by-step instructions provided
- ✅ Git workflow reminders at appropriate times
- ✅ Changes work on first try
- ✅ No scope creep or unexpected modifications
- ✅ Easy to verify and test results

### **When to Ask for Different Approach**
- ❌ Instructions are too technical or unclear
- ❌ Changes break something unexpectedly
- ❌ Git workflow gets complicated
- ❌ External agents create too many unnecessary files
- ❌ Can't easily verify if changes worked

## 📞 Emergency Commands

### **Stop Everything and Reset**
```bash
# Check what's happening
git status

# If files are messed up (before commit)
git restore .

# If you committed bad changes
git log --oneline -5  # See recent commits
git reset --soft HEAD~1  # Undo last commit, keep changes
git reset --hard HEAD~1  # Undo last commit, lose changes
```

### **Get Back to Known Good State**
```bash
# Nuclear option: reset to remote
git fetch origin
git reset --hard origin/main
```

---

## 💬 Communication Patterns

### Prompt Consistency:
- Use standardized format: `# REPLIT AGENT: [Task]`
- Include: PROBLEM, ROOT CAUSE, REQUIRED FIXES, VERIFICATION
- End with bold execution statement
- Keep technical details in code blocks

### Development Preferences:
- **Ask before simplifying complex logic** - Get approval before changing user experience
- **Centralize functionality** only when explicitly requested
- **Match existing patterns** (e.g., admin page logic for consistency)
- **Real-time data accuracy** over static displays
- **No UX decisions without approval** - Implement exactly what's specified in prompts

### Asset Management:
- **Logo issues**: Always check actual files vs. expected files
- **Web assets**: Must be in `/public/` directory
- **Git sync**: Resolve binary file conflicts with `git checkout --ours`

---

**Your Development Philosophy**: Keep it simple, test frequently, understand what's happening, and ask for clarification when things get technical.

**Last Updated**: June 27, 2025  
**For**: Brad Topliff's development workflow with Claude