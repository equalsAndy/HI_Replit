# AST Data Mapping (Active v3)

This document defines how database fields and workshop steps map to AST report sections.  
Used by the preprocessor to construct stateless payloads for each section request.

---

## Section 1 – Strengths & Imagination
| Field ID | DB Field | Workshop Step | Notes |
|-----------|-----------|----------------|--------|
| strength-1 | thinkingReflection | 2-1 | Participant reflection on Thinking strength |
| strength-2 | planningReflection | 2-1 | Reflection on Planning strength |
| strength-3 | feelingReflection | 2-1 | Reflection on Feeling strength |
| strength-4 | actingReflection | 2-1 | Reflection on Acting strength |
| imagination | imaginationReflection | 2-1 | Apex reflection on imagination |
| team-values | teamValues | 2-1 | Reflection on ideal team environment |
| unique-contribution | uniqueContribution | 2-1 | Reflection on unique contribution |

---

## Section 2 – Flow State Analysis & Optimization
| Field ID | DB Field | Workshop Step | Notes |
|-----------|-----------|----------------|--------|
| flow-1 | flowReflection1 | 2-3 | When flow happens most naturally |
| flow-2 | flowReflection2 | 2-3 | What blocks or interrupts flow |
| flow-3 | flowReflection3 | 2-3 | Conditions that enable flow |
| flow-4 | flowReflection4 | 2-3 | How to create more opportunities for flow |
| flow_assessment | flowAssessment | 2-2 | 12-question Likert-scale assessment |
| flow_attributes | flowAttributes | 2-2 | 4 participant-selected flow attributes |

---

## Section 3 – Strengths + Flow Integration
| Field ID | DB Field | Workshop Step | Notes |
|-----------|-----------|----------------|--------|
| — | Derived (contextual synthesis) | — | Uses Section 1 + 2 data combined dynamically; no new fields |

---

## Section 4 – Well-being & Future Self
| Field ID | DB Field | Workshop Step | Notes |
|-----------|-----------|----------------|--------|
| wellbeing-1 | wellbeingCurrentFactors | 3-1 | Current well-being factors |
| wellbeing-2 | wellbeingFutureImprovements | 3-1 | Future improvements |
| wellbeing-3 | wellbeingSpecificChanges | 3-1 | Specific visible changes |
| wellbeing-4 | wellbeingQuarterlyProgress | 3-1 | 3-month progress |
| wellbeing-5 | wellbeingQuarterlyActions | 3-1 | Planned quarterly actions |
| image-meaning | futureImageMeaning | 3-2 | Meaning of selected future self images |
| future-self-1 | futureSelfDescription | 3-2 | Description of future self |

---

## Section 5 – Collaboration & Closing
| Field ID | DB Field | Workshop Step | Notes |
|-----------|-----------|----------------|--------|
| futureLetterText | futureLetterText | 3-3 | “The intention I want to carry forward is…” reflection |

---

## JSON Reference Block (for app)
```json
{
  "sections": {
    "1": ["strength-1","strength-2","strength-3","strength-4","imagination","team-values","unique-contribution"],
    "2": ["flow_assessment","flow_attributes","flow-1","flow-2","flow-3","flow-4"],
    "3": [],
    "4": ["wellbeing-1","wellbeing-2","wellbeing-3","wellbeing-4","wellbeing-5","image-meaning","future-self-1"],
    "5": ["futureLetterText"]
  }
}
```

---

## Validation
- All field IDs match **AST_Workshop_Questions_with_Field_IDs.md**.  
- No legacy aliases or duplicates remain.  
- Every field belongs to exactly one section.  
- Section 3 intentionally has no direct fields; it synthesizes context from Sections 1 and 2.

---
**End of File — ast_data_mapping_active_v3.md**
