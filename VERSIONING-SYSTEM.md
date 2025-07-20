# 🔄 Versioning System Documentation

## Overview

The versioning system is a comprehensive automated workflow for tracking frontend changes and displaying version information to users. It ensures every frontend change is versioned, tracked, and immediately visible to users and developers.

## 📊 Core Components

### 1. `version.json` - Central Version Registry
```json
{
  "version": "2.0.0",           // Semantic version (major.minor.patch)
  "buildNumber": "7",           // Auto-incrementing build counter
  "lastUpdated": "2025-07-20T16:50:01.280Z",
  "description": "Fixed version number display after manual env edits"
}
```

**Purpose**: Central source of truth for version information
- `version`: Semantic version following major.minor.patch format
- `buildNumber`: Auto-incrementing counter for each build
- `lastUpdated`: ISO timestamp of last version update
- `description`: Human-readable description of changes

### 2. `increment-version.mjs` - Version Management Script

**Purpose**: Increments build numbers and updates environment variables

**Function**: 
- Reads current `version.json`
- Increments the `buildNumber` by 1
- Updates timestamp and description
- Automatically updates `.env` with `VITE_APP_VERSION` and `VITE_BUILD_NUMBER`

**Usage**: 
```bash
node increment-version.mjs "Description of changes"
```

**What it does**:
1. Parses existing `version.json` or creates default if missing
2. Increments build number by 1
3. Updates timestamp to current time
4. Sets description from command line argument
5. Writes updated data back to `version.json`
6. Updates `.env` file with new `VITE_APP_VERSION` and `VITE_BUILD_NUMBER`

### 3. `bump-version.sh` - Complete Deployment Workflow

**Purpose**: One-command version bump, build, and deploy

**Workflow**:
1. 🔄 Runs `increment-version.mjs` with description
2. 🏗️ Builds frontend with `npx vite build`
3. 🔄 Kills existing server on port 8080
4. 🚀 Restarts server with new version

**Usage**: 
```bash
./bump-version.sh "Description of changes"
```

**Example**:
```bash
./bump-version.sh "Added new coaching modal features"
```

## 🌐 Frontend Integration

### Environment Variables (`.env`)
```bash
VITE_APP_VERSION=2.0.0      # Semantic version for display
VITE_BUILD_NUMBER=7         # Build number for tracking
```

**Important**: These variables are automatically managed by the versioning system. Manual edits will be overwritten.

### Version Badge Display (`client/src/components/layout/NavBar.tsx`)

**Location**: Top-right corner of navigation bar

**Logic**: 
- Reads `import.meta.env.VITE_APP_VERSION` and `VITE_BUILD_NUMBER`
- Detects environment based on hostname and Vite mode
- Displays appropriate badge format

**Environment Detection**:
- **Development**: `localhost` or port `8080` → `DEV v2.0.0.7` (red badge)
- **Staging**: `app2.heliotropeimaginal.com` → `STAGING v2.0.0.7` (gray badge)  
- **Production**: Other hostnames → No badge (clean interface)

## 🔧 How to Use the System

### For Frontend Changes:
```bash
# One command does everything:
./bump-version.sh "Added new coaching modal features"
```

### What Happens Automatically:
1. ✅ Version increments: `v2.0.0.7` → `v2.0.0.8`
2. ✅ Updates `version.json` with timestamp and description
3. ✅ Updates `.env` with new `VITE_BUILD_NUMBER`
4. ✅ Builds frontend with Vite (includes new env vars)
5. ✅ Restarts server with updated version
6. ✅ Version badge shows new number immediately

### Manual Version Management (Advanced):

#### To increment just the build number:
```bash
node increment-version.mjs "Your description here"
```

#### To build frontend only:
```bash
npm run build
```

#### To restart server only:
```bash
# Kill existing server
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
# Start new server
npx tsx server/index.ts
```

## 🎯 Version Display Logic

The system shows different badges based on environment detection:

### Development Environment
- **Triggers**: `localhost`, port `8080`, or `import.meta.env.DEV === true`
- **Display**: `DEV v2.0.0.7` (red destructive badge)
- **CSS Class**: `Badge variant="destructive"`

### Staging Environment  
- **Triggers**: `app2.heliotropeimaginal.com` hostname
- **Display**: `STAGING v2.0.0.7` (gray secondary badge)
- **CSS Class**: `Badge variant="secondary"`

### Production Environment
- **Triggers**: Any other hostname
- **Display**: No badge shown (clean production interface)

## 🚨 Important Notes

### 1. Frontend Changes Require Build
Since this is a Vite application, environment variables are compiled at build time. Changes to version numbers require either:
- Running `./bump-version.sh` (recommended)
- Running `npm run build` manually after version updates

### 2. Don't Edit .env Manually for Versions
The system automatically manages these variables:
- `VITE_APP_VERSION`
- `VITE_BUILD_NUMBER`

Manual edits to these will be overwritten by the versioning scripts.

### 3. Version Format
- **Semantic Version**: `major.minor.patch` (e.g., `2.0.0`)
- **Build Number**: Auto-incrementing integer (e.g., `7`)
- **Display Format**: `v2.0.0.7`

### 4. Browser Caching
After version updates, users might need a hard refresh (`Cmd+Shift+R` on macOS, `Ctrl+Shift+R` on Windows/Linux) to see changes due to browser caching.

## 🎯 Best Practices

### Daily Development
```bash
# For any frontend change:
./bump-version.sh "Brief description of what changed"
```

### Descriptive Messages
```bash
# Good examples:
./bump-version.sh "Added coaching modal with tabbed interface"
./bump-version.sh "Fixed version badge display issue"
./bump-version.sh "Updated reflection step navigation"

# Avoid vague messages:
./bump-version.sh "updates"
./bump-version.sh "fixes"
```

### Major Version Updates
For significant releases, manually update the base version in `version.json`:

1. Edit `version.json`:
   ```json
   {
     "version": "3.0.0",  // Update this manually
     "buildNumber": "1",  // Reset to 1 for new major version
     // ... rest of file
   }
   ```

2. Then run bump script:
   ```bash
   ./bump-version.sh "Major release v3.0.0 with new features"
   ```

### Verification Steps
After running bump-version:
1. ✅ Check that server restarted successfully
2. ✅ Refresh browser and verify version badge updated
3. ✅ Check console for any build errors
4. ✅ Verify functionality still works correctly

## 🔍 Troubleshooting

### Version Badge Not Updating
**Problem**: Badge shows old version after running bump-version
**Solutions**:
1. Hard refresh browser (`Cmd+Shift+R`)
2. Check if `.env` has correct `VITE_APP_VERSION` and `VITE_BUILD_NUMBER`
3. Verify build completed successfully
4. Check browser console for errors

### Server Won't Restart
**Problem**: `bump-version.sh` fails to restart server
**Solutions**:
1. Manually kill process: `lsof -ti:8080 | xargs kill -9`
2. Wait 5 seconds for port to free up
3. Restart manually: `npx tsx server/index.ts`

### Build Errors
**Problem**: Vite build fails during bump-version
**Solutions**:
1. Check TypeScript errors: `npx tsc --noEmit`
2. Review build output for specific error messages
3. Fix code issues and re-run bump-version

### Environment Variables Missing
**Problem**: `VITE_APP_VERSION` or `VITE_BUILD_NUMBER` missing from `.env`
**Solutions**:
1. Run `node increment-version.mjs "Restore env vars"` to regenerate
2. Check that `.env` file exists and is writable
3. Verify no duplicate entries in `.env`

## 📝 File Locations

- **Version Registry**: `/version.json`
- **Version Script**: `/increment-version.mjs`
- **Bump Script**: `/bump-version.sh`
- **Environment**: `/.env`
- **Frontend Display**: `/client/src/components/layout/NavBar.tsx`

## 🔄 Version History Example

```json
// Example progression in version.json
{
  "version": "2.0.0",
  "buildNumber": "5",
  "description": "Initial coaching modal"
}
↓
{
  "version": "2.0.0", 
  "buildNumber": "6",
  "description": "Added tabbed interface"
}
↓
{
  "version": "2.0.0",
  "buildNumber": "7", 
  "description": "Fixed version display"
}
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| **Standard frontend update** | `./bump-version.sh "Description"` |
| **Check current version** | `cat version.json` |
| **Manual build only** | `npm run build` |
| **Kill server** | `lsof -ti:8080 \| xargs kill -9` |
| **Start server** | `npx tsx server/index.ts` |
| **Hard refresh browser** | `Cmd+Shift+R` (macOS) / `Ctrl+Shift+R` (Windows/Linux) |

---

*Last updated: July 20, 2025*
*System version: v2.0.0.7*
