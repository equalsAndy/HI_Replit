# #21 — KAN-147: Complete code splitting implementation (reverted due to module conflicts)

**State:** OPEN
**Labels:** enhancement, performance
**Created:** 2026-03-24

---

## Summary

Migrated from Jira KAN-147. Route-based code splitting was implemented and achieved a 72% bundle reduction (582KB -> 165KB gzipped), but had to be reverted due to circular dependency and module resolution conflicts. The analysis tools and learnings are in place — this issue tracks completing the work.

**Original Date:** 2025-08-16
**Status:** Reverted — needs re-implementation with proper dependency management

## What Was Achieved (then reverted)

- rollup-plugin-visualizer integrated into vite.config.ts
- React.lazy() code splitting achieved 72% reduction (582KB -> 165KB gzipped)
- Separate chunks created for AST, IA, Dashboard, AI Training

## Why It Was Reverted

- **Circular dependency**: `ContentViews.tsx` had lazy import for `ImaginalAgilityContent`, while workshop pages had direct imports — bundler couldn't resolve
- **Infinite loading states**: All lazy-loaded components stuck spinning
- **Suspense reference errors**: Incomplete rollback left orphaned Suspense usage

## Key Lessons

1. Components must use either lazy OR static imports, never both
2. Must audit all component dependencies before implementing lazy loading
3. Implement code splitting one workshop at a time to isolate issues
4. Need workshop-specific error boundaries for better debugging

## Recommended Approach

### Phase 1: Foundation
- [ ] Dependency audit — map all component import relationships
- [ ] Import standardization — establish consistent patterns
- [ ] Add workshop-specific error boundaries

### Phase 2: Incremental Implementation
- [ ] Start with AI Training (smallest bundle) as proof of concept
- [ ] Verify no circular dependencies
- [ ] Add workshops one at a time

### Phase 3: Monitoring
- [ ] Automated bundle monitoring in CI/CD
- [ ] Performance budgets with alerts

## Reference Files

- `JiraTickets/KAN-147-implementation-report.md` — full implementation report
- `docs/KAN-147-BUNDLE-ANALYSIS-RESULTS.md` — analysis results
- `docs/KAN-147-future-code-splitting-plan.md` — detailed phased plan
- `docs/KAN-147-COMPLETION-SUMMARY.md`
