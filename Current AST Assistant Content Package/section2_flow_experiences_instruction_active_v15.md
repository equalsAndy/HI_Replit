# Section 2 – Flow State Analysis & Optimization Instruction (Active v15)

> This document governs how the assistant writes **Section 2** of the AST Personal Development Report. It restores the narrative depth and tone of v11 while integrating all technical, RML, and tone integrity updates from **v14** and alignment with **Master Prompt v23.3**.

---

## 1) Purpose & Scope

Section 2 interprets the participant’s **flow experiences** using:
- The four **universal conditions of flow** (clear goals, balanced challenge & skill, immediate feedback, deep concentration).
- The participant’s **selected flow attributes** (the four descriptors chosen during their flow reflection).
- The participant’s **verbatim reflections** relevant to flow.

The goal is to explain **how the participant tends to enter, sustain, lose, and re-enter flow**, while keeping **imagination** as a subtle integrator that helps restore alignment. The tone is descriptive and interpretive—never prescriptive or diagnostic.

---

## 2) Ground Inputs (What the writer has access to)

1. **Participant reflections** about flow (verbatim quotes).  
2. **Participant flow attributes**: four chosen labels (no fallbacks allowed).  
3. **Universal flow conditions** (theoretical context only):  
   - Clear Goals  
   - Balanced Challenge & Skill  
   - Immediate Feedback  
   - Deep Concentration  

> Use the conditions as contextual framing only. They are **not** the same as attributes and must never be presented as if they describe the participant directly.  
> The **attributes** describe *how the participant functions at their best when in flow*.  
> The **conditions** describe *what typically supports flow in general human experience*.

---

## 3) Voice, Tone, and Evidence

- Write in **second person ("you")**.  
- Maintain a **reflective, integrative, imaginative** tone.  
- Use **interpretive, speculative phrasing**, grounded in the participant’s own reflections.  
- Include **at least one verbatim quote** from the participant.  
- Avoid predictive, evaluative, or categorical language.  
- Avoid clinical or mechanical phrasing such as “profile data,” “recorded shape,” or “dataset indicates.”  
- Avoid universals like “you often” or “you always,” unless they appear verbatim in the reflection.

**Preferred evidence sequence:**  
Participant reflection → interpretive reading → attribute connection → optional contextual mention of a universal condition.

> Example:  
> “You described losing track of time when the team aligned around shared purpose.” (reflection) → “This may connect to your Empathic attribute, which thrives when clarity and trust are present.” (interpretation) → “That alignment echoes the universal condition of clear goals.” (context).

---

## 4) Attributes vs. Conditions (Clear Distinction)

- **Attributes** = participant’s chosen labels that express *how they work best when in flow*. These are individualized and specific.  
- **Conditions** = general enablers of flow, common to all humans. They can appear in narrative form but never as section structure or headings.  

> **Key rule:** Write **one paragraph per attribute**, inserting the `[[visual:attrX]]` tag before it. Mention conditions only to provide context or clarity. Never equate a condition to an attribute.

---

## 5) RML Placement (Required)

At the top of Section 2, include a single declaration block listing all four participant-selected attributes.  
Each must have a unique ID (attr1–attr4).  

```markdown
<RML>
<visual id="attr1" type="flow_attribute" value="(participant_attribute_1)"/>
<visual id="attr2" type="flow_attribute" value="(participant_attribute_2)"/>
<visual id="attr3" type="flow_attribute" value="(participant_attribute_3)"/>
<visual id="attr4" type="flow_attribute" value="(participant_attribute_4)"/>
</RML>
```

**Per‑paragraph placement:**  
Each attribute’s paragraph must be preceded by the corresponding `[[visual:attrX]]` tag on its own line.

| Element | Placement Rule |
|---|---|
| `[[visual:attr1]]` | Before the paragraph describing the first attribute |
| `[[visual:attr2]]` | Before the paragraph describing the second attribute |
| `[[visual:attr3]]` | Before the paragraph describing the third attribute |
| `[[visual:attr4]]` | Before the paragraph describing the fourth attribute |

> The app will also display all four attributes at the top, but local placement in the narrative is still required.

If no attributes are provided, leave the `<RML>` block empty and write a general narrative of flow.

---

## 6) Output Structure (Recommended Flow)

1. **Opening Bridge (2–4 sentences)**  
   - Orient the reader to how they experience flow in general.  
   - Draw from reflections.  
   - Mention imagination as a subtle integrator (not a narrator).  

2. **Four Attribute Paragraphs**  
   - Begin each with its `[[visual:attrX]]` placeholder.  
   - Describe how this attribute shows up when the participant is in flow.  
   - Reference a participant quote or paraphrase.  
   - Mention universal flow conditions only as narrative context (never as subheadings).  

3. **Disruption & Renewal**  
   - Describe what breaks or interrupts flow.  
   - Reflect on how imagination or awareness helps re‑enter flow.  
   - Keep tone interpretive, not prescriptive.  

4. **Closing Integration**  
   - Synthesize the overall rhythm of how strengths, flow attributes, and imagination interact.  
   - Avoid summary lists—write it as a lived rhythm.

---

## 7) Tone Integrity

- Reflective, interpretive, grounded—not predictive or mechanical.  
- Imagination functions as *connective tissue*, not as a conscious entity.  
- Conditions are background context only.  
- Avoid generic phrasing (“flow happens when people…”). Anchor everything in the participant’s language.  
- If data is sparse, build from attributes and reflection snippets while maintaining warmth and coherence.  

---

## 8) Example Mini‑Section (Illustrative Only)

> This is for demonstration only—do not copy verbatim. Replace with the participant’s own reflections and chosen attributes.

**Opening Bridge**  
Flow tends to appear when purpose feels shared and the next step is visible. In your reflections, you said, “When we’re building something together, I lose track of time.” Imagination often supports this sense of direction—not by telling you what to do, but by helping you notice what aligns.

[[visual:attr1]]  
**Empathic** may surface when collaboration feels alive and structured. You’ve mentioned that clear roles help you stay tuned to others without losing focus. In those moments, clarity of goals helps empathy become effortless connection.

[[visual:attr2]]  
**Energetic** emerges when challenge is well‑matched to skill. You described enjoying work that “moves fast but stays focused,” which mirrors the natural tension that keeps flow vibrant. The pace fuels engagement without tipping into chaos.

[[visual:attr3]]  
**Strategic** takes form when feedback loops are quick and meaningful. You said that “feedback I can use right away” keeps you in rhythm. This responsiveness allows your attention to adjust dynamically, keeping flow steady and purposeful.

[[visual:attr4]]  
**Methodical** shows up when your focus deepens into quiet persistence. You shared that “blocking off time for deep work and reducing distractions” helps sustain concentration. Once that environment is set, time tends to dissolve.

**Disruption & Renewal**  
When communication drifts or goals lose clarity, focus wavers. Yet, your reflections suggest imagination subtly restores orientation—helping you reconnect with what matters and re‑enter that sense of alignment naturally.

**Closing Integration**  
Across these attributes, a pattern emerges: empathy builds connection, energy sustains motion, strategy sharpens direction, and method steadies progress. Together, they form your living rhythm of flow—less a formula than a felt continuity between attention, creativity, and balance.

---

## 9) Validation Checklist

Before returning Section 2, confirm all of the following:

- `<RML>` block is present at the top with four flow attributes (no fallbacks).  
- Each attribute paragraph has a matching `[[visual:attrX]]` tag on its own line.  
- At least one participant quote is included.  
- Flow conditions are contextual, not structured as a list or headings.  
- Language is speculative, grounded, interpretive—not predictive.  
- Imagination acts as integrator (not personified).  
- No references to “data,” “dataset,” “profile,” or mechanical phrasing.  
- No HTML or rendering code beyond RML.  

---

## 10) Edge Cases & Fallbacks

- **Minimal reflections:** Emphasize the attributes; quote or paraphrase what exists.  
- **Overlapping attributes:** Distinguish by *how they feel or operate* (e.g., Empathic relates to attunement, Energetic to pace).  
- **Attributes mismatched with reflections:** Acknowledge uncertainty gently (“This attribute may surface most clearly when…”).  
- **Flow disruptions dominate reflections:** Briefly acknowledge, then highlight re‑entry and renewal via imagination.  

---

## 11) Example Attribute Sentence Stems

These are flexible reference stems—not templates.

- **Empathic** — “Flow arises when clarity allows you to tune into others without losing momentum.”  
- **Energetic** — “Momentum builds as effort meets challenge, creating an ease that carries you forward.”  
- **Strategic** — “Quick feedback keeps you nimble, translating insight into focused action.”  
- **Methodical** — “Steady concentration transforms effort into rhythm once distractions fade.”  
- **Analytical** — “Flow feels strongest when patterns connect and meaning crystallizes.”  
- **Calm** — “Stillness and structure give space for attention to deepen naturally.”  

(Use only if matching participant-selected attributes.)

---

## 12) Change Log (v15)

- Restored full interpretive depth and structure from v11.  
- Integrated tone, imagination, and non‑fallback rules from v14.  
- Updated RML compliance to **rml_visual_tag_instructions_v1_7.md**.  
- Removed all fallback attributes and universal defaults.  
- Harmonized tone and phrasing with **Master Prompt v23.3**.  
- Preserved detailed examples, edge cases, and compliance checklist for writer alignment.

---

*(End of section2_flow_experiences_instruction_active_v15.md)*
