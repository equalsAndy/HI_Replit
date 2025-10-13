# AST Report Payload Specification (v2)
*Updated 2025-10-10*

This version incorporates verified field mappings, workshop context, and corrections from the authoritative
**AST_Workshop_Questions_with_Field_IDs.md** document. It replaces v1.

---

## 0. Shared Rules

- Each section request includes `"report_version": "v23.5"`.
- Assistant calls are **stateless** — every section payload must include all relevant context.
- Always include both `field_id` (database name) and `alias` (semantic label).
- Include `question`, `instruction`, and `answer` for all reflections.
- Do **not** include RML markup in payloads — the writer handles visuals internally.
- If data is missing, include empty strings or arrays (never omit fields).
- Do not infer data or generate fallbacks.

---

## 1. Core Context Bundle

Included in **every section request**.

### participant
{ "id": 76, "name": "Jason Segal", "email": "user@example.com" }

### strengths
{ 
  "thinking": 27,
  "acting": 25,
  "feeling": 23,
  "planning": 25,
  "ranked": ["thinking", "acting", "planning", "feeling"],
  "shape": {
    "label": "Balanced",
    "percent_equivalence_margin": 2,
    "roles": {
      "dominant": ["thinking"],
      "supporting": ["acting", "planning"],
      "quieter": ["feeling"]
    },
    "comparison_shapes": ["Two Dominant", "Balanced"]
  }
}

**Shape Logic Summary**
- Margin: ±2% = equivalent grouping
- Dominant = highest group; Supporting = within 2%; Quieter = ≥5% below dominant
- Possible labels: Balanced, One High, Two Dominant, One Quiet, Split Pair, Gradient, Outlier Mix

### imagination_reflection
{ 
  "field_id": "imagination",
  "alias": "imagination",
  "question": "Your Apex Strength is Imagination",
  "instruction": "No matter what your strengths, your imagination is always on...",
  "min_length": 25,
  "answer": "..." 
}

### flow_assessment
{ 
  "total_score": 48,
  "interpretation": "Flow Aware",
  "responses": [{ "question_id": 1, "score": 4 }, { "question_id": 2, "score": 3 }],
  "definitions": {
    "Flow Fluent": "Reliably access flow when conditions align.",
    "Flow Aware": "Familiar with flow; routines support access.",
    "Flow Blocked": "Flow occurs intermittently; entry/recovery irregular.",
    "Flow Distant": "Flow feels rare; enabling conditions often absent."
  }
}

### wellbeing_ladder
{ "current_level": 6, "future_level": 7 }

### key_quotes
Optional, human- or AI-curated short participant lines for narrative use.
[
  { "context": "flow_trigger", "quote": "I need alignment before I can find rhythm." },
  { "context": "flow_reward", "quote": "Everything just clicks." }
]
If none qualify → `"key_quotes": []`

---

## 2. Section-Specific Additions

### Section 1 – Strengths & Imagination
Adds:
{
  "strength_reflections": [ { "field_id": "strength-1", "alias": "thinking_reflection", "question": "...", "answer": "..." } ],
  "team_values": { "field_id": "team-values", "alias": "team_values", "question": "...", "answer": "..." },
  "unique_contribution": { "field_id": "unique-contribution", "alias": "unique_contribution", "question": "...", "answer": "..." }
}

---

### Section 2 – Flow State Analysis & Optimization
**Removed:** flow_attributes (no user selection step exists).  
**Includes:** flow assessment + flow reflections.

{
  "flow_reflections": [
    { "field_id": "flow-1", "db_field_name": "strengths", "alias": "flow_naturally", "question": "...", "answer": "..." },
    { "field_id": "flow-2", "db_field_name": "values", "alias": "flow_blockers", "question": "...", "answer": "..." },
    { "field_id": "flow-3", "db_field_name": "passions", "alias": "flow_conditions", "question": "...", "answer": "..." },
    { "field_id": "flow-4", "db_field_name": "growthAreas", "alias": "flow_create_more", "question": "...", "answer": "..." }
  ]
}

---

### Section 3 – Strengths + Flow Integration
No new data.  
May include optional integration_focus field:
{ "integration_focus": { "strengths": ["thinking", "planning"], "flow_reflections": ["flow-1","flow-3"] } }

---

### Section 4 – Well-being + Future Self
Adds all five well-being reflections and future self content.

{
  "wellbeing_reflections": [
    { "field_id": "wellbeing-1", "alias": "current_factors", "answer": "..." },
    { "field_id": "wellbeing-2", "alias": "future_improvements", "answer": "..." },
    { "field_id": "wellbeing-3", "alias": "specific_changes", "answer": "..." },
    { "field_id": "wellbeing-4", "alias": "quarterly_progress", "answer": "..." },
    { "field_id": "wellbeing-5", "alias": "quarterly_actions", "answer": "..." }
  ],
  "future_self": {
    "images": [
      {
        "id": "QKUN1xjwDQA",
        "url": "https://...",
        "source": "unsplash",
        "description": "white duck on grass field",
        "credit": {
          "photographer": "Christian Bowen",
          "sourceUrl": "https://unsplash.com/photos/..."
        }
      }
    ],
    "reflections": [
      { "field_id": "image-meaning", "alias": "image_meaning", "answer": "..." },
      { "field_id": "future-self-1", "alias": "future_self_description", "answer": "..." }
    ]
  }
}

Users may select **up to 4 images**, including uploads.  
Each must specify `"source": "upload"` or `"unsplash"`.

---

### Section 5 – Collaboration & Closing
Adds final reflection.
{
  "final_reflection": {
    "field_id": "futureLetterText",
    "alias": "final_intention",
    "question": "What's the one insight you want to carry forward?",
    "instruction": "The intention I want to carry forward is ___",
    "min_length": 25,
    "answer": "..."
  }
}

---

## 3. Policy Flags
{
  "tone_integrity": true,
  "use_speculative_language": true,
  "no_predictions": true,
  "no_advice_or_checklists": true,
  "avoid_clinical_phrasing": true,
  "imagination_as_integrator": true,
  "forbid_shape_inference": true
}

---

## 4. Visual Hints
Metadata only (for renderer):  
`user_strength_chart`, `shapes_intro_content`, `imagination_circle`, `flow_attribute`, `ladder`

---

## 5. Validation Rules
- Strengths sum = 100, each between 0–100  
- Flow score 12–60  
- Well-being levels 0–10  
- Reflection min_length 25 (or 50 for future self)

---

End of **AST_Report_Payload_Spec_v2**
