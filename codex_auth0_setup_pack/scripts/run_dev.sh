#!/usr/bin/env bash
set -euo pipefail

echo "==> Freeing ports 8080 and 24679 (HMR) if occupied"
for p in 8080 24679; do
  pid=$(lsof -ti tcp:$p || true)
  if [[ -n "${pid:-}" ]]; then
    kill -9 "$pid" || true
    echo "killed $p ($pid)"
  else
    echo "no listener on $p"
  fi
done

echo "==> Starting dev server"
npm run dev:hmr
