#!/usr/bin/env bash
set -euo pipefail

# Load env vars for ai-enter
set -a
source /etc/ai-enter.env
set +a

cd /var/www/ai-enter
exec npm start
