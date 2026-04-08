#!/bin/bash
# Bootstrap script for the staging VM (hi-staging-vm at 35.94.49.194)
# Run this ON the VM via SSH:
#   scp -i keys/ubuntu-staging-key.pem staging/setup-vm.sh ubuntu@35.94.49.194:~/
#   ssh -i keys/ubuntu-staging-key.pem ubuntu@35.94.49.194
#   chmod +x setup-vm.sh && ./setup-vm.sh

set -euo pipefail

echo "=== Staging VM Setup ==="
echo "Host: $(hostname)"
echo "OS: $(lsb_release -ds 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2)"

# --- Add swap (1GB RAM is tight for npm ci) ---
echo ""
echo "--- Adding 2GB swap space ---"
if [ ! -f /swapfile ]; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "Swap added: $(swapon --show)"
else
  echo "Swap already exists, skipping"
fi

# --- Update packages ---
echo ""
echo "--- Updating package lists ---"
sudo apt-get update -y

# --- Install Node.js 20 ---
echo ""
echo "--- Installing Node.js 20 ---"
if command -v node >/dev/null 2>&1 && node --version | grep -q "v20"; then
  echo "Node.js 20 already installed: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "Node.js installed: $(node --version)"
  echo "npm installed: $(npm --version)"
fi

# --- Install PM2 ---
echo ""
echo "--- Installing PM2 ---"
if command -v pm2 >/dev/null 2>&1; then
  echo "PM2 already installed: $(pm2 --version)"
else
  sudo npm install -g pm2
  echo "PM2 installed: $(pm2 --version)"
fi

# --- Install nginx ---
echo ""
echo "--- Installing nginx ---"
if command -v nginx >/dev/null 2>&1; then
  echo "nginx already installed: $(nginx -v 2>&1)"
else
  sudo apt-get install -y nginx
  echo "nginx installed: $(nginx -v 2>&1)"
fi

# --- Configure nginx ---
echo ""
echo "--- Configuring nginx ---"
if [ -f ~/nginx-staging.conf ]; then
  sudo cp ~/nginx-staging.conf /etc/nginx/sites-available/hi-staging
  sudo ln -sf /etc/nginx/sites-available/hi-staging /etc/nginx/sites-enabled/hi-staging
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t
  sudo systemctl enable nginx
  sudo systemctl restart nginx
  echo "nginx configured and running"
else
  echo "WARNING: ~/nginx-staging.conf not found — skipping nginx config"
  echo "SCP the config first: scp -i keys/ubuntu-staging-key.pem staging/nginx-staging.conf ubuntu@35.94.49.194:~/"
fi

# --- Create app directory ---
echo ""
echo "--- Creating app directory ---"
mkdir -p /home/ubuntu/hi-replit-staging
echo "App directory: /home/ubuntu/hi-replit-staging"

# --- Configure PM2 startup ---
echo ""
echo "--- Configuring PM2 startup on boot ---"
echo "Run the following command (PM2 will output the exact sudo command to execute):"
echo ""
pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
echo ""
echo "^^^ Copy and run the 'sudo env PATH=...' command above ^^^"

# --- Summary ---
echo ""
echo "=== Setup Complete ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "PM2: $(pm2 --version)"
echo "nginx: $(nginx -v 2>&1)"
echo "Swap: $(free -h | grep Swap | awk '{print $2}')"
echo ""
echo "Next steps:"
echo "  1. Run the PM2 startup sudo command shown above"
echo "  2. From your local machine, run: ./deploy-to-staging-vm.sh"
echo "  3. Verify: curl http://35.94.49.194/health"
