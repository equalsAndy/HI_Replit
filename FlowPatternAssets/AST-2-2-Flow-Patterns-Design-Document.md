# AST 2-2 Flow Patterns - Design Document (Simplified)

**Workshop:** AllStarTeams (AST)  
**Step:** 2-2 (Flow Patterns)  
**File:** `IntroToFlowView.tsx`  
**Theme:** Blue

---

## 📋 Page Overview

This page guides users through understanding flow state, taking a flow assessment, and adding flow attributes to their Star Card. The page uses progressive revelation to show content based on user actions.

---

## 🎨 Progressive Revelation States

1. **Initial State** - Flow introduction + video
2. **After Assessment** - Results display + attributes activity button
3. **After Button Click** - Flow attributes selection area appears
4. **After Attributes Added** - Complete state with Continue button

---

## 📄 Content Sections by Area

### AREA 1: Page Header
**State:** Always visible

**COPY:**
```
"Flow Patterns"
```

---

### AREA 2: Introduction Video
**State:** Always visible  
**Video ID:** `KGv31SFLKC0` (fallback)

Standard video player with transcript and glossary.

---

### AREA 3: "Some Things to Know" Section
**State:** Always visible

#### Header
**COPY:**
```
"📚 Some Things to Know"
```

#### Understanding Flow
**COPY:**
```
HEADING: "Understanding Flow"

BODY:
"Flow is when you're fully absorbed in an activity—energized, focused, and enjoying the moment. Time seems to disappear."
```

#### Key Conditions Grid
2x2 grid on desktop, stacked on mobile. Each box has heading + body text + background image at low opacity.

**Box 1: Clear Goals**
```
HEADING: "Clear Goals"
BODY: "You know exactly what to do next"
IMAGE: /assets/clear_goals.png
THEME: Blue
```

**Box 2: Balanced Challenge & Skill**
```
HEADING: "Balanced Challenge & Skill"
BODY: "Hard enough to engage, not so hard it creates anxiety"
IMAGE: /assets/balance_skill.png
THEME: Purple
```

**Box 3: Immediate Feedback**
```
HEADING: "Immediate Feedback"
BODY: "You can adjust in real time"
IMAGE: /assets/immediate_feedback.png
THEME: Indigo
```

**Box 4: Deep Concentration**
```
HEADING: "Deep Concentration"
BODY: "Distraction-free attention on the task"
IMAGE: /assets/deep_concentration.png
THEME: Green
```

#### Benefits of Flow
**COPY:**
```
HEADING: "Benefits of Flow"

BULLETS:
• Higher productivity & performance
• More creativity & innovation
• Greater satisfaction & motivation
• Reduced stress & anxiety
• Stronger learning & skill growth
```

---

### AREA 4: Flow Assessment Launch
**State:** Changes after assessment completion

#### Before Assessment
**COPY:**
```
ICON: ⚡ (Lightning bolt)

HEADING: "Your Flow Self-Assessment"

DESCRIPTION: 
"Discover your personal flow patterns and what conditions help you perform at your best."

BUTTON: "Take the Flow Assessment"
```

#### After Assessment
**COPY:**
```
SUCCESS MESSAGE:
"✅ You've completed the flow assessment! Your results are displayed below."
```

---

### AREA 5: Assessment Results (Conditional)
**State:** Only visible after assessment completion

#### Results Header
**COPY:**
```
HEADING: "Your Flow Assessment Results"
```

#### Score Display
**COPY:**
```
SCORE: "[score] / 60"
LEVEL: "[Flow Fluent/Flow Aware/Flow Blocked/Flow Distant]"
```

#### Level Interpretations

**Flow Fluent (50-60)**
```
"You reliably access flow and have developed strong internal and external conditions to sustain it."
```

**Flow Aware (39-49)**
```
"You are familiar with the experience but have room to reinforce routines or reduce blockers."
```

**Flow Blocked (26-38)**
```
"You occasionally experience flow but face challenges in entry, recovery, or sustaining focus."
```

**Flow Distant (0-25)**
```
"You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed."
```

#### Response Summary (Expandable)
**COPY:**
```
HEADER: "Your Responses Summary"
```

Shows all 12 questions with user's answers. Expandable/collapsible with chevron icon.

#### Next Steps Section
**COPY:**
```
HEADING: "What's Next?"

DESCRIPTION:
"After completing your flow assessment, you'll explore your results in more detail and learn how to create more opportunities for flow in your work and life. This understanding will be added to your Star Card to create a complete picture of your strengths and optimal performance conditions."

BUTTON: "Let's put your flow on your Star Card"
```

---

### AREA 6: Add Flow to Star Card (Conditional)
**State:** Hidden until "Let's put your flow on your Star Card" button clicked

#### Section Header
**COPY:**
```
"Add Flow to Your Star Card"
```

#### Context Banner
**COPY:**
```
"Flow attributes represent how you work at your best. They complement your Star strengths profile which shows what you're naturally good at. Together, they create a more complete picture of your professional identity and help others understand how to collaborate with you effectively."
```

#### Flow State Video
**Video ID:** `jGVtiaQJ1a4` (fallback)  
**Title:** "Flow State Introduction"

#### Attributes Already Set Banner (Conditional)
**State:** Only if attributes exist and not in edit mode

**COPY:**
```
HEADING: "✓ Flow Attributes Already Set"
DESCRIPTION: "Your flow attributes have been saved and appear on your Star Card."
BUTTON: "Edit Attributes"
```

#### Workshop Complete Banner (Conditional)
**State:** Only if workshop is complete

**COPY:**
```
"Workshop complete. Your responses are locked, but you can watch videos and read your answers."
ICON: 🔒
```

---

### AREA 7: Two-Column Layout
**Layout:** 50/50 split on desktop, stacked on mobile

#### Left Column: Flow Attribute Selector

##### When Attributes Exist (Read-only)
**COPY:**
```
HEADING: "Your Flow Attributes"

DESCRIPTION:
"These attributes reflect how you work at your best when in flow state."

INSTRUCTION:
"Think of a moment when you were completely absorbed and performing at your peak. In that flow state, what qualities emerged? Select 4 words below in order of how strongly you associate with them."
```

Shows 4 selected attributes as read-only badges with rankings.

##### When Selecting Attributes
**COPY:**
```
HEADING: "Select Your Flow Attributes"

INSTRUCTION:
"Think of a moment when you were completely absorbed and performing at your peak. In that flow state, what qualities emerged? Select 4 words below in order of how strongly you associate with them."

PLACEHOLDER TEXT:
"Select a word below to add it to your flow attributes"

SECTION LABEL: "Flow Attributes:"
```

**Features:**
- Drag-and-drop reordering of selected attributes
- Click to select/deselect from grid of 56 attributes
- Tooltips on hover showing descriptions
- Numbered badges (1-4) for ranking
- Remove (X) buttons on selected attributes

**Attribute Organization:**
- 56 total attributes across 4 quadrants
- Each quadrant has 14 attributes
- Quadrants: Thinking (Green), Feeling (Blue), Planning (Yellow), Acting (Red)
- Each attribute has a hover tooltip with description

##### Cancel Button (Conditional)
**State:** Only shown during edit mode if card was already complete

**COPY:**
```
"Cancel and keep my current attributes"
```

#### Right Column: Star Card Preview

**COPY:**
```
HEADING: "Your Star Card"
```

Shows live preview of Star Card with:
- Strength percentages
- Flow attributes when selected
- Interactive display

##### Add/Update Button (Conditional)
**State:** Only shown when 4 attributes selected

**COPY:**
```
(when first adding): "Add Flow Attributes to Star Card"
(when updating): "Update Flow Attributes"
(while saving): "Saving..."
```

##### Continue Button (Conditional)
**State:** Only shown when attributes are saved

**COPY:**
```
"Continue to Recap"
```

---

## 🎯 Flow Assessment Modal

**Opens when:** "Take the Flow Assessment" button clicked

**Content:**
- 12 questions total
- Rating scale: 1 (Never) to 5 (Always)
- Instructions explain the scale
- Questions focus on flow experience at work

**Not listing individual questions here** - they remain in the component code.

---

## 📝 Content Changes We're Planning

**Areas to Review/Update:**
1. Introduction copy in "Understanding Flow" section
2. Key Conditions boxes - headings and descriptions
3. Benefits list
4. Assessment launch description
5. Context banner explaining flow attributes
6. Instructions for attribute selection
7. Next steps descriptions

**Areas NOT Changing:**
- Flow attributes list (56 attributes)
- Assessment questions (12 questions)
- Technical functionality
- Progressive revelation behavior
