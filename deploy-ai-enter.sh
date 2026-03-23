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

# --- Self-relocation (fixed to avoid infinite loop) ---
SCRIPT_PATH="$(python3 - <<'PY' 2>/dev/null || true
import os,sys
print(os.path.realpath(sys.argv[1]))
PY
"$0")"

if [ -z "${SCRIPT_PATH:-}" ]; then
  SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || echo "$0")"
fi

SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

# Only relocate if in $APP_DIR or $NEW_DIR and NOT already in /tmp
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
](#)

