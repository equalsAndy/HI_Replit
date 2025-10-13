# AST_Report_Payload_Spec_v2.3

This specification defines the **autonomous, section-based payload format** for generating AllStarTeams (AST) Personal Development Reports.
Each section payload is **stateless** — containing all data needed for that section, independent of other sections.

---

## 1. Core Principles

1. **Stateless Sections** — Each section call includes all relevant data. No shared context between sections.
2. **Autonomous Writing** — The writer interprets reflections, quotes, and relationships without external preprocessing.
3. **Consistency** — Field names match database schema; aliases improve readability.
4. **Error Resilience** — Payloads tolerate missing or gibberish data.
5. **Clean Output** — No HTML or renderer logic; visuals referenced via RML tags.
6. **Interpretive Tone** — Writer produces descriptive, reflective, non-prescriptive narrative.

---

## 2. Section Overview and Workshop Step Mapping

| Section ID | Section Name | Workshop Steps | Source Data |
|-------------|--------------|----------------|--------------|
| 1 | Strengths & Imagination | 2‑1 | Strength assessment + 7 reflections |
| 2 | Flow State Analysis & Optimization | 2‑2, 2‑3 | Flow assessment (12 Qs) + Flow reflections + Flow attributes |
| 3 | Strengths + Flow Integration | 2‑1 → 2‑3 | Synthesizes Sections 1 & 2 |
| 4 | Well‑being & Future Self | 3‑1, 3‑2 | Cantril Ladder + Well‑being reflections + Future Self reflections + Images |
| 5 | Collaboration & Closing | 3‑3 | Final reflection |

---

## 3. General Schema Reference

Below is the unified schema showing all possible data components.
Section payloads only include relevant subsections.

```json
{
  "report_type": "ast_personal",
  "section": {
    "id": 2,
    "name": "flow_experiences",
    "title": "Flow State Analysis & Optimization",
    "workshop_steps": ["2-2", "2-3"]
  },
  "participant": {
    "id": 76,
    "name": "Participant Name",
    "email": "participant@example.com"
  },
  "strengths": {
    "thinking": 27,   // 0–100
    "acting": 25,     // 0–100
    "feeling": 23,    // 0–100
    "planning": 25,   // 0–100
    "ranked": ["thinking", "acting", "planning", "feeling"],
    "shape": {
      "label": "Balanced",
      "percent_equivalence_margin": 2,
      "roles": {
        "dominant": ["thinking"],
        "supporting": ["planning"],
        "quieter": ["feeling", "acting"]
      }
    }
  },
  "flow": {
    "assessment": {
      "total_score": 48,               // 12–60
      "interpretation": "Flow Aware",
      "responses": [
        {
          "question_id": 1,
          "question_text": "I often feel deeply focused and energized by my work.",
          "score": 4,
          "label": "Often"
        }
      ]
    },
    "attributes": [
      { "name": "Dynamic", "order": 1 },
      { "name": "Punctual", "order": 2 },
      { "name": "Receptive", "order": 3 },
      { "name": "Encouraging", "order": 4 }
    ],
    "reflections": {
      "flow-1": {
        "field_id": "flow-1",
        "db_field_name": "strengths",
        "alias": "flow_naturally",
        "question": "When does flow happen most naturally for you?",
        "instruction": "Reflect on when you get 'in the zone'...",
        "answer": "I find flow when working on complex problems..."
      }
    }
  },
  "wellbeing": {
    "current_level": 6,    // 0–10
    "future_level": 7,     // 0–10
    "reflections": {
      "wellbeing-1": { "field_id": "wellbeing-1", "question": "What factors shape your current well-being rating?", "answer": "..." },
      "wellbeing-2": { "field_id": "wellbeing-2", "question": "What improvements do you envision in one year?", "answer": "..." },
      "wellbeing-3": { "field_id": "wellbeing-3", "question": "What will be noticeably different in your experience?", "answer": "..." },
      "wellbeing-4": { "field_id": "wellbeing-4", "question": "What progress would you expect in 3 months?", "answer": "..." },
      "wellbeing-5": { "field_id": "wellbeing-5", "question": "What actions will you commit to this quarter?", "answer": "..." }
    }
  },
  "future_self": {
    "images": [
      {
        "url": "https://example.com/image.jpg",
        "description": "Symbolic future self image",
        "source": "unsplash",
        "photographer": "John Doe",
        "sourceUrl": "https://unsplash.com/photos/example"
      }
    ],
    "reflections": {
      "image-meaning": {
        "field_id": "image-meaning",
        "question": "What does your selected image mean to you?",
        "answer": "..."
      },
      "future-self-1": {
        "field_id": "future-self-1",
        "question": "Describe Your Future Self",
        "answer": "..."
      }
    }
  },
  "final_reflection": {
    "field_id": "futureLetterText",
    "alias": "final_intention",
    "question": "What's the one insight you want to carry forward?",
    "instruction": "The intention I want to carry forward is ___",
    "answer": "To lead with calm confidence..."
  },
  "policies": {
    "tone_integrity": true,
    "use_speculative_language": true,
    "no_predictions": true,
    "no_advice_or_checklists": true,
    "avoid_clinical_phrasing": true,
    "imagination_as_integrator": true,
    "forbid_attribute_fallbacks": true,
    "forbid_shape_inference": true
  }
}
```

---

## 4. Error Handling and Missing Data Policy

```json
"error_handling": {
  "missing_reflection": "Send empty string if unanswered.",
  "invalid_reflection": "If reflection contains gibberish or filler text, treat as missing.",
  "missing_assessment": "Omit assessment object if not completed.",
  "missing_images": "Send empty array if user did not select any images.",
  "missing_flow_attributes": "Send empty array if user skipped selection.",
  "on_error_interpretation": "Writer should adapt as if the reflection is missing and synthesize from surrounding context."
}
```

**Gibberish Handling (Writer Rule):**
If a reflection contains random or meaningless input (e.g., "asdfasdfasdf," "test123," repeated symbols), the writer must treat it as an **absent reflection**, ignore its literal content, and write contextually as if the participant skipped that reflection.

---

## 5. Inline Validation Notes

| Field | Validation Rule |
|-------|------------------|
| strengths.* | 0–100 range; sum must equal 100 |
| flow.assessment.total_score | 12–60 range |
| flow.attributes | Exactly 4; must have unique orders 1–4 |
| wellbeing.current_level / future_level | 0–10 range |
| future_self.images | 0–4 images; allowed sources: `unsplash`, `upload` |
| all reflections.answer | Min length 25; gibberish = ignore |

---

## 6. Section Payload Examples (for Developer Reference Only)

### Example – Section 1: Strengths & Imagination
```json
{
  "section": { "id": 1, "name": "strengths_imagination", "workshop_steps": ["2-1"] },
  "participant": {...},
  "strengths": {...},
  "strength_reflections": {...},
  "policies": {...}
}
```

### Example – Section 2: Flow State Analysis & Optimization
```json
{
  "section": { "id": 2, "name": "flow_experiences", "workshop_steps": ["2-2","2-3"] },
  "participant": {...},
  "strengths": {...},
  "flow": {...},
  "policies": {...}
}
```

### Example – Section 3: Strengths + Flow Integration
```json
{
  "section": { "id": 3, "name": "strengths_flow_integration", "workshop_steps": ["2-1","2-3"] },
  "participant": {...},
  "strengths": {...},
  "flow": {...},
  "policies": {...}
}
```

### Example – Section 4: Well-being & Future Self
```json
{
  "section": { "id": 4, "name": "wellbeing_future_self", "workshop_steps": ["3-1","3-2"] },
  "participant": {...},
  "strengths": {...},
  "wellbeing": {...},
  "future_self": {...},
  "policies": {...}
}
```

### Example – Section 5: Collaboration & Closing
```json
{
  "section": { "id": 5, "name": "collaboration_closing", "workshop_steps": ["3-3"] },
  "participant": {...},
  "final_reflection": {...},
  "policies": {...}
}
```

---

## 7. Tone & Interpretation Policies

| Rule | Description |
|------|--------------|
| Speculative language | Use "may," "tends to," "appears," "you describe," etc. |
| Avoid absolutes | No "always," "never," "will," or "must." |
| Reflective tone | Interpret, don't evaluate. |
| Imagination as integrator | Treat imagination as connective, not mystical. |
| No fallback attributes | If missing, describe flow narratively. |
| No shape inference | Don't assume shapes beyond provided data. |
| Gibberish responses | Ignore literal text and adapt as missing. |
| One participant quote minimum | Use at least one direct quote per section. |

---

## 8. Validation Summary

```json
{
  "validation": {
    "strengths": { "sum_must_equal": 100, "each_between": [0, 100] },
    "flow_score": { "min": 12, "max": 60 },
    "wellbeing_levels": { "min": 0, "max": 10 },
    "flow_attributes": { "required_count": 4, "max_count": 4 },
    "images": { "min_count": 0, "max_count": 4, "allowed_sources": ["unsplash","upload"] }
  }
}
```

---

## 9. Changelog (v2.3)

- Standardized reflection structure (nested + metadata).
- Added full **Error Handling and Gibberish Interpretation Policy.**
- Added inline validation under each object type.
- Clarified section example payloads (for developer reference only).
- Defined flow attribute validation (4 required).
- Added explicit image count and source limits.
- Moved example participant data out of schema.
- Strengthened tone integrity policies for AI writer compliance.

---
