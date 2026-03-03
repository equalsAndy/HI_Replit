# 🧩 RML Visual Tag Instructions – v1.11 (October 2025 Update)

## Overview
This document defines the valid `<visual>` tags and `[[visual:id]]` placeholders used in AllStarTeams (AST) Personal Development Reports.

**This version aligns with the new renderer system** (October 2025) which introduces:
- ✅ Simplified Vision visuals (`type="vision"`)
- ✅ Automatic horizontal grouping of consecutive vision images
- ✅ Explicit `id` requirement for ladder visuals (`id="wellbeing_ladder"`)
- ✅ Backward compatibility with legacy vision1–4 numbering

---

## General Rules

### Declaration Block
Each section begins with a single `<RML>` block declaring all visuals used within that section.

```xml
<RML>
  <visual id="chart1" type="user_strength_chart" strengths='{"thinking":27,"acting":25,"feeling":23,"planning":25}'/>
  <visual id="shape_intro" type="shapes_intro_content"/>
  <visual id="imagination_circle" type="imagination_circle"/>
</RML>
```

### Placeholder Placement
Each declared `<visual>` must have a matching `[[visual:id]]` placeholder in the markdown body.

```markdown
[[visual:chart1]]
[[visual:shape_intro]]
[[visual:imagination_circle]]
```

- Placeholders **must appear on their own line**.
- Each placeholder ID must match exactly to a declared visual.
- Placeholders **do not render inline** with paragraph text.

---

## 🧭 Supported Visual Types

### 1. Strengths Chart & Shape Visuals
Used in Section 1: Strengths & Imagination

```xml
<visual id="chart1" type="user_strength_chart" strengths='{"thinking":27,"acting":25,"feeling":23,"planning":25}'/>
<visual id="shape_intro" type="shapes_intro_content"/>
<visual id="imagination_circle" type="imagination_circle"/>
```

### 2. Flow Attribute Visuals
Used in Section 2: Flow State Analysis & Optimization

```xml
<visual id="attr1" type="flow_attribute" value="Empathic"/>
<visual id="attr2" type="flow_attribute" value="Energetic"/>
<visual id="attr3" type="flow_attribute" value="Strategic"/>
<visual id="attr4" type="flow_attribute" value="Methodical"/>
```

Each participant-selected flow attribute should appear as its own `<visual>` declaration and `[[visual:attrN]]` placeholder.

---

### 3. Ladder Visual (Well-being Ladder)
Used in Section 4: Well-being & Future Self

```xml
<visual id="wellbeing_ladder" type="ladder" current_level="6" future_level="8"/>
```
```markdown
[[visual:wellbeing_ladder]]
```
- **ID is required:** always use `id="wellbeing_ladder"`.
- Appears at the top of the section before narrative content.

---

### 4. Vision Visuals (Future Self Images)
Used in Section 4: Well-being & Future Self

**Simplified universal syntax (NEW in v1.11):**
```xml
<visual id="vision1" type="vision"/>
<visual id="vision2" type="vision"/>
<visual id="vision3" type="vision"/>
<visual id="vision4" type="vision"/>
```
```markdown
[[visual:vision1]]
[[visual:vision2]]
[[visual:vision3]]
[[visual:vision4]]
```

- Each vision image appears on its **own line**.
- The renderer automatically detects consecutive vision placeholders and groups them horizontally into a centered row.
- Supports 1–4 images (more if future sections expand).
- Avoid referencing “photograph” or “picture” — refer to **what is depicted**.

✅ **Backward compatibility:**  
Legacy numbered types (`type="vision1"`, `type="vision2"`, etc.) still work but are deprecated.

---

### 5. Miscellaneous Visuals
Other visuals may include dynamic experiment types (e.g., quote clusters, integration diagrams) and follow the same declaration and placeholder rules.

---

## 🧩 Example Section Declaration

```xml
<RML>
  <visual id="wellbeing_ladder" type="ladder" current_level="6" future_level="8"/>
  <visual id="vision1" type="vision"/>
  <visual id="vision2" type="vision"/>
  <visual id="vision3" type="vision"/>
</RML>
```
```markdown
[[visual:wellbeing_ladder]]

Your selected images represent your future vision:

[[visual:vision1]]
[[visual:vision2]]
[[visual:vision3]]
```

---

## 📘 Style Behavior (Renderer)

### Vision Group Layout
Consecutive vision placeholders render in a single centered row:

```css
.rml-vision-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  margin: 30px auto;
}
```

### Responsive Layout
```css
@media (max-width: 768px) {
  .rml-vision-group {
    flex-direction: column;
    align-items: center;
  }
}
```

---

## 🧾 Version History

| Version | Date | Changes |
|----------|------|----------|
| v1.7 | Aug 2025 | Added flow_attribute visuals |
| v1.8 | Sept 2025 | Clarified placement rules |
| v1.9 | Oct 2025 | Added ladder + vision examples |
| v1.10 | Oct 2025 | Fixed ladder ID requirements |
| **v1.11** | **Oct 2025** | **Simplified vision type, added auto-grouping, explicit wellbeing ladder ID** |
