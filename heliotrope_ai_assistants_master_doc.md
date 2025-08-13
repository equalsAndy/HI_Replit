# Heliotrope Imaginal – AI Assistants & Vector Stores Master Doc

_Last updated: Aug 12, 2025_

---

## 1) Narrative: What We’re Doing
Heliotrope Imaginal is an application with two workshops:
- **AllStarTeams** – team performance analysis & producing written reports.
- **Imaginal Agility** – guided thinking and creativity exercises.

We are building multiple **AI assistants**, each with distinct purposes, personalities, and corpora (vector stores). We’re enforcing **clear boundaries between Production and R&D** so experiments never disturb live users. This document is the **single source of truth** for assistant IDs, vector store IDs, naming mismatches, workflow, and open questions.

---

## 2) Current OpenAI Projects
- **AllStarTeams_Talia** – Production report writer and related assistants
- **Reflection Assistant Talia** – Reflection coaching
- **Imaginal Agility** – Contained chat helper
- **Ultra Talia Report Writer** – R&D for next-gen report writing

---

## 3) Assistants – IDs & Purpose

| Project | Assistant Name | Assistant ID | Purpose |
|---|---|---|---|
| **AllStarTeams_Talia** | Ultra Star Report Talia | `asst_DtWCcpzPg7Zu1Z4NnkYLUbSI` | R&D-style report writer inside prod project |
| AllStarTeams_Talia | Admin Assistant | `asst_FwLFnLmO3aq3WZ76VWizwKou` | Admin tasks (scope TBD) |
| AllStarTeams_Talia | Reflection Talia | `asst_pspnPtUj1RF5zC460VKkkjdV` | Name suggests reflection, **actual purpose TBD** |
| AllStarTeams_Talia | Star Report Talia | `asst_CZ9XUvnWRx3RlWFc7pLeH8U2` | **Primary production** report writer |
| **Ultra Talia Report Writer** | Talia | `asst_yj31NWC5tzsSl6h2EIwJCnJh` | Ultra report writing experiments |
| **Imaginal Agility** | IA_Chat | _(ID not yet logged)_ | Contained chat assistant for IA workshop |
| **Reflection Assistant Talia** | _(Assistant name TBD)_ | _(ID not yet logged)_ | Reflection coaching |

> **Note:** Assistant IDs attach to vector stores by **store ID**, not by display name.

---

## 4) Vector Stores – IDs & Purpose

| Project | Vector Store Name (Dashboard) | Vector Store ID | Actual Use / Notes |
|---|---|---|---|
| **Imaginal Agility** | V_IA_Core (small/curated) | `vs_689bf4237c90819181d279e856633746` | Contained chat corpus for IA workshop |
| **AllStarTeams_Talia (Prod)** | Reflection Talia – Interactive Coaching | `vs_688e55e74e68819190cca71d1fa54f52` | **Report writer corpus** for AllStarTeams_Talia; name mismatch, intentionally left as-is in prod |
| **Ultra Talia Report Writer** (clone) | — | `vs_688e2bf0d94c81918b50080064684bde` | Clone of the prod corpus for Ultra Star Report; delete-candidate once confirmed unused |
| **Reflection Assistant Talia** | _(Name TBD)_ | _(ID not yet logged)_ | Reflection coaching corpus |
| **Ultra Report Talia** (if separate) | _(Name TBD)_ | _(ID not yet logged)_ | Ultra R&D corpus if distinct from the clone above |

---

## 5) Known Naming Mismatches
- Vector store **“Reflection Talia – Interactive Coaching”** actually powers **AllStarTeams_Talia** production **report writing**. We’re keeping the name for now to avoid disruption. **Renaming is safe** (assistants attach by ID), but we’ll time it to avoid team confusion.

---

## 6) Workflow & Governance

### Goals
1. **Keep production stable** — no accidental changes to live corpora or assistants.
2. **Enable fast R&D** — iterate in Ultra or staging mirrors.
3. **Track everything** here to avoid context loss.

### Standard Metadata on Files
- `workshop`: `AllStarTeams` | `ImaginalAgility` | `Reflection`
- `doc_type`: `template` | `rubric` | `guide` | `example` | `theory` | `policy` | `howto` | `process`
- `audience`: `participant` | `coach` | `internal`
- `version`: semantic version (e.g., `1.2.0`)

### Retrieval Hygiene
- Attach **only** the relevant store(s) per assistant.
- Use **metadata filters** (e.g., `doc_type in [template, rubric] AND workshop='AllStarTeams'` for reports).
- Keep **user data out of the store**; fetch it at runtime via tools (e.g., `get_workshop_state(user_id)`).

### Promotion Path
1. **Develop** in Ultra (R&D) →
2. **Stage** (clone assistant + vector store; run evals) →
3. **Prod** (promote after passing evals; snapshot store file list).

### Evals
- Maintain **5–20 gold tasks** per assistant (inputs + expected key facts / style assertions).
- Run **nightly** in Stage; compare to Prod before promotion.

### Safe Deletion Checklist (for `vs_688e2bf0...` or others)
1. In OpenAI dashboard, open each plausible project (Prod/Stage/R&D).
2. Check each assistant’s **File Search** attachments for the store ID.
3. If not attached anywhere, optionally **rename** to `DELETE-CANDIDATE-<id>` for a few days.
4. If no errors/usage pop up in logs, **delete** the store.

---

## 7) Prompt Codex (Starter)

Example codex entry for **AllStarTeams report writer** (`allstar_reports@1.0.0`):

```yaml
id: allstar_reports@1.0.0
persona: null
voice_style:
  tone: neutral
  constraints:
    - cite attached sources when appropriate
    - do not fabricate user-specific facts; call tools for workshop data
scope:
  allowed_sources:
    - metadata.doc_type in [template, rubric]
    - metadata.workshop == "AllStarTeams"
system:
  - "You are a report generator. Use ONLY attached files and tool outputs."
  - "If specific info is missing, ask one targeted question before drafting."
tools:
  - name: get_workshop_state
    description: Fetch structured state for a user's AllStarTeams workshop.
    schema:
      type: object
      properties:
        user_id: { type: string, description: "Internal user ID" }
      required: [user_id]
output:
  format: markdown
  sections:
    - Executive Summary
    - Team Highlights
    - Development Areas
    - Recommendations
```

Example codex entry for **Reflection Talia** (`reflection_talia@1.0.0`):

```yaml
id: reflection_talia@1.0.0
persona:
  name: Talia
  style: warm, curious, coach-like; asks one focused question at a time
scope:
  allowed_sources:
    - metadata.doc_type in [guide, example, rubric]
    - metadata.audience == "participant"
system:
  - "Help the user craft their reflection."
  - "Offer 2–3 concrete prompts; keep ownership with the user."
output:
  format: conversational with short bullet prompts
```

---

## 8) Practical How-Tos

### Attaching the Right Store
- In the Assistant config, enable **File Search**, then **Attach vector store** by selecting its **ID** (safe even if names change).

### Safe Rename Rule
- Renaming a store in the dashboard is **safe** (assistants use **ID**). For clarity:
  - New name example: `AllStarTeams_Report_Corpus (was Reflection Talia – Interactive Coaching)`

### Quick Use-Check for a Store (no prod impact)
- Temporarily add the store to a **new test assistant** in a non-prod project and run a test query.
- If your prod assistant behavior doesn’t change and you never attached it there, it’s likely unused.

---

## 9) Open Questions / To Confirm
- Vector store ID and name for the **actual Reflection coaching corpus**.
- Whether **Ultra Report Talia** uses a distinct store from the Ultra clone.
- Assistant ID for **IA_Chat** in the Imaginal Agility project.
- Any **staging** mirrors we should track formally.

---

## 10) Changelog
- **Aug 12, 2025** – Initial master doc created from project conversation; captured assistants, vector stores, safe rename rule, workflow, and codex starters.
