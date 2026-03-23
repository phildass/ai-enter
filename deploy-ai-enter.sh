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

# --- Requirements (be explicit so failures are obvious) ---
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

# --- Self-relocation: if executed from inside $APP_DIR or $NEW_DIR, copy to /tmp and re-exec ---
# The _DEPLOY_RELOCATED guard prevents infinite re-execution if path resolution is unreliable.
if [ -z "${_DEPLOY_RELOCATED:-}" ]; then
  _script_dir="$(cd "$(dirname "$0")" 2>/dev/null && pwd || true)"
  SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || realpath "$0" 2>/dev/null || echo "${_script_dir}/$(basename "$0")")"
  if [[ "$SCRIPT_PATH" == "$APP_DIR"* ]] || [[ "$SCRIPT_PATH" == "$NEW_DIR"* ]]; then
    TS_REEXEC="$(date +%s)"
    TMP_SCRIPT="/tmp/deploy-${APP_NAME}-${TS_REEXEC}.sh"
    log "Script is inside $APP_DIR or $NEW_DIR; copying to $TMP_SCRIPT and re-executing from /tmp"
    cp -f "$SCRIPT_PATH" "$TMP_SCRIPT"
    chmod +x "$TMP_SCRIPT"
    exec env _DEPLOY_RELOCATED=1 "$TMP_SCRIPT" "$@"
  fi
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

# Copy env file if present
if [ -f /etc/aienter.env ]; then
  cp /etc/aienter.env "$NEW_DIR/.env"
  log "Copied /etc/aienter.env -> $NEW_DIR/.env"
fi

log "Installing dependencies"
yarn install --immutable || yarn install

log "Building"
yarn build

# Stop PM2 app BEFORE swap
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

# Health check — retry up to 10 times (60 s) to allow the app time to start
log "Health check: http://127.0.0.1:$PORT/ (up to 10 attempts)"
HC_OK=0
for attempt in $(seq 1 10); do
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    HC_OK=1
    break
  fi
  log "  attempt $attempt/10 failed — waiting 6 s…"
  sleep 6
done

if [ "$HC_OK" -ne 1 ]; then
  log "Health check FAILED after all attempts. Showing logs:"
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
