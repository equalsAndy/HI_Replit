# AST Data Mapping for Report Writer

This document maps the assessment data fields, their **verbatim questions**, and their intended **purpose and usage** in AST Insights Reports.  
The assistant should use this as context when interpreting input data and weaving participant responses into the narrative.

---

## Strengths (StarCard)

**Thinking Strength Items**  
- **Question:** “Thinking Strength Items (Ranking)”  
- **Database Field:** `thinking` (percentage)  
- **Purpose:** Participant’s percentage allocation to Thinking.  
- **Usage:** Use only in Orientation (percentages snapshot) and in determining Strengths Pattern. Do not narrate percentages beyond Orientation.

**Feeling Strength Items**  
- **Question:** “Feeling Strength Items (Ranking)”  
- **Database Field:** `feeling` (percentage)  
- **Purpose & Usage:** As above.

**Acting Strength Items**  
- **Question:** “Acting Strength Items (Ranking)”  
- **Database Field:** `acting` (percentage)  
- **Purpose & Usage:** As above.

**Planning Strength Items**  
- **Question:** “Planning Strength Items (Ranking)”  
- **Database Field:** `planning` (percentage)  
- **Purpose & Usage:** As above.

---

## Flow Assessment (Likert Items)

12 questions, each answered on a 1–5 scale.  
Stored as `flowAssessment.answers[1–12]`. Combined into `flowScore` (12–60).

- **Questions:** Flow Question 1–12 (Likert-scale items about flow experiences).  
- **Purpose:** Input for Flow Experiences section, mapped into the four conditions (Clear Goals, Balanced Challenge & Skill, Immediate Feedback, Deep Concentration).  
- **Usage:** Interpret as tendencies, not rules. Weave reflections inline where they clarify flow.  

System fields:  
- `completed` (boolean)  
- `completedAt` (timestamp)  
- Auto-calculated, not narrated.

---

## Flow Attributes

**Question:** “Select 4 Flow State Descriptors”  
- **Database Field:** `flowAttributes.attributes` (array of 4 descriptors with scores)  
- **Purpose:** Shows participant’s self-chosen flow descriptors.  
- **Usage:** Compare how attributes cluster relative to the Strengths Pattern. Note alignments or contrasts (e.g., attributes clustering in their lowest strength quadrant).  

---

## Step-by-Step Reflection

**Strength 1 Reflection**  
- **Question:** “How and when do you use your 1st strength?”  
- **Database Field:** `strength1`  
- **Purpose:** Anchor participant’s lived experience of their top strength.  
- **Usage:** Quote inline to illustrate how strengths appear in practice.

**Strength 2 Reflection**  
- **Question:** “How and when do you use your 2nd strength?”  
- **Database Field:** `strength2`  
- **Usage:** As above.

**Strength 3 Reflection**  
- **Question:** “How and when do you use your 3rd strength?”  
- **Database Field:** `strength3`

**Strength 4 Reflection**  
- **Question:** “How and when do you use your 4th strength?”  
- **Database Field:** `strength4`

**Team Values**  
- **Question:** “What You Value Most in Team Environments”  
- **Database Field:** `teamValues`  
- **Purpose:** Capture participant’s team environment preferences.  
- **Usage:** Weave into Growth & Collaboration.

**Unique Contribution**  
- **Question:** “Your Unique Contribution”  
- **Database Field:** `uniqueContribution`  
- **Purpose:** Capture participant’s sense of unique value.  
- **Usage:** Weave inline as evidence of distinctive strengths.

---

## Imagination Reflection

**Imagination (Apex)**  
- **Question:** “Your Apex Strength is Imagination. No matter what your strengths, your imagination is always on and always influencing your thoughts and actions. How do you think about your imagination and when do you use it?”  
- **Database Field:** `imaginationReflection`  
- **Purpose:** Participant’s own words about imagination as always-on.  
- **Usage:** Quote once verbatim (in personal report). Weave imagination back into Strengths Pattern and Future Self sections. Paraphrase in shareable report.

---

## Rounding Out Reflection

**Natural Flow**  
- **Question:** “When does flow happen most naturally for you?”  
- **Database Field:** `strengths`  
- **Purpose:** Flow conditions reflection.  
- **Usage:** Weave inline in Flow section.

**Flow Blockers**  
- **Question:** “What typically blocks or interrupts your flow state?”  
- **Database Field:** `values`

**Flow Enablers**  
- **Question:** “What conditions help you get into flow more easily?”  
- **Database Field:** `passions`

**Flow Opportunities**  
- **Question:** “How could you create more opportunities for flow?”  
- **Database Field:** `growthAreas`

---

## Well-being Ladder

**Current Ladder Position**  
- **Question:** “Current well-being level (ladder position)”  
- **Database Field:** `wellBeingLevel` (0–10)  
- **Purpose:** Participant’s self-rated current state.  
- **Usage:** Summarize without judgment.

**Future Ladder Position**  
- **Question:** “Future well-being level (1 year projection)”  
- **Database Field:** `futureWellBeingLevel` (0–10)

**Current Factors**  
- **Question:** “What factors shape your current well-being rating?”  
- **Database Field:** `currentFactors`

**Future Improvements**  
- **Question:** “What improvements do you envision in one year?”  
- **Database Field:** `futureWellBeingLevel`

**Specific Changes**  
- **Question:** “What will be noticeably different in your experience?”  
- **Database Field:** `specificChanges`

**Quarterly Progress**  
- **Question:** “What progress would you expect in 3 months?”  
- **Database Field:** `quarterlyProgress`

**Quarterly Actions**  
- **Question:** “What actions will you commit to this quarter?”  
- **Database Field:** `quarterlyActions`

---

## Future Self Reflection

**Flow-Optimized Life**  
- **Question:** “Your Future Self Reflection”  
- **Database Field:** `flowOptimizedLife`  
- **Purpose:** Participant’s imagination of a flow-optimized life.  
- **Usage:** Weave into Future Self section.

**Future Self Description**  
- **Question:** “Future Self Description”  
- **Database Field:** `futureSelfDescription`

**Visualization Notes**  
- **Question:** “Visualization Notes”  
- **Database Field:** `visualizationNotes`

**Additional Notes**  
- **Question:** “Additional Notes”  
- **Database Field:** `additionalNotes`

**Selected Images**  
- **Question:** “Selected Images”  
- **Database Field:** `imageData.selectedImages` (array with metadata)

**Image Meaning**  
- **Question:** “Image Meaning”  
- **Database Field:** `imageData.imageMeaning`

---

## Final Reflection

**Future Letter Text**  
- **Question:** “What's the one insight you want to carry forward?”  
- **Database Field:** `futureLetterText`  
- **Purpose:** Participant’s closing insight.  
- **Usage:** Echo in report synthesis.

---
