# Version Badge System

## Overview
The application now displays version numbers next to the DEV/STAGING badges in the navbar.

## How it Works

### Badge Display
- **DEV environment**: Shows `DEV v1.0.0.1001` (red badge)
- **STAGING environment**: Shows `STAGING v1.0.0.1001` (gray badge)
- **Production**: No badge shown

### Version Format
`v{MAJOR}.{MINOR}.{PATCH}.{BUILD}`
- MAJOR.MINOR.PATCH: Semantic version (default 1.0.0)
- BUILD: 4-digit build number (HHMM format from build time)

## Usage

### Manual Version Update
```bash
# Update to specific version
./update-version.sh 1.2.3 development

# Update with auto-generated date version
./update-version.sh
```

### Build Scripts
```bash
# Development build (auto-updates version)
npm run build

# Staging build (sets staging environment)
npm run build:staging

# Production build (sets production environment)  
npm run build:production

# Just update version without building
npm run version:update
```

## Environment Variables
The system uses these environment variables:
- `VITE_APP_VERSION`: Major.minor.patch version
- `VITE_BUILD_NUMBER`: Build number (4 digits)
- `VITE_ENVIRONMENT`: Environment name

## Files
- `.env.local`: Environment variables for version display
- `public/version.json`: Version info accessible at runtime
- `update-version.sh`: Script to update version numbers

## Environment Detection
The badge appears when:
- **DEV**: `NODE_ENV=development`, localhost, or port 8080
- **STAGING**: `app2.heliotropeimaginal.com` hostname or staging mode
- **Production**: No badge displayed

## Examples
- DEV: `DEV v1.0.0.1001`
- STAGING: `STAGING v1.0.0.1001`
- Different build: `DEV v1.2.3.1445`
