# KAN-OpenAI Service Architecture Enhancement
**Issue Type:** Story
**Project:** KAN
**Priority:** High
**Reporter:** Claude Code
**Date Created:** 2025-08-02

## Summary
Enhance OpenAI service architecture with project-based organization, model selection, and cross-project awareness for admin operations.

## Description
Build a sophisticated OpenAI service architecture that supports multiple projects, dynamic model selection, cost tracking, and cross-project resource awareness for admin training and analysis.

## Acceptance Criteria
1. ✅ Project-aware OpenAI client management
2. ✅ Dynamic model selection (GPT-4o-mini, GPT-4, GPT-4-turbo)
3. ✅ Cross-project resource awareness for admin tasks
4. ✅ Enhanced cost tracking per project and model
5. ✅ A/B testing infrastructure for model comparison
6. ✅ Environment-specific configuration management
7. ✅ Fallback mechanisms for reliability

## Technical Implementation

### Enhanced OpenAI Service Architecture
```typescript
class OpenAIProjectManager {
  // Project-specific client management
  private getClientForProject(projectType: 'report' | 'admin' | 'content' | 'dev')
  
  // Dynamic model selection with cost tracking
  async generateWithModelSelection(prompt: string, options: ModelSelectionOptions)
  
  // Cross-project awareness for admin tasks
  async getProjectResourcesSummary(): Promise<ProjectSummary[]>
  
  // A/B testing infrastructure
  async runABTest(prompt: string, modelA: string, modelB: string): Promise<ABTestResult>
}
```

### Model Selection Strategy
- **Default Models**: GPT-4o-mini for cost efficiency
- **Admin Override**: GPT-4 for complex reasoning and training
- **Report Generation**: GPT-4o-mini with quality monitoring
- **Experimentation**: All models available for testing

### Cost Tracking Enhancement
- Per-project usage monitoring
- Per-model cost attribution
- Real-time spending alerts
- Monthly budget management

## Tasks
- [ ] Create OpenAIProjectManager class
- [ ] Implement project-specific client management
- [ ] Add dynamic model selection logic
- [ ] Enhance cost tracking in ai-usage-logger
- [ ] Build cross-project resource awareness
- [ ] Implement A/B testing infrastructure
- [ ] Add environment-specific configuration
- [ ] Create fallback mechanisms
- [ ] Update existing OpenAI service calls
- [ ] Write comprehensive tests

## Definition of Done
- [ ] OpenAIProjectManager fully functional
- [ ] Model selection working across all use cases
- [ ] Cost tracking accurate per project/model
- [ ] Cross-project awareness operational
- [ ] A/B testing capabilities implemented
- [ ] All existing functionality maintained
- [ ] Performance benchmarks meet requirements
- [ ] Code review completed

## Technical Notes
- Use existing OPENAI_API_KEY as fallback
- Implement project-specific keys via environment variables
- Maintain backward compatibility during transition
- Add comprehensive logging for debugging
- Include rate limiting and error handling

---

## File Changes Required
- `server/services/openai-api-service.ts` (major enhancement)
- `server/services/ai-usage-logger.ts` (cost tracking updates)
- `server/utils/aiDevConfig.ts` (project configuration)
- Environment configuration files (.env.*)