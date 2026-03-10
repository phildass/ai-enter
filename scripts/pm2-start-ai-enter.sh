#!/usr/bin/env bash
set -euo pipefail

# Load env (must contain IISKILLS_PAYMENT_TOKEN_SECRET and AIENTER_CONFIRMATION_SIGNING_SECRET)
set -a
source /etc/ai-enter.env
set +a

cd /var/www/ai-enter

# Ensure Next production build exists, otherwise next start will crash (502)
if [ ! -f .next/BUILD_ID ]; then
  npm run build
fi

exec npm run start
