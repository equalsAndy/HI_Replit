# Bundle Size Optimization

**Priority:** Low
**Labels:** performance, optimization
**Status:** Backlog

## Current State
- Total assets: 1037KB gzipped (budget: 1000KB)
- Main bundle: 8KB gzipped (budget: 500KB — well under)
- Build passes but total assets warning fires

## Top 3 Targets

| Chunk | Gzipped | Fix |
|-------|---------|-----|
| `useWelcomeVideo` | 250KB | Lazy-load video player library only when video page visited |
| `VideoTranscriptAdmin` | 123KB | Already lazy-loaded but chunk is huge — investigate what's inside (editor lib?) |
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
- `docs/KAN-147-future-code-splitting-plan.md` — detailed phased plan (over-engineered for current needs)
- `docs/KAN-147-BUNDLE-ANALYSIS-RESULTS.md`
- `vite.config.ts` — current manualChunks config
