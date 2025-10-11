#!/bin/bash

echo "🔄 Restarting development server..."
echo ""

# Kill existing server processes
pkill -f "tsx.*server" || pkill -f "node.*server" || true
sleep 2

echo "✅ Old server stopped"
echo ""
echo "🚀 Starting fresh server..."
echo ""

# Start server in background
cd /Users/bradtopliff/Desktop/HI_Replit
npm run dev &

# Wait for server to start
sleep 5

echo ""
echo "✅ Server restarted!"
echo ""
echo "Now test the report generation:"
echo "./test-holistic-report.sh"
