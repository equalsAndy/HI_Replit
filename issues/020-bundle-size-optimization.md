# #20 — Bundle Size Optimization: Lazy-load video player, html2canvas, and split AST chunk

**State:** OPEN
**Labels:** enhancement, performance
**Created:** 2026-03-24

---

## Summary

Total assets are at 1037KB gzipped (budget: 1000KB). Main bundle is well under budget at 8KB, but several chunks need optimization.

**Priority:** Low

## Current State

- Total assets: 1037KB gzipped (budget: 1000KB -- over)
- Main bundle: 8KB gzipped (budget: 500KB -- well under)
- Build passes but total assets warning fires

## Top 3 Targets

| Chunk | Gzipped | Fix |
|-------|---------|-----|
| `useWelcomeVideo` | 250KB | Lazy-load video player library only when video page visited |
| `VideoTranscriptAdmin` | 123KB | Already lazy-loaded but chunk is huge -- investigate what's inside (editor lib?) |
| `html2canvas` | 59KB | Lazy-import only when StarCard download button clicked |

## What's Already Done

- Workshop pages lazy-loaded via React.lazy() in App.tsx
- IA steps are per-component code-split (each 1-12KB)
- Vendor splitting for hls.js, ffmpeg, framer-motion, recharts/d3, radix-ui
- Bundle monitoring with `scripts/bundle-size-check.js`

## What's NOT Done

- AST workshop is one monolithic 102KB chunk (IA has per-step splitting)
- `useWelcomeVideo` bundles a massive video library into a hook
- `html2canvas` loaded eagerly despite only being used for one download feature

## Reference

- `docs/KAN-147-future-code-splitting-plan.md` -- detailed phased plan
- `docs/KAN-147-BUNDLE-ANALYSIS-RESULTS.md`
- `vite.config.ts` -- current manualChunks config
- Source: `issues/bundle-size-optimization.md`

## Acceptance Criteria

- [ ] `useWelcomeVideo` video player lazy-loaded -- only fetched when video page visited
- [ ] `VideoTranscriptAdmin` chunk investigated and reduced
- [ ] `html2canvas` lazy-imported on StarCard download click only
- [ ] AST workshop split into per-step chunks (like IA)
- [ ] Total assets under 1000KB gzipped budget
