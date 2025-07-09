#!/bin/bash

echo "🔨 Building AllStarTeams for Production Container..."

# Create build directory
mkdir -p dist

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Verify build files exist
if [ ! -d "dist/public" ]; then
    echo "❌ Frontend build failed - dist/public directory not found"
    exit 1
fi

echo "✅ Frontend build complete"

# Build the backend (TypeScript to JavaScript)
echo "🔧 Building backend..."
npx tsc --build tsconfig.json --verbose

if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi

echo "✅ Backend build complete"

# Verify all required files exist
REQUIRED_FILES=(
    "server/index-production.ts"
    "shared/schema.ts"
    "dist/public/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done

echo "✅ All required files verified"

# Build the Docker image
echo "🐳 Building Docker image..."
docker build -f Dockerfile.production -t allstarteams-prod .

if [ $? -eq 0 ]; then
    echo "🎉 Production build complete!"
    echo "🚀 Run with: docker run -p 8080:8080 --env-file .env allstarteams-prod"
else
    echo "❌ Docker build failed"
    exit 1
fi