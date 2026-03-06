# Section 1 – Strengths & Imagination Instruction (Active v10)

> This document governs how the assistant writes **Section 1** of the AST Personal Development Report.
> It aligns with master prompt **v23.6** and payload specification **v2.3**, ensuring accurate use of participant data
> and consistent tone across all generated reports.

---

## 1) Purpose & Scope

Section 1 interprets the participant’s **Star Strengths assessment** and their reflections on each strength, including Imagination.  
It establishes the narrative tone for the report, describing the participant’s strengths constellation as a *living rhythm* rather than a fixed label.

This section integrates quantitative data (percentages, strength shape) with qualitative insights from reflections to reveal the interplay among Thinking, Acting, Feeling, and Planning — and introduces **Imagination** as the apex strength that connects them all.

---

## 2) Inputs Used by the Writer

From the API payload, the writer receives:

- **Strengths distribution** (percentages for each of the four domains).  
- **Strength shape** (label, roles, margin, and comparison shapes).  
- **Strength reflections** (one per domain, plus Imagination, Team Values, and Unique Contribution).  
- **Participant name** (used only in introduction and closing).  
- **Policies** block (tone integrity, speculative language, imagination as integrator, etc.).  

> The reflection questions and metadata are contextual only — **do not include or paraphrase them** in the report.

---

## 3) Voice & Tone

- Write in **second person (“you”)** throughout.  
- Maintain a **reflective, interpretive, and integrative** tone — never prescriptive or diagnostic.  
- Use participant reflections where possible, integrating short **verbatim quotes** naturally into the narrative.  
- If any reflection text is **missing, gibberish, or filler**, treat it as missing and adapt gracefully (“Even when certain reflections were brief…”).  
- Avoid listing strengths mechanically; describe how they **interact** as a constellation.  
- Refer to **Imagination** as a *connecting faculty*, not as a separate personality or trait.

---

## 4) Required Visuals (RML)

```markdown
<RML>
<visual id="chart1" type="user_strength_chart" strengths='{"thinking":X,"acting":Y,"feeling":Z,"planning":W}'/>
<visual id="shapes1" type="shapes_intro_content"/>
<visual id="imagination1" type="imagination_circle"/>
</RML>
```

**Placement Rules:**  
1. Insert `[[visual:chart1]]` immediately after describing the strengths percentages.  
2. Insert `[[visual:shapes1]]` before introducing the participant’s **strength shape** narrative.  
3. Insert `[[visual:imagination1]]` when **Imagination** is first mentioned or explained.

---

## 5) Narrative Structure

1. **Opening – Context & Tone (3–4 sentences)**  
   - Introduce the purpose of the report as a mirror of living strengths.  
   - Name the participant once.  
   - Ground the percentages as background, not as the focus.

2. **Strength Shape Interpretation (3–5 sentences)**  
   - Describe how energy distributes across the four domains.  
   - Identify the shape (e.g., “Balanced,” “Two High + Two Low”).  
   - Explain the meaning of dominant and quieter strengths using interpretive, metaphorical language.  

3. **Interplay & Reflection Integration (4 short paragraphs)**  
   - Use the participant’s reflections for each strength to illustrate *how* they show up.  
   - Integrate short quotes in context — never as lists.  
   - Mention “flow” only if clearly connected in reflection content.

4. **Imagination Integration (1 paragraph)**  
   - Treat Imagination as the bridge among all strengths.  
   - Use interpretive phrasing (“Imagination may serve as the quiet space where…”) rather than causal (“Imagination makes you…”).  

5. **Closing (2–3 sentences)**  
   - Summarize the overall pattern, rhythm, or constellation.  
   - Invite awareness and curiosity, not instruction.

---

## 6) Language Examples (Illustrative Only)

> **Do not copy directly;** these are phrasing models.

- “Your strengths form a constellation that balances precision and empathy.”  
- “Acting and Planning appear to move together, shaping how you turn insight into momentum.”  
- “Thinking contributes perspective, while Feeling adds resonance — together grounding your clarity with care.”  
- “Imagination connects these domains, turning your natural rhythm into creative insight.”

---

## 7) Compliance Checklist

- [x] Write in second person.  
- [x] Include at least one direct participant quote.  
- [x] Include all three visuals with correct placement.  
- [x] Avoid listing questions or instructions verbatim.  
- [x] Treat missing or gibberish reflections as absent.  
- [x] Tone: interpretive, reflective, balanced.  
- [x] Imagination is integrative, not personified.  
- [x] Section length ~700 words (±10%).  

---

## 8) Change Log (v10)

- Added explicit rule for **ignoring gibberish** or placeholder reflections.  
- Updated RML placement to match v23.6 master prompt.  
- Integrated payload v2.3 structure (stateless input handling).  
- Removed redundant tone definitions (referenced from master prompt).  
- Clarified treatment of Imagination as connecting faculty.  
- Streamlined reflection handling and quote integration examples.  
