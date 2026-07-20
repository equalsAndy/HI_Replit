/**
 * Bedrock Claude Provider
 * =======================
 * Implements the AIProvider interface using Anthropic models on AWS Bedrock via
 * the AWS SDK (@aws-sdk/client-bedrock-runtime — the same client the platform
 * gateway uses). API-compatible output with ClaudeProvider (same AIResponse +
 * prompt-cache usage). Selected per-slot by the gateway control plane: a slot
 * that resolves to `provider: bedrock` dispatches here via getProviderForResolved().
 *
 * Credentials: reads BEDROCK_ACCESS_KEY_ID / BEDROCK_SECRET_ACCESS_KEY (a
 * dedicated bedrock:InvokeModel-only IAM user) so it never touches the
 * container's main AWS_ACCESS_KEY_ID used by S3/SES. Falls back to the default
 * AWS credential chain when those are absent.
 *
 * Model IDs: Bedrock requires the `us.` cross-region inference-profile ID for
 * on-demand invocation, not the bare Anthropic model name. mapModelId() handles
 * the translation.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { AIProvider, AICompletionParams, AIResponse } from './ai-provider.js';

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_BEDROCK_VERSION = 'bedrock-2023-05-31';

/** Map an Anthropic model name to its Bedrock `us.` inference-profile ID. */
export function mapModelId(model: string): string {
  // Already an inference-profile ID — pass through.
  if (model.startsWith('us.') || model.startsWith('global.')) return model;
  const map: Record<string, string> = {
    'claude-haiku-4-5-20251001': 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
  };
  // Best-effort fallback for models not explicitly mapped.
  return map[model] ?? `us.anthropic.${model}`;
}

interface BedrockAnthropicResponse {
  content: Array<{ type: string; text?: string }>;
  model?: string;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export class BedrockProvider implements AIProvider {
  private client: BedrockRuntimeClient;
  // Report as 'claude' so downstream (usage logger, AIResponse.provider) is unchanged.
  readonly name = 'claude' as const;

  constructor() {
    const region =
      process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-west-2';
    const accessKeyId = process.env.BEDROCK_ACCESS_KEY_ID;
    const secretAccessKey = process.env.BEDROCK_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      console.warn(
        '[BedrockProvider] BEDROCK_ACCESS_KEY_ID/SECRET not set — using default AWS credential chain',
      );
    }

    this.client = new BedrockRuntimeClient({
      region,
      // Explicit dedicated creds when present; otherwise the default chain.
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
  }

  async complete(params: AICompletionParams): Promise<AIResponse> {
    const startTime = Date.now();
    const requestedModel =
      params.model || process.env.CLAUDE_MODEL || DEFAULT_MODEL;
    const modelId = mapModelId(requestedModel);

    // System prompt — with or without ephemeral cache_control (supported on Bedrock).
    const system = params.cacheSystemPrompt && params.systemPrompt
      ? [{
          type: 'text' as const,
          text: params.systemPrompt,
          cache_control: { type: 'ephemeral' as const },
        }]
      : params.systemPrompt || undefined;

    const messages = params.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    if (messages.length === 0) {
      throw new Error('[BedrockProvider] No user/assistant messages provided');
    }

    const body = {
      anthropic_version: ANTHROPIC_BEDROCK_VERSION,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature ?? 0.7,
      ...(system ? { system } : {}),
      messages,
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    });

    const response = await this.client.send(command);
    const parsed = JSON.parse(
      new TextDecoder().decode(response.body),
    ) as BedrockAnthropicResponse;

    const latencyMs = Date.now() - startTime;

    const content = (parsed.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text ?? '')
      .join('');

    const usage = parsed.usage ?? {};

    return {
      content,
      usage: {
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        cacheReadTokens: usage.cache_read_input_tokens || 0,
        cacheWriteTokens: usage.cache_creation_input_tokens || 0,
      },
      model: parsed.model || requestedModel,
      provider: 'claude',
      latencyMs,
    };
  }
}
