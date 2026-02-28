#!/usr/bin/env bash
# dev.sh — one-command local dev setup for Flocky
# Usage: ./dev.sh [--setup-only]
#   --setup-only  Run all setup steps but do not start pnpm dev

set -eo pipefail

SETUP_ONLY=false
for arg in "$@"; do
  [[ "$arg" == "--setup-only" ]] && SETUP_ONLY=true
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { printf '\033[0;34m->\033[0m %s\n' "$*"; }
success() { printf '\033[0;32mOK\033[0m %s\n' "$*"; }
warn()    { printf '\033[1;33m!!\033[0m %s\n' "$*"; }
die()     { printf '\033[0;31mERR\033[0m %s\n' "$*" >&2; exit 1; }

# ── Prerequisites ─────────────────────────────────────────────────────────────
info "Checking prerequisites..."

command -v fnm    >/dev/null 2>&1 || die "fnm not found — https://github.com/Schniz/fnm"
command -v docker >/dev/null 2>&1 || die "docker not found — https://docs.docker.com/get-docker/"
command -v pnpm   >/dev/null 2>&1 || die "pnpm not found — https://pnpm.io/installation"
[[ -f "$HOME/.sdkman/bin/sdkman-init.sh" ]]   || die "SDKMAN not found — https://sdkman.io/"

# Source SDKMAN so `sdk` is available in this script
# shellcheck disable=SC1091
source "$HOME/.sdkman/bin/sdkman-init.sh"

success "Prerequisites OK"

# ── Step 1: Node.js ───────────────────────────────────────────────────────────
info "Step 1/5 — Node.js (fnm)"
fnm use
success "Node.js ready"

# ── Step 2: Java 21 ──────────────────────────────────────────────────────────
info "Step 2/5 — Java 21 (SDKMAN)"
(cd apps/api && sdk env install)
success "Java 21 ready"

# ── Step 3: pnpm install ──────────────────────────────────────────────────────
info "Step 3/5 — Installing dependencies"
pnpm install
success "Dependencies installed"

# ── Step 4: PostgreSQL ────────────────────────────────────────────────────────
info "Step 4/5 — Starting PostgreSQL (port 5435)"
docker compose -f apps/api/docker-compose.yaml up -d
success "Database started"

# ── Step 5: Frontend .env ─────────────────────────────────────────────────────
info "Step 5/5 — Frontend environment"
if [[ -f apps/web/.env ]]; then
  warn "apps/web/.env already exists — skipping copy"
else
  cp apps/web/.env-example apps/web/.env
  success "Created apps/web/.env from .env-example"
fi

echo ""
echo "Setup complete."
echo ""

if [[ "$SETUP_ONLY" == "true" ]]; then
  echo "Run 'pnpm dev' to start development servers."
  exit 0
fi

# ── Free dev ports ────────────────────────────────────────────────────────────
free_port() {
  local port=$1
  local pid
  pid=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -n "$pid" ]]; then
    warn "Port $port in use (PID $pid) — killing..."
    kill -9 $pid
    success "Port $port freed"
  fi
}

free_port 3000
free_port 5173
free_port 8080

# ── Step 6: Start dev ─────────────────────────────────────────────────────────
echo "Starting development servers..."
echo ""
echo "  Web:  http://localhost:5173"
echo "  API:  http://localhost:8080/api"
echo "  Docs: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop. To stop the database afterward:"
echo "  docker compose -f apps/api/docker-compose.yaml down"
echo ""

pnpm dev
