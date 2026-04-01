# #8 — Issue Reporting Process with Claude Code

**State:** OPEN
**Labels:** documentation
**Created:** 2026-03-12

---

## Issue Reporting Process

This documents the workflow for reporting bugs and enhancements through Claude Code conversations.

### How It Works

1. **You describe the issue** — paste an error, describe unexpected behavior, or propose an enhancement. Screenshots, file paths, and step-to-reproduce are all welcome but not required upfront.

2. **Claude asks clarifying questions** — A few quick questions to fill in gaps:
   - **Type**: Bug or enhancement?
   - **Where**: Which workshop (AST/IA), which step/module?
   - **Severity/Priority**: Blocking, annoying, or nice-to-have?
   - **Reproduction** (bugs): Steps to reproduce, expected vs actual behavior
   - **Context** (enhancements): What problem does this solve? Any design preferences?

3. **Claude creates a GitHub issue** — Using `gh issue create` with:
   - A clear, specific title
   - Structured body (summary, steps to reproduce, expected/actual behavior, context)
   - Appropriate labels (`bug`, `enhancement`, etc.)
   - Workshop and module tags where applicable

4. **You get a link** — Claude returns the issue URL so you can review, edit, or assign it later.

### Labels We Use

| Label | When to apply |
|-------|--------------|
| `bug` | Something isn't working as expected |
| `enhancement` | New feature or improvement request |
| `documentation` | Docs need updating |
| `claude-api` | Related to AI/Claude integration |
| `data-layer` | Database or data-related |

### Tips

- You can batch multiple issues in one conversation
- Say "don't fix it, just log it" if you want to make sure Claude only records, not repairs
- Reference this issue (#8) when asking Claude to log something if it needs a reminder
