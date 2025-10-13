# AST_Report_Payload_Spec_v2.2

This document defines the **autonomous, section-based payload specification** for generating AllStarTeams (AST) Personal Development Reports.  
Each section is self-contained and stateless—containing all data the writer requires for that section only.

---

## 1. Core Principles

1. **Stateless Design** – Each section request is independent; include all data needed for that section.  
2. **Autonomous Writing** – The writer identifies meaningful quotes, patterns, and integration themes without external preprocessing.  
3. **Consistency** – Field names align with database schema; aliases improve readability.  
4. **Transparency** – All sections contain explicit workshop step mappings and schema context.  
5. **Clean Output** – No HTML or rendering logic; visuals are referenced by `RML` only.

---

## 2. Section Overview with Workshop Step Mapping

| Section ID | Section Name | Workshop Steps | Source Data |
|-------------|--------------|----------------|--------------|
| 1 | Strengths & Imagination | 2‑1 | Strength assessment + 7 reflections |
| 2 | Flow State Analysis & Optimization | 2‑2, 2‑3 | Flow assessment (12 Qs) + Flow reflections |
| 3 | Strengths + Flow Integration | 2‑1 → 2‑3 | Synthesizes prior strengths + flow sections |
| 4 | Well‑being & Future Self | 3‑1, 3‑2 | Cantril Ladder + Well‑being + Future Self reflections |
| 5 | Collaboration & Closing | 3‑3 | Final reflection |

---

## 3. General Schema

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
    "name": "Jason Segal",
    "email": "topliff+test5@gmail.com"
  },
  "strengths": {
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
        "supporting": ["planning"],
        "quieter": ["feeling", "acting"]
      }
    }
  },
  "flow_assessment": {
    "total_score": 48,
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
  "flow_attributes": [
    { "name": "Dynamic", "order": 1 },
    { "name": "Punctual", "order": 2 },
    { "name": "Receptive", "order": 3 },
    { "name": "Encouraging", "order": 4 }
  ],
  "reflections": { "flow-1": "...", "flow-2": "...", "flow-3": "...", "flow-4": "..." },
  "wellbeing": {
    "current_level": 6,
    "future_level": 7,
    "reflections": {
      "wellbeing-1": "Current factors...",
      "wellbeing-2": "Future improvements...",
      "wellbeing-3": "Specific changes...",
      "wellbeing-4": "Quarterly progress...",
      "wellbeing-5": "Quarterly actions..."
    }
  },
  "future_self": {
    "images": [
      {
        "url": "https://images.unsplash.com/photo-example",
        "description": "Chosen symbolic image",
        "source": "unsplash",
        "photographer": "John Doe",
        "sourceUrl": "https://unsplash.com/photos/example"
      }
    ],
    "reflections": {
      "image-meaning": "This image represents growth...",
      "future-self-1": "In 5 years, I see myself..."
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

## 4. Section‑Specific Notes

### 4.1 Section 1 – Strengths & Imagination
- **Workshop Steps:** 2‑1  
- **Includes:** Strength percentages, rankings, shape analysis, 7 reflections.  
- **Purpose:** Interpret participant’s strengths constellation and imagination as apex strength.

### 4.2 Section 2 – Flow State Analysis & Optimization
- **Workshop Steps:** 2‑2, 2‑3  
- **Includes:** Flow assessment (12 Qs), flow score interpretation, 4 flow reflections, 4 user‑selected attributes.  
- **Purpose:** Explain how participant experiences, sustains, and renews flow.

### 4.3 Section 3 – Strengths + Flow Integration
- **Workshop Steps:** 2‑1 → 2‑3  
- **Includes:** No new inputs; synthesizes across previous sections.  
- **Purpose:** Connects strengths and flow rhythm with imagination as integrator.  
- **Autonomy:** Writer independently identifies overlapping themes; no external focus fields.

### 4.4 Section 4 – Well‑being & Future Self
- **Workshop Steps:** 3‑1, 3‑2  
- **Includes:** Cantril Ladder, 5 well‑being reflections, 2 future self reflections, image data.  
- **Purpose:** Link present well‑being and envisioned future state.

### 4.5 Section 5 – Collaboration & Closing
- **Workshop Steps:** 3‑3  
- **Includes:** Final intention reflection.  
- **Purpose:** Synthesize personal insight into collaborative readiness.

---

## 5. Tone & Interpretation Policies

| Rule | Description |
|------|--------------|
| Speculative language | Use “may,” “tends to,” “appears,” “you describe,” etc. |
| Avoid absolutes | No “always,” “never,” “will,” “must.” |
| Reflective tone | Interpret, don’t evaluate. |
| Imagination as integrator | Treat imagination as connective, not mystical. |
| No fallback attributes | If missing, describe flow narratively. |
| No shape inference | Don’t assume shapes beyond provided data. |
| One quote minimum per section | Quote participant’s exact words if available. |

---

## 6. Validation Rules

```json
{
  "validation": {
    "strengths": { "sum_must_equal": 100, "each_between": [0, 100] },
    "flow_score": { "min": 12, "max": 60 },
    "wellbeing_levels": { "min": 0, "max": 10 }
  }
}
```

---

## 7. Changelog (v2.2)

- Removed `integration_focus` and `key_quotes` from payload schema.  
- Eliminated all references to backend or human preprocessing.  
- Embedded Workshop Step Mapping in each section.  
- Updated Section 3 for autonomous synthesis.  
- Added question text and label to flow assessment responses.  
- Tightened headers and schema formatting.
