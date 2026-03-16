# Frontend Version Tracking System

This system tracks and displays version numbers in the navbar Dev badge.

## Current Setup
- **Semantic Version**: Stored in `version.json` (tracked in git)
- **Build Number**: Derived from git commit count (`git rev-list --count HEAD`) — not stored
- **Display Format**: `DEV v2.8.2.3399`

## Usage

### Bump the semantic version
```bash
./update-version.sh patch    # Bug fix: 2.8.2 → 2.8.3
./update-version.sh minor    # Feature: 2.8.2 → 2.9.0
./update-version.sh major    # Breaking: 2.8.2 → 3.0.0
```

### Regenerate derived files (no version change)
```bash
./update-version.sh
```

This regenerates `client/public/version.json`, `public/version.json`, and `.env.local` with the current version and git-derived build number.

### What NOT to bump for
- Backend-only changes (API routes, database changes)
- Configuration changes
- Documentation updates

## How It Works

1. `version.json` holds the semantic version (tracked in git, rarely changes)
2. Build number comes from `git rev-list --count HEAD` (no storage, no conflicts)
3. The navbar reads `VITE_APP_VERSION` and `VITE_BUILD_NUMBER` from Vite env
4. In development mode, it displays `DEV v{version}.{buildNumber}`

## Files Involved

| File | Tracked | Purpose |
|------|---------|---------|
| `version.json` | Yes | Semantic version source of truth |
| `update-version.sh` | Yes | Version management script |
| `client/public/version.json` | No | Runtime version for Vite dev server |
| `public/version.json` | No | Runtime version for production |
| `.env.local` | No | Vite build environment variables |
| `NavBar.tsx` | Yes | Displays version in Dev badge |

## Why git-derived build numbers?

Previously, build numbers were stored in `version.json` and incremented manually. This caused merge conflicts when switching branches because each branch had a different build number. Now, build numbers are derived from git at build time — each branch naturally has its own count, and nothing conflicts on merge.
