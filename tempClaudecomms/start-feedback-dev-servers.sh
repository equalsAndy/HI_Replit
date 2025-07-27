#!/bin/bash
# Start development servers for feedback system testing

echo "Starting Heliotrope Imaginal development servers..."

# Start server in background
echo "Starting server on port 8080..."
cd /Users/bradtopliff/Desktop/HI_Replit/server
nohup npm run dev > /tmp/hi-server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to be ready
echo "Waiting for server to be ready..."
sleep 5

# Check if server is running
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Server is running on http://localhost:8080"
else
    echo "❌ Server failed to start. Check /tmp/hi-server.log for details"
    exit 1
fi

# Start client in background
echo "Starting client on port 5173..."
cd /Users/bradtopliff/Desktop/HI_Replit/client
nohup npm run dev > /tmp/hi-client.log 2>&1 &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"

# Wait for client to be ready
echo "Waiting for client to be ready..."
sleep 10

# Check if client is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Client is running on http://localhost:5173"
else
    echo "❌ Client failed to start. Check /tmp/hi-client.log for details"
    exit 1
fi

echo ""
echo "🚀 Development servers are running!"
echo "   Server: http://localhost:8080 (PID: $SERVER_PID)"
echo "   Client: http://localhost:5173 (PID: $CLIENT_PID)"
echo ""
echo "📝 Feedback System URLs:"
echo "   Workshop Pages:"
echo "   - AST: http://localhost:8080/allstarteams"
echo "   - IA: http://localhost:8080/imaginal-agility"
echo "   Admin Dashboard: http://localhost:8080/admin → Feedback Management tab"
echo ""
echo "To stop servers:"
echo "   kill $SERVER_PID $CLIENT_PID"
echo ""
echo "Log files:"
echo "   Server: /tmp/hi-server.log"
echo "   Client: /tmp/hi-client.log"