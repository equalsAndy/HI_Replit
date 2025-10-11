#!/usr/bin/env bash
set -euo pipefail

echo "==> HI_Replit Development Server with HMR Optimization"
echo "==> Freeing ports 8080 and 24679 (HMR) if occupied"

# Free ports function
free_port() {
  local port=$1
  local pid=$(lsof -ti tcp:$port 2>/dev/null || true)
  if [[ -n "${pid:-}" ]]; then
    echo "🔄 Killing process on port $port (PID: $pid)"
    kill -9 "$pid" 2>/dev/null || true
    sleep 1
  else
    echo "✅ Port $port is free"
  fi
}

# Free both ports
free_port 8080
free_port 24679

echo "==> Starting development server with optimized HMR..."
echo "🌐 Frontend: http://localhost:8080"
echo "🔄 HMR Socket: localhost:24679"
echo "📡 TRPC API: http://localhost:8080/trpc"

# Start the development server
npm run dev:hmr
