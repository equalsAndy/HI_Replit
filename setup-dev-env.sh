#!/bin/bash

# Development environment setup script
echo "🚀 Setting up development environment..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ -f .env ]; then
  echo "✅ Found .env file with AWS RDS configuration"

  # Verify it has DATABASE_URL
  if grep -q "DATABASE_URL" .env; then
    echo "✅ DATABASE_URL configured"
  else
    echo "⚠️  WARNING: .env exists but DATABASE_URL is missing!"
    echo "Please add AWS RDS DATABASE_URL to .env file"
    exit 1
  fi
else
  echo "❌ ERROR: .env file not found"
  echo ""
  echo "This project requires AWS RDS database configuration."
  echo "Please create .env file with:"
  echo ""
  echo "DATABASE_URL=postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require"
  echo "SESSION_SECRET=your-session-secret"
  echo "NODE_ENV=development"
  echo ""
  echo "See LOCAL-DEVELOPMENT-GUIDE.md for details"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Verify server directory exists
if [ ! -d "server" ]; then
  echo "❌ ERROR: server directory not found"
  exit 1
fi

# Done
echo ""
echo "✅ Environment setup complete"
echo ""
echo "📝 Next steps:"
echo "  1. Run 'npm run dev:hmr' to start development server"
echo "  2. Open http://localhost:8080 in your browser"
echo "  3. Development connects to AWS RDS database automatically"
echo ""
echo "🗄️  Database: AWS Lightsail PostgreSQL (Development)"
echo "🔧 See LOCAL-DEVELOPMENT-GUIDE.md for more information"
