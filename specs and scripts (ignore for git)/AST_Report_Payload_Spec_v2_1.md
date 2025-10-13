
# AST Report Payload Spec — v2.1 (Fixes for Open Issues)

This specification defines **section-scoped, stateless** payloads for the AST Personal Development Report writer. It incorporates corrections and clarifications from the latest review.

---

## 0) Core Principles

- **Stateless sections:** Each section request MUST contain all information the writer could need for that section. Do not rely on prior sections.
- **No renderer coupling:** Payload must NOT include RML or UI directives. (Rendering logic remains app-side.)
- **No defaults/fallback attributes:** If the participant did not select flow attributes, send an empty array and the writer will handle narrative without attribute labels.
- **Source of truth:** All field IDs and question text must mirror the current workshop database. Where semantic aliases are helpful, include both.

---

## 1) Section Envelope (applies to all sections)

```json
{
  "section": {
    "id": 2,
    "name": "flow_experiences",
    "title": "Flow State Analysis & Optimization",
    "workshop_steps": ["2-2", "2-3"], 
    "report_version": "v23.5"
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
  },
  "core_context": { ...section-specific bundle... }
}
```

### 1.1 Workshop Step Mapping (canonical)
- **Section 1 – Strengths & Imagination:** steps `["2-1"]` (assessment + 7 strength reflections incl. imagination)
- **Section 2 – Flow State Analysis & Optimization:** steps `["2-2","2-3"]` (flow assessment + 4 flow reflections + flow attributes)
- **Section 3 – Strengths + Flow Integration:** steps `["2-1","2-3"]` (synthesis only; no new fields)
- **Section 4 – Well-being + Future Self:** steps `["3-1","3-2"]` (Cantril ladder + 5 WB reflections + future-self images + image-meaning + future-self description)
- **Section 5 – Collaboration & Closing:** steps `["2-1","2-2","2-3","3-1","3-2","3-3"]` (synthesis; includes final reflection)

> **Note:** The writer remains section-scoped; the app must include everything needed for the section inside its payload even if the data originated in other steps.

---

## 2) Core Context Bundles (by section)

### 2.1 Section 1 — Strengths & Imagination

```json
"core_context": {
  "participant": { "id": 76, "name": "Jason Segal" },
  "strengths": {
    "thinking": 27, "acting": 25, "feeling": 23, "planning": 25,
    "ranked": ["thinking","acting","planning","feeling"]
  },
  "shape": {
    "label": "Balanced",
    "percent_equivalence_margin": 2,
    "roles": {
      "dominant": ["thinking"],
      "supporting": ["acting","planning"],
      "quieter": ["feeling"]
    },
    "comparison_shapes": ["One High","Two Middle + Two Outliers"]
  },
  "reflections": {
    "thinking": { "field_id":"strength-thinking", "question":"How and when do you use your Thinking strength?", "answer":"..." },
    "planning": { "field_id":"strength-planning", "question":"...", "answer":"..." },
    "feeling":  { "field_id":"strength-feeling",  "question":"...", "answer":"..." },
    "acting":   { "field_id":"strength-acting",   "question":"...", "answer":"..." },
    "imagination": {
      "field_id":"imagination",
      "question":"Your Apex Strength is Imagination",
      "instruction":"No matter what your strengths, your imagination is always on...",
      "answer":"..."
    },
    "team_values": {
      "field_id":"team-values", "question":"What you value most in team environments", "answer":"..."
    },
    "unique_contribution": {
      "field_id":"unique-contribution", "question":"Your unique contribution", "answer":"..."
    }
  }
}
```

**Shape Labels (complete set, per `strengths_patterns_and_shapes_active_v2.md`):**
- `Balanced`
- `One High`
- `One Low`
- `Two High + Two Low`
- `Three High + One Low`
- `Three Low + One High`
- `Two Middle + Two Outliers`
- `Stair-step`

**Role Logic (percent_equivalence_margin = ±2%):**
- Any two or more strengths within ±2% of each other are treated as equal for role assignment.
- `dominant`: highest value(s), respecting margin ties.
- `quieter`: lowest value(s), respecting margin ties.
- `supporting`: remaining strengths.

> The app computes `shape` server-side and supplies it; the writer does **not** infer shape from prose.

---

### 2.2 Section 2 — Flow State Analysis & Optimization

```json
"core_context": {
  "participant": { "id": 76, "name": "Jason Segal" },

  "flow_assessment": {
    "total_score": 48,
    "interpretation": "Flow Aware",   // one of: Flow Fluent (50–60), Flow Aware (39–49), Flow Blocked (26–38), Flow Distant (12–25)
    "responses": [
      { "question_id":1, "question_text":"I often feel deeply focused and energized by my work.", "score":4, "label":"Often" },
      { "question_id":2, "question_text":"The challenges I face are well matched to my skills.", "score":3, "label":"Sometimes" }
      // ... all 12
    ]
  },

  "flow_attributes": [
    { "name":"Dynamic",     "order":1 },
    { "name":"Punctual",    "order":2 },
    { "name":"Receptive",   "order":3 },
    { "name":"Encouraging", "order":4 }
  ],

  "flow_reflections": {
    "flow-1": {
      "field_id":"flow-1",
      "alias":"flow_naturally",
      "workshop_step":"2-3",
      "question":"When does flow happen most naturally for you?",
      "instruction":"Reflect on when you get 'in the zone'...",
      "min_length":25,
      "answer":"..."
    },
    "flow-2": {
      "field_id":"flow-2",
      "alias":"flow_blockers",
      "workshop_step":"2-3",
      "question":"What typically blocks or interrupts your flow state?",
      "instruction":"Consider what prevents you from getting into flow...",
      "min_length":25,
      "answer":"..."
    },
    "flow-3": {
      "field_id":"flow-3",
      "alias":"flow_conditions",
      "workshop_step":"2-3",
      "question":"What conditions help you get into flow more easily?",
      "instruction":"Think about your environment, routines...",
      "min_length":25,
      "answer":"..."
    },
    "flow-4": {
      "field_id":"flow-4",
      "alias":"flow_create_more",
      "workshop_step":"2-3",
      "question":"How could you create more opportunities for flow in your work and life?",
      "instruction":"Consider specific changes or practices...",
      "min_length":25,
      "answer":"..."
    }
  },

  "quotes": {
    "key_quotes": [
      { "context":"flow_trigger",   "quote":"I need alignment before I can find rhythm." },
      { "context":"flow_reward",    "quote":"Those are the moments when everything just clicks." }
    ]
  }
}
```

**Flow Attributes (confirmed workshop step 2-2):**
- Users select **exactly four** labels (from a controlled 56-word set, organized by quadrants). Each item MUST include `name` and ordinal `order` (1–4).  
- If the participant selected fewer than four, send what exists in ranked order. If none exist, send `[]`.

**Likert Mapping (responses.label):** `1="Never"`, `2="Rarely"`, `3="Sometimes"`, `4="Often"`, `5="Always"`.

**Key Quotes — Valid `context` values (current catalog):**
- `strength_example`, `flow_trigger`, `flow_blocker`, `flow_condition`, `flow_reward`,
- `wellbeing_anchor`, `future_self`, `collaboration`, `misc`

**Key Quotes — Extraction policy:**
- **Who:** Human curator OR backend AI (when enabled).  
- **When:** Optional enrichment step **before** calling the writer.  
- **Required?:** Optional. If none, send `key_quotes: []`.

**Section 2 Writing Guardrails (for the writer, not payload):**
- Attributes are **states during optimal engagement**, not traits.  
- Universal flow conditions may be referenced **inside** attribute paragraphs but are **not** attributes themselves.  
- No attribute fallbacks: if `flow_attributes` is empty, the writer builds a purely narrative flow section without attribute-tag paragraphs.

---

### 2.3 Section 3 — Strengths + Flow Integration

```json
"core_context": {
  "participant": { "id": 76, "name": "Jason Segal" },
  "strengths": { "thinking":27, "acting":25, "feeling":23, "planning":25, "ranked":["thinking","acting","planning","feeling"] },
  "shape": { "...": "same structure as Section 1" },
  "flow_assessment": { "...summary only or full, same schema as Section 2..." },
  "flow_reflections": { "flow-1":{...}, "flow-2":{...}, "flow-3":{...}, "flow-4":{...} },

  "integration_focus": {
    "required": false,
    "strengths": ["thinking","planning"],
    "flow_reflections": ["flow-1","flow-3"]
  }
}
```

**Integration Focus Policy:**
- **Optional.** If present, the writer should emphasize the nominated strengths/reflections.  
- **Who sets it:** Backend pre-processor or human editor.  
- **If omitted:** Writer selects salient threads using participant quotes and shape roles.

---

### 2.4 Section 4 — Well-being + Future Self

```json
"core_context": {
  "participant": { "id": 76, "name": "Jason Segal" },

  "wellbeing": {
    "current_level": 6, "future_level": 7,
    "reflections": {
      "wellbeing-1": { "field_id":"wellbeing-1", "alias":"current_factors",     "question":"What factors shape your current well-being rating?", "answer":"..." },
      "wellbeing-2": { "field_id":"wellbeing-2", "alias":"future_improvements", "question":"What improvements do you envision in one year?",       "answer":"..." },
      "wellbeing-3": { "field_id":"wellbeing-3", "alias":"specific_changes",    "question":"What will be noticeably different in your experience?", "answer":"..." },
      "wellbeing-4": { "field_id":"wellbeing-4", "alias":"quarterly_progress",  "question":"What progress would you expect in 3 months?",          "answer":"..." },
      "wellbeing-5": { "field_id":"wellbeing-5", "alias":"quarterly_actions",   "question":"What actions will you commit to this quarter?",        "answer":"..." }
    }
  },

  "future_self": {
    "images": [
      {
        "id":"QKUN1xjwDQA",
        "url":"https://...",
        "credit":{
          "source":"unsplash",
          "photographer":"Christian Bowen",
          "sourceUrl":"https://unsplash.com/..."
        },
        "description":"white duck on grass field"
      }
      // up to 4 total; user may upload their own images too
    ],
    "image_meaning": {
      "field_id":"image-meaning",
      "question":"What does your selected image mean to you?",
      "answer":"..."
    },
    "future_self_description": {
      "field_id":"future-self-1",
      "question":"Describe Your Future Self",
      "answer":"..."
    }
  }
}
```

**Image rules:**
- Users may select **1–4** images; array length should reflect actual selection.
- `credit` is optional for uploads; include when available (e.g., Unsplash).
- `description` is the image alt/metadata; the **user’s meaning** belongs in `image_meaning.answer`.

---

### 2.5 Section 5 — Collaboration & Closing

```json
"core_context": {
  "participant": { "id": 76, "name": "Jason Segal" },
  "strengths": { ...same as Section 1... },
  "shape": { ...same as Section 1... },
  "flow_assessment": { ...summary ok... },
  "flow_reflections": { ...as in Section 2... },
  "wellbeing": { "current_level": 6, "future_level": 7 },
  "future_self": { "future_self_description": { "answer":"..." } },

  "final_reflection": {
    "field_id":"futureLetterText",
    "alias":"final_intention",
    "question_prefix":"The intention I want to carry forward is ",
    "answer":"..."
  }
}
```

---

## 3) Validation Rules (global)

```json
"validation": {
  "strengths": { "sum_must_equal": 100, "each_between": [0,100] },
  "flow_assessment": { "min_total": 12, "max_total": 60, "responses_required": 12 },
  "wellbeing_levels": { "range": [0,10] },
  "min_lengths": { "default_reflection_chars": 25, "future_self_description": 50 }
}
```

---

## 4) Error & Missing Data Policy

- Missing reflection → include the object with `answer`: `""`.
- No flow attributes selected → `"flow_attributes": []`.
- Assessment not taken → omit `flow_assessment` or set `null` (backend must choose one convention and be consistent).
- Quotes unavailable or gibberish → `"quotes": { "key_quotes": [] }`.

---

## 5) Complete Example — Section 2 (Flow)

```json
{
  "section": {
    "id": 2,
    "name": "flow_experiences",
    "title": "Flow State Analysis & Optimization",
    "workshop_steps": ["2-2","2-3"],
    "report_version": "v23.5"
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
  },
  "core_context": {
    "participant": { "id": 76, "name": "Jason Segal" },
    "flow_assessment": {
      "total_score": 48,
      "interpretation": "Flow Aware",
      "responses": [
        { "question_id":1, "question_text":"I often feel deeply focused and energized by my work.", "score":4, "label":"Often" },
        { "question_id":2, "question_text":"The challenges I face are well matched to my skills.", "score":3, "label":"Sometimes" }
        // +10 more
      ]
    },
    "flow_attributes": [
      { "name":"Dynamic",     "order":1 },
      { "name":"Punctual",    "order":2 },
      { "name":"Receptive",   "order":3 },
      { "name":"Encouraging", "order":4 }
    ],
    "flow_reflections": {
      "flow-1": { "field_id":"flow-1", "alias":"flow_naturally", "workshop_step":"2-3", "question":"When does flow happen most naturally for you?", "min_length":25, "answer":"..." },
      "flow-2": { "field_id":"flow-2", "alias":"flow_blockers",  "workshop_step":"2-3", "question":"What typically blocks or interrupts your flow state?", "min_length":25, "answer":"..." },
      "flow-3": { "field_id":"flow-3", "alias":"flow_conditions","workshop_step":"2-3", "question":"What conditions help you get into flow more easily?", "min_length":25, "answer":"..." },
      "flow-4": { "field_id":"flow-4", "alias":"flow_create_more","workshop_step":"2-3", "question":"How could you create more opportunities for flow in your work and life?", "min_length":25, "answer":"..." }
    },
    "quotes": {
      "key_quotes": [
        { "context":"flow_trigger", "quote":"I need alignment before I can find rhythm." },
        { "context":"flow_reward",  "quote":"Those are the moments when everything just clicks." }
      ]
    }
  }
}
```

---

## 6) Open Questions (tracked)

- **Key quotes extraction (automation):** When backend AI extraction is enabled, specify confidence thresholds and de-duplication rules.
- **Integration focus authoring:** Define owner (human vs. pre-processor) and heuristics if we want to auto-suggest candidates.
- **Assessment narrative tags:** Optionally derive narrative hints from high/low items in the 12-question flow assessment for the writer.

---

**End of Spec v2.1**
