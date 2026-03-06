# Section 2 — Flow State Analysis & Optimization (Instruction v20)

> **Purpose**: Guide the writer to produce a reflective, integrative narrative about the participant’s flow experiences, grounded in their selected flow attributes, flow reflections, strengths profile/shape, and (optionally) flow assessment context. Maintain AST tone: interpretive, imaginative, and human-centered—never prescriptive.

---

## 1) Inputs expected in the payload (stateless per call)

- `strengths` (percentages + ranked order) and `shape` (label, roles, margin)
- `flow.attributes` — **exactly four** participant-selected words with rank 1–4
- `flow.reflections` — flow-1 … flow-4 answers (treat empty/gibberish as missing)
- `flow.assessment` — optional; may include total score and responses. **Use narratively only; do not label the user (“Flow Aware,” “Flow Fluent,” etc.).**
- `policies` — tone integrity flags (no predictions, no advice, speculative language, etc.)
- `participant` — name/id/email for quoting attribution (quote participant’s **answers** only; never the questions).

---

## 2) Required RML for Section 2

Declare at top of the section in a single `<RML>` block:

```xml
<RML>
  <!-- The four participant-selected flow attributes (required) -->
  <visual id="attr1" type="flow_attribute" value="ATTR_1"/>
  <visual id="attr2" type="flow_attribute" value="ATTR_2"/>
  <visual id="attr3" type="flow_attribute" value="ATTR_3"/>
  <visual id="attr4" type="flow_attribute" value="ATTR_4"/>

  <!-- Optional strength squares shown when connecting an attribute to its strength domain. 
       Use only if supported in the current renderer version. -->
  <visual id="sq_thinking" type="strength_square" strength="thinking"/>
  <visual id="sq_feeling"  type="strength_square" strength="feeling"/>
  <visual id="sq_planning" type="strength_square" strength="planning"/>
  <visual id="sq_acting"   type="strength_square" strength="acting"/>
</RML>
```

Use placeholders **on their own line**, placed directly before the paragraph that discusses each visual:

```markdown
[[visual:attr1]]
[[visual:sq_planning]]

…paragraph interpreting attribute 1 and its Planning linkage…
```

**If the renderer does not support `strength_square`, omit those four declarations and placeholders silently.** The narrative should still describe the linkage in text.

---

## 3) Attribute–Strength Mapping (complete reference)

*(For **internal interpretation** only. Do **not** show quadrants or lists in the participant’s report.)*

- **Thinking (14)**: Abstract, Analytic, Astute, Big Picture, Curious, Focused, Insightful, Logical, Investigative, Rational, Reflective, Sensible, Strategic, Thoughtful  
- **Feeling (12)**: Collaborative, Creative, Encouraging, Expressive, Empathic, Intuitive, Inspiring, Objective, Passionate, Positive, Receptive, Supportive  
- **Planning (14)**: Detail-Oriented, Diligent, Immersed, Industrious, Methodical, Organized, Precise, Punctual, Reliable, Responsible, Straightforward, Tidy, Systematic, Thorough  
- **Acting (14)**: Adventuresome, Competitive, Dynamic, Effortless, Energetic, Engaged, Funny, Persuasive, Open-Minded, Optimistic, Practical, Resilient, Spontaneous, Vigorous  

**Mapping rule:** Each selected flow attribute belongs to exactly one quadrant above. The writer may connect an attribute to its quadrant explicitly in prose (without naming the quadrant list), e.g., *“Sensible aligns with your Thinking domain…”*

---

## 4) Narrative structure (required)

1. **Opening:** Briefly name the participant’s own entry conditions into flow (from flow-1, flow-2, etc.), quoting one short phrase when available. Avoid restating the question text.
2. **Attribute Passages (x4):** For each selected attribute (rank order 1→4):
   - Insert its `flow_attribute` visual on a line by itself.
   - (If supported) Insert the `strength_square` visual for the linked domain above the paragraph.
   - Write one compact paragraph that:
     - Describes the attribute *as the participant experiences it in flow* (not a dictionary definition).
     - Connects the attribute to **its quadrant** and to the participant’s strengths/shape.
     - Weaves in any relevant reflection signals (flow-2 blockers, flow-3 conditions).
     - Uses **speculative** verbs: *may, seems, appears, suggests, can* (avoid “always/often”).  
3. **Conditions & Recovery:** Interpret how their stated conditions (flow-3) and blockers (flow-2) interact with the four attributes. If payload includes practices (flow-4), articulate how those *might* protect or renew flow.
4. **Shape Lens:** Bring in the **shape** lightly—e.g., *Balanced may invite contribution from all domains; Two Dominant might tilt the entry pathway toward those domains, while flow can still surface quieter capacities.*
5. **Imagination Thread:** Name imagination briefly as the integrator that helps the attributes and strengths cohere—never personify imagination.
6. **Close:** One sentence tying flow patterns to collaboration with others (interpretive, not prescriptive).

**Length target:** ~750 words (700–800).

---

## 5) Interpretive guidance (precise)

- **Quadrant matching**: Attributes **do** have a canonical quadrant (see table). The writer may state the linkage in prose (“…aligns with your Planning domain”), but should not display the canonical lists.
- **Alignment vs. contrast**:  
  - If all attributes align with the participant’s dominant strengths or shape roles → describe **synergy/coherence**.  
  - If attributes belong to quieter/secondary domains → describe **flow as a venue where quieter strengths may find expression**, without claiming causality.  
  - If attributes contrast sharply with the shape → frame as **balance/expansion**, not contradiction.
- **Assessment scores**: May inform tone (e.g., recognition of entry cues), but do **not** label the participant by a category name.
- **Blocker language**: Translate blockers into *conditions that might be adjusted*; avoid advice or lists.
- **Diction**: Prefer *may, might, can, seems, suggests* over *usually, often, always*. Avoid mechanistic phrases (“dataset indicates”).

---

## 6) Missing or noisy data

- **Empty/gibberish reflections** → treat as missing; lean on remaining reflections, attributes, strengths, and shape.
- **Fewer than 4 attributes** → interpret whatever is present; do not invent placeholders or defaults.
- **No assessment** → omit references to scoring; narrative still stands.
- **Renderer without `strength_square`** → omit those visuals; narrative still names the linkage.

---

## 7) RML placement example (do not echo in report)

```xml
<RML>
  <visual id="attr1" type="flow_attribute" value="Diligent"/>
  <visual id="attr2" type="flow_attribute" value="Positive"/>
  <visual id="attr3" type="flow_attribute" value="Expressive"/>
  <visual id="attr4" type="flow_attribute" value="Sensible"/>

  <!-- Optional, if supported -->
  <visual id="sq_planning" type="strength_square" strength="planning"/>
  <visual id="sq_feeling"  type="strength_square" strength="feeling"/>
  <visual id="sq_acting"   type="strength_square" strength="acting"/>
  <visual id="sq_thinking" type="strength_square" strength="thinking"/>
</RML>
```

```markdown
[[visual:attr1]]
[[visual:sq_planning]]
Your diligence may surface most clearly when the work offers clear contours and tangible progress. Because **Diligent** maps to your Planning domain, it seems to harmonize with how you organize effort and sustain momentum—especially when your reflections describe clarity and a shared goal.

[[visual:attr2]]
[[visual:sq_feeling]]
…
```

---

## 8) Quality checks (reject if violated)

- Missing `<RML>` block or any unknown visual types.  
- Placeholders not on their own line.  
- Using fallback or invented attributes.  
- Quoting the **questions** instead of **answers**.  
- Predictions, advice, or deterministic statements.  
- Listing quadrant taxonomy in the participant-facing text.

---
