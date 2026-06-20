#!/usr/bin/env bash
set -euo pipefail

#!/usr/bin/env bash
set -euo pipefail

# Load env (must contain IISKILLS_PAYMENT_TOKEN_SECRET and AIENTER_CONFIRMATION_SIGNING_SECRET)
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

# Ensure Next production build exists, otherwise next start will crash (502)
if [ ! -f .next/BUILD_ID ]; then
  npm run build
fi

exec npm run start
