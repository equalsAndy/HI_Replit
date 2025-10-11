# AST Data Mapping (v2)

This file maps the AST database export fields to their corresponding workshop questions, answer types, and usage notes for report generation.

---

## StarCard (Strengths Assessment)

The StarCard assessment measures distribution across four core strengths plus imagination (apex). Participants answer scenario-based questions that reveal natural tendencies.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `starCard.thinking` | "When facing challenges, how often do you rely on careful analysis?" (scenario-based assessment) | Numeric (0–100%) | Present percentage once in report; then use relative shape language (leading/supporting/quieter). Transform to grouped strengths via `transformStrengths()`. |
| `starCard.acting` | "When facing challenges, how often do you take immediate action?" (scenario-based assessment) | Numeric (0–100%) | Present percentage once in report; then use relative shape language (leading/supporting/quieter). Transform to grouped strengths via `transformStrengths()`. |
| `starCard.feeling` | "When facing challenges, how often do you focus on relationships and emotions?" (scenario-based assessment) | Numeric (0–100%) | Present percentage once in report; then use relative shape language (leading/supporting/quieter). Transform to grouped strengths via `transformStrengths()`. |
| `starCard.planning` | "When facing challenges, how often do you organize and structure your approach?" (scenario-based assessment) | Numeric (0–100%) | Present percentage once in report; then use relative shape language (leading/supporting/quieter). Transform to grouped strengths via `transformStrengths()`. |
| `starCard.imagination` | Apex strength - not directly measured | Implied/Conceptual | Imagination sits at apex of star. Not scored numerically but represents integrative capacity across all strengths. Reference as overarching potential. |

**Strength Transformation Logic:**
- Raw percentages are grouped into three tiers: **leading** (top ~33%), **supporting** (middle ~33%), **quieter** (bottom ~33%)
- Ties are handled by grouping same-value strengths together
- Use `transformStrengths()` function in transformer to create relative groupings

---

## Flow Assessment

The Flow Assessment measures frequency of flow state experiences across 12 dimensions.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `flowAssessment.flowScore` | Overall score from 12 flow questions (e.g., "I often feel deeply focused and energized by my work") | Numeric (12–60) | Likert scale (1-5) × 12 questions. Present score once with interpretation: High (48+), Moderate (36-47), Emerging (24-35), Limited (<24). Then expand into narrative. |
| `flowAssessment.answers` | Individual responses to 12 flow questions | Object (question ID → 1-5 score) | Detailed breakdown available but typically not shown in reports. Use aggregate score instead. |
| `flowAssessment.totalQuestions` | Number of questions in assessment | Numeric (12) | Metadata for validation. |
| `flowAssessment.maxScore` | Maximum possible score | Numeric (60) | Metadata for percentage calculations. |

**Flow Questions (for reference):**
1. "I often feel deeply focused and energized by my work"
2. "The challenges I face are well matched to my skills"
3. "I lose track of time when I'm fully engaged"
4. "I feel in control of what I'm doing, even under pressure"
5. "I receive clear feedback that helps me stay on track"
6. "I know exactly what needs to be done in my work"
7. "I feel more spontaneous when I'm in flow"
8. "I can do things almost effortlessly"
9. "I enjoy the process itself, not just the results"
10. "I have rituals or environments that help me quickly get into deep focus"
11. "I forget to take breaks because I'm so immersed"
12. "I want to recapture this experience again—it's deeply rewarding"

---

## Flow Attributes

Participants select attributes that characterize their flow experiences.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `flowAttributes.flowScore` | Overall flow score (duplicated from flowAssessment) | Numeric (12–60) | Use `flowAssessment.flowScore` as authoritative source. This is legacy duplication. |
| `flowAttributes.attributes` | "Select the attributes that best describe your flow experiences" | Array of objects: `[{name: string, order: number}]` | User selects from predefined list. Sort by `order` field. Use attribute names in flow narrative. Common attributes: "Creative Problem Solving", "Deep Focus", "Energized", "Time Distortion", etc. |

---

## Step-by-Step Reflections (Strengths)

Progressive reflections on individual strengths, gathered after StarCard assessment.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `stepByStepReflection.strength1` | "How and when do you use your [1st strength]?" (e.g., THINKING, ACTING, FEELING, or PLANNING) | Open text (min 25 chars) | Personal narrative about top strength application. Use to add depth to strength profile. Question dynamically adapts based on participant's #1 strength. |
| `stepByStepReflection.strength2` | "How and when do you use your [2nd strength]?" | Open text (min 25 chars) | Personal narrative about second strength. Question adapts to participant's #2 strength. |
| `stepByStepReflection.strength3` | "How and when do you use your [3rd strength]?" | Open text (min 25 chars) | Personal narrative about third strength. Question adapts to participant's #3 strength. |
| `stepByStepReflection.strength4` | "How and when do you use your [4th strength]?" | Open text (min 25 chars) | Personal narrative about quieter strength. Question adapts to participant's #4 strength. |
| `stepByStepReflection.imagination` | "How do you think about your imagination and when do you use it?" | Open text (min 25 chars) | Reflection on apex strength (imagination). Asked after the 4 core strengths. |
| `stepByStepReflection.teamValues` | "What values do you bring to your team?" | Open text (min 25 chars) | Team contribution reflection. |
| `stepByStepReflection.uniqueContribution` | "What is your unique contribution to your team?" | Open text (min 25 chars) | Unique value proposition reflection. |

**Note:** Strength reflection questions include dynamic prompts with bullets and examples specific to each strength type (THINKING, ACTING, FEELING, PLANNING).

---

## Rounding Out Reflection (Flow Context)

Deeper reflection on flow experiences and conditions.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `roundingOutReflection.strengths` | "When does flow happen most naturally for you?" | Open text (min 25 chars) | Despite field name, contains flow enablers/natural conditions. Use as **flowEnablers** in report. |
| `roundingOutReflection.values` | "What typically blocks or interrupts your flow state?" | Open text (min 25 chars) | Despite field name, contains flow blockers. Use as **flowBlockers** in report. Misleading field name due to legacy schema. |
| `roundingOutReflection.passions` | "What conditions help you get into flow more easily?" | Open text (min 25 chars) | Flow conditions/enablers. Combine with `strengths` field for complete enablers picture. |
| `roundingOutReflection.growthAreas` | "How could you create more opportunities for flow in your work and life?" | Open text (min 25 chars) | Action-oriented flow opportunities. Use for forward-looking recommendations in report. |

**Important:** Field names do NOT match content. The transformer maps these correctly:
- `roundingOutReflection.strengths` → `flowEnablers` in assistant input
- `roundingOutReflection.values` → `flowBlockers` in assistant input
- `roundingOutReflection.passions` → `flowConditions` in assistant input
- `roundingOutReflection.growthAreas` → `flowOpportunities` in assistant input

---

## Cantril Ladder (Well-being Assessment)

Two-part assessment: numeric ladder positions + reflective questions.

### Ladder Positions

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `cantrilLadder.wellBeingLevel` | "On which step of the ladder do you feel you stand at this time?" (with visual ladder 0-10) | Numeric (0–10) | Current well-being rating. Interpret: 0-4 (Struggling), 5-6 (Getting By), 7-10 (Thriving). Show once, then reference contextually. |
| `cantrilLadder.futureWellBeingLevel` | "On which step do you think you will stand in the future, say about one year from now?" (with visual ladder 0-10) | Numeric (0–10) | Future well-being aspiration. Compare to current level to show growth trajectory or concerns. |

### Reflective Questions

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `cantrilLadder.currentFactors` | "What factors shape your current rating?" | Open text | What contributes to current well-being (work, relationships, health, finances, growth). |
| `cantrilLadder.futureImprovements` | "What improvements do you envision?" | Open text | Desired achievements/changes in one year. |
| `cantrilLadder.specificChanges` | "What will be different?" | Open text | Tangible/concrete differences expected in future state. |
| `cantrilLadder.quarterlyProgress` | "What progress would you expect in 3 months?" | Open text | Near-term milestone/indicator of movement. |
| `cantrilLadder.quarterlyActions` | "What actions will you commit to this quarter?" | Open text | 1-2 concrete steps to take in next 3 months. |

**Data Assembly Note:** `cantrilLadder` and `cantrilLadderReflection` are merged in export service. Ladder values set in step 3-1, reflections added in step 4-2.

---

## Future Self Reflection

Visual + narrative reflection on flow-optimized future self.

### Reflective Text

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `futureSelfReflection.flowOptimizedLife` | "Describe your flow-optimized life" | Open text | Vision of life structured around flow states and strengths. |
| `futureSelfReflection.futureSelfDescription` | "Describe your future self" | Open text | Detailed vision of future identity and capabilities. |
| `futureSelfReflection.visualizationNotes` | "Visualization notes" | Open text | Notes about mental imagery or visualization process. |
| `futureSelfReflection.additionalNotes` | "Additional notes" | Open text | Any supplementary thoughts about future self. |

### Image Selection

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `futureSelfReflection.imageData.selectedImages` | "Select 1-2 images that represent your future self" (Unsplash search interface) | Array of objects: `[{url: string, credit: {photographer, source}}]` | Up to 2 images selected from Unsplash. Include in report with proper attribution. Use image meaning to enhance narrative. |
| `futureSelfReflection.imageData.imageMeaning` | "What do these images mean to you?" | Open text | Participant's interpretation of selected images. Use to contextualize visual choices in report. |

**Image Credit Format:**
```javascript
{
  url: "https://images.unsplash.com/...",
  credit: {
    photographer: "Jane Doe",
    photographerUrl: "https://unsplash.com/@janedoe",
    sourceUrl: "https://unsplash.com/photos/abc123"
  }
}
```

---

## Final Reflection

Culminating insight and letter to future self.

| Field | User-Facing Question | Answer Type | Notes for Report Generation |
|-------|----------------------|-------------|----------------------------|
| `finalReflection.futureLetterText` | "Write a letter to your future self" or "What is your key insight from this workshop?" | Open text (min 10 chars) | Participant's culminating reflection. May be structured as letter or key insight depending on workshop version. Use as closing narrative in report. |

**Note:** This field completes the workshop (step 4-5) and triggers workshop completion status.

---

## User Information

Participant metadata for personalization.

| Field | Description | Answer Type | Notes for Report Generation |
|-------|-------------|-------------|----------------------------|
| `userInfo.userName` | Username (login identifier) | String | Use for system references. Not typically shown in reports. |
| `userInfo.firstName` | Given name | String | Use for personalization: "Hi [firstName]" |
| `userInfo.lastName` | Family name | String | Combine with firstName for formal references. |
| `userInfo.name` | Full name (may be composite or single field) | String | Fallback if firstName/lastName unavailable. |
| `userInfo.email` | Email address | String | Contact info, not typically in report. |
| `userInfo.organization` | Organization/company name | String (optional) | Contextualize work environment if provided. |
| `userInfo.jobTitle` | Job title/role | String (optional) | Contextualize professional context if provided. |
| `userInfo.profilePictureUrl` | Profile photo URL | String (optional) | May be included in personalized reports. |

**Name Resolution Priority:**
1. Use `firstName` + `lastName` if both available
2. Fall back to `name` if composite name available
3. Use `userName` if no other name fields present
4. Default to "Participant" if all else fails

---

## Navigation Progress

Tracks user's progress through workshop steps (not part of assessment data but useful for context).

| Field | Description | Notes |
|-------|-------------|-------|
| `navigationProgress.ast.currentStepId` | Current step (e.g., "2-1", "4-2") | Shows where participant is in workshop. |
| `navigationProgress.ast.completedSteps` | Array of completed step IDs | Indicates which sections are done. Use to determine report completeness. |
| `navigationProgress.ast.unlockedSteps` | Array of unlocked step IDs | Shows accessible but not completed steps. |
| `navigationProgress.ast.videoProgress` | Object mapping stepId → percentage watched | Video engagement tracking (not typically in reports). |

---

## Export Metadata

Administrative information about the data export.

| Field | Description | Notes |
|-------|-------------|-------|
| `exportMetadata.exportedAt` | ISO timestamp of export | When data was extracted. |
| `exportMetadata.exportedBy` | Admin user who performed export | Who initiated export. |
| `exportMetadata.dataVersion` | Schema version (e.g., "2.1") | Ensure compatibility with transformer. |
| `exportMetadata.workshopSteps` | List of available step ranges | Documentation of workshop structure. |
| `exportMetadata.totalAssessments` | Count of assessment records | Quality check. |
| `exportMetadata.totalWorkshopSteps` | Count of step data records | Quality check. |

---

## Transformer Logic Summary

The `transformExportToAssistantInput()` function converts raw export JSON into a structured format for the OpenAI Assistant:

### Strengths Transformation
```javascript
// Raw percentages → Relative groupings
starCard: { thinking: 35, acting: 25, feeling: 20, planning: 20 }
↓
strengths: {
  leading: ['thinking'],
  supporting: ['acting'],
  quieter: ['feeling', 'planning'] // Tied values grouped together
}
```

### Flow Transformation
```javascript
// Combine multiple sources into unified flow object
flow: {
  flowScore: flowAssessment.flowScore,           // Authoritative score
  flowAttributes: [...],                          // Sorted by order
  flowEnablers: [roundingOut.strengths, roundingOut.passions],
  flowBlockers: [roundingOut.values]              // Misleading field name!
}
```

### Cantril Ladder Merging
```javascript
// Merge two assessment types into single object
cantrilLadder: {
  wellBeingLevel: 7,                    // From cantrilLadder assessment
  futureWellBeingLevel: 9,              // From cantrilLadder assessment
  currentFactors: "...",                // From cantrilLadderReflection assessment
  futureImprovements: "...",            // From cantrilLadderReflection assessment
  specificChanges: "...",               // From cantrilLadderReflection assessment
  quarterlyProgress: "...",             // From cantrilLadderReflection assessment
  quarterlyActions: "..."               // From cantrilLadderReflection assessment
}
```

### Gibberish Detection
The transformer includes `isLikelyGibberish()` validation:
- Checks alphabetic ratio (must be >60%)
- Detects long runs of non-letters
- Calculates average token length
- Sets `reflections_invalid: true` if ≥60% of reflection fields appear to be gibberish

### Image Credit Flattening
```javascript
// Original format with nested credit object
imageData.selectedImages: [{
  url: "...",
  credit: {
    photographer: "Jane Doe",
    source: "Unsplash"
  }
}]
↓
// Flattened for assistant
selectedImages: [{
  url: "...",
  credit: "Jane Doe, Unsplash"  // Concatenated string
}]
```

---

## Workshop Step Flow (Reference)

Understanding the step sequence helps contextualize when data is collected:

1. **2-1: Strengths** → `starCard` + `stepByStepReflection` (strengths 1-4, imagination, team values, unique contribution)
2. **2-2: Flow Patterns** → `flowAssessment` + `flowAttributes`
3. **2-3: Rounding Out** → `roundingOutReflection` (flow enablers, blockers, conditions, opportunities)
4. **3-1: Well-being Ladder** → `cantrilLadder` (numeric levels only)
5. **4-2: Cantril Reflections** → `cantrilLadder` (text reflections merged with numeric levels)
6. **4-3: Future Self** → `futureSelfReflection` (text + images)
7. **4-5: Final Reflection** → `finalReflection` (letter/key insight)

---

## Common Report Pitfalls

1. **Don't over-use percentages:** Show StarCard percentages once, then switch to relative language (leading/supporting/quieter).

2. **Watch field name mismatches:** `roundingOutReflection.values` = blockers, NOT values. `roundingOutReflection.strengths` = flow enablers, NOT strength assessment.

3. **Merge Cantril data:** Don't treat `cantrilLadder` and `cantrilLadderReflection` as separate—they're merged in export.

4. **Image attribution required:** Always credit Unsplash photographers when using selected images.

5. **Respect imagination as apex:** Imagination isn't scored numerically but conceptually sits above the four core strengths.

6. **Flow score interpretation:** Use percentage of max (60) for context: 80%+ = High, 60-79% = Moderate, 40-59% = Emerging, <40% = Limited.

7. **Handle incomplete data gracefully:** Not all participants complete all reflections. Use `reflections_invalid` flag and provide default values where needed.

8. **Gibberish detection:** Check `reflections_invalid` flag before relying heavily on open text responses.

---

_Last updated: January 2025. This file is used by the report-writing assistant to interpret AST export JSON data correctly._
