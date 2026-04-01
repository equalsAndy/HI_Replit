# #13 — IA Module 5: AI-Generated Takeaway Report

**State:** OPEN
**Labels:** feature, ia-module-5, ai-integration, report-generation
**Created:** 2026-03-16

---

## Summary

Create an AI-generated takeaway report for Imaginal Agility, similar to the AST Individual Holistic Report. This would synthesize the participant's capability journey into a downloadable/viewable document.

## Context

- AST already has a sectional report system (6 sections via OpenAI) generating personalized holistic reports
- IA currently has no equivalent — the capability matrix (ia-5-1) is interactive but not exportable
- The matrix table (5 capabilities x 4 touchpoints) captures the noticing journey but only lives in-app

## What the Report Could Include

- **Capability matrix** — the 5x4 table (Pulse, Assessment, Solo, AI-partnered) rendered as a static visual
- **Quadrant view** — the 2x2 grid (Surprise / In your awareness / Still emerging / Recognized) can work well as a static report element even though it was removed from the interactive view
- **Combination patterns** — which capabilities paired together in which exercises
- **Noticing narrative** — AI-generated observations about each capability's journey (e.g., "Caring didn't appear in your solo work but emerged with an AI partner")
- **Prism comparison** — assessment shape vs. exercise-derived shape, framed as expanded noticing
- **Participant's own words** — "I imagine..." text from content areas, capability selections, shift statements
- **Facilitation prompts** — personalized reflection questions based on their specific patterns

## Design Principles

- Framed around noticing, not measurement — "what became visible" not "what improved"
- No pseudo-scientific language, no scores presented as metrics
- Capabilities are patterns of noticing, not fixed traits
- The report is a snapshot — situational and personal to this moment
- AI synthesizes but doesn't judge or rank

## Technical Considerations

- Could use Claude API (same as IA exercises, `AI_PROVIDER_IA=claude`)
- Would need to aggregate data from: pulse rankings, prism assessment, Module 3 exercise selections + ia-3-7 ratings, Module 4 exercise selections + ia-4-7 ratings, content area "I imagine..." text, tags from each exercise
- Output format: HTML for in-app viewing, PDF for download (same pattern as AST reports)
- Report generation triggered from Module 5 (ia-5-1 or a dedicated step)

## Relationship to AST Report

- AST report uses OpenAI sectional generation — IA could follow the same architecture but with Claude
- AST report focuses on strengths/flow/wellbeing — IA report focuses on capability noticing journey
- Both serve as personal takeaway documents post-workshop

## Priority

**Low** — idea stage. Dependent on:
- [ ] Capability matrix (ia-5-1) design finalized
- [ ] ia-3-7 and ia-4-7 wrap-up steps implemented
- [ ] Data aggregation patterns established
