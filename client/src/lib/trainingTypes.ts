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

