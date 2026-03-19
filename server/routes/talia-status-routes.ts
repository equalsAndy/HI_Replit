/**
 * AI Status Routes
 * ================
 * Lightweight status endpoint for the admin AI Overview tab.
 * Checks API key presence and provider config — does NOT make real API calls.
 */

import express from 'express';
import { getProviderName } from '../services/ai-provider.js';

const router = express.Router();

/**
 * GET /api/talia-status/all
 * Return AI provider configuration and key availability.
 * No real API calls — just env var checks.
 */
router.get('/all', async (_req, res) => {
  try {
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasClaudeKey = !!process.env.CLAUDE_API_KEY;
    const hasOpenAIKeyIA = !!process.env.OPENAI_KEY_IA;

    res.json({
      // Provider configuration
      aiProvider: {
        global: getProviderName(),
        ia: getProviderName('ia'),
        coaching: getProviderName('coaching'),
        reports: getProviderName('reports'),
      },
      // Key availability (NOT connectivity — just whether the key exists)
      keys: {
        claude: hasClaudeKey,
        openai: hasOpenAIKey,
        openaiIA: hasOpenAIKeyIA,
      },
      // What each provider powers
      providerUsage: {
        claude: 'IA exercises (Module 4 modals, AI conversations)',
        openai: 'AST sectional reports (Assistants API)',
        openaiIA: 'DALL-E image generation (ia-4-3 visualization)',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI status check failed:', error);
    res.json({
      aiProvider: { global: 'unknown', ia: 'unknown', coaching: 'unknown', reports: 'unknown' },
      keys: { claude: false, openai: false, openaiIA: false },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
