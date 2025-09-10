#!/bin/bash

# Start development environment
echo "🚀 Starting HI_Replit development environment..."

# Change to project directory
cd /Users/bradtopliff/Desktop/HI_Replit

# Check if already running
if lsof -ti:8080 > /dev/null; then
    echo "⚠️  Port 8080 is already in use. Stopping existing process..."
    lsof -ti:8080 | xargs kill -9
    sleep 2
fi

# Start the development server
echo "🔧 Starting development server..."
npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test server
echo "🧪 Testing server connection..."
if curl -s http://localhost:8080/api/admin/videos > /dev/null; then
    echo "✅ Development server is running successfully!"
    echo "🎯 Video management should now be accessible at:"
    echo "   http://localhost:8080/admin"
else
    echo "❌ Server not responding. Please check logs."
fi

echo "📝 To stop the server later, run: lsof -ti:8080 | xargs kill -9"
