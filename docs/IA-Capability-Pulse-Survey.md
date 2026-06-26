# IA Capability Pulse Survey

## What It Is

The Capability Pulse is a short forced-choice survey embedded in the IA workshop at **Step 2-2: Understanding Your Capabilities**. Its purpose is to capture a user's gut-instinct ranking of the five i4C capabilities *before* they complete the full Prism self-assessment. The gap between this first impression and the Prism results is intentionally revealed later in the course — that contrast is a core learning moment.

Results are saved silently. Users never see their ranking immediately after completing the Pulse; they're told only that their "first impression has been captured."

---

## The Five Capabilities

The Pulse asks users to compare these five capabilities:

| Capability | Tagline | Color |
|---|---|---|
| **Imagination** | Seeing what isn't there yet | Purple |
| **Curiosity** | The drive to explore | Green |
| **Caring** | The capacity to relate | Blue |
| **Creativity** | The power to generate | Amber |
| **Courage** | The strength to act | Red |

---

## The Survey Format

**10 forced-choice pairs** — a full round-robin so every capability is compared to every other exactly once.

Each pair presents two capability cards side by side (with icon graphic, name, and tagline). The user clicks the one they're "more drawn to." There is no right answer. Pairs are randomized in order and left/right position each time.

The instruction shown to users:
> *"You'll see two capabilities at a time. Just pick the one you're more drawn to. Don't overthink it — there's no right answer and you'll go through all ten pairs in about 30 seconds."*

---

## Mechanics

- **10 pairs** displayed one at a time inside a modal dialog
- Progress shown as a **dot indicator** (1 of 10, 2 of 10, etc.)
- Selecting a card triggers an exit animation and the next pair loads
- Closing mid-way shows a warning: progress resets and the user must start over
- Completing all 10 closes the modal automatically
- After completion: a brief confirmation screen ("First Impression Captured") appears inline on the page

---

## Data Saved

Each completed survey stores the following to the `workshop_step_data` table under `step_id = 'ia-2-1-pulse'`:

```json
{
  "choices": [
    { "pair": ["curiosity", "caring"], "winner": "caring", "loser": "curiosity" },
    ...
  ],
  "ranking": [
    { "key": "caring", "score": 3 },
    { "key": "imagination", "score": 2 },
    { "key": "creativity", "score": 2 },
    { "key": "courage", "score": 2 },
    { "key": "curiosity", "score": 1 }
  ],
  "inconsistencies": 4,
  "completedAt": "2026-03-19T21:15:14.822Z"
}
```

- **choices**: Every pair decision in order
- **ranking**: Each capability sorted by number of wins (0–4 possible)
- **inconsistencies**: Count of circular inconsistencies detected (A beats B, B beats C, but C beats A)
- **completedAt**: ISO timestamp

The ranking and inconsistency data are saved for later comparison against the Prism assessment results. This comparison has not yet been built into the course UI.

---

## How Users Access It

The Pulse is **embedded inline on the Step 2-2 page** — it is not a standalone page or a pop-up that appears automatically. Users reach it by working through the page in sequence:

1. **Navigate to IA Module 2, Step 2** ("Understanding Your Capabilities") via the workshop sidebar
2. **Read the capability definitions** — five accordion cards covering Imagination, Curiosity, Caring, Creativity, and Courage. The page requires all five to be opened before proceeding. A counter tracks progress ("3 / 5 explored")
3. **Pulse unlocks** inline below the accordion once all five are opened. A lock icon is shown until then
4. User clicks **"Start Pulse"** — this opens the modal dialog
5. User completes all 10 pairs in the modal
6. Modal closes automatically; the page shows "First Impression Captured" and unlocks **Sections 2 and 3** below (Capability Combinations explorer and Out of Balance signals)
7. User can then click Continue to advance to the next step

The Pulse is a **gate**: Sections 2 and 3 of the page, and the Continue button behavior, all depend on `pulseComplete`. However, the Continue button itself is always visible — it navigates to step `ia-2-3` regardless of pulse completion status.

---

## Current Usage (as of June 2026)

- **3 surveys completed** — all by internal test accounts (brad@allstarteams.co, topliff+tester4@gmail.com, topliff+prepmtest@gmail.com)
- **~30 real external users** have IA access but none have reached or completed the Pulse
- No real participant data has been collected yet

---

## Component Location

| File | Purpose |
|---|---|
| [client/src/components/ia/CapabilityPulse.tsx](../client/src/components/ia/CapabilityPulse.tsx) | The Pulse component (modal, cards, scoring logic) |
| [client/src/components/content/imaginal-agility/steps/IA_2_2_CapabilityDynamics.tsx](../client/src/components/content/imaginal-agility/steps/IA_2_2_CapabilityDynamics.tsx) | The step page that contains and gates the Pulse |
| [server/routes/ia-snapshot-routes.ts](../server/routes/ia-snapshot-routes.ts) | Reads pulse data for the IA snapshot/summary view |
