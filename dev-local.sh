#!/bin/bash

# Local Development Setup
# Run full-stack development environment

set -e

echo "🚀 Starting local development environment..."
echo ""
echo "This will run the full-stack app with:"
echo "- Frontend: Vite dev server with HMR"
echo "- Backend: Express server with live reload"
echo "- Database: Same staging database"
echo ""

# Run the development server
npm run dev