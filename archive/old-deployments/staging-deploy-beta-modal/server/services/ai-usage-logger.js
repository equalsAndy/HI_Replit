import { Pool } from 'pg';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
class AIUsageLogger {
    configCache = {};
    cacheExpiry = 5 * 60 * 1000;
    async logUsage(entry) {
        try {
            await pool.query(`INSERT INTO ai_usage_logs 
         (user_id, feature_name, api_call_count, tokens_used, response_time_ms, success, error_message, cost_estimate, session_id, provider, model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                entry.userId,
                entry.featureName,
                entry.apiCallCount || 1,
                entry.tokensUsed || 0,
                entry.responseTimeMs || 0,
                entry.success,
                entry.errorMessage || null,
                entry.costEstimate || 0,
                entry.sessionId || null,
                entry.provider || 'claude',
                entry.model || 'claude-3-5-sonnet'
            ]);
            const providerInfo = entry.provider ? ` (${entry.provider}${entry.model ? `/${entry.model}` : ''})` : '';
            console.log(`📊 AI usage logged: ${entry.featureName} for user ${entry.userId}${providerInfo} - Success: ${entry.success}`);
        }
        catch (error) {
            console.error('❌ Failed to log AI usage:', error);
        }
    }
    async getConfig(featureName) {
        const now = new Date();
        const cached = this.configCache[featureName];
        if (cached && (now.getTime() - cached.lastUpdated.getTime()) < this.cacheExpiry) {
            return cached;
        }
        try {
            const result = await pool.query('SELECT * FROM ai_configuration WHERE feature_name = $1', [featureName]);
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
        }
        catch (error) {
            console.error('❌ Failed to get AI config:', error);
            return cached || null;
        }
    }
    async canUseAI(userId, featureName) {
        try {
            const globalConfig = await this.getConfig('global');
            if (!globalConfig?.enabled) {
                return { allowed: false, reason: 'AI features are globally disabled' };
            }
            const featureConfig = await this.getConfig(featureName);
            if (!featureConfig?.enabled) {
                return { allowed: false, reason: `${featureName} AI feature is disabled` };
            }
            const hourlyUsage = await pool.query(`SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '1 hour'`, [userId, featureName]);
            const hourlyCount = parseInt(hourlyUsage.rows[0].count) || 0;
            if (hourlyCount >= featureConfig.rateLimitPerHour) {
                return { allowed: false, reason: 'Hourly rate limit exceeded' };
            }
            const dailyUsage = await pool.query(`SELECT COUNT(*) as count FROM ai_usage_logs 
         WHERE user_id = $1 AND feature_name = $2 AND timestamp >= NOW() - INTERVAL '24 hours'`, [userId, featureName]);
            const dailyCount = parseInt(dailyUsage.rows[0].count) || 0;
            if (dailyCount >= featureConfig.rateLimitPerDay) {
                return { allowed: false, reason: 'Daily rate limit exceeded' };
            }
            return { allowed: true };
        }
        catch (error) {
            console.error('❌ Failed to check AI usage limits:', error);
            return { allowed: false, reason: 'Unable to verify rate limits' };
        }
    }
    calculateCost(tokensUsed, model = 'claude-3-5-sonnet') {
        const ratesPerToken = {
            'claude-3-5-sonnet': 0.000015,
            'claude-3-haiku': 0.000005,
            'claude-3-opus': 0.000075
        };
        const rate = ratesPerToken[model] || ratesPerToken['claude-3-5-sonnet'];
        return tokensUsed * rate;
    }
    calculateOpenAICost(tokensUsed, model = 'gpt-4o-mini') {
        const ratesPerToken = {
            'gpt-4o-mini': 0.00000015,
            'gpt-4-turbo-preview': 0.00001,
            'gpt-4': 0.00003,
            'gpt-3.5-turbo': 0.0000005
        };
        const rate = ratesPerToken[model] || ratesPerToken['gpt-4o-mini'];
        return tokensUsed * rate;
    }
    clearCache() {
        this.configCache = {};
        console.log('🔄 AI configuration cache cleared');
    }
}
export const aiUsageLogger = new AIUsageLogger();
