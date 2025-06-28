# Heliotrope Imaginal - Project Instructions

## 🚀 **BEFORE STARTING ANY WORK**

### **MANDATORY FIRST STEP:**
```bash
cd /Users/bradtopliff/Desktop/HI_Replit
git pull origin main
git status
```
**Never start work until Git is synced and clean.**

---

## 🎯 **What This Project Is**

**Dual-workshop platform with shared infrastructure:**
- **AST Workshop**: AllStarTeams (blue theme, numbered step IDs: 1-1, 2-1, etc.)
- **IA Workshop**: Imaginal Agility (purple theme, prefixed step IDs: ia-1-1, ia-2-1, etc.)
- **Platform**: Yellow header, admin tools, shared components

**Location**: `/Users/bradtopliff/Desktop/HI_Replit`

---

## 📁 **Where Things Are**

### **Key Files (Most Important)**
```
client/src/components/navigation/navigationData.ts    # Both workshop structures
client/src/components/content/imaginal-agility/ImaginalAgilityContent.tsx    # All IA content
client/src/pages/allstarteams.tsx                    # AST workshop page
client/src/pages/imaginal-agility.tsx               # IA workshop page
```

### **Content Organization**
```
client/src/components/content/
├── allstarteams/           # AST-specific content (separate files per step)
└── imaginal-agility/       # IA-specific content (single switch file)
```

### **Shared Components**
```
client/src/components/
├── navigation/             # Shared nav with workshop-specific behavior
├── assessment/             # Assessment modals and results
└── content/VideoPlayer     # Universal video player for both workshops
```

### **Assets**
```
public/assets/              # Web-accessible images, logos, graphics
attached_assets/            # Replit uploads (move to public/ for use)
```

---

## ⚠️ **Critical Rules**

### **Workshop Separation (NEVER MIX)**
- **AST files**: Only modify files in `allstarteams/` directories
- **IA files**: Only modify files in `imaginal-agility/` directories  
- **Shared files**: Affects both workshops - extra caution required

### **Step ID Formats**
- **AST**: Numbered (1-1, 2-1, 3-1, etc.)
- **IA**: Prefixed (ia-1-1, ia-2-1, ia-3-1, etc.)

### **Themes**
- **AST**: Blue theme, AllStarTeams branding
- **IA**: Purple theme, Imaginal Agility branding
- **Platform**: Yellow header (Heliotrope Imaginal)

---

## 🔧 **How to Make Changes**

### **Simple Changes (Claude Direct)**
- 1-2 file modifications
- Text/config updates
- CSS tweaks

### **Complex Changes (Replit Agent)**
- 3+ file modifications
- New features
- Multi-component updates
- Use precision prompts with constraints

### **Always Include in Prompts:**
- Which workshop (AST or IA or both)
- Exact file paths
- Critical constraints (don't modify X)
- Expected verification steps

---

## 📋 **Common Tasks**

### **IA Workshop Content (Most Common)**
**File**: `client/src/components/content/imaginal-agility/ImaginalAgilityContent.tsx`
**Structure**: Single file with switch statement for all 8 steps
**Current Steps**: ia-1-1, ia-2-1, ia-3-1, ia-4-1, ia-5-1, ia-6-1, ia-8-1 (ia-7-1 removed)

### **Navigation Changes**
**File**: `client/src/components/navigation/navigationData.ts`
**Arrays**: 
- `navigationSections[]` (AST)
- `imaginalAgilityNavigationSections[]` (IA)

### **Adding Graphics/Assets**
1. Move from `attached_assets/` to `public/assets/`
2. Import in components: `import image from '@assets/filename.png'`
3. Test web accessibility

### **Video Integration** 
Both workshops use shared VideoPlayer component:
```jsx
<VideoPlayer
  workshopType="imaginal-agility"  // or "allstarteams"
  stepId="ia-1-1"                  // or "1-1"
  aspectRatio="16:9"
  autoplay={true}
/>
```

---

## 🚨 **Git Workflow**

### **Before Changes:**
```bash
git pull origin main
git status  # Must be clean
```

### **After Changes:**
```bash
git status
git diff    # Review what changed
git add .
git commit -m "Descriptive message"
git push origin main
```

### **If Issues:**
```bash
git restore .     # Undo local changes
git reset --hard origin/main  # Nuclear reset (loses local work)
```

---

## 📊 **Workshop Structures**

### **AST Workshop (19 steps)**
- Section 1: Introduction (1-1)
- Section 2: Star Strengths (2-1, 2-2, 2-3, 2-4)
- Section 3: Flow (3-1, 3-2, 3-3, 3-4)
- Section 4: Potential (4-1, 4-2, 4-3, 4-4, 4-5)
- Section 5: Next Steps (5-1, 5-2, 5-3, 5-4)
- Section 6: Resources (6-1)

### **IA Workshop (8 steps - ia-7-1 removed)**
- ia-1-1: Introduction to Imaginal Agility
- ia-2-1: The Triple Challenge  
- ia-3-1: The Imaginal Agility Solution
- ia-4-1: Self-Assessment
- ia-5-1: Assessment Results
- ia-6-1: Teamwork Preparation
- ia-8-1: Neuroscience (skips from ia-6-1)

---

## 💡 **Brad's Working Style**

### **Communication Preferences**
- Step-by-step instructions with expected outcomes
- Clear command examples in code blocks
- Simple explanations when technical concepts needed
- Ask before making architectural decisions

### **Tool Coordination**
- **Claude**: Analysis, planning, precision prompts, simple edits
- **Replit Assistant**: Code questions, file structure queries
- **Replit Agent**: Multi-file implementations with detailed prompts
- **VS Code**: Available for personal quick edits

### **Message Management**
- Monitor usage at 80% capacity
- Create handoffs before hitting limits  
- Recommend new chats for scope changes
- Update docs with learnings

---

## 🎯 **Success Criteria**

### **Good Session Indicators**
- ✅ Git sync completed before work
- ✅ Clear tool choice with reasoning
- ✅ Changes work on first try
- ✅ No unintended modifications
- ✅ Workshop separation maintained

### **Red Flags**
- ❌ Starting without Git sync
- ❌ Modifying both AST and IA simultaneously
- ❌ Technical instructions without clear steps
- ❌ Changes break existing functionality
- ❌ Import errors or build failures

---

## 📞 **Emergency Commands**

```bash
# Check current state
git status

# Undo local changes
git restore .

# See recent commits
git log --oneline -5

# Reset to remote (nuclear option)
git fetch origin
git reset --hard origin/main
```

---

**Always start with Git sync. Always verify before committing. Always test both workshops when changing shared components.**

**Last Updated**: June 28, 2025  
**Environment**: Production ready, Git optimized