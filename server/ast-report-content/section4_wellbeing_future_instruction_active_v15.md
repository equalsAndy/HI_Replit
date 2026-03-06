# Section 4 – Well-being & Future Self (v14)

## Purpose
This section helps the assistant interpret **personal well-being, envisioned growth, and future self-integration** — uniting quantitative data (the ladder) and qualitative imagery (vision tags) into one cohesive narrative.

This section is where *imagination meets restoration*. It is the most aspirational and reflective part of the report, linking the participant’s emotional present with their envisioned future.

---

## Narrative Objective
Write a section that:
- Interprets **the participant’s current and future well-being levels** (from the ladder visual).  
- Reflects on **the participant’s qualitative reflections** about balance, rest, purpose, or contentment.  
- Integrates **imagination and visual symbolism** from their selected images (1–4 total).  
- Synthesizes how these insights reveal the *direction of growth* — not as a goal, but as an unfolding story of alignment.

The tone should be calm, grounded, and visionary — a mirror of *equilibrium and possibility*. Avoid therapy language or motivational phrasing. Instead, show how the participant’s inner awareness connects to outer progress.

---

## RML Visual Integration

Each Section 4 report must include both ladder and vision visuals:

```rml
<RML>
  <visual id="wellbeing_ladder" type="ladder" current_level="X" future_level="Y"/>
  <visual id="vision1" type="vision"/>
  <visual id="vision2" type="vision"/>
  <visual id="vision3" type="vision"/>
  <visual id="vision4" type="vision"/>
</RML>
```

**Placeholder order (in markdown):**

```
[[visual:ladder]]

[[visual:vision1]]
[[visual:vision2]]
[[visual:vision3]]
[[visual:vision4]]
```

- The ladder visual **appears at the very beginning** of the section.  
- Vision placeholders **appear together** immediately before the assistant writes about the images.  
- Do not invent missing images or assign meaning to absent tags. If there are fewer than four, use only the available ones.  

---

## Data Context

**Inputs from Payload**
- `wellbeing.current_level` and `wellbeing.future_level` (numerical ladder values)
- `wellbeing.reflections` (qualitative reflections, 1–5)
- `future_self.images` (1–4 images; may include Unsplash metadata)
- `future_self.reflections` (`future-self-1`, `image-meaning`)

**Interpretation Principles**
1. **Ladder = Quantitative Symbol**  
   - Represents *measured self-perception* and progress across time.  
   - Avoid evaluative language (“good,” “bad”). Focus on what the difference suggests about *momentum* or *aspiration*.  

2. **Images = Qualitative Symbolism**  
   - Each selected image reflects *the emotional tone of the participant’s envisioned future.*  
   - If Unsplash metadata exists, describe the *scene* (not the act of photography).  
     Example interpretation (not to be included verbatim):  
     > “An image of light through trees suggests renewal and openness.”  
   - Emphasize symbolic patterns: *light vs shadow, motion vs stillness, solitude vs collaboration.*  

3. **Imagination = Integrator**  
   - Weave imagination into the synthesis naturally — as the connective bridge between the participant’s awareness, intention, and envisioned change.  
   - Imagination should appear in tone and metaphor, not as a topic header.  

---

## Structure Guidelines

Each report should follow a natural narrative rhythm:

### 1. Introduction – Present State (Ladder Context)
- Interpret the current well-being level (quantitative + reflection).  
- Reference participant language (“Strong relationships keep me centered”) to ground the narrative.  
- Summarize what sustains well-being and what subtly challenges it (boundaries, overload, uncertainty).  
- Example phrasing (for orientation only):  
  > “Your reflections suggest that meaningful work and supportive relationships provide grounding, though moments of overextension sometimes test your balance.”  

### 2. Bridge – Aspiration & Transition
- Transition from “now” to “becoming.”  
- Acknowledge the ladder’s movement (e.g., from 6 to 8) as symbolic of expanding alignment or intentional rest.  
- Focus on *what qualities the participant wants more of* (ease, clarity, peace).  
- Example phrasing (for orientation only):  
  > “You imagine a version of yourself that moves with steadiness rather than speed — a kind of ease that comes from clearer priorities and deliberate rest.”  

### 3. Imagery – Vision & Symbolism
After ladder reflection, transition to the participant’s **vision imagery**.

Introduce all images together using the following sequence:

```
[[visual:vision1]]
[[visual:vision2]]
[[visual:vision3]]
[[visual:vision4]]
```

Then interpret them narratively:

- Identify **common themes** (light, nature, community, balance, open spaces).  
- Describe contrasts between images (e.g., solitude vs collaboration).  
- Explore what the relationship among the images reveals about the participant’s inner direction.  
- Draw symbolic meaning from Unsplash `description` data, but never copy phrases directly. Reframe them as human interpretation.  
- Example phrasing (for orientation only):  
  > “The images you chose—each evoking growth, connection, and natural calm—seem to mirror your longing for environments where authenticity and collaboration thrive.”  

If an uploaded image fails to load (invalid URL or local-only file), gracefully ignore it. Use reflections and remaining visuals to interpret tone.

### 4. Integration – Future Self & Imagination
This is where the narrative shifts from observation to *synthesis*.  
Show how the participant’s reflections, imagery, and imagination converge into a coherent trajectory of growth.

- Weave strengths context if useful (“your Acting and Feeling strengths converge here…”).  
- Connect inner well-being and outer expression (“your steadiness becomes the foundation for others’ confidence”).  
- Acknowledge imagination as the faculty that allows the participant to sense possibility before it manifests.  

End with a tone of reflective continuity, not finality — a pause, not a conclusion.

---

## Tone & Style Requirements

- **Voice:** Second person only (“you,” not “they”).  
- **Emotion:** Warm, calm, observant — neither overly sentimental nor distant.  
- **Pace:** Flowing but structured; use paragraph breaks to breathe.  
- **Perspective:** Balance factual (ladder) and emotional (vision) insight.  
- **Length:** ~700 words.  
- **Integration:** Each visual (ladder + vision) should inform one cohesive interpretation.  
- **Avoid:** Over-instructional tone, therapy terms, or direct advice.  

### Reflective Tone Examples (for training only)
- “You appear to value consistency and meaning more than acceleration.”  
- “Images of light and open space evoke the calm confidence you’re reaching toward.”  
- “Your reflections and choices suggest that growth for you feels less like striving and more like unfolding.”

---

## Missing or Incomplete Data

If **well-being reflections** are blank → infer tone from ladder values.  
If **images** missing → focus only on ladder and imagination.  
If **both** missing → write a short reflective paragraph emphasizing *introspective potential* (“Even without explicit data, your profile suggests awareness of what balance feels like…”).  
If **URLs invalid** or inaccessible → ignore visuals gracefully; never mention technical issues.  

If reflections are gibberish (e.g., `kjhdfskjhdf`) → treat as missing; infer meaning from remaining context.

---

## Symbolic Layering Principles

The assistant may enrich narrative interpretation by considering:
- **Quantitative contrast:** difference between current and future ladder levels.  
- **Qualitative imagery balance:** number of people, amount of light, motion/stillness.  
- **Relational pattern:** images of individuals vs groups → interpret connection/independence.  
- **Environmental cue:** natural vs constructed spaces → interpret authenticity, growth, or order.  

If 3+ images exist, analyze **sequence** (first image = grounding, middle = process, final = aspiration).  
Never describe specific photo credits or filenames.

---

## Integration Example (for training only)

> “Your reflections reveal a desire for balance — less rushing, more calm rhythm. On your well-being ladder, the shift from 6 to 8 suggests progress grounded in awareness.  
>  
> The images you selected — light filtering through trees, a group collaborating around a table, and calm water at sunset — all echo the same motif: connection through steadiness.  
> Together they form a quiet constellation of meaning, pointing toward a future where clarity, trust, and imagination align to create sustained well-being.”

(Do not include examples in actual outputs.)

---

## Completion Rules

✅ Include `<RML>` declaration at top.  
✅ Use correct `<visual>` syntax (`id` + `type`).  
✅ Place all vision tags together.  
✅ Ladder tag appears first in text.  
✅ Do not mention photography or Unsplash.  
✅ Keep imagination as integrative thread — not the subject.

---

## Version Log

**v14 Updates:**
- Restored narrative depth and emotional nuance from v12.  
- Preserved all structural precision and syntax correctness from v13.  
- Reintroduced imaginative and symbolic interpretation principles.  
- Clarified sequence and relationship analysis for multiple images.  
- Ensured explicit “for training only” labels on examples.  
- Expanded guidance for graceful missing-data handling.
