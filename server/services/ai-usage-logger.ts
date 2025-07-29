import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface AIUsageLogEntry {
  userId: number;
  featureName: 'coaching' | 'holistic_reports' | 'reflection_assistance';
  apiCallCount?: number;
  tokensUsed?: number;
  responseTimeMs?: number;
  success: boolean;
  errorMessage?: string;
  costEstimate?: number;
  sessionId?: string;
}

interface AIConfigCache {
  [featureName: string]: {
    enabled: boolean;
    rateLimitPerHour: number;
    rateLimitPerDay: number;
    maxTokens: number;
    timeoutMs: number;
    lastUpdated: Date;
  };
}

class AIUsageLogger {
  private configCache: AIConfigCache = {};
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  /**
   * Log AI usage to the database
   */
  async logUsage(entry: AIUsageLogEntry): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO ai_usage_logs 
         (user_id, feature_name, api_call_count, tokens_used, response_time_ms, success, error_message, cost_estimate, session_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          entry.userId,
          entry.featureName,
          entry.apiCallCount || 1,
          entry.tokensUsed || 0,
          entry.responseTimeMs || 0,
          entry.success,
          entry.errorMessage || null,
          entry.costEstimate || 0,
          entry.sessionId || null
        ]
      );

      console.log(`📊 AI usage logged: ${entry.featureName} for user ${entry.userId} - Success: ${entry.success}`);
    } catch (error) {
      // Don't throw errors for logging failures to avoid breaking the main flow
      console.error('❌ Failed to log AI usage:', error);
    }
  }

  /**
   * Get AI configuration for a feature with caching
   */
  async getConfig(featureName: string): Promise<any> {
    const now = new Date();
    const cached = this.configCache[featureName];

    // Check if we have fresh cached data
    if (cached && (now.getTime() - cached.lastUpdated.getTime()) < this.cacheExpiry) {
      return cached;
    }

    try {
      const result = await pool.query(
        'SELECT * FROM ai_configuration WHERE feature_name = $1',
        [featureName]
      );

      if (result.rows.length > 0) {
        const config = {
          enabled: result.rows[0].enabled,
          rateLimitPerHour: result.rows[0].rate_limit_per_hour,
          rateLimitPerDay: result.rows[0].rate_limit_per_day,
          maxTokens: result.rows[0].max_tokens,
          timeoutMs: result.rows[0].timeout_ms,
          lastUpdated: now
        };

        this.configCache[featureName] = config;
        return config;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get AI config:', error);
      return cached || null; // Return cached data if available, even if expired
    }
  }

  /**
   * Check if AI feature is enabled and within rate limits
   */
  async canUseAI(userId: number, featureName: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Check global AI toggle first
      const globalConfig = await this.getConfig('global');
      if (!globalConfig?.enabled) {
        return { allowed: false, reason: 'AI features are globally disabled' };
      }

      // Check feature-specific toggle
      const featureConfig = await this.getConfig(featureName);
      if (!featureConfig?.enabled) {
        return { allowed: false, reason: `${featureName} AI feature is disabled` };
      }

      // Check hourly rate limit
      const hourlyUsage = await pool.query(
        `SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '1 hour'`,
        [userId, featureName]
      );

      const hourlyCount = parseInt(hourlyUsage.rows[0].count) || 0;
      if (hourlyCount >= featureConfig.rateLimitPerHour) {
        return { allowed: false, reason: 'Hourly rate limit exceeded' };
      }

      // Check daily rate limit
      const dailyUsage = await pool.query(
        `SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '24 hours'`,
        [userId, featureName]
      );

      const dailyCount = parseInt(dailyUsage.rows[0].count) || 0;
      if (dailyCount >= featureConfig.rateLimitPerDay) {
        return { allowed: false, reason: 'Daily rate limit exceeded' };
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Failed to check AI usage limits:', error);
      // Err on the side of caution - deny if we can't check limits
      return { allowed: false, reason: 'Unable to verify rate limits' };
    }
  }

  /**
   * Calculate estimated cost based on tokens used
   * Claude API pricing as of 2024: ~$0.015 per 1K tokens for Sonnet
   */
  calculateCost(tokensUsed: number, model: string = 'claude-3-5-sonnet'): number {
    const ratesPerToken = {
      'claude-3-5-sonnet': 0.000015, // $0.015 per 1K tokens
      'claude-3-haiku': 0.000005,    // $0.005 per 1K tokens
      'claude-3-opus': 0.000075      // $0.075 per 1K tokens
    };

    const rate = ratesPerToken[model as keyof typeof ratesPerToken] || ratesPerToken['claude-3-5-sonnet'];
    return tokensUsed * rate;
  }

  /**
   * Clear the configuration cache (call when config is updated)
   */
  clearCache(): void {
    this.configCache = {};
    console.log('🔄 AI configuration cache cleared');
  }
}

// Export singleton instance
export const aiUsageLogger = new AIUsageLogger();