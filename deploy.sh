#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# ai-enter deploy script (Next.js + PM2)
# - optional backup (excluding node_modules/.next)
# - delete existing directory
# - clone fresh
# - yarn install
# - yarn build
# - pm2 restart/start
# - health check
# ============================================================

# ---- Config (edit these if your server differs) --------------
APP_DIR="/var/www/ai-enter"
REPO_URL="https://github.com/phildass/ai-enter.git"
BRANCH="main"
PM2_NAME="ai-enter"
PORT="3010"

# Backups (optional but recommended)
BACKUP_DIR="/var/backups/ai-enter"
KEEP_BACKUPS="3"

# If your server uses a custom Node binary, set it here (optional)
# export PATH="/root/.nvm/versions/node/v20.11.1/bin:$PATH"

# ---- Helpers -------------------------------------------------
log() { echo -e "\n[deploy] $*\n"; }

die() { echo "[deploy][ERROR] $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

safe_rm_rf() {
  local target="$1"
  if [[ -z "${target}" || "${target}" == "/" ]]; then
    die "Refusing to rm -rf an empty path or /"
  fi
  rm -rf "$target"
}

rotate_backups() {
  mkdir -p "$BACKUP_DIR"
  # delete older backups beyond KEEP_BACKUPS
  ls -1t "$BACKUP_DIR"/ai-enter-*.tgz 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f
}

# ---- Preflight ----------------------------------------------
require_cmd git
require_cmd yarn
require_cmd pm2
require_cmd curl
require_cmd tar

log "Starting deploy: repo=$REPO_URL branch=$BRANCH dir=$APP_DIR pm2=$PM2_NAME port=$PORT"

# ---- Backup existing deploy (if present) ---------------------
if [[ -d "$APP_DIR" ]]; then
  log "Backing up existing deployment (excluding node_modules and .next)"
  mkdir -p "$BACKUP_DIR"
  TS="$(date +%Y%m%d-%H%M%S)"
  BACKUP_FILE="$BACKUP_DIR/ai-enter-$TS.tgz"

  tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")"

  log "Backup created: $BACKUP_FILE"
  rotate_backups
else
  log "No existing $APP_DIR found; skipping backup"
fi

# ---- Delete existing and clone fresh --------------------------
log "Deleting existing app directory (if any)"
safe_rm_rf "$APP_DIR"
mkdir -p "$(dirname "$APP_DIR")"

log "Cloning fresh copy"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$APP_DIR"

cd "$APP_DIR"
log "Checked out commit: $(git rev-parse --short HEAD)"

# ---- Install + build -----------------------------------------
log "Enabling corepack (ok if it fails)"
corepack enable >/dev/null 2>&1 || true

log "Installing dependencies"
# If you prefer strict installs and your lockfile is stable, uncomment:
# yarn install --frozen-lockfile
yarn install

log "Building"
yarn build

# ---- PM2 restart/start ---------------------------------------
log "Restarting/starting PM2 process"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  # Update environment variables (incl PORT) on restart
  PORT="$PORT" pm2 restart "$PM2_NAME" --update-env
else
  # Start Next.js via yarn start
  PORT="$PORT" pm2 start yarn --name "$PM2_NAME" -- start
fi

pm2 save

# ---- Health check --------------------------------------------
log "Health check: http://127.0.0.1:$PORT/"
if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null; then
  log "Health check OK"
else
  log "Health check FAILED. Showing recent logs:"
  pm2 logs "$PM2_NAME" --lines 80 || true
  die "Deploy failed health check"
fi

log "Deployment complete"
pm2 status
