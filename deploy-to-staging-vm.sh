#!/bin/bash
# Deploy build artifacts to staging Lightsail VM
# Usage: ./deploy-to-staging-vm.sh [--skip-env-sync] [--env-file <path>]

STAGING_USER="ubuntu"
STAGING_HOST="35.94.49.194"
REMOTE_DIR="/home/ubuntu/hi-replit-staging"
SSH_KEY="keys/ubuntu-staging-key.pem"

# Flags
SKIP_ENV_SYNC=0
LOCAL_ENV_FILE=".env.staging"

usage(){
  echo "Usage: $0 [--skip-env-sync] [--env-file <path>]" >&2
  echo "  --skip-env-sync   Do not rsync local env file to the VM" >&2
  echo "  --env-file PATH   Use PATH as the local env file to sync" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-env-sync) SKIP_ENV_SYNC=1; shift;;
    --env-file) LOCAL_ENV_FILE="$2"; shift 2;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1"; usage;;
  esac
done

# Verify SSH key exists
if [ ! -f "$SSH_KEY" ]; then
  echo "ERROR: SSH key not found at $SSH_KEY" >&2
  echo "Ensure the staging SSH key is in the keys/ directory." >&2
  exit 1
fi

# Source staging env so VITE_ variables are available during Vite build
if [ -f "$LOCAL_ENV_FILE" ]; then
  echo "--- Sourcing $LOCAL_ENV_FILE for build-time VITE_ variables..."
  set -a; source "$LOCAL_ENV_FILE"; set +a
else
  echo "WARNING: $LOCAL_ENV_FILE not found — VITE_ variables may use dev defaults" >&2
fi

echo "--- Building project locally (staging build)..."
# Use staging build which skips the performance bundle-size check
npm run build:staging || { echo "Staging build failed"; exit 1; }

echo "--- Syncing build to VM (dist + package manifests)..."
# Ensure remote directory exists
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${STAGING_USER}@${STAGING_HOST} "mkdir -p $REMOTE_DIR"

# Rsync only built assets and package manifests (avoid shipping node_modules)
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --delete dist/ ${STAGING_USER}@${STAGING_HOST}:$REMOTE_DIR/dist/
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --omit-dir-times --no-perms package*.json ${STAGING_USER}@${STAGING_HOST}:$REMOTE_DIR/ 2>/dev/null || true

# Sync env file to the VM as .env (dotenv/config auto-loads .env from cwd)
if [ "$SKIP_ENV_SYNC" -eq 1 ]; then
  echo "--- Skipping env sync to VM (per --skip-env-sync)"
else
  if [ -f "$LOCAL_ENV_FILE" ]; then
    echo "--- Copying $LOCAL_ENV_FILE to VM as .env (ensure secrets are correct)"
    rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" "$LOCAL_ENV_FILE" ${STAGING_USER}@${STAGING_HOST}:$REMOTE_DIR/.env
  else
    echo "--- No local $LOCAL_ENV_FILE found — leaving remote env untouched"
  fi
fi

echo "--- Installing production dependencies on VM and restarting app (PM2)..."
# On the VM: install production deps, fix ownership, validate envs, and reload/start pm2 with env loaded
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${STAGING_USER}@${STAGING_HOST} /bin/bash <<'EOF_REMOTE'
set -euo pipefail
REMOTE_DIR="/home/ubuntu/hi-replit-staging"
STAGING_USER="ubuntu"
cd "$REMOTE_DIR"
# Ensure correct owner
sudo chown -R ${STAGING_USER}:${STAGING_USER} "$REMOTE_DIR" || true

# Install production dependencies on VM (idempotent)
if [ -f package-lock.json ] || [ -f package.json ]; then
  echo "--- Running npm ci --only=production on VM"
  npm ci --only=production --no-audit --no-fund
fi

# Validate env file and required keys
REQUIRED_KEYS=(DATABASE_URL SESSION_SECRET OPENAI_API_KEY)
if [ ! -f .env ]; then
  echo "ERROR: .env not found in $REMOTE_DIR. Aborting deploy." >&2
  exit 3
fi
MISSING=()
for key in "${REQUIRED_KEYS[@]}"; do
  if ! grep -qE "^${key}=" .env; then
    MISSING+=("$key")
  fi
done
if [ ${#MISSING[@]} -ne 0 ]; then
  echo "ERROR: Missing required env keys in .env: ${MISSING[*]}" >&2
  echo "Aborting deploy. Add these keys and re-run." >&2
  exit 4
fi

# Load env for the process start
set -a; . .env; set +a

# Start/reload pm2
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload hi-staging --update-env || pm2 start dist/index.js --name hi-staging --update-env --env staging
else
  echo "pm2 not found on VM; starting node directly (use pm2 recommended)"
  node dist/index.js &
fi

# Smoke test: hit local health endpoint
sleep 2
HEALTH_URL="http://127.0.0.1:${PORT:-8080}${HEALTH_ENDPOINT:-/health}"
if curl -sS --fail "$HEALTH_URL" -m 5 >/dev/null 2>&1; then
  echo "Smoke test passed: $HEALTH_URL"
  curl -sS "$HEALTH_URL" || true
else
  echo "Smoke test FAILED: $HEALTH_URL" >&2
  echo "Showing pm2 logs for hi-staging:" >&2
  pm2 logs hi-staging --lines 200
  exit 5
fi
EOF_REMOTE

echo "Deployed to staging VM: ${STAGING_USER}@${STAGING_HOST} ($REMOTE_DIR)"
echo "Check app at: http://${STAGING_HOST} (via nginx) or http://${STAGING_HOST}:8080 (direct)."
