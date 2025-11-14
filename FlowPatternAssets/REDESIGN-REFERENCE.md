# AST 2-2 Flow Patterns Redesign - Quick Reference (UPDATED)

## 📋 WHAT WE'RE DOING

Redesigning the "Understanding Flow" section of AST step 2-2 with:
1. **FlowDiagram.png** next to intro text and benefits (50/50 layout)
2. **Move Benefits list** to left column (with intro text)
3. **Green checkmarks** instead of bullet points for benefits
4. **KEEP Key Conditions unchanged** - preserve existing 2x2 grid with SVG background images

## 🎯 LAYOUT DIAGRAM

```
┌──────────────────────────────────────────────────┐
│  📚 Understanding Flow                           │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────────┐  ┌───────────────────┐   │
│  │ LEFT: 50%        │  │ RIGHT: 50%        │   │
│  │                  │  │                   │   │
│  │ Flow is when...  │  │  FlowDiagram.png  │   │
│  │                  │  │                   │   │
│  │ Benefits:        │  │   [IMAGE]         │   │
│  │ ✓ Productivity   │  │                   │   │
│  │ ✓ Creativity     │  │                   │   │
│  │ ✓ Satisfaction   │  │                   │   │
│  │ ✓ Reduced stress │  │                   │   │
│  │ ✓ Learning       │  │                   │   │
│  └──────────────────┘  └───────────────────┘   │
│                                                   │
├──────────────────────────────────────────────────┤
│  Key Conditions (UNCHANGED - 2x2 with SVGs)      │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ [SVG bg]     │  │ [SVG bg]     │            │
│  │ Clear Goals  │  │ Balanced     │            │
│  │ (Blue)       │  │ Challenge    │            │
│  │              │  │ (Purple)     │            │
│  └──────────────┘  └──────────────┘            │
│                                                   │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ [SVG bg]     │  │ [SVG bg]     │            │
│  │ Immediate    │  │ Deep         │            │
│  │ Feedback     │  │ Concentration│            │
│  │ (Indigo)     │  │ (Green)      │            │
│  └──────────────┘  └──────────────┘            │
└──────────────────────────────────────────────────┘
```

## 📁 FILES & ASSETS

**Claude Code Prompt:**
`/Users/bradtopliff/Desktop/HI_Replit/Claude Code Prompts/ast-2-2-flow-patterns-redesign.txt`

**File to Edit:**
`/Users/bradtopliff/Desktop/HI_Replit/client/src/components/content/IntroToFlowView.tsx`

**Image Location:**
- Source: `/Users/bradtopliff/Desktop/HI_Replit/FlowPatternAssets/FlowDiagram.png`
- Destination: `/Users/bradtopliff/Desktop/HI_Replit/client/public/assets/FlowDiagram.png`
- Reference in code: `/assets/FlowDiagram.png`

## 🚀 EXECUTION STEPS

1. **Copy FlowDiagram.png** to the correct location:
   ```bash
   cp /Users/bradtopliff/Desktop/HI_Replit/FlowPatternAssets/FlowDiagram.png \
      /Users/bradtopliff/Desktop/HI_Replit/client/public/assets/FlowDiagram.png
   ```

2. **Give prompt to Claude Code:**
   - Open Claude Code
   - Paste contents of `ast-2-2-flow-patterns-redesign.txt`
   - Let Claude Code implement the changes

3. **Test on localhost:8080:**
   - Navigate to AST step 2-2
   - Verify layout on desktop and mobile
   - Check that diagram displays
   - **Confirm Key Conditions still show SVG backgrounds**

4. **Git workflow:**
   ```bash
   git checkout development
   git add client/src/components/content/IntroToFlowView.tsx
   git add client/public/assets/FlowDiagram.png
   git commit -m "feat(ast-2-2): Add FlowDiagram and reorganize Understanding Flow layout"
   git push origin development
   ```

## ✅ SUCCESS CRITERIA

- [x] FlowDiagram.png displays next to intro text
- [x] Benefits list in left column with intro text
- [x] Benefits have green checkmarks (not bullets)
- [x] **Key Conditions UNCHANGED - still show SVG backgrounds**
- [x] **All 4 condition boxes still have images: clear_goals.png, balance_skill.png, immediate_feedback.png, deep_concentration.png**
- [x] Responsive layout works on mobile
- [x] All existing functionality preserved

## 🎨 WHAT CHANGES

**Changes:**
- ✅ Two-column layout (text left, diagram right)
- ✅ Benefits moved from bottom to left column
- ✅ Checkmarks replace bullets

**Stays the Same:**
- ❌ Key Conditions section completely unchanged
- ❌ SVG background images preserved
- ❌ 2x2 grid layout preserved
- ❌ All condition box styling preserved

## 📝 NOTES

- Only modifying the intro and benefits section
- NOT touching Key Conditions at all
- Purely visual reorganization - no functional changes
- Mobile-first responsive approach
- Key Conditions will continue to show SVG backgrounds at low opacity
