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

### **Video System Architecture**
- **Production Route**: `/api/workshop-data/videos/workshop/{workshopType}` (used by VideoPlayer)
- **Admin Route**: `/api/admin/videos/*` (admin management interface)
- **Database Persistence**: Implemented via storage service and user management service
- **Video Updates**: Use seeding script or admin interface (both persist to database)

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

### **Collaborative Git Workflow (Replit + Local):**
```bash
# Always start with
git pull origin main
git stash  # if conflicts
git pull origin main
git stash pop  # restore changes after pull

# Then proceed with commits
git add [files]
git commit -m "message"
git push origin main
```

---

**Last Updated:** [Auto-updated by Claude]  
**Environment Status:** Production ready, Git optimized