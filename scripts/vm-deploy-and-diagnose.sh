#!/bin/bash
# VM Deploy & Diagnose helper
# Usage: sudo ./scripts/vm-deploy-and-diagnose.sh [--dir /home/ubuntu/hi-replit-staging] [--run-tests]

set -euo pipefail

TARGET_DIR="/home/ubuntu/hi-replit-staging"
RUN_TESTS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dir) TARGET_DIR="$2"; shift 2;;
    --run-tests) RUN_TESTS=1; shift;;
    -h|--help) echo "Usage: $0 [--dir <target_dir>] [--run-tests]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 2;;
  esac
done

log(){ echo "[vm-deploy] $*"; }

log "Running diagnostics for target: $TARGET_DIR"

if [ ! -d "$TARGET_DIR" ]; then
  log "Target dir not found: $TARGET_DIR"; exit 1
fi

log "Listing target dir contents..."
ls -la "$TARGET_DIR" || true

if [ -f "$TARGET_DIR/dist/index.js" ]; then
  log "Found dist/index.js"
  ls -la "$TARGET_DIR/dist/index.js"
else
  log "ERROR: dist/index.js not found in $TARGET_DIR/dist"; exit 1
fi

# Fix ownership if needed
OWNER=$(stat -c '%U' "$TARGET_DIR" || echo ubuntu)
if [ "$OWNER" != "ubuntu" ]; then
  log "Fixing ownership to ubuntu:ubuntu for $TARGET_DIR"
  sudo chown -R ubuntu:ubuntu "$TARGET_DIR"
fi

cd "$TARGET_DIR"

log "Ensuring Node and npm are present..."
if ! command -v node >/dev/null 2>&1; then
  log "Node not found. Please install Node 18+ on this VM."; exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  log "npm not found. Please install npm."; exit 1
fi

log "Installing production dependencies (npm ci --only=production)"
npm ci --only=production

log "Ensuring pm2 is installed globally..."
if ! command -v pm2 >/dev/null 2>&1; then
  log "pm2 not found — installing globally (requires sudo)"
  sudo npm install -g pm2
fi

log "Starting or reloading pm2 process 'hi-staging'"
pm2 reload hi-staging --update-env || pm2 start dist/index.js --name hi-staging --update-env --env staging

sleep 2
log "PM2 status:"; pm2 status

log "Checking process listening on port 8080"
if ss -tulwn | rg 8080 >/dev/null 2>&1; then
  ss -tulwn | rg 8080
else
  log "No service listening on port 8080"
fi

log "Fetching local health endpoint"
if curl -sS --fail http://127.0.0.1:8080${HEALTH_ENDPOINT:-/health} -m 5 >/dev/null 2>&1; then
  log "Health check OK"
  curl -sS http://127.0.0.1:8080${HEALTH_ENDPOINT:-/health}
else
  log "Health check FAILED. Showing last 200 pm2 log lines for hi-staging"
  pm2 logs hi-staging --lines 200
  exit 2
fi

if [ "$RUN_TESTS" -eq 1 ]; then
  log "Running tests (npm test) — this may take a while"
  npm test || { log "Tests failed"; exit 3; }
  log "Tests passed"
fi

log "Done. If the app is healthy, external 502 should clear. If not, check external proxy/LB settings."
