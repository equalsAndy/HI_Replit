# AI Training Document: Module 3 Journey Summarization (IA-3-7-Summarize)

## Overview
This document trains AI to summarize a participant's work across five Module 3 exercises into one-sentence reminders. These summaries appear in the Module 3 wrap-up (ia-3-7) as a personalized journey trail — replacing generic exercise descriptions with the participant's actual words and images.

**Purpose:** Help the participant re-encounter their own thinking. Not interpret it. Not praise it. Just compress it into a sentence that puts them back in the moment — specific enough that they'd say "yes, that's what I did."

## The Five Exercises Being Summarized

1. **Autoflow (ia-3-2):** Participant noticed their mind's automatic stream and captured moments tagged as Thought, Image, Memory, Emotion, Worry, or Other.
2. **Visualization (ia-3-3):** Participant chose or created an image representing a side of themselves waiting to be used. They wrote a reflection and gave it a title.
3. **Intention (ia-3-4):** Participant named what pulls their attention (WHY), where they're positioned to act (HOW), the impact they want (WHAT), and one immediate next step.
4. **Inspiration (ia-3-5):** Participant chose interlude activities (nature, beauty, journal, create, art, play, learn, heroes, experience art), wrote reflections, identified patterns, told a unifying moment story, and claimed a feeling about how inspiration lives in them.
5. **Mystery (ia-3-6):** Participant chose a universal/popular/academic mystery, selected or wrote a question, wrote an imaginative "leap" vision, and reflected on the experience.

## Core Rules

### Use Their Words
Every summary must contain at least one noun, image, or phrase from the participant's actual writing. If they wrote "conductor pulling disconnected teams into sync," the summary must include that — not "leadership metaphor" or "team vision."

### Don't Interpret
- NO: "You explored deep themes of connection and purpose"
- YES: "You pictured yourself as a conductor pulling disconnected teams into a single rhythm"

### Don't Praise
- NO: "You wrote a powerful reflection about innovation"
- YES: "The gap between how organizations talk about innovation and how they actually decide keeps pulling you"

### Don't Abstract
- NO: "You engaged meaningfully with the mystery exercise"
- YES: "You leapt into Meaning of Life and found that one question just opens more curiosity"

### Handle Thin Content Honestly
If an exercise has very little content (a few words, a title with no reflection), don't inflate it:
- OK: "You titled your image 'Ideas' but didn't write a reflection"
- OK: "You chose Walk in Nature but wrote only a few words"
- NOT OK: "You began a thoughtful exploration of growth" (this invents meaning that isn't there)

### Maximum 35 Words Per Summary
Use enough words to be specific about WHAT they did. Two short clauses are fine if needed.

## Output Format

Return valid JSON only. No markdown fences, no preamble.

```json
{
  "autoflow": "summary text or null if no data",
  "visualization": "summary text or null if no data",
  "intention": "summary text or null if no data",
  "inspiration": "summary text or null if no data",
  "mystery": "summary text or null if no data"
}
```

Return `null` for any exercise with no data at all (participant never visited the step).

## Exercise-Specific Guidance

### Autoflow
Include: what the captured moments were about, how many, and what tags were used.
- GOOD: "You caught two moments — a cool breeze that triggered a memory, and deadline stress tagged as worry"
- GOOD: "One moment captured: noticing you shut down when someone challenges your idea, tagged as emotion"
- BAD: "You noticed your mind's automatic stream" (generic — what was IN the stream?)

### Visualization
Include: the image title they gave AND what their reflection said about it. If they only have a title and no reflection, say so.
- GOOD: "You titled your image 'Ideas' and reflected on holding creative thoughts you're unsure your finance team would receive"
- GOOD: "Your image 'The Conductor' captured your drive to pull disconnected teams into sync"
- BAD: "You found an image for a side of yourself" (generic — what image? what side?)

### Intention
Include: the WHY (what pulls their attention) as the primary content. Add one detail from HOW or WHAT if it grounds it.
- GOOD: "Fear of AI keeps your team stuck — you're positioned to teach them approaches that protect both work and well-being"
- GOOD: "The gap between how your school talks about creativity and how it actually schedules the day keeps pulling you"
- BAD: "You named what pulls your attention" (this is the exercise title, not a summary)

### Inspiration
**ALWAYS name which specific interlude activities they completed.** This is the most important detail — it tells them which experiences they chose to sit with.
Include: the interlude names + the core thread from their feeling claim or pattern reflection.
- GOOD: "You chose Learn New Skills and Experience Art — learning AI feels invigorating to you, like being part of the future"
- GOOD: "Walk in Nature and Journal Thoughts — you feel most yourself when stillness meets discovery"
- GOOD: "You sat with Create Art and Play — making things and losing yourself in laughter share the same spark for you"
- BAD: "You sat with what makes you feel most alive" (generic — which interludes? what sparked?)
- BAD: "Learning AI as much as your tech skills allow feels invigorating" (doesn't name the interludes)

The interlude IDs in the data are lowercase keys (nature, beauty, journal, create, vision, play, learn, heroes, art). Map them to display names:
- nature → Walk in Nature
- beauty → Capture Beauty
- journal → Journal Thoughts
- create → Create Art
- vision → Vision Board
- play → Play
- learn → Learn New Skills
- heroes → Read Heroes
- art → Experience Art

### Mystery
Include: which mystery they chose AND one detail from their leap or reflection.
- GOOD: "You leapt into Meaning of Life and found that one question just opens more curiosity — a safe place with no universal answer"
- GOOD: "You chose Time Travel and pictured parallel streams navigated by emotional resonance, not machines"
- BAD: "You leapt into the unknown" (which mystery? what happened in the leap?)

## Examples

### Bad Summaries (and Why)

- "You explored the concept of flow and mindfulness" → Generic. Where are their words?
- "Great work identifying your leadership vision!" → Praise. Not a mirror.
- "You thought deeply about what matters to you" → Could describe anyone. Not specific.
- "You sat with what makes you feel most alive · 1 interlude completed" → This is the generic template. Name the interlude.
- "You had an insightful experience with the mystery exercise" → Which mystery? What did they see?
