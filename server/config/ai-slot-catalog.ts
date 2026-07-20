/**
 * AI Slot Catalog — single source of truth for the admin "Model Routing" tab
 * ==========================================================================
 * Every AI surface in HI_Replit, described declaratively: which workshop/exercise
 * it serves, how its model is chosen ("control type"), the gateway slot or env
 * feature key it reads, its provider/model fallback, and where its prompt/training
 * documents live.
 *
 * This is documentation-as-data. The routing inventory endpoint
 * (`server/routes/ai-routing-routes.ts`) enriches each entry with the *live*
 * resolved model so the admin console can show current state and, later, confirm
 * that a model change made in the selfActual gateway console took effect.
 *
 * Keep this in sync with the actual call sites (referenced per entry in
 * `sourceFile`). There is intentionally no runtime coupling — a stale catalog is
 * a documentation bug, not a functional one.
 */

/** How the model for a surface is chosen. */
export type ControlType =
  | 'gateway'    // resolved from the selfActual model-control plane via resolveModel(slot)
  | 'env'        // chosen from AI_PROVIDER_{FEATURE} / AI_PROVIDER env vars — needs redeploy
  | 'hardwired'; // model lives outside HI (e.g. OpenAI Assistant + vector store); not settable here

export type Workshop = 'AST' | 'IA' | 'shared';
export type SlotKind = 'text' | 'image' | 'vision';

export interface AISlotCatalogEntry {
  /** Stable id for the catalog row (not necessarily the gateway slot). */
  id: string;
  /** Human label shown in the console. */
  label: string;
  workshop: Workshop;
  /** Exercise / step id or short descriptor (e.g. "IA 4-3", "Module 4 reports"). */
  exercise: string;
  controlType: ControlType;
  kind: SlotKind;
  /** Gateway model-control slot, when controlType === 'gateway'. */
  slot?: string;
  /** getProviderName() feature key, when the provider comes from env. */
  envFeatureKey?: string;
  /** Provider used when nothing overrides it (the fallback the code passes). */
  fallbackProvider: 'claude' | 'openai';
  /** Backend model id used as the fallback, when the code pins one. */
  fallbackModel?: string;
  /** Where the prompt / training documents for this surface live. */
  trainingDocs: {
    /** Short human location, e.g. "DB exercise_training_docs → file fallback". */
    location: string;
    /** Concrete pointer(s): file path(s), DB table, or asset id. */
    pointer?: string;
  };
  /** Call site this row describes, as file:line for click-through. */
  sourceFile: string;
  /** Anything the operator should know (hardwiring, Assistants, caveats). */
  notes?: string;
}

// ─── The catalog ─────────────────────────────────────────────────────────────

/**
 * IA Module-4 exercise chat slots. Each training resolves `hi.<training_id>` from
 * the gateway; env fallback is getProviderName('ia') + the training's model.
 * Source: server/routes/ai.ts:63-73 (/api/ai/chat/plain).
 */
const IA_EXERCISE_SLOTS: AISlotCatalogEntry[] = [
  { id: 'ia-4-2', label: 'IA 4-2: Reframe with AI', exercise: 'IA 4-2' },
  { id: 'ia-4-3', label: 'IA 4-3: Stretch Potential', exercise: 'IA 4-3' },
  { id: 'ia-4-4', label: 'IA 4-4: Higher Purpose → World Challenges', exercise: 'IA 4-4' },
  { id: 'ia-4-5', label: 'IA 4-5: Inviting the Muse', exercise: 'IA 4-5' },
  { id: 'ia-4-7-synopsis', label: 'IA 4-7: Module 4 Reflection Synopsis', exercise: 'IA 4-7' },
].map((t) => ({
  ...t,
  workshop: 'IA' as Workshop,
  controlType: 'gateway' as ControlType,
  kind: 'text' as SlotKind,
  slot: `hi.${t.id}`,
  envFeatureKey: 'ia',
  fallbackProvider: 'claude' as const,
  trainingDocs: {
    location: 'DB exercise_training_docs → file fallback',
    pointer:
      t.id === 'ia-4-7-synopsis'
        ? 'no training doc (system prompt is client-side)'
        : `server/training-docs/${t.id}-*.md`,
  },
  sourceFile: 'server/routes/ai.ts:67',
  notes:
    'Provider/model resolved from gateway slot; falls back to AI_PROVIDER_IA (currently Claude Haiku) on miss.',
}));

export const AI_SLOT_CATALOG: AISlotCatalogEntry[] = [
  ...IA_EXERCISE_SLOTS,

  // ── Gateway-controlled: image ─────────────────────────────────────────────
  {
    id: 'ia-image',
    label: 'IA image generation (stretch / capability-stretch)',
    workshop: 'IA',
    exercise: 'IA 4-3',
    controlType: 'gateway',
    kind: 'image',
    slot: 'hi.ia-image',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-image-1',
    trainingDocs: {
      location: 'Inline DALL·E prompt builder (route)',
      pointer: 'server/routes/image-gen.ts (prompt built by hi.ia-collab step 1)',
    },
    sourceFile: 'server/routes/image-gen.ts:155',
    notes:
      'kind:image — gateway invariant guarantees an image model. Prompt text is first built by the IA exercise slot (Claude), then this slot generates the image (OpenAI). Image spend is unpriced in gateway telemetry.',
  },
  {
    id: 'ia-image-describe',
    label: 'IA image description (vision)',
    workshop: 'IA',
    exercise: 'IA 4-3',
    controlType: 'gateway',
    kind: 'vision',
    slot: 'hi.ia-image-describe',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    trainingDocs: {
      location: 'Inline instruction (route)',
      pointer: 'server/routes/image-gen.ts:362',
    },
    sourceFile: 'server/routes/image-gen.ts:347',
  },

  // ── Env-controlled (needs redeploy; no gateway slot) ──────────────────────
  {
    id: 'ia-conversation',
    label: 'IA workshop guide chat',
    workshop: 'IA',
    exercise: 'IA conversation (per step)',
    controlType: 'env',
    kind: 'text',
    envFeatureKey: 'ia',
    fallbackProvider: 'claude',
    trainingDocs: {
      location: 'DB ai_exercise_instructions (global + per-step)',
      pointer: 'ai_exercise_instructions table',
    },
    sourceFile: 'server/routes/ia-chat-routes.ts:46',
    notes:
      'Not gateway-slotted. OpenAI branch uses the Assistants API (asst_ujxKbOaEw5HCiFygwxGR6XP4 / asst_T2PHoj8DJ6sWHlfoWyba2Wq0); Claude branch is stateless in-memory.',
  },
  {
    id: 'ia-module-reflection',
    label: 'IA Module-4 reflection summarize / tailor',
    workshop: 'IA',
    exercise: 'IA 3-7',
    controlType: 'env',
    kind: 'text',
    envFeatureKey: 'ia',
    fallbackProvider: 'claude',
    trainingDocs: {
      location: 'File training docs',
      pointer: 'server/training-docs/ia-3-7-summarize.md, ia-3-7-tailor.md',
    },
    sourceFile: 'server/routes/module-reflection-routes.ts:186',
    notes: 'Not gateway-slotted — uses getProvider(\'ia\') directly.',
  },
  {
    id: 'ast-reports',
    label: 'AST holistic sectional report',
    workshop: 'AST',
    exercise: 'AST Module 4 (holistic report)',
    controlType: 'hardwired',
    kind: 'text',
    envFeatureKey: 'reports',
    fallbackProvider: 'openai',
    trainingDocs: {
      location: 'Static AST report content (12 files)',
      pointer: 'server/ast-report-content/ (master ast_master_prompt_v24.3.md + sections 1-5)',
    },
    sourceFile: 'server/services/ast-sectional-report-service.ts:824',
    notes:
      'Intentionally NOT gateway-controlled (controlled:false). Provider is env-selected via AI_PROVIDER_REPORTS; the OpenAI path runs the Assistants API (asst_rIvBIJ3iCAlHizeuUK77gIiN) with attached training docs, so the effective model lives inside OpenAI.',
  },
  {
    id: 'coaching',
    label: 'Coaching / Talia chat',
    workshop: 'shared',
    exercise: 'AST reflections + Talia coach',
    controlType: 'env',
    kind: 'text',
    envFeatureKey: 'coaching',
    fallbackProvider: 'claude',
    trainingDocs: {
      location: 'Inline buildCoachingSystemPrompt + RAG doc-type records',
      pointer: 'coaching_guide / methodology / ast_training_material doc types',
    },
    sourceFile: 'server/services/openai-api-service.ts:1067',
    notes:
      'Not gateway-slotted. The star_report persona is forced to OpenAI; other personas follow AI_PROVIDER_COACHING.',
  },
];

/** Slots that resolve through the gateway model-control plane. */
export function gatewaySlots(): AISlotCatalogEntry[] {
  return AI_SLOT_CATALOG.filter((e) => e.controlType === 'gateway');
}
