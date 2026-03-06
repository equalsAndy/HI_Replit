/**
 * OpenAI AI Provider
 * ==================
 * Implements the AIProvider interface using the OpenAI SDK.
 * Wraps the existing chat completions pattern without changing openai-api-service.ts.
 */

import OpenAI from 'openai';
import type { AIProvider, AICompletionParams, AIResponse } from './ai-provider.js';

const DEFAULT_MODEL = 'gpt-4.1-mini';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const;

  private getClient(apiKey?: string): OpenAI {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('[OpenAIProvider] No OpenAI API key available');
    }
    return new OpenAI({ apiKey: key });
  }

  async complete(params: AICompletionParams): Promise<AIResponse> {
    const startTime = Date.now();
    const model = params.model || DEFAULT_MODEL;
    const client = this.getClient(params.apiKey);

    // Build OpenAI messages array — system prompt goes as first system message
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    if (params.systemPrompt) {
      messages.push({ role: 'system', content: params.systemPrompt });
    }

    // Add conversation messages (system messages from params.messages also pass through)
    for (const msg of params.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: params.maxTokens || 1024,
      temperature: params.temperature ?? 0.7,
    });

    const latencyMs = Date.now() - startTime;
    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    return {
      content,
      usage: {
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        // OpenAI doesn't report cache metrics through this interface
        cacheReadTokens: 0,
        cacheWriteTokens: 0,
      },
      model: completion.model || model,
      provider: 'openai',
      latencyMs,
    };
  }
}
