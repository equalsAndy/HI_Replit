/**
 * AI Provider Abstraction Layer
 * ==============================
 * Provider-agnostic interface for AI completions.
 * Supports OpenAI and Claude with config-driven provider selection.
 *
 * Usage:
 *   import { getProvider, getProviderName } from './ai-provider.js';
 *   const provider = getProvider('reports');  // feature-specific
 *   const response = await provider.complete({ systemPrompt, messages });
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AICompletionParams {
  /** System prompt — sent as system parameter for Claude, system role message for OpenAI */
  systemPrompt: string;
  /** Conversation messages (user/assistant turns). System messages are filtered for Claude. */
  messages: AIMessage[];
  /** Maximum tokens in the response */
  maxTokens?: number;
  /** Sampling temperature (0-1) */
  temperature?: number;
  /** Enable prompt caching for the system prompt (Claude only — ignored by OpenAI) */
  cacheSystemPrompt?: boolean;
  /** Override the default model for this call */
  model?: string;
  /** API key override (for per-training key resolution) */
  apiKey?: string;
}

export interface AIResponse {
  /** The generated text content */
  content: string;
  /** Token usage metrics */
  usage: {
    inputTokens: number;
    outputTokens: number;
    /** Tokens read from cache (Claude only) */
    cacheReadTokens?: number;
    /** Tokens written to cache (Claude only) */
    cacheWriteTokens?: number;
  };
  /** Model used for this completion */
  model: string;
  /** Which provider handled this request */
  provider: 'openai' | 'claude';
  /** End-to-end latency in milliseconds */
  latencyMs: number;
}

export interface AIProvider {
  complete(params: AICompletionParams): Promise<AIResponse>;
  readonly name: 'openai' | 'claude';
}

// ─── Provider Registry ───────────────────────────────────────────────────────

type ProviderName = 'openai' | 'claude';

let claudeProviderInstance: AIProvider | null = null;
let openaiProviderInstance: AIProvider | null = null;

async function getClaudeProvider(): Promise<AIProvider> {
  if (!claudeProviderInstance) {
    const { ClaudeProvider } = await import('./claude-provider.js');
    claudeProviderInstance = new ClaudeProvider();
  }
  return claudeProviderInstance;
}

async function getOpenAIProvider(): Promise<AIProvider> {
  if (!openaiProviderInstance) {
    const { OpenAIProvider } = await import('./openai-provider.js');
    openaiProviderInstance = new OpenAIProvider();
  }
  return openaiProviderInstance;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Determine which provider to use for a given feature.
 *
 * Resolution order:
 *   1. AI_PROVIDER_{FEATURE} env var (e.g., AI_PROVIDER_REPORTS=claude)
 *   2. AI_PROVIDER env var (global default)
 *   3. 'openai' (hardcoded fallback — nothing breaks)
 */
export function getProviderName(feature?: string): ProviderName {
  if (feature) {
    const featureKey = `AI_PROVIDER_${feature.toUpperCase()}`;
    const featureValue = process.env[featureKey]?.toLowerCase().trim();
    if (featureValue === 'claude' || featureValue === 'openai') {
      return featureValue;
    }
  }

  const globalValue = process.env.AI_PROVIDER?.toLowerCase().trim();
  if (globalValue === 'claude' || globalValue === 'openai') {
    return globalValue;
  }

  return 'openai';
}

/**
 * Get a provider instance for the given feature.
 * Lazy-loads and caches provider singletons.
 */
export async function getProvider(feature?: string): Promise<AIProvider> {
  const name = getProviderName(feature);
  return name === 'claude' ? getClaudeProvider() : getOpenAIProvider();
}

/**
 * Get both providers (for comparison testing).
 */
export async function getBothProviders(): Promise<{ openai: AIProvider; claude: AIProvider }> {
  const [openai, claude] = await Promise.all([
    getOpenAIProvider(),
    getClaudeProvider(),
  ]);
  return { openai, claude };
}
