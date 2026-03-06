# RML Visual Tag Instructions (v1.7)

**Last updated:** 2025-10-07  
**Scope:** AST Personal Development Report visuals (Sections 1–5)  
**Renderer types recognized:** `user_strength_chart`, `shapes_intro_content`, `imagination_circle`, `flow_attribute`, `ladder`

---

## 1) Purpose

This document specifies the exact Report Markup Language (RML) syntax the assistant must produce so the renderer can insert graphics in each report section. It replaces and supersedes v1.6 with clarifications for Section 3 optional visuals and Section 2 attribute usage.

---

## 2) Anatomy of RML in a Section

RML is a **two-part** system used per section that includes visuals:

**Part A — Declaration block (required at the very top of the section):**
```xml
<RML>
  <visual id="unique_id" type="visual_type" [attributes]/>
  <!-- add additional <visual/> rows as needed -->
</RML>
```

**Part B — Placeholders in the markdown where visuals should appear:**
```
[[visual:unique_id]]
```

**Rules**
- Put the `<RML>...</RML>` block **first** (before any prose) in any section that uses visuals.
- Each `<visual/>` requires a unique `id` **within that section** (e.g., `chart1`, `shapes1`, `imag1`, `attr1`, `ladder1`).  
- Every `[[visual:id]]` **must match** a declared `id` exactly.
- Placeholders should appear on their **own line** in the markdown.
- Do **not** include HTML, CSS, or rendering logic—only RML declarations and placeholders.
- Do **not** include citation markers or reference tokens (e.g., `【...†source】`).
- **Do not add section titles** (the app supplies them). Start directly with the RML block or prose.

---

## 3) Visual Types & Attributes

### 3.1 `user_strength_chart`
- **Purpose:** Render the user’s Thinking/Acting/Feeling/Planning percentages as colorized bars.
- **Attributes (required):** `strengths='{"thinking":X,"acting":Y,"feeling":Z,"planning":W}'`  
  - JSON must use **double-quoted keys**; wrap the whole JSON in **single quotes** in RML.
- **Example:**
```xml
<visual id="chart1" type="user_strength_chart" strengths='{"thinking":22,"acting":29,"feeling":26,"planning":23}'/>
```
```markdown
[[visual:chart1]]
```

### 3.2 `shapes_intro_content`
- **Purpose:** Show the gallery of the eight core strength shapes.
- **Attributes:** none
- **Example:**
```xml
<visual id="shapes1" type="shapes_intro_content"/>
```
```markdown
[[visual:shapes1]]
```

### 3.3 `imagination_circle`
- **Purpose:** Imagination as a connecting-force motif.
- **Attributes:** none
- **Example:**
```xml
<visual id="imag1" type="imagination_circle"/>
```
```markdown
[[visual:imag1]]
```

### 3.4 `flow_attribute`
- **Purpose:** Colored attribute tiles used in the Flow section.
- **Attributes (required):** `value="AttributeName"`  
  - **Use user-derived attribute names only** (e.g., “Strategic”, “Empathic”, “Methodical”, “Energetic”).  
  - **Do not** use universal flow conditions (e.g., “Clear Goals”, “Immediate Feedback”) as values.
- **Example:**
```xml
<visual id="attr1" type="flow_attribute" value="Empathic"/>
```
```markdown
[[visual:attr1]]
```

### 3.5 `ladder`
- **Purpose:** Cantril well-being ladder with current and future levels highlighted.
- **Attributes (required):** `current_level="X"`, `future_level="Y"`
- **Example:**
```xml
<visual id="ladder1" type="ladder" current_level="7" future_level="8"/>
```
```markdown
[[visual:ladder1]]
```

---

## 4) Section-Specific Contract

| Section | Visuals | Requirements | Placement |
|---|---|---|---|
| **1 – Strengths & Imagination** | **Required:** `user_strength_chart`, `shapes_intro_content`, `imagination_circle` | Chart must include `strengths` JSON. | Put chart and shapes immediately after the percent breakdown. Place `[[visual:shapes...]]` **right before** you describe the user’s specific shape; imagination circle near its first mention. |
| **2 – Flow State Analysis & Optimization** | **Required:** four `flow_attribute` visuals | Each `value` must be a **user-derived** flow attribute (not universal conditions). Use distinct IDs (`attr1`–`attr4`). | The app also renders attributes in a row at the top; still include the four `[[visual:attrX]]` inline, each **immediately before** the corresponding short paragraph about that attribute. |
| **3 – Strengths + Flow Integration** | **Optional:** `imagination_circle` | No other visuals allowed in this section. | If used, declare one `imagination_circle` and reference it **once** near the imagination synthesis line. Otherwise, omit RML entirely. |
| **4 – Well-being + Future Self** | **Required:** `ladder` | Provide `current_level` and `future_level`. | The ladder placeholder appears **at the very top of the section**, before any narrative text. |
| **5 – Collaboration & Closing** | **Optional:** `imagination_circle` | None | If used, declare and reference once in a closing synthesis beat. Otherwise, omit RML. |

**Prohibited crossovers**
- Do **not** place `shapes_intro_content` outside Section 1.  
- Do **not** place `flow_attribute` tiles outside Section 2.  
- Do **not** place `ladder` outside Section 4.

---

## 5) Validation Checklist (per section)

- [ ] If any placeholder exists, an `<RML>` block is present at the **top** of the section.  
- [ ] Every `[[visual:id]]` has a matching `<visual id="id" .../>`.  
- [ ] All required attributes are present (`strengths`, `value`, `current_level`, `future_level`).  
- [ ] Attribute **values** for `flow_attribute` are user-derived (not universal conditions).  
- [ ] No unknown `type` names are used (must be exactly one of the five above).  
- [ ] No HTML, CSS, or citations are included in the section text.  
- [ ] No section titles are written by the assistant.  

---

## 6) Troubleshooting

**Problem:** “Unknown visual type: …”  
**Fix:** Ensure the `type` is exactly one of: `user_strength_chart`, `shapes_intro_content`, `imagination_circle`, `flow_attribute`, `ladder`.

**Problem:** Placeholders render as plain text.  
**Fix:** Verify that the section starts with a valid `<RML>` block **and** that each placeholder ID matches a declared visual.

**Problem:** Flow tiles show universal conditions (“Clear Goals”, etc.).  
**Fix:** Replace with **user attributes** (e.g., “Empathic”, “Strategic”, “Energetic”, “Methodical”).

**Problem:** Ladder not at the top.  
**Fix:** For Section 4, declare and reference the ladder first, then start the prose.

---

## 7) Examples

### 7.1 Section 1 (Strengths)
```xml
<RML>
  <visual id="chart1" type="user_strength_chart" strengths='{"thinking":22,"acting":29,"feeling":26,"planning":23}'/>
  <visual id="shapes1" type="shapes_intro_content"/>
  <visual id="imag1" type="imagination_circle"/>
</RML>
```
```
[[visual:chart1]]

[[visual:shapes1]]  ← place this immediately before you describe the user’s specific shape

...shape comparison paragraph...

[[visual:imag1]]
```

### 7.2 Section 2 (Flow) — attributes inline & short
```xml
<RML>
  <visual id="attr1" type="flow_attribute" value="Empathic"/>
  <visual id="attr2" type="flow_attribute" value="Energetic"/>
  <visual id="attr3" type="flow_attribute" value="Strategic"/>
  <visual id="attr4" type="flow_attribute" value="Methodical"/>
</RML>
```
```
[[visual:attr1]]
A brief (2–4 sentence) paragraph connecting “Empathic” to the participant’s reflection and flow context.

[[visual:attr2]]
Short paragraph on “Energetic”…

[[visual:attr3]]
Short paragraph on “Strategic”…

[[visual:attr4]]
Short paragraph on “Methodical”…
```

### 7.3 Section 3 (Integration) — optional imagination circle
```xml
<RML>
  <visual id="imag3" type="imagination_circle"/>
</RML>
```
```
[[visual:imag3]]
…imagination-as-integrator synthesis line…
```

### 7.4 Section 4 (Well-being) — ladder first
```xml
<RML>
  <visual id="ladder1" type="ladder" current_level="7" future_level="8"/>
</RML>
```
```
[[visual:ladder1]]
…then begin the narrative…
```

---

## 8) Version Notes

- **v1.7**: Clarifies that Section 3 can optionally include a single `imagination_circle`; strengthens Section 2 rule to **forbid universal flow conditions** as `flow_attribute` values; reiterates “no section titles” and citation-free content.  
- **v1.6**: Added ladder placement rule (top of Section 4), inline attribute tiles guidance, shapes placement before shape discussion.
