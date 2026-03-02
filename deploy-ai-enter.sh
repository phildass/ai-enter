#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/ai-enter"
NEW_DIR="/var/www/ai-enter.new"
REPO_URL="https://github.com/phildass/ai-enter.git"
BRANCH="main"
PM2_NAME="ai-enter"
PORT="3010"

BACKUP_DIR="/var/backups/ai-enter"
KEEP_BACKUPS="3"

log() { echo -e "\n[deploy] $*\n"; }
die() { echo "[deploy][ERROR] $*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

safe_rm_rf() {
  local target="$1"
  [[ -n "$target" && "$target" != "/" ]] || die "Refusing rm -rf: '$target'"
  rm -rf "$target"
}

rotate_backups() {
  mkdir -p "$BACKUP_DIR"
  ls -1t "$BACKUP_DIR"/ai-enter-*.tgz 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f
}

require_cmd git
require_cmd yarn
require_cmd pm2
require_cmd curl
require_cmd tar

# Critical: do not run inside a directory that may be deleted
cd /

log "Deploying ai-enter: branch=$BRANCH pm2=$PM2_NAME port=$PORT"
mkdir -p "$(dirname "$APP_DIR")"
mkdir -p "$BACKUP_DIR"

# Backup current (if exists)
if [[ -d "$APP_DIR" ]]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  BACKUP_FILE="$BACKUP_DIR/ai-enter-$TS.tgz"
  log "Backing up current $APP_DIR -> $BACKUP_FILE (excluding node_modules/.next/.git)"
  tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")"
  rotate_backups
fi

# Fresh clone into NEW_DIR
log "Cloning fresh into $NEW_DIR"
safe_rm_rf "$NEW_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$NEW_DIR"
cd "$NEW_DIR"
log "Checked out commit: $(git rev-parse --short HEAD)"

log "Enabling corepack (ok if it fails)"
corepack enable >/dev/null 2>&1 || true

log "Installing dependencies"
yarn install

log "Building"
yarn build

# Swap directories atomically
log "Swapping $NEW_DIR -> $APP_DIR"
if [[ -d "$APP_DIR" ]]; then
  safe_rm_rf "${APP_DIR}.old"
  mv "$APP_DIR" "${APP_DIR}.old"
fi
mv "$NEW_DIR" "$APP_DIR"

# Restart/start PM2
log "Restarting/starting PM2"
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  PORT="$PORT" pm2 restart "$PM2_NAME" --update-env
else
  cd "$APP_DIR"
  PORT="$PORT" pm2 start yarn --name "$PM2_NAME" -- start
fi
pm2 save

# Health check
log "Health check: http://127.0.0.1:$PORT/"
if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null; then
  log "Health check OK"
else
  log "Health check FAILED. Logs:"
  pm2 logs "$PM2_NAME" --lines 120 || true
  die "Deploy failed health check"
fi

log "Done"
pm2 status
