/** Razorpay events that may grant entitlements — never payment.authorized. */
export const ENTITLEMENT_WEBHOOK_EVENTS = new Set(['payment.captured']);

/** Event sent to iiskills confirm endpoint — only after Razorpay reports captured. */
export const CONFIRM_ENTITLEMENT_EVENT = 'payment.captured';

/** Ignore callback/webhook finalize until checkout has been open this long (UPI intent window). */
export const CHECKOUT_CALLBACK_COOLDOWN_MS = 5000;

export function isEntitlementWebhookEvent(eventType) {
  return ENTITLEMENT_WEBHOOK_EVENTS.has(eventType);
}

/** Razorpay payment statuses that must not grant entitlements or cancel checkout. */
export const NON_CAPTURED_PAYMENT_STATUSES = new Set(['authorized', 'pending', 'created']);

export function isNonCapturedPaymentStatus(status) {
  return NON_CAPTURED_PAYMENT_STATUSES.has(status);
}

/**
 * True when a redirect/webhook arrived too soon after checkout started.
 * Uses updated_at (bumped on each Pay) or created_at from payment_transactions.
 */
export function isWithinCheckoutCooldown(transaction, nowMs = Date.now()) {
  if (!transaction) return false;
  const startedAt = transaction.updated_at || transaction.created_at;
  if (!startedAt) return false;
  const elapsed = nowMs - new Date(startedAt).getTime();
  return elapsed >= 0 && elapsed < CHECKOUT_CALLBACK_COOLDOWN_MS;
}

export function checkoutCooldownRemainingMs(transaction, nowMs = Date.now()) {
  if (!transaction) return 0;
  const startedAt = transaction.updated_at || transaction.created_at;
  if (!startedAt) return 0;
  const elapsed = nowMs - new Date(startedAt).getTime();
  return Math.max(0, CHECKOUT_CALLBACK_COOLDOWN_MS - elapsed);
}

/**
 * Fetch payment from Razorpay and require status === 'captured'.
 * Returns pending:true for authorized/created (UPI intent in progress).
 */
export async function assertPaymentCaptured(razorpay, paymentId, expectedOrderId) {
  const payment = await razorpay.payments.fetch(paymentId);

  if (payment.status !== 'captured') {
    return {
      ok: false,
      pending: isNonCapturedPaymentStatus(payment.status),
      error: `Payment status is ${payment.status}, not captured`,
      payment,
    };
  }

  if (expectedOrderId && payment.order_id && payment.order_id !== expectedOrderId) {
    return {
      ok: false,
      pending: false,
      error: 'Payment does not match this order',
      payment,
    };
  }

  return { ok: true, payment };
}
