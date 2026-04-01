# #12 — Observe: ia-3-4 and ia-4-2 both ask participants to surface a challenge

**State:** OPEN
**Labels:** ux, design-exploration, ia, module-3, module-4
**Created:** 2026-03-14

---

**Type:** Observation / Design Watch
**Priority:** Low
**Status:** Open — No action needed yet

## What Was Noticed

Going through the workshop sequentially, ia-3-4 (finding intention) asks something like "What problem, question, or cause keeps pulling your attention?" Then ia-4-2 (Guided Reframe) asks participants to bring a real challenge to work with.

The emotional labor feels similar — both steps ask participants to dig into something that matters to them. On first pass this felt like "why am I doing this again?"

## Why It Might Not Be a Problem

- ia-4-2 uses autoflow — participants bring whatever's alive for them naturally. No priming, no constraints. This is working as designed.
- The two prompts serve different purposes: 3-4 surfaces intention/purpose, 4-2 surfaces a challenge to reframe. Different inputs, even if the process of surfacing them feels similar.
- The "why" feeling may be a designer-proximity artifact — someone who built both steps feels the seam more than a fresh participant would.
- Pre-loading the 3-4 challenge into 4-2 would break autoflow and constrain the natural entry point. Don't do this.

## What Could Be Interesting Later

After participants complete Module 4 exercises, there's a potential mirror moment: "In Module 3 you named X. In this exercise you worked on Y." Whether those are the same or different is a meaningful signal worth surfacing — it tells participants something about what's pulling their attention over time.

This fits naturally in ia-4-7 (Module 4 wrap-up reflection) or a similar retrospective moment. The participant does the noticing, not the interface.

## Action

- **Now:** Nothing. Leave ia-4-2 autoflow as-is.
- **Watch for:** Participant feedback during testing. Does anyone else feel the "why am I doing this again?" friction?
- **Future consideration:** Cross-exercise pattern reflection in ia-4-7 — surface what participants brought to each exercise and let them notice their own patterns.

## Related

- ia-3-4 (Finding Intention)
- ia-4-2 (Guided Reframe)
- ia-4-7 (Module 4 wrap-up — scoped but not yet implemented)
- `buildCrossExerciseContext()` in `prompts.ts` — already aggregates prior exercise outputs
