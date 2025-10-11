# Frontend Version Tracking System

This system automatically tracks and displays version numbers in the navbar Dev badge for frontend/visual changes.

## Current Version
- **Base Version**: 2.0.0
- **Build Number**: Auto-incremented for each frontend change
- **Display Format**: `DEV v2.0.0.{buildNumber}`

## Usage

### For Frontend/Visual Changes
When you make any visual changes to the UI, run:

```bash
./bump-version.sh "Description of your changes"
```

This will:
1. Increment the build number (e.g., v2.0.0.3 → v2.0.0.4)
2. Update the .env file with new version variables
3. **Build the frontend with Vite** (includes your changes in the dist folder)
4. Restart the development server
5. Update the Dev badge in the navbar

### Examples
```bash
./bump-version.sh "Updated coaching modal with better styling"
./bump-version.sh "Added new navigation component"
./bump-version.sh "Fixed button alignment in header"
```

### What NOT to bump for
- Backend-only changes (API routes, database changes, etc.)
- Configuration changes
- Bug fixes that don't change the UI
- Documentation updates

## Important Notes

⚠️ **The system now includes a frontend build step** - this ensures your changes are immediately visible after running the bump script.

🔄 **Always use the bump script for UI changes** - manual server restarts won't include your latest frontend changes without building first.

## Files Involved

- `version.json` - Stores version metadata
- `increment-version.mjs` - Node script to increment version
- `bump-version.sh` - Convenient bash script for version bumping + building
- `.env` - Contains `VITE_APP_VERSION` and `VITE_BUILD_NUMBER`
- `NavBar.tsx` - Displays the version in the Dev badge

## How It Works

1. The navbar reads `VITE_APP_VERSION` and `VITE_BUILD_NUMBER` from environment variables
2. In development mode, it displays `DEV v{version}.{buildNumber}`
3. Vite builds your frontend changes into the `dist/public` folder
4. The server serves the built files with your latest changes
5. The version is visible to help you confirm you're seeing the latest changes

## Troubleshooting

**If you don't see changes after hard refresh:**
- Run `./bump-version.sh "Your change description"` to ensure build + restart
- The script includes the Vite build step to make changes visible immediately
