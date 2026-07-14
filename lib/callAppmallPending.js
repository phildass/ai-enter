import crypto from 'crypto';

const PENDING_TIMEOUT_MS = 10000;

function computeWebhookSignature(rawBody, secret) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

/**
 * Optional grace hook — tell appmall a UPI payment is in progress (not captured).
 * Fires only after Razorpay checkout opens, never on page load or Pay click alone.
 */
export async function callAppmallPending({
  purchaseId,
  razorpayOrderId,
  appId,
  userToken,
}) {
  const secret =
    process.env.APPMALL_PENDING_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
  const pendingUrl =
    process.env.APPMALL_PENDING_URL || 'https://appmall.in/api/payments/pending';

  if (!secret) {
    console.log('[appmall-pending] skipped — webhook secret not configured');
    return { ok: false, skipped: true, reason: 'no_secret' };
  }

  if (!purchaseId || !razorpayOrderId) {
    return { ok: false, skipped: true, reason: 'missing_fields' };
  }

  const payload = {
    purchaseId,
    razorpayOrderId,
    status: 'processing',
    ...(appId ? { appId } : {}),
    ...(userToken ? { user_token: userToken } : {}),
  };

  const rawBody = JSON.stringify(payload);
  const signature = computeWebhookSignature(rawBody, secret);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PENDING_TIMEOUT_MS);

  try {
    const res = await fetch(pendingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': secret,
        'x-aienter-signature': signature,
        'x-aienter-timestamp': timestamp,
      },
      body: rawBody,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(
        `[appmall-pending] HTTP ${res.status} purchaseId=${purchaseId} order=${razorpayOrderId}`,
        text.slice(0, 200),
      );
      return { ok: false, status: res.status };
    }

    console.log(
      `[appmall-pending] notified purchaseId=${purchaseId} order=${razorpayOrderId}`,
    );
    return { ok: true };
  } catch (err) {
    console.warn('[appmall-pending] request failed:', err.message);
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}
