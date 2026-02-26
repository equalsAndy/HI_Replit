# IA Module 4 — Exercise Design Patterns & Guide

## Purpose
This document captures what we've established through the ia-4-2 redesign and provides a starting point for exploring ia-4-3, ia-4-4, and ia-4-5. It is NOT a prescriptive blueprint for the remaining exercises — each one teaches something different and may need different solutions. It IS a set of questions to ask, principles to hold, and patterns to draw from.

---

## The Overarching Principle

**AI collaborates WITH participants using their capabilities. It does not think for them or do the imaginative work.**

Every design decision should pass this test: Is the participant doing the imaginative, creative, courageous, curious, caring work — with AI as a thinking partner? Or is the AI doing it and asking the participant to approve?

Examples of the line:
- ✅ AI offers ONE reframe → participant decides if it lands, iterates, makes it their own
- ✅ AI asks a capability-specific question → participant has to think about the answer
- ❌ AI generates five options → participant picks the best one (AI did the creative work)
- ❌ AI identifies which capability was stretched → participant just agrees (AI did the reflection)
- ✅ Participant selects capabilities and writes "I imagine..." → they're doing the synthesis
- ❌ AI writes the "I imagine..." for them → participant just edits

This principle should inform how we integrate capabilities, what the AI generates vs. what the participant creates, and how much the modal does FOR them vs. WITH them.

---

## 1. Architecture Overview

### How IA Module 4 AI Exercises Work
All four exercises (ia-4-2 through ia-4-5) share the same pipeline:

1. **Client modal** (e.g., `ReframeModal.tsx`) → sends messages via `InlineChat` component with `trainingId` and `systemPrompt`
2. **InlineChat** → sends to `/api/ai/chat/plain` with `training_id` and messages array
3. **Server (`ai.ts`)** → calls `getTrainingDoc(training_id)`, prepends training doc to system prompt
4. **OpenAI Chat Completions API** → uses `OPENAI_KEY_IA` key, `gpt-4.1-mini` model

**Key isolation:** Entirely separate from AST (Assistants API) and Talia coaching (different keys, models, routes).

### File Locations
| Purpose | Path |
|---------|------|
| Training docs (server-side) | `server/training-docs/ia-4-{N}-*.md` |
| Training doc loader | `server/config/training-doc-loader.ts` |
| AI route | `server/routes/ai.ts` |
| System prompts (client-side) | `client/src/constants/prompts.ts` |
| Modal components | `client/src/components/ia/{ExerciseName}Modal.tsx` |
| Content area components | `client/src/components/ia/{ExerciseName}Exercise.tsx` |
| Capability selector | `client/src/components/ia/CapabilitySelector.tsx` |
| State persistence | `useContinuity` hook → saves to `state.ia_4_{N}` |
| Claude Code prompts | `Claude Code Prompts/CC_Prompt_IA4*` |

---

## 2. The Four Exercises — What Each One Teaches

These are rungs on the Module 4 "Adventure Ladder." Each teaches a different skill.

### ia-4-2: Guided Reframe (Rung 1)
**What it teaches:** Reframing is a learnable tool — you can take a real challenge and find an angle that reveals leverage, clarity, or a better question.
**Core AI interaction:** Collaborative reframing of a work/school challenge
**Phases:** Reframe → Capability Test → Shift → Tag → Done
**Where capabilities naturally live:** Not inherently embedded — the reframing process works regardless of which capability you're using. Capabilities need a separate activation step.

### ia-4-3: Visualization Stretch (Rung 2)
**What it teaches:** You can take a vision you already hold and push it further — bigger scope, longer timeline, deeper impact.
**Core AI interaction:** Expanding a visualization frame from Module 3
**Current phases:** Stretch → Expansion → Resistance → Done
**Where capabilities naturally live:** Imagination and courage are named in the training doc. The exercise asks participants to go beyond their comfort zone, which is inherently courageous. But does the participant FEEL those capabilities activate, or is the AI doing the stretching for them?

### ia-4-4: Global Purpose Bridge (Rung 3)
**What it teaches:** Your personal purpose has global relevance — there's a genuine bridge between what drives you and what the world needs.
**Core AI interaction:** Finding connections between personal purpose and a global challenge, then naming and stretching that bridge
**Current phases:** Perspectives (3 angles) → Bridge → Naming → World Game Stretch → Done
**Where capabilities naturally live:** Caring, imagination, and creativity are deeply woven into the exercise structure itself. The three perspectives exercise creativity; the World Game stretch exercises imagination; the personal→global connection exercises caring.

### ia-4-5: Action Planning (Rung 4)
**What it teaches:** Inspiration becomes real when you commit to one specific, doable action that honors what sparked it.
**Core AI interaction:** Refining an interlude inspiration into a concrete, time-bounded action step
**Current phases:** Refinement → Commitment → Timeframe → Done
**Where capabilities naturally live:** Courage is embedded in committing. Creativity is in finding the right form. Caring is in staying connected to what matters. But these are implicit — does the participant recognize them?

---

## 3. Established Patterns from ia-4-2

These are DECISIONS, not proposals. They're done.

### Prompt Quality: Reframe, Don't Reword
**The test:** If the person could respond "I already knew that" — it's a rewording. If they could respond "Huh, I hadn't thought of it that way" — it's a reframe.

**The pattern:** Take what feels like a setback and reveal what it GIVES them — information, leverage, depth, clarity, proof — that they couldn't have gotten any other way.

### Echo Their Specifics
If they mention "sales team," "deal size," "three years" — those nouns must appear in the output. Floating above with abstract language fails. The AI must anchor to their reality.

**Banned language:** "unique positioning," "find new value and meaning," "opens the chance," "navigate the complexity."

### Audience Coverage
Participants may be business professionals, PhD students, school leaders, or early career. Training docs and prompts must include examples from all contexts.

### Modal Flow (ia-4-2 specific)
```
1. REFRAME          → Collaborative AI conversation, user signals "This looks good"
2. CAPABILITY TEST  → Pick ONE capability, see AI apply it (one-shot call, not InlineChat)
3. SHIFT            → "I went from ___ to ___"
4. TAG              → "What did reframing give you?" (4 outcome-based options)
5. DONE             → Results appear on content area
```

### Tags Name What the Tool Delivers (ia-4-2)
| Tag | Helper Text |
|-----|-------------|
| A new angle | I can see something I couldn't see before |
| Clarity | The real problem just got sharper |
| Agency | I see where I have leverage now |
| A question worth following | I don't have the answer, but I have a better question |

### Content Area (ia-4-2)
1. **"What you just did" block** — brief explanation of what the exercise accomplished
2. **New Perspective** — editable reframe
3. **What Shifted** — shift statement
4. **What Reframing Gave You** — tag badge
5. **Capabilities in Action** (required) — pick 2+, write "If I brought [caps] to this challenge, I imagine..."

### Key Design Rationale
- **Capabilities in Action is required** — if optional, people skip where the learning lives
- **The order is deliberate** — asking "what capabilities would you use?" BEFORE acting is harder than labeling after. That reversal is the training.
- **Capabilities don't work in isolation** — the content area names this explicitly
- **One-shot API for capability test** — not InlineChat; fast, focused, non-conversational
- **No "Other" tag option** — custom text adds noise; four clear options

---

## 4. Questions to Ask for Each Remaining Exercise

When approaching ia-4-3, ia-4-4, or ia-4-5, work through these questions before deciding on solutions.

### A. AI Quality — What's the AI's default failure mode?

Each exercise will have its own version of "the AI tends to do X when it should do Y."

For ia-4-2, this was: reword when it should reframe.

**Questions to explore:**
- Run the exercise as-is. What does the AI actually produce?
- Does the output feel like the AI did the hard work, or did it give the participant something to work with?
- What's the "I already knew that" equivalent for this exercise? (For stretching: "that's just a fancier version." For bridging: "those are just my purpose and the challenge side by side." For action planning: "that's generic advice.")
- What would a GOOD output look like — one that makes the participant think or feel something new?
- Does the training doc have enough concrete examples of good vs. bad outputs?

### B. Capabilities — How do they show up?

**Questions to explore:**
- Are the capabilities already embedded in the exercise (like caring in the Global Purpose Bridge), or are they disconnected (like they were in the original ia-4-2)?
- Does the participant currently FEEL a capability activate, or could they go through the whole exercise without noticing?
- If capabilities are already the engine: is a separate capability test step redundant? Would it interrupt the flow?
- If capabilities are disconnected: what would it look like for the participant to experience one? What would the AI generate that makes them think "oh, THAT'S what curiosity does here"?
- Is there a moment in the exercise where the participant is doing the imaginative/courageous/creative work, or is the AI doing it for them? How can we shift that balance?

### C. Tags — What does THIS tool deliver?

**Questions to explore:**
- After completing this exercise, what has the participant gained? Name it in terms of outcomes, not emotions.
- What would four options look like that teach the participant this exercise is a learnable SKILL?
- Do any of the ia-4-2 tags (new angle, clarity, agency, a question worth following) apply here, or does this exercise produce fundamentally different outcomes?
- Would the participant learn something about the tool by choosing between these options?

### D. Content Area — What story does it tell?

**Questions to explore:**
- What should the "What you just did" block say for this exercise? (3-4 sentences, plain language, names the skill)
- What's the core output that should be editable?
- What's the synthesis/shift that should be displayed?
- Does this exercise need the full "Capabilities in Action" section (multi-select + "I imagine..."), or is there a more natural way to weave capability reflection into what already exists?
- Is the participant creating something on the content area, or just reviewing what the AI produced? (We want the former.)

### E. The Collaboration Test

For any proposed change, ask:
- **Who is doing the thinking?** If the AI generates it and the participant approves it → too much AI. If the participant creates it with AI as a prompt/partner → right balance.
- **Who is doing the imagining?** The participant should be the one who imagines, envisions, stretches. The AI should provoke, question, offer a starting point — not deliver the finished product.
- **Does the participant leave with something THEY made?** The reframe, the stretch, the bridge, the commitment — it should feel like theirs, not like something the AI handed them.

---

## 5. Shared Technical Patterns

### Start Over — Seed Prompt Re-injection
When the user clicks "Start Over" in any modal, repopulate the input box with the seed prompt via `chatRef.current?.setInput(...)` after state reset.

### Phase Transitions
Each modal manages its own phase state. When adding phases, update: phase type union, `onNext()`, `onBack()`, and all reset locations.

### InlineChat vs One-Shot Calls
- **InlineChat** for conversational phases where the user iterates
- **One-shot calls** for non-conversational moments (e.g., capability test)
- Hide InlineChat during non-conversational phases

### CapabilitySelector Modes
- `single` — pick 1
- `dual` — pick 2 (drops oldest on 3rd click)
- `multi` — pick 2+, no upper limit (added for ia-4-2)

---

## 6. Status

### ia-4-2 (Reframe) — Redesigned, pending execution
- ✅ Training doc with reframe-not-reword, audience coverage, concrete examples
- ✅ System prompt updates
- ✅ Tag redesign (4 outcome-based tags)
- ✅ Content area: "What you just did" + Capabilities in Action (required)
- ✅ CapabilitySelector multi mode
- ✅ Start Over bug fix
- 🔲 Capability test step in modal (`CC_Prompt_IA42_Modal_Capability_Test.txt`)
- 🔲 Claude Code execution and testing

### ia-4-3 (Stretch) — Needs exploration
- Has training doc (`ia-4-3-stretch.md`) and system prompt
- Start by running the exercise and evaluating AI output quality
- Work through the questions in section 4

### ia-4-4 (Global Purpose Bridge) — Needs exploration
- Has training doc (`ia-4-4-global-purpose-bridge.md`) and system prompt
- This exercise is structurally the most complex (4 phases, 3 perspectives)
- Capabilities may already be deeply enough embedded — explore before adding

### ia-4-5 (Action Planning) — Needs exploration
- Has training doc (`ia-4-5-action-planning.md`) and system prompt
- This is the culmination exercise — tone and capability integration may differ
- Work through the questions in section 4

---

## 7. Starting a New Conversation

When beginning work on any remaining exercise, reference this document and include:

```
Context: I'm working on IA Module 4 exercise ia-4-{N} ({exercise name}).
Reference: The project file "IA Module 4 — Exercise Design Patterns & Guide."

This exercise teaches: [what the tool/skill is]
Current state: [what exists — training doc, modal, content area]

Let's work through the questions in section 4 of the guide:
- What's the AI's default failure mode for this exercise?
- Where do capabilities naturally live — and where are they missing?
- What does this exercise's tool deliver (for tags)?
- What story should the content area tell?
- Are we keeping the right collaboration balance?
```

---

## 8. Design Decisions Log

| Decision | Rationale | Scope | Date |
|----------|-----------|-------|------|
| AI collaborates, doesn't do the imaginative work | Overarching principle — participant should be the one imagining, creating, stretching | All | 2025-02-26 |
| Reframe ≠ reword | AI produced polished restatements, not perspective shifts | ia-4-2 | 2025-02-26 |
| Each exercise has its own AI quality concern | "Don't reword" is specific to reframing; other exercises have different failure modes | All | 2025-02-26 |
| Capability integration varies by exercise | Some exercises already ARE the capabilities in action; others need a separate step | All | 2025-02-26 |
| Education/academic examples in prompts | Users include PhD students and school directors | All | 2025-02-26 |
| Tags name what the tool delivers | Old tags described emotions; new tags teach the exercise is a learnable skill | ia-4-2 (others TBD) | 2025-02-26 |
| Capabilities in Action is required (ia-4-2) | If optional, people skip where the learning lives | ia-4-2 | 2025-02-26 |
| Exercise order reversal is deliberate | Pre-commitment to capabilities before acting is harder than labeling after | ia-4-2 | 2025-02-26 |
| No "Other" tag option | Custom text adds noise; clear options teach better | ia-4-2 (others TBD) | 2025-02-26 |
