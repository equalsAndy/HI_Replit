#!/bin/bash

# Development environment setup script
echo "Setting up development environment..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f .env ]; then
  echo "Found .env file, using existing configuration"
else
  echo "Creating .env file with development configuration"
  
  # Get DATABASE_URL from server/index.ts or package.json
  echo "DATABASE_URL=\"$(grep -o 'DATABASE_URL=[^\"]*' server/index.ts || echo 'postgres://localhost:5432/heliotrope')\"" > .env
  echo "SESSION_SECRET=\"dev-secret-$(date +%s)\"" >> .env
  echo "NODE_ENV=development" >> .env
  
  echo "Created .env file with basic configuration"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Done
echo "✅ Environment setup complete"
echo "Run 'npm run dev:hmr' to start the development server with Hot Module Replacement"
