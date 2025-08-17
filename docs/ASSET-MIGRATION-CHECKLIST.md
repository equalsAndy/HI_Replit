# Asset Migration Checklist

This document groups all image references to migrate from mixed public paths to module imports using the `@img` alias (`client/src/assets`). Migrate incrementally to avoid breakage.

## Aliases & Targets
- `@img` → `client/src/assets` (already added)
- Keep existing `/assets/...` (served from `client/public/assets`) working until each file is migrated.

## Migration Workflow (per file)
1. Identify images used and place them under `client/src/assets` (e.g., `graphics/rungs`, `graphics/attributes`, `backgrounds`, `logos`).
2. Replace string paths (`"/assets/…"`) with imports:
   - `import rung3 from '@img/graphics/rungs/Rung3.png'`
   - `<img src={rung3} alt="Rung 3" />`
3. Verify the UI. When a feature is fully migrated, remove duplicates from `client/public/assets`.

---

## Group A — Imaginal Agility (absolute `/assets/...`)
- [ ] `client/src/components/content/imaginal-agility/steps/IA_5_1_Content.tsx`
  - /assets/solo_rung1_split.png … solo_rung5_split.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_1_Content.tsx:58`
  - /assets/ADV_AllRungs.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_1_Content.tsx:41`
  - /assets/AllRungs.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_2_Content.tsx:118`
  - /assets/Rung1.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_3_Content.tsx:218,269,354`
  - /assets/artem-shuba-…jpg → `backgrounds/` or `graphics/misc/`
  - /assets/Rung2.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_4_Content.tsx:76`
  - /assets/Rung3.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_5_Content.tsx:356`
  - /assets/Rung4.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_3_6_Content.tsx:126,305–372`
  - /assets/Rung5.png → `graphics/rungs/`
  - /assets/Imagination_new.png, Curiosity_new.png, Caring_new.png, Creativity_new.png, Courage_new.png → `graphics/attributes/`
  - Fallback `*_sq.png` variants → `graphics/attributes/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_2_Content.tsx:89`
  - /assets/ADV_Rung1.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_3_Content.tsx:94`
  - /assets/ADV_Rung2.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_4_Content.tsx:107`
  - /assets/ADV_Rung3.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_5_Content.tsx:86`
  - /assets/ADV_Rung4.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_4_6_Content.tsx:88`
  - /assets/ADV_Rung5.png → `graphics/rungs/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_2_1_Content.tsx:40,48,56,64`
  - /assets/Curiosity_new.png, Caring_new.png, Creativity_new.png, Courage_new.png → `graphics/attributes/`
- [ ] `client/src/components/content/imaginal-agility/steps/IA_2_2_Content.tsx:110–114`
  - /assets/Imagination_new.png, Curiosity_new.png, Caring_new.png, Creativity_new.png, Courage_new.png → `graphics/attributes/`
- [ ] `client/src/components/content/imaginal-agility/ImaginalAgilityContent.tsx:167–171`
  - /assets/*_sq.png → `graphics/attributes/`

## Group B — AI Components (absolute `/assets/...`)
- [ ] `client/src/components/ai/FloatingAITrigger.tsx:545,611,661,696`
  - /assets/Talia_headshot.png → `graphics/misc/` or `logos/`

## Group C — Branding & Visualization (imports using `@/assets/...`)
- [ ] `client/src/components/visualization/WellbeingLadder.tsx:5`
  - wellbeing-ladder.png → `graphics/rungs/` or `backgrounds/`
- [ ] `client/src/components/branding/Logo.tsx:2–4`
  - all-star-teams-logo-250px.png, imaginal_agility_logo_nobkgrd.png, HI_Logo_horizontal.png → `logos/`
- [ ] `client/src/components/layout/NavBar.tsx:10`
  - HI_Logo_horizontal.png → `logos/`
- [ ] `client/src/components/content/YourStatementView.tsx:8`
  - wellbeing-ladder.png → `graphics/rungs/` or `backgrounds/`
- [ ] `client/src/components/starcard/StarCard.tsx:8–9`
  - all-star-teams-logo-250px.png, starcardcloudimage.png → `logos/` and `backgrounds/`
- [ ] `client/src/components/modals/*, client/src/components/beta-testing/*`
  - all-star-teams-logo-250px.png → `logos/`

## Group D — Pages (imports using `@/assets/...` or relative ../assets)
- [ ] `client/src/pages/home.tsx:6–8`
- [ ] `client/src/pages/auth-page.tsx:15–17`
- [ ] `client/src/pages/invite-registration.tsx:10–12`
- [ ] `client/src/pages/landing.tsx:6–8` (relative `../assets/...` → keep under `client/src/assets`)
- [ ] `client/src/pages/beta-tester.tsx:9–11`

## Group E — `@assets` alias (currently `attached_assets`)
- [ ] `client/src/components/content/FinalReflectionView.tsx:8–9`
- [ ] `client/src/components/content/allstarteams/GrowthPlanView.tsx:12`
- [ ] `client/src/components/content/allstarteams/GrowthPlanView-backup.tsx:11`

Notes:
- Migrate Group A (IA) first to stabilize visuals, then B (AI), then C/D (branding/pages), and finally E (flip or replace `@assets`).
- Keep filenames stable or normalize during migration; update imports accordingly.
