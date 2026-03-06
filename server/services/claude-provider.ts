/**
 * Claude AI Provider
 * ==================
 * Implements the AIProvider interface using the Anthropic SDK.
 * Supports prompt caching for system prompts (ephemeral cache_control).
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, AICompletionParams, AIResponse } from './ai-provider.js';

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  readonly name = 'claude' as const;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      console.warn('[ClaudeProvider] CLAUDE_API_KEY not set — provider will fail on use');
    }
    this.client = new Anthropic({ apiKey: apiKey || '' });
  }

  async complete(params: AICompletionParams): Promise<AIResponse> {
    const startTime = Date.now();
    const model = params.model || process.env.CLAUDE_MODEL || DEFAULT_MODEL;

    // Build system parameter — with or without cache_control
    const system = params.cacheSystemPrompt && params.systemPrompt
      ? [{
          type: 'text' as const,
          text: params.systemPrompt,
          cache_control: { type: 'ephemeral' as const },
        }]
      : params.systemPrompt || undefined;

    // Filter out system messages (they go in the system param for Claude)
    // and ensure alternating user/assistant turns
    const messages = params.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Ensure we have at least one message
    if (messages.length === 0) {
      throw new Error('[ClaudeProvider] No user/assistant messages provided');
    }

    // Use a per-call client if apiKey override provided
    const client = params.apiKey
      ? new Anthropic({ apiKey: params.apiKey })
      : this.client;

    const response = await client.messages.create({
      model,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature ?? 0.7,
      system,
      messages,
    });

    const latencyMs = Date.now() - startTime;

    // Extract text content from response
    const content = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Extract usage including cache metrics
    const usage = response.usage as {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };

    return {
      content,
      usage: {
        inputTokens: usage.input_tokens || 0,
        outputTokens: usage.output_tokens || 0,
        cacheReadTokens: usage.cache_read_input_tokens || 0,
        cacheWriteTokens: usage.cache_creation_input_tokens || 0,
      },
      model: response.model,
      provider: 'claude',
      latencyMs,
    };
  }
}
