# AST Workshop Questions to Database Field Mapping

## Overview
Direct mapping of workshop questions to JSON database field IDs for report generation context.

---

## Star Strengths Assessment (Step 2-2)

**Assessment**: 22-question assessment that derives percentage distribution
**Output**: Percentage distribution totaling 100%

### Database Location: `assessments.starCard`
```json
{
  "thinking": [percentage],    // Green - Strategic analysis, problem-solving, innovation
  "feeling": [percentage],     // Blue - Relationship building, empathy, team dynamics  
  "acting": [percentage],      // Red - Execution, implementation, results orientation
  "planning": [percentage],    // Yellow - Organization, structure, systematic approach
  "createdAt": [timestamp]
}
```

---

## Step-by-Step Reflections (Step 2-4)

### Database Location: `assessments.stepByStepReflection`

**Reflection 1**: "How and when do you use your [TOP STRENGTH] strength?"
- **Field**: `strength1`

**Reflection 2**: "How and when do you use your [SECOND STRENGTH] strength?"
- **Field**: `strength2`

**Reflection 3**: "How and when do you use your [THIRD STRENGTH] strength?"
- **Field**: `strength3`

**Reflection 4**: "How and when do you use your [FOURTH STRENGTH] strength?"
- **Field**: `strength4`

**Reflection 5**: "What You Value Most in Team Environments"
- **Field**: `teamValues`

**Reflection 6**: "Your Unique Contribution" (combining top two strengths)
- **Field**: `uniqueContribution`

---

## Flow Assessment (Step 3-2)

**12 Questions on 1-5 Likert Scale**

### Database Location: `assessments.flowAssessment`
```json
{
  "answers": {
    "1": [1-5],   // "I often feel deeply focused and energized by my work"
    "2": [1-5],   // "The challenges I face are well matched to my skills"
    "3": [1-5],   // "I lose track of time when I'm fully engaged"
    "4": [1-5],   // "I feel in control of what I'm doing, even under pressure"
    "5": [1-5],   // "I receive clear feedback that helps me stay on track"
    "6": [1-5],   // "I know exactly what needs to be done in my work"
    "7": [1-5],   // "I feel more spontaneous when I'm in flow"
    "8": [1-5],   // "I can do things almost effortlessly"
    "9": [1-5],   // "I enjoy the process itself, not just the results"
    "10": [1-5],  // "I have rituals or environments that help me quickly get into deep focus"
    "11": [1-5],  // "I forget to take breaks because I'm so immersed"
    "12": [1-5]   // "I want to recapture this experience again—it's deeply rewarding"
  },
  "flowScore": [12-60],
  "completed": true/false
}
```

**Flow Score Categories**:
- 50-60: Flow Fluent
- 39-49: Flow Aware  
- 26-38: Flow Blocked
- 12-25: Flow Distant

---

## Flow Attributes Selection (Step 3-2)

**Question**: Select 4 flow attributes from categorized lists

### Database Location: `assessments.flowAttributes`
```json
{
  "attributes": [
    {"name": "Attribute1", "score": 100},
    {"name": "Attribute2", "score": 95},
    {"name": "Attribute3", "score": 90},
    {"name": "Attribute4", "score": 85}
  ]
}
```

**Note**: The scores are not relevant for report generation - focus on the attribute names selected and their order of selection.

---

## Rounding Out Reflection (Step 3-4)

### Database Location: `assessments.roundingOutReflection`

**Question 1**: "What disrupts your flow?"
- **Field**: `strengths`

**Question 2**: "When does flow happen naturally for you?"
- **Field**: `values`

**Question 3**: "What do you need for flow?"
- **Field**: `passions`

**Question 4**: "How could you optimize for flow?"
- **Field**: `growthAreas`

---

## Cantril Ladder Well-being (Step 4-1 & 4-2)

### Database Location: `assessments.cantrilLadder`

**Interactive Ladder Questions**:
- Current well-being level (0-10): `wellBeingLevel`
- Future well-being level (0-10): `futureWellBeingLevel`

**Reflection Questions**:

**Question 1**: "What factors shape your current rating?"
- **Field**: `currentFactors`

**Question 2**: "What improvements do you envision?"
- **Field**: `futureImprovements`

**Question 3**: "What will be different?"
- **Field**: `specificChanges`

**Question 4**: "What progress would you expect in 3 months?"
- **Field**: `quarterlyProgress`

**Question 5**: "What actions will you commit to this quarter?"
- **Field**: `quarterlyActions`

---

## Future Self Reflection (Step 4-4)

### Database Location: `assessments.futureSelfReflection`

**Timeline Approach**: `direction` ("backward" or "forward")

**Timeframe Questions**:
- **20-Year Vision**: `twentyYearVision`
- **10-Year Milestone**: `tenYearMilestone`  
- **5-Year Foundation**: `fiveYearFoundation`
- **Flow-Optimized Life**: `flowOptimizedLife`

**Additional Fields** (may be empty):
- `futureSelfDescription`
- `visualizationNotes`
- `additionalNotes`

---

## Final Reflection (Step 4-5)

**Question**: "What's the one insight you want to carry forward?"

### Database Location: `assessments.finalReflection`
- **Field**: `futureLetterText`

---

## Workshop Progress Data

### Database Location: `navigationProgress.ast`
```json
{
  "currentStepId": "step-id",
  "completedSteps": ["1-1", "2-1", ...],
  "unlockedSteps": ["1-1", "2-1", ...],
  "lastVisitedAt": "timestamp"
}
```

**Note**: These fields are not relevant for report generation - ignore this data.

---

## User Context Data

### Database Location: `userInfo`
```json
{
  "name": "User Name",
  "role": "user/admin/facilitator",
  "organization": "Organization Name",
  "jobTitle": "Job Title"
}
```

---

## Field Content Examples

### Example Response Patterns:

**strength1** (Acting example):
"I leverage my action-oriented approach when projects need momentum. Last quarter, when our team was stuck in analysis paralysis on a key decision, I facilitated rapid prototyping sessions that helped us test three solutions quickly and move forward with confidence."

**teamValues**:
"I thrive in team environments that balance clear structure with flexibility for creative problem-solving. I value open communication where team members feel safe to share ideas and concerns, along with regular feedback loops that help us continuously improve our collaboration and outcomes."

**currentFactors**:
"My current well-being is shaped by meaningful work that aligns with my strengths, supportive relationships with colleagues and family, good physical health through regular exercise, and financial stability. I feel energized when I can use my planning and analytical skills to solve complex problems."

**twentyYearVision**:
"I've become a respected leader who transforms organizations through human-centered innovation. My work has created lasting positive impact on thousands of people's careers and wellbeing. I'm known for building cultures where people thrive authentically."