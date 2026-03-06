# 🧩 RML Visual Tag Instructions v2.0
**Updated:** October 2025  
**Author:** Heliotrope Imaginal / AllStarTeams  
**Purpose:** Defines standardized tag syntax and layout logic for AI-generated report visuals.

---

## 🎯 Overview
RML (Report Markup Language) is the structured visual tagging system used in AllStarTeams reports.  
It allows the AI assistant to declare visual components (charts, squares, ladders, images) that render dynamically during report generation.

RML consists of two parts:
1. **Declaration block:** An XML-style `<RML>` tag containing one or more `<visual>` declarations.
2. **Inline placeholders:** Markdown placeholders (`[[visual:id]]`) that mark where each visual should appear.

---

## 📜 General Syntax

### Declaration Block
```xml
<RML>
  <visual id="unique_id" type="tag_type" param1="value1" param2="value2"/>
</RML>
```

### Inline Placeholder
```markdown
[[visual:unique_id]]
```

**Important:**  
Short-form placeholders (e.g. `[[attr1]]`) are still parsed but **deprecated**. Always use the explicit `[[visual:id]]` format.

---

## ✅ Supported Visual Tags

### 1. Strength Visualizations
| Type | Description |
|------|--------------|
| `strength_squares` | Four-color grid showing Thinking, Acting, Feeling, Planning percentages. |
| `user_strength_chart` | Horizontal bar chart of user strength percentages. |
| `strength_pie` | Pie chart of strength distribution. |
| `pattern_gallery` | Visual display of archetypal “shapes.” |
| `shapes_intro_content` | Educational graphic introducing shapes. |
| `thinking_square`, `acting_square`, `feeling_square`, `planning_square` | Individual strength icons for quadrant color alignment. |

**Parameters Example:**
```xml
<visual id="chart1" type="user_strength_chart" 
  strengths='{"thinking":27,"acting":25,"feeling":23,"planning":25}'/>
```

---

### 2. Flow & Imagination

| Type | Description |
|------|--------------|
| `flow_attribute` | Small square visual showing a single flow attribute (e.g. “Diligent”). |
| `flow_attributes_row` | Auto-row version that lists multiple attributes. |
| `imagination_circle` | Purple visual symbolizing Imagination as the apex integrator. |

**Example:**
```xml
<visual id="attr1" type="flow_attribute" value="Diligent"/>
<visual id="imagination1" type="imagination_circle"/>
```

**New in v2.0:**  
Flow attributes can be **grouped directly after strength squares** to show alignment between flow and strengths.  

```xml
<visual id="t1" type="thinking_square"/>
<visual id="attr1" type="flow_attribute" value="Diligent"/>
<visual id="attr2" type="flow_attribute" value="Sensible"/>
```

→ renders as a single horizontal grouping: [Thinking Square] [Diligent] [Sensible]

---

### 3. Well-being & Future

| Type | Description |
|------|--------------|
| `ladder` | SVG-based well-being ladder (rungs 0–10). |
| `vision` | Generic tag for selected Unsplash-based future self images (auto-grouped). |
| `future_self_image` | Optional single-image alternative. |

**Example:**
```xml
<visual id="ladder1" type="ladder" current_level="6" future_level="7"/>
<visual id="vision1" type="vision"/>
<visual id="vision2" type="vision"/>
```

**Note:** Legacy numbered tags (`vision1`, `vision2`, etc.) are supported for backward compatibility.

---

### 4. Identity & Report Elements

| Type | Description |
|------|--------------|
| `starcard_img` | Image block combining participant name and StarCard squares. |
| `starcard` | Simplified StarCard layout (no name). |
| `report_intro_content` | Branded introduction content. |
| `quote` | Formatted blockquote from participant reflection. |

**Example:**
```xml
<visual id="quote1" type="quote" 
  quote="I usually find flow when there's a shared goal and focus."
  author="From your flow reflection"/>
```

---

## ⚙️ Parameters Reference

| Parameter | Type | Description | Example |
|------------|------|-------------|----------|
| `id` | string | Unique identifier | `"attr1"` |
| `type` | string | Visual component type | `"flow_attribute"` |
| `strengths` | JSON | Percentages of Thinking/Acting/Feeling/Planning | `'{"thinking":27,"acting":25,"feeling":23,"planning":25}'` |
| `value` | string | Flow attribute text | `"Diligent"` |
| `current_level` | number | Well-being ladder current rung | `6` |
| `future_level` | number | Well-being ladder target rung | `7` |
| `participant` | string | Participant name | `"Jane Doe"` |
| `quote` | string | Quoted reflection | `"When the challenge feels right..."` |
| `author` | string | Attribution | `"From your reflection"` |
| `group` | string | Optional grouping label for debugging | `"thinking"` |

---

## ✨ Auto-Grouping Logic (v2.0)

Consecutive visuals of the same or related types are automatically grouped and horizontally centered.

| Auto-Group Type | Elements | Context |
|-----------------|-----------|----------|
| **Strength Squares** | `thinking_square`, `acting_square`, `feeling_square`, `planning_square` | Section 3 |
| **Flow Attributes** | `flow_attribute` (when following a strength square) | Section 3 |
| **Vision Images** | `vision` | Section 4 |
| **Strength Charts** | `user_strength_chart`, `strength_squares`, `pattern_gallery` | Section 1 |
| **Imagination Circle** | `imagination_circle` (optional) | May appear alongside grouped strengths |

**Example Output:**
```markdown
[[visual:t1]]
[[visual:attr1]]
[[visual:attr2]]
```
→ Displays as one visual group with horizontal alignment.

---

## 🧠 Developer Notes

- All RML components adhere to current `rml-renderer.ts` (v2025.10+).  
- Inline placeholders **must** match declaration IDs exactly.  
- Narratives should **not** describe visuals explicitly (e.g., “the chart shows…”).  
- Auto-grouping is purely visual; order defines association.  
- Short-form `[[attr1]]` syntax is deprecated but still parsed for backward compatibility.

---

## 🟣 AST Brand Colors

| Domain | Color | Hex | RGB |
|---------|--------|-----|------|
| Thinking | Green | `#01a252` | rgb(1, 162, 82) |
| Acting | Red | `#f14040` | rgb(241, 64, 64) |
| Feeling | Blue | `#167efd` | rgb(22, 126, 253) |
| Planning | Yellow | `#ffcb2f` | rgb(255, 203, 47) |
| Imagination | Purple | `#9333ea` | rgb(147, 51, 234) |

---

## 🧩 Version History

| Version | Date | Summary |
|----------|------|----------|
| **v1.11** | Sept 2025 | Added generic `vision` type and ladder tag ID fix. |
| **v2.0** | Oct 2025 | Introduced strength + flow grouping, normalized placeholder format, and updated auto-row logic. |

---

© 2025 Heliotrope Imaginal / AllStarTeams  
For internal use only.
