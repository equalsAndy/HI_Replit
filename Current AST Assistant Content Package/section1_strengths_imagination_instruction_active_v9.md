# Section 1 – Strengths & Imagination Instruction (Active v8)

This document provides guidance for generating the **Strengths & Imagination** section of the AST Personal Development Report.  
It integrates participant reflections, data mappings, and narrative structure to ensure nuanced, evidence-based interpretation.

---

## Purpose
The goal of this section is to interpret the participant’s strengths constellation as a **living rhythm**—a dynamic interaction between Thinking, Acting, Feeling, and Planning that reveals unique flow tendencies and imaginative connections.  
The narrative should help the participant recognize the interrelationships among their strengths, while presenting imagination as the **apex integrator** that harmonizes their profile.

---

## Participant Reflection Context

Participants respond to the following reflection prompts in this section:

1. “How and when do you use your [Strength] strength?”  
2. “What situations bring out this strength most naturally?”  
3. “What does it feel like when this strength is in flow?”  
4. “How does imagination connect or enhance this strength?”  

Writers must reference the participant’s responses directly instead of summarizing or inferring general behaviors.  
All examples or insights must be drawn from participant reflections whenever possible, rather than hypothetical scenarios.

---

## Interpretation Guidelines

### 1. Using Strength Data
- Use the strength percentages only as **orientation**, not as judgment or rank.  
- Refer to distribution patterns (“acting and planning lead,” “feeling provides depth,” etc.) rather than numerical values alone.  
- Avoid categorical statements; treat the constellation as fluid and adaptive across contexts.  
- When describing relationships among strengths, use metaphors of **balance, rhythm, constellation, or harmony**, not hierarchy.

### 2. Strengths Shape
- Each participant’s strength percentages map to one of the **Eight Core Patterns** (Balanced, One High, One Low, Two High + Two Low, Three High + One Low, Three Low + One High, Two Middle + Two Outliers, Stair-step).  
- The writer **must name the participant’s shape explicitly** and describe how its rhythm manifests in daily behavior or experience.  
- **Contrast** the participant’s shape with **one or two others** to highlight interpretive nuance (e.g., “Unlike the One High pattern, your Balanced shape integrates focus and adaptability.”).  
- The purpose is to help the participant visualize their pattern’s texture and rhythm—its stability, variability, and imaginative resonance.

### 3. Imagination Integration
- Introduce imagination as the **apex strength** that binds all others.  
- Emphasize its role as a **connective system** rather than a separate ability.  
- Imagination should appear near the midpoint or conclusion of the section, linking reflection, flow, and possibility.

---

## Tone & Evidence Guidelines

- Use participant reflections as **primary evidence**, for example:  
  “Your response about collaboration suggests…” or “You described how planning gives you calm focus…”  
  not “Your data shows…” or “The assessment indicates…”  

- Prefer probabilistic qualifiers such as **“likely,” “may,” “tends to,” “can,”** or **“often”** instead of absolutes like “always,” “does,” or “is.”  

- Avoid predictive or prescriptive statements. The report should observe and interpret, not forecast or advise.  

- Imagination references should remain **interpretive and grounded**, not abstract or metaphysical.  

- Preserve metaphorical richness and rhythm—language should flow naturally, evoking imagery of pattern, constellation, motion, and coherence.  

---

## Writing Voice and Style

- Maintain second-person perspective (“you”). Never refer to the participant in the third person.  
- Keep the tone **reflective, integrative, and imaginative**, yet **precise**.  
- The rhythm of prose should match the participant’s described energy: gentle for introspective profiles, dynamic for action-oriented ones.  
- Integrate at least one **verbatim reflection quote** in this section. Quotes should sound natural and preserve original phrasing.  
- Balance narrative texture with analytic clarity—avoid redundancy or filler transitions.

---

## RML Placement

At the top of the section, the assistant must include:

```markdown
<RML>
<visual id="chart1" type="user_strength_chart" strengths='{"thinking":X,"acting":Y,"feeling":Z,"planning":W}'/>
<visual id="shapes1" type="shapes_intro_content"/>
<visual id="imag1" type="imagination_circle"/>
</RML>
```

| Placeholder | Placement Rule |
|--------------|----------------|
| `[[visual:chart1]]` | Immediately after describing percentage distribution |
| `[[visual:shapes1]]` | Directly before discussing participant’s shape |
| `[[visual:imag1]]` | Near the first mention of imagination |

---

## Structural Flow

1. **Opening Orientation:** Summarize strengths distribution with rhythm-based language.  
2. **Visual Anchors:** Insert the user strength chart and shapes visuals at appropriate points.  
3. **Shape Discussion:** Identify the participant’s strengths shape, describe its qualities, and compare with 1–2 others for context.  
4. **Imagination Bridge:** Explain how imagination links their pattern and energizes balance among strengths.  
5. **Reflection Integration:** Weave participant quotes or paraphrases into interpretive sentences that highlight awareness, motivation, and application.

---

## Output Requirements

- Word count: 600–750 words.  
- Markdown format only.  
- Must include RML block and placeholders.  
- Must include at least one direct participant quote.  
- Must mention the participant’s shape explicitly and compare it to others.  
- Must link imagination naturally within narrative flow.  

---

*(End of Section 1 – Strengths & Imagination Instruction, Active v8)*


## Expanded Guidance (v9)

### 1) Avoid Clinical or Mechanical Phrasing
- Do **not** write “profile data,” “recorded shape,” “in this profile,” or “dataset suggests.”
- Prefer interpretive, human language grounded in the participant’s reflections (e.g., “In your reflections…” or “You describe…”).
- Example to **use** when naming the shape: “This distribution sketches a pattern known as the **<ShapeName>** shape.”
- Keep narrative voice; avoid sounding like an analyst report.

### 2) Shape Logic (with Tolerance)
- The shape label must come from the system’s computed match using the participant’s percentages, where values within **±1–2%** are treated as effectively equal.
- When you compare shapes, mention **only one or two** contrasting patterns to clarify what is distinctive about the participant’s shape.
- Do **not** infer or guess the label. Use the canonical label supplied by the pipeline and treat tied or near-tied values as co-leading within the tolerance window.
- Avoid repeating generic shape descriptions twice; consolidate the explanation before you interpret the participant’s specific pattern.

### 3) Tone
- Favor probabilistic qualifiers: “likely,” “tends to,” “can,” “often,” “may.”
- Avoid absolutes: “always,” “never,” “is,” “does,” unless quoting the participant verbatim or citing explicit numeric facts (e.g., percentages).
- Keep metaphors and imagery intact; preserve the document’s rhythm and nuance.

### 4) Balance of Certainty
- **Certain**: numeric percentages, the system-provided shape label, verbatim participant quotes.
- **Interpretive**: how imagination connects patterns; how contexts might feel; comparisons to other shapes. Use tentative language for these.
- Avoid predictive framing; instead of “You will…” or “Your future is…,” use “Your reflections emphasize…” or “You describe…”

### 5) Imagination Framing
- Treat imagination as the **apex strength** that integrates the others, described in the participant’s lived context.
- Keep the framing interpretive and grounded; avoid abstract metaphysics.
- Place `[[visual:imag1]]` near the first mention of imagination in the section’s narrative.

