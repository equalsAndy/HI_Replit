# Auth0 Environment Isolation Fix

## Problem

After deploying to production, the local development environment's Auth0 callback was switching to the production URL (`app2.heliotropeimaginal.com`) instead of development (`localhost:8080`).

## Root Cause

The `build-production.sh` script was:
1. **Exporting** production Auth0 environment variables from AWS Parameter Store
2. These exports remained in the shell session after the build completed
3. When switching back to development, Vite would pick up these **shell environment variables** instead of the `.env.development` file
4. The production values were being baked into the development build

### Why This Happened

Vite's environment variable loading order:
1. **Shell environment variables** (highest priority)
2. `.env.[mode].local` files
3. `.env.[mode]` files (e.g., `.env.development`)
4. `.env.local`
5. `.env` (lowest priority)

Since `build-production.sh` used `export`, those variables stayed in the shell and overrode all file-based configurations.

## Solution

### Changes Made

1. **Isolated Production Build** - Updated `build-production.sh` to run the build in a subshell using `(...)`:
   - Environment variables are only exported within the subshell
   - They don't leak into the parent shell
   - Development environment remains clean after production builds

2. **Enhanced Development Environment Files**:
   - Added missing `VITE_AUTH0_AUDIENCE` to `client/.env.development`
   - Added clear comments to identify development vs production configs
   - Ensured `client/.env` has complete Auth0 configuration

3. **Created Verification Tools**:
   - `verify-dev-env.sh` - Check if environment is clean and properly configured
   - `clean-dev-env.sh` - Clean up any leaked production variables

### Files Modified

- [build-production.sh](../build-production.sh) - Wrapped build in subshell
- [client/.env.development](../client/.env.development) - Added VITE_AUTH0_AUDIENCE
- [client/.env](../client/.env) - Added clearer comments

### Files Created

- [verify-dev-env.sh](../verify-dev-env.sh) - Environment verification script
- [clean-dev-env.sh](../clean-dev-env.sh) - Environment cleanup script

## Usage

### After Production Deployment

If you suspect your development environment has been polluted with production variables:

```bash
# Option 1: Verify and clean manually
./verify-dev-env.sh
# If warnings appear, run:
./clean-dev-env.sh

# Option 2: Quick fix - start fresh terminal
# Just close your current terminal and open a new one
```

### Prevent Future Issues

The subshell isolation in `build-production.sh` should prevent this issue from occurring again. However, if you manually export Auth0 variables for testing, be aware they will override your `.env` files.

## How to Test

1. **Deploy to production**:
   ```bash
   ./deploy-to-production.sh
   ```

2. **Verify development environment is clean**:
   ```bash
   ./verify-dev-env.sh
   ```

3. **Start development server**:
   ```bash
   npm run dev:hmr
   ```

4. **Test Auth0 login**:
   - Click "Login"
   - Should redirect to Auth0
   - After authentication, should redirect to `http://localhost:8080/auth/callback`
   - Should NOT redirect to `https://app2.heliotropeimaginal.com/auth/callback`

## Technical Details

### Environment Variable Isolation

**Before Fix:**
```bash
# build-production.sh
export VITE_AUTH0_CLIENT_ID=...  # ❌ Leaks to parent shell
export VITE_AUTH0_REDIRECT_URI=https://app2.heliotropeimaginal.com/auth/callback
npm run build:production
# Variables still set in shell ❌
```

**After Fix:**
```bash
# build-production.sh
(
  export VITE_AUTH0_CLIENT_ID=...  # ✅ Only in subshell
  export VITE_AUTH0_REDIRECT_URI=https://app2.heliotropeimaginal.com/auth/callback
  npm run build:production
)
# Variables NOT set in parent shell ✅
```

### Vite Environment Loading

Vite automatically loads environment variables based on `NODE_ENV`:

- `npm run dev` or `npm run dev:hmr` → `NODE_ENV=development` → loads `client/.env.development`
- `npm run build:production` → loads production variables from exports (in subshell)

The key is ensuring development mode never sees production variables.

## Troubleshooting

### Still seeing production redirect after fix?

1. **Check your current shell for exports**:
   ```bash
   echo $VITE_AUTH0_REDIRECT_URI
   ```
   If it shows production URL, run:
   ```bash
   ./clean-dev-env.sh
   ```

2. **Clear Vite cache**:
   ```bash
   rm -rf client/node_modules/.vite
   rm -rf dist/public
   ```

3. **Start fresh terminal**:
   - Close current terminal
   - Open new terminal
   - Run `npm run dev:hmr`

### How to verify which Auth0 config is being used?

Check the browser console when the app loads. You should see:
```
🔧 Client Auth0 config loaded: {
  environment: 'development',
  domain: 'dev-y4g4ug6epxi167a4.us.auth0.com',
  redirectUri: 'http://localhost:8080/auth/callback',
  hasClientId: true
}
```

If `redirectUri` shows `app2.heliotropeimaginal.com`, your environment is polluted.

## Prevention Checklist

- ✅ Always use subshells for temporary environment variable exports
- ✅ Run `verify-dev-env.sh` after production deployments
- ✅ Keep `.env.development` files up to date with all required variables
- ✅ Use `clean-dev-env.sh` if you suspect environment pollution
- ✅ Consider opening a new terminal after production deployments

## Related Files

- [client/src/config/auth-environment.ts](../client/src/config/auth-environment.ts) - Client-side Auth0 config
- [server/config/auth-environment.ts](../server/config/auth-environment.ts) - Server-side Auth0 config
- [deploy-to-production.sh](../deploy-to-production.sh) - Production deployment script
- [build-production.sh](../build-production.sh) - Production build script (FIXED)

## See Also

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [CLAUDE.md](../CLAUDE.md) - Project overview and environment strategy
- [DEPLOYMENT-QUICK-REFERENCE.md](../DEPLOYMENT-QUICK-REFERENCE.md) - Deployment guide

---

**Last Updated**: January 2025
**Issue**: Auth0 callback switching to production after deployment
**Status**: ✅ RESOLVED
