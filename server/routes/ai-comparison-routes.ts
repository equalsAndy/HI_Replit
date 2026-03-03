/**
 * AI Provider Comparison Route
 * =============================
 * Sends the same prompt to both OpenAI and Claude in parallel,
 * returning side-by-side results with token usage, latency, and cost.
 * Protected behind admin auth.
 */

import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getBothProviders, type AICompletionParams } from '../services/ai-provider.js';
import { aiUsageLogger } from '../services/ai-usage-logger.js';

const router = express.Router();

router.post('/compare', requireAuth, express.json(), async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens, temperature, cacheSystemPrompt } = req.body as {
      systemPrompt?: string;
      userMessage: string;
      maxTokens?: number;
      temperature?: number;
      cacheSystemPrompt?: boolean;
    };

    if (!userMessage) {
      return res.status(400).json({ success: false, error: 'userMessage is required' });
    }

    const params: AICompletionParams = {
      systemPrompt: systemPrompt || 'You are a helpful assistant.',
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: maxTokens || 1024,
      temperature: temperature ?? 0.7,
      cacheSystemPrompt: cacheSystemPrompt ?? false,
    };

    const { openai, claude } = await getBothProviders();

    // Run both providers in parallel
    const [openaiResult, claudeResult] = await Promise.allSettled([
      openai.complete(params),
      claude.complete(params),
    ]);

    const formatResult = (settled: PromiseSettledResult<any>, providerName: string) => {
      if (settled.status === 'rejected') {
        return {
          provider: providerName,
          error: settled.reason?.message || 'Unknown error',
          content: null,
          usage: null,
          latencyMs: 0,
          cost: 0,
        };
      }

      const r = settled.value;
      const cost = providerName === 'claude'
        ? aiUsageLogger.calculateClaudeCostWithCache(
            r.usage.inputTokens, r.usage.outputTokens, r.model,
            r.usage.cacheReadTokens || 0, r.usage.cacheWriteTokens || 0
          )
        : aiUsageLogger.calculateOpenAICost(r.usage.inputTokens + r.usage.outputTokens, r.model);

      return {
        provider: providerName,
        model: r.model,
        content: r.content,
        usage: r.usage,
        latencyMs: r.latencyMs,
        cost,
        contentLength: r.content.length,
      };
    };

    return res.json({
      success: true,
      openai: formatResult(openaiResult, 'openai'),
      claude: formatResult(claudeResult, 'claude'),
      params: {
        systemPromptLength: params.systemPrompt.length,
        userMessageLength: userMessage.length,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
        cacheSystemPrompt: params.cacheSystemPrompt,
      },
    });
  } catch (e: any) {
    console.error('AI comparison error:', e);
    return res.status(500).json({ success: false, error: e.message || 'Comparison failed' });
  }
});

export default router;
