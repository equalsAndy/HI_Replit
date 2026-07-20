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

import { resolveSlot, isGatewayConfigured } from './solid-pod/gateway-client.js';

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
    // Flag-gated transport swap: route Claude calls through AWS Bedrock when
    // AI_USE_BEDROCK=true (uses dedicated BEDROCK_* IAM creds). Defaults to the
    // direct Anthropic API so nothing changes unless the flag is set.
    if (process.env.AI_USE_BEDROCK?.toLowerCase().trim() === 'true') {
      const { BedrockProvider } = await import('./bedrock-provider.js');
      claudeProviderInstance = new BedrockProvider();
      console.log('[ai-provider] Claude routed via AWS Bedrock (AI_USE_BEDROCK=true)');
    } else {
      const { ClaudeProvider } = await import('./claude-provider.js');
      claudeProviderInstance = new ClaudeProvider();
    }
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

// Dedicated instances for a transport the control plane names explicitly. When
// the gateway says `provider: bedrock` (or `anthropic`), honor that regardless
// of the AI_USE_BEDROCK env flag — the flag only governs the env-fallback path.
let bedrockProviderInstance: AIProvider | null = null;
let claudeDirectProviderInstance: AIProvider | null = null;

async function getBedrockProvider(): Promise<AIProvider> {
  if (!bedrockProviderInstance) {
    const { BedrockProvider } = await import('./bedrock-provider.js');
    bedrockProviderInstance = new BedrockProvider();
  }
  return bedrockProviderInstance;
}

async function getClaudeDirectProvider(): Promise<AIProvider> {
  if (!claudeDirectProviderInstance) {
    const { ClaudeProvider } = await import('./claude-provider.js');
    claudeDirectProviderInstance = new ClaudeProvider();
  }
  return claudeDirectProviderInstance;
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

// ─── Model Control Plane Resolution ──────────────────────────────────────────

/**
 * Result of resolving a model-control slot. `provider`/`model` are the dispatch
 * spec (which client, which backend model id); `source` records where the answer
 * came from for diagnostics/telemetry.
 */
/**
 * The client a slot dispatches to. `openai`/`anthropic` map 1:1 to their SDKs;
 * `bedrock` uses the AWS Bedrock runtime with the gateway-supplied `us.anthropic.*`
 * backendModel. Undefined `transport` (env-fallback path) means "use the env-driven
 * Claude client" (which honors AI_USE_BEDROCK).
 */
export type Transport = 'anthropic' | 'bedrock' | 'openai';

export interface ResolvedModel {
  /** Message family + branch selector: 'openai' or 'claude' (bedrock is Claude-family). */
  provider: ProviderName;
  /** Backend model id to send to the provider SDK; may be undefined → provider default */
  model?: string;
  source: 'gateway' | 'cache' | 'env';
  /** Explicit client the gateway named; undefined on env fallback → env-driven. */
  transport?: Transport;
}

interface SlotCacheEntry {
  provider: ProviderName;
  model?: string;
  transport?: Transport;
  expiresAt: number;
}

const SLOT_CACHE_TTL_MS = 60_000;
const slotCache = new Map<string, SlotCacheEntry>();
const slotWarnedAt = new Map<string, number>();

/**
 * Map a gateway provider name to HI's internal provider name.
 * The gateway registry uses vendor names (`anthropic`, `openai`, `bedrock`,
 * `together`); HI's provider layer only wires `claude` and `openai`. Unmapped
 * providers return null so the caller falls back to its env default.
 */
function mapGatewayProvider(
  provider: string | undefined,
): { provider: ProviderName; transport: Transport } | null {
  switch (provider?.toLowerCase().trim()) {
    case 'anthropic':
      return { provider: 'claude', transport: 'anthropic' };
    case 'bedrock':
      // Claude-family messages, dispatched via the AWS Bedrock runtime using the
      // gateway's us.anthropic.* backendModel verbatim (no local translation table).
      return { provider: 'claude', transport: 'bedrock' };
    case 'openai':
      return { provider: 'openai', transport: 'openai' };
    // 'together' / unknown: no client wired yet — caller falls back
    default:
      return null;
  }
}

/**
 * Get the provider instance for a resolved slot, honoring the transport the
 * gateway named. Falls back to the env-driven Claude client when no transport
 * was set (i.e. the resolution came from the env fallback, not the gateway).
 */
export async function getProviderForResolved(resolved: ResolvedModel): Promise<AIProvider> {
  if (resolved.provider === 'openai') return getOpenAIProvider();
  switch (resolved.transport) {
    case 'bedrock':
      return getBedrockProvider();
    case 'anthropic':
      return getClaudeDirectProvider();
    default:
      return getClaudeProvider(); // env fallback → AI_USE_BEDROCK decides
  }
}

/** Throttled (once/60s per slot) warning when a slot degrades to the env default. */
function warnDegraded(slot: string, now: number): void {
  const last = slotWarnedAt.get(slot) ?? 0;
  if (now - last > SLOT_CACHE_TTL_MS) {
    slotWarnedAt.set(slot, now);
    console.warn(
      `[ai-provider] model-control slot "${slot}" resolved via env fallback ` +
      `(gateway unreachable, unassigned, or unsupported provider)`
    );
  }
}

/**
 * Resolve which provider + model to use for a control-plane slot.
 *
 * Resolution order (never throws — an exercise must not fail on a control-plane
 * hiccup):
 *   1. fresh in-process cache (< 60s)
 *   2. gateway resolve (cached on success)
 *   3. last-known-good cache (stale)
 *   4. env fallback (with a throttled warn)
 *
 * Wraps — does not replace — the env logic in `getProviderName`. Callers pass
 * their current env-derived selection as `envFallback`.
 */
export async function resolveModel(
  slot: string,
  envFallback: { provider: ProviderName; model?: string }
): Promise<ResolvedModel> {
  const now = Date.now();
  const cached = slotCache.get(slot);

  if (cached && cached.expiresAt > now) {
    return { provider: cached.provider, model: cached.model, transport: cached.transport, source: 'cache' };
  }

  if (isGatewayConfigured()) {
    try {
      const res = await resolveSlot(slot);
      const model = res.ok ? res.data?.model : null;
      if (model && model.backendModel) {
        const mapped = mapGatewayProvider(model.provider);
        if (mapped) {
          slotCache.set(slot, {
            provider: mapped.provider,
            model: model.backendModel,
            transport: mapped.transport,
            expiresAt: now + SLOT_CACHE_TTL_MS,
          });
          return { provider: mapped.provider, model: model.backendModel, transport: mapped.transport, source: 'gateway' };
        }
      }
      // model:null or unsupported provider — fall through to stale cache / env
    } catch {
      // network / parse error — fall through to stale cache / env
    }
  }

  if (cached) {
    return { provider: cached.provider, model: cached.model, transport: cached.transport, source: 'cache' };
  }

  warnDegraded(slot, now);
  return { provider: envFallback.provider, model: envFallback.model, source: 'env' };
}
