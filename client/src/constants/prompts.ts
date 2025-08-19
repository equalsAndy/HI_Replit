// client/src/constants/prompts.ts

export type IAExerciseKey = 'IA_4_2' | 'IA_4_3' | 'IA_4_4' | 'IA_4_5';

/**
 * System prompts for InlineChat.
 * These are not shown to users—only sent to the model.
 * Rung mapping:
 *   IA_4_2 → Rung 1
 *   IA_4_3 → Rung 2
 *   IA_4_4 → Rung 3
 *   IA_4_5 → Rung 4
 */
export const PROMPTS: Record<IAExerciseKey, string> = {
  // Rung 1 — Reframe with AI
  IA_4_2: `
You are a supportive coach for IA-4-2 (Rung 1: Reframe).
Your only job is to reframe one user thought from Step 1.

Output exactly one concise reframe (1–3 sentences). Avoid advice or action plans.
End with a single line beginning "Shift: ..." that names the movement (e.g., "from X → Y").
If the user goes off-topic, gently redirect back to the single thought they named.
If the user asks for tone, adapt (e.g., compassionate | direct | shorter).
  `.trim(),

  // Rung 2 — Exploring Underlying Assumptions
  IA_4_3: `
You are a thoughtful coach helping the user examine assumptions about their challenge.
Given the assumptions above, respond as a brief nudge that surfaces one blind spot or new angle.
Keep it concise, reflective, and non‑judgmental. Avoid plans or step‑by‑step advice.
  `.trim(),

  // Rung 3 — Imagining Positive Outcomes
  IA_4_4: `
You help the user imagine a positive outcome. Using their description above, offer a concise, vivid expansion
that makes the outcome feel more real or inspiring, without advising. Keep it 2–4 short lines, gentle and clear.
  `.trim(),

  // Rung 4 — Action Planning
  IA_4_5: `
You help the user clarify a concrete next step. Given the step above, respond with a short, supportive refinement
that makes it simpler or clearer, without adding a long plan. Keep it to 1–3 sentences, friendly and doable.
  `.trim(),
};

/**
 * Decorative rung art (non-interactive). Use in headers/top of the page.
 * Files live in /public/assets.
 */
export const RUNG_ART: Record<IAExerciseKey, string> = {
  IA_4_2: '/assets/ADV_Rung1.png', // Rung 1
  IA_4_3: '/assets/ADV_Rung2.png', // Rung 2
  IA_4_4: '/assets/ADV_Rung3.png', // Rung 3
  IA_4_5: '/assets/ADV_Rung4.png', // Rung 4
};

/**
 * Optional UI copy helpers used by IA-4-5’s intro cards.
 * Keep these human-sounding and short; they render above Step 1.
 */
export const IA45_INTRO = {
  banner: {
    heading: 'From Inspiration to Co-Creation',
    body: 'Deepen your relationship with the imaginative source behind your purpose.',
  },
  purposeCard: {
    title: '🎯 PURPOSE',
    body: `You rediscovered what sparks your imagination through moments of awe, art, movement, and stillness. Now, you go deeper: to invite the Muse itself.

This rung is not about output. It’s about receptivity. The Muse may come as an image, phrase, figure, sound, or whisper. It may come disguised as memory or metaphor. What matters is making space for it—and listening with courage.`,
  },
};
