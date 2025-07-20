#!/bin/bash

# Increment version for frontend changes
# Usage: ./bump-version.sh "Description of changes"

if [ -z "$1" ]; then
  echo "❌ Please provide a description of the changes"
  echo "Usage: ./bump-version.sh \"Description of changes\""
  exit 1
fi

echo "🔄 Incrementing frontend version..."
node increment-version.mjs "$1"

echo "� Building frontend with Vite..."
npx vite build

echo "�🔄 Restarting development server..."
# Kill existing server
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Wait a moment for port to be freed
sleep 2

# Restart server in background
echo "🚀 Starting server with new version..."
npx tsx server/index.ts &

# Wait for server to start
sleep 3

echo "✅ Version bumped, frontend built, and server restarted!"
echo "🌐 Check your browser - the Dev badge should show the new version"
