#!/usr/bin/env bash
set -euo pipefail

# Load env vars for ai-enter (support both legacy and current filenames)
set -a
if [ -f /etc/ai-enter.env ]; then
  source /etc/ai-enter.env
elif [ -f /etc/aienter.env ]; then
  source /etc/aienter.env
elif [ -f /var/www/ai-enter/.env ]; then
  source /var/www/ai-enter/.env
fi
set +a

export PORT="${PORT:-3040}"

cd /var/www/ai-enter
exec npm start
