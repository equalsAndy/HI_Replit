# #7 — Claude API integration — verify migration is stable

**State:** OPEN
**Labels:** claude-api
**Created:** 2026-03-08

---

## Summary

Migration from OpenAI to Claude API is complete. Verify:
- AST coaching prompts produce expected quality output
- Prompt caching is working for the 5 sequential API calls with identical static content
- Error handling and fallback behavior is solid
- Cost tracking is in place
