# Semantic Versioning System

This project follows semantic versioning with the format: `MAJOR.MINOR.PATCH.BUILD`

## Version Types

### 🔨 Build Only (Default)
- **Command**: `./update-version.sh` or `npm run build`
- **Effect**: Increments build number only
- **Example**: `2.5.1.1` → `2.5.1.2`
- **Use for**: Development builds, CI/CD builds

### 🩹 Patch Version (Task/Bug Fix)  
- **Command**: `./update-version.sh patch` or `npm run version:patch`
- **Effect**: Increments patch, resets build to 1
- **Example**: `2.5.1.5` → `2.5.2.1`
- **Use for**: Bug fixes, small tasks, maintenance

### ✨ Minor Version (New Feature)
- **Command**: `./update-version.sh minor` or `npm run version:minor` 
- **Effect**: Increments minor, resets patch and build
- **Example**: `2.5.1.5` → `2.6.0.1`
- **Use for**: New features, enhancements

### 🚀 Major Version (Breaking Changes)
- **Command**: `./update-version.sh major` or `npm run version:major`
- **Effect**: Increments major, resets minor, patch, and build
- **Example**: `2.5.1.5` → `3.0.0.1` 
- **Use for**: Breaking changes, major releases

## NPM Scripts

```bash
npm run build           # Build only (increments build number)
npm run version:patch   # Bug fix/task (increments patch)
npm run version:minor   # New feature (increments minor)
npm run version:major   # Breaking changes (increments major)
```

## Custom Version

You can also set a specific version:
```bash
./update-version.sh 2.6.3   # Sets version to 2.6.3.1
```

## Version Display

- **Development**: `DEV v2.5.1.3`
- **Staging**: `STAGING v2.5.1.3` 
- **Production**: `v2.5.1.3`

## Files Updated

The version system automatically updates:
- `version.json` - Main version tracking
- `client/public/version.json` - Client version info
- `public/version.json` - Production version info
- `.env.local` - Environment variables

## Workflow Examples

### Daily Development
```bash
npm run build    # Just increment build number
# 2.5.1.1 → 2.5.1.2 → 2.5.1.3 ...
```

### Completing a Bug Fix
```bash
npm run version:patch    # Mark completion of task/bug fix
# 2.5.1.5 → 2.5.2.1
```

### Releasing a New Feature  
```bash
npm run version:minor    # New feature release
# 2.5.2.3 → 2.6.0.1
```

### Major Release
```bash
npm run version:major    # Breaking changes
# 2.6.0.1 → 3.0.0.1
```