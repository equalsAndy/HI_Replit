// Centralized training/runtime configuration for assistants and IA exercises

export type TrainingId =
  | 'ia-4-2' | 'ia-4-3' | 'ia-4-4' | 'ia-4-5'
  | 'talia-v1' | 'talia-v2'
  | 'ultra-talia'
  | 'reflection-talia';

export type TrainingConfig = {
  id: TrainingId;
  name: string;
  kind: 'exercise' | 'assistant';
  use_retrieval: boolean;
  model_default: string;            // e.g., "gpt-4.1-mini", "o4-mini"
  api_key_env: string;              // e.g., "OPENAI_KEY_IA", "OPENAI_KEY_TALIA_V1"
  vector_store_id?: string;         // only if use_retrieval
};

export const TRAININGS: TrainingConfig[] = [
  // IA Exercises (no-RAG)
  {
    id: 'ia-4-2',
    name: 'IA 4-2: Reframe with AI',
    kind: 'exercise',
    use_retrieval: false,
    model_default: 'gpt-4.1-mini',
    api_key_env: 'OPENAI_KEY_IA',
  },
  {
    id: 'ia-4-3',
    name: 'IA 4-3: Stretch Potential',
    kind: 'exercise',
    use_retrieval: false,
    model_default: 'gpt-4.1-mini',
    api_key_env: 'OPENAI_KEY_IA',
  },
  {
    id: 'ia-4-4',
    name: 'IA 4-4: Higher Purpose → World Challenges',
    kind: 'exercise',
    use_retrieval: false,
    model_default: 'gpt-4.1-mini',
    api_key_env: 'OPENAI_KEY_IA',
  },
  {
    id: 'ia-4-5',
    name: 'IA 4-5: Inviting the Muse',
    kind: 'exercise',
    use_retrieval: false,
    model_default: 'gpt-4.1-mini',
    api_key_env: 'OPENAI_KEY_IA',
  },

  // Talia v1 (RAG)
  {
    id: 'talia-v1',
    name: 'Talia v1',
    kind: 'assistant',
    use_retrieval: true,
    model_default: 'gpt-4.1',
    api_key_env: 'OPENAI_KEY_TALIA_V1',
    vector_store_id: 'VS_TALIA_V1', // placeholder; consider sourcing from env
  },

  // Talia v2 (RAG stricter)
  {
    id: 'talia-v2',
    name: 'Talia v2',
    kind: 'assistant',
    use_retrieval: true,
    model_default: 'o4-mini',
    api_key_env: 'OPENAI_KEY_TALIA_V2',
    vector_store_id: 'VS_TALIA_V2',
  },

  // Ultra & Reflection (stubs)
  {
    id: 'ultra-talia',
    name: 'Ultra Talia',
    kind: 'assistant',
    use_retrieval: true,
    model_default: 'o4-mini',
    api_key_env: 'OPENAI_KEY_ULTRA',
    vector_store_id: 'VS_ULTRA',
  },
  {
    id: 'reflection-talia',
    name: 'Reflection Talia',
    kind: 'assistant',
    use_retrieval: false,
    model_default: 'gpt-4.1-mini',
    api_key_env: 'OPENAI_KEY_REFLECTION',
  },
];

export function getTraining(id: TrainingId): TrainingConfig | undefined {
  return TRAININGS.find(t => t.id === id);
}

export function getApiKeyForTraining(cfg: TrainingConfig): string | undefined {
  try {
    return (process.env as Record<string, string | undefined>)[cfg.api_key_env];
  } catch {
    return undefined;
  }
}

