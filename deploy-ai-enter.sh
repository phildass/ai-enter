#!/usr/bin/env bash
set -euo pipefail

APP_NAME="ai-enter"
REPO_SSH="git@github.com:phildass/ai-enter.git"
BRANCH="main"

APP_DIR="/var/www/ai-enter"
NEW_DIR="/var/www/ai-enter.new"

BACKUP_DIR="/var/backups/ai-enter"
KEEP_BACKUPS="${KEEP_BACKUPS:-7}"

PORT="3040"

log() { echo -e "\n[deploy] $*"; }
fail() { echo -e "\n[deploy][ERROR] $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

# --- Requirements ---
require_cmd git
require_cmd pm2
require_cmd tar
require_cmd rsync
require_cmd yarn
require_cmd curl
require_cmd ss
require_cmd awk
require_cmd sed

log "Deploying $APP_NAME: branch=$BRANCH pm2=$APP_NAME port=$PORT"

# --- Self-relocation fix: prevent recursion when in /tmp/ ---
SCRIPT_PATH="$(python3 - <<'PY' 2>/dev/null || true
import os,sys
print(os.path.realpath(sys.argv[1]))
PY
"$0")"
if [ -z "${SCRIPT_PATH:-}" ]; then
  SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || echo "$0")"
fi
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

# If inside $APP_DIR or $NEW_DIR but NOT already in /tmp, relocate to /tmp
if ([[ "$SCRIPT_PATH" == "$APP_DIR"* ]] || [[ "$SCRIPT_PATH" == "$NEW_DIR"* ]]) && [[ "$SCRIPT_PATH" != /tmp/* ]]; then
  TS_REEXEC="$(date +%s)"
  TMP_SCRIPT="/tmp/deploy-${APP_NAME}-${TS_REEXEC}.sh"
  log "Script is inside $APP_DIR or $NEW_DIR; copying to $TMP_SCRIPT and re-executing from /tmp"
  cp -f "$SCRIPT_PATH" "$TMP_SCRIPT"
  chmod +x "$TMP_SCRIPT"
  exec "$TMP_SCRIPT"
fi

mkdir -p "$BACKUP_DIR"

TS="$(date +%Y%m%d-%H%M%S)"
ROLLBACK_DIR="$BACKUP_DIR/${APP_NAME}-${TS}"

# Backup current app (if exists) WITHOUT deleting it
if [ -d "$APP_DIR" ]; then
  log "Creating rollback copy: $APP_DIR -> $ROLLBACK_DIR"
  mkdir -p "$ROLLBACK_DIR"
  rsync -a --delete \
    --exclude ".git" \
    --exclude "node_modules" \
    --exclude ".next" \
    "$APP_DIR/" "$ROLLBACK_DIR/"
fi

# Remove any previous NEW_DIR safely
if [ -d "$NEW_DIR" ]; then
  log "Removing previous staging dir: $NEW_DIR"
  rm -rf "$NEW_DIR"
fi

log "Cloning fresh into $NEW_DIR"
git clone --depth 1 --branch "$BRANCH" "$REPO_SSH" "$NEW_DIR"

cd "$NEW_DIR"
log "Checked out commit: $(git rev-parse --short HEAD)"

log "Enabling corepack (ok if it fails)"
corepack enable >/dev/null 2>&1 || true

# Copy /etc/aienter.env as .env if present
if [ -f /etc/aienter.env ]; then
  cp /etc/aienter.env "$NEW_DIR/.env"
  log "Copied /etc/aienter.env -> $NEW_DIR/.env"
fi

log "Installing dependencies"
yarn install --immutable || yarn install

log "Building"
yarn build

# Stop PM2 app BEFORE swap so the old process is replaced cleanly
log "Stopping PM2 app (if running): $APP_NAME"
pm2 stop "$APP_NAME" >/dev/null 2>&1 || true

# Free the port if a stray node/next process is still holding it
log "Ensuring port $PORT is free (only node/next processes will be killed)"
PID_ON_PORT="$(ss -ltnp 2>/dev/null | awk -v p=":$PORT" '$4 ~ p {print $0}' | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | head -n1 || true)"
if [ -n "${PID_ON_PORT:-}" ]; then
  CMDLINE="$(ps -p "$PID_ON_PORT" -o comm= -o args= 2>/dev/null || true)"
  if echo "$CMDLINE" | grep -Eqi '(node|next)'; then
    log "Killing stray process on $PORT (pid=$PID_ON_PORT): $CMDLINE"
    kill "$PID_ON_PORT" >/dev/null 2>&1 || true
    sleep 0.5
    if ss -ltnp 2>/dev/null | grep -q ":$PORT"; then
      kill -9 "$PID_ON_PORT" >/dev/null 2>&1 || true
    fi
  else
    fail "Port $PORT is in use by non-node process (pid=$PID_ON_PORT): $CMDLINE"
  fi
fi

# Atomic swap
log "Swapping $NEW_DIR -> $APP_DIR"
if [ -d "$APP_DIR" ]; then
  mv "$APP_DIR" "${APP_DIR}.old-${TS}"
fi
mv "$NEW_DIR" "$APP_DIR"

# Start/restart PM2 with correct env + cwd via ecosystem.config.js
log "Starting PM2 app: $APP_NAME (PORT=$PORT)"
cd "$APP_DIR"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Health check
log "Health check: http://127.0.0.1:$PORT/"
set +e
curl -fsS "http://127.0.0.1:$PORT/" >/dev/null
HC=$?
set -e

if [ "$HC" -ne 0 ]; then
  log "Health check FAILED. Showing logs:"
  pm2 logs "$APP_NAME" --lines 120 || true
  fail "Deploy failed health check"
fi

log "Health check OK"

log "Pruning old swapped directories older than 2 days"
find /var/www -maxdepth 1 -type d -name "ai-enter.old-*" -mtime +2 -exec rm -rf {} \; >/dev/null 2>&1 || true

log "Pruning backups (keep last $KEEP_BACKUPS)"
ls -1dt "$BACKUP_DIR/${APP_NAME}-"* 2>/dev/null | tail -n +"$((KEEP_BACKUPS+1))" | xargs -r rm -rf || true

pm2 status
log "Deploy complete."
