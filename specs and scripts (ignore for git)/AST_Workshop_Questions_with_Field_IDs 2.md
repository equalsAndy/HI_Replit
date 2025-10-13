# AllStarTeams (AST) Workshop - Questions with Field IDs

## Overview
This document contains all workshop questions in sequential order with their corresponding field IDs for database storage and API integration.

---

## Section 1: Star Strengths Assessment (Step 2-1)

### Assessment Format
**Type**: Ranking-based assessment
**Method**: 22 multiple-choice questions, rank options 1-4 (most to least descriptive)
**Database Field**: `user_assessments.results` (JSON)
**Assessment Type**: `starCard`

### Output Structure
```json
{
  "thinking": 38,
  "acting": 12,
  "feeling": 21,
  "planning": 29
}
```

### The 4 Strength Categories
1. **THINKING** (Green) - Strategic analysis, problem-solving, innovation, analytical mindset
2. **FEELING** (Blue) - Relationship building, empathy, team dynamics, emotional intelligence
3. **ACTING** (Red) - Execution, implementation, results orientation, decisive action
4. **PLANNING** (Yellow) - Organization, structure, systematic approach, methodical thinking
5. **IMAGINATION** (Purple/Star) - Always at apex, unlimited potential, enhances all strengths

---

## Section 2: Strength Reflections (Step 2-1 continued)

### Format
**Type**: Progressive text-based reflections (7 total)
**Minimum Length**: 25 characters per reflection
**Database Table**: `workshop_step_data`
**Step ID**: `2-1`

### Reflection Field IDs

| Reflection | Field ID | Question | Min Length |
|------------|----------|----------|------------|
| Strength #1 | `strength-1` | "How and when do you use your [1st ranked] strength?" | 25 |
| Strength #2 | `strength-2` | "How and when do you use your [2nd ranked] strength?" | 25 |
| Strength #3 | `strength-3` | "How and when do you use your [3rd ranked] strength?" | 25 |
| Strength #4 | `strength-4` | "How and when do you use your [4th ranked] strength?" | 25 |
| Imagination | `imagination` | "Your Apex Strength is Imagination - How do you think about your imagination and when do you use it?" | 25 |
| Team Values | `team-values` | "What You Value Most in Team Environments" | 25 |
| Unique Contribution | `unique-contribution` | "Your Unique Contribution - How do your top strengths work together to create value?" | 25 |

### Database Storage Mapping
```typescript
// API saves to workshop_step_data table
{
  userId: number,
  workshopType: 'ast',
  stepId: '2-1',
  data: {
    strength1: string,          // Maps to strength-1
    strength2: string,          // Maps to strength-2
    strength3: string,          // Maps to strength-3
    strength4: string,          // Maps to strength-4
    imaginationReflection: string, // Maps to imagination
    teamValues: string,         // Maps to team-values
    uniqueContribution: string  // Maps to unique-contribution
  }
}
```

### Reflection Focus Areas by Strength

**THINKING Strength**
- Situations where analytical skills uncovered insights
- How you've developed innovative solutions
- Times when logical approach clarified complex issues
- How strategic thinking opened new possibilities

**PLANNING Strength**
- Situations where organizational skills created clarity
- How you've implemented systems that improved efficiency
- Times when structured approach prevented problems
- How methodical nature helps maintain consistency

**FEELING Strength**
- Situations where you built trust or resolved conflicts
- How you've created inclusive environments
- Times when empathy improved team dynamics
- How people-focused approach enhanced collaboration

**ACTING Strength**
- Situations where you took initiative when others hesitated
- How you've turned ideas into tangible results
- Times when decisiveness moved a project forward
- How pragmatic approach solved practical problems

**IMAGINATION (Apex Strength)**
- Using imagination to envision possibilities that don't yet exist
- Seeing beyond current constraints and limitations
- Engaging imagination when solving complex problems or planning
- Connecting seemingly unrelated ideas to create new solutions
- Tapping into imagination during creative work, strategic planning, innovation
- Exploring "what if" scenarios

**TEAM VALUES**
- Team communication styles that work best for you
- Type of structure or flexibility you prefer
- How you like feedback to be given and received
- What makes you feel most supported and effective

**UNIQUE CONTRIBUTION**
- How your combination of strengths creates unique value
- What you bring that others might not
- How your perspective or approach differs from teammates
- Specific ways you help teams succeed

---

## Section 3: Flow Assessment (Step 2-2)

### Assessment Format
**Type**: 12-question Likert scale assessment
**Scale**: 1-5 (Never to Always)
**Total Score Range**: 12-60 points
**Database Table**: `flow_attributes`
**Field**: `attributes` (JSON)

### Response Scale
- **1: Never** (Red)
- **2: Rarely** (Orange)
- **3: Sometimes** (Yellow)
- **4: Often** (Green)
- **5: Always** (Purple)

### The 12 Flow Questions

| # | Question | Measures |
|---|----------|----------|
| 1 | "I often feel deeply focused and energized by my work." | Energy and focus levels |
| 2 | "The challenges I face are well matched to my skills." | Challenge-skill balance |
| 3 | "I lose track of time when I'm fully engaged." | Time distortion |
| 4 | "I feel in control of what I'm doing, even under pressure." | Sense of control |
| 5 | "I receive clear feedback that helps me stay on track." | Feedback loops |
| 6 | "I know exactly what needs to be done in my work." | Clarity of goals |
| 7 | "I feel more spontaneous when I'm in flow." | Natural action |
| 8 | "I can do things almost effortlessly." | Ease and ability |
| 9 | "I enjoy the process itself, not just the results." | Intrinsic motivation |
| 10 | "I have rituals or environments that help me quickly get into deep focus." | Flow triggers |
| 11 | "I forget to take breaks because I'm so immersed." | Complete absorption |
| 12 | "I want to recapture this experience again—it's deeply rewarding." | Desire to repeat |

### Flow Score Interpretation
- **50-60: Flow Fluent** - Reliably access flow with strong conditions
- **39-49: Flow Aware** - Familiar but room to reinforce routines
- **26-38: Flow Blocked** - Occasional flow, challenges in entry/recovery
- **12-25: Flow Distant** - Rarely experience flow, need foundational improvements

---

## Section 3B: Flow Attributes Selection (Step 2-2 continued)

### Selection Format
**Type**: Word selection and ranking task
**Method**: Select 4 words from 56 options, rank 1-4
**Database Table**: `flow_attributes`
**Field**: `attributes` (JSONB array)
**API Endpoints**:
- GET: `/api/workshop-data/flow-attributes`
- POST: `/api/workshop-data/flow-attributes`

### Purpose
Flow attributes describe **how you work at your best** when in flow state. They complement your Star strengths profile (which shows **what** you're naturally good at) to create a complete picture of your professional identity for team collaboration.

### Selection Instructions
**Prompt**: "Add Flow to Your Star Card - Select four flow attributes that best describe your optimal flow state. These will be added to your StarCard."

**Example Statement**: "I find myself in flow when I am being: Dynamic, Punctual, Receptive, Encouraging"

### The 56 Flow Attributes

**Thinking Quadrant (14 attributes):**
- Abstract, Analytic, Astute, Big Picture, Curious
- Focused, Insightful, Logical, Investigative, Rational
- Reflective, Sensible, Strategic, Thoughtful

**Feeling Quadrant (12 attributes):**
- Collaborative, Creative, Encouraging, Expressive
- Empathic, Intuitive, Inspiring, Objective, Passionate
- Positive, Receptive, Supportive

**Planning Quadrant (14 attributes):**
- Detail-Oriented, Diligent, Immersed, Industrious, Methodical
- Organized, Precise, Punctual, Reliable, Responsible
- Straightforward, Tidy, Systematic, Thorough

**Acting Quadrant (16 attributes):**
- Adventuresome, Competitive, Dynamic, Effortless, Energetic
- Engaged, Funny, Persuasive, Open-Minded, Optimistic
- Practical, Resilient, Spontaneous, Vigorous

### Database Storage Structure
```typescript
// Stored in flow_attributes table
{
  id: serial,
  userId: number,
  attributes: [
    { "name": "Dynamic", "order": 1 },
    { "name": "Punctual", "order": 2 },
    { "name": "Receptive", "order": 3 },
    { "name": "Encouraging", "order": 4 }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Selection Rules
- **Exactly 4 attributes** must be selected
- Attributes must be **ranked 1-4** (order matters for display)
- Users can reorder via drag-and-drop interface
- Attributes are editable until workshop completion
- Appears on StarCard visualization

### Integration with StarCard
Selected flow attributes are displayed on the user's StarCard alongside their strength percentages, providing a comprehensive professional profile that shows both **what they're good at** (strengths) and **how they work at their best** (flow attributes).

### UI Interaction Pattern
1. User completes 12-question flow assessment
2. User views flow score and interpretation
3. User selects 4 flow attribute words from categorized list
4. User can drag-and-drop to reorder selected attributes
5. Selected attributes save to database and appear on StarCard
6. User can edit attributes by clicking "Edit Attributes" button

---

## Section 4: Flow Reflections (Step 2-3)

### Format
**Type**: Progressive text-based reflections (4 total)
**Minimum Length**: 25 characters per reflection
**Database Table**: `workshop_step_data`
**Step ID**: `2-3`

### Reflection Field IDs

| Reflection | Field ID | Question | Min Length |
|------------|----------|----------|------------|
| Flow #1 | `flow-1` | "When does flow happen most naturally for you?" | 25 |
| Flow #2 | `flow-2` | "What typically blocks or interrupts your flow state?" | 25 |
| Flow #3 | `flow-3` | "What conditions help you get into flow more easily?" | 25 |
| Flow #4 | `flow-4` | "How could you create more opportunities for flow in your work and life?" | 25 |

### Database Storage Mapping
```typescript
// API saves to workshop_step_data table
{
  userId: number,
  workshopType: 'ast',
  stepId: '2-3',
  data: {
    strengths: string,    // Maps to flow-1
    values: string,       // Maps to flow-2
    passions: string,     // Maps to flow-3
    growthAreas: string   // Maps to flow-4
  }
}
```

### Reflection Instructions

**Flow #1: When does flow happen most naturally for you?**
- Specific activities or types of work that engage you deeply
- Time of day when you feel most focused and energized
- Environmental conditions that support your concentration
- Types of challenges that capture your full attention

**Flow #2: What typically blocks or interrupts your flow state?**
- External interruptions and distractions that break concentration
- Internal thoughts or worries that pull attention away
- Environmental factors that make it hard to focus
- Task characteristics that prevent deep engagement

**Flow #3: What conditions help you get into flow more easily?**
- Physical environment and workspace setup that supports focus
- Mental preparation or routines that help you concentrate
- Resources and tools that need to be readily available
- Personal energy and motivation factors

**Flow #4: How could you create more opportunities for flow?**
- Changes to your schedule or workflow to protect flow time
- Environmental modifications that would support deeper focus
- Communication strategies to minimize interruptions
- Personal practices to optimize your readiness for flow

---

## Section 5: Well-Being (Cantril Ladder) Assessment (Step 3-1)

### Assessment Format
**Type**: Interactive ladder positioning
**Scale**: 0-10 (both current and future)
**Database Table**: `workshop_step_data`
**Step ID**: `3-1`

### Ladder Positions

| Field | Description | Scale |
|-------|-------------|-------|
| `currentLevel` | Current well-being position | 0-10 |
| `futureLevel` | Future well-being (1 year) | 0-10 |

### Ladder Interpretation
- **0-4: Struggling** - High levels of worry, stress, pain; challenges feel overwhelming
- **5-6: Getting By** - Moderate satisfaction; some needs met but challenges remain
- **7-10: Thriving** - High satisfaction; basic needs met, strong purpose and optimism

---

## Section 6: Well-Being Reflections (Step 3-1 continued)

### Format
**Type**: Progressive text-based reflections (5 total)
**Minimum Length**: 25 characters per reflection
**Database Table**: `workshop_step_data`
**Step ID**: `3-1`

### Reflection Field IDs

| Reflection | Field ID | Question | Min Length |
|------------|----------|----------|------------|
| WellBeing #1 | `wellbeing-1` | "What factors shape your current well-being rating?" | 25 |
| WellBeing #2 | `wellbeing-2` | "What improvements do you envision in one year?" | 25 |
| WellBeing #3 | `wellbeing-3` | "What will be noticeably different in your experience?" | 25 |
| WellBeing #4 | `wellbeing-4` | "What progress would you expect in 3 months?" | 25 |
| WellBeing #5 | `wellbeing-5` | "What actions will you commit to this quarter?" | 25 |

### Database Storage Mapping
```typescript
// API saves to workshop_step_data table
{
  userId: number,
  workshopType: 'ast',
  stepId: '3-1',
  data: {
    currentLevel: number,           // 0-10
    futureLevel: number,            // 0-10
    currentFactors: string,         // Maps to wellbeing-1
    futureImprovements: string,     // Maps to wellbeing-2
    specificChanges: string,        // Maps to wellbeing-3
    quarterlyProgress: string,      // Maps to wellbeing-4
    quarterlyActions: string        // Maps to wellbeing-5
  }
}
```

### Reflection Instructions

**WellBeing #1: Current Factors**
- Work satisfaction and professional fulfillment
- Relationships with family, friends, colleagues
- Physical health and energy levels
- Financial security and stability
- Personal growth and learning opportunities
- Sense of purpose and meaning

**WellBeing #2: Future Improvements**
- Career advancement or new role opportunities
- Improved work-life balance and boundaries
- Stronger relationships and social connections
- Better health habits and physical wellness
- Enhanced skills and personal development
- Greater sense of purpose and impact

**WellBeing #3: Specific Changes**
- Changes in daily routines and work patterns
- Different types of conversations and interactions
- New environments or settings you'll be in
- Enhanced confidence in specific situations
- Improved stress levels and emotional well-being
- Different ways you'll spend your time and energy

**WellBeing #4: Quarterly Progress**
- Specific skills you'll have developed or improved
- New responsibilities or projects you'll have taken on
- Changes in how others interact with you
- Improvements in your daily routines or habits
- Enhanced confidence in particular areas
- Measurable outcomes or achievements

**WellBeing #5: Quarterly Actions**
- Specific learning opportunities you'll pursue
- New relationships or connections you'll build
- Projects or initiatives you'll volunteer for
- Skills practice or development activities
- Routine changes you'll implement
- Conversations or meetings you'll schedule

---

## Section 7: Future Self Reflections (Step 3-2)

### Format
**Type**: Image-based visioning + reflections (2 total)
**Minimum Length**: 50 characters per reflection
**Database Table**: `workshop_step_data`
**Step ID**: `3-2`

### Reflection Field IDs

| Reflection | Field ID | Question | Min Length |
|------------|----------|----------|------------|
| Future Self #1 | `image-meaning` | "What does your selected image mean to you?" | 50 |
| Future Self #2 | `future-self-1` | "Describe Your Future Self" | 50 |

### Database Storage Mapping
```typescript
// API saves to workshop_step_data table
{
  userId: number,
  workshopType: 'ast',
  stepId: '3-2',
  data: {
    selectedImages: string[],      // Array of image URLs/IDs
    imageMeaning: string,          // Maps to image-meaning
    reflections: {
      'future-self-1': string      // Future self description
    }
  }
}
```

### Reflection Instructions

**Future Self #1: Image Meaning**

Question varies by number of images selected:
- Single image: "What does your selected image mean to you?"
- Multiple images: "What do your selected images mean to you?"

Focus areas:
- What emotions or feelings do these images evoke?
- How do these images connect to your aspirations and goals?
- What specific elements resonate with your vision?
- What do these images represent about your ideal future state?

**Future Self #2: Describe Your Future Self**

Instruction: "Write 3 or 4 sentences about who you imagine becoming. Use these prompts to guide you:"

Focus areas:
- In 5 years, what capacities or qualities are you developing?
- What does life look like when aligned with flow and well-being?
- How are you contributing to others — team, family, or community?

---

## Section 8: Final Reflection (Step 3-3)

### Format
**Type**: Single intention statement
**Minimum Length**: 25 characters (content after prefix)
**Database Table**: `workshop_step_data`
**Step ID**: `3-3`

### Field ID

| Field | Field ID | Question Prefix | Min Length |
|-------|----------|-----------------|------------|
| Final Insight | `futureLetterText` | "The intention I want to carry forward is " | 25 |

### Database Storage Mapping
```typescript
// API saves to workshop_step_data table
{
  userId: number,
  workshopType: 'ast',
  stepId: '3-3',
  data: {
    futureLetterText: string  // Full text including prefix
  }
}
```

### Reflection Instructions

**Question**: "What's the one insight you want to carry forward?"

**Context**: You've just completed a journey of personal discovery. From understanding your core strengths to envisioning your future potential, each step revealed something valuable about who you are. Now, distill this experience into one clear insight that will guide you forward—something you want to remember as you move into team collaboration.

**Validation**: Minimum 25 characters after the prefix "The intention I want to carry forward is "

---

## Summary of Field IDs by Section

### Strength Reflections (Step 2-1)
```
strength-1           → strength1
strength-2           → strength2
strength-3           → strength3
strength-4           → strength4
imagination          → imaginationReflection
team-values          → teamValues
unique-contribution  → uniqueContribution
```

### Flow Attributes Selection (Step 2-2)
```
attributes → flow_attributes.attributes (JSONB array)
Structure: [{ name: string, order: number }, ...]
API: /api/workshop-data/flow-attributes
```

### Flow Reflections (Step 2-3)
```
flow-1  → strengths     (When does flow happen?)
flow-2  → values        (What blocks flow?)
flow-3  → passions      (What helps flow?)
flow-4  → growthAreas   (How to create more flow?)
```

### Well-Being Reflections (Step 3-1)
```
wellbeing-1  → currentFactors      (Current factors)
wellbeing-2  → futureImprovements  (Future improvements)
wellbeing-3  → specificChanges     (Specific changes)
wellbeing-4  → quarterlyProgress   (3-month progress)
wellbeing-5  → quarterlyActions    (Quarterly actions)
```

### Future Self Reflections (Step 3-2)
```
image-meaning  → imageMeaning       (Image meaning)
future-self-1  → reflections['future-self-1']  (Future self description)
```

### Final Reflection (Step 3-3)
```
futureLetterText  → futureLetterText  (Intention statement)
```

---

## Total Question Count

- **Star Strengths Assessment**: 22 multiple-choice questions (ranking format)
- **Strength Reflections**: 7 open-ended reflections
- **Flow Assessment**: 12 Likert-scale questions
- **Flow Attributes Selection**: 1 selection task (choose 4 from 56 words, rank 1-4)
- **Flow Reflections**: 4 open-ended reflections
- **Well-Being Assessment**: 2 ladder positions
- **Well-Being Reflections**: 5 open-ended reflections
- **Future Self Reflections**: 2 open-ended reflections
- **Final Reflection**: 1 intention statement

**Total Assessments**: 36 quantitative questions + 1 selection task
**Total Reflections**: 19 qualitative responses
**Total Workshop Items**: 56 (55 questions/reflections + 1 attribute selection)

---

*Document generated: January 2025*
*Workshop: AllStarTeams (AST)*
*Version: 2.5.1*
